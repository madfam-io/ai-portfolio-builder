import { cache, CACHE_KEYS } from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';

import {
  AIServiceError,
  ModelUnavailableError,
  QuotaExceededError,
  ModelResponse,
} from '../types';

/**
 * HuggingFace API Client
 * Handles all API communication with HuggingFace Inference API
 */

// Request queue to prevent rate limiting
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private readonly concurrency = 2; // Max concurrent requests
  private activeRequests = 0;
  private readonly minDelay = 1000; // Minimum delay between requests (ms)
  private lastRequestTime = 0;

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process(): Promise<void> {
    if (this.processing || this.activeRequests >= this.concurrency) return;

    const request = this.queue.shift();
    if (!request) return;

    this.processing = true;
    this.activeRequests++;

    // Ensure minimum delay between requests
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.minDelay) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minDelay - timeSinceLastRequest)
      );
    }

    try {
      this.lastRequestTime = Date.now();
      await request();
    } finally {
      this.activeRequests--;
      this.processing = false;
      // Process next request
      setTimeout(() => this.process(), 0);
    }
  }
}

class HuggingFaceAPIClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';
  private readonly requestQueue = new RequestQueue();
  private readonly timeout = 5000; // 5 second timeout
  private readonly maxRetries = 3;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Make a request to HuggingFace API
   */
  makeRequest(
    modelId: string,
    prompt: string,
    parameters: Record<string, any> = {}
  ): Promise<ModelResponse> {
    // Use request queue to prevent rate limiting
    return this.requestQueue.add(() =>
      this.makeRequestWithRetry(modelId, prompt, parameters)
    );
  }

  private async makeRequestWithRetry(
    modelId: string,
    prompt: string,
    parameters: Record<string, any> = {},
    attempt = 1
  ): Promise<ModelResponse> {
    // Check cache first
    const cacheKey = `${CACHE_KEYS.AI_RESULT}${modelId}:${this.hashPrompt(prompt, parameters)}`;
    const cachedResponse = await cache.get<ModelResponse>(cacheKey);
    if (cachedResponse) {
      logger.info('Returning cached AI response', { modelId, cacheKey });
      return cachedResponse;
    }

    const startTime = Date.now();

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/${modelId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false,
            ...parameters,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        // Retry on 503 (model loading) or 429 (rate limit)
        if (
          (response.status === 503 || response.status === 429) &&
          attempt < this.maxRetries
        ) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff
          logger.warn(
            `Retrying request after ${backoffDelay}ms (attempt ${attempt}/${this.maxRetries})`
          );
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          return this.makeRequestWithRetry(
            modelId,
            prompt,
            parameters,
            attempt + 1
          );
        }
        await this.handleAPIError(response, modelId);
      }

      const data = await response.json();

      // Handle different response formats
      const generatedText = Array.isArray(data)
        ? data[0]?.generated_text || ''
        : data.generated_text || data.error || '';

      const modelResponse: ModelResponse = {
        content: generatedText,
        metadata: {
          model: modelId,
          provider: 'huggingface',
          tokens: Math.ceil((prompt.length + generatedText.length) / 4),
          cost: 0, // HuggingFace free tier
          responseTime,
        },
      };

      // Cache successful response for 1 hour
      await cache.set(cacheKey, modelResponse, 3600);

      return modelResponse;
    } catch (error) {
      logger.error('HuggingFace API request failed', error as Error, {
        modelId,
        attempt,
      });

      // Handle timeout
      if (error instanceof Error && error.name === 'AbortError') {
        if (attempt < this.maxRetries) {
          logger.warn(
            `Request timeout, retrying (attempt ${attempt}/${this.maxRetries})`
          );
          return this.makeRequestWithRetry(
            modelId,
            prompt,
            parameters,
            attempt + 1
          );
        }
        throw new AIServiceError(
          'Request timeout after 5 seconds',
          'TIMEOUT',
          'huggingface',
          true
        );
      }

      if (error instanceof AIServiceError) {
        throw error;
      }

      // Retry on network errors
      if (
        attempt < this.maxRetries &&
        error instanceof Error &&
        (error.message.includes('fetch') || error.message.includes('network'))
      ) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        logger.warn(
          `Network error, retrying after ${backoffDelay}ms (attempt ${attempt}/${this.maxRetries})`
        );
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        return this.makeRequestWithRetry(
          modelId,
          prompt,
          parameters,
          attempt + 1
        );
      }

      throw new AIServiceError(
        `Failed to process request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'API_ERROR',
        'huggingface',
        false
      );
    }
  }

  /**
   * Handle API errors
   */
  private async handleAPIError(
    response: Response,
    modelId: string
  ): Promise<never> {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || response.statusText;

    switch (response.status) {
      case 503:
        throw new ModelUnavailableError('huggingface', modelId);
      case 429:
        throw new QuotaExceededError('huggingface');
      case 401:
        throw new AIServiceError(
          'Invalid API key. Please check your HuggingFace API key.',
          'INVALID_API_KEY',
          'huggingface',
          false
        );
      case 400:
        throw new AIServiceError(
          `Invalid request: ${errorMessage}`,
          'INVALID_REQUEST',
          'huggingface',
          false
        );
      default:
        throw new AIServiceError(
          `API error (${response.status}): ${errorMessage}`,
          'API_ERROR',
          'huggingface',
          response.status >= 500
        );
    }
  }

  /**
   * Generate a hash for caching
   */
  private hashPrompt(prompt: string, parameters: Record<string, any>): string {
    const content = prompt + JSON.stringify(parameters);
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check if API key is valid
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'demo';
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('microsoft/DialoGPT-small', 'Hello', {
        max_new_tokens: 10,
      });
      return true;
    } catch (error) {
      logger.warn('HuggingFace API test failed', {
        error: (error as Error).message,
      });
      return false;
    }
  }
}

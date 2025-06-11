/**
 * HuggingFace API Client
 * Handles all API communication with HuggingFace Inference API
 */

import { logger } from '@/lib/utils/logger';
import {
  AIServiceError,
  ModelUnavailableError,
  QuotaExceededError,
  ModelResponse,
} from '../types';

export class HuggingFaceAPIClient {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Make a request to HuggingFace API
   */
  async makeRequest(
    modelId: string,
    prompt: string,
    parameters: Record<string, any> = {}
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
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
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        await this.handleAPIError(response, modelId);
      }

      const data = await response.json();

      // Handle different response formats
      const generatedText = Array.isArray(data)
        ? data[0]?.generated_text || ''
        : data.generated_text || data.error || '';

      return {
        content: generatedText,
        metadata: {
          model: modelId,
          provider: 'huggingface',
          tokens: Math.ceil((prompt.length + generatedText.length) / 4),
          cost: 0, // HuggingFace free tier
          responseTime,
        },
      };
    } catch (error) {
      logger.error('HuggingFace API request failed', error as Error, {
        modelId,
      });

      if (error instanceof AIServiceError) {
        throw error;
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
      logger.warn('HuggingFace API test failed', error as Error);
      return false;
    }
  }
}

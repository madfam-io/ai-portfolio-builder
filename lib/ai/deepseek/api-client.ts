/**
 * DeepSeek API Client
 * 
 * Handles low-level API communication with DeepSeek
 */

import { logger } from '@/lib/utils/logger';
import { 
  AIServiceError, 
  ModelUnavailableError, 
  QuotaExceededError 
} from '../types';
import { DeepSeekConfig, DeepSeekResponse } from './types';
import { getMockResponse } from './mock-responses';

export class DeepSeekAPIClient {
  constructor(private config: DeepSeekConfig) {}

  /**
   * Call DeepSeek API with reasoning capabilities
   */
  async callAPI(
    prompt: string,
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<DeepSeekResponse> {
    // Mock response when API key is not configured
    if (!this.config.apiKey) {
      return getMockResponse(prompt);
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content:
                'You are a professional content enhancement AI with advanced reasoning capabilities. Provide thoughtful, detailed responses that improve content quality while maintaining authenticity.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
          reasoning: true, // Enable DeepSeek reasoning
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new QuotaExceededError('deepseek');
        }
        if (response.status === 404) {
          throw new ModelUnavailableError('deepseek', this.config.model);
        }
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const data: DeepSeekResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        `DeepSeek API call failed: ${error}`,
        'NETWORK_ERROR',
        'deepseek',
        true
      );
    }
  }

  /**
   * Simple health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.callAPI(
        'Respond with "OK" if you can process this request.',
        { maxTokens: 10 }
      );
      return response.choices[0]?.message?.content?.includes('OK') || false;
    } catch {
      return false;
    }
  }
}
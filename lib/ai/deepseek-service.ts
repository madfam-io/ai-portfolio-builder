/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import {
  AIService,
  EnhancedContent,
  BioContext,
  ProjectEnhancement,
  TemplateRecommendation,
  UserProfile,
  QualityScore,
  AIServiceError,
} from './types';
import { DeepSeekConfig, DeepSeekUsageStats } from './deepseek/types';
import { DeepSeekAPIClient } from './deepseek/api-client';
import {
  buildBioPrompt,
  buildProjectPrompt,
  buildTemplatePrompt,
  buildScoringPrompt,
} from './deepseek/prompt-builders';
import {
  parseBioResponse,
  parseProjectResponse,
  parseTemplateResponse,
  parseScoringResponse,
} from './deepseek/response-parsers';

/**
 * DeepSeek AI Service Implementation
 * Provides AI-powered content enhancement using DeepSeek reasoning models
 */

export class DeepSeekService implements AIService {
  private config: DeepSeekConfig;
  private apiClient: DeepSeekAPIClient;
  private usageStats: DeepSeekUsageStats = {
    requestsToday: 0,
    costToday: 0,
    totalResponseTime: 0,
    successfulRequests: 0,
    failedRequests: 0,
  };

  constructor(config?: Partial<DeepSeekConfig>) {
    this.config = {
      apiKey: config?.apiKey || process.env.DEEPSEEK_API_KEY || '',
      baseUrl: config?.baseUrl || 'https://api.deepseek.com/v1',
      model: config?.model || 'deepseek-reasoner',
      maxTokens: config?.maxTokens || 1024,
      temperature: config?.temperature || 0.7,
    };

    this.apiClient = new DeepSeekAPIClient(this.config);
  }

  /**
   * Enhance bio using DeepSeek reasoning models
   */
  async enhanceBio(bio: string, context: BioContext): Promise<EnhancedContent> {
    const startTime = Date.now();
    this.usageStats.requestsToday++;

    try {
      const prompt = buildBioPrompt(bio, context);
      const response = await this.apiClient.callAPI(prompt);

      this.updateUsageStats(response, Date.now() - startTime);
      return parseBioResponse(response, bio);
    } catch (error) {
      this.usageStats.failedRequests++;
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        `Bio enhancement failed: ${error}`,
        'ENHANCEMENT_ERROR',
        'deepseek'
      );
    }
  }

  /**
   * Optimize project description using DeepSeek
   */
  async optimizeProjectDescription(
    description: string,
    technologies: string[],
    industryContext?: string
  ): Promise<ProjectEnhancement> {
    const startTime = Date.now();
    this.usageStats.requestsToday++;

    try {
      const prompt = buildProjectPrompt(
        description,
        technologies,
        industryContext
      );
      const response = await this.apiClient.callAPI(prompt);

      this.updateUsageStats(response, Date.now() - startTime);
      return parseProjectResponse(response, description, technologies);
    } catch (error) {
      this.usageStats.failedRequests++;
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        `Project optimization failed: ${error}`,
        'OPTIMIZATION_ERROR',
        'deepseek'
      );
    }
  }

  /**
   * Recommend template using DeepSeek reasoning
   */
  async recommendTemplate(
    profile: UserProfile
  ): Promise<TemplateRecommendation> {
    const startTime = Date.now();
    this.usageStats.requestsToday++;

    try {
      const prompt = buildTemplatePrompt(profile);
      const response = await this.apiClient.callAPI(prompt);

      this.updateUsageStats(response, Date.now() - startTime);
      return parseTemplateResponse(response);
    } catch (error) {
      this.usageStats.failedRequests++;
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        `Template recommendation failed: ${error}`,
        'RECOMMENDATION_ERROR',
        'deepseek'
      );
    }
  }

  /**
   * Score content quality using DeepSeek analysis
   */
  async scoreContent(content: string, type: string): Promise<QualityScore> {
    const startTime = Date.now();
    this.usageStats.requestsToday++;

    try {
      const prompt = buildScoringPrompt(content, type);
      const response = await this.apiClient.callAPI(prompt);

      this.updateUsageStats(response, Date.now() - startTime);
      return parseScoringResponse(response);
    } catch (error) {
      this.usageStats.failedRequests++;
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        `Content scoring failed: ${error}`,
        'SCORING_ERROR',
        'deepseek'
      );
    }
  }

  /**
   * Health check for DeepSeek service
   */
  healthCheck(): Promise<boolean> {
    return this.apiClient.healthCheck();
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    // Simulate async operation for interface compliance
    await Promise.resolve();

    const avgResponseTime =
      this.usageStats.successfulRequests > 0
        ? this.usageStats.totalResponseTime / this.usageStats.successfulRequests
        : 0;

    const successRate =
      this.usageStats.requestsToday > 0
        ? (this.usageStats.successfulRequests / this.usageStats.requestsToday) *
          100
        : 0;

    return {
      requestsToday: this.usageStats.requestsToday,
      costToday: this.usageStats.costToday,
      avgResponseTime,
      successRate,
    };
  }

  /**
   * Update usage statistics after successful API call
   */
  private updateUsageStats(
    response: { usage?: { total_tokens: number } },
    responseTime: number
  ): void {
    this.usageStats.successfulRequests++;
    this.usageStats.totalResponseTime += responseTime;
    this.usageStats.costToday += this.calculateCost(
      response.usage?.total_tokens || 0
    );
  }

  /**
   * Calculate cost based on token usage
   */
  private calculateCost(tokens: number): number {
    // DeepSeek pricing: approximately $0.14 per 1M tokens
    return (tokens / 1000000) * 0.14;
  }
}

// Export singleton instance
export const deepSeekService = new DeepSeekService();

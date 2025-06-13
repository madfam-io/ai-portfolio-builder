import crypto from 'crypto';

import { cache, CACHE_KEYS } from '@/lib/cache/redis-cache';
import { logger } from '@/lib/utils/logger';

import { ContentScorer } from './huggingface/ContentScorer';
import { ModelManager } from './huggingface/ModelManager';
import { PromptBuilder } from './huggingface/PromptBuilder';
import {
  AIService,
  EnhancedContent,
  BioContext,
  ProjectEnhancement,
  TemplateRecommendation,
  UserProfile,
  QualityScore,
  AIServiceError,
  ModelUnavailableError,
  QuotaExceededError,
  ModelResponse,
} from './types';

/**
 * Hugging Face AI Service Implementation
 * Open-source model integration for content enhancement
 */
export class HuggingFaceService implements AIService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';
  private modelManager: ModelManager;
  private promptBuilder: PromptBuilder;
  private contentScorer: ContentScorer;

  constructor(apiKey?: string, userModelPreferences?: Record<string, string>) {
    this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || '';
    
    if (!this.apiKey) {
      logger.warn(
        'Hugging Face API key not provided. Service will operate in demo mode.'
      );
    }

    // Initialize managers
    this.modelManager = new ModelManager(userModelPreferences);
    this.promptBuilder = new PromptBuilder();
    this.contentScorer = new ContentScorer();
  }

  /**
   * Generate cache key for AI requests
   */
  private generateCacheKey(
    type: string,
    content: string,
    context?: BioContext | Record<string, unknown>
  ): string {
    const hash = crypto
      .createHash('md5')
      .update(JSON.stringify({ content, context }))
      .digest('hex')
      .substring(0, 8);
    return `${CACHE_KEYS.AI_RESULT}${type}:${hash}`;
  }

  /**
   * Get all available models with live updates
   */
  async getAvailableModels() {
    return this.modelManager.getAvailableModels();
  }

  /**
   * Get current model selection for user
   */
  getSelectedModels() {
    return this.modelManager.getSelectedModels();
  }

  /**
   * Update user's model preferences
   */
  updateModelSelection(taskType: string, modelId: string): void {
    this.modelManager.updateModelSelection(taskType, modelId);
  }

  /**
   * Enhance professional bio
   */
  async enhanceBio(bio: string, context: BioContext): Promise<EnhancedContent> {
    try {
      const cacheKey = this.generateCacheKey('bio', bio, context);
      
      // Check cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Select model and build prompt
      const model = this.modelManager.getRecommendedModel('bio');
      const prompt = this.promptBuilder.buildBioPrompt(bio, context);

      // Call AI model
      const response = await this.callModel(model, prompt);
      const enhanced = this.promptBuilder.extractBioFromResponse(response.content);

      // Score the result
      const score = await this.contentScorer.scoreContent(enhanced, 'bio');

      const result: EnhancedContent = {
        content: enhanced,
        confidence: this.calculateConfidence(score.overall, response),
        suggestions: this.generateBioSuggestions(bio, enhanced),
        wordCount: enhanced.split(/\s+/).length,
        qualityScore: score.overall,
        enhancementType: 'bio',
      };

      // Cache for 24 hours
      await cache.set(cacheKey, JSON.stringify(result), 86400);

      return result;
    } catch (error) {
      logger.error('Bio enhancement failed', error as Error);
      throw this.handleError(error, 'bio enhancement');
    }
  }

  /**
   * Optimize project description
   */
  async optimizeProjectDescription(
    description: string,
    skills: string[],
    industryContext?: string
  ): Promise<ProjectEnhancement> {
    try {
      const cacheKey = this.generateCacheKey('project', description, {
        skills,
        industryContext,
      });

      // Check cache
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Select model and build prompt
      const model = this.modelManager.getRecommendedModel('project');
      const prompt = this.promptBuilder.buildProjectPrompt(
        description,
        skills,
        industryContext
      );

      // Call AI model
      const response = await this.callModel(model, prompt);
      const parsed = this.promptBuilder.parseProjectResponse(response.content);

      const result: ProjectEnhancement = {
        original: description,
        enhanced: parsed.enhanced || description,
        keyAchievements: parsed.keyAchievements || [],
        technologies: parsed.technologies || skills,
        impactMetrics: parsed.impactMetrics || [],
        confidence: this.calculateConfidence(80, response), // Base confidence
      };

      // Cache for 24 hours
      await cache.set(cacheKey, JSON.stringify(result), 86400);

      return result;
    } catch (error) {
      logger.error('Project optimization failed', error as Error);
      throw this.handleError(error, 'project optimization');
    }
  }

  /**
   * Recommend template based on user profile
   */
  async recommendTemplate(
    profile: UserProfile
  ): Promise<TemplateRecommendation> {
    try {
      // Simple rule-based recommendation with scoring
      const templates = [
        'developer',
        'designer',
        'consultant',
        'business',
        'creative',
        'minimal',
        'educator',
        'modern',
      ];

      // Score each template based on profile
      const scores = templates.map(template => ({
        template,
        score: this.scoreTemplateMatch(template, profile),
        reasoning: this.getTemplateReasoning(template, profile),
      }));

      const bestMatch = scores.reduce((best, current) =>
        current.score > best.score ? current : best
      );

      return {
        recommendedTemplate: bestMatch.template,
        confidence: bestMatch.score / 100,
        reasoning: bestMatch.reasoning,
        alternatives: scores
          .filter(s => s.template !== bestMatch.template)
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
          .map(s => ({
            template: s.template,
            score: s.score / 100,
            reasons: [s.reasoning],
          })),
      };
    } catch (error) {
      logger.error('Template recommendation failed', error as Error);
      throw this.handleError(error, 'template recommendation');
    }
  }

  /**
   * Score content quality
   */
  async scoreContent(content: string, type: string): Promise<QualityScore> {
    return this.contentScorer.scoreContent(content, type);
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testModel = this.modelManager.getRecommendedModel('bio');
      const response = await fetch(`${this.baseUrl}/${testModel}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    // This would typically come from a monitoring service
    return {
      requestsToday: 0,
      costToday: 0,
      avgResponseTime: 1200,
      successRate: 0.95,
    };
  }

  /**
   * Call HuggingFace model
   */
  private async callModel(
    modelId: string,
    prompt: string,
    retries = 2
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    for (let attempt = 0; attempt <= retries; attempt++) {
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
              max_new_tokens: 250,
              temperature: 0.7,
              top_p: 0.9,
              do_sample: true,
            },
            options: {
              wait_for_model: true,
            },
          }),
        });

        if (!response.ok) {
          if (response.status === 503 && attempt < retries) {
            // Model loading, wait and retry
            await new Promise(resolve => setTimeout(resolve, 5000));
            continue;
          }

          if (response.status === 429) {
            throw new QuotaExceededError('huggingface');
          }

          // Try to get error details if available
          let errorMessage = response.statusText;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Ignore JSON parse errors
          }

          logger.error(`Model ${modelId} error:`, { status: response.status, error: errorMessage });
          throw new ModelUnavailableError(
            'huggingface',
            modelId
          );
        }

        const result = await response.json();
        const text = Array.isArray(result)
          ? result[0]?.generated_text || ''
          : result.generated_text || result;

        return {
          content: text,
          metadata: {
            model: modelId,
            provider: 'huggingface',
            tokens: Math.round(text.split(/\s+/).length * 1.3), // Rough estimate
            cost: 0, // HuggingFace free tier
            responseTime: Date.now() - startTime,
          },
        };
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }

    throw new AIServiceError('Failed to get response from model', 'MODEL_ERROR', 'huggingface');
  }

  /**
   * Calculate confidence score
   */
  private calculateConfidence(
    baseScore: number,
    response: ModelResponse
  ): number {
    let confidence = baseScore;

    // Adjust based on processing time (faster = more confident)
    if (response.metadata.responseTime < 1000) confidence += 5;
    if (response.metadata.responseTime > 3000) confidence -= 10;

    // Adjust based on response length
    const words = response.content.split(/\s+/).length;
    if (words > 50 && words < 200) confidence += 5;

    return Math.max(0, Math.min(100, confidence)) / 100;
  }

  /**
   * Generate bio improvement suggestions
   */
  private generateBioSuggestions(
    original: string,
    _enhanced: string
  ): string[] {
    const suggestions: string[] = [];

    if (original.length < 50) {
      suggestions.push('Consider adding more details about your expertise');
    }
    if (!original.match(/\d+/)) {
      suggestions.push('Include specific metrics or years of experience');
    }
    if (!original.match(/\b(?:led|managed|developed|created)\b/i)) {
      suggestions.push('Use action verbs to highlight your achievements');
    }

    return suggestions;
  }

  /**
   * Score template match based on profile
   */
  private scoreTemplateMatch(template: string, profile: UserProfile): number {
    const industryMatches: Record<string, string[]> = {
      developer: ['technology', 'software', 'engineering', 'it'],
      designer: ['design', 'ux', 'ui', 'creative', 'art'],
      consultant: ['consulting', 'business', 'strategy', 'management'],
      business: ['business', 'finance', 'marketing', 'sales'],
      creative: ['creative', 'media', 'content', 'photography'],
      minimal: ['any'], // Works for any industry
      educator: ['education', 'teaching', 'academic', 'training'],
      modern: ['startup', 'tech', 'innovation'],
    };

    let score = 50; // Base score

    // Industry match
    const industries = industryMatches[template] || [];
    const profileIndustry = profile.industry?.toLowerCase() || '';
    if (industries.includes('any') || 
        (profileIndustry && industries.some(ind => profileIndustry.includes(ind)))) {
      score += 30;
    }

    // Experience level match
    if (template === 'minimal' && profile.experienceLevel === 'entry') {
      score += 20;
    } else if (template === 'business' && profile.experienceLevel === 'senior') {
      score += 20;
    }

    // Style preferences
    if (profile.skills.some(skill => skill.toLowerCase().includes('design')) && 
        template === 'designer') {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Get template reasoning
   */
  private getTemplateReasoning(template: string, _profile: UserProfile): string {
    const reasons: Record<string, string> = {
      developer: 'Perfect for showcasing technical projects and code samples',
      designer: 'Ideal for visual portfolios with strong design emphasis',
      consultant: 'Professional layout for business and consulting services',
      business: 'Corporate style suitable for business professionals',
      creative: 'Expressive design for creative professionals',
      minimal: 'Clean and simple, letting your content speak for itself',
      educator: 'Academic-friendly layout for educators and researchers',
      modern: 'Contemporary design for innovative professionals',
    };

    return reasons[template] || 'Suitable for your professional profile';
  }

  /**
   * Handle errors appropriately
   */
  private handleError(error: unknown, operation: string): Error {
    if (error instanceof AIServiceError) {
      return error;
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`HuggingFace ${operation} failed:`, { error: message });

    return new AIServiceError(
      `Failed to complete ${operation}: ${message}`,
      'OPERATION_FAILED',
      'huggingface'
    );
  }
}
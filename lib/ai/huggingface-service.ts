/**
 * Hugging Face AI Service Implementation
 * Open-source model integration for content enhancement
 */

import crypto from 'crypto';

import { cache, CACHE_KEYS } from '@/lib/cache/redis-cache';
import { logger } from '@/lib/utils/logger';

import { promptTemplates } from './prompts';
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

// Available models with live capabilities
export interface AvailableModel {
  id: string;
  name: string;
  provider: 'huggingface';
  capabilities: ('bio' | 'project' | 'template' | 'scoring')[];
  costPerRequest: number;
  avgResponseTime: number;
  qualityRating: number;
  isRecommended: boolean;
  lastUpdated: string;
}

export class HuggingFaceService implements AIService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api-inference.huggingface.co/models';
  private availableModels: AvailableModel[] = [];
  private selectedModels: Record<string, string> = {};

  // Default "best bang for buck" models (updated dynamically)
  private readonly defaultModels = {
    bio: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    project: 'microsoft/Phi-3.5-mini-instruct',
    template: 'mistralai/Mistral-7B-Instruct-v0.3',
    scoring: 'microsoft/DialoGPT-medium',
  };

  constructor(apiKey?: string, userModelPreferences?: Record<string, string>) {
    this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || '';
    this.selectedModels = userModelPreferences || {};

    if (!this.apiKey) {
      logger.warn(
        'Hugging Face API key not provided. Service will operate in demo mode.'
      );
    }

    // Initialize available models
    this.loadAvailableModels();
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
  async getAvailableModels(): Promise<AvailableModel[]> {
    await this.refreshAvailableModels();
    return this.availableModels;
  }

  /**
   * Get current model selection for user
   */
  getSelectedModels(): Record<string, string> {
    return { ...this.selectedModels };
  }

  /**
   * Update user's model preferences
   */
  updateModelSelection(taskType: string, modelId: string): void {
    this.selectedModels[taskType] = modelId;
  }

  /**
   * Get recommended model for task type
   */
  getRecommendedModel(taskType: string): string {
    const recommended = this.availableModels
      .filter(m => m.capabilities.includes(taskType as any) && m.isRecommended)
      .sort(
        (a, b) =>
          b.qualityRating / b.costPerRequest -
          a.qualityRating / a.costPerRequest
      )[0];

    return (
      recommended?.id ||
      this.defaultModels[taskType as keyof typeof this.defaultModels] ||
      this.defaultModels.bio
    );
  }

  /**
   * Enhance bio content using selected or recommended model
   */
  async enhanceBio(bio: string, context: BioContext): Promise<EnhancedContent> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('bio', bio, context);
      const cached = await cache.get<EnhancedContent>(cacheKey);
      if (cached) {
        logger.debug('Bio enhancement cache hit');
        return cached;
      }

      const modelId =
        this.selectedModels.bio || this.getRecommendedModel('bio');
      const prompt = this.buildBioPrompt(bio, context);
      const response = await this.callModel(modelId, prompt);

      const enhancedBio = this.extractBioFromResponse(response.content);
      const qualityScore = await this.scoreContent(enhancedBio, 'bio');

      const result: EnhancedContent = {
        content: enhancedBio,
        confidence: this.calculateConfidence(response, qualityScore),
        suggestions: this.generateBioSuggestions(bio, enhancedBio),
        wordCount: enhancedBio.split(' ').length,
        qualityScore: qualityScore.overall,
        enhancementType: 'bio',
      };

      // Cache the result for 1 hour
      await cache.set(cacheKey, result, 3600);

      return result;
    } catch (error) {
      logger.error('Bio enhancement failed', error as Error);
      throw this.handleError(error, 'bio enhancement');
    }
  }

  /**
   * Optimize project description using selected or recommended model
   */
  async optimizeProjectDescription(
    title: string,
    description: string,
    technologies: string[]
  ): Promise<ProjectEnhancement> {
    try {
      const modelId =
        this.selectedModels.project || this.getRecommendedModel('project');
      const prompt = this.buildProjectPrompt(title, description, technologies);
      const response = await this.callModel(modelId, prompt);

      const enhanced = this.parseProjectResponse(response.content);

      return {
        title: enhanced.title || title,
        description: enhanced.description || description,
        technologies,
        highlights: enhanced.highlights || [],
        metrics: enhanced.metrics || [],
        starFormat: enhanced.starFormat || {
          situation: '',
          task: '',
          action: '',
          result: '',
        },
      };
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
      // Simple rule-based recommendation with AI scoring
      const rules = this.getTemplateRules();
      const scores = await this.scoreProfileForTemplates(profile, rules);

      const bestMatch = scores.reduce((best, current) =>
        current.score > best.score ? current : best
      );

      return {
        recommendedTemplate: bestMatch.template,
        confidence: bestMatch.score,
        reasoning: bestMatch.reasoning,
        alternatives: scores
          .filter(s => s.template !== bestMatch.template)
          .sort((a, b) => b.score - a.score)
          .slice(0, 2)
          .map(s => ({
            template: s.template,
            score: s.score,
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
    try {
      // Basic quality metrics
      const readability = this.calculateReadabilityScore(content);
      const professionalism = this.calculateProfessionalismScore(content);
      const impact = this.calculateImpactScore(content);
      const completeness = this.calculateCompletenessScore(content, type);

      const overall = Math.round(
        (readability + professionalism + impact + completeness) / 4
      );

      return {
        overall,
        readability,
        professionalism,
        impact,
        completeness,
        suggestions: this.generateImprovementSuggestions(overall, {
          readability,
          professionalism,
          impact,
          completeness,
        }),
      };
    } catch (error) {
      logger.error('Content scoring failed', error as Error);
      return {
        overall: 50,
        readability: 50,
        professionalism: 50,
        impact: 50,
        completeness: 50,
        suggestions: ['Unable to analyze content quality'],
      };
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testModel = this.getRecommendedModel('bio');
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
      avgResponseTime: 0,
      successRate: 0,
    };
  }

  // Model management methods

  private async loadAvailableModels(): Promise<void> {
    // Load cached models or defaults
    this.availableModels = this.getDefaultAvailableModels();
  }

  private async refreshAvailableModels(): Promise<void> {
    try {
      // In a real implementation, this would fetch from HuggingFace API
      // For now, we'll simulate with updated model data
      const updatedModels = await this.fetchLatestModels();
      this.availableModels = updatedModels;
    } catch (error) {
      logger.warn('Failed to refresh available models, using cached data');
    }
  }

  private async fetchLatestModels(): Promise<AvailableModel[]> {
    // Simulate API call to get latest models with performance metrics
    return [
      {
        id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B Instruct',
        provider: 'huggingface',
        capabilities: ['bio', 'project', 'template'],
        costPerRequest: 0.0003,
        avgResponseTime: 2500,
        qualityRating: 0.92,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'microsoft/Phi-3.5-mini-instruct',
        name: 'Phi-3.5 Mini Instruct',
        provider: 'huggingface',
        capabilities: ['bio', 'project'],
        costPerRequest: 0.0001,
        avgResponseTime: 1800,
        qualityRating: 0.87,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'mistralai/Mistral-7B-Instruct-v0.3',
        name: 'Mistral 7B Instruct v0.3',
        provider: 'huggingface',
        capabilities: ['bio', 'project', 'template'],
        costPerRequest: 0.0002,
        avgResponseTime: 2200,
        qualityRating: 0.89,
        isRecommended: false,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'deepseek-ai/deepseek-coder-6.7b-instruct',
        name: 'DeepSeek Coder 6.7B',
        provider: 'huggingface',
        capabilities: ['project'],
        costPerRequest: 0.00015,
        avgResponseTime: 2000,
        qualityRating: 0.85,
        isRecommended: false,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'microsoft/DialoGPT-medium',
        name: 'DialoGPT Medium',
        provider: 'huggingface',
        capabilities: ['scoring', 'template'],
        costPerRequest: 0.00005,
        avgResponseTime: 1200,
        qualityRating: 0.75,
        isRecommended: false,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private getDefaultAvailableModels(): AvailableModel[] {
    return [
      {
        id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B Instruct',
        provider: 'huggingface',
        capabilities: ['bio', 'project', 'template'],
        costPerRequest: 0.0003,
        avgResponseTime: 2500,
        qualityRating: 0.92,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
      {
        id: 'microsoft/Phi-3.5-mini-instruct',
        name: 'Phi-3.5 Mini Instruct',
        provider: 'huggingface',
        capabilities: ['bio', 'project'],
        costPerRequest: 0.0001,
        avgResponseTime: 1800,
        qualityRating: 0.87,
        isRecommended: true,
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  // Private helper methods

  private async callModel(
    model: string,
    prompt: string
  ): Promise<ModelResponse> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseUrl}/${model}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new QuotaExceededError('huggingface');
        }
        if (response.status === 503) {
          throw new ModelUnavailableError('huggingface', model);
        }
        throw new AIServiceError(
          `API request failed: ${response.status}`,
          'API_ERROR',
          'huggingface'
        );
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      return {
        content: data[0]?.generated_text || data.generated_text || '',
        metadata: {
          model,
          provider: 'huggingface',
          tokens: this.estimateTokens(prompt + (data[0]?.generated_text || '')),
          cost: 0.02, // Estimated cost per request
          responseTime,
        },
      };
    } catch (error) {
      if (error instanceof AIServiceError) {
        throw error;
      }
      throw new AIServiceError(
        `Model call failed: ${error}`,
        'NETWORK_ERROR',
        'huggingface',
        true
      );
    }
  }

  private buildBioPrompt(bio: string, context: BioContext): string {
    const template = promptTemplates.bioEnhancement;
    return (
      template.system +
      '\n\n' +
      template.user
        .replace('{bio}', bio)
        .replace('{title}', context.title)
        .replace('{skills}', context.skills.join(', '))
        .replace('{tone}', context.tone)
        .replace('{length}', context.targetLength)
    );
  }

  private buildProjectPrompt(
    title: string,
    description: string,
    technologies: string[]
  ): string {
    const template = promptTemplates.projectOptimization;
    return (
      template.system +
      '\n\n' +
      template.user
        .replace('{title}', title)
        .replace('{description}', description)
        .replace('{technologies}', technologies.join(', '))
    );
  }

  private extractBioFromResponse(response: string): string {
    // Clean up the model response
    return response
      .replace(/^(Bio:|Enhanced Bio:|Here's an enhanced bio:)/i, '')
      .replace(/\n\s*\n/g, ' ')
      .trim();
  }

  private parseProjectResponse(response: string): Partial<ProjectEnhancement> {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      return parsed;
    } catch {
      // Fallback to text parsing
      return {
        description: response.trim(),
        highlights: [],
        metrics: [],
      };
    }
  }

  private calculateConfidence(
    response: ModelResponse,
    qualityScore: QualityScore
  ): number {
    const baseConfidence = 0.7;
    const qualityBonus = (qualityScore.overall - 50) / 100;
    const responseTimeBonus = response.metadata.responseTime < 5000 ? 0.1 : 0;

    return Math.min(
      0.95,
      Math.max(0.3, baseConfidence + qualityBonus + responseTimeBonus)
    );
  }

  private generateBioSuggestions(original: string, enhanced: string): string[] {
    const suggestions = [];

    if (enhanced.length > original.length * 1.5) {
      suggestions.push('Consider shortening for better impact');
    }

    if (!enhanced.includes('experience') && original.includes('experience')) {
      suggestions.push('Highlight your experience more prominently');
    }

    return suggestions;
  }

  private getTemplateRules() {
    return [
      {
        template: 'developer',
        keywords: ['software', 'developer', 'engineer', 'programming', 'code'],
        industries: ['technology', 'software', 'it'],
        skillCategories: ['programming', 'technical'],
      },
      {
        template: 'designer',
        keywords: ['design', 'ux', 'ui', 'creative', 'visual'],
        industries: ['design', 'advertising', 'media'],
        skillCategories: ['design', 'creative'],
      },
      {
        template: 'consultant',
        keywords: ['consultant', 'strategy', 'business', 'advisory'],
        industries: ['consulting', 'business', 'finance'],
        skillCategories: ['business', 'strategy'],
      },
    ];
  }

  private async scoreProfileForTemplates(profile: UserProfile, rules: any[]) {
    return rules.map(rule => {
      let score = 0.3; // Base score

      // Title matching
      if (
        rule.keywords.some((keyword: string) =>
          profile.title.toLowerCase().includes(keyword.toLowerCase())
        )
      ) {
        score += 0.4;
      }

      // Skills matching
      const skillMatches = profile.skills.filter(skill =>
        rule.keywords.some((keyword: string) =>
          skill.toLowerCase().includes(keyword.toLowerCase())
        )
      ).length;
      score += (skillMatches / profile.skills.length) * 0.3;

      return {
        template: rule.template,
        score: Math.min(0.95, score),
        reasoning: `Matches ${skillMatches} relevant skills and title patterns`,
      };
    });
  }

  private calculateReadabilityScore(content: string): number {
    const words = content.split(' ').length;
    const sentences = content.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / sentences;

    // Ideal range: 15-20 words per sentence
    if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
      return 90;
    } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
      return 75;
    } else {
      return 60;
    }
  }

  private calculateProfessionalismScore(content: string): number {
    let score = 70; // Base score

    // Positive indicators
    if (
      /\b(achieved|delivered|led|managed|developed|implemented)\b/i.test(
        content
      )
    ) {
      score += 10;
    }
    if (/\d+%|\d+\+|\$\d+/g.test(content)) {
      score += 10; // Contains metrics
    }

    // Negative indicators
    if (/\b(like|um|uh|you know)\b/i.test(content)) {
      score -= 15;
    }

    return Math.max(30, Math.min(95, score));
  }

  private calculateImpactScore(content: string): number {
    let score = 60;

    // Action verbs
    const actionVerbs = [
      'led',
      'created',
      'developed',
      'managed',
      'increased',
      'improved',
      'delivered',
    ];
    const actionCount = actionVerbs.filter(verb =>
      content.toLowerCase().includes(verb)
    ).length;
    score += actionCount * 5;

    // Quantifiable results
    const metrics = content.match(
      /\d+%|\d+\+|\$\d+|[0-9]+ (users|customers|team)/g
    );
    if (metrics) {
      score += metrics.length * 10;
    }

    return Math.max(30, Math.min(95, score));
  }

  private calculateCompletenessScore(content: string, type: string): number {
    const wordCount = content.split(' ').length;

    const targets = {
      bio: { min: 30, ideal: 60, max: 120 },
      project: { min: 20, ideal: 80, max: 150 },
      description: { min: 15, ideal: 50, max: 100 },
    };

    const target = targets[type as keyof typeof targets] || targets.bio;

    if (wordCount >= target.min && wordCount <= target.max) {
      if (wordCount >= target.ideal * 0.8 && wordCount <= target.ideal * 1.2) {
        return 90;
      }
      return 75;
    }

    return 50;
  }

  private generateImprovementSuggestions(
    _overall: number,
    scores: {
      readability: number;
      professionalism: number;
      impact: number;
      completeness: number;
    }
  ): string[] {
    const suggestions = [];

    if (scores.readability < 70) {
      suggestions.push('Simplify sentence structure for better readability');
    }
    if (scores.professionalism < 70) {
      suggestions.push('Use more professional language and action verbs');
    }
    if (scores.impact < 70) {
      suggestions.push('Add quantifiable achievements and specific results');
    }
    if (scores.completeness < 70) {
      suggestions.push(
        'Expand content to provide more comprehensive information'
      );
    }

    return suggestions;
  }

  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  private handleError(error: any, operation: string): AIServiceError {
    if (error instanceof AIServiceError) {
      return error;
    }

    return new AIServiceError(
      `${operation} failed: ${error.message}`,
      'UNKNOWN_ERROR',
      'huggingface'
    );
  }
}

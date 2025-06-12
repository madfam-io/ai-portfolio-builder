/**
 * DeepSeek AI Service Implementation
 * Provides AI-powered content enhancement using DeepSeek reasoning models
 */

import { BIO_PROMPTS, PROJECT_PROMPTS, TEMPLATE_PROMPTS } from './prompts';
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
} from './types';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
      reasoning?: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export class DeepSeekService implements AIService {
  private config: DeepSeekConfig;
  private usageStats = {
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

    if (!this.config.apiKey) {
      console.warn(
        'DeepSeek API key not configured. Service will use mock responses.'
      );
    }
  }

  /**
   * Enhance bio using DeepSeek reasoning models
   */
  async enhanceBio(bio: string, context: BioContext): Promise<EnhancedContent> {
    try {
      const prompt = this.buildBioPrompt(bio, context);
      const response = await this.callDeepSeek(prompt);

      return this.parseBioResponse(response, bio);
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
    title: string,
    description: string,
    technologies: string[]
  ): Promise<ProjectEnhancement> {
    try {
      const prompt = this.buildProjectPrompt(title, description, technologies);
      const response = await this.callDeepSeek(prompt);

      return this.parseProjectResponse(response, title, technologies);
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
    try {
      const prompt = this.buildTemplatePrompt(profile);
      const response = await this.callDeepSeek(prompt);

      return this.parseTemplateResponse(response);
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
    try {
      const prompt = this.buildScoringPrompt(content, type);
      const response = await this.callDeepSeek(prompt);

      return this.parseScoringResponse(response);
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
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.callDeepSeek(
        'Respond with "OK" if you can process this request.',
        { maxTokens: 10 }
      );
      return response.choices[0]?.message?.content?.includes('OK') || false;
    } catch {
      return false;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
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
   * Call DeepSeek API with reasoning capabilities
   */
  private async callDeepSeek(
    prompt: string,
    options: { maxTokens?: number; temperature?: number } = {}
  ): Promise<DeepSeekResponse> {
    const startTime = Date.now();
    this.usageStats.requestsToday++;

    // Mock response when API key is not configured
    if (!this.config.apiKey) {
      return this.getMockResponse(prompt);
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

      // Track successful request
      const responseTime = Date.now() - startTime;
      this.usageStats.successfulRequests++;
      this.usageStats.totalResponseTime += responseTime;
      this.usageStats.costToday += this.calculateCost(data.usage.total_tokens);

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
   * Build bio enhancement prompt
   */
  private buildBioPrompt(bio: string, context: BioContext): string {
    return `${BIO_PROMPTS.enhance}

Current bio: "${bio}"

Context:
- Title: ${context.title}
- Skills: ${context.skills.join(', ')}
- Industry: ${context.industry || 'Not specified'}
- Tone: ${context.tone}
- Target length: ${context.targetLength}
- Experience: ${context.experience.map(exp => `${exp.position} at ${exp.company} (${exp.yearsExperience} years)`).join(', ')}

Please enhance this bio to be more compelling while keeping it authentic. Use reasoning to analyze what makes this professional unique and craft a bio that highlights their value proposition.`;
  }

  /**
   * Build project optimization prompt
   */
  private buildProjectPrompt(
    title: string,
    description: string,
    technologies: string[]
  ): string {
    return `${PROJECT_PROMPTS.optimize}

Project: "${title}"
Description: "${description}"
Technologies: ${technologies.join(', ')}

Please optimize this project description using the STAR format (Situation, Task, Action, Result). Use reasoning to identify key achievements and metrics that would make this project stand out.`;
  }

  /**
   * Build template recommendation prompt
   */
  private buildTemplatePrompt(profile: UserProfile): string {
    return `${TEMPLATE_PROMPTS.recommend}

User Profile:
- Title: ${profile.title}
- Skills: ${profile.skills.join(', ')}
- Project Count: ${profile.projectCount}
- Has Design Work: ${profile.hasDesignWork}
- Industry: ${profile.industry || 'Not specified'}
- Experience Level: ${profile.experienceLevel}

Available templates: developer, designer, consultant, educator, creative, business

Use reasoning to analyze this profile and recommend the most suitable template. Consider their role, skills, and work type.`;
  }

  /**
   * Build content scoring prompt
   */
  private buildScoringPrompt(content: string, type: string): string {
    return `Analyze and score this ${type} content on multiple dimensions:

Content: "${content}"

Please provide scores (0-100) for:
1. Overall quality
2. Readability
3. Professionalism
4. Impact/persuasiveness
5. Completeness

Also provide specific suggestions for improvement. Use reasoning to explain your scoring decisions.`;
  }

  /**
   * Parse bio enhancement response
   */
  private parseBioResponse(
    response: DeepSeekResponse,
    originalBio: string
  ): EnhancedContent {
    const content = response.choices[0]?.message?.content || originalBio;
    const reasoning = response.choices[0]?.message?.reasoning || '';

    // Extract confidence from reasoning or estimate based on enhancement quality
    const confidence = this.estimateConfidence(content, reasoning);

    return {
      content,
      confidence,
      suggestions: this.extractSuggestions(reasoning),
      wordCount: content.split(' ').length,
      qualityScore: this.calculateQualityScore(content),
      enhancementType: 'bio',
    };
  }

  /**
   * Parse project optimization response
   */
  private parseProjectResponse(
    response: DeepSeekResponse,
    title: string,
    technologies: string[]
  ): ProjectEnhancement {
    const content = response.choices[0]?.message?.content || '';

    // Parse STAR format from response
    const starMatch = content.match(
      /Situation: (.+?)\nTask: (.+?)\nAction: (.+?)\nResult: (.+?)(?:\n|$)/
    );

    return {
      title,
      description: content,
      technologies,
      highlights: this.extractHighlights(content),
      metrics: this.extractMetrics(content),
      starFormat: starMatch
        ? {
            situation: starMatch[1]?.trim() || 'Context not specified',
            task: starMatch[2]?.trim() || 'Goals not specified',
            action: starMatch[3]?.trim() || 'Implementation details needed',
            result: starMatch[4]?.trim() || 'Results not quantified',
          }
        : {
            situation: 'Context not specified',
            task: 'Goals not specified',
            action: 'Implementation details needed',
            result: 'Results not quantified',
          },
    };
  }

  /**
   * Parse template recommendation response
   */
  private parseTemplateResponse(
    response: DeepSeekResponse
  ): TemplateRecommendation {
    const content = response.choices[0]?.message?.content || '';
    const reasoning = response.choices[0]?.message?.reasoning || '';

    // Extract recommended template
    const templates = [
      'developer',
      'designer',
      'consultant',
      'educator',
      'creative',
      'business',
    ];
    const recommendedTemplate =
      templates.find(template => content.toLowerCase().includes(template)) ||
      'developer';

    return {
      recommendedTemplate,
      confidence: this.estimateConfidence(content, reasoning),
      reasoning: reasoning || content,
      alternatives: templates
        .filter(t => t !== recommendedTemplate)
        .slice(0, 2)
        .map(template => ({
          template,
          score: Math.random() * 0.3 + 0.4, // Mock score between 0.4-0.7
          reasons: [`Alternative option for ${template} role`],
        })),
    };
  }

  /**
   * Parse content scoring response
   */
  private parseScoringResponse(response: DeepSeekResponse): QualityScore {
    const content = response.choices[0]?.message?.content || '';

    // Extract scores from response
    const overallMatch = content.match(/overall[:\s]+(\d+)/i);
    const readabilityMatch = content.match(/readability[:\s]+(\d+)/i);
    const professionalismMatch = content.match(/professionalism[:\s]+(\d+)/i);
    const impactMatch = content.match(/impact[:\s]+(\d+)/i);
    const completenessMatch = content.match(/completeness[:\s]+(\d+)/i);

    return {
      overall: parseInt(overallMatch?.[1] || '75'),
      readability: parseInt(readabilityMatch?.[1] || '80'),
      professionalism: parseInt(professionalismMatch?.[1] || '85'),
      impact: parseInt(impactMatch?.[1] || '70'),
      completeness: parseInt(completenessMatch?.[1] || '75'),
      suggestions: this.extractSuggestions(content),
    };
  }

  /**
   * Get mock response for development
   */
  private getMockResponse(prompt: string): DeepSeekResponse {
    const mockContent = this.generateMockContent(prompt);

    return {
      choices: [
        {
          message: {
            content: mockContent,
            reasoning:
              'Mock reasoning: This is a development response when DeepSeek API is not configured.',
          },
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: prompt.length / 4,
        completion_tokens: mockContent.length / 4,
        total_tokens: (prompt.length + mockContent.length) / 4,
      },
      model: 'deepseek-reasoner-mock',
    };
  }

  /**
   * Generate mock content based on prompt type
   */
  private generateMockContent(prompt: string): string {
    if (prompt.includes('bio')) {
      return 'Enhanced professional bio with improved clarity, stronger value proposition, and better flow. Highlights key achievements and expertise while maintaining authentic voice.';
    }

    if (prompt.includes('project')) {
      return 'Optimized project description using STAR format:\nSituation: Market need for solution\nTask: Develop comprehensive system\nAction: Implemented using modern technologies\nResult: Achieved measurable business impact';
    }

    if (prompt.includes('template')) {
      return 'Based on analysis of the user profile, I recommend the developer template. This choice aligns with their technical skills and project portfolio.';
    }

    if (prompt.includes('score')) {
      return 'Content Analysis:\nOverall: 85\nReadability: 80\nProfessionalism: 90\nImpact: 75\nCompleteness: 80\n\nSuggestions: Add more specific metrics, strengthen call-to-action';
    }

    return 'Mock DeepSeek response for development purposes.';
  }

  /**
   * Estimate confidence based on content quality
   */
  private estimateConfidence(content: string, reasoning: string): number {
    let confidence = 0.7; // Base confidence

    if (reasoning.length > 100) confidence += 0.1;
    if (content.length > 200) confidence += 0.1;
    if (content.includes('specific') || content.includes('measurable'))
      confidence += 0.1;

    return Math.min(confidence, 0.95);
  }

  /**
   * Extract suggestions from content
   */
  private extractSuggestions(content: string): string[] {
    const suggestions = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (
        line.includes('suggest') ||
        line.includes('recommend') ||
        line.includes('improve')
      ) {
        suggestions.push(line.trim());
      }
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  }

  /**
   * Extract highlights from project content
   */
  private extractHighlights(content: string): string[] {
    const highlights = [];
    const lines = content.split('\n');

    for (const line of lines) {
      if (
        line.trim().startsWith('•') ||
        line.trim().startsWith('-') ||
        line.trim().startsWith('*')
      ) {
        highlights.push(line.trim().substring(1).trim());
      }
    }

    return highlights.slice(0, 5);
  }

  /**
   * Extract metrics from content
   */
  private extractMetrics(content: string): string[] {
    const metrics = [];
    const numberPattern = /\d+[%x]/g;
    const matches = content.match(numberPattern);

    if (matches) {
      metrics.push(...matches.slice(0, 3));
    }

    return metrics;
  }

  /**
   * Calculate quality score based on content characteristics
   */
  private calculateQualityScore(content: string): number {
    let score = 50; // Base score

    if (content.length > 100) score += 10;
    if (content.length > 200) score += 10;
    if (content.includes('experience')) score += 5;
    if (content.includes('achieved') || content.includes('accomplished'))
      score += 10;
    if (content.match(/\d+/)) score += 5; // Contains numbers/metrics
    if (content.split('.').length > 3) score += 10; // Multiple sentences

    return Math.min(score, 100);
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

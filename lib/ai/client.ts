/**
 * AI Service Client
 * Frontend client for interacting with AI enhancement APIs
 */

import {
  BioContext,
  ProjectEnhancement,
  TemplateRecommendation,
  UserProfile,
  EnhancedContent,
} from './types';

export interface AIClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  provider?: 'huggingface';
  userModelPreferences?: {
    bio?: string;
    project?: string;
    template?: string;
    scoring?: string;
  };
  autoUpdateModels?: boolean;
}

export class AIClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private userModelPreferences: Record<string, string>;
  private autoUpdateModels: boolean;

  constructor(config: AIClientConfig = {}) {
    this.baseUrl = config.baseUrl || '';
    this.timeout = config.timeout || 30000; // 30 seconds
    this.retries = config.retries || 3;
    this.userModelPreferences = config.userModelPreferences || {};
    this.autoUpdateModels = config.autoUpdateModels ?? true;
  }

  /**
   * Get available models from HuggingFace
   */
  async getAvailableModels(): Promise<any[]> {
    return this.makeRequest('/api/ai/models', {
      method: 'GET',
    });
  }

  /**
   * Get current model selection
   */
  async getModelSelection(): Promise<Record<string, string>> {
    return this.makeRequest('/api/ai/models/selection', {
      method: 'GET',
    });
  }

  /**
   * Update model preferences
   */
  async updateModelSelection(taskType: string, modelId: string): Promise<void> {
    await this.makeRequest('/api/ai/models/selection', {
      method: 'PUT',
      body: JSON.stringify({ taskType, modelId }),
    });

    // Update local cache
    this.userModelPreferences[taskType] = modelId;
  }

  /**
   * Enhance bio content using AI
   */
  async enhanceBio(bio: string, context: BioContext): Promise<EnhancedContent> {
    return this.makeRequest('/api/ai/enhance-bio', {
      method: 'POST',
      body: JSON.stringify({
        bio,
        context,
        selectedModel: this.userModelPreferences.bio,
        autoUpdate: this.autoUpdateModels,
      }),
    });
  }

  /**
   * Optimize project description using AI
   */
  async optimizeProject(
    title: string,
    description: string,
    technologies: string[],
    context?: {
      industry?: string;
      projectType?: 'web' | 'mobile' | 'desktop' | 'api' | 'ai/ml' | 'other';
      targetAudience?: 'employers' | 'clients' | 'collaborators';
      emphasize?: 'technical' | 'business' | 'creative';
    }
  ): Promise<ProjectEnhancement> {
    return this.makeRequest('/api/ai/optimize-project', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        technologies,
        context,
        selectedModel: this.userModelPreferences.project,
        autoUpdate: this.autoUpdateModels,
      }),
    });
  }

  /**
   * Optimize multiple projects in batch
   */
  async optimizeProjectsBatch(
    projects: Array<{
      title: string;
      description: string;
      technologies: string[];
    }>
  ): Promise<{
    results: Array<{
      success: boolean;
      data: ProjectEnhancement | null;
      error: string | null;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  }> {
    return this.makeRequest('/api/ai/optimize-project', {
      method: 'PUT',
      body: JSON.stringify({ projects }),
    });
  }

  /**
   * Get template recommendation based on user profile
   */
  async recommendTemplate(
    profile: UserProfile,
    preferences?: {
      style?: 'minimal' | 'modern' | 'creative' | 'professional';
      targetAudience?: 'employers' | 'clients' | 'collaborators';
      priority?: 'simplicity' | 'visual_impact' | 'content_heavy';
    }
  ): Promise<TemplateRecommendation> {
    return this.makeRequest('/api/ai/recommend-template', {
      method: 'POST',
      body: JSON.stringify({
        profile,
        preferences,
        selectedModel: this.userModelPreferences.template,
        autoUpdate: this.autoUpdateModels,
      }),
    });
  }

  /**
   * Get all available templates
   */
  async getTemplates(): Promise<{
    templates: Record<
      string,
      {
        name: string;
        description: string;
        features: string[];
        preview: string;
        bestFor: string[];
        industries: string[];
      }
    >;
  }> {
    return this.makeRequest('/api/ai/recommend-template', {
      method: 'GET',
    });
  }

  /**
   * Get AI enhancement history for current user
   */
  async getEnhancementHistory(): Promise<{
    history: Array<{
      id: string;
      operation_type: string;
      metadata: Record<string, any>;
      created_at: string;
    }>;
    totalEnhancements: number;
  }> {
    return this.makeRequest('/api/ai/enhance-bio', {
      method: 'GET',
    });
  }

  /**
   * Make HTTP request with retry logic and error handling
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit,
    attempt: number = 1
  ): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle specific error cases
        if (response.status === 401) {
          throw new AIClientError(
            'Authentication required',
            'UNAUTHORIZED',
            false
          );
        }

        if (response.status === 429) {
          throw new AIClientError('Rate limit exceeded', 'RATE_LIMITED', true);
        }

        if (response.status === 503) {
          throw new AIClientError(
            'Service temporarily unavailable',
            'SERVICE_UNAVAILABLE',
            true
          );
        }

        throw new AIClientError(
          errorData.error || `Request failed with status ${response.status}`,
          'REQUEST_FAILED',
          response.status >= 500
        );
      }

      const data = await response.json();
      return data.data || data;
    } catch (error: any) {
      // Handle network errors and timeouts
      if (error.name === 'AbortError') {
        throw new AIClientError('Request timeout', 'TIMEOUT', true);
      }

      if (error instanceof AIClientError) {
        // Retry for retryable errors
        if (error.retryable && attempt < this.retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, options, attempt + 1);
        }
        throw error;
      }

      // Generic network error
      throw new AIClientError(
        'Network error occurred',
        'NETWORK_ERROR',
        attempt < this.retries
      );
    }
  }
}

/**
 * AI Client Error class
 */
export class AIClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIClientError';
  }
}

/**
 * Default AI client instance
 */
export const aiClient = new AIClient();

/**
 * React hooks for AI operations
 */
export function useAIEnhancement() {
  return {
    enhanceBio: aiClient.enhanceBio.bind(aiClient),
    optimizeProject: aiClient.optimizeProject.bind(aiClient),
    optimizeProjectsBatch: aiClient.optimizeProjectsBatch.bind(aiClient),
    recommendTemplate: aiClient.recommendTemplate.bind(aiClient),
    getTemplates: aiClient.getTemplates.bind(aiClient),
    getHistory: aiClient.getEnhancementHistory.bind(aiClient),
  };
}

/**
 * Utility functions for AI operations
 */
export const AIUtils = {
  /**
   * Extract user profile from portfolio data
   */
  extractUserProfile(portfolio: any): UserProfile {
    return {
      title: portfolio.title || '',
      skills: portfolio.skills?.map((s: any) => s.name) || [],
      projectCount: portfolio.projects?.length || 0,
      hasDesignWork:
        portfolio.projects?.some((p: any) =>
          p.technologies?.some((t: string) =>
            ['figma', 'sketch', 'photoshop', 'illustrator', 'design'].some(
              design => t.toLowerCase().includes(design)
            )
          )
        ) || false,
      industry: portfolio.experience?.[0]?.company || undefined,
      experienceLevel: this.calculateExperienceLevel(
        portfolio.experience || []
      ),
    };
  },

  /**
   * Calculate experience level from work history
   */
  calculateExperienceLevel(
    experience: any[]
  ): 'entry' | 'mid' | 'senior' | 'lead' {
    const totalYears = experience.reduce((total, exp) => {
      const startYear = new Date(exp.startDate).getFullYear();
      const endYear = exp.current
        ? new Date().getFullYear()
        : new Date(exp.endDate).getFullYear();
      return total + (endYear - startYear);
    }, 0);

    if (totalYears >= 8) return 'lead';
    if (totalYears >= 5) return 'senior';
    if (totalYears >= 2) return 'mid';
    return 'entry';
  },

  /**
   * Prepare bio context from portfolio data
   */
  prepareBioContext(portfolio: any): BioContext {
    return {
      title: portfolio.title || '',
      skills: portfolio.skills?.map((s: any) => s.name) || [],
      experience:
        portfolio.experience?.map((exp: any) => ({
          company: exp.company,
          position: exp.position,
          yearsExperience: this.calculateYearsExperience(
            exp.startDate,
            exp.endDate,
            exp.current
          ),
        })) || [],
      industry: portfolio.experience?.[0]?.company || undefined,
      tone: portfolio.aiSettings?.tone || 'professional',
      targetLength: portfolio.aiSettings?.targetLength || 'concise',
    };
  },

  /**
   * Calculate years of experience for a single role
   */
  calculateYearsExperience(
    startDate: string,
    endDate: string | null,
    current: boolean
  ): number {
    const start = new Date(startDate);
    const end = current ? new Date() : new Date(endDate || new Date());
    return Math.max(
      0,
      Math.floor(
        (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
    );
  },

  /**
   * Validate if content needs AI enhancement
   */
  needsEnhancement(content: string, type: 'bio' | 'project'): boolean {
    const minLengths = { bio: 30, project: 20 };
    const qualityIndicators = [
      /\d+%/, // Contains percentages
      /\d+\+/, // Contains numbers with plus
      /\$\d+/, // Contains dollar amounts
      /(led|managed|created|developed|improved|increased)/i, // Action verbs
    ];

    if (content.length < minLengths[type]) return true;

    const hasQualityIndicators = qualityIndicators.some(pattern =>
      pattern.test(content)
    );
    return !hasQualityIndicators;
  },
};

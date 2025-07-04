/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { apiClient, API_ENDPOINTS } from '@/lib/api/client';

import {
  BioContext,
  ProjectEnhancement,
  TemplateRecommendation,
  UserProfile,
  EnhancedContent,
} from './types';
import { Portfolio, Skill, Project, Experience } from '@/types/portfolio';

/**
 * AI Service Client
 * Frontend client for interacting with AI enhancement APIs
 *
 * @version 1.0.0
 * Now uses versioned API endpoints
 */

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
  private userModelPreferences: Record<string, string>;
  private autoUpdateModels: boolean;

  constructor(config: AIClientConfig = {}) {
    this.userModelPreferences = config.userModelPreferences || {};
    this.autoUpdateModels = config.autoUpdateModels ?? true;
  }

  /**
   * Get available models from HuggingFace
   */
  async getAvailableModels(): Promise<unknown[]> {
    const { data, error } = await apiClient.get(API_ENDPOINTS.ai.models);
    if (error) throw new AIClientError(error, 'REQUEST_FAILED');
    return data as unknown[];
  }

  /**
   * Get current model selection
   */
  async getModelSelection(): Promise<Record<string, string>> {
    const { data, error } = await apiClient.get(
      API_ENDPOINTS.ai.modelSelection
    );
    if (error) throw new AIClientError(error, 'REQUEST_FAILED');
    return data as Record<string, string>;
  }

  /**
   * Update model preferences
   */
  async updateModelSelection(taskType: string, modelId: string): Promise<void> {
    const { error } = await apiClient.put(API_ENDPOINTS.ai.modelSelection, {
      taskType,
      modelId,
    });
    if (error) throw new AIClientError(error, 'REQUEST_FAILED');

    // Update local cache
    this.userModelPreferences[taskType] = modelId;
  }

  /**
   * Enhance bio content using AI
   */
  async enhanceBio(bio: string, context: BioContext): Promise<EnhancedContent> {
    const { data, error } = await apiClient.post(API_ENDPOINTS.ai.enhanceBio, {
      bio,
      context,
      selectedModel: this.userModelPreferences.bio,
      autoUpdate: this.autoUpdateModels,
    });
    if (error) throw new AIClientError(error, 'REQUEST_FAILED');
    return data as EnhancedContent;
  }

  /**
   * Optimize project description using AI
   */
  async optimizeProject(
    description: string,
    technologies: string[],
    industryContext?: string
  ): Promise<ProjectEnhancement> {
    const { data, error } = await apiClient.post(
      API_ENDPOINTS.ai.optimizeProject,
      {
        description,
        technologies,
        industryContext,
        selectedModel: this.userModelPreferences.project,
        autoUpdate: this.autoUpdateModels,
      }
    );
    if (error) throw new AIClientError(error, 'REQUEST_FAILED');
    return data as ProjectEnhancement;
  }

  /**
   * Optimize multiple projects in batch
   */
  async optimizeProjectsBatch(
    projects: Array<{
      description: string;
      technologies: string[];
      industryContext?: string;
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
    const { data, error } = await apiClient.put(
      API_ENDPOINTS.ai.optimizeProject,
      { projects }
    );
    if (error) throw new AIClientError(error, 'REQUEST_FAILED');
    return data as {
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
    };
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
    const { data, error } = await apiClient.post(
      API_ENDPOINTS.ai.recommendTemplate,
      {
        profile,
        preferences,
        selectedModel: this.userModelPreferences.template,
        autoUpdate: this.autoUpdateModels,
      }
    );
    if (error) throw new AIClientError(error, 'REQUEST_FAILED');
    return data as TemplateRecommendation;
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
    const { data, error } = await apiClient.get(
      API_ENDPOINTS.ai.recommendTemplate
    );
    if (error) throw new AIClientError(error, 'REQUEST_FAILED');
    return data as {
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
    };
  }

  /**
   * Get AI enhancement history for current user
   */
  async getEnhancementHistory(): Promise<{
    history: Array<{
      id: string;
      operation_type: string;
      metadata: Record<string, unknown>;
      created_at: string;
    }>;
    totalEnhancements: number;
  }> {
    const { data, error } = await apiClient.get(API_ENDPOINTS.ai.enhanceBio);
    if (error) throw new AIClientError(error, 'REQUEST_FAILED');
    return data as {
      history: Array<{
        id: string;
        operation_type: string;
        metadata: Record<string, unknown>;
        created_at: string;
      }>;
      totalEnhancements: number;
    };
  }

  /**
   * Note: makeRequest method removed in favor of versioned API client
   * All API calls now use the centralized apiClient from @/lib/api/client
   * which handles versioning, retries, and error handling automatically
   */
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
  extractUserProfile(portfolio: Portfolio): UserProfile {
    return {
      title: portfolio.title || '',
      skills: portfolio.skills?.map((s: Skill) => s.name) || [],
      projectCount: portfolio.projects?.length || 0,
      hasDesignWork:
        portfolio.projects?.some((p: Project) =>
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
    experience: Experience[]
  ): 'entry' | 'mid' | 'senior' | 'lead' {
    const totalYears = experience.reduce((total: number, exp: Experience) => {
      return (
        total +
        this.calculateYearsExperience(
          exp.startDate,
          exp.endDate || null,
          exp.current
        )
      );
    }, 0);

    if (totalYears >= 8) return 'lead';
    if (totalYears >= 5) return 'senior';
    if (totalYears >= 2) return 'mid';
    return 'entry';
  },

  /**
   * Prepare bio context from portfolio data
   */
  prepareBioContext(portfolio: Portfolio): BioContext {
    return {
      title: portfolio.title || '',
      skills: portfolio.skills?.map((s: Skill) => s.name) || [],
      experience:
        portfolio.experience?.map((exp: Experience) => ({
          company: exp.company,
          position: exp.position,
          yearsExperience: this.calculateYearsExperience(
            exp.startDate,
            exp.endDate || null,
            exp.current
          ),
        })) || [],
      industry: portfolio.experience?.[0]?.company || undefined,
      tone:
        (portfolio.aiSettings?.tone === 'academic'
          ? 'professional'
          : portfolio.aiSettings?.tone) ||
        ('professional' as 'professional' | 'casual' | 'creative'),
      targetLength:
        (portfolio.aiSettings?.targetLength === 'balanced'
          ? 'detailed'
          : portfolio.aiSettings?.targetLength) ||
        ('concise' as 'concise' | 'detailed' | 'comprehensive'),
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

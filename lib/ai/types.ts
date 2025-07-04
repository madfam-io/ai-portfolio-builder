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

/**
 * AI Service Type Definitions
 * Defines interfaces for open-source AI model integration
 */

// Enhanced content response
export interface EnhancedContent {
  content: string;
  confidence: number;
  suggestions?: string[];
  wordCount: number;
  qualityScore: number;
  enhancementType: 'bio' | 'project' | 'description' | 'skill';
}

// Bio enhancement context
export interface BioContext {
  title: string;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    yearsExperience: number;
  }>;
  industry?: string;
  tone: 'professional' | 'casual' | 'creative';
  targetLength: 'concise' | 'detailed' | 'comprehensive';
}

// Project enhancement
export interface ProjectEnhancement {
  original: string;
  enhanced: string;
  keyAchievements: string[];
  technologies: string[];
  impactMetrics: string[];
  confidence: number;
}

// Template recommendation
export interface TemplateRecommendation {
  recommendedTemplate: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    template: string;
    score: number;
    reasons: string[];
  }>;
}

// User profile for recommendations
export interface UserProfile {
  title: string;
  skills: string[];
  projectCount: number;
  hasDesignWork: boolean;
  industry?: string;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
}

// Content quality scoring
export interface QualityScore {
  overall: number; // 0-100
  readability: number;
  professionalism: number;
  impact: number;
  completeness: number;
  suggestions: string[];
}

// AI model configuration
export interface ModelConfig {
  name: string;
  endpoint: string;
  maxTokens: number;
  temperature: number;
  costPerRequest: number;
  avgResponseTime: number;
}

// AI service interface
export interface AIService {
  enhanceBio(bio: string, context: BioContext): Promise<EnhancedContent>;
  optimizeProjectDescription(
    description: string,
    technologies: string[],
    industryContext?: string
  ): Promise<ProjectEnhancement>;
  recommendTemplate(profile: UserProfile): Promise<TemplateRecommendation>;
  scoreContent(content: string, type: string): Promise<QualityScore>;

  // Health and monitoring
  healthCheck(): Promise<boolean>;
  getUsageStats(): Promise<{
    requestsToday: number;
    costToday: number;
    avgResponseTime: number;
    successRate: number;
  }>;
}

// Model provider types - unified through HuggingFace
export type AIProvider = 'huggingface';

// Enhancement request options
export interface EnhancementOptions {
  provider?: AIProvider;
  selectedModel?: string;
  maxRetries?: number;
  fallbackModel?: string;
  cacheKey?: string;
  autoSelectBestModel?: boolean;
}

// Error types
export class AIServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class ModelUnavailableError extends AIServiceError {
  constructor(provider: string, model: string) {
    super(
      `Model ${model} is unavailable on ${provider}`,
      'MODEL_UNAVAILABLE',
      provider,
      true
    );
  }
}

export class QuotaExceededError extends AIServiceError {
  constructor(provider: string) {
    super(
      `API quota exceeded for ${provider}`,
      'QUOTA_EXCEEDED',
      provider,
      false
    );
  }
}

// Prompt templates
export interface PromptTemplate {
  system: string;
  user: string;
  examples?: Array<{
    input: string;
    output: string;
  }>;
}

// Model response format
export interface ModelResponse {
  content: string;
  metadata: {
    model: string;
    provider: string;
    tokens: number;
    cost: number;
    responseTime: number;
  };
}

// GEO Enhancement request
export interface GEOEnhancementRequest {
  content: string;
  contentType: 'bio' | 'project' | 'experience' | 'skill';
  geoSettings: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    targetAudience: 'employers' | 'clients' | 'collaborators';
    industry: string;
    contentGoals: string[];
    enableStructuredData?: boolean;
    enableKeywordOptimization?: boolean;
  };
}

// GEO Enhancement response
export interface GEOEnhancementResponse {
  enhancedContent: string;
  metadata: {
    title: string;
    metaDescription: string;
    keywords: string[];
  };
  geoScore: {
    overall: number;
    keyword: number;
    readability: number;
    structure: number;
  };
  suggestions: string[];
}

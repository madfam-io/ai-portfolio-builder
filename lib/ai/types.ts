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
  title: string;
  description: string;
  technologies: string[];
  highlights: string[];
  metrics?: string[];
  starFormat: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
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
    title: string,
    description: string,
    technologies: string[]
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

// Model provider types
export type AIProvider = 'huggingface' | 'replicate' | 'modal' | 'local';

// Enhancement request options
export interface EnhancementOptions {
  provider?: AIProvider;
  model?: string;
  maxRetries?: number;
  fallbackModel?: string;
  cacheKey?: string;
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
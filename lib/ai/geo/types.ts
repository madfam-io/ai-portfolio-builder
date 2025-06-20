/**
 * GEO (Generative Engine Optimization) Type Definitions
 * Types for SEO-aware content generation and optimization
 */

/**
 * Keyword analysis result
 */
export interface KeywordAnalysis {
  primaryKeyword: string;
  secondaryKeywords: string[];
  lsiKeywords: string[]; // Latent Semantic Indexing keywords
  entities: string[]; // Named entities (people, places, organizations)
  density: Record<string, number>; // Keyword -> density percentage
  recommendations: string[];
}

/**
 * Content structure analysis
 */
export interface ContentStructure {
  headings: {
    h1: string[];
    h2: string[];
    h3: string[];
    h4: string[];
    h5: string[];
    h6: string[];
  };
  paragraphCount: number;
  listCount: number;
  avgSentenceLength: number;
  avgParagraphLength: number;
  hasProperHierarchy: boolean;
}

/**
 * Readability metrics
 */
export interface ReadabilityMetrics {
  fleschKincaid: number;
  fleschReading: number;
  gunningFog: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  complexWordCount: number;
  score: number; // 0-100
  level: 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard';
  suggestions: string[];
}

/**
 * SEO metadata for content
 */
export interface SEOMetadata {
  title: string;
  metaDescription: string;
  focusKeyphrase: string;
  slug: string;
  canonicalUrl?: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  jsonLd?: Record<string, unknown>; // Schema.org structured data
}

/**
 * GEO optimization settings
 */
export interface GEOSettings {
  // Target keywords
  primaryKeyword: string;
  secondaryKeywords: string[];
  negativeKeywords?: string[]; // Keywords to avoid

  // Content goals
  targetAudience: 'employers' | 'clients' | 'collaborators' | 'general';
  contentGoals: ('inform' | 'convert' | 'engage' | 'rank')[];
  industry: string;

  // Optimization preferences
  tone: 'professional' | 'casual' | 'creative' | 'academic' | 'technical';
  readabilityLevel: 'simple' | 'moderate' | 'advanced';
  contentLength: 'concise' | 'detailed' | 'comprehensive';

  // Technical settings
  enableStructuredData: boolean;
  enableInternalLinking: boolean;
  enableKeywordOptimization: boolean;
  keywordDensityTarget: number; // Percentage (e.g., 1.5)

  // Platform-specific optimization
  optimizeFor: ('google' | 'bing' | 'social' | 'voice' | 'ai-engines')[];
}

/**
 * GEO-enhanced content
 */
export interface GEOContent {
  content: string;
  structure: ContentStructure;
  keywords: KeywordAnalysis;
  readability: ReadabilityMetrics;
  metadata: SEOMetadata;
  internalLinks?: InternalLink[];
  score: GEOScore;
  suggestions: GEOSuggestion[];
}

/**
 * Internal linking suggestion
 */
export interface InternalLink {
  text: string; // Anchor text
  url: string; // Target URL
  context: string; // Surrounding text
  relevanceScore: number; // 0-1
}

/**
 * GEO quality score
 */
export interface GEOScore {
  overall: number; // 0-100
  keyword: number;
  readability: number;
  structure: number;
  technical: number;
  uniqueness: number;
}

/**
 * GEO improvement suggestion
 */
export interface GEOSuggestion {
  type: 'keyword' | 'structure' | 'readability' | 'technical' | 'content';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action: string;
  impact: number; // Estimated score improvement
}

/**
 * Content optimization request
 */
export interface OptimizeContentRequest {
  content: string;
  contentType: 'bio' | 'project' | 'experience' | 'skill' | 'custom';
  settings: GEOSettings;
  existingContent?: string[]; // For uniqueness checking
}

/**
 * Content optimization response
 */
export interface OptimizeContentResponse {
  optimizedContent: GEOContent;
  originalScore: GEOScore;
  improvedScore: GEOScore;
  appliedOptimizations: string[];
  processingTime: number;
}

/**
 * Keyword research result
 */
export interface KeywordResearch {
  keyword: string;
  searchVolume?: number;
  difficulty?: number;
  relatedKeywords: string[];
  questions: string[]; // People also ask
  trends?: 'rising' | 'stable' | 'declining';
}

/**
 * Content template with GEO
 */
interface GEOTemplate {
  id: string;
  name: string;
  contentType: string;
  structure: {
    sections: Array<{
      type: string;
      heading: string;
      keywords: string[];
      minWords: number;
      maxWords: number;
    }>;
  };
  seoGuidelines: string[];
  exampleContent?: string;
}

/**
 * GEO analytics data
 */
interface GEOAnalytics {
  contentId: string;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  avgPosition: number;
  topQueries: Array<{
    query: string;
    impressions: number;
    clicks: number;
    position: number;
  }>;
  performanceByDevice: Record<string, number>;
  socialShares: Record<string, number>;
}

/**
 * Platform-specific optimization
 */
interface PlatformOptimization {
  platform: 'google' | 'bing' | 'linkedin' | 'twitter' | 'facebook';
  requirements: {
    titleLength: { min: number; max: number };
    descriptionLength: { min: number; max: number };
    keywordPlacement: string[];
    specialTags?: string[];
  };
  bestPractices: string[];
}

/**
 * AI content disclosure
 */
interface AIContentDisclosure {
  isAIGenerated: boolean;
  isAIAssisted: boolean;
  humanReviewed: boolean;
  generationDate: Date;
  model?: string;
  confidence?: number;
  disclosureText?: string;
}

/**
 * GEO (Generative Engine Optimization) Types
 * Type definitions for geographic and SEO optimization features
 */

export interface GEOSettings {
  enabled: boolean;
  targetCountries: string[];
  primaryLanguage: string;
  keywords: string[];
  contentStrategy: 'local' | 'global' | 'regional';
}

export interface GEOContent {
  content: string;
  locale: string;
  keywords: string[];
  metadata: SEOMetadata;
  optimizationScore: number;
}

// Commented out - currently unused
// interface OptimizeContentRequest {
//   content: string;
//   targetLocale: string;
//   keywords: string[];
//   settings: GEOSettings;
// }

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  alternateUrls: Record<string, string>;
  hreflang: Record<string, string>;
}

export interface KeywordResearch {
  keyword: string;
  searchVolume: number;
  competition: 'low' | 'medium' | 'high';
  difficulty: number;
  relevanceScore: number;
  suggestions: string[];
}

// Commented out - currently unused
// interface GEOAnalysisResult {
//   content: GEOContent;
//   suggestions: string[];
//   optimizationTips: string[];
//   keywordDensity: Record<string, number>;
//   readabilityScore: number;
// }

import { cache, CACHE_KEYS } from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';
import {
  GEOSettings,
  GEOContent,
  SEOMetadata,
  KeywordResearch,
} from '@/types/geo';

import { HuggingFaceService } from '../huggingface-service';
import { GEOEnhancementRequest, GEOEnhancementResponse } from '../types';

import { ContentOptimizer } from './content-optimizer';
import { KeywordAnalyzer } from './keyword-analyzer';
import { MetadataGenerator } from './metadata-generator';
import { GEOPromptBuilder } from './prompts';

/**
 * GEO (Generative Engine Optimization) Service
 * Main service for integrating GEO capabilities into content generation
 */

export class GEOService {
  private keywordAnalyzer: KeywordAnalyzer;
  private contentOptimizer: ContentOptimizer;
  private metadataGenerator: MetadataGenerator;
  private aiService: HuggingFaceService;

  constructor(huggingFaceApiKey?: string) {
    this.keywordAnalyzer = new KeywordAnalyzer();
    this.contentOptimizer = new ContentOptimizer();
    this.metadataGenerator = new MetadataGenerator();
    this.aiService = new HuggingFaceService(huggingFaceApiKey);
  }

  /**
   * Enhance content with GEO optimization
   */
  async enhanceWithGEO(
    request: GEOEnhancementRequest
  ): Promise<GEOEnhancementResponse> {
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey('geo-enhance', request);
      const cached = await cache.get<GEOEnhancementResponse>(cacheKey);
      if (cached) {
        logger.debug('GEO enhancement cache hit');
        return cached;
      }

      // Convert to GEO settings
      const geoSettings = {
        primaryKeyword: request.geoSettings.primaryKeyword,
        secondaryKeywords: request.geoSettings.secondaryKeywords,
        targetAudience: request.geoSettings.targetAudience,
        contentGoals: request.geoSettings.contentGoals as unknown[],
        industry: request.geoSettings.industry,
        tone: 'professional' as const, // Default, could be made configurable
        readabilityLevel: 'moderate',
        contentLength: 'detailed',
        enableStructuredData: request.geoSettings.enableStructuredData ?? true,
        enableInternalLinking: false,
        enableKeywordOptimization:
          request.geoSettings.enableKeywordOptimization ?? true,
        keywordDensityTarget: 1.5,
        optimizeFor: ['google', 'ai-engines'],
      };

      // Optimize content
      const optimizationRequest = {
        content: request.content,
        contentType: request.contentType,
        settings: geoSettings as unknown,
      } as unknown;

      const optimized =
        await this.contentOptimizer.optimizeContent(optimizationRequest);

      // Generate AI-enhanced content with GEO awareness
      let enhancedContent = optimized.optimizedContent.content;

      if (request.contentType === 'bio') {
        enhancedContent = await this.enhanceBioWithGEO(
          request.content,
          geoSettings as unknown
        );
      } else if (request.contentType === 'project') {
        enhancedContent = await this.enhanceProjectWithGEO(
          request.content,
          geoSettings as unknown
        );
      }

      // Generate metadata
      const metadata = await this.metadataGenerator.generateMetadata(
        enhancedContent,
        geoSettings as unknown
      );

      const response: GEOEnhancementResponse = {
        enhancedContent,
        metadata: {
          title: metadata.title,
          metaDescription: metadata.metaDescription,
          keywords: metadata.keywords,
        },
        geoScore: {
          overall: optimized.improvedScore.overall,
          keyword: optimized.improvedScore.keyword,
          readability: optimized.improvedScore.readability,
          structure: optimized.improvedScore.structure,
        },
        suggestions: optimized.optimizedContent.suggestions.map(s => s.action),
      };

      // Cache the result
      await cache.set(cacheKey, response, 3600); // Cache for 1 hour

      return response;
    } catch (error) {
      logger.error('GEO enhancement failed', error as Error);
      throw error;
    }
  }

  /**
   * Enhance bio with GEO optimization
   */
  private async enhanceBioWithGEO(
    bio: string,
    settings: GEOSettings
  ): Promise<string> {
    const geoSettings = settings as unknown;
    // Generate GEO-aware prompt (not used directly, but for reference)
    GEOPromptBuilder.buildGeoBioPrompt({
      bio,
      primaryKeyword: geoSettings.primaryKeyword,
      secondaryKeywords: geoSettings.secondaryKeywords,
      title: geoSettings.primaryKeyword, // Use keyword as title fallback
      skills: geoSettings.secondaryKeywords, // Use secondary keywords as skills
      industry: geoSettings.industry,
      targetAudience: geoSettings.targetAudience,
      tone: geoSettings.tone,
      targetLength: geoSettings.contentLength,
      contentGoals: geoSettings.contentGoals,
    });

    const response = await this.aiService.enhanceBio(bio, {
      title: geoSettings.primaryKeyword,
      skills: geoSettings.secondaryKeywords,
      experience: [],
      industry: geoSettings.industry,
      tone:
        geoSettings.tone === 'technical' || geoSettings.tone === 'academic'
          ? 'professional'
          : geoSettings.tone,
      targetLength: geoSettings.contentLength,
    });

    return response.content;
  }

  /**
   * Enhance project with GEO optimization
   */
  private async enhanceProjectWithGEO(
    description: string,
    settings: GEOSettings
  ): Promise<string> {
    const geoSettings = settings as unknown;
    // Generate GEO-aware prompt (not used directly, but for reference)
    GEOPromptBuilder.buildGeoProjectPrompt({
      title: geoSettings.primaryKeyword,
      description,
      technologies: geoSettings.secondaryKeywords,
      primaryKeyword: geoSettings.primaryKeyword,
      industry: geoSettings.industry,
      targetQueries: geoSettings.contentGoals,
    });

    const response = await this.aiService.optimizeProjectDescription(
      description,
      geoSettings.secondaryKeywords,
      geoSettings.primaryKeyword
    );

    return response.enhanced;
  }

  /**
   * Research keywords for content
   */
  async researchKeywords(
    seedKeyword: string,
    industry?: string
  ): Promise<KeywordResearch[]> {
    try {
      const cacheKey = `${CACHE_KEYS.AI_RESULT}keyword-research:${seedKeyword}:${industry}`;
      const cached = await cache.get<KeywordResearch[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const research = await this.keywordAnalyzer.researchKeywords(
        seedKeyword,
        industry
      );

      await cache.set(cacheKey, research, 86400); // Cache for 24 hours
      return research as unknown;
    } catch (error) {
      logger.error('Keyword research failed', error as Error);
      return [];
    }
  }

  /**
   * Generate SEO metadata for content
   */
  generateMetadata(
    content: string,
    settings: Partial<GEOSettings>
  ): SEOMetadata {
    const defaultSettings = {
      primaryKeyword: '',
      secondaryKeywords: [],
      targetAudience: 'general',
      contentGoals: ['inform'],
      industry: 'general',
      tone: 'professional',
      readabilityLevel: 'moderate',
      contentLength: 'detailed',
      enableStructuredData: true,
      enableInternalLinking: false,
      enableKeywordOptimization: true,
      keywordDensityTarget: 1.5,
      optimizeFor: ['google'],
    };

    const finalSettings = { ...defaultSettings, ...settings };
    return this.metadataGenerator.generateMetadata(
      content,
      finalSettings as unknown
    ) as unknown;
  }

  /**
   * Analyze content for GEO optimization opportunities
   */
  async analyzeContent(
    content: string,
    _contentType: string
  ): Promise<GEOContent> {
    const analysis = this.keywordAnalyzer.analyzeContent(content);
    const structure = this.contentOptimizer.analyzeStructure(content);
    const readability = this.contentOptimizer.calculateReadability(content);

    const settings = {
      primaryKeyword: analysis.primaryKeyword,
      secondaryKeywords: analysis.secondaryKeywords,
      targetAudience: 'general',
      contentGoals: ['inform'],
      industry: 'general',
      tone: 'professional',
      readabilityLevel: 'moderate',
      contentLength: 'detailed',
      enableStructuredData: true,
      enableInternalLinking: false,
      enableKeywordOptimization: true,
      keywordDensityTarget: 1.5,
      optimizeFor: ['google'],
    };

    const metadata = await this.generateMetadata(content, settings as unknown);

    // Calculate GEO score
    const score = {
      overall: 0,
      keyword: 0,
      readability: readability.score,
      structure: 0,
      technical: 0,
      uniqueness: 0,
    };

    // Generate suggestions
    const suggestions = [
      ...analysis.recommendations.map(rec => ({
        type: 'keyword' as const,
        priority: 'medium' as const,
        message: rec,
        action: rec,
        impact: 10,
      })),
      ...readability.suggestions.map(sug => ({
        type: 'readability' as const,
        priority: 'medium' as const,
        message: sug,
        action: sug,
        impact: 5,
      })),
    ];

    return {
      content,
      structure,
      keywords: analysis as unknown,
      readability,
      metadata,
      score,
      suggestions,
    } as unknown;
  }

  /**
   * Get platform-specific optimization tips
   */
  getPlatformOptimizationTips(
    platform: 'google' | 'bing' | 'linkedin' | 'twitter'
  ): string[] {
    const tips: Record<string, string[]> = {
      google: [
        'Use descriptive URLs with keywords',
        'Optimize for featured snippets with clear answers',
        'Include structured data markup',
        'Ensure mobile-friendliness',
        'Optimize Core Web Vitals',
      ],
      bing: [
        'Use exact match keywords more frequently',
        'Include social signals and shares',
        'Optimize page titles with keywords',
        'Use older domains when possible',
        'Include multimedia content',
      ],
      linkedin: [
        'Use industry-specific keywords',
        'Include certifications and skills',
        'Optimize headline with keywords',
        'Use accomplishment-focused language',
        'Include measurable results',
      ],
      twitter: [
        'Front-load important information',
        'Use relevant hashtags',
        'Keep it concise and scannable',
        'Include compelling visuals',
        'Optimize for retweets with questions',
      ],
    };

    return tips[platform] || tips.google || [];
  }

  /**
   * Generate cache key for GEO operations
   */
  private generateCacheKey(operation: string, data: unknown): string {
    const hash = require('crypto')
      .createHash('md5')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 8);
    return `${CACHE_KEYS.AI_RESULT}geo:${operation}:${hash}`;
  }
}

/**
 * Singleton instance for easy access
 */
let geoServiceInstance: GEOService | null = null;

export function getGEOService(apiKey?: string): GEOService {
  if (!geoServiceInstance) {
    geoServiceInstance = new GEOService(apiKey);
  }
  return geoServiceInstance;
}

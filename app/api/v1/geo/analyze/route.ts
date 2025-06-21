/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getGEOService } from '@/lib/ai/geo/geo-service';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * GEO Content Analysis API
 * Analyzes content for SEO optimization opportunities
 */

// Request validation schema
const analyzeContentSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
  contentType: z.enum(['bio', 'project', 'experience', 'skill', 'custom']),
  targetKeywords: z.array(z.string()).optional(),
});

interface AnalysisResult {
  content?: string;
  score?: {
    overall?: number;
    keyword?: number;
    readability?: number;
    structure?: number;
    technical?: number;
  };
  optimizationScore?: number;
  keywords?: {
    primaryKeyword?: string;
    secondaryKeywords?: string[];
    lsiKeywords?: string[];
    density?: Record<string, number>;
    recommendations?: string[];
  };
  readability?: {
    score?: number;
    level?: string;
    avgWordsPerSentence?: number;
    complexWordCount?: number;
    fleschReading?: number;
  };
  structure?: {
    headings?: Array<{
      level: number;
      text: string;
    }>;
    paragraphCount?: number;
    hasProperHierarchy?: boolean;
  };
  suggestions?: Array<{
    type: string;
    priority: string;
    message: string;
    action: string;
    impact: number;
  }>;
  metadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

// Helper functions to reduce complexity
function processTargetKeywords(
  analysis: AnalysisResult,
  targetKeywords?: string[]
): void {
  if (targetKeywords && targetKeywords.length > 0) {
    const primaryKeyword = targetKeywords[0];
    if (primaryKeyword) {
      analysis.keywords = {
        primaryKeyword: primaryKeyword,
        secondaryKeywords: targetKeywords.slice(1),
      };
    }
  }
}

function transformSuggestions(
  suggestions?: Array<{
    type: string;
    priority: string;
    message: string;
    action: string;
    impact: number;
  }>
): Array<Record<string, unknown>> {
  return (
    suggestions?.map(suggestion => ({
      type: suggestion.type,
      priority: suggestion.priority,
      message: suggestion.message,
      action: suggestion.action,
      estimatedImpact: `+${suggestion.impact}% score improvement`,
    })) ?? []
  );
}

function buildScores(analysis: AnalysisResult): Record<string, number> {
  return {
    overall: analysis.score?.overall ?? analysis.optimizationScore ?? 0,
    keyword: analysis.score?.keyword ?? 0,
    readability: analysis.score?.readability ?? 0,
    structure: analysis.score?.structure ?? 0,
    technical: analysis.score?.technical ?? 0,
  };
}

function buildKeywordsData(analysis: AnalysisResult): Record<string, unknown> {
  return {
    detected: analysis.keywords?.lsiKeywords ?? analysis.keywords,
    density: analysis.keywords?.density ?? {},
    recommendations: analysis.keywords?.recommendations ?? [],
  };
}

function buildReadabilityData(
  analysis: AnalysisResult
): Record<string, unknown> {
  return {
    score: analysis.readability?.score ?? 0,
    level: analysis.readability?.level ?? 'unknown',
    metrics: {
      avgSentenceLength: analysis.readability?.avgWordsPerSentence ?? 0,
      complexWords: analysis.readability?.complexWordCount ?? 0,
      readingEase: analysis.readability?.fleschReading ?? 0,
    },
  };
}

// Main transformation function
function transformAnalysisResults(
  analysis: AnalysisResult,
  targetKeywords?: string[]
): Record<string, unknown> {
  // Process target keywords
  processTargetKeywords(analysis, targetKeywords);

  return {
    content: analysis.content,
    scores: buildScores(analysis),
    keywords: buildKeywordsData(analysis),
    readability: buildReadabilityData(analysis),
    structure: {
      headings: analysis.structure?.headings ?? [],
      paragraphs: analysis.structure?.paragraphCount ?? 0,
      hasProperHierarchy: analysis.structure?.hasProperHierarchy ?? false,
    },
    suggestions: transformSuggestions(analysis.suggestions),
    metadata: {
      title: analysis.metadata?.title || '',
      description: analysis.metadata?.description || '',
      recommendedKeywords: analysis.metadata?.keywords ?? [],
    },
  };
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user === null) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const validationResult = analyzeContentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { content, contentType, targetKeywords } = validationResult.data;

    // 3. Initialize GEO service
    const geoService = getGEOService();

    // 4. Analyze content
    const analysis = await geoService.analyzeContent(content, contentType);

    // 5. Transform analysis results - convert keywords array to object format
    const analysisWithKeywordObject = {
      ...analysis,
      keywords: {
        primaryKeyword: analysis.keywords[0],
        secondaryKeywords: analysis.keywords.slice(1, 5),
        lsiKeywords: analysis.keywords.slice(5),
        density: {},
        recommendations: [],
      },
    };
    const data = transformAnalysisResults(
      analysisWithKeywordObject,
      targetKeywords
    );

    // 6. Return analysis results
    return NextResponse.json({
      success: true,
      data,
      metadata: {
        analyzedAt: new Date().toISOString(),
        contentLength: content.length,
        wordCount: content.split(/\s+/).length,
      },
    });
  } catch (error) {
    logger.error('GEO analysis failed', error as Error);
    return NextResponse.json(
      { error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}

/**
 * Get GEO analysis guidelines
 */
export async function GET(): Promise<Response> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user === null) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Return GEO best practices and guidelines
    return NextResponse.json({
      success: true,
      data: {
        guidelines: {
          keyword: {
            primaryDensity: '1-2%',
            secondaryDensity: '0.5-1%',
            placement: [
              'First 100 words',
              'Headings (H1, H2)',
              'First and last paragraphs',
              'Image alt text',
            ],
          },
          readability: {
            targetScore: 60,
            sentenceLength: '15-20 words',
            paragraphLength: '50-150 words',
            useActivVoice: true,
            avoidJargon: true,
          },
          structure: {
            useHeadings: true,
            headingHierarchy: 'H1 → H2 → H3',
            useLists: true,
            useShortParagraphs: true,
            includeCallToAction: true,
          },
          technical: {
            minWordCount: 300,
            maxWordCount: 2000,
            useInternalLinks: true,
            optimizeImages: true,
            mobileFirst: true,
          },
        },
        scoringCriteria: {
          excellent: '90-100',
          good: '70-89',
          average: '50-69',
          needsImprovement: '0-49',
        },
        contentTypes: {
          bio: {
            idealLength: '50-150 words',
            focus: 'Value proposition and expertise',
            structure: 'Hook → Expertise → CTA',
          },
          project: {
            idealLength: '150-300 words',
            focus: 'Problem → Solution → Results',
            structure: 'Overview → Technologies → Impact',
          },
          experience: {
            idealLength: '100-200 words',
            focus: 'Responsibilities and achievements',
            structure: 'Role → Actions → Results',
          },
        },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch GEO guidelines', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch guidelines' },
      { status: 500 }
    );
  }
}

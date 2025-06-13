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

    // 5. Add target keywords if provided
    if (targetKeywords && targetKeywords.length > 0) {
      const primaryKeyword = targetKeywords[0];
      if (primaryKeyword) {
        (analysis as unknown as Record<string, unknown>).keywords = {
          primaryKeyword: primaryKeyword,
          secondaryKeywords: targetKeywords.slice(1),
        };
      }
    }

    // 6. Generate optimization suggestions
    const suggestions =
      (
        (analysis as unknown as Record<string, unknown>).suggestions as Array<
          Record<string, unknown>
        >
      )?.map((suggestion: Record<string, unknown>) => ({
        type: suggestion.type,
        priority: suggestion.priority,
        message: suggestion.message,
        action: suggestion.action,
        estimatedImpact: `+${suggestion.impact}% score improvement`,
      })) ?? [];

    // 7. Return analysis results
    return NextResponse.json({
      success: true,
      data: {
        content: analysis.content,
        scores: {
          overall:
            (
              (analysis as unknown as Record<string, unknown>).score as Record<
                string,
                unknown
              >
            )?.overall ?? analysis.optimizationScore,
          keyword:
            (
              (analysis as unknown as Record<string, unknown>).score as Record<
                string,
                unknown
              >
            )?.keyword ?? 0,
          readability:
            (
              (analysis as unknown as Record<string, unknown>).score as Record<
                string,
                unknown
              >
            )?.readability ?? 0,
          structure:
            (
              (analysis as unknown as Record<string, unknown>).score as Record<
                string,
                unknown
              >
            )?.structure ?? 0,
          technical:
            (
              (analysis as unknown as Record<string, unknown>).score as Record<
                string,
                unknown
              >
            )?.technical ?? 0,
        },
        keywords: {
          detected:
            (
              (analysis as unknown as Record<string, unknown>)
                .keywords as Record<string, unknown>
            )?.lsiKeywords ?? analysis.keywords,
          density:
            (
              (analysis as unknown as Record<string, unknown>)
                .keywords as Record<string, unknown>
            )?.density ?? {},
          recommendations:
            (
              (analysis as unknown as Record<string, unknown>)
                .keywords as Record<string, unknown>
            )?.recommendations ?? [],
        },
        readability: {
          score:
            (
              (analysis as unknown as Record<string, unknown>)
                .readability as Record<string, unknown>
            )?.score ?? 0,
          level:
            (
              (analysis as unknown as Record<string, unknown>)
                .readability as Record<string, unknown>
            )?.level ?? 'unknown',
          metrics: {
            avgSentenceLength:
              (
                (analysis as unknown as Record<string, unknown>)
                  .readability as Record<string, unknown>
              )?.avgWordsPerSentence ?? 0,
            complexWords:
              (
                (analysis as unknown as Record<string, unknown>)
                  .readability as Record<string, unknown>
              )?.complexWordCount ?? 0,
            readingEase:
              (
                (analysis as unknown as Record<string, unknown>)
                  .readability as Record<string, unknown>
              )?.fleschReading ?? 0,
          },
        },
        structure: {
          headings:
            (
              (analysis as unknown as Record<string, unknown>)
                .structure as Record<string, unknown>
            )?.headings ?? [],
          paragraphs:
            (
              (analysis as unknown as Record<string, unknown>)
                .structure as Record<string, unknown>
            )?.paragraphCount ?? 0,
          hasProperHierarchy:
            (
              (analysis as unknown as Record<string, unknown>)
                .structure as Record<string, unknown>
            )?.hasProperHierarchy ?? false,
        },
        suggestions,
        metadata: {
          title: analysis.metadata?.title || '',
          description: analysis.metadata?.description || '',
          recommendedKeywords: analysis.metadata?.keywords ?? [],
        },
      },
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

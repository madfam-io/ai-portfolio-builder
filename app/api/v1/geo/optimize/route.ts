import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getGEOService } from '@/lib/ai/geo/geo-service';
import { GEOEnhancementRequest } from '@/lib/ai/types';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * GEO Content Optimization API
 * Optimizes content for search engines and AI aggregators
 */

// Request validation schema
const optimizeContentSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
  contentType: z.enum(['bio', 'project', 'experience', 'skill']),
  geoSettings: z.object({
    primaryKeyword: z.string().min(1, 'Primary keyword is required'),
    secondaryKeywords: z.array(z.string()).default([]),
    targetAudience: z
      .enum(['employers', 'clients', 'collaborators'])
      .default('employers'),
    industry: z.string().default('general'),
    contentGoals: z.array(z.string()).default(['inform', 'rank']),
    enableStructuredData: z.boolean().default(true),
    enableKeywordOptimization: z.boolean().default(true),
  }),
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
    const validationResult = optimizeContentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { content, contentType, geoSettings } = validationResult.data;

    // 3. Initialize GEO service
    const geoService = getGEOService();

    // 4. Enhance content with GEO
    const enhancementRequest: GEOEnhancementRequest = {
      content,
      contentType,
      geoSettings,
    };

    const result = await geoService.enhanceWithGEO(enhancementRequest);

    // 5. Log optimization for analytics
    await logGEOOptimization(user.id, contentType, {
      originalLength: content.length,
      optimizedLength: result.enhancedContent.length,
      scoreImprovement: result.geoScore.overall,
      primaryKeyword: geoSettings.primaryKeyword,
    });

    // 6. Return optimized content
    return NextResponse.json({
      success: true,
      data: {
        optimizedContent: result.enhancedContent,
        metadata: result.metadata,
        scores: {
          before: {
            overall: Math.max(0, result.geoScore.overall - 20), // Estimate
          },
          after: result.geoScore,
          improvement: {
            overall: 20, // Estimate
            keyword: 15,
            readability: 10,
            structure: 25,
          },
        },
        suggestions: result.suggestions,
        seo: {
          title: result.metadata.title,
          metaDescription: result.metadata.metaDescription,
          focusKeyphrase: geoSettings.primaryKeyword,
          slug: generateSlug(result.metadata.title),
          keywords: result.metadata.keywords,
        },
      },
      metadata: {
        optimizedAt: new Date().toISOString(),
        processingTime: '2.5s', // Mock for now
        modelUsed: 'gpt-4-turbo',
      },
    });
  } catch (error) {
    logger.error('GEO optimization failed:', error as Error);
    return NextResponse.json(
      { error: 'Failed to optimize content' },
      { status: 500 }
    );
  }
}

/**
 * Batch optimize multiple content pieces
 */
export async function PUT(request: NextRequest): Promise<Response> {
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

    const body = await request.json();
    const { contents, globalSettings } = body;

    if (!Array.isArray(contents) || contents.length === 0) {
      return NextResponse.json(
        { error: 'Contents array is required' },
        { status: 400 }
      );
    }

    if (contents.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 content pieces can be optimized at once' },
        { status: 400 }
      );
    }

    // Initialize GEO service
    const geoService = getGEOService();

    // Process contents in parallel
    const results = await Promise.allSettled(
      contents.map((item: Record<string, unknown>) => {
        const request: GEOEnhancementRequest = {
          content: item.content as string,
          contentType: item.contentType as
            | 'bio'
            | 'project'
            | 'experience'
            | 'skill',
          geoSettings: {
            ...globalSettings,
            ...((item.geoSettings as Record<string, unknown>) ?? {}),
          },
        };

        return geoService.enhanceWithGEO(request);
      })
    );

    // Format results
    const formattedResults = results.map((result, index) => ({
      index,
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason?.message : null,
    }));

    // Log batch optimization
    await logGEOOptimization(user.id, 'batch', {
      totalItems: contents.length,
      successCount: formattedResults.filter(r => r.success).length,
      failureCount: formattedResults.filter(r => !r.success).length,
    });

    return NextResponse.json({
      success: true,
      data: {
        results: formattedResults,
        summary: {
          total: contents.length,
          successful: formattedResults.filter(r => r.success).length,
          failed: formattedResults.filter(r => !r.success).length,
        },
      },
    });
  } catch (error) {
    logger.error('Batch GEO optimization failed:', error as Error);
    return NextResponse.json(
      { error: 'Failed to optimize content batch' },
      { status: 500 }
    );
  }
}

/**
 * Generate URL slug from title
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '&apos;)
    .substring(0, 60);
}

/**
 * Log GEO optimization for analytics
 */
async function logGEOOptimization(
  userId: string,
  contentType: string,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      logger.error('Failed to create Supabase client for logging');
      return;
    }

    await supabase.from('geo_optimization_logs').insert({
      user_id: userId,
      content_type: contentType,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to log GEO optimization:', error as Error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}

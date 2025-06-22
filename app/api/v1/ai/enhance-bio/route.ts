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

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { createClient } from '@/lib/supabase/server';
import { parseJsonBody, errorLogger } from '@/lib/services/error';
import { withAuth, AuthenticatedRequest } from '@/lib/api/middleware/auth';

/**
 * Bio Enhancement API Route
 * Uses open-source AI models to enhance user bios
 */

// Request validation schema
const enhanceBioSchema = z.object({
  bio: z
    .string()
    .min(10, 'Bio must be at least 10 characters')
    .max(1000, 'Bio too long'),
  context: z.object({
    title: z.string().min(1, 'Title is required'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    experience: z
      .array(
        z.object({
          company: z.string(),
          position: z.string(),
          yearsExperience: z.number().min(0),
        })
      )
      .optional()
      .default([]),
    industry: z.string().optional(),
    tone: z
      .enum(['professional', 'casual', 'creative'])
      .default('professional'),
    targetLength: z
      .enum(['concise', 'detailed', 'comprehensive'])
      .default('concise'),
  }),
});

async function handlePOST(
  request: AuthenticatedRequest
): Promise<NextResponse> {
  // 1. Get authenticated user from middleware
  const { user } = request;

  // 2. Get database connection
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database service unavailable',
        code: 'DATABASE_ERROR',
      },
      { status: 503 }
    );
  }

  // 3. Validate request body
  try {
    const body = await parseJsonBody(request);
    const validationResult = enhanceBioSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { bio, context } = validationResult.data;

    // 4. Check AI usage limits
    const { data: canUseAI, error: limitsError } = await supabase.rpc(
      'increment_ai_usage',
      { user_uuid: user.id }
    );

    if (limitsError) {
      errorLogger.logError(limitsError, {
        action: 'check_ai_limits',
        userId: user.id,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to check AI usage limits',
          code: 'LIMITS_CHECK_ERROR',
        },
        { status: 500 }
      );
    }

    if (!canUseAI) {
      return NextResponse.json(
        {
          success: false,
          error:
            'AI usage limit exceeded. Please upgrade your plan to continue.',
          code: 'AI_LIMIT_EXCEEDED',
        },
        { status: 403 }
      );
    }

    // 5. Initialize AI service
    const aiService = new HuggingFaceService();

    // 6. Check service health
    const isHealthy = await aiService.healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI service temporarily unavailable',
          code: 'AI_SERVICE_UNAVAILABLE',
        },
        { status: 503 }
      );
    }

    // 7. Enhance bio using AI
    const enhancedContent = await aiService.enhanceBio(bio, context);

    // 8. Log usage for analytics
    await logAIUsage(user.id, 'bio_enhancement', {
      originalLength: bio.length,
      enhancedLength: enhancedContent.content.length,
      qualityScore: enhancedContent.qualityScore,
      confidence: enhancedContent.confidence,
    });

    // 9. Return enhanced content
    return NextResponse.json({
      success: true,
      data: enhancedContent,
      metadata: {
        originalLength: bio.length,
        enhancedLength: enhancedContent.content.length,
        processingTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    errorLogger.logError(error as Error, {
      action: 'enhance_bio',
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to enhance bio',
        code: 'ENHANCEMENT_ERROR',
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handlePOST);

/**
 * Get enhancement history for user
 */
async function handleGET(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const { user } = request;
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database service unavailable',
          code: 'DATABASE_ERROR',
        },
        { status: 503 }
      );
    }

    // Get user's AI usage history
    const { data: usageHistory, error } = await supabase
      .from('ai_usage_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('operation_type', 'bio_enhancement')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error != null) {
      errorLogger.logError(error, {
        action: 'fetch_ai_usage_history',
        userId: user.id,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch usage history',
          code: 'HISTORY_FETCH_ERROR',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        history: usageHistory,
        totalEnhancements: usageHistory?.length || 0,
      },
    });
  } catch (error) {
    errorLogger.logError(error as Error, {
      action: 'get_enhancement_history',
      userId: request.user.id,
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get enhancement history',
        code: 'GET_HISTORY_ERROR',
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handleGET);

/**
 * Log AI usage for analytics and billing
 */
async function logAIUsage(
  userId: string,
  operationType: string,
  metadata: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    if (!supabase) {
      errorLogger.logWarning('Failed to create Supabase client for logging');
      return;
    }

    const { error } = await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      operation_type: operationType,
      metadata,
      created_at: new Date().toISOString(),
    });

    if (error) {
      errorLogger.logWarning('Failed to log AI usage', {
        userId,
        action: operationType,
        metadata: { error },
      });
    }
  } catch (error) {
    errorLogger.logWarning('Failed to log AI usage', {
      userId,
      action: operationType,
      metadata: { error },
    });
    // Don't throw - logging failure shouldn't break the main operation
  }
}

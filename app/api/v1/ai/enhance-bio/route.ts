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
import { parseJsonBody, errorLogger } from '@/lib/services/error';
import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { getCurrentUser } from '@/lib/auth/session';

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
  // 1. Get user from session
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'User not authenticated',
        code: 'AUTH_ERROR',
      },
      { status: 401 }
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
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { bio, context } = validationResult.data;

    // 4. Check AI usage limits (simplified check)
    const canUseAI = user.aiRequestsCount < 100; // Basic limit check

    if (!canUseAI) {
      return NextResponse.json(
        {
          success: false,
          error: 'AI usage limit exceeded',
          code: 'USAGE_LIMIT_EXCEEDED',
        },
        { status: 429 }
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
    const { user: _user } = request;
    const supabase = await getCurrentUser();

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

    // Note: AI usage history logging would be implemented here with Prisma
    // For now, skipping detailed usage tracking
    const usageHistory: any[] = [];

    // No error handling needed for the mock data above

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
    // TODO: Implement AI usage logging with Prisma
    console.log('AI Usage:', {
      userId,
      operationType,
      metadata,
      timestamp: new Date().toISOString(),
    });

    // No error handling needed for console logging
  } catch (error) {
    errorLogger.logWarning('Failed to log AI usage', {
      userId,
      action: operationType,
      metadata: { error },
    });
    // Don't throw - logging failure shouldn't break the main operation
  }
}

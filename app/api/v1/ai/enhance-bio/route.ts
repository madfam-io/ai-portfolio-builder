import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { createClient } from '@/lib/supabase/server';
import {
  createApiHandler,
  parseJsonBody,
  ValidationError,
  AuthenticationError,
  ExternalServiceError,
  errorLogger,
} from '@/lib/services/error';

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

export const POST = createApiHandler(async (request: NextRequest) => {
  // 1. Authenticate user
  const supabase = await createClient();
  if (!supabase) {
    throw new ExternalServiceError(
      'Supabase',
      new Error('Database connection failed')
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthenticationError();
  }

  // 2. Validate request body
  const body = await parseJsonBody(request);
  const validationResult = enhanceBioSchema.safeParse(body);

  if (!validationResult.success) {
    throw new ValidationError('Invalid request data', {
      errors: validationResult.error.errors,
    });
  }

  const { bio, context } = validationResult.data;

  // 3. Check AI usage limits
  const { data: canUseAI, error: limitsError } = await supabase.rpc(
    'increment_ai_usage',
    { user_uuid: user.id }
  );

  if (limitsError) {
    errorLogger.logError(limitsError, {
      action: 'check_ai_limits',
      userId: user.id,
    });
    throw new ExternalServiceError('Database', limitsError);
  }

  if (!canUseAI) {
    return NextResponse.json(
      {
        success: false,
        error: 'AI usage limit exceeded. Please upgrade your plan to continue.',
        code: 'AI_LIMIT_EXCEEDED',
      },
      { status: 403 }
    );
  }

  // 4. Initialize AI service
  const aiService = new HuggingFaceService();

  // 5. Check service health
  const isHealthy = await aiService.healthCheck();
  if (!isHealthy) {
    throw new ExternalServiceError(
      'HuggingFace',
      new Error('AI service temporarily unavailable')
    );
  }

  // 6. Enhance bio using AI
  const enhancedContent = await aiService.enhanceBio(bio, context);

  // 7. Log usage for analytics
  await logAIUsage(user.id, 'bio_enhancement', {
    originalLength: bio.length,
    enhancedLength: enhancedContent.content.length,
    qualityScore: enhancedContent.qualityScore,
    confidence: enhancedContent.confidence,
  });

  // 8. Return enhanced content
  return NextResponse.json({
    success: true,
    data: enhancedContent,
    metadata: {
      originalLength: bio.length,
      enhancedLength: enhancedContent.content.length,
      processingTime: new Date().toISOString(),
    },
  });
});

/**
 * Get enhancement history for user
 */
export const GET = createApiHandler(async () => {
  const supabase = await createClient();
  if (!supabase) {
    throw new ExternalServiceError(
      'Supabase',
      new Error('Database connection failed')
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new AuthenticationError();
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
    throw new ExternalServiceError('Supabase', error);
  }

  return NextResponse.json({
    success: true,
    data: {
      history: usageHistory,
      totalEnhancements: usageHistory?.length || 0,
    },
  });
});

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

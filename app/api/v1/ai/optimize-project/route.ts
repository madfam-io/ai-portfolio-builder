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

import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { AIServiceError, QuotaExceededError } from '@/lib/ai/types';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

/**
 * Project Optimization API Route
 * Uses open-source AI models to enhance project descriptions
 */

// Simple AI usage logging function - defined at the bottom of file to avoid duplication

// Request validation schema
const optimizeProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Project title is required')
    .max(100, 'Title too long'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description too long'),
  technologies: z
    .array(z.string())
    .min(1, 'At least one technology is required'),
  context: z
    .object({
      industry: z.string().optional(),
      projectType: z
        .enum(['web', 'mobile', 'desktop', 'api', 'ai/ml', 'other'])
        .optional(),
      targetAudience: z
        .enum(['employers', 'clients', 'collaborators'])
        .default('employers'),
      emphasize: z
        .enum(['technical', 'business', 'creative'])
        .default('technical'),
    })
    .optional()
    .default({}),
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

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const validationResult = optimizeProjectSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const {
      title: _title,
      description,
      technologies,
      context,
    } = validationResult.data;

    // 3. Check AI usage limits
    const { data: canUseAI, error: limitsError } = await supabase.rpc(
      'increment_ai_usage',
      { user_uuid: user.id }
    );

    if (limitsError) {
      logger.error('Failed to check AI limits', {
        error: limitsError,
        userId: user.id,
      });
      return NextResponse.json(
        { error: 'Failed to check usage limits' },
        { status: 500 }
      );
    }

    if (!canUseAI) {
      return NextResponse.json(
        {
          error:
            'AI usage limit exceeded. Please upgrade your plan to continue.',
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
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    // 6. Optimize project description using AI
    const optimizedProject = await aiService.optimizeProjectDescription(
      description,
      technologies,
      context?.industry
    );

    // 7. Score the optimized content
    const qualityScore = await aiService.scoreContent(
      optimizedProject.enhanced,
      'project'
    );

    // 8. Log usage for analytics
    await logAIUsage(user.id, 'project_optimization', {
      originalLength: description.length,
      optimizedLength: optimizedProject.enhanced.length,
      technologiesCount: technologies.length,
      qualityScore: qualityScore.overall,
      context,
    });

    // 9. Return optimized content
    return NextResponse.json({
      success: true,
      data: {
        ...optimizedProject,
        qualityScore,
      },
      metadata: {
        originalLength: description.length,
        optimizedLength: optimizedProject.enhanced.length,
        improvementSuggestions: qualityScore.suggestions,
        processingTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error(
      'Project optimization failed',
      error instanceof Error ? error : { error }
    );

    // Handle specific AI service errors
    if (error instanceof AIServiceError) {
      return NextResponse.json(
        {
          error: 'AI processing failed',
          message: error.message,
          retryable: error.retryable,
        },
        { status: error.retryable ? 503 : 500 }
      );
    }

    if (error instanceof QuotaExceededError) {
      return NextResponse.json(
        { error: 'AI service quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Batch optimize multiple projects
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

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projects } = body;

    if (!Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json(
        { error: 'Projects array is required' },
        { status: 400 }
      );
    }

    if (projects.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 projects can be optimized at once' },
        { status: 400 }
      );
    }

    // Validate each project
    const validationResults = projects.map(project =>
      optimizeProjectSchema.safeParse(project)
    );

    const hasValidationErrors = validationResults.some(
      result => !result.success
    );
    if (hasValidationErrors) {
      return NextResponse.json(
        {
          error: 'Invalid project data',
          details: validationResults
            .filter(result => !result.success)
            .map(result => result.error?.errors),
        },
        { status: 400 }
      );
    }

    // Initialize AI service
    const aiService = new HuggingFaceService();

    // Check service health
    const isHealthy = await aiService.healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Process projects in parallel (with concurrency limit)
    const optimizedProjects = await Promise.allSettled(
      validationResults.map(async (result, index) => {
        if (!result.success) return null;

        const { title: _title, description, technologies } = result.data;

        const optimized = await aiService.optimizeProjectDescription(
          description,
          technologies
        );

        const qualityScore = await aiService.scoreContent(
          optimized.enhanced,
          'project'
        );

        return {
          index,
          original: projects[index],
          optimized,
          qualityScore,
        };
      })
    );

    // Log batch usage
    await logAIUsage(user.id, 'batch_project_optimization', {
      projectCount: projects.length,
      successCount: optimizedProjects.filter(p => p.status === 'fulfilled')
        .length,
      failureCount: optimizedProjects.filter(p => p.status === 'rejected')
        .length,
    });

    // Return results
    return NextResponse.json({
      success: true,
      data: {
        results: optimizedProjects.map(result => ({
          success: result.status === 'fulfilled',
          data: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason?.message : null,
        })),
        summary: {
          total: projects.length,
          successful: optimizedProjects.filter(p => p.status === 'fulfilled')
            .length,
          failed: optimizedProjects.filter(p => p.status === 'rejected').length,
        },
      },
    });
  } catch (error) {
    logger.error(
      'Batch project optimization failed',
      error instanceof Error ? error : { error }
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
      logger.error('Failed to create Supabase client for logging');
      return;
    }

    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      operation_type: operationType,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      'Failed to log AI usage',
      error instanceof Error ? error : { error }
    );
    // Don't throw - logging failure shouldn't break the main operation
  }
}

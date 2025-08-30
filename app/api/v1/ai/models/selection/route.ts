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

import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';

/**
 * AI Model Selection API Route
 * Manages user's AI model preferences
 */

// Request validation schema
const updateSelectionSchema = z.object({
  taskType: z.enum(['bio', 'project', 'template', 'scoring']),
  modelId: z.string().min(1, 'Model ID is required'),
});

/**
 * Get user's current model selection
 */
export async function GET(): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      // Return default model selection for unauthenticated users
      const defaultSelection = {
        bio: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        project: 'microsoft/Phi-3.5-mini-instruct',
        template: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        scoring: 'microsoft/DialoGPT-medium',
      };

      return NextResponse.json({
        success: true,
        data: defaultSelection,
        isDefault: true,
      });
    }

    // Get user's model preferences from database
    const preferences = await prisma.userModelPreferences.findUnique({
      where: { userId: user.id },
    });

    // Return user preferences or defaults
    const modelSelection = preferences
      ? {
          bio: preferences.bio,
          project: preferences.project,
          template: preferences.template,
          scoring: preferences.scoring,
        }
      : {
          bio: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
          project: 'microsoft/Phi-3.5-mini-instruct',
          template: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
          scoring: 'microsoft/DialoGPT-medium',
        };

    return NextResponse.json({
      success: true,
      data: modelSelection,
      isDefault: preferences === null || preferences === undefined,
    });
  } catch (error) {
    logger.error(
      'Failed to get model selection',
      error instanceof Error ? error : { error }
    );
    return NextResponse.json(
      { error: 'Failed to get model selection' },
      { status: 500 }
    );
  }
}

/**
 * Update user's model preference for a specific task
 */
export async function PUT(request: NextRequest): Promise<Response> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validationResult = updateSelectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { taskType, modelId } = validationResult.data;

    // Prepare update data based on task type
    const updateData: Record<string, any> = {
      [taskType]: modelId,
      updatedAt: new Date(),
    };

    // Upsert the preferences
    const updatedPreferences = await prisma.userModelPreferences.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        bio:
          taskType === 'bio'
            ? modelId
            : 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        project:
          taskType === 'project' ? modelId : 'microsoft/Phi-3.5-mini-instruct',
        template:
          taskType === 'template'
            ? modelId
            : 'meta-llama/Meta-Llama-3.1-8B-Instruct',
        scoring: taskType === 'scoring' ? modelId : 'microsoft/DialoGPT-medium',
      },
    });

    // Log the model selection change for analytics
    await logModelSelection(user.id, taskType, modelId);

    return NextResponse.json({
      success: true,
      data: {
        taskType,
        modelId,
        preferences: {
          bio: updatedPreferences.bio,
          project: updatedPreferences.project,
          template: updatedPreferences.template,
          scoring: updatedPreferences.scoring,
        },
      },
    });
  } catch (error) {
    logger.error(
      'Failed to update model selection',
      error instanceof Error ? error : { error }
    );
    return NextResponse.json(
      { error: 'Failed to update model selection' },
      { status: 500 }
    );
  }
}

/**
 * Log model selection for analytics
 */
async function logModelSelection(
  userId: string,
  taskType: string,
  modelId: string
): Promise<void> {
  try {
    await prisma.aiUsageLog.create({
      data: {
        userId,
        operationType: 'model_selection_change',
        taskType,
        modelId,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    logger.error(
      'Failed to log model selection',
      error instanceof Error ? error : { error }
    );
    // Don't throw - logging failure shouldn't break the main operation
  }
}

/**
 * AI Model Selection API Route
 * Manages user's AI model preferences
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

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
    const { data: preferences, error } = await supabase
      .from('user_model_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned
      throw error;
    }

    // Return user preferences or defaults
    const modelSelection = preferences?.preferences || {
      bio: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      project: 'microsoft/Phi-3.5-mini-instruct',
      template: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      scoring: 'microsoft/DialoGPT-medium',
    };

    return NextResponse.json({
      success: true,
      data: modelSelection,
      isDefault: !preferences,
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

    // Validate request body
    const body = await request.json();
    const validationResult = updateSelectionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { taskType, modelId } = validationResult.data;

    // Get current preferences
    const { data: currentPreferences } = await supabase
      .from('user_model_preferences')
      .select('preferences')
      .eq('user_id', user.id)
      .single();

    // Update the specific task type
    const updatedPreferences = {
      ...(currentPreferences?.preferences || {}),
      [taskType]: modelId,
    };

    // Upsert the preferences
    const { error } = await supabase.from('user_model_preferences').upsert(
      {
        user_id: user.id,
        preferences: updatedPreferences,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id',
      }
    );

    if (error) {
      throw error;
    }

    // Log the model selection change for analytics
    await logModelSelection(user.id, taskType, modelId);

    return NextResponse.json({
      success: true,
      data: {
        taskType,
        modelId,
        preferences: updatedPreferences,
      },
    });
  } catch (error: any) {
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
    const supabase = await createClient();
    if (!supabase) {
      logger.error('Failed to create Supabase client for logging');
      return;
    }

    await supabase.from('ai_usage_logs').insert({
      user_id: userId,
      operation_type: 'model_selection_change',
      metadata: {
        taskType,
        modelId,
        timestamp: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.error(
      'Failed to log model selection',
      error instanceof Error ? error : { error }
    );
    // Don't throw - logging failure shouldn't break the main operation
  }
}

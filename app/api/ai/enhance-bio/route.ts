/**
 * Bio Enhancement API Route
 * Uses open-source AI models to enhance user bios
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { BioContext } from '@/lib/ai/types';
import { z } from 'zod';

// Request validation schema
const enhanceBioSchema = z.object({
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(1000, 'Bio too long'),
  context: z.object({
    title: z.string().min(1, 'Title is required'),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      yearsExperience: z.number().min(0),
    })).optional().default([]),
    industry: z.string().optional(),
    tone: z.enum(['professional', 'casual', 'creative']).default('professional'),
    targetLength: z.enum(['concise', 'detailed', 'comprehensive']).default('concise'),
  }),
});

type EnhanceBioRequest = z.infer<typeof enhanceBioSchema>;

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 2. Validate request body
    const body = await request.json();
    const validationResult = enhanceBioSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    const { bio, context } = validationResult.data;

    // 3. Initialize AI service
    const aiService = new HuggingFaceService();
    
    // 4. Check service health
    const isHealthy = await aiService.healthCheck();
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }

    // 5. Enhance bio using AI
    const enhancedContent = await aiService.enhanceBio(bio, context);

    // 6. Log usage for analytics
    await logAIUsage(user.id, 'bio_enhancement', {
      originalLength: bio.length,
      enhancedLength: enhancedContent.content.length,
      qualityScore: enhancedContent.qualityScore,
      confidence: enhancedContent.confidence,
    });

    // 7. Return enhanced content
    return NextResponse.json({
      success: true,
      data: enhancedContent,
      metadata: {
        originalLength: bio.length,
        enhancedLength: enhancedContent.content.length,
        processingTime: new Date().toISOString(),
      }
    });

  } catch (error: any) {
    console.error('Bio enhancement failed:', error);

    // Handle specific AI service errors
    if (error.name === 'AIServiceError') {
      return NextResponse.json(
        { 
          error: 'AI processing failed', 
          message: error.message,
          retryable: error.retryable 
        },
        { status: error.retryable ? 503 : 500 }
      );
    }

    if (error.name === 'QuotaExceededError') {
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
 * Get enhancement history for user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        history: usageHistory,
        totalEnhancements: usageHistory?.length || 0,
      }
    });

  } catch (error) {
    console.error('Failed to fetch enhancement history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
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
  metadata: Record<string, any>
) {
  try {
    const supabase = await createClient();
    
    await supabase
      .from('ai_usage_logs')
      .insert({
        user_id: userId,
        operation_type: operationType,
        metadata,
        created_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error('Failed to log AI usage:', error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}
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
import { redisRateLimitMiddleware } from '@/lib/api/middleware/redis-rate-limiter';
import { logger } from '@/lib/utils/logger';

// Validation schema for satisfaction survey
const surveySchema = z.object({
  overallSatisfaction: z.number().min(1).max(10),
  easeOfUse: z.number().min(1).max(10),
  performance: z.number().min(1).max(10),
  features: z.number().min(1).max(10),
  design: z.number().min(1).max(10),
  likelihoodToRecommend: z.number().min(1).max(10), // NPS
  mostUsefulFeature: z.string().min(1).max(500),
  leastUsefulFeature: z.string().min(1).max(500),
  missingFeatures: z.array(z.string()).default([]),
  additionalComments: z.string().max(2000).optional(),
  completionContext: z.enum(['after_publish', 'weekly_prompt', 'manual']),
});

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'anonymous';

  try {
    // Rate limiting - one survey per week per user
    const rateLimitResponse = await redisRateLimitMiddleware(request, {
      windowMs: 7 * 24 * 60 * 60 * 1000, // 1 week
      max: 1, // 1 per week
      message: 'You can only submit one survey per week.',
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = surveySchema.parse(body);

    // Calculate NPS category
    const nps = validatedData.likelihoodToRecommend;
    const npsCategory =
      nps >= 9 ? 'promoter' : nps >= 7 ? 'passive' : 'detractor';

    // For now, store in memory (replace with database)
    const surveyId = `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log survey submission
    logger.info('Satisfaction survey received', {
      surveyId,
      userId,
      npsScore: nps,
      npsCategory,
      overallSatisfaction: validatedData.overallSatisfaction,
      completionContext: validatedData.completionContext,
      feature: 'feedback_system',
      action: 'survey_completed',
    });

    // Calculate response message based on NPS
    let message = 'Thank you for your feedback!';
    if (npsCategory === 'promoter') {
      message =
        "Thank you so much for your positive feedback! We're thrilled you love PRISMA.";
    } else if (npsCategory === 'detractor') {
      message =
        "Thank you for your honest feedback. We'll work hard to improve your experience.";
    }

    return NextResponse.json({
      success: true,
      surveyId,
      message,
      npsCategory,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid survey data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Failed to submit survey', error as Error, {
      feature: 'feedback_system',
      userId,
    });
    return NextResponse.json(
      { error: 'Failed to submit survey. Please try again.' },
      { status: 500 }
    );
  }
}

// Get survey analytics for admin dashboard (placeholder)
export function GET(request: NextRequest) {
  // Check admin permissions
  const isAdmin = request.headers.get('x-admin') === 'true';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get('days') || '30');

  // Return placeholder analytics
  return NextResponse.json({
    summary: {
      totalResponses: 0,
      npsScore: 0,
      averageScores: {
        overallSatisfaction: null,
        easeOfUse: null,
        performance: null,
        features: null,
        design: null,
        likelihoodToRecommend: null,
      },
      npsBreakdown: {
        promoters: 0,
        passives: 0,
        detractors: 0,
      },
    },
    recentSurveys: [],
    commonThemes: [],
    timeframe: `Last ${days} days`,
  });
}

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

// Validation schema
const feedbackSchema = z.object({
  type: z.enum([
    'bug',
    'feature_request',
    'improvement',
    'general',
    'usability',
  ]),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  rating: z.number().min(1).max(5).optional(),
  reproductionSteps: z.array(z.string()).optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  userAgent: z.string(),
  url: z.string(),
  userContext: z
    .object({
      plan: z.string(),
      accountAge: z.number(),
      portfoliosCreated: z.number(),
      lastActivity: z.string().transform(val => new Date(val)),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'anonymous';

  try {
    // Rate limiting
    const rateLimitResponse = await redisRateLimitMiddleware(request, {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 requests per hour
      message: 'Too many feedback submissions. Please try again later.',
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = feedbackSchema.parse(body);

    // For now, store in memory (replace with database)
    const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Log feedback submission
    logger.info('Feedback received', {
      feedbackId,
      type: validatedData.type,
      severity: validatedData.severity,
      userId,
      feature: 'feedback_system',
    });

    // Send notification to team for critical issues
    if (validatedData.severity === 'critical' || validatedData.type === 'bug') {
      logger.warn('Critical feedback received', {
        feedbackId,
        type: validatedData.type,
        severity: validatedData.severity,
        title: validatedData.title,
        feature: 'feedback_system',
      });
    }

    return NextResponse.json({
      success: true,
      feedbackId,
      message: "Thank you for your feedback! We'll review it shortly.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Failed to submit feedback', error as Error, {
      feature: 'feedback_system',
      userId,
    });
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    );
  }
}

// Get feedback for admin dashboard (placeholder)
export function GET(request: NextRequest) {
  // Check admin permissions
  const isAdmin = request.headers.get('x-admin') === 'true';

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Return placeholder data
  return NextResponse.json({
    feedback: [],
    total: 0,
    limit: 20,
    offset: 0,
  });
}

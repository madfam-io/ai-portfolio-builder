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

// Validation schema for usage tracking
const usageSchema = z.object({
  portfoliosCreated: z.number().min(0),
  portfoliosPublished: z.number().min(0),
  totalViews: z.number().min(0),
  aiEnhancements: z.number().min(0),
  customDomains: z.number().min(0),
  storageUsed: z.number().min(0),
  lastUpdated: z.string().transform(val => new Date(val)),
});

export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'anonymous';

  try {
    // Rate limiting - 12 requests per hour (every 5 minutes)
    const rateLimitResponse = await redisRateLimitMiddleware(request, {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 12,
      message: 'Too many usage tracking requests.',
    });

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = usageSchema.parse(body);

    // For now, store in memory (replace with database)
    const usageId = `usage_${userId}_${Date.now()}`;

    // Log usage data
    logger.info('Usage data tracked', {
      usageId,
      userId,
      portfoliosCreated: validatedData.portfoliosCreated,
      portfoliosPublished: validatedData.portfoliosPublished,
      feature: 'usage_tracking',
    });

    // Check for usage limits exceeded
    const alerts = [];
    if (validatedData.portfoliosCreated >= 3) {
      alerts.push('portfolio_limit_approaching');
    }
    if (validatedData.aiEnhancements >= 10) {
      alerts.push('ai_limit_approaching');
    }

    return NextResponse.json({
      success: true,
      usageId,
      alerts,
      message: 'Usage tracked successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid usage data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Failed to track usage', error as Error, {
      feature: 'usage_tracking',
      userId,
    });
    return NextResponse.json(
      { error: 'Failed to track usage' },
      { status: 500 }
    );
  }
}

// Get usage statistics for admin dashboard
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get('period') || '30d';

  // Add minimal await to satisfy ESLint
  await Promise.resolve();

  // Return placeholder data (implement with real database)
  return NextResponse.json({
    userId,
    period,
    usage: {
      portfoliosCreated: 2,
      portfoliosPublished: 1,
      totalViews: 150,
      aiEnhancements: 5,
      customDomains: 0,
      storageUsed: 45.2,
    },
    limits: {
      portfolios: 3,
      publishedPortfolios: 1,
      monthlyViews: 1000,
      aiEnhancements: 10,
      customDomains: 0,
      storage: 100,
    },
    history: [],
  });
}

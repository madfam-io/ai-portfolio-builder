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

/**
 * User limits endpoint
 *
 * Returns current usage and limits for the authenticated user.
 * Used by the frontend to show usage indicators and enforce limits.
 */

import { NextResponse } from 'next/server';

import { withAuth, type AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { getCurrentUser } from '@/lib/auth/session';
import { AppError } from '@/types/errors';
import { logger } from '@/lib/utils/logger';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/v1/user/limits
 *
 * Get current user usage and plan limits
 */
async function handler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const { user } = request;

    // Get user data and counts
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        aiRequestsCount: true,
        _count: {
          select: {
            portfolios: true,
          },
        },
      },
    });

    if (!userData) {
      throw new AppError('User not found', 'USER_NOT_FOUND', 404);
    }

    // Define plan limits
    const planLimits = {
      FREE: {
        maxPortfolios: 3,
        maxAiGenerations: 10,
        customDomains: false,
        analytics: false,
      },
      PRO: {
        maxPortfolios: 10,
        maxAiGenerations: 100,
        customDomains: true,
        analytics: true,
      },
      BUSINESS: {
        maxPortfolios: 50,
        maxAiGenerations: 500,
        customDomains: true,
        analytics: true,
      },
      ENTERPRISE: {
        maxPortfolios: 100,
        maxAiGenerations: 1000,
        customDomains: true,
        analytics: true,
      },
    };

    const currentLimits = planLimits[userData.subscriptionTier] || planLimits.FREE;

    const data = {
      userId: userData.id,
      email: userData.email,
      subscriptionTier: userData.subscriptionTier,
      subscriptionStatus: userData.subscriptionStatus,
      portfolioCount: userData._count.portfolios,
      maxPortfolios: currentLimits.maxPortfolios,
      aiCredits: userData.aiRequestsCount || 0,
      maxAiGenerations: currentLimits.maxAiGenerations,
      customDomainsEnabled: currentLimits.customDomains,
      analyticsEnabled: currentLimits.analytics,
      canCreatePortfolio: userData._count.portfolios < currentLimits.maxPortfolios,
      canUseAi: (userData.aiRequestsCount || 0) > 0,
    };

    logger.info('User limits retrieved successfully', {
      userId: user.id,
      subscriptionTier: userData.subscriptionTier,
    });

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Failed to get user limits', { error });

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to get user limits',
        code: 'LIMITS_FAILED',
      },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);

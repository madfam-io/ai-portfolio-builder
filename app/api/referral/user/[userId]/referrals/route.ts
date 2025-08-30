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
 * @fileoverview User Referrals API Route
 *
 * Handles fetching a user's referrals with filtering and pagination support.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/api/middleware/observability';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';

async function getUserReferralsHandler(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate user ID
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify authentication
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Build query with Prisma
    const whereClause: any = {
      referrerId: userId,
    };

    // Apply status filter if provided
    if (status) {
      whereClause.status = status;
    }

    const referrals = await prisma.referral.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });

    // Get total count for pagination
    const count = await prisma.referral.count({
      where: whereClause,
    });

    logger.info('User referrals fetched via API', {
      userId,
      count: referrals?.length || 0,
      total: count,
      status,
    });

    return NextResponse.json({
      referrals,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch user referrals via API', { error });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withObservability(getUserReferralsHandler, {
  trackAnalytics: true,
  trackPerformance: true,
  customAttributes: {
    endpoint: 'user_referrals',
    method: 'GET',
  },
});

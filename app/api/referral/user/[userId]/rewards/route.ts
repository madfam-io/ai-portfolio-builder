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
 * @fileoverview User Referral Rewards API Route
 *
 * Handles fetching a user's referral rewards with filtering and status tracking.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/api/middleware/observability';
import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
import { logger } from '@/lib/utils/logger';

async function getUserRewardsHandler(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const type = searchParams.get('type');
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query with Prisma
    const whereClause: any = {
      userId: userId,
    };

    // Apply filters if provided
    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.type = type;
    }

    const rewards = await prisma.referralReward.findMany({
      where: whereClause,
      include: {
        referral: {
          select: {
            id: true,
            code: true,
            refereeId: true,
            campaign: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: offset,
      take: limit,
    });


    // Get total count for pagination
    const count = await prisma.referralReward.count({
      where: whereClause,
    });

    // Calculate summary statistics
    const summary = {
      total_earned: 0,
      total_paid: 0,
      pending_amount: 0,
      by_type: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
    };

    rewards.forEach(reward => {
      summary.by_type[reward.type] =
        (summary.by_type[reward.type] || 0) + reward.amount;
      summary.by_status[reward.status] =
        (summary.by_status[reward.status] || 0) + reward.amount;

      if (reward.status === 'paid') {
        summary.total_paid += reward.amount;
      }

      if (['pending', 'approved'].includes(reward.status)) {
        summary.pending_amount += reward.amount;
      }

      if (['paid', 'approved'].includes(reward.status)) {
        summary.total_earned += reward.amount;
      }
    });

    logger.info('User rewards fetched via API', {
      userId,
      count: rewards.length,
      total: count,
      totalEarned: summary.total_earned,
    });

    return NextResponse.json({
      rewards,
      summary,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch user rewards via API', { error });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withObservability(getUserRewardsHandler, {
  trackAnalytics: true,
  trackPerformance: true,
  customAttributes: {
    endpoint: 'user_referral_rewards',
    method: 'GET',
  },
});

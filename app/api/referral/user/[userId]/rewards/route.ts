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

import { NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/api/middleware/observability';
import { createClient as createServerClient } from '@/lib/supabase/server';
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

    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to create database client' },
        { status: 500 }
      );
    }

    // Build query
    let query = supabase
      .from('referral_rewards')
      .select(
        `
        *,
        referrals (
          id,
          code,
          referee_id,
          referral_campaigns (
            id,
            name,
            type
          )
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: rewards, error } = await query;

    if (error) {
      logger.error('Failed to fetch user rewards', { error, userId });
      return NextResponse.json(
        { error: 'Failed to fetch rewards' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('referral_rewards')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    if (type) {
      countQuery = countQuery.eq('type', type);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      logger.warn('Failed to get rewards count', { error: countError, userId });
    }

    // Calculate summary statistics
    const summary = {
      total_earned: 0,
      total_paid: 0,
      pending_amount: 0,
      by_type: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
    };

    rewards?.forEach((reward) => {
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
      count: rewards?.length || 0,
      total: count,
      totalEarned: summary.total_earned,
    });

    return NextResponse.json({
      rewards: rewards || [],
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

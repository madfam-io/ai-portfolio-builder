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

import { NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/api/middleware/observability';
import { createClient as createServerClient } from '@/lib/supabase/server';
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

    const supabase = await createServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to create database client' },
        { status: 500 }
      );
    }

    // Build query
    let query = supabase
      .from('referrals')
      .select(
        `
        *,
        referral_campaigns (
          id,
          name,
          type,
          referrer_reward,
          referee_reward
        )
      `
      )
      .eq('referrer_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: referrals, error } = await query;

    if (error) {
      logger.error('Failed to fetch user referrals', { error, userId });
      return NextResponse.json(
        { error: 'Failed to fetch referrals' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('referrals')
      .select('id', { count: 'exact', head: true })
      .eq('referrer_id', userId);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      logger.warn('Failed to get referrals count', {
        error: countError,
        userId,
      });
    }

    logger.info('User referrals fetched via API', {
      userId,
      count: referrals?.length || 0,
      total: count,
      status,
    });

    return NextResponse.json({
      referrals: referrals || [],
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

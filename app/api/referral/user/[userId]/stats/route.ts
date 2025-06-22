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
 * @fileoverview User Referral Statistics API Route
 *
 * Provides comprehensive referral statistics for a user including
 * performance metrics, earnings, and gamification data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/api/middleware/observability';
import { referralEngine } from '@madfam/referral/engine';
import { logger } from '@/lib/utils/logger';

async function getUserStatsHandler(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Validate user ID
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if referral engine is initialized
    if (!referralEngine) {
      return NextResponse.json(
        { error: 'Referral system not configured' },
        { status: 503 }
      );
    }

    // Get user referral statistics
    const stats = await referralEngine.getUserReferralStats(userId);

    logger.info('User referral stats fetched via API', {
      userId,
      totalReferrals: stats.total_referrals,
      conversionRate: stats.conversion_rate,
    });

    return NextResponse.json(stats);
  } catch (error) {
    logger.error('Failed to fetch user referral stats via API', { error });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withObservability(getUserStatsHandler, {
  trackAnalytics: true,
  trackPerformance: true,
  customAttributes: {
    endpoint: 'user_referral_stats',
    method: 'GET',
  },
});

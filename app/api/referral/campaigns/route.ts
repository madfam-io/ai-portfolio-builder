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
 * @fileoverview Referral Campaigns API Route
 *
 * Handles fetching active referral campaigns with user eligibility filtering.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/api/middleware/observability';
import { referralEngine } from '@madfam/referral';
import { logger } from '@/lib/utils/logger';

async function getCampaignsHandler(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    // Get active campaigns, filtered by user eligibility if userId provided
    const campaigns = await referralEngine.getActiveCampaigns(
      userId || undefined
    );

    logger.info('Referral campaigns fetched via API', {
      userId: userId || 'anonymous',
      campaignCount: campaigns.length,
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    logger.error('Failed to fetch referral campaigns via API', { error });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withObservability(getCampaignsHandler, {
  trackAnalytics: true,
  trackPerformance: true,
  customAttributes: {
    endpoint: 'referral_campaigns',
    method: 'GET',
  },
});

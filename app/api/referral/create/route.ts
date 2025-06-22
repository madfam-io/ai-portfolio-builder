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
 * @fileoverview Referral Creation API Route
 *
 * Handles creation of new referrals with comprehensive validation,
 * fraud detection, and analytics tracking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/api/middleware/observability';
import { referralEngine } from '@madfam/referral/engine';
import type { CreateReferralRequest } from '@madfam/referral/types';
import { logger } from '@/lib/utils/logger';

async function createReferralHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      ...referralRequest
    }: { userId: string } & CreateReferralRequest = body;

    // Validate required fields
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

    // Create referral using engine
    const result = await referralEngine.createReferral(userId, referralRequest);

    logger.info('Referral created via API', {
      userId,
      referralId: result.referral.id,
      campaignId: result.referral.campaign_id,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to create referral via API', { error });

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    const statusCode = errorMessage.includes('not eligible')
      ? 403
      : errorMessage.includes('exceeded')
        ? 429
        : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export const POST = withObservability(createReferralHandler, {
  trackAnalytics: true,
  trackPerformance: true,
  customAttributes: {
    endpoint: 'referral_create',
    method: 'POST',
  },
});

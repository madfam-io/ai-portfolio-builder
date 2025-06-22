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
 * @fileoverview Referral Conversion API Route
 *
 * Handles referral conversion when a referee completes the desired action
 * (typically signup). Includes comprehensive fraud detection and reward
 * calculation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/api/middleware/observability';
import { referralEngine } from '@madfam/referral/engine';
import type { ConvertReferralRequest } from '@madfam/referral/types';
import { logger } from '@/lib/utils/logger';

async function convertReferralHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const conversionRequest: ConvertReferralRequest = body;

    // Validate required fields
    if (!conversionRequest.code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    if (!conversionRequest.referee_id) {
      return NextResponse.json(
        { error: 'Referee ID is required' },
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

    // Convert referral using engine
    const result = await referralEngine.convertReferral(conversionRequest);

    logger.info('Referral converted via API', {
      code: conversionRequest.code,
      refereeId: conversionRequest.referee_id,
      referralId: result.referral.id,
      rewardsCreated: result.rewards.length,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to convert referral via API', { error });

    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.name === 'ReferralValidationError') {
        statusCode = 400;
      } else if (error.name === 'FraudDetectionError') {
        statusCode = 403;
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export const POST = withObservability(convertReferralHandler, {
  trackAnalytics: true,
  trackPerformance: true,
  customAttributes: {
    endpoint: 'referral_convert',
    method: 'POST',
  },
});

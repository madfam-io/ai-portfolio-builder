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
 * @fileoverview Referral Click Tracking API Route
 *
 * Handles referral link click tracking with comprehensive attribution,
 * fraud detection, and real-time analytics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withObservability } from '@/lib/api/middleware/observability';
import { referralEngine } from '@madfam/referral/engine';
import type { TrackReferralClickRequest } from '@madfam/referral/types';
import { logger } from '@/lib/utils/logger';

async function trackReferralClickHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const trackingRequest: TrackReferralClickRequest = body;

    // Validate required fields
    if (!trackingRequest.code) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // Extract request metadata for attribution
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const referer = request.headers.get('referer');

    // Enhance attribution data with request context
    const enhancedAttributionData = {
      ...trackingRequest.attribution_data,
      ip_address:
        trackingRequest.attribution_data.ip_address ||
        forwardedFor?.split(',')[0] ||
        realIP ||
        undefined,
      user_agent:
        trackingRequest.attribution_data.user_agent || userAgent || undefined,
      referrer:
        trackingRequest.attribution_data.referrer || referer || undefined,
    };

    // Check if referral engine is initialized
    if (!referralEngine) {
      return NextResponse.json(
        { error: 'Referral system not configured' },
        { status: 503 }
      );
    }

    // Track click using engine
    const result = await referralEngine.trackReferralClick({
      ...trackingRequest,
      attribution_data: enhancedAttributionData,
    });

    logger.info('Referral click tracked via API', {
      code: trackingRequest.code,
      referralId: result.referral_id,
      source: enhancedAttributionData.utm_source,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Failed to track referral click via API', { error });

    const errorMessage =
      error instanceof Error ? error.message : 'Internal server error';
    const statusCode =
      errorMessage.includes('Invalid') || errorMessage.includes('expired')
        ? 404
        : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export const POST = withObservability(trackReferralClickHandler, {
  trackAnalytics: true,
  trackPerformance: true,
  customAttributes: {
    endpoint: 'referral_track',
    method: 'POST',
  },
});

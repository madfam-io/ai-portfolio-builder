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

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { FeatureFlagService } from '@/lib/services/feature-flags/feature-flag-service';
import { logger } from '@/lib/utils/logger';

/**
 * @fileoverview API endpoint for getting active experiment
 * GET /api/v1/experiments/active
 */

/**
 * Get active experiment for current visitor
 */
export async function GET(request: Request): Promise<Response> {
  try {
    // Get visitor context from headers
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';
    const acceptLanguage = headersList.get('accept-language') || '';

    // Get geo data (if available from edge middleware or CDN)
    const country =
      headersList.get('x-vercel-ip-country') ||
      headersList.get('cf-ipcountry') ||
      undefined;

    // Get UTM parameters from URL
    const { searchParams } = new URL(request.url);
    const utmSource = searchParams.get('utm_source') || undefined;

    // Determine device type from user agent
    const device = getDeviceType(userAgent);

    // Extract language preference
    const language = acceptLanguage.split(',')[0]?.split('-')[0] || 'es';

    // Get active experiment
    const experiment = await FeatureFlagService.getActiveExperiment({
      country,
      device,
      language,
      referrer: referer,
      utmSource,
    });

    if (!experiment) {
      return NextResponse.json(null);
    }

    return NextResponse.json(experiment);
  } catch (error) {
    logger.error('Failed to get active experiment', error as Error);
    return NextResponse.json(
      { error: 'Failed to get active experiment' },
      { status: 500 }
    );
  }
}

/**
 * Simple device type detection
 */
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  if (/mobile|android|iphone|ipod/.test(ua)) {
    return 'mobile';
  } else if (/ipad|tablet/.test(ua)) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

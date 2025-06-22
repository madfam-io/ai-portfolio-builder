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
 * Health check API endpoints
 * Provides system health, readiness, and liveness checks
 */

import { NextResponse } from 'next/server';
import { handleHealthCheck } from '@/lib/monitoring/health-check';
import { withErrorTracking } from '@/lib/monitoring/error-tracking';
import { withAPMTracking } from '@/lib/monitoring/apm';

/**
 * GET /api/v1/health - Comprehensive health check
 */
export const GET = withErrorTracking(
  withAPMTracking(() => {
    return handleHealthCheck();
  }, 'health-check'),
  'health-api'
);

/**
 * HEAD /api/v1/health - Quick health check for load balancers
 */
export const HEAD = withErrorTracking(
  withAPMTracking(() => {
    // Quick check without detailed response
    return new NextResponse(null, { status: 200 });
  }, 'health-check-head'),
  'health-api'
);

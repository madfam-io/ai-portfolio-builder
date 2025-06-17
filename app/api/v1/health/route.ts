/**
 * Health check API endpoints
 * Provides system health, readiness, and liveness checks
 */

import { NextResponse } from 'next/server';
import { 
  handleHealthCheck, 
  handleReadinessCheck, 
  handleLivenessCheck 
} from '@/lib/monitoring/health-check';
import { withErrorTracking } from '@/lib/monitoring/error-tracking';
import { withAPMTracking } from '@/lib/monitoring/apm';

/**
 * GET /api/v1/health - Comprehensive health check
 */
export const GET = withErrorTracking(
  withAPMTracking(async () => {
    return await handleHealthCheck();
  }, 'health-check'),
  'health-api'
);

/**
 * HEAD /api/v1/health - Quick health check for load balancers
 */
export const HEAD = withErrorTracking(
  withAPMTracking(async () => {
    // Quick check without detailed response
    return new NextResponse(null, { status: 200 });
  }, 'health-check-head'),
  'health-api'
);
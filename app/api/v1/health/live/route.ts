/**
 * Liveness check endpoint for Kubernetes/Docker
 * Indicates if the application process is alive
 */

import { handleLivenessCheck } from '@/lib/monitoring/health-check';
import { withErrorTracking } from '@/lib/monitoring/error-tracking';
import { withAPMTracking } from '@/lib/monitoring/apm';

/**
 * GET /api/v1/health/live - Liveness probe
 */
export const GET = withErrorTracking(
  withAPMTracking(async () => {
    return handleLivenessCheck();
  }, 'liveness-check'),
  'health-api'
);
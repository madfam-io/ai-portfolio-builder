/**
 * Readiness check endpoint for Kubernetes/Docker
 * Indicates if the application is ready to receive traffic
 */

import { handleReadinessCheck } from '@/lib/monitoring/health-check';
import { withErrorTracking } from '@/lib/monitoring/error-tracking';
import { withAPMTracking } from '@/lib/monitoring/apm';

/**
 * GET /api/v1/health/ready - Readiness probe
 */
export const GET = withErrorTracking(
  withAPMTracking(async () => {
    return handleReadinessCheck();
  }, 'readiness-check'),
  'health-api'
);
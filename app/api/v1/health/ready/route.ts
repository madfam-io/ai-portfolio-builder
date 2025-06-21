/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

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
  withAPMTracking(() => {
    return handleReadinessCheck();
  }, 'readiness-check'),
  'health-api'
);

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
  withAPMTracking(() => {
    return handleLivenessCheck();
  }, 'liveness-check'),
  'health-api'
);

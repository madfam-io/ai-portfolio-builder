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
 * React-specific exports for @madfam/analytics-hub
 */

export { AnalyticsProvider, useAnalyticsContext } from './provider';
export {
  useAnalytics,
  usePageTracking,
  useUserTracking,
  useEventTracker,
  useFormTracking,
  useVisibilityTracking,
  usePerformanceTracking,
  useScrollTracking,
} from './hooks';

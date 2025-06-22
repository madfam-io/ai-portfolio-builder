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
 * Unified Monitoring Interface
 *
 * Combines PostHog analytics and SigNoz APM for complete observability
 */

import { initializePostHog } from '@/lib/analytics/posthog/client';
import { initializeAllMonitoring } from '../index';
import { isOtelEnabled } from '../signoz';

/**
 * Initialize all monitoring systems
 */
export const initializeUnifiedMonitoring = (): void => {
  try {
    // Initialize existing monitoring (error tracking, health checks, custom APM)
    initializeAllMonitoring();

    // Initialize PostHog if not already initialized
    if (typeof window !== 'undefined') {
      initializePostHog();
      console.log('✅ PostHog analytics initialized');
    }

    // OpenTelemetry is initialized via instrumentation.ts
    if (isOtelEnabled()) {
      console.log('✅ OpenTelemetry/SigNoz integration active');
    }

    console.log('🚀 Unified monitoring system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize unified monitoring:', error);
  }
};

// Re-export all monitoring utilities
export * from '../signoz';
export * from '../signoz/correlation';
export * from './events';

// Export adapted APM for backward compatibility
export {
  apmAdapter as apm,
  withAPMTracking,
  trackDatabaseOperation,
  trackAIOperation,
  trackExternalAPI,
  businessMetrics,
} from '../adapters/otel-adapter';

// Export original monitoring utilities
export {
  errorTracker,
  withErrorTracking,
  performanceMonitor,
  healthMonitor,
  handleHealthCheck,
  handleReadinessCheck,
  handleLivenessCheck,
  getAPMDashboardData,
  useAPMTracking,
} from '../index';

// Export types
export type {
  ErrorReport,
  PerformanceMetric,
  APMMetric,
  TransactionTrace,
  TransactionSpan,
  HealthCheck,
  SystemHealth,
} from '../index';

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
 * OpenTelemetry Adapter
 *
 * Bridges the existing custom APM system with OpenTelemetry/SigNoz
 */

import { apm } from '../apm';
import type { APMMetric } from '../apm';
import { tracer, isOtelEnabled } from '../signoz';
import { SpanKind, SpanStatusCode, context, trace } from '@opentelemetry/api';
import type { Span } from '@opentelemetry/api';
import {
  recordPerformanceMetric,
  recordBusinessMetric,
} from '../signoz/metrics';

// Map to store transaction ID to OpenTelemetry span mapping
const transactionSpanMap = new Map<string, Span>();

/**
 * Wrap the existing APM service to also send data to OpenTelemetry
 */
export class OpenTelemetryAdapter {
  private originalApm = apm;

  /**
   * Override startTransaction to create OpenTelemetry span
   */
  startTransaction(
    name: string,
    metadata: Record<string, unknown> = {}
  ): string {
    // Call original APM
    const transactionId = this.originalApm.startTransaction(name, metadata);

    // Create OpenTelemetry span if enabled
    if (isOtelEnabled() && transactionId) {
      const span = tracer.startSpan(name, {
        kind: SpanKind.INTERNAL,
        attributes: {
          'transaction.id': transactionId,
          ...metadata,
        },
      });

      // Store mapping
      transactionSpanMap.set(transactionId, span);

      // Set as active span
      context.with(trace.setSpan(context.active(), span), () => {
        // Context is now active for this transaction
      });
    }

    return transactionId;
  }

  /**
   * Override endTransaction to end OpenTelemetry span
   */
  endTransaction(
    id: string,
    status: 'completed' | 'failed' = 'completed'
  ): void {
    // Call original APM
    this.originalApm.endTransaction(id, status);

    // End OpenTelemetry span
    const span = transactionSpanMap.get(id);
    if (span) {
      span.setStatus({
        code: status === 'completed' ? SpanStatusCode.OK : SpanStatusCode.ERROR,
      });

      // Get transaction data for additional attributes
      const transaction = this.originalApm.getTransaction(id);
      if (transaction?.duration) {
        span.setAttribute('duration_ms', transaction.duration);
      }

      span.end();
      transactionSpanMap.delete(id);
    }
  }

  /**
   * Override startSpan to create OpenTelemetry child span
   */
  startSpan(
    transactionId: string,
    operation: string,
    parentSpanId?: string,
    tags: Record<string, string> = {}
  ): string {
    // Call original APM
    const spanId = this.originalApm.startSpan(
      transactionId,
      operation,
      parentSpanId,
      tags
    );

    // Create OpenTelemetry child span
    const parentSpan = transactionSpanMap.get(transactionId);
    if (parentSpan && spanId) {
      const childSpan = tracer.startSpan(operation, {
        attributes: {
          'span.id': spanId,
          'span.operation': operation,
          ...tags,
        },
      });

      // Store child span with composite key
      transactionSpanMap.set(`${transactionId}:${spanId}`, childSpan);
    }

    return spanId;
  }

  /**
   * Override endSpan to end OpenTelemetry child span
   */
  endSpan(
    transactionId: string,
    spanId: string,
    status: 'completed' | 'failed' = 'completed'
  ): void {
    // Call original APM
    this.originalApm.endSpan(transactionId, spanId, status);

    // End OpenTelemetry child span
    const childSpan = transactionSpanMap.get(`${transactionId}:${spanId}`);
    if (childSpan) {
      childSpan.setStatus({
        code: status === 'completed' ? SpanStatusCode.OK : SpanStatusCode.ERROR,
      });

      // Get span data for additional attributes
      const transaction = this.originalApm.getTransaction(transactionId);
      const span = transaction?.spans.find(s => s.id === spanId);
      if (span?.duration) {
        childSpan.setAttribute('duration_ms', span.duration);
      }

      childSpan.end();
      transactionSpanMap.delete(`${transactionId}:${spanId}`);
    }
  }

  /**
   * Override recordMetric to send to OpenTelemetry
   */
  recordMetric(metric: APMMetric): void {
    // Call original APM
    this.originalApm.recordMetric(metric);

    // Send to OpenTelemetry metrics
    if (isOtelEnabled()) {
      switch (metric.category) {
        case 'performance':
          recordPerformanceMetric('apiResponseTime', metric.value, metric.tags);
          break;
        case 'business':
          // Map to appropriate business metric
          if (metric.name.includes('user')) {
            recordBusinessMetric('userLogins', metric.value, metric.tags);
          } else if (metric.name.includes('revenue')) {
            recordBusinessMetric('revenue', metric.value, metric.tags);
          }
          break;
      }
    }
  }

  // Proxy other methods to original APM
  getTransaction(id: string) {
    return this.originalApm.getTransaction(id);
  }

  getActiveTransactions() {
    return this.originalApm.getActiveTransactions();
  }

  getPerformanceSummary() {
    return this.originalApm.getPerformanceSummary();
  }

  exportMetrics() {
    return this.originalApm.exportMetrics();
  }

  clear() {
    transactionSpanMap.clear();
    return this.originalApm.clear();
  }
}

// Create adapter instance
export const apmAdapter = new OpenTelemetryAdapter();

/**
 * Migrate existing APM wrapper functions to use OpenTelemetry
 */
export function withAPMTracking<T extends (...args: unknown[]) => unknown>(
  handler: T,
  operationName?: string
): T {
  return (async (...args: unknown[]) => {
    const request = args[0] as {
      method?: string;
      nextUrl?: { pathname?: string };
      url?: string;
      headers?: { get: (key: string) => string | null };
    };
    const spanName =
      operationName || `${request?.method} ${request?.nextUrl?.pathname}`;

    // Use OpenTelemetry span if available
    if (isOtelEnabled()) {
      const span = tracer.startSpan(spanName, {
        kind: SpanKind.SERVER,
        attributes: {
          'http.method': request?.method,
          'http.url': request?.url,
          'http.user_agent': request?.headers?.get('user-agent') || undefined,
        },
      });

      return context.with(trace.setSpan(context.active(), span), async () => {
        try {
          const result = await handler(...args);
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          if (error instanceof Error) {
            span.recordException(error);
          }
          throw error;
        } finally {
          span.end();
        }
      });
    } else {
      // Fallback to original APM
      const transactionId = apmAdapter.startTransaction(spanName, {
        method: request?.method,
        url: request?.url,
        userAgent: request?.headers?.get('user-agent'),
      });

      try {
        const result = await handler(...args);
        apmAdapter.endTransaction(transactionId, 'completed');
        return result;
      } catch (error) {
        apmAdapter.endTransaction(transactionId, 'failed');
        throw error;
      }
    }
  }) as T;
}

/**
 * Export adapted versions of tracking functions
 */
export { traceDatabaseOperation as trackDatabaseOperation } from '../signoz/tracing';
export { traceAIOperation as trackAIOperation } from '../signoz/tracing';
export { traceHttpRequest as trackExternalAPI } from '../signoz/tracing';

// Re-export business metrics with adapter
export const businessMetrics = {
  trackUserAction: (
    action: string,
    userId?: string,
    metadata?: Record<string, unknown>
  ) => {
    // Use original APM
    apmAdapter.recordMetric({
      name: 'user_action',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        action,
        userId: userId || 'anonymous',
        ...metadata,
      },
      category: 'business',
    });

    // Also record in OpenTelemetry
    if (isOtelEnabled()) {
      recordBusinessMetric('userLogins', 1, {
        action,
        userId: userId || 'anonymous',
        ...metadata,
      });
    }
  },

  trackConversion: (type: string, value: number, userId?: string) => {
    apmAdapter.recordMetric({
      name: 'conversion',
      value,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        type,
        userId: userId || 'anonymous',
      },
      category: 'business',
    });
  },

  trackRevenue: (amount: number, currency: string = 'USD', userId?: string) => {
    apmAdapter.recordMetric({
      name: 'revenue',
      value: amount,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        currency,
        userId: userId || 'anonymous',
      },
      category: 'business',
    });

    if (isOtelEnabled()) {
      recordBusinessMetric('revenue', amount, {
        currency,
        userId: userId || 'anonymous',
      });
    }
  },

  trackFeatureUsage: (feature: string, userId?: string) => {
    apmAdapter.recordMetric({
      name: 'feature_usage',
      value: 1,
      unit: 'count',
      timestamp: Date.now(),
      tags: {
        feature,
        userId: userId || 'anonymous',
      },
      category: 'business',
    });
  },
};

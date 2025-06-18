/**
 * Observability Middleware
 *
 * Combines PostHog analytics and SigNoz APM for API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAPMTracking } from '@/lib/monitoring/unified';
import { getCurrentTraceId, addSpanAttributes } from '@/lib/monitoring/signoz';
import { captureServerEvent } from '@/lib/analytics/posthog/server';
import { recordPerformanceMetric } from '@/lib/monitoring/signoz/metrics';

/**
 * Observability middleware configuration
 */
export interface ObservabilityConfig {
  trackAnalytics?: boolean;
  trackPerformance?: boolean;
  sensitiveFields?: string[];
  customAttributes?: Record<string, any>;
}

/**
 * Apply observability to API routes
 */
export function withObservability<T extends (...args: any[]) => any>(
  handler: T,
  config: ObservabilityConfig = {}
): T {
  const {
    trackAnalytics = true,
    trackPerformance = true,
    sensitiveFields = [],
    customAttributes = {},
  } = config;

  return withAPMTracking(async (req: NextRequest, ...args: any[]) => {
    const startTime = performance.now();
    const method = req.method;
    const pathname = req.nextUrl.pathname;
    const traceId = getCurrentTraceId();

    // Extract request metadata
    const metadata = {
      method,
      path: pathname,
      trace_id: traceId,
      user_agent: req.headers.get('user-agent'),
      referer: req.headers.get('referer'),
      ...customAttributes,
    };

    // Add span attributes
    addSpanAttributes({
      'http.method': method,
      'http.path': pathname,
      'http.user_agent': req.headers.get('user-agent') || 'unknown',
      ...customAttributes,
    });

    try {
      // Execute the handler
      const response = await handler(req, ...args);
      const duration = performance.now() - startTime;

      // Track success metrics
      if (trackPerformance) {
        recordPerformanceMetric('apiResponseTime', duration, {
          method,
          path: pathname,
          status: 'success',
          status_code: response.status,
        });
      }

      // Track analytics event
      if (trackAnalytics && process.env.NODE_ENV === 'production') {
        await captureServerEvent(
          req.headers.get('x-user-id') || 'anonymous',
          'api_request',
          {
            ...metadata,
            duration_ms: duration,
            status_code: response.status,
            success: true,
          }
        );
      }

      // Add trace ID to response headers
      if (traceId) {
        response.headers.set('x-trace-id', traceId);
      }

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const statusCode = (error as any)?.statusCode || 500;

      // Track error metrics
      if (trackPerformance) {
        recordPerformanceMetric('apiErrors', 1, {
          method,
          path: pathname,
          error_type:
            error instanceof Error ? error.constructor.name : 'unknown',
          status_code: statusCode,
        });

        recordPerformanceMetric('apiResponseTime', duration, {
          method,
          path: pathname,
          status: 'error',
          status_code: statusCode,
        });
      }

      // Track analytics event
      if (trackAnalytics && process.env.NODE_ENV === 'production') {
        await captureServerEvent(
          req.headers.get('x-user-id') || 'anonymous',
          'api_error',
          {
            ...metadata,
            duration_ms: duration,
            status_code: statusCode,
            error: errorMessage,
            error_type:
              error instanceof Error ? error.constructor.name : 'unknown',
          }
        );
      }

      // Create error response
      const errorResponse = NextResponse.json(
        {
          error:
            process.env.NODE_ENV === 'production'
              ? 'Internal server error'
              : errorMessage,
          trace_id: traceId,
        },
        { status: statusCode }
      );

      // Add trace ID to error response
      if (traceId) {
        errorResponse.headers.set('x-trace-id', traceId);
      }

      return errorResponse;
    }
  }) as T;
}

/**
 * Extract user context from request
 */
export const extractUserContext = (
  req: NextRequest
): {
  userId?: string;
  sessionId?: string;
  ip?: string;
} => {
  return {
    userId: req.headers.get('x-user-id') || undefined,
    sessionId: req.cookies.get('session_id')?.value,
    ip:
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      undefined,
  };
};

/**
 * Sanitize request/response data
 */
export const sanitizeData = (
  data: any,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'key']
): any => {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  // Recursively sanitize nested objects
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key], sensitiveFields);
    }
  }

  return sanitized;
};

/**
 * Create observability context for manual tracking
 */
export class ObservabilityContext {
  private startTime: number;
  private metadata: Record<string, any>;

  constructor(
    private operation: string,
    metadata: Record<string, any> = {}
  ) {
    this.startTime = performance.now();
    this.metadata = {
      operation,
      trace_id: getCurrentTraceId(),
      timestamp: new Date().toISOString(),
      ...metadata,
    };
  }

  /**
   * Add additional metadata
   */
  addMetadata(key: string, value: any): void {
    this.metadata[key] = value;
  }

  /**
   * Track success
   */
  async success(result?: any): Promise<void> {
    const duration = performance.now() - this.startTime;

    // Record metrics
    recordPerformanceMetric('apiResponseTime', duration, {
      operation: this.operation,
      status: 'success',
    });

    // Track analytics
    if (process.env.NODE_ENV === 'production') {
      await captureServerEvent(
        this.metadata.userId || 'system',
        `operation_${this.operation}_success`,
        {
          ...this.metadata,
          duration_ms: duration,
          success: true,
        }
      );
    }
  }

  /**
   * Track failure
   */
  async failure(error: Error): Promise<void> {
    const duration = performance.now() - this.startTime;

    // Record metrics
    recordPerformanceMetric('apiErrors', 1, {
      operation: this.operation,
      error_type: error.constructor.name,
    });

    // Track analytics
    if (process.env.NODE_ENV === 'production') {
      await captureServerEvent(
        this.metadata.userId || 'system',
        `operation_${this.operation}_failed`,
        {
          ...this.metadata,
          duration_ms: duration,
          error: error.message,
          error_type: error.constructor.name,
        }
      );
    }
  }
}

/**
 * Export utilities
 */
export const observability = {
  middleware: withObservability,
  context: ObservabilityContext,
  extractUser: extractUserContext,
  sanitize: sanitizeData,
};

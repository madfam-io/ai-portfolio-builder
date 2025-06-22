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
  customAttributes?: Record<string, unknown>;
}

/**
 * Helper to extract request context
 */
function extractRequestContext(
  req: NextRequest,
  customAttributes: Record<string, unknown>
) {
  const method = req.method;
  const pathname = req.nextUrl.pathname;
  const traceId = getCurrentTraceId();

  const metadata = {
    method,
    path: pathname,
    trace_id: traceId,
    user_agent: req.headers.get('user-agent'),
    referer: req.headers.get('referer'),
    ...customAttributes,
  };

  return { method, pathname, traceId, metadata };
}

/**
 * Helper to track success response
 */
async function trackSuccessResponse(
  response: unknown,
  duration: number,
  context: {
    metadata: Record<string, unknown>;
    config: { trackPerformance: boolean; trackAnalytics: boolean };
    req: NextRequest;
  }
) {
  const { metadata, config, req } = context;
  const statusCode = (response as { status?: number })?.status || 200;

  if (config.trackPerformance) {
    recordPerformanceMetric('apiResponseTime', duration, {
      method: String(metadata.method),
      path: String(metadata.path),
      status: 'success',
      status_code: statusCode,
    });
  }

  if (config.trackAnalytics && process.env.NODE_ENV === 'production') {
    await captureServerEvent(
      req.headers.get('x-user-id') || 'anonymous',
      'api_request',
      {
        ...metadata,
        duration_ms: duration,
        status_code: statusCode,
        success: true,
      }
    );
  }
}

/**
 * Helper to track error response
 */
async function trackErrorResponse(
  error: unknown,
  duration: number,
  context: {
    metadata: Record<string, unknown>;
    config: { trackPerformance: boolean; trackAnalytics: boolean };
    req: NextRequest;
  }
) {
  const { metadata, config, req } = context;
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const statusCode = (error as { statusCode?: number })?.statusCode || 500;
  const errorType = error instanceof Error ? error.constructor.name : 'unknown';

  if (config.trackPerformance) {
    recordPerformanceMetric('apiErrors', 1, {
      method: String(metadata.method),
      path: String(metadata.path),
      error_type: errorType,
      status_code: statusCode,
    });

    recordPerformanceMetric('apiResponseTime', duration, {
      method: String(metadata.method),
      path: String(metadata.path),
      status: 'error',
      status_code: statusCode,
    });
  }

  if (config.trackAnalytics && process.env.NODE_ENV === 'production') {
    await captureServerEvent(
      req.headers.get('x-user-id') || 'anonymous',
      'api_error',
      {
        ...metadata,
        duration_ms: duration,
        status_code: statusCode,
        error: errorMessage,
        error_type: errorType,
      }
    );
  }

  return { errorMessage, statusCode };
}

/**
 * Helper to add trace ID to response headers
 */
function addTraceIdToResponse(response: unknown, traceId: string | undefined) {
  if (!traceId || !response || typeof response !== 'object') {
    return;
  }

  if ('headers' in response) {
    const responseWithHeaders = response as {
      headers?: { set?: (key: string, value: string) => void };
    };
    if (responseWithHeaders.headers?.set) {
      responseWithHeaders.headers.set('x-trace-id', traceId);
    }
  }
}

/**
 * Next.js route handler types
 */
type RouteHandlerContext<Params = Record<string, string | string[]>> = {
  params: Params;
};

// Handler without params (for routes like /api/something)
type SimpleRouteHandler = (
  request: NextRequest
) => Promise<NextResponse> | NextResponse;

// Handler with params (for routes like /api/[id]/something)
type ParamsRouteHandler<Params = Record<string, string | string[]>> = (
  request: NextRequest,
  context: RouteHandlerContext<Params>
) => Promise<NextResponse> | NextResponse;

// Union type for both handlers
type RouteHandler<Params = Record<string, string | string[]>> =
  | SimpleRouteHandler
  | ParamsRouteHandler<Params>;

/**
 * Apply observability to API routes
 */
export function withObservability<T extends RouteHandler<any>>(
  handler: T,
  config: ObservabilityConfig = {}
): T {
  const {
    trackAnalytics = true,
    trackPerformance = true,
    customAttributes = {},
  } = config;

  const wrappedHandler = async (...args: unknown[]) => {
    const request = args[0] as NextRequest;
    const context = args[1] as RouteHandlerContext<any> | undefined;

    const req = request;
    const startTime = performance.now();

    // Extract request context
    const { method, pathname, traceId, metadata } = extractRequestContext(
      req,
      customAttributes
    );

    // Add span attributes
    addSpanAttributes({
      'http.method': method,
      'http.path': pathname,
      'http.user_agent': req.headers.get('user-agent') || 'unknown',
      ...customAttributes,
    });

    try {
      // Execute the handler with proper arguments
      let response: NextResponse;
      if (context && handler.length > 1) {
        // Handler expects context parameter
        response = await (handler as ParamsRouteHandler<any>)(req, context);
      } else {
        // Handler doesn't expect context or context is not provided
        response = await (handler as SimpleRouteHandler)(req);
      }
      const duration = performance.now() - startTime;

      // Track success metrics and analytics
      await trackSuccessResponse(response, duration, {
        metadata,
        config: { trackPerformance, trackAnalytics },
        req,
      });

      // Add trace ID to response headers
      addTraceIdToResponse(response, traceId);

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Track error metrics and analytics
      const { errorMessage, statusCode } = await trackErrorResponse(
        error,
        duration,
        {
          metadata,
          config: { trackPerformance, trackAnalytics },
          req,
        }
      );

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
  };

  return withAPMTracking(wrappedHandler) as T;
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
  data: unknown,
  sensitiveFields: string[] = ['password', 'token', 'secret', 'key']
): unknown => {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data } as Record<string, unknown>;

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
  private metadata: Record<string, unknown>;

  constructor(
    private operation: string,
    metadata: Record<string, unknown> = {}
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
  addMetadata(key: string, value: unknown): void {
    this.metadata[key] = value;
  }

  /**
   * Track success
   */
  async success(_result?: unknown): Promise<void> {
    const duration = performance.now() - this.startTime;

    // Record metrics
    recordPerformanceMetric('apiResponseTime', duration, {
      operation: this.operation,
      status: 'success',
    });

    // Track analytics
    if (process.env.NODE_ENV === 'production') {
      await captureServerEvent(
        String(this.metadata.userId || 'system'),
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
        String(this.metadata.userId || 'system'),
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

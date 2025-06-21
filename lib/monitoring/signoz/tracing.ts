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

/* eslint-disable require-await */
/**
 * OpenTelemetry Tracing Utilities
 *
 * Provides enhanced tracing capabilities for SigNoz integration
 */

import {
  trace,
  context,
  SpanKind,
  SpanStatusCode,
  Attributes,
} from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { tracer } from './index';

/**
 * Trace HTTP requests
 */
export const traceHttpRequest = async <T>(
  method: string,
  url: string,
  fn: () => Promise<T>
): Promise<T> => {
  const span = tracer.startSpan(`HTTP ${method} ${new URL(url).pathname}`, {
    kind: SpanKind.CLIENT,
    attributes: {
      [SemanticAttributes.HTTP_METHOD]: method,
      [SemanticAttributes.HTTP_URL]: url,
      [SemanticAttributes.HTTP_TARGET]: new URL(url).pathname,
      [SemanticAttributes.HTTP_HOST]: new URL(url).host,
      [SemanticAttributes.HTTP_SCHEME]: new URL(url).protocol.replace(':', ''),
    },
  });

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const startTime = Date.now();
      const result = await fn();
      const duration = Date.now() - startTime;

      span.setAttributes({
        [SemanticAttributes.HTTP_STATUS_CODE]: 200,
        'http.response_time_ms': duration,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const statusCode =
        (error as { response?: { status?: number } })?.response?.status || 500;

      span.setAttributes({
        [SemanticAttributes.HTTP_STATUS_CODE]: statusCode,
        error: true,
      });

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'HTTP request failed',
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      span.end();
    }
  });
};

/**
 * Trace database operations
 */
export const traceDatabaseOperation = async <T>(
  operation: string,
  query: string,
  fn: () => Promise<T>
): Promise<T> => {
  const span = tracer.startSpan(`db.${operation}`, {
    kind: SpanKind.CLIENT,
    attributes: {
      [SemanticAttributes.DB_SYSTEM]: 'postgresql',
      [SemanticAttributes.DB_OPERATION]: operation,
      [SemanticAttributes.DB_STATEMENT]: query.substring(0, 500), // Limit query length
      'db.name': process.env.POSTGRES_DB || 'portfolio_builder',
    },
  });

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const startTime = Date.now();
      const result = await fn();
      const duration = Date.now() - startTime;

      span.setAttributes({
        'db.rows_affected': (result as { rowCount?: number })?.rowCount || 0,
        'db.duration_ms': duration,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message:
          error instanceof Error ? error.message : 'Database operation failed',
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      span.end();
    }
  });
};

/**
 * Trace AI operations
 */
export const traceAIOperation = async <T>(
  model: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const span = tracer.startSpan(`ai.${operation}`, {
    kind: SpanKind.CLIENT,
    attributes: {
      'ai.model': model,
      'ai.operation': operation,
      'ai.provider': 'huggingface',
    },
  });

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const startTime = Date.now();
      const result = await fn();
      const duration = Date.now() - startTime;

      // Extract token count if available
      const tokenCount =
        (result as { usage?: { total_tokens?: number } })?.usage
          ?.total_tokens || 0;

      span.setAttributes({
        'ai.duration_ms': duration,
        'ai.token_count': tokenCount,
        'ai.success': true,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'AI operation failed',
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      span.end();
    }
  });
};

/**
 * Trace Redis operations
 */
export const traceRedisOperation = async <T>(
  command: string,
  key: string,
  fn: () => Promise<T>
): Promise<T> => {
  const span = tracer.startSpan(`redis.${command}`, {
    kind: SpanKind.CLIENT,
    attributes: {
      'db.system': 'redis',
      'db.operation': command,
      'redis.key': key,
      'db.redis.database_index': 0,
    },
  });

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const startTime = Date.now();
      const result = await fn();
      const duration = Date.now() - startTime;

      span.setAttributes({
        'redis.duration_ms': duration,
        'redis.hit': result !== null && result !== undefined,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message:
          error instanceof Error ? error.message : 'Redis operation failed',
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      span.end();
    }
  });
};

/**
 * Trace Stripe operations
 */
export const traceStripeOperation = async <T>(
  resource: string,
  action: string,
  fn: () => Promise<T>
): Promise<T> => {
  const span = tracer.startSpan(`stripe.${resource}.${action}`, {
    kind: SpanKind.CLIENT,
    attributes: {
      'stripe.resource': resource,
      'stripe.action': action,
      'payment.provider': 'stripe',
    },
  });

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const startTime = Date.now();
      const result = await fn();
      const duration = Date.now() - startTime;

      span.setAttributes({
        'stripe.duration_ms': duration,
        'stripe.success': true,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const stripeError = error as {
        type?: string;
        code?: string;
        requestId?: string;
      };

      span.setAttributes({
        'stripe.error_type': stripeError?.type,
        'stripe.error_code': stripeError?.code,
        'stripe.request_id': stripeError?.requestId,
      });

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message:
          error instanceof Error ? error.message : 'Stripe operation failed',
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      span.end();
    }
  });
};

/**
 * Create span for API routes
 */
export const traceAPIRoute = async <T>(
  method: string,
  path: string,
  fn: () => Promise<T>
): Promise<T> => {
  const span = tracer.startSpan(`${method} ${path}`, {
    kind: SpanKind.SERVER,
    attributes: {
      [SemanticAttributes.HTTP_METHOD]: method,
      [SemanticAttributes.HTTP_ROUTE]: path,
      [SemanticAttributes.HTTP_TARGET]: path,
      'api.version': 'v1',
    },
  });

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const startTime = Date.now();
      const result = await fn();
      const duration = Date.now() - startTime;

      span.setAttributes({
        [SemanticAttributes.HTTP_STATUS_CODE]: 200,
        'api.duration_ms': duration,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const errorObj = error as { statusCode?: number } | null;
      const statusCode = errorObj?.statusCode || 500;

      span.setAttributes({
        [SemanticAttributes.HTTP_STATUS_CODE]: statusCode,
        error: true,
      });

      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'API route failed',
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      span.end();
    }
  });
};

/**
 * Batch span creation for multiple operations
 */
export const traceBatch = async <T>(
  operations: Array<{
    name: string;
    fn: () => Promise<T>;
    attributes?: Attributes;
  }>
): Promise<T[]> => {
  const parentSpan = tracer.startSpan('batch_operation', {
    attributes: {
      'batch.size': operations.length,
    },
  });

  return context.with(trace.setSpan(context.active(), parentSpan), async () => {
    try {
      const results = await Promise.all(
        operations.map(({ name, fn, attributes }) =>
          traceOperation(name, fn, attributes)
        )
      );

      parentSpan.setStatus({ code: SpanStatusCode.OK });
      return results;
    } catch (error) {
      parentSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message:
          error instanceof Error ? error.message : 'Batch operation failed',
      });

      if (error instanceof Error) {
        parentSpan.recordException(error);
      }

      throw error;
    } finally {
      parentSpan.end();
    }
  });
};

/**
 * Generic operation tracer
 */
const traceOperation = async <T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Attributes
): Promise<T> => {
  const span = tracer.startSpan(name, { attributes });

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Operation failed',
      });

      if (error instanceof Error) {
        span.recordException(error);
      }

      throw error;
    } finally {
      span.end();
    }
  });
};

/**
 * SigNoz Integration Service
 *
 * Main entry point for SigNoz APM integration
 */

import { trace, context, SpanStatusCode, SpanKind } from '@opentelemetry/api';
import type { Span, Attributes } from '@opentelemetry/api';

// Re-export tracing utilities
export * from './tracing';
export * from './metrics';
export * from './correlation';

// Get the global tracer
export const tracer = trace.getTracer(
  process.env.OTEL_SERVICE_NAME || 'ai-portfolio-builder',
  process.env.npm_package_version || '0.3.0-beta'
);

/**
 * Check if OpenTelemetry is enabled
 */
export const isOtelEnabled = (): boolean => {
  return (
    process.env.OTEL_TRACE_ENABLED !== 'false' &&
    process.env.NODE_ENV !== 'test'
  );
};

/**
 * Get current span from context
 */
export const getCurrentSpan = (): Span | undefined => {
  if (!isOtelEnabled()) return undefined;
  return trace.getActiveSpan();
};

/**
 * Get current trace ID
 */
export const getCurrentTraceId = (): string | undefined => {
  const span = getCurrentSpan();
  if (!span) return undefined;

  const spanContext = span.spanContext();
  return spanContext.traceId;
};

/**
 * Create a new span with error handling
 */
export const createSpan = (
  name: string,
  options?: {
    kind?: SpanKind;
    attributes?: Attributes;
  }
): Span | undefined => {
  if (!isOtelEnabled()) return undefined;

  try {
    const span = tracer.startSpan(name, {
      kind: options?.kind || SpanKind.INTERNAL,
      attributes: options?.attributes,
    });

    return span;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to create span:', error);
    return undefined;
  }
};

/**
 * Wrap a function with OpenTelemetry tracing
 */
export function withTracing<T extends (...args: unknown[]) => unknown>(
  fn: T,
  spanName: string,
  options?: {
    kind?: SpanKind;
    attributes?: Attributes;
  }
): T {
  if (!isOtelEnabled()) return fn;

  return (async (...args: unknown[]) => {
    const span = createSpan(spanName, options);
    if (!span) return fn(...args);

    try {
      // Add function arguments as span attributes (be careful with sensitive data)
      const attributes: Attributes = {
        'function.name': fn.name || 'anonymous',
        'function.args.count': args.length,
      };
      if (options?.attributes) {
        Object.entries(options.attributes).forEach(([key, value]) => {
          if (value !== undefined && value !== null && typeof value !== 'object') {
            attributes[key] = value;
          }
        });
      }
      span.setAttributes(attributes);

      const result = await context.with(
        trace.setSpan(context.active(), span),
        () => fn(...args)
      );

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
  }) as T;
}

/**
 * Record an error in the current span
 */
export const recordError = (
  error: Error,
  attributes?: Attributes
): void => {
  const span = getCurrentSpan();
  if (!span) return;

  span.recordException(error);
  if (attributes) {
    span.setAttributes(attributes);
  }
  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: error.message,
  });
};

/**
 * Add attributes to the current span
 */
export const addSpanAttributes = (
  attributes: Attributes
): void => {
  const span = getCurrentSpan();
  if (!span) return;

  span.setAttributes(attributes);
};

/**
 * Create a child span within the current context
 */
export const createChildSpan = (
  name: string,
  fn: (span: Span | undefined) => Promise<unknown>
): Promise<unknown> => {
  if (!isOtelEnabled()) return fn(undefined);

  const span = createSpan(name);
  if (!span) return fn(undefined);

  return context.with(trace.setSpan(context.active(), span), async () => {
    try {
      const result = await fn(span);
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
};

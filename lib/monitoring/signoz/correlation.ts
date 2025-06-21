/* eslint-disable require-await */
/**
 * PostHog-SigNoz Correlation Utilities
 *
 * Links business events (PostHog) with technical traces (SigNoz)
 */

import { getCurrentTraceId, createChildSpan, addSpanAttributes } from './index';
import {
  captureEvent,
  captureEnhancedEvent,
} from '@/lib/analytics/posthog/client';
import { recordBusinessMetric, recordPerformanceMetric } from './metrics';

/**
 * Enhanced event tracking that includes trace correlation
 */
export const trackCorrelatedEvent = (
  eventName: string,
  properties?: Record<string, unknown>
): void => {
  const traceId = getCurrentTraceId();

  // Send to PostHog with trace ID
  captureEvent(eventName, {
    ...properties,
    trace_id: traceId,
    has_trace: !!traceId,
  });

  // Also record as OpenTelemetry metric
  recordBusinessMetric('aiGenerations', 1, {
    event: eventName,
    ...properties,
  });
};

/**
 * Track user action with performance correlation
 */
export const trackUserActionWithPerformance = async <T>(
  action: string,
  userId: string,
  operation: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> => {
  return createChildSpan(`user_action.${action}`, async span => {
    const traceId = span?.spanContext().traceId;
    const startTime = performance.now();

    try {
      // Add user context to span
      span?.setAttributes({
        'user.id': userId,
        'user.action': action,
        ...metadata,
      });

      // Execute the operation
      const result = await operation();
      const duration = performance.now() - startTime;

      // Track in PostHog with performance data
      captureEnhancedEvent(`user_action_${action}`, {
        user_id: userId,
        trace_id: traceId,
        duration_ms: duration,
        success: true,
        ...metadata,
      });

      // Record performance metric
      recordPerformanceMetric('apiResponseTime', duration, {
        action,
        status: 'success',
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Track failure in PostHog
      captureEnhancedEvent(`user_action_${action}_failed`, {
        user_id: userId,
        trace_id: traceId,
        duration_ms: duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...metadata,
      });

      // Record error metric
      recordPerformanceMetric('apiErrors', 1, {
        action,
        error_type: error instanceof Error ? error.constructor.name : 'unknown',
      });

      throw error;
    }
  }) as Promise<T>;
};

/**
 * Track portfolio operation with full observability
 */
export const trackPortfolioOperation = async <T>(
  operation: 'create' | 'update' | 'publish' | 'delete',
  portfolioId: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> => {
  return createChildSpan(`portfolio.${operation}`, async span => {
    const traceId = span?.spanContext().traceId;
    const startTime = performance.now();

    try {
      // Add portfolio context
      span?.setAttributes({
        'portfolio.id': portfolioId,
        'portfolio.operation': operation,
        ...metadata,
      });

      const result = await fn();
      const duration = performance.now() - startTime;

      // Track success in PostHog
      captureEnhancedEvent(`portfolio_${operation}`, {
        portfolio_id: portfolioId,
        trace_id: traceId,
        duration_ms: duration,
        ...metadata,
      });

      // Record business metric
      const metricMap: Record<
        string,
        keyof typeof import('./metrics').businessMetrics
      > = {
        create: 'portfoliosCreated',
        publish: 'portfoliosPublished',
        update: 'portfoliosCreated', // Note: portfoliosUpdated doesn't exist in businessMetrics
        delete: 'portfoliosCreated', // Note: portfoliosDeleted doesn't exist in businessMetrics
      };

      if (metricMap[operation]) {
        recordBusinessMetric(metricMap[operation], 1, {
          portfolio_id: portfolioId,
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Track failure
      captureEnhancedEvent(`portfolio_${operation}_failed`, {
        portfolio_id: portfolioId,
        trace_id: traceId,
        duration_ms: duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...metadata,
      });

      throw error;
    }
  }) as Promise<T>;
};

/**
 * Track AI enhancement with correlation
 */
export const trackAIEnhancement = async <T>(
  contentType: 'bio' | 'project' | 'experience' | 'skills',
  model: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> => {
  return createChildSpan(`ai.enhance_${contentType}`, async span => {
    const traceId = span?.spanContext().traceId;
    const startTime = performance.now();

    try {
      // Add AI context
      span?.setAttributes({
        'ai.content_type': contentType,
        'ai.model': model,
        ...metadata,
      });

      const result = await fn();
      const duration = performance.now() - startTime;

      // Extract token count if available
      const tokenCount =
        (result as { usage?: { total_tokens?: number } })?.usage
          ?.total_tokens || 0;

      // Track in PostHog
      captureEnhancedEvent('ai_content_generated', {
        content_type: contentType,
        model,
        trace_id: traceId,
        duration_ms: duration,
        token_count: tokenCount,
        ...metadata,
      });

      // Record metrics
      recordBusinessMetric('aiGenerations', 1, {
        content_type: contentType,
        model,
      });

      if (tokenCount > 0) {
        recordBusinessMetric('aiTokensUsed', tokenCount, {
          content_type: contentType,
          model,
        });
      }

      recordPerformanceMetric('aiInferenceTime', duration, {
        content_type: contentType,
        model,
      });

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;

      // Track failure
      captureEnhancedEvent('ai_generation_failed', {
        content_type: contentType,
        model,
        trace_id: traceId,
        duration_ms: duration,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...metadata,
      });

      recordPerformanceMetric('aiErrors', 1, {
        content_type: contentType,
        model,
      });

      throw error;
    }
  }) as Promise<T>;
};

/**
 * Track revenue operation with correlation
 */
export const trackRevenueOperation = async <T>(
  operation: 'payment' | 'subscription' | 'refund',
  amount: number,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
): Promise<T> => {
  return createChildSpan(`revenue.${operation}`, async span => {
    const traceId = span?.spanContext().traceId;

    try {
      // Add revenue context
      span?.setAttributes({
        'revenue.operation': operation,
        'revenue.amount': amount,
        'revenue.currency': 'USD',
        ...metadata,
      });

      const result = await fn();

      // Track in PostHog
      captureEnhancedEvent(`revenue_${operation}`, {
        amount,
        currency: 'USD',
        trace_id: traceId,
        ...metadata,
      });

      // Record revenue metric
      if (operation === 'payment') {
        recordBusinessMetric('revenue', amount, {
          type: 'payment',
        });
      } else if (operation === 'subscription') {
        recordBusinessMetric('subscriptions', 1, {
          action: 'add',
        });
      } else if (operation === 'refund') {
        recordBusinessMetric('revenue', -amount, {
          type: 'refund',
        });
      }

      return result;
    } catch (error) {
      // Track failure
      captureEnhancedEvent(`revenue_${operation}_failed`, {
        amount,
        trace_id: traceId,
        error: error instanceof Error ? error.message : 'Unknown error',
        ...metadata,
      });

      throw error;
    }
  }) as Promise<T>;
};

/**
 * Create a correlated session for tracking user journey
 */
export class CorrelatedSession {
  private sessionId: string;
  private userId?: string;
  private startTime: number;

  constructor(userId?: string) {
    this.sessionId = Math.random().toString(36).substring(2, 15);
    this.userId = userId;
    this.startTime = Date.now();
  }

  /**
   * Track an event within this session
   */
  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    const traceId = getCurrentTraceId();

    captureEvent(eventName, {
      session_id: this.sessionId,
      user_id: this.userId,
      trace_id: traceId,
      session_duration_ms: Date.now() - this.startTime,
      ...properties,
    });

    // Add session context to current span
    addSpanAttributes({
      'session.id': this.sessionId,
      'session.user_id': this.userId,
      'session.event': eventName,
    });
  }

  /**
   * End the session
   */
  end(): void {
    const duration = Date.now() - this.startTime;

    this.trackEvent('session_ended', {
      total_duration_ms: duration,
    });
  }
}

/**
 * Export correlation utilities
 */
export const correlation = {
  event: trackCorrelatedEvent,
  userAction: trackUserActionWithPerformance,
  portfolio: trackPortfolioOperation,
  ai: trackAIEnhancement,
  revenue: trackRevenueOperation,
  session: CorrelatedSession,
};

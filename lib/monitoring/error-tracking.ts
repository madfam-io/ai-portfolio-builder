/**
 * Error tracking and monitoring utilities
 * Provides centralized error handling with optional Sentry integration
 */

import { NextRequest } from 'next/server';

export interface ErrorReport {
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  level: 'error' | 'warning' | 'info';
  category: string;
  fingerprint?: string[];
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
  timestamp: number;
}

/**
 * Error tracking service
 */
class ErrorTracker {
  private isProduction = process.env.NODE_ENV === 'production';
  private sentryDsn = process.env.SENTRY_DSN;
  private enableConsoleLogging = process.env.ENABLE_ERROR_LOGGING !== 'false';

  /**
   * Initialize error tracking
   */
  init(): void {
    if (this.isProduction && this.sentryDsn) {
      // Initialize Sentry in production
      this.initSentry();
    }

    // Global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', event => {
        this.captureError(new Error(event.message), {
          category: 'javascript',
          context: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          },
        });
      });

      window.addEventListener('unhandledrejection', event => {
        this.captureError(new Error(event.reason), {
          category: 'unhandled-promise',
          context: {
            reason: event.reason,
          },
        });
      });
    }
  }

  /**
   * Initialize Sentry (placeholder for actual implementation)
   */
  private initSentry(): void {
    // This would integrate with @sentry/nextjs
    // For now, we'll use our internal tracking
    console.log('Sentry would be initialized here in production');
  }

  /**
   * Capture and report errors
   */
  captureError(error: Error, context: Partial<ErrorReport> = {}): void {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: Date.now(),
      level: 'error',
      category: context.category || 'general',
      context: {
        userAgent:
          typeof window !== 'undefined'
            ? window.navigator?.userAgent
            : undefined,
        url: typeof window !== 'undefined' ? window.location?.href : undefined,
        ...context.context,
      },
      userId: context.userId,
      sessionId: context.sessionId,
      fingerprint: context.fingerprint || [error.message],
    };

    // Log to console in development or if enabled
    if (!this.isProduction || this.enableConsoleLogging) {
      console.error('Error captured:', {
        message: report.message,
        category: report.category,
        context: report.context,
        stack: report.stack,
      });
    }

    // Send to external service in production
    if (this.isProduction) {
      this.sendToExternalService(report);
    }

    // Store locally for development
    this.storeLocally(report);
  }

  /**
   * Capture performance metrics
   */
  capturePerformance(metric: PerformanceMetric): void {
    if (!this.isProduction || this.enableConsoleLogging) {
      console.log('Performance metric:', metric);
    }

    if (this.isProduction) {
      this.sendMetricToExternalService(metric);
    }
  }

  /**
   * Send error to external monitoring service
   */
  private async sendToExternalService(report: ErrorReport): Promise<void> {
    try {
      // This would send to Sentry, LogRocket, or other service
      // For now, we'll use a webhook or API endpoint
      const endpoint = process.env.ERROR_TRACKING_ENDPOINT;

      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(report),
        });
      }
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  /**
   * Send performance metric to external service
   */
  private async sendMetricToExternalService(
    metric: PerformanceMetric
  ): Promise<void> {
    try {
      const endpoint = process.env.METRICS_ENDPOINT;

      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(metric),
        });
      }
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }

  /**
   * Store error locally for debugging
   */
  private storeLocally(report: ErrorReport): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const errors = JSON.parse(
          localStorage.getItem('error-reports') || '[]'
        );
        errors.push(report);

        // Keep only last 50 errors
        if (errors.length > 50) {
          errors.splice(0, errors.length - 50);
        }

        localStorage.setItem('error-reports', JSON.stringify(errors));
      }
    } catch (_error) {
      // Ignore localStorage errors
    }
  }

  /**
   * Get stored error reports for debugging
   */
  getStoredReports(): ErrorReport[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return JSON.parse(localStorage.getItem('error-reports') || '[]');
      }
    } catch (_error) {
      // Ignore localStorage errors
    }
    return [];
  }

  /**
   * Clear stored error reports
   */
  clearStoredReports(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('error-reports');
      }
    } catch (_error) {
      // Ignore localStorage errors
    }
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker();

/**
 * Higher-order function to wrap API handlers with error tracking
 */
export function withErrorTracking<T extends (...args: any[]) => any>(
  handler: T,
  category: string = 'api'
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      const request = args[0] as NextRequest;

      errorTracker.captureError(error as Error, {
        category,
        context: {
          method: request?.method,
          url: request?.url,
          headers: Object.fromEntries(request?.headers?.entries() || []),
          userAgent: request?.headers?.get('user-agent'),
        },
      });

      throw error; // Re-throw to maintain normal error handling
    }
  }) as T;
}

/**
 * React error boundary hook
 */
export function useErrorBoundary() {
  return {
    captureError: (error: Error, errorInfo?: any) => {
      errorTracker.captureError(error, {
        category: 'react',
        context: {
          componentStack: errorInfo?.componentStack,
          errorBoundary: true,
        },
      });
    },
  };
}

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * Measure and track operation duration
   */
  measureOperation: <T>(
    operationName: string,
    operation: () => Promise<T> | T,
    tags?: Record<string, string>
  ): Promise<T> | T => {
    const startTime = performance.now();

    const finish = (result: T) => {
      const duration = performance.now() - startTime;

      errorTracker.capturePerformance({
        name: operationName,
        value: duration,
        unit: 'ms',
        tags,
        timestamp: Date.now(),
      });

      return result;
    };

    try {
      const result = operation();

      if (result instanceof Promise) {
        return result.then(finish).catch(error => {
          const duration = performance.now() - startTime;

          errorTracker.capturePerformance({
            name: `${operationName}_error`,
            value: duration,
            unit: 'ms',
            tags: { ...tags, status: 'error' },
            timestamp: Date.now(),
          });

          throw error;
        });
      }

      return finish(result);
    } catch (error) {
      const duration = performance.now() - startTime;

      errorTracker.capturePerformance({
        name: `${operationName}_error`,
        value: duration,
        unit: 'ms',
        tags: { ...tags, status: 'error' },
        timestamp: Date.now(),
      });

      throw error;
    }
  },

  /**
   * Track Core Web Vitals
   */
  trackWebVitals: () => {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        errorTracker.capturePerformance({
          name: 'largest_contentful_paint',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
        });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const fidEntry = entry as PerformanceEventTiming;
        if (fidEntry.processingStart && fidEntry.startTime) {
          errorTracker.capturePerformance({
            name: 'first_input_delay',
            value: fidEntry.processingStart - fidEntry.startTime,
            unit: 'ms',
            timestamp: Date.now(),
          });
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let cumulativeScore = 0;
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const clsEntry = entry as any;
        if (!clsEntry.hadRecentInput) {
          cumulativeScore += clsEntry.value;
        }
      });

      errorTracker.capturePerformance({
        name: 'cumulative_layout_shift',
        value: cumulativeScore,
        unit: 'count',
        timestamp: Date.now(),
      });
    }).observe({ entryTypes: ['layout-shift'] });
  },

  /**
   * Track API response times
   */
  trackAPIResponse: (
    endpoint: string,
    duration: number,
    statusCode: number
  ) => {
    errorTracker.capturePerformance({
      name: 'api_response_time',
      value: duration,
      unit: 'ms',
      tags: {
        endpoint,
        status: statusCode.toString(),
        success: statusCode < 400 ? 'true' : 'false',
      },
      timestamp: Date.now(),
    });
  },
};

/**
 * Initialize monitoring on application start
 */
export function initializeMonitoring(): void {
  errorTracker.init();

  if (typeof window !== 'undefined') {
    performanceMonitor.trackWebVitals();
  }
}

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

import { logger } from '@/lib/utils/logger';

import {
  ErrorReport,
  ErrorType,
  ErrorSeverity,
  ErrorHandler,
  ErrorFilter,
} from './error-types';
import { serializeError, getErrorType, getErrorContext } from './error-utils';

/**
 * @fileoverview Error Monitoring Service
 *
 * Provides error monitoring and reporting capabilities
 * with integration points for external services.
 */

/**
 * Error monitoring service configuration
 */
interface ErrorMonitoringConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  environment: string;
  sampleRate: number;
  filters?: ErrorFilter[];
  handlers?: ErrorHandler[];
  beforeSend?: (report: ErrorReport) => ErrorReport | null;
}

/**
 * Error Monitoring Service
 */
class ErrorMonitoringService {
  private config: ErrorMonitoringConfig;
  private queue: ErrorReport[] = [];
  private isOnline: boolean = true;

  constructor(config: Partial<ErrorMonitoringConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      environment: process.env.NODE_ENV || 'development',
      sampleRate: 1.0,
      ...config,
    };

    this.setupNetworkListener();
    this.setupUnhandledErrorListeners();
  }

  /**
   * Setup network status listener
   */
  private setupNetworkListener() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Setup global error listeners
   */
  private setupUnhandledErrorListeners() {
    if (typeof window === 'undefined') return;

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        { unhandled: true, promise: true }
      );
    });

    // Global error handler
    window.addEventListener('error', event => {
      this.captureError(event.error || new Error(event.message), {
        unhandled: true,
        global: true,
      });
    });
  }

  /**
   * Capture and report an error
   */
  async captureError(
    error: unknown,
    context?: Record<string, unknown>
  ): Promise<string | null> {
    if (!this.config.enabled) {
      logger.error('Error captured (monitoring disabled):', error as Error);
      return null;
    }

    // Apply sampling
    if (Math.random() > this.config.sampleRate) {
      return null;
    }

    // Convert to Error object if needed
    const errorObj = error instanceof Error ? error : new Error(String(error));

    // Apply filters
    if (this.config.filters?.some(filter => !filter(errorObj))) {
      return null;
    }

    // Create error report
    const report = this.createErrorReport(errorObj, context);

    // Apply beforeSend transform
    const finalReport = this.config.beforeSend
      ? this.config.beforeSend(report)
      : report;

    if (!finalReport) {
      return null;
    }

    // Run custom handlers
    await this.runHandlers(errorObj, context);

    // Send or queue the report
    if (this.isOnline) {
      await this.sendReport(finalReport);
    } else {
      this.queueReport(finalReport);
    }

    return finalReport.id;
  }

  /**
   * Create error report
   */
  private createErrorReport(
    error: Error,
    context?: Record<string, unknown>
  ): ErrorReport {
    const errorType = getErrorType(error);
    const severity = this.calculateSeverity(error, errorType);

    return {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: errorType,
      severity,
      message: error.message,
      stack: error.stack,
      context: {
        ...(getErrorContext() || {}),
        environment: this.config.environment,
        ...(context || {}),
      } as any,
      metadata: serializeError(error),
    };
  }

  /**
   * Calculate error severity
   */
  private calculateSeverity(error: Error, type: ErrorType): ErrorSeverity {
    // Critical errors
    if (
      type === 'authentication' ||
      error.message.toLowerCase().includes('critical') ||
      error.message.toLowerCase().includes('fatal')
    ) {
      return 'critical';
    }

    // High severity
    if (
      type === 'server' ||
      type === 'permission' ||
      error.message.toLowerCase().includes('database') ||
      error.message.toLowerCase().includes('payment')
    ) {
      return 'high';
    }

    // Medium severity
    if (type === 'validation' || type === 'notFound') {
      return 'medium';
    }

    // Low severity
    return 'low';
  }

  /**
   * Run custom error handlers
   */
  private async runHandlers(
    error: Error,
    context?: Record<string, unknown>
  ): Promise<void> {
    if (!this.config.handlers) return;

    for (const handler of this.config.handlers) {
      try {
        await handler(error, context);
      } catch (handlerError) {
        logger.error('Error handler failed:', handlerError as Error);
      }
    }
  }

  /**
   * Send error report to monitoring service
   */
  private async sendReport(report: ErrorReport): Promise<void> {
    if (!this.config.endpoint) {
      logger.info('Error report (no endpoint configured):', { report });
      return;
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && {
            Authorization: `Bearer ${this.config.apiKey}`,
          }),
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        throw new Error(`Failed to send error report: ${response.status}`);
      }

      logger.info('Error report sent:', { reportId: report.id });
    } catch (error) {
      logger.error('Failed to send error report:', error as Error);
      this.queueReport(report);
    }
  }

  /**
   * Queue report for later sending
   */
  private queueReport(report: ErrorReport): void {
    this.queue.push(report);

    // Limit queue size
    if (this.queue.length > 100) {
      this.queue.shift();
    }
  }

  /**
   * Flush queued reports
   */
  private async flushQueue(): Promise<void> {
    if (this.queue.length === 0) return;

    const reports = [...this.queue];
    this.queue = [];

    for (const report of reports) {
      await this.sendReport(report);
    }
  }

  /**
   * Add error filter
   */
  addFilter(filter: ErrorFilter): void {
    if (!this.config.filters) {
      this.config.filters = [];
    }
    this.config.filters.push(filter);
  }

  /**
   * Add error handler
   */
  addHandler(handler: ErrorHandler): void {
    if (!this.config.handlers) {
      this.config.handlers = [];
    }
    this.config.handlers.push(handler);
  }

  /**
   * Update configuration
   */
  configure(config: Partial<ErrorMonitoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get error statistics
   */
  getStats(): {
    queueSize: number;
    isOnline: boolean;
    enabled: boolean;
  } {
    return {
      queueSize: this.queue.length,
      isOnline: this.isOnline,
      enabled: this.config.enabled,
    };
  }
}

/**
 * Global error monitoring instance
 */
export const errorMonitoring = new ErrorMonitoringService({
  enabled: process.env.NODE_ENV === 'production',
  endpoint: process.env.NEXT_PUBLIC_ERROR_MONITORING_ENDPOINT,
  apiKey: process.env.NEXT_PUBLIC_ERROR_MONITORING_API_KEY,
  sampleRate: 1.0,
  beforeSend: report => {
    // Filter out sensitive data
    if (report.context.userId) {
      report.context.userId = 'REDACTED';
    }
    return report;
  },
});

/**
 * Convenience function to capture errors
 */
export function captureError(
  error: unknown,
  context?: Record<string, any>
): Promise<string | null> {
  return errorMonitoring.captureError(error, context);
}

/**
 * Common error filters
 */
export const commonFilters = {
  // Filter out cancelled requests
  ignoreCancelled: (error: Error) => {
    return !error.message.toLowerCase().includes('cancelled');
  },

  // Filter out network errors in development
  ignoreDevNetworkErrors: (error: Error) => {
    if (process.env.NODE_ENV !== 'development') return true;
    const type = getErrorType(error);
    return type !== 'network';
  },

  // Filter out known third-party errors
  ignoreThirdParty: (error: Error) => {
    const thirdPartyPatterns = [
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
    ];
    return !thirdPartyPatterns.some(pattern => error.stack?.includes(pattern));
  },
};

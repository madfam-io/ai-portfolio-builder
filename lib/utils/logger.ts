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
 * @fileoverview Structured logging utility for PRISMA
 *
 * Provides structured logging with context support, error serialization,
 * and production-ready features. In production, logs can be sent to
 * external services like Sentry, LogRocket, or DataDog.
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  feature?: string;
  action?: string;
  metadata?: Record<string, any>;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';
  private debugEnabled =
    this.isDevelopment || process.env.ENABLE_DEBUG === 'true';
  private serviceName = 'prisma-portfolio-builder';

  /**
   * Format log entry for output
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Human-readable format for development
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
      const contextStr = entry.context
        ? ` | ${JSON.stringify(entry.context)}`
        : '';
      const errorStr = entry.error
        ? `\nError: ${entry.error.message}\n${entry.error.stack || ''}`
        : '';
      return `${prefix}${contextStr}${errorStr}`;
    } else {
      // JSON format for production (easier to parse by log aggregators)
      return JSON.stringify({
        ...entry,
        service: this.serviceName,
        environment: process.env.NODE_ENV,
      });
    }
  }

  /**
   * Send log to external service in production
   */
  private sendToExternalService(entry: LogEntry): void {
    // Silence unused parameter warning until implementation
    void entry;
    // In production, send to logging service
    // Example: Sentry, LogRocket, DataDog, etc.
    if (!this.isDevelopment && !this.isTest) {
      // External logging service integration would go here
      // Example with Sentry:
      // if (entry.level === 'error' && entry.error) {
      //   Sentry.captureException(new Error(entry.error.message), {
      //     contexts: { log: entry.context },
      //   });
      // }
    }
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext | Error
  ): void {
    // Skip debug logs in production unless explicitly enabled
    if (level === 'debug' && !this.debugEnabled) {
      return;
    }

    // Skip all logs in test environment to keep test output clean
    if (this.isTest && process.env.SHOW_LOGS !== 'true') {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    // Handle Error objects
    if (context instanceof Error) {
      entry.error = {
        message: context.message,
        stack: context.stack,
        code: (context as any).code,
      };
    } else if (context) {
      entry.context = context;
    }

    // Format and output
    const formatted = this.formatLogEntry(entry);

    // Use appropriate console method
    switch (level) {
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(formatted);
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(formatted);
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(formatted);
        break;
      case 'error':
        // eslint-disable-next-line no-console
        console.error(formatted);
        break;
    }

    // Send to external service
    this.sendToExternalService(entry);
  }

  /**
   * Debug logging - only in development or when explicitly enabled
   */
  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Info logging - development and production
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Warning logging - always enabled
   */
  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Error logging - always enabled
   */
  error(
    message: string,
    error?: Error | LogContext,
    context?: LogContext
  ): void {
    if (error instanceof Error) {
      this.log('error', message, error);
    } else {
      this.log('error', message, error || context);
    }
  }

  /**
   * Create a child logger with persistent context
   */
  child(context: LogContext): Logger {
    const parent = this;
    return {
      debug: (message: string, additionalContext?: LogContext) =>
        parent.debug(message, { ...context, ...additionalContext }),
      info: (message: string, additionalContext?: LogContext) =>
        parent.info(message, { ...context, ...additionalContext }),
      warn: (message: string, additionalContext?: LogContext) =>
        parent.warn(message, { ...context, ...additionalContext }),
      error: (
        message: string,
        error?: Error | LogContext,
        additionalContext?: LogContext
      ) => {
        if (error instanceof Error) {
          parent.error(message, error, { ...context, ...additionalContext });
        } else {
          parent.error(message, { ...context, ...error, ...additionalContext });
        }
      },
      child: (additionalContext: LogContext) =>
        parent.child({ ...context, ...additionalContext }),
    } as Logger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);

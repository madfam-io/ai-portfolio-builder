/**
 * Centralized error logging service
 * Handles error logging with proper context and formatting
 */

import { isAppError, getErrorMessage, getErrorCode } from '@/types/errors';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  url?: string;
  method?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorLogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  code: string;
  statusCode?: number;
  stack?: string;
  context?: ErrorContext;
  details?: Record<string, unknown>;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with full context
   */
  logError(error: unknown, context?: ErrorContext): void {
    const entry = this.createErrorLogEntry(error, 'error', context);
    this.writeLog(entry);
  }

  /**
   * Log a warning
   */
  logWarning(message: string, context?: ErrorContext): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      code: 'WARNING',
      context,
    };
    this.writeLog(entry);
  }

  /**
   * Log info message
   */
  logInfo(message: string, context?: ErrorContext): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      code: 'INFO',
      context,
    };
    this.writeLog(entry);
  }

  /**
   * Create a structured error log entry
   */
  private createErrorLogEntry(
    error: unknown,
    level: 'error' | 'warn' | 'info',
    context?: ErrorContext
  ): ErrorLogEntry {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: getErrorMessage(error),
      code: getErrorCode(error),
      context,
    };

    if (isAppError(error)) {
      entry.statusCode = error.statusCode;
      entry.details = error.details;
    }

    if (error instanceof Error) {
      entry.stack = error.stack;
    }

    return entry;
  }

  /**
   * Write log entry to appropriate destination
   */
  private writeLog(entry: ErrorLogEntry): void {
    // In test environment, suppress logs unless explicitly enabled
    if (this.isTest && !process.env.ENABLE_TEST_LOGS) {
      return;
    }

    // Format the log entry
    const formattedLog = this.formatLogEntry(entry);

    // In development, use console with color coding
    if (this.isDevelopment) {
      this.writeToConsole(entry, formattedLog);
    } else {
      // In production, write structured JSON logs
      console.error(JSON.stringify(entry));
    }

    // TODO: In production, send to external logging service (e.g., Sentry, LogRocket)
    // this.sendToExternalService(entry);
  }

  /**
   * Format log entry for readable output
   */
  private formatLogEntry(entry: ErrorLogEntry): string {
    const parts = [
      `[${entry.timestamp}]`,
      `[${entry.level.toUpperCase()}]`,
      `[${entry.code}]`,
      entry.message,
    ];

    if (entry.context?.component) {
      parts.push(`Component: ${entry.context.component}`);
    }

    if (entry.context?.action) {
      parts.push(`Action: ${entry.context.action}`);
    }

    if (entry.context?.url) {
      parts.push(`URL: ${entry.context.url}`);
    }

    return parts.join(' | ');
  }

  /**
   * Write formatted log to console with color coding
   */
  private writeToConsole(entry: ErrorLogEntry, formattedLog: string): void {
    const colorMap = {
      error: '\x1b[31m', // Red
      warn: '\x1b[33m', // Yellow
      info: '\x1b[36m', // Cyan
    };
    const reset = '\x1b[0m';
    const color = colorMap[entry.level];

    console.error(`${color}${formattedLog}${reset}`);

    if (entry.stack && this.isDevelopment) {
      console.error(`${color}Stack trace:${reset}`);
      console.error(entry.stack);
    }

    if (entry.details && Object.keys(entry.details).length > 0) {
      console.error(`${color}Details:${reset}`, entry.details);
    }

    if (entry.context?.metadata && Object.keys(entry.context.metadata).length > 0) {
      console.error(`${color}Metadata:${reset}`, entry.context.metadata);
    }
  }

  /**
   * Send error to external monitoring service
   */
  public sendToExternalService(entry: ErrorLogEntry): void {
    // TODO: Implement integration with error monitoring service
    // Example: Sentry, LogRocket, Datadog, etc.
    // This would be configured based on environment variables
    console.debug('Would send error to external service:', entry.timestamp);
  }
}

// Export singleton instance
export const errorLogger = ErrorLogger.getInstance();
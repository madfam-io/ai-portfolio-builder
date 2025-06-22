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
 * Global Error Handler
 * Catches unhandled errors and promise rejections
 */

import { errorLogger } from './error-logger';

class GlobalErrorHandler {
  private static instance: GlobalErrorHandler;
  private initialized = false;

  private constructor() {}

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler();
    }
    return GlobalErrorHandler.instance;
  }

  /**
   * Initialize global error handlers
   */
  initialize(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }

    this.initialized = true;

    // Handle unhandled errors
    window.addEventListener('error', this.handleError);

    // Handle unhandled promise rejections
    window.addEventListener(
      'unhandledrejection',
      this.handleUnhandledRejection
    );

    // Log initialization
    errorLogger.logInfo('Global error handler initialized');
  }

  /**
   * Clean up event listeners
   */
  cleanup(): void {
    if (!this.initialized || typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('error', this.handleError);
    window.removeEventListener(
      'unhandledrejection',
      this.handleUnhandledRejection
    );

    this.initialized = false;
  }

  /**
   * Handle window error events
   */
  private handleError = (event: ErrorEvent): void => {
    const { error, message, filename, lineno, colno } = event;

    errorLogger.logError(error || new Error(message), {
      component: 'GlobalErrorHandler',
      metadata: {
        type: 'unhandled-error',
        filename,
        lineno,
        colno,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    });

    // Prevent default error handling in development
    if (process.env.NODE_ENV === 'development') {
      event.preventDefault();
    }
  };

  /**
   * Handle unhandled promise rejections
   */
  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    const error =
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

    errorLogger.logError(error, {
      component: 'GlobalErrorHandler',
      metadata: {
        type: 'unhandled-rejection',
        reason: event.reason,
        promise: event.promise,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    });

    // Prevent default error handling in development
    if (process.env.NODE_ENV === 'development') {
      event.preventDefault();
    }
  };

  /**
   * Report error to monitoring service
   */
  reportError(error: Error, context?: Record<string, unknown>): void {
    errorLogger.logError(error, {
      component: 'GlobalErrorHandler',
      metadata: {
        ...context,
        reportedManually: true,
      },
    });
  }
}

// Export singleton instance
export const globalErrorHandler = GlobalErrorHandler.getInstance();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  globalErrorHandler.initialize();
}

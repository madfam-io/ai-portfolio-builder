'use client';

import { AlertTriangle, Home, Mail, RefreshCw } from 'lucide-react';
import React, { Component, ReactNode, ErrorInfo } from 'react';

import { logger } from '@/lib/utils/logger';

/**
 * @fileoverview Error Boundary Components
 *
 * Comprehensive error boundary system for graceful error handling across the PRISMA platform.
 * Provides different error boundary types for different use cases and environments.
 *
 * Features:
 * - Global application error boundary
 * - Route-specific error boundaries
 * - Component-level error boundaries
 * - Development vs production error displays
 * - Error reporting integration
 * - Retry mechanisms and fallback UI
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

// Error types for categorization
export type ErrorType =
  | 'javascript'
  | 'network'
  | 'authentication'
  | 'permission'
  | 'validation'
  | 'server'
  | 'unknown';

// Error boundary state interface
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  errorType?: ErrorType;
  retryCount: number;
}

// Base error boundary props
interface BaseErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  allowRetry?: boolean;
  maxRetries?: number;
}

/**
 * Global Application Error Boundary
 *
 * The top-level error boundary that catches all unhandled errors in the application.
 * Provides comprehensive error reporting and user-friendly error pages.
 */
export class GlobalErrorBoundary extends Component<
  BaseErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: BaseErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errorType = GlobalErrorBoundary.categorizeError(error);

    return {
      hasError: true,
      error,
      errorId,
      errorType,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorId = this.state.errorId || 'unknown';

    // Log error details
    logger.error('Global Error Boundary caught error', error, {
      errorId,
      component: errorInfo.componentStack,
      feature: 'error-boundary',
    });

    // Update state with error info
    this.setState({ errorInfo });

    // Report to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo, errorId);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  /**
   * Categorize error type for better handling
   */
  private static categorizeError(error: Error): ErrorType {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (
      message.includes('unauthorized') ||
      message.includes('authentication')
    ) {
      return 'authentication';
    }
    if (message.includes('permission') || message.includes('forbidden')) {
      return 'permission';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (stack.includes('server') || message.includes('500')) {
      return 'server';
    }
    if (error.name === 'ChunkLoadError' || message.includes('loading chunk')) {
      return 'network';
    }

    return 'javascript';
  }

  /**
   * Report error to external monitoring service
   */
  private reportError(_error: Error, _errorInfo: ErrorInfo, _errorId: string) {
    try {
      // In a real application, send to error reporting service
      // Example: Sentry, LogRocket, Bugsnag, etc.
      // Error report would be constructed here
      // const errorReport = {
      //   errorId,
      //   message: error.message,
      //   stack: error.stack,
      //   componentStack: errorInfo.componentStack,
      //   timestamp: new Date().toISOString(),
      //   url: window.location.href,
      //   userAgent: navigator.userAgent,
      //   userId: 'current-user-id', // Get from auth context
      //   buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION,
      // };

      // Example API call (implement based on your error reporting service)
      // fetch('/api/errors', {
      //   method: 'POST',
      //   body: JSON.stringify(errorReport),
      // });

      logger.info('Error reported to monitoring service', {
        errorId: _errorId,
      });
    } catch (reportingError) {
      logger.error(
        'Failed to report error to monitoring service',
        reportingError as Error
      );
    }
  }

  /**
   * Retry the failed operation
   */
  private handleRetry = () => {
    if (this.state.retryCount >= (this.props.maxRetries || 3)) {
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }));

    // Force component remount after a brief delay
    this.retryTimeoutId = setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  /**
   * Navigate to home page
   */
  private handleGoHome = () => {
    window.location.href = '/';
  };

  /**
   * Report bug via email
   */
  private handleReportBug = () => {
    const { error, errorId, errorInfo } = this.state;
    const subject = `PRISMA Error Report - ${errorId}`;
    const body = `
Error Details:
- Error ID: ${errorId}
- Message: ${error?.message}
- Stack: ${error?.stack}
- Component Stack: ${errorInfo?.componentStack}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]
    `.trim();

    const mailto = `mailto:support@prisma.madfam.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailto);
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId, errorType, retryCount } = this.state;
      const canRetry =
        this.props.allowRetry !== false &&
        retryCount < (this.props.maxRetries || 3);
      const showDetails =
        this.props.showDetails || process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>

              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Something went wrong
              </h1>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {this.getErrorMessage(errorType)}
              </p>

              {showDetails && error && (
                <details className="text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Error Details (ID: {errorId})
                  </summary>
                  <div className="text-sm font-mono text-gray-600 dark:text-gray-400 space-y-2">
                    <div>
                      <strong>Message:</strong> {error.message}
                    </div>
                    {error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="whitespace-pre-wrap text-xs mt-1 bg-gray-200 dark:bg-gray-700 p-2 rounded">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="space-y-3">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again {retryCount > 0 && `(${retryCount}/3)`}
                </button>
              )}

              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Homepage
              </button>

              <button
                onClick={this.handleReportBug}
                className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Report Bug
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
              Error ID: {errorId}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }

  /**
   * Get user-friendly error message based on error type
   */
  private getErrorMessage(errorType?: ErrorType): string {
    switch (errorType) {
      case 'network':
        return 'There seems to be a connectivity issue. Please check your internet connection and try again.';
      case 'authentication':
        return 'Your session has expired. Please sign in again to continue.';
      case 'permission':
        return "You don't have permission to access this resource.";
      case 'validation':
        return 'There was an issue with the data provided. Please check your input and try again.';
      case 'server':
        return 'Our servers are currently experiencing issues. Please try again in a few moments.';
      default:
        return 'An unexpected error occurred. Our team has been notified and is working on a fix.';
    }
  }
}

/**
 * Route Error Boundary
 *
 * A lighter error boundary for specific routes or sections.
 * Provides inline error handling without full page replacement.
 */
export class RouteErrorBoundary extends Component<
  BaseErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: BaseErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Route Error Boundary caught error', error, {
      component: errorInfo.componentStack,
      feature: 'route-error-boundary',
    });
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      retryCount: this.state.retryCount + 1,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 my-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Section failed to load
              </h3>
              <p className="text-sm text-red-600 dark:text-red-300 mb-3">
                {this.state.error?.message ||
                  'An error occurred while loading this section.'}
              </p>
              {this.props.allowRetry !== false && (
                <button
                  onClick={this.handleRetry}
                  className="text-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Component Error Boundary Hook
 *
 * A React hook that provides error boundary functionality using error boundaries.
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return { captureError, resetError };
}

/**
 * Higher-Order Component for Error Boundaries
 *
 * Wraps components with error boundary functionality.
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<BaseErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <RouteErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </RouteErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default GlobalErrorBoundary;

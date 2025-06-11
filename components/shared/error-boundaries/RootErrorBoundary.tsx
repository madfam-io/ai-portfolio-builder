/**
 * @fileoverview Root Error Boundary
 *
 * The top-level error boundary for the entire PRISMA application.
 * Provides comprehensive error handling with monitoring integration.
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome, FiMail } from 'react-icons/fi';
import { logger } from '@/lib/utils/logger';
import {
  serializeError,
  getUserFriendlyMessage,
  getErrorContext,
} from '@/lib/utils/error-handling/error-utils';
import { useLanguage } from '@/lib/i18n/refactored-context';

interface RootErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface RootErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
  retryCount: number;
  isRecovering: boolean;
}

/**
 * Root Error Boundary Component
 * Catches all uncaught errors in the React component tree
 */
export class RootErrorBoundary extends Component<
  RootErrorBoundaryProps,
  RootErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: RootErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<RootErrorBoundaryState> {
    const errorId = `root_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { errorId } = this.state;
    const errorContext = getErrorContext();

    // Log to monitoring service
    logger.error('Root Error Boundary Caught Error', {
      errorId,
      error: serializeError(error),
      errorInfo,
      context: errorContext,
      retryCount: this.state.retryCount,
    });

    this.setState({ errorInfo });

    // Call parent error handler
    this.props.onError?.(error, errorInfo);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportToMonitoring(error, errorInfo, errorContext);
    }
  }

  private reportToMonitoring(error: Error, errorInfo: ErrorInfo, context: any) {
    // Integration with error monitoring service
    // This would be replaced with actual service integration (Sentry, LogRocket, etc.)
    fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        errorId: this.state.errorId,
        error: serializeError(error),
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        context,
        timestamp: new Date().toISOString(),
      }),
    }).catch(err => {
      console.error('Failed to report error to monitoring:', err);
    });
  }

  private handleRetry = () => {
    if (this.state.retryCount >= 3) {
      logger.warn('Max retry attempts reached');
      return;
    }

    this.setState({ isRecovering: true });

    // Clear error state
    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
        isRecovering: false,
      }));
    }, 1000);
  };

  private handleHardReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorId } = this.state;
    const subject = `PRISMA Error Report - ${errorId}`;
    const body = `
Error Details:
- Error ID: ${errorId}
- Message: ${error?.message}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

Please describe what you were doing when this error occurred:
[Your description here]
    `.trim();

    window.location.href = `mailto:support@prisma.madfam.io?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    const { hasError, error, errorId, retryCount, isRecovering } = this.state;

    if (hasError && !isRecovering) {
      return (
        <RootErrorFallback
          error={error}
          errorId={errorId}
          retryCount={retryCount}
          onRetry={this.handleRetry}
          onHardReload={this.handleHardReload}
          onGoHome={this.handleGoHome}
          onReportBug={this.handleReportBug}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Root Error Fallback Component
 */
function RootErrorFallback({
  error,
  errorId,
  retryCount,
  onRetry,
  onHardReload,
  onGoHome,
  onReportBug,
}: {
  error?: Error;
  errorId?: string;
  retryCount: number;
  onRetry: () => void;
  onHardReload: () => void;
  onGoHome: () => void;
  onReportBug: () => void;
}) {
  const { t } = useLanguage();
  const isDevelopment = process.env.NODE_ENV === 'development';
  const canRetry = retryCount < 3;
  const userMessage = getUserFriendlyMessage(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
          {/* Error Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <FiAlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {(t.errors as any)?.rootErrorTitle ||
                'Oops! Something went wrong'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {userMessage}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              {(t.errors as any)?.errorId || 'Error ID'}:{' '}
              <span className="font-mono">{errorId}</span>
            </p>
          </div>

          {/* Error Details (Development Only) */}
          {isDevelopment && error && (
            <details className="mb-8 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                {(t.errors as any)?.technicalDetails || 'Technical Details'}
              </summary>
              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Error Message:
                  </p>
                  <p className="text-sm font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {error.message}
                  </p>
                </div>
                {error.stack && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Stack Trace:
                    </p>
                    <pre className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {canRetry && (
              <button
                onClick={onRetry}
                className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiRefreshCw className="w-5 h-5" />
                {(t.errors as any)?.tryAgain || 'Try Again'}
                {retryCount > 0 && ` (${retryCount}/3)`}
              </button>
            )}

            {!canRetry && (
              <button
                onClick={onHardReload}
                className="w-full flex items-center justify-center gap-3 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <FiRefreshCw className="w-5 h-5" />
                {(t.errors as any)?.reloadPage || 'Reload Page'}
              </button>
            )}

            <button
              onClick={onGoHome}
              className="w-full flex items-center justify-center gap-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <FiHome className="w-5 h-5" />
              {(t.errors as any)?.goToHomepage || 'Go to Homepage'}
            </button>

            <button
              onClick={onReportBug}
              className="w-full flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <FiMail className="w-5 h-5" />
              {(t.errors as any)?.reportBug || 'Report Bug'}
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {(t.errors as any)?.persistentError ||
                'If the error persists, please contact support'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RootErrorBoundary;

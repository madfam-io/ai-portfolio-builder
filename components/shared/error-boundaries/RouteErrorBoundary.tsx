'use client';

import { useRouter } from 'next/navigation';
import React, { Component, ReactNode, ErrorInfo } from 'react';
import { FiAlertTriangle, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

import { useLanguage } from '@/lib/i18n/refactored-context';
import {
  serializeError,
  getErrorType,
} from '@/lib/utils/error-handling/error-utils';
import { logger } from '@/lib/utils/logger';

/**
 * @fileoverview Route Error Boundary
 *
 * Page-level error boundary for handling route-specific errors.
 * Provides inline error handling without full page replacement.
 */

interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  inline?: boolean;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  isRecovering: boolean;
}

/**
 * Route Error Boundary Component
 * Handles errors at the page/route level
 */
export class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<RouteErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { routeName } = this.props;

    logger.error('Route Error Boundary Caught Error', {
      routeName,
      error: serializeError(error),
      errorInfo,
      errorType: getErrorType(error),
    });

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ isRecovering: true });

    // Reset error state after a brief delay
    setTimeout(() => {
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        isRecovering: false,
      });
    }, 500);
  };

  render() {
    const { hasError, error, isRecovering } = this.state;
    const { children, fallback, inline, showDetails } = this.props;

    if (hasError && !isRecovering) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return inline ? (
        <InlineErrorFallback
          error={error}
          onRetry={this.handleRetry}
          showDetails={showDetails}
        />
      ) : (
        <FullPageErrorFallback
          error={error}
          onRetry={this.handleRetry}
          showDetails={showDetails}
        />
      );
    }

    return children;
  }
}

/**
 * Inline Error Fallback Component
 * Shows error within the page layout
 */
function InlineErrorFallback({
  error,
  onRetry,
  showDetails,
}: {
  error?: Error;
  onRetry: () => void;
  showDetails?: boolean;
}) {
  const { t } = useLanguage();
  const errorType = error ? getErrorType(error) : 'unknown';

  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 my-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            {(t as any).errors?.sectionError || 'Section Error'}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            {(t as any).errors?.[`${errorType}Error`] ||
              (t as any).errors?.genericError ||
              'An error occurred'}
          </p>

          {showDetails && error && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-red-600 dark:text-red-400 hover:underline">
                {(t as any).errors?.showDetails || 'Show Details'}
              </summary>
              <pre className="mt-2 text-xs bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-x-auto">
                {error.message}
              </pre>
            </details>
          )}

          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            {(t as any).errors?.tryAgain || 'Try Again'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Full Page Error Fallback Component
 * Replaces entire page content
 */
function FullPageErrorFallback({
  error,
  onRetry,
  showDetails,
}: {
  error?: Error;
  onRetry: () => void;
  showDetails?: boolean;
}) {
  const { t } = useLanguage();
  const router = useRouter();
  const errorType = error ? getErrorType(error) : 'unknown';

  const handleGoBack = (): void => {
    router.back();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <FiAlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {(t as any).errors?.pageError || 'Page Error'}
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {(t as any).errors?.[`${errorType}Error`] ||
              (t as any).errors?.genericError ||
              'An error occurred'}
          </p>

          {showDetails && error && (
            <details className="text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 mb-2">
                {(t as any).errors?.technicalDetails || 'Technical Details'}
              </summary>
              <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FiRefreshCw className="w-4 h-4" />
            {(t as any).errors?.tryAgain || 'Try Again'}
          </button>

          <button
            onClick={handleGoBack}
            className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            <FiArrowLeft className="w-4 h-4" />
            {(t as any).errors?.goBack || 'Go Back'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Higher-Order Component for Route Error Boundaries
 */
export function withRouteErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Partial<RouteErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <RouteErrorBoundary {...options}>
      <Component {...props} />
    </RouteErrorBoundary>
  );

  WrappedComponent.displayName = `withRouteErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default RouteErrorBoundary;

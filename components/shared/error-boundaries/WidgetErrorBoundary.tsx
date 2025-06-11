/**
 * @fileoverview Widget Error Boundary
 *
 * Component-level error boundary for handling widget/component-specific errors.
 * Provides granular error handling for individual UI components.
 */

'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { logger } from '@/lib/utils/logger';
import { serializeError } from '@/lib/utils/error-handling/error-utils';
import { useLanguage } from '@/lib/i18n/refactored-context';

interface WidgetErrorBoundaryProps {
  children: ReactNode;
  widgetName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
  isolate?: boolean;
  showError?: boolean;
  compact?: boolean;
}

interface WidgetErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorCount: number;
  lastResetKeys?: Array<string | number>;
}

/**
 * Widget Error Boundary Component
 * Handles errors at the component/widget level
 */
export class WidgetErrorBoundary extends Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorCount: 0,
      lastResetKeys: props.resetKeys,
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): Partial<WidgetErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  static getDerivedStateFromProps(
    props: WidgetErrorBoundaryProps,
    state: WidgetErrorBoundaryState
  ): Partial<WidgetErrorBoundaryState> | null {
    // Reset error boundary when resetKeys change
    if (props.resetKeys && state.lastResetKeys) {
      const hasChanged = props.resetKeys.some(
        (key, index) => key !== state.lastResetKeys![index]
      );

      if (hasChanged) {
        return {
          hasError: false,
          error: undefined,
          errorCount: 0,
          lastResetKeys: props.resetKeys,
        };
      }
    }

    // Reset on any props change if enabled
    if (props.resetOnPropsChange && state.hasError) {
      return {
        hasError: false,
        error: undefined,
        errorCount: state.errorCount,
      };
    }

    return null;
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { widgetName, isolate } = this.props;

    // Log widget error
    logger.warn('Widget Error Boundary Caught Error', {
      widgetName,
      error: serializeError(error),
      errorInfo,
      errorCount: this.state.errorCount + 1,
      isolated: isolate,
    });

    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1,
    }));

    this.props.onError?.(error, errorInfo);

    // If not isolated, re-throw after logging
    if (!isolate && this.state.errorCount > 3) {
      throw error;
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
    });
  };

  render() {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback, showError, compact, widgetName } = this.props;

    if (hasError) {
      if (fallback) {
        return <>{fallback}</>;
      }

      if (compact) {
        return (
          <CompactErrorFallback
            widgetName={widgetName}
            error={error}
            errorCount={errorCount}
            onRetry={this.handleRetry}
            showError={showError}
          />
        );
      }

      return (
        <StandardErrorFallback
          widgetName={widgetName}
          error={error}
          errorCount={errorCount}
          onRetry={this.handleRetry}
          showError={showError}
        />
      );
    }

    return children;
  }
}

/**
 * Compact Error Fallback for small widgets
 */
function CompactErrorFallback({
  widgetName: _widgetName,
  error,
  errorCount,
  onRetry,
  showError,
}: {
  widgetName?: string;
  error?: Error;
  errorCount: number;
  onRetry: () => void;
  showError?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="text-center">
        <FiAlertCircle className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {(t.errors as any)?.widgetError || 'Widget Error'}
        </p>
        {showError && error && (
          <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 font-mono">
            {error.message}
          </p>
        )}
        {errorCount < 3 && (
          <button
            onClick={onRetry}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
          >
            <FiRefreshCw className="w-3 h-3" />
            {(t.errors as any)?.retry || 'Retry'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Standard Error Fallback for regular widgets
 */
function StandardErrorFallback({
  widgetName,
  error,
  errorCount,
  onRetry,
  showError,
}: {
  widgetName?: string;
  error?: Error;
  errorCount: number;
  onRetry: () => void;
  showError?: boolean;
}) {
  const { t } = useLanguage();

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
            {widgetName
              ? `${widgetName} ${(t.errors as any)?.error || 'Error'}`
              : (t.errors as any)?.widgetError || 'Widget Error'}
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
            {(t.errors as any)?.widgetErrorDescription ||
              'Something went wrong with this component'}
          </p>

          {showError && error && (
            <details className="mb-2">
              <summary className="cursor-pointer text-xs text-yellow-600 dark:text-yellow-400 hover:underline">
                {(t.errors as any)?.showDetails || 'Show Details'}
              </summary>
              <pre className="mt-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded overflow-x-auto">
                {error.message}
              </pre>
            </details>
          )}

          {errorCount < 3 && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1 text-sm bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200 px-3 py-1 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
            >
              <FiRefreshCw className="w-3 h-3" />
              {(t.errors as any)?.tryAgain || 'Try Again'}
            </button>
          )}

          {errorCount >= 3 && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              {(t.errors as any)?.maxRetriesReached ||
                'Maximum retries reached'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook for widget error handling
 */
export function useWidgetError() {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const throwError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { throwError, clearError };
}

/**
 * Higher-Order Component for Widget Error Boundaries
 */
export function withWidgetErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Partial<WidgetErrorBoundaryProps>
) {
  const WrappedComponent = (props: P) => (
    <WidgetErrorBoundary {...options}>
      <Component {...props} />
    </WidgetErrorBoundary>
  );

  WrappedComponent.displayName = `withWidgetErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default WidgetErrorBoundary;

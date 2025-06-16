'use client';

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { errorLogger } from '@/lib/services/error/error-logger';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  resetKeys?: Array<string | number>;
  isolate?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: NodeJS.Timeout | null = null;
  private previousResetKeys: Array<string | number> = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { onError } = this.props;
    const { errorCount } = this.state;

    // Log error with context
    errorLogger.logError(error, {
      component: errorInfo.componentStack || undefined,
      metadata: {
        errorCount: errorCount + 1,
        errorInfo: errorInfo,
      },
    });

    // Update state with error info
    this.setState({
      errorInfo,
      errorCount: errorCount + 1,
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Auto-reset after 3 errors to prevent infinite loops
    if (errorCount >= 2) {
      this.scheduleReset(5000);
    }
  }

  componentDidUpdate(prevProps: Props): void {
    const { resetKeys } = this.props;

    // Reset error boundary if resetKeys change
    if (
      resetKeys &&
      prevProps.resetKeys &&
      !this.areResetKeysEqual(resetKeys, this.previousResetKeys)
    ) {
      this.resetErrorBoundary();
    }
    this.previousResetKeys = resetKeys || [];
  }

  componentWillUnmount(): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  areResetKeysEqual(
    keys1: Array<string | number>,
    keys2: Array<string | number>
  ): boolean {
    if (keys1.length !== keys2.length) return false;
    return keys1.every((key, index) => key === keys2[index]);
  }

  scheduleReset(delay: number): void {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = setTimeout(() => {
      this.resetErrorBoundary();
    }, delay);
  }

  resetErrorBoundary = (): void => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
      this.resetTimeoutId = null;
    }

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  render(): ReactNode {
    const { hasError, error, errorCount } = this.state;
    const { children, fallback, showDetails = false, isolate = false } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <div className={`${isolate ? '' : 'min-h-screen'} flex items-center justify-center p-4`}>
          <Card className="max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <h2 className="text-xl font-semibold">Something went wrong</h2>
            </div>

            <p className="text-muted-foreground">
              We apologize for the inconvenience. An unexpected error occurred.
            </p>

            {showDetails && process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="font-mono text-sm text-destructive">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="mt-2 text-xs overflow-x-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}

            {errorCount > 2 && (
              <p className="text-sm text-amber-600">
                Multiple errors detected. The page will refresh automatically in a few seconds.
              </p>
            )}

            <Button
              onClick={this.resetErrorBoundary}
              className="w-full"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </Card>
        </div>
      );
    }

    return children;
  }
}

/**
 * Specialized error boundary for isolated components
 */
export function ComponentErrorBoundary({
  children,
  fallback,
  componentName,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  componentName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
            <p className="text-sm text-destructive">
              Failed to load {componentName || 'component'}
            </p>
          </div>
        )
      }
      isolate
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Hook to wrap async operations with error handling
 */
export function useErrorHandler() {
  return React.useCallback((error: Error, context?: Record<string, unknown>) => {
    errorLogger.logError(error, {
      component: 'useErrorHandler',
      metadata: context,
    });
  }, []);
}
'use client';

import React from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/utils/logger';

interface ComponentErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  componentName?: string;
}

interface ComponentErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ComponentErrorBoundary extends React.Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ComponentErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error(
      `Component error boundary caught error in ${this.props.componentName || 'unknown'}`,
      error,
      {
        componentStack: errorInfo.componentStack,
        digest: errorInfo.digest,
      }
    );
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;
      if (Fallback) {
        return <Fallback error={this.state.error} reset={this.handleReset} />;
      }

      return (
        <DefaultComponentError
          error={this.state.error}
          reset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultComponentErrorProps {
  error: Error;
  reset: () => void;
}

function DefaultComponentError({ error, reset }: DefaultComponentErrorProps) {
  return (
    <Alert variant="destructive" className="m-4">
      <AlertTitle>Component Error</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm">{error.message}</p>
        <Button size="sm" variant="outline" onClick={reset} className="mt-3">
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
) {
  return React.forwardRef<any, P>((props, ref) => (
    <ComponentErrorBoundary componentName={componentName} fallback={fallback}>
      <Component {...(props as P)} ref={ref} />
    </ComponentErrorBoundary>
  ));
}

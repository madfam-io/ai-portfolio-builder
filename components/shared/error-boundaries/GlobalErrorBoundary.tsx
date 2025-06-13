'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { logger } from '@/lib/utils/logger';


interface GlobalErrorBoundaryProps {
  children: React.ReactNode;
}

interface GlobalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GlobalErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    logger.error('Global error boundary caught error', error, {
      componentStack: errorInfo.componentStack,
      digest: errorInfo.digest,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback error={this.state.error} onReset={this.handleReset} />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-destructive">
            {(t as unknown).errors?.unexpectedError || 'Unexpected Error'}
          </CardTitle>
          <CardDescription>
            {(t as unknown).errors?.somethingWentWrong ||
              'Something went wrong. Please try again.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>
              {(t as unknown).errors?.errorDetails || 'Error Details'}
            </AlertTitle>
            <AlertDescription className="mt-2 font-mono text-sm">
              {error?.message || 'Unknown error occurred'}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={onReset} variant="default">
            {(t as unknown).errors?.tryAgain || 'Try Again'}
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
          >
            {(t as unknown).navigation?.home || 'Go Home'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

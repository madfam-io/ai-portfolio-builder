'use client';

import { useEffect } from 'react';
import { globalErrorHandler } from '@/lib/services/error/global-error-handler';
import { ErrorBoundary } from '@/components/error/error-boundary';

interface ErrorProviderProps {
  children: React.ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  useEffect(() => {
    // Initialize global error handler
    globalErrorHandler.initialize();

    // Cleanup on unmount
    return () => {
      globalErrorHandler.cleanup();
    };
  }, []);

  return (
    <ErrorBoundary
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        globalErrorHandler.reportError(error, {
          errorBoundary: true,
          componentStack: errorInfo.componentStack,
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
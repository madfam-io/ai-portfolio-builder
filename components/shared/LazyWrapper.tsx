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

'use client';

import React, { Suspense, ComponentType, ReactNode } from 'react';

/**
 * @fileoverview Lazy Loading Wrapper Component
 *
 * A reusable wrapper for implementing lazy loading with error boundaries
 * and loading states. Optimizes performance by code-splitting heavy components.
 *
 * Features:
 * - Automatic lazy loading with React.lazy()
 * - Built-in error boundary for graceful error handling
 * - Customizable loading states and fallbacks
 * - TypeScript support with proper prop forwarding
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

interface LazyWrapperProps<T = Record<string, unknown>> {
  /** The component to lazy load */
  component: () => Promise<{ default: ComponentType<T> }>;
  /** Loading fallback component */
  fallback?: ReactNode;
  /** Error fallback component */
  errorFallback?: ReactNode;
  /** Props to pass to the lazy component */
  componentProps?: T;
  /** Additional CSS classes for the wrapper */
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary for Lazy Components
 *
 * Catches and handles errors that occur during lazy loading
 * or component rendering, preventing the entire app from crashing.
 */
class LazyErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // errorReportingService.captureException(_error, { extra: _errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-8 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-center">
            <div className="text-red-600 text-lg font-semibold mb-2">
              Something went wrong
            </div>
            <div className="text-red-500 text-sm mb-4">
              Failed to load component. Please try refreshing the page.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Default Loading Component
 *
 * Provides a consistent loading experience across the application
 * with skeleton-style animation and proper accessibility.
 */
const DefaultLoadingFallback: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div
    className={`animate-pulse ${className}`}
    role="status"
    aria-label="Loading content"
  >
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-6">
      <div className="flex space-x-4">
        <div className="rounded-full bg-gray-300 dark:bg-gray-600 h-12 w-12"></div>
        <div className="flex-1 space-y-2 py-1">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-4/6"></div>
      </div>
    </div>
    <span className="sr-only">Loading...</span>
  </div>
);

/**
 * LazyWrapper Component
 *
 * A performance-optimized wrapper that implements lazy loading for heavy components.
 *
 * @example
 * ```tsx
 * import { LazyWrapper } from '@/components/shared/LazyWrapper';
 *
 * // Lazy load a heavy analytics component
 * <LazyWrapper
 *   component={() => import('@/components/analytics/AnalyticsDashboard')}
 *   fallback={<div>Loading analytics...</div>}
 *   componentProps={{ userId: 'user-123' }}
 * />
 * ```
 */
export const LazyWrapper = <
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  component,
  fallback,
  errorFallback,
  componentProps = {} as T,
  className = '',
}: LazyWrapperProps<T>) => {
  // Create the lazy component
  const LazyComponent = React.lazy(component);

  return (
    <div className={className}>
      <LazyErrorBoundary fallback={errorFallback}>
        <Suspense
          fallback={
            fallback || <DefaultLoadingFallback className={className} />
          }
        >
          <LazyComponent {...componentProps} />
        </Suspense>
      </LazyErrorBoundary>
    </div>
  );
};

/**
 * Higher-Order Component for Lazy Loading
 *
 * A utility HOC that wraps components with lazy loading capabilities.
 * Useful for automatically making components lazy-loadable.
 */
export function withLazyLoading<P extends object>(
  importComponent: () => Promise<{ default: ComponentType<P> }>,
  options: {
    fallback?: ReactNode;
    errorFallback?: ReactNode;
  } = {}
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyWrapper
        component={
          importComponent as () => Promise<{ default: ComponentType<unknown> }>
        }
        fallback={options.fallback}
        errorFallback={options.errorFallback}
        componentProps={props as Record<string, unknown>}
      />
    );
  };
}

// /**
//  * Hook for Lazy Loading with Manual Control
//  *
//  * Provides more granular control over lazy loading behavior.
//  * Useful when you need to conditionally load components.
//  */
// function useLazyComponent<T extends ComponentType<unknown>>(
//   importComponent: () => Promise<{ default: T }>,
//   shouldLoad: boolean = true
// ) {
//   const [LazyComponent, setLazyComponent] = React.useState<T | null>(null);
//   const [isLoading, setIsLoading] = React.useState(false);
//   const [error, setError] = React.useState<Error | null>(null);

//   React.useEffect(() => {
//     if (!shouldLoad || LazyComponent) return;

//     setIsLoading(true);
//     setError(null);

//     importComponent()
//       .then(module => {
//         setLazyComponent(() => module.default);
//       })
//       .catch(err => {
//         setError(
//           err instanceof Error ? err : new Error('Failed to load component')
//         );
//       })
//       .finally(() => {
//         setIsLoading(false);
//       });
//   }, [shouldLoad, LazyComponent, importComponent]);

//   return {
//     LazyComponent,
//     isLoading,
//     error,
//     reload: () => {
//       setLazyComponent(null);
//       setError(null);
//     },
//   };
// }

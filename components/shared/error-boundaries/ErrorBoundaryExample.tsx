/**
 * @fileoverview Error Boundary Usage Examples
 * 
 * Demonstrates how to use the various error boundaries and fallback components
 * throughout the PRISMA application.
 */

'use client';

import React, { useState } from 'react';
import { RootErrorBoundary } from './RootErrorBoundary';
import { RouteErrorBoundary } from './RouteErrorBoundary';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import {
  FullPageLoader,
  InlineLoader,
  CardSkeleton,
  NoPortfoliosState,
  ErrorState,
  OfflineIndicator
} from '../fallbacks';

/**
 * Component that throws an error for testing
 */
function BuggyComponent({ shouldError }: { shouldError: boolean }) {
  if (shouldError) {
    throw new Error('Test error for demonstration purposes');
  }
  return <div className="p-4 bg-green-100 rounded">✅ Component working normally</div>;
}

/**
 * Component that simulates loading state
 */
function LoadingComponent({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return <CardSkeleton count={3} />;
  }
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-100 rounded">📦 Content loaded successfully</div>
      <div className="p-4 bg-blue-100 rounded">📦 More content here</div>
      <div className="p-4 bg-blue-100 rounded">📦 Even more content</div>
    </div>
  );
}

/**
 * Component that shows empty state
 */
function DataComponent({ hasData }: { hasData: boolean }) {
  if (!hasData) {
    return (
      <NoPortfoliosState
        onCreatePortfolio={() => alert('Create portfolio clicked!')}
      />
    );
  }
  return <div className="p-4 bg-green-100 rounded">📊 Data displayed here</div>;
}

/**
 * Error Boundary Examples Component
 */
export default function ErrorBoundaryExample() {
  const [triggerError, setTriggerError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasData, setHasData] = useState(true);

  const handleTriggerError = () => {
    setTriggerError(true);
    // Reset after a delay for demo purposes
    setTimeout(() => setTriggerError(false), 5000);
  };

  const handleToggleLoading = () => {
    setIsLoading(!isLoading);
  };

  const handleToggleData = () => {
    setHasData(!hasData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Error Boundary & Fallback Examples
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Demonstration of comprehensive error handling and fallback components
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Controls</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleTriggerError}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Trigger Error
            </button>
            <button
              onClick={handleToggleLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Toggle Loading ({isLoading ? 'ON' : 'OFF'})
            </button>
            <button
              onClick={handleToggleData}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Toggle Data ({hasData ? 'WITH DATA' : 'EMPTY'})
            </button>
          </div>
        </div>
      </div>

      {/* Root Error Boundary Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Root Error Boundary</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Catches all uncaught errors in the component tree with full-page fallback
        </p>
        <RootErrorBoundary>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <BuggyComponent shouldError={triggerError} />
          </div>
        </RootErrorBoundary>
      </section>

      {/* Route Error Boundary Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Route Error Boundary</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Handles page-level errors with inline error display
        </p>
        <RouteErrorBoundary routeName="Example Page" inline>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <BuggyComponent shouldError={triggerError} />
          </div>
        </RouteErrorBoundary>
      </section>

      {/* Widget Error Boundary Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Widget Error Boundary</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Handles component-level errors with compact fallback
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WidgetErrorBoundary widgetName="Example Widget" compact>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <BuggyComponent shouldError={triggerError} />
            </div>
          </WidgetErrorBoundary>
          <WidgetErrorBoundary widgetName="Another Widget" showError>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
              <BuggyComponent shouldError={false} />
            </div>
          </WidgetErrorBoundary>
        </div>
      </section>

      {/* Loading States Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Loading States</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Various loading indicators and skeleton screens
        </p>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <h3 className="font-medium mb-2">Inline Loader</h3>
            <InlineLoader message="Loading content..." />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <h3 className="font-medium mb-2">Skeleton Loading</h3>
            <LoadingComponent isLoading={isLoading} />
          </div>
        </div>
      </section>

      {/* Empty States Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Empty States</h2>
        <p className="text-gray-600 dark:text-gray-400">
          User-friendly empty state displays with call-to-action
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
          <DataComponent hasData={hasData} />
        </div>
      </section>

      {/* Error States Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Error States</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Different error state displays for various error types
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <ErrorState
              errorType="network"
              compact
              onRetry={() => alert('Retry clicked!')}
            />
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <ErrorState
              errorType="permission"
              compact
              onRetry={() => alert('Permission request clicked!')}
            />
          </div>
        </div>
      </section>

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* Usage Instructions */}
      <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-medium">Root Error Boundary</h3>
            <p>Wrap your entire app or major sections. Provides full-page error handling.</p>
            <code className="block mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {`<RootErrorBoundary><App /></RootErrorBoundary>`}
            </code>
          </div>
          <div>
            <h3 className="font-medium">Route Error Boundary</h3>
            <p>Wrap individual pages or routes. Provides inline error handling.</p>
            <code className="block mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {`<RouteErrorBoundary routeName="Dashboard"><Page /></RouteErrorBoundary>`}
            </code>
          </div>
          <div>
            <h3 className="font-medium">Widget Error Boundary</h3>
            <p>Wrap individual components. Provides granular error isolation.</p>
            <code className="block mt-1 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              {`<WidgetErrorBoundary widgetName="Chart"><Chart /></WidgetErrorBoundary>`}
            </code>
          </div>
        </div>
      </section>
    </div>
  );
}
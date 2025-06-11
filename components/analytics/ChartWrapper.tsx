/**
 * Chart wrapper component with loading state
 * Handles Suspense for lazy-loaded chart components
 */

import React, { Suspense } from 'react';

interface ChartWrapperProps {
  children: React.ReactNode;
  height?: number;
}

const ChartLoader = ({ height = 300 }: { height?: number }) => (
  <div 
    className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
    style={{ height: `${height}px` }}
  >
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="h-full bg-gray-100 dark:bg-gray-900 rounded"></div>
  </div>
);

export const ChartWrapper = React.memo(function ChartWrapper({ children, height }: ChartWrapperProps) {
  return (
    <Suspense fallback={<ChartLoader height={height} />}>
      {children}
    </Suspense>
  );
});
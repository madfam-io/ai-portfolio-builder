/**
 * Lazy-loaded analytics components
 * Splits heavy chart dependencies (Recharts) from main bundle
 */

import dynamic from 'next/dynamic';
import React from 'react';

// Loading component for charts
const ChartLoader = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded"></div>
  </div>
);

// Lazy load chart components - Recharts is a heavy dependency (~300KB)
export const CommitsChart = dynamic(() => import('./CommitsChart'), {
  loading: ChartLoader,
  ssr: false,
});

export const PullRequestsChart = dynamic(() => import('./PullRequestsChart'), {
  loading: ChartLoader,
  ssr: false,
});

// Preload analytics components
export function preloadAnalyticsComponents(): Promise<void> {
  return Promise.all([
    import('./CommitsChart'),
    import('./PullRequestsChart'),
  ]).then(() => {});
}

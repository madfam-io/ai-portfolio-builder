'use client';

import { withLazyLoading } from '@/components/shared/LazyWrapper';

/**
 * Lazy-loaded chart components for analytics
 *
 * Reduces initial bundle size by ~60KB by loading recharts only when needed
 */

export const RepositoryCommitsChart = withLazyLoading(
  () => import('./RepositoryCommitsChart'),
  {
    fallback: (
      <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">
          Loading chart...
        </span>
      </div>
    ),
  }
);

export const RepositoryLanguagesChart = withLazyLoading(
  () => import('./RepositoryLanguagesChart'),
  {
    fallback: (
      <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
        <span className="text-gray-500 dark:text-gray-400">
          Loading chart...
        </span>
      </div>
    ),
  }
);

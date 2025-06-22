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

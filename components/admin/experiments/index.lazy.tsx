/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import dynamic from 'next/dynamic';
import React from 'react';

/**
 * Lazy-loaded admin experiment components
 * Splits heavy chart dependencies from main bundle
 */

// Loading component for charts
const ChartLoader = (): React.JSX.Element => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
    <div className="h-64 bg-gray-100 dark:bg-gray-900 rounded"></div>
  </div>
);

// Lazy load chart components to reduce bundle size
export const ConversionChart = dynamic(
  () => import('./charts/ConversionChart'),
  {
    loading: ChartLoader,
    ssr: false,
  }
);

// Preload admin components
export function preloadAdminComponents(): Promise<void> {
  return Promise.all([import('./charts/ConversionChart')]).then(() => {});
}

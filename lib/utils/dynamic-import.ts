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

/**
 * Dynamic Import Utilities
 *
 * Helpers for optimizing bundle size through dynamic imports
 * and code splitting strategies
 */

import dynamic from 'next/dynamic';

import type { ComponentType, ReactNode } from 'react';

/**
 * Default loading function for heavy modules
 */
const defaultLoadingFn = () => null;

/**
 * Create a dynamically imported component with loading state
 *
 * @param importFn - Function that returns the component import
 * @param options - Dynamic import options
 * @returns Dynamically imported component
 */
export function createDynamicComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    loading?: () => ReactNode;
    ssr?: boolean;
  }
): ComponentType<P> {
  return dynamic(importFn, {
    loading: options?.loading || defaultLoadingFn,
    ssr: options?.ssr ?? true,
  });
}

/**
 * Preload a dynamic component
 *
 * Useful for preloading components that will be needed soon
 * but not immediately (e.g., on hover, on route change)
 *
 * @param importFn - Function that returns the component import
 */
export function preloadComponent(
  importFn: () => Promise<{ default: ComponentType<any> }>
): void {
  // Simply calling the import function will trigger the download
  importFn().catch(() => {
    // Silently fail if preload fails
  });
}

/**
 * Create a route-based dynamic component
 *
 * Automatically handles loading states and error boundaries
 * for route-level components
 */
export function createRouteComponent<P = {}>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options?: {
    fallback?: () => ReactNode;
  }
): ComponentType<P> {
  return dynamic(importFn, {
    loading: options?.fallback || defaultLoadingFn,
    ssr: true,
  });
}

/**
 * Bundle size optimization strategies
 */
export const optimizationStrategies = {
  /**
   * Split vendor chunks for better caching
   */
  splitVendorChunks: {
    react: ['react', 'react-dom'],
    ui: ['@mui/material', '@emotion/react', '@emotion/styled'],
    charts: ['recharts', 'd3-scale', 'd3-shape'],
    utils: ['lodash', 'date-fns', 'clsx'],
  },

  /**
   * Components that should always be lazy loaded
   */
  alwaysLazy: [
    'charts',
    'editors',
    'analytics',
    'admin',
    'pdf-generators',
    'data-tables',
  ],

  /**
   * Routes that benefit from prefetching
   */
  prefetchRoutes: ['/dashboard', '/editor', '/analytics'],
};

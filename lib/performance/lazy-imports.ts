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
 * Lazy import utilities for performance optimization
 * Provides dynamic imports with loading states and error handling
 */

import { lazy, ComponentType, ReactNode } from 'react';
import { logger } from '../utils/logger';

/**
 * Enhanced lazy loading with error boundaries and loading states
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  _fallback?: ReactNode
): T {
  return lazy(importFn) as unknown as T;
}

/**
 * Lazy load heavy chart components
 */
export const LazyChartComponents = {
  LineChart: createLazyComponent(() =>
    import('recharts').then(module => ({ default: module.LineChart }))
  ),
  BarChart: createLazyComponent(() =>
    import('recharts').then(module => ({ default: module.BarChart }))
  ),
  PieChart: createLazyComponent(() =>
    import('recharts').then(module => ({ default: module.PieChart }))
  ),
  AreaChart: createLazyComponent(() =>
    import('recharts').then(module => ({ default: module.AreaChart }))
  ),
};

/**
 * Example lazy component definitions (update with actual component paths)
 */
// Note: Uncomment and update these when the components exist
/*
export const LazyGitHubComponents = {
  GitHubAnalytics: createLazyComponent(() => import('@/components/analytics/GitHubAnalytics')),
  RepositoryInsights: createLazyComponent(() => import('@/components/analytics/RepositoryInsights')),
};

export const LazyEditorComponents = {
  PortfolioEditor: createLazyComponent(() => import('@/components/editor/PortfolioEditor')),
  TemplateSelector: createLazyComponent(() => import('@/components/editor/TemplateSelector')),
  AIEnhancer: createLazyComponent(() => import('@/components/editor/AIEnhancer')),
};

export const LazyAdminComponents = {
  ExperimentDashboard: createLazyComponent(() => import('@/components/admin/ExperimentDashboard')),
  UserManagement: createLazyComponent(() => import('@/components/admin/UserManagement')),
  AnalyticsDashboard: createLazyComponent(() => import('@/components/admin/AnalyticsDashboard')),
};
*/

/**
 * Preload components for better UX
 */
export function preloadComponent(importFn: () => Promise<any>): void {
  if (typeof window !== 'undefined') {
    // Preload after initial page load
    const preload = () => {
      importFn().catch(() => {
        // Silently fail - component will be loaded when needed
      });
    };

    if (document.readyState === 'complete') {
      setTimeout(preload, 1000); // 1 second delay
    } else {
      window.addEventListener('load', () => {
        setTimeout(preload, 1000);
      });
    }
  }
}

/**
 * Dynamic import with retry logic
 */
export async function dynamicImportWithRetry<T>(
  importFn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }

  throw new Error('Dynamic import failed after retries');
}

/**
 * Critical resource hints for performance
 */
export function addResourceHints(): void {
  if (typeof window === 'undefined') return;

  // Preconnect to external domains
  const preconnectDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://api.stripe.com',
    'https://js.stripe.com',
  ];

  preconnectDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    document.head.appendChild(link);
  });

  // DNS prefetch for optional resources
  const dnsPrefetchDomains = [
    'https://huggingface.co',
    'https://api.github.com',
    'https://ipapi.co',
  ];

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
}

/**
 * Intersection Observer for lazy loading
 */
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

/**
 * Image optimization utilities
 */
export const imageOptimization = {
  // Generate srcSet for responsive images
  generateSrcSet: (
    baseUrl: string,
    sizes: number[] = [320, 640, 1280, 1920]
  ) => {
    return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
  },

  // Lazy load images with intersection observer
  lazyLoadImage: (img: HTMLImageElement, src: string) => {
    const observer = createIntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLImageElement;
          target.src = src;
          target.classList.remove('lazy');
          observer?.unobserve(target);
        }
      });
    });

    if (observer) {
      img.classList.add('lazy');
      observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      img.src = src;
    }
  },
};

/**
 * Service Worker utilities for caching
 */
export const serviceWorkerUtils = {
  register: async (): Promise<ServiceWorkerRegistration | undefined> => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        logger.info('Service Worker registered', { registration });
        return registration;
      } catch (error) {
        logger.error('Service Worker registration failed:', error as Error);
        return undefined;
      }
    }
    return undefined;
  },

  unregister: async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
  },
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitoring = {
  // Measure Core Web Vitals
  measureWebVitals: () => {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        logger.debug('LCP metric', { value: lastEntry.startTime });
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const fidEntry = entry as PerformanceEventTiming;
        if (fidEntry.processingStart && fidEntry.startTime) {
          logger.debug('FID metric', {
            value: fidEntry.processingStart - fidEntry.startTime,
          });
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    let cumulativeScore = 0;
    new PerformanceObserver(list => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        const clsEntry = entry as any; // Layout shift entry type
        if (!clsEntry.hadRecentInput) {
          cumulativeScore += clsEntry.value;
        }
      });
      logger.debug('CLS metric', { value: cumulativeScore });
    }).observe({ entryTypes: ['layout-shift'] });
  },

  // Report navigation timing
  reportNavigationTiming: () => {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const timing = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      const metrics = {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - timing.requestStart,
        download: timing.responseEnd - timing.responseStart,
        domParsing: timing.domContentLoadedEventStart - timing.responseEnd,
        resourceLoading:
          timing.loadEventStart - timing.domContentLoadedEventStart,
        total: timing.loadEventEnd - timing.startTime,
      };

      logger.debug('Navigation Timing', { metrics });
    });
  },
};

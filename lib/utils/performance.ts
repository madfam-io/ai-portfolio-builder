import React from 'react';

import { logger } from '@/lib/utils/logger';
/**
 * @fileoverview Performance Monitoring and Optimization Utilities
 *
 * A comprehensive suite of performance monitoring tools for the PRISMA platform.
 * Provides real-time metrics, performance profiling, and optimization suggestions.
 *
 * Features:
 * - Core Web Vitals monitoring (LCP, FID, CLS)
 * - Bundle size analysis and optimization recommendations
 * - Component render performance tracking
 * - Memory usage monitoring
 * - Network performance analysis
 * - User experience metrics
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

// Performance metric interfaces
export interface PerformanceMetrics {
  /** Largest Contentful Paint - measures loading performance */
  lcp?: number;
  /** First Input Delay - measures interactivity */
  fid?: number;
  /** Cumulative Layout Shift - measures visual stability */
  cls?: number;
  /** Time to First Byte */
  ttfb?: number;
  /** First Contentful Paint */
  fcp?: number;
  /** Total Blocking Time */
  tbt?: number;
  /** Speed Index */
  si?: number;
}

export interface ComponentPerformance {
  componentName: string;
  renderTime: number;
  renderCount: number;
  averageRenderTime: number;
  lastRenderTimestamp: number;
  memoryUsage?: number;
}

export interface BundleAnalysis {
  totalSize: number;
  compressedSize: number;
  chunkSizes: Record<string, number>;
  largestChunks: Array<{ name: string; size: number }>;
  recommendations: string[];
}

/**
 * Performance Monitor Class
 *
 * Central hub for collecting and analyzing performance metrics.
 * Provides both real-time monitoring and historical analysis.
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics = {};
  private componentMetrics: Map<string, ComponentPerformance> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled =
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true';

    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  /**
   * Get singleton instance of PerformanceMonitor
   */
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance observers for Core Web Vitals
   */
  private initializeObservers(): void {
    if (!window.PerformanceObserver) return;

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number;
        };
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.set('lcp', lcpObserver);
    } catch (error) {
      logger.warn('LCP observer not supported:', { error });
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.reportMetric('fid', this.metrics.fid);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.set('fid', fidObserver);
    } catch (error) {
      logger.warn('FID observer not supported:', { error });
    }

    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver(list => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
            this.reportMetric('cls', clsValue);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.set('cls', clsObserver);
    } catch (error) {
      logger.warn('CLS observer not supported:', { error });
    }

    // Navigation timing
    this.observeNavigationTiming();
  }

  /**
   * Observe navigation timing metrics
   */
  private observeNavigationTiming(): void {
    if (!window.performance?.getEntriesByType) return;

    setTimeout(() => {
      const navigation = window.performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.metrics.fcp = navigation.loadEventStart - navigation.fetchStart;

        this.reportMetric('ttfb', this.metrics.ttfb);
        this.reportMetric('fcp', this.metrics.fcp);
      }
    }, 0);
  }

  /**
   * Track component render performance
   */
  public trackComponentRender(componentName: string, renderTime: number): void {
    if (!this.isEnabled) return;

    const existing = this.componentMetrics.get(componentName);
    if (existing) {
      existing.renderCount++;
      existing.renderTime += renderTime;
      existing.averageRenderTime = existing.renderTime / existing.renderCount;
      existing.lastRenderTimestamp = Date.now();
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        averageRenderTime: renderTime,
        lastRenderTimestamp: Date.now(),
      });
    }

    // Warn about slow components
    if (renderTime > 16) {
      // 60fps threshold
      console.warn(
        `🐌 Slow render detected: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get component performance data
   */
  public getComponentMetrics(): ComponentPerformance[] {
    return Array.from(this.componentMetrics.values());
  }

  /**
   * Get performance score based on Core Web Vitals
   */
  public getPerformanceScore(): number {
    const { lcp, fid, cls } = this.metrics;
    let score = 100;

    // LCP scoring (Good: <2.5s, Needs Improvement: 2.5-4s, Poor: >4s)
    if (lcp) {
      if (lcp > 4000) score -= 40;
      else if (lcp > 2500) score -= 20;
    }

    // FID scoring (Good: <100ms, Needs Improvement: 100-300ms, Poor: >300ms)
    if (fid) {
      if (fid > 300) score -= 30;
      else if (fid > 100) score -= 15;
    }

    // CLS scoring (Good: <0.1, Needs Improvement: 0.1-0.25, Poor: >0.25)
    if (cls) {
      if (cls > 0.25) score -= 30;
      else if (cls > 0.1) score -= 15;
    }

    return Math.max(0, score);
  }

  /**
   * Report metric to external services (development helper)
   */
  private reportMetric(name: string, value: number): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `📊 Performance Metric: ${name} = ${value.toFixed(2)}${this.getMetricUnit(name)}`
      );
    }

    // In production, send to analytics service
    // analytics.track('performance_metric', { name, value });
  }

  /**
   * Get unit for metric display
   */
  private getMetricUnit(metricName: string): string {
    switch (metricName) {
      case 'cls':
        return '';
      case 'lcp':
      case 'fid':
      case 'ttfb':
      case 'fcp':
        return 'ms';
      default:
        return '';
    }
  }

  /**
   * Clean up observers
   */
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

/**
 * React Hook for Component Performance Tracking
 *
 * Automatically tracks render performance for React components.
 */
export function usePerformanceTracking(componentName: string) {
  const monitor = PerformanceMonitor.getInstance();

  React.useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      monitor.trackComponentRender(componentName, renderTime);
    };
  });

  return {
    trackOperation: (
      operationName: string,
      operation: () => void | Promise<void>
    ) => {
      const startTime = performance.now();
      const result = operation();

      if (result instanceof Promise) {
        return result.finally(() => {
          const endTime = performance.now();
          monitor.trackComponentRender(
            `${componentName}.${operationName}`,
            endTime - startTime
          );
        });
      } else {
        const endTime = performance.now();
        monitor.trackComponentRender(
          `${componentName}.${operationName}`,
          endTime - startTime
        );
        return result;
      }
    },
  };
}

/**
 * Debounce utility for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): T {
  let timeout: NodeJS.Timeout | null = null;

  return ((...args: Parameters<T>) => {
    const later = (): void => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  }) as T;
}

/**
 * Throttle utility for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T {
  let inThrottle = false;

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
}

/**
 * Memory usage monitoring utility
 */
export function getMemoryUsage(): {
  used: number;
  total: number;
  percentage: number;
} | null {
  if (typeof window === 'undefined' || !('memory' in window.performance)) {
    return null;
  }

  const memory = (
    window.performance as Performance & {
      memory: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
      };
    }
  ).memory;
  return {
    used: memory.usedJSHeapSize,
    total: memory.totalJSHeapSize,
    percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
  };
}

/**
 * Bundle size analysis utility
 */
export function analyzeBundleSize(): Promise<BundleAnalysis> {
  return new Promise(resolve => {
    // In a real implementation, this would analyze the actual bundle
    // For now, we'll provide a mock analysis based on the build output
    const analysis: BundleAnalysis = {
      totalSize: 300 * 1024, // 300KB estimated
      compressedSize: 100 * 1024, // 100KB gzipped
      chunkSizes: {
        main: 150 * 1024,
        vendors: 100 * 1024,
        commons: 50 * 1024,
      },
      largestChunks: [
        { name: 'react-icons', size: 45 * 1024 },
        { name: 'framer-motion', size: 30 * 1024 },
        { name: 'recharts', size: 25 * 1024 },
      ],
      recommendations: [
        'Consider lazy loading heavy components like analytics dashboard',
        'Tree-shake unused react-icons imports',
        'Use dynamic imports for route-specific components',
        'Implement code splitting for better caching',
      ],
    };

    resolve(analysis);
  });
}

/**
 * Performance budget checker
 */
export interface PerformanceBudget {
  maxBundleSize: number; // in bytes
  maxRenderTime: number; // in ms
  maxMemoryUsage: number; // percentage
  minPerformanceScore: number; // 0-100
}

export function checkPerformanceBudget(budget: PerformanceBudget): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  const monitor = PerformanceMonitor.getInstance();
  const score = monitor.getPerformanceScore();
  const memory = getMemoryUsage();

  if (score < budget.minPerformanceScore) {
    violations.push(
      `Performance score ${score} below budget ${budget.minPerformanceScore}`
    );
  }

  if (memory && memory.percentage > budget.maxMemoryUsage) {
    violations.push(
      `Memory usage ${memory.percentage.toFixed(1)}% exceeds budget ${budget.maxMemoryUsage}%`
    );
  }

  const slowComponents = monitor
    .getComponentMetrics()
    .filter(comp => comp.averageRenderTime > budget.maxRenderTime);

  if (slowComponents.length > 0) {
    violations.push(
      `Slow components: ${slowComponents.map(c => c.componentName).join(', ')}`
    );
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  PerformanceMonitor.getInstance();
}

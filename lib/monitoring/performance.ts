import { useRef, useEffect } from 'react';

import { logger } from '@/lib/utils/logger';

/**
 * Performance monitoring utilities
 * Tracks and reports web vitals and custom metrics
 */

// Metric types
export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

// Web Vitals thresholds
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

/**
 * Get rating for metric value
 */
function getRating(
  metricName: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report web vitals to analytics
 */
export function reportWebVitals(metric: any): void {
  const { name, value, id } = metric;

  const performanceMetric: PerformanceMetric = {
    name,
    value: Math.round(value),
    rating: getRating(name, value),
    timestamp: Date.now(),
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug(`[Web Vital] ${name}`, {
      value: performanceMetric.value,
      rating: performanceMetric.rating,
      id,
    });
  }

  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      value: performanceMetric.value,
      metric_id: id,
      metric_value: performanceMetric.value,
      metric_rating: performanceMetric.rating,
    });
  }

  // Log poor performance
  if (performanceMetric.rating === 'poor') {
    logger.warn('Poor web vital detected', {
      metric: name,
      value: performanceMetric.value,
      threshold: THRESHOLDS[name as keyof typeof THRESHOLDS]?.poor,
    });
  }
}

/**
 * Performance observer for custom metrics
 */
export class PerformanceMonitor {
  private marks = new Map<string, number>();
  private measures: PerformanceMetric[] = [];

  /**
   * Start timing a performance mark
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());

    if (typeof window !== 'undefined') {
      performance.mark(name);
    }
  }

  /**
   * Measure time between marks
   */
  measure(name: string, startMark: string, endMark?: string): number {
    const startTime = this.marks.get(startMark);
    const endTime = endMark ? this.marks.get(endMark) : performance.now();

    if (!startTime) {
      logger.warn('Start mark not found', { startMark });
      return 0;
    }

    const duration = (endTime ?? 0) - startTime;

    const metric: PerformanceMetric = {
      name,
      value: Math.round(duration),
      rating: getRating(name, duration),
      timestamp: Date.now(),
    };

    this.measures.push(metric);

    if (typeof window !== 'undefined') {
      performance.measure(name, startMark, endMark);
    }

    // Log slow operations
    if (duration > 1000) {
      logger.warn('Slow operation detected', {
        name,
        duration: Math.round(duration),
        startMark,
        endMark,
      });
    }

    return duration;
  }

  /**
   * Get all measures
   */
  getMeasures(): PerformanceMetric[] {
    return [...this.measures];
  }

  /**
   * Clear all marks and measures
   */
  clear(): void {
    this.marks.clear();
    this.measures = [];

    if (typeof window !== 'undefined') {
      performance.clearMarks();
      performance.clearMeasures();
    }
  }
}

// Global performance monitor instance with cleanup
class PerformanceMonitorSingleton extends PerformanceMonitor {
  private static instance: PerformanceMonitorSingleton | null = null;
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitorSingleton {
    if (!PerformanceMonitorSingleton.instance) {
      PerformanceMonitorSingleton.instance = new PerformanceMonitorSingleton();
    }
    return PerformanceMonitorSingleton.instance;
  }

  registerObserver(observer: PerformanceObserver): void {
    this.observers.push(observer);
  }

  destroy(): void {
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // Clear all data
    this.clear();

    // Reset singleton instance
    PerformanceMonitorSingleton.instance = null;
  }
}

const _perfMonitor = PerformanceMonitorSingleton.getInstance();

// Performance stats storage
const performanceStats: Record<
  string,
  {
    count: number;
    totalDuration: number;
    minDuration: number;
    maxDuration: number;
    averageDuration: number;
  }
> = {};

/**
 * Measure async operation performance
 */
export async function measureAsyncOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    // Update stats
    if (!performanceStats[operationName]) {
      performanceStats[operationName] = {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        averageDuration: 0,
      };
    }

    const stats = performanceStats[operationName];
    stats.count++;
    stats.totalDuration += duration;
    stats.minDuration = Math.min(stats.minDuration, duration);
    stats.maxDuration = Math.max(stats.maxDuration, duration);
    stats.averageDuration = stats.totalDuration / stats.count;

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    // Still track failed operations
    if (!performanceStats[operationName]) {
      performanceStats[operationName] = {
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        averageDuration: 0,
      };
    }

    const stats = performanceStats[operationName];
    stats.count++;
    stats.totalDuration += duration;

    throw error;
  }
}

/**
 * Track API call performance
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function trackApiCall(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  const operationName = `api_${endpoint}`;
  const startTime = performance.now();

  try {
    const response = await fetch(endpoint, options);
    const duration = performance.now() - startTime;

    if (!response.ok) {
      logger.error('API call failed', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        duration,
      });
    }

    // Track in stats
    await measureAsyncOperation(operationName, () => Promise.resolve(response));

    return response;
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error('API call error', {
      endpoint,
      error,
      duration,
    });
    throw error;
  }
}

/**
 * Get performance statistics
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPerformanceStats() {
  return { ...performanceStats };
}

/**
 * Reset performance statistics
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function resetStats(): void {
  Object.keys(performanceStats).forEach(key => {
    delete performanceStats[key];
  });
}

/**
 * Hook for component render tracking
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useRenderTracking(componentName: string): void {
  const renderCount = useRef(0);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCount.current += 1;

      if (renderCount.current > 10) {
        logger.warn('Excessive re-renders detected', {
          component: componentName,
          renderCount: renderCount.current,
        });
      }
    }
  });
}

// Import for Next.js types
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

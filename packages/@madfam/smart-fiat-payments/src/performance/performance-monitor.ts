/**
 * @madfam/smart-fiat-payments
 *
 * World-class payment gateway detection and routing system with AI-powered optimization
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Performance monitoring and optimization system
 * Tracks metrics and provides insights for optimization
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceThresholds {
  processPayment?: number;
  binLookup?: number;
  geoLookup?: number;
  routingDecision?: number;
  priceCalculation?: number;
}

interface PerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    [key: string]: {
      count: number;
      total: number;
      average: number;
      min: number;
      max: number;
      p50: number;
      p95: number;
      p99: number;
    };
  };
  alerts: Array<{
    metric: string;
    threshold: number;
    actual: number;
    severity: 'warning' | 'critical';
  }>;
  recommendations: string[];
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private timers = new Map<string, number>();
  private thresholds: PerformanceThresholds;
  private maxMetrics = 10000;

  constructor(thresholds: PerformanceThresholds = {}) {
    this.thresholds = {
      processPayment: 200,
      binLookup: 50,
      geoLookup: 100,
      routingDecision: 20,
      priceCalculation: 10,
      ...thresholds,
    };
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End timing and record metric
   */
  endTimer(name: string, tags?: Record<string, string>): number {
    const startTime = this.timers.get(name);

    if (!startTime) {
      // eslint-disable-next-line no-console
      console.warn(`Timer ${name} was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    this.recordMetric({
      name,
      value: duration,
      timestamp: Date.now(),
      tags,
    });

    // Check threshold
    const threshold = this.thresholds[name as keyof PerformanceThresholds];
    if (threshold && duration > threshold) {
      // eslint-disable-next-line no-console
      console.warn(
        `Performance warning: ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
      );
    }

    return duration;
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Prevent memory leak
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Measure async function performance
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    this.startTimer(name);

    try {
      const result = await fn();
      this.endTimer(name, { ...tags, status: 'success' });
      return result;
    } catch (error) {
      this.endTimer(name, { ...tags, status: 'error' });
      throw error;
    }
  }

  /**
   * Generate performance report
   */
  generateReport(periodMinutes = 60): PerformanceReport {
    const now = Date.now();
    const periodStart = now - periodMinutes * 60 * 1000;

    // Filter metrics for period
    const periodMetrics = this.metrics.filter(m => m.timestamp >= periodStart);

    // Group by metric name
    const grouped = this.groupMetrics(periodMetrics);

    // Calculate statistics
    const metrics: PerformanceReport['metrics'] = {};
    const alerts: PerformanceReport['alerts'] = [];

    for (const [name, values] of Object.entries(grouped)) {
      const sorted = values.sort((a, b) => a - b);
      const count = sorted.length;

      if (count === 0) continue;

      const total = sorted.reduce((sum, val) => sum + val, 0);
      const average = total / count;

      metrics[name] = {
        count,
        total,
        average,
        min: sorted[0]!,
        max: sorted[count - 1]!,
        p50: this.percentile(sorted, 50),
        p95: this.percentile(sorted, 95),
        p99: this.percentile(sorted, 99),
      };

      // Check thresholds
      const threshold = this.thresholds[name as keyof PerformanceThresholds];
      if (threshold) {
        if (metrics[name].p95 > threshold * 1.5) {
          alerts.push({
            metric: name,
            threshold,
            actual: metrics[name].p95,
            severity: 'critical',
          });
        } else if (metrics[name].p95 > threshold) {
          alerts.push({
            metric: name,
            threshold,
            actual: metrics[name].p95,
            severity: 'warning',
          });
        }
      }
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations(metrics, alerts);

    return {
      period: {
        start: new Date(periodStart),
        end: new Date(now),
      },
      metrics,
      alerts,
      recommendations,
    };
  }

  /**
   * Get real-time stats
   */
  getRealtimeStats(): Record<string, number> {
    const recentMetrics = this.metrics.filter(
      m => m.timestamp > Date.now() - 60000 // Last minute
    );

    const stats: Record<string, number> = {};
    const grouped = this.groupMetrics(recentMetrics);

    for (const [name, values] of Object.entries(grouped)) {
      if (values.length > 0) {
        stats[`${name}_avg`] =
          values.reduce((sum, val) => sum + val, 0) / values.length;
        stats[`${name}_count`] = values.length;
      }
    }

    return stats;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Export metrics for external monitoring
   */
  exportMetrics(format: 'json' | 'prometheus' = 'json'): string {
    if (format === 'prometheus') {
      return this.exportPrometheus();
    }

    return JSON.stringify(this.metrics);
  }

  /**
   * Group metrics by name
   */
  private groupMetrics(metrics: PerformanceMetric[]): Record<string, number[]> {
    const grouped: Record<string, number[]> = {};

    for (const metric of metrics) {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name]!.push(metric.value);
    }

    return grouped;
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)]!;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    metrics: PerformanceReport['metrics'],
    alerts: PerformanceReport['alerts']
  ): string[] {
    const recommendations: string[] = [];

    // Check for slow BIN lookups
    if (metrics.binLookup?.p95 && metrics.binLookup.p95 > 100) {
      recommendations.push(
        'Consider implementing BIN lookup caching or using a faster BIN database'
      );
    }

    // Check for slow geo lookups
    if (metrics.geoLookup?.p95 && metrics.geoLookup.p95 > 200) {
      recommendations.push(
        'Geo lookups are slow. Consider using a local IP database or caching results'
      );
    }

    // Check for overall slow performance
    if (metrics.processPayment?.p95 && metrics.processPayment.p95 > 300) {
      recommendations.push(
        'Overall payment processing is slow. Review all components for optimization opportunities'
      );
    }

    // Check for high variance
    for (const [name, stats] of Object.entries(metrics)) {
      const variance = stats.max / stats.min;
      if (variance > 10 && stats.count > 10) {
        recommendations.push(
          `High variance in ${name} performance (${variance.toFixed(1)}x). Investigate inconsistent behavior`
        );
      }
    }

    // Alert-based recommendations
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push(
        `Critical performance issues detected in: ${criticalAlerts.map(a => a.metric).join(', ')}`
      );
    }

    return recommendations;
  }

  /**
   * Export metrics in Prometheus format
   */
  private exportPrometheus(): string {
    const lines: string[] = [];
    const grouped = this.groupMetrics(this.metrics);

    for (const [name, values] of Object.entries(grouped)) {
      const metricName = `smart_payments_${name}_milliseconds`;
      lines.push(
        `# HELP ${metricName} Duration of ${name} operation in milliseconds`
      );
      lines.push(`# TYPE ${metricName} histogram`);

      values.forEach((value, index) => {
        lines.push(`${metricName} ${value} ${this.metrics[index]!.timestamp}`);
      });
    }

    return lines.join('\n');
  }
}

/**
 * Global performance monitor instance
 */
export const globalPerformanceMonitor = new PerformanceMonitor();

/**
 * Performance decorator for methods
 * Note: Use withPerformanceTracking() for Next.js compatibility
 */
export function measurePerformance(name?: string) {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    if (!descriptor || !descriptor.value) {
      return descriptor;
    }

    const originalMethod = descriptor.value;
    const metricName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      return globalPerformanceMonitor.measure(metricName, () =>
        originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}

/**
 * Higher-order function to wrap methods with performance tracking
 * Use this instead of @measurePerformance decorator for Next.js compatibility
 */
export function withPerformanceTracking<T extends (...args: any[]) => any>(
  fn: T,
  metricName?: string
): T {
  const name = metricName || fn.name || 'anonymous';

  return ((...args: any[]) => {
    return globalPerformanceMonitor.measure(name, () => fn(...args));
  }) as T;
}

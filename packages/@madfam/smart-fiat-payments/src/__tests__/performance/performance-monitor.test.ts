/**
 * @madfam/smart-fiat-payments - Test Suite
 *
 * Test suite for world-class payment gateway detection and routing system
 *
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 */

/**
 * Tests for performance monitoring system
 */

import {
  PerformanceMonitor,
  globalPerformanceMonitor,
  withPerformanceTracking,
} from '../../performance/performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor({
      processPayment: 200,
      binLookup: 50,
      geoLookup: 100,
    });
  });

  afterEach(() => {
    monitor.clear();
  });

  describe('Timer operations', () => {
    it('should measure operation duration', async () => {
      monitor.startTimer('testOperation');

      await new Promise(resolve => setTimeout(resolve, 100));

      const duration = monitor.endTimer('testOperation');

      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(150);
    }, 20000);

    it('should handle missing timer gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const duration = monitor.endTimer('nonExistentTimer');

      expect(duration).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Timer nonExistentTimer was not started'
      );

      consoleSpy.mockRestore();
    });

    it('should record metrics with tags', () => {
      monitor.startTimer('apiCall');
      const _duration = monitor.endTimer('apiCall', {
        endpoint: '/users',
        method: 'GET',
      });

      const report = monitor.generateReport(1);
      expect(report.metrics.apiCall).toBeDefined();
      expect(report.metrics.apiCall.count).toBe(1);
    });

    it('should warn when threshold exceeded', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      monitor.startTimer('binLookup');

      // Wait more than the threshold (50ms)
      await new Promise(resolve => setTimeout(resolve, 60));

      monitor.endTimer('binLookup');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance warning: binLookup')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Measure function', () => {
    it('should measure async function performance', async () => {
      const asyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return 'result';
      };

      const result = await monitor.measure('asyncOp', asyncOperation);

      expect(result).toBe('result');

      const report = monitor.generateReport(1);
      expect(report.metrics.asyncOp).toBeDefined();
      expect(report.metrics.asyncOp.count).toBe(1);
      expect(report.metrics.asyncOp.average).toBeGreaterThanOrEqual(50);
    }, 20000);

    it('should handle errors in measured functions', async () => {
      const failingOperation = () => {
        throw new Error('Operation failed');
      };

      await expect(
        monitor.measure('failingOp', failingOperation)
      ).rejects.toThrow('Operation failed');

      const report = monitor.generateReport(1);
      expect(report.metrics.failingOp).toBeDefined();
      expect(report.metrics.failingOp.count).toBe(1);
    });

    it('should pass tags to metrics', async () => {
      await monitor.measure('taggedOp', () => 'result', {
        service: 'payment',
        region: 'us-east',
      });

      const report = monitor.generateReport(1);
      expect(report.metrics.taggedOp).toBeDefined();
    });
  });

  describe('Custom metrics', () => {
    it('should record custom metrics', () => {
      monitor.recordMetric({
        name: 'cache_hit_rate',
        value: 85.5,
        timestamp: Date.now(),
        tags: { cache: 'bin' },
      });

      monitor.recordMetric({
        name: 'cache_hit_rate',
        value: 92.3,
        timestamp: Date.now(),
        tags: { cache: 'geo' },
      });

      const report = monitor.generateReport(1);
      expect(report.metrics.cache_hit_rate).toBeDefined();
      expect(report.metrics.cache_hit_rate.count).toBe(2);
      expect(report.metrics.cache_hit_rate.average).toBeCloseTo(88.9, 1);
    });

    it('should prevent memory leak with max metrics', () => {
      // Record more than maxMetrics
      for (let i = 0; i < 11000; i++) {
        monitor.recordMetric({
          name: 'test',
          value: i,
          timestamp: Date.now(),
        });
      }

      // Should keep only last 10000
      const report = monitor.generateReport(60);
      expect(report.metrics.test.count).toBeLessThanOrEqual(10000);
    });
  });

  describe('Performance reports', () => {
    it('should generate comprehensive report', async () => {
      // Record various metrics
      await monitor.measure('processPayment', async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      await monitor.measure('binLookup', async () => {
        await new Promise(resolve => setTimeout(resolve, 30));
      });

      await monitor.measure('binLookup', async () => {
        await new Promise(resolve => setTimeout(resolve, 40));
      });

      await monitor.measure('geoLookup', async () => {
        await new Promise(resolve => setTimeout(resolve, 80));
      });

      const report = monitor.generateReport(1);

      expect(report.period.start).toBeInstanceOf(Date);
      expect(report.period.end).toBeInstanceOf(Date);

      expect(report.metrics.processPayment).toMatchObject({
        count: 1,
        average: expect.any(Number),
        min: expect.any(Number),
        max: expect.any(Number),
        p50: expect.any(Number),
        p95: expect.any(Number),
        p99: expect.any(Number),
      });

      expect(report.metrics.binLookup.count).toBe(2);
      expect(report.metrics.binLookup.average).toBeGreaterThan(20); // Allow for timing variance
    }, 20000);

    it('should generate alerts for threshold violations', async () => {
      // Simulate slow operations
      await monitor.measure('processPayment', async () => {
        await new Promise(resolve => setTimeout(resolve, 250));
      });

      await monitor.measure('binLookup', async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      const report = monitor.generateReport(1);

      expect(report.alerts).toContainEqual(
        expect.objectContaining({
          metric: 'processPayment',
          threshold: 200,
          severity: 'warning',
        })
      );

      expect(report.alerts).toContainEqual(
        expect.objectContaining({
          metric: 'binLookup',
          threshold: 50,
          severity: 'critical',
        })
      );
    }, 20000);

    it('should generate recommendations', async () => {
      // Simulate various performance issues
      for (let i = 0; i < 10; i++) {
        await monitor.measure('binLookup', async () => {
          await new Promise(resolve => setTimeout(resolve, 120));
        });
      }

      for (let i = 0; i < 10; i++) {
        await monitor.measure('geoLookup', async () => {
          await new Promise(resolve => setTimeout(resolve, 250));
        });
      }

      const report = monitor.generateReport(1);

      expect(report.recommendations).toContain(
        'Consider implementing BIN lookup caching or using a faster BIN database'
      );
      expect(report.recommendations).toContain(
        'Geo lookups are slow. Consider using a local IP database or caching results'
      );
    }, 30000);

    it('should detect high variance', async () => {
      // Operations with high variance - need more than 10 operations
      const durations = [
        10, 15, 12, 200, 11, 13, 250, 14, 16, 300, 12, 15, 18, 250,
      ];

      for (const duration of durations) {
        monitor.startTimer('variantOp');
        await new Promise(resolve => setTimeout(resolve, duration));
        monitor.endTimer('variantOp');
      }

      const report = monitor.generateReport(1);

      // Check that variance recommendation is generated
      const hasVarianceRecommendation = report.recommendations.some(rec =>
        rec.includes('High variance in variantOp performance')
      );
      expect(hasVarianceRecommendation).toBe(true);
    }, 30000);

    it('should calculate percentiles correctly', () => {
      // Record metrics with known distribution
      const values = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

      values.forEach(value => {
        monitor.recordMetric({
          name: 'test',
          value,
          timestamp: Date.now(),
        });
      });

      const report = monitor.generateReport(1);

      expect(report.metrics.test.p50).toBeGreaterThan(40);
      expect(report.metrics.test.p95).toBeGreaterThan(80);
      expect(report.metrics.test.p99).toBeGreaterThan(90);
    });
  });

  describe('Real-time stats', () => {
    it('should provide real-time statistics', async () => {
      await monitor.measure('operation1', async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      await monitor.measure('operation1', async () => {
        await new Promise(resolve => setTimeout(resolve, 20));
      });

      await monitor.measure('operation2', async () => {
        await new Promise(resolve => setTimeout(resolve, 30));
      });

      const stats = monitor.getRealtimeStats();

      expect(stats.operation1_avg).toBeGreaterThan(10); // Allow for timing variance
      expect(stats.operation1_count).toBe(2);
      expect(stats.operation2_avg).toBeGreaterThan(25); // Allow for timing variance
      expect(stats.operation2_count).toBe(1);
    }, 20000);

    it('should only include recent metrics', () => {
      // Old metric (simulate by manipulating timestamp)
      monitor.recordMetric({
        name: 'oldMetric',
        value: 100,
        timestamp: Date.now() - 120000, // 2 minutes ago
      });

      // Recent metric
      monitor.recordMetric({
        name: 'recentMetric',
        value: 50,
        timestamp: Date.now(),
      });

      const stats = monitor.getRealtimeStats();

      expect(stats.oldMetric_avg).toBeUndefined();
      expect(stats.recentMetric_avg).toBe(50);
    });
  });

  describe('Export functionality', () => {
    it('should export metrics as JSON', () => {
      monitor.recordMetric({
        name: 'test',
        value: 100,
        timestamp: 1234567890,
      });

      const exported = monitor.exportMetrics('json');
      const parsed = JSON.parse(exported);

      expect(parsed).toBeInstanceOf(Array);
      expect(parsed[0]).toMatchObject({
        name: 'test',
        value: 100,
        timestamp: 1234567890,
      });
    });

    it('should export metrics in Prometheus format', () => {
      monitor.recordMetric({
        name: 'api_latency',
        value: 150,
        timestamp: Date.now(),
      });

      monitor.recordMetric({
        name: 'api_latency',
        value: 200,
        timestamp: Date.now(),
      });

      const exported = monitor.exportMetrics('prometheus');

      expect(exported).toContain(
        '# HELP smart_payments_api_latency_milliseconds'
      );
      expect(exported).toContain(
        '# TYPE smart_payments_api_latency_milliseconds histogram'
      );
      expect(exported).toContain('smart_payments_api_latency_milliseconds 150');
      expect(exported).toContain('smart_payments_api_latency_milliseconds 200');
    });
  });

  describe('Clear functionality', () => {
    it('should clear all metrics and timers', () => {
      monitor.startTimer('timer1');
      monitor.recordMetric({
        name: 'metric1',
        value: 100,
        timestamp: Date.now(),
      });

      monitor.clear();

      const report = monitor.generateReport(1);
      expect(Object.keys(report.metrics)).toHaveLength(0);

      // Timer should be cleared
      const duration = monitor.endTimer('timer1');
      expect(duration).toBe(0);
    });
  });
});

describe('Performance tracking with HOF', () => {
  class TestService {
    slowOperation = withPerformanceTracking(async (): Promise<string> => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'completed';
    }, 'TestService.slowOperation');

    fastOperation = withPerformanceTracking((): number => 42, 'customName');
  }

  beforeEach(() => {
    globalPerformanceMonitor.clear();
  });

  it('should measure wrapped methods', async () => {
    const service = new TestService();

    const result = await service.slowOperation();

    expect(result).toBe('completed');

    const report = globalPerformanceMonitor.generateReport(1);
    expect(report.metrics['TestService.slowOperation']).toBeDefined();
    expect(report.metrics['TestService.slowOperation'].count).toBe(1);
    expect(
      report.metrics['TestService.slowOperation'].average
    ).toBeGreaterThanOrEqual(100);
  }, 20000);

  it('should use custom metric name', async () => {
    const service = new TestService();

    const result = await service.fastOperation();

    expect(result).toBe(42);

    const report = globalPerformanceMonitor.generateReport(1);
    expect(report.metrics.customName).toBeDefined();
    expect(report.metrics.customName.count).toBe(1);
  });
});

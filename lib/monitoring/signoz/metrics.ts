/**
 * OpenTelemetry Metrics Utilities
 *
 * Provides metric collection capabilities for SigNoz integration
 */

import { metrics, ValueType } from '@opentelemetry/api';
import type {
  Counter,
  Histogram,
  UpDownCounter,
  Meter,
  Attributes,
} from '@opentelemetry/api';

// Get the global meter
const meter: Meter = metrics.getMeter(
  process.env.OTEL_SERVICE_NAME || 'ai-portfolio-builder',
  process.env.npm_package_version || '0.3.0-beta'
);

/**
 * Business Metrics
 */
export const businessMetrics = {
  // User metrics
  userSignups: meter.createCounter('user.signups', {
    description: 'Total number of user signups',
    unit: 'count',
  }),

  userLogins: meter.createCounter('user.logins', {
    description: 'Total number of user logins',
    unit: 'count',
  }),

  activeUsers: meter.createUpDownCounter('user.active', {
    description: 'Current number of active users',
    unit: 'count',
  }),

  // Portfolio metrics
  portfoliosCreated: meter.createCounter('portfolio.created', {
    description: 'Total portfolios created',
    unit: 'count',
  }),

  portfoliosPublished: meter.createCounter('portfolio.published', {
    description: 'Total portfolios published',
    unit: 'count',
  }),

  portfolioViews: meter.createCounter('portfolio.views', {
    description: 'Total portfolio views',
    unit: 'count',
  }),

  // Revenue metrics
  revenue: meter.createCounter('revenue.total', {
    description: 'Total revenue collected',
    unit: 'USD',
    valueType: ValueType.DOUBLE,
  }),

  subscriptions: meter.createUpDownCounter('subscriptions.active', {
    description: 'Active subscriptions',
    unit: 'count',
  }),

  // AI usage metrics
  aiGenerations: meter.createCounter('ai.generations', {
    description: 'Total AI content generations',
    unit: 'count',
  }),

  aiTokensUsed: meter.createCounter('ai.tokens', {
    description: 'Total AI tokens consumed',
    unit: 'tokens',
  }),
};

/**
 * Performance Metrics
 */
export const performanceMetrics = {
  // Response time histograms
  apiResponseTime: meter.createHistogram('api.response_time', {
    description: 'API response time distribution',
    unit: 'ms',
  }),

  dbQueryTime: meter.createHistogram('db.query_time', {
    description: 'Database query execution time',
    unit: 'ms',
  }),

  aiInferenceTime: meter.createHistogram('ai.inference_time', {
    description: 'AI model inference time',
    unit: 'ms',
  }),

  cacheHitRate: meter.createHistogram('cache.hit_rate', {
    description: 'Cache hit rate percentage',
    unit: 'percent',
    valueType: ValueType.DOUBLE,
  }),

  // Error counters
  apiErrors: meter.createCounter('api.errors', {
    description: 'Total API errors',
    unit: 'count',
  }),

  dbErrors: meter.createCounter('db.errors', {
    description: 'Total database errors',
    unit: 'count',
  }),

  aiErrors: meter.createCounter('ai.errors', {
    description: 'Total AI operation errors',
    unit: 'count',
  }),
};

/**
 * System Metrics (Observable)
 */
export const systemMetrics = {
  // Memory usage
  memoryUsage: meter.createObservableGauge('system.memory.usage', {
    description: 'Current memory usage',
    unit: 'bytes',
  }),

  // CPU usage
  cpuUsage: meter.createObservableGauge('system.cpu.usage', {
    description: 'Current CPU usage percentage',
    unit: 'percent',
    valueType: ValueType.DOUBLE,
  }),

  // Active connections
  activeConnections: meter.createObservableGauge('system.connections.active', {
    description: 'Active database connections',
    unit: 'count',
  }),
};

// Register callbacks for observable metrics
if (process.env.NODE_ENV !== 'test') {
  // Memory usage callback
  systemMetrics.memoryUsage.addCallback(observableResult => {
    const memUsage = process.memoryUsage();
    observableResult.observe(memUsage.heapUsed, {
      'memory.type': 'heap',
    });
    observableResult.observe(memUsage.rss, {
      'memory.type': 'rss',
    });
  });

  // CPU usage callback
  let lastCpuUsage = process.cpuUsage();
  systemMetrics.cpuUsage.addCallback(observableResult => {
    const currentCpuUsage = process.cpuUsage(lastCpuUsage);
    const totalUsage =
      (currentCpuUsage.user + currentCpuUsage.system) / 1000000; // Convert to seconds
    observableResult.observe(totalUsage, {
      'cpu.type': 'total',
    });
    lastCpuUsage = process.cpuUsage();
  });
}

/**
 * Record a business metric
 */
export const recordBusinessMetric = (
  metric: keyof typeof businessMetrics,
  value: number = 1,
  attributes?: Attributes
): void => {
  try {
    const counter = businessMetrics[metric];
    if (counter && 'add' in counter) {
      counter.add(value, attributes);
    }
  } catch (error) {
    console.error(`Failed to record business metric ${metric}:`, error);
  }
};

/**
 * Record a performance metric
 */
export const recordPerformanceMetric = (
  metric: keyof typeof performanceMetrics,
  value: number,
  attributes?: Attributes
): void => {
  try {
    const instrument = performanceMetrics[metric];
    if (instrument) {
      if ('record' in instrument) {
        // Histogram
        instrument.record(value, attributes);
      } else if ('add' in instrument) {
        // Counter
        instrument.add(value, attributes);
      }
    }
  } catch (error) {
    console.error(`Failed to record performance metric ${metric}:`, error);
  }
};

/**
 * Measure operation duration
 */
export const measureDuration = async <T>(
  metricName: keyof typeof performanceMetrics,
  operation: () => Promise<T>,
  attributes?: Attributes
): Promise<T> => {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    recordPerformanceMetric(metricName, duration, {
      ...attributes,
      status: 'success',
    });

    return result;
  } catch (_error) {
    const duration = performance.now() - startTime;

    recordPerformanceMetric(metricName, duration, {
      ...attributes,
      status: 'error',
      error_type: _error instanceof Error ? _error.constructor.name : 'unknown',
    });

    throw _error;
  }
};

/**
 * Create custom metric
 */
export const createCustomMetric = (
  name: string,
  type: 'counter' | 'histogram' | 'updown',
  options: {
    description: string;
    unit: string;
    valueType?: ValueType;
  }
): Counter | Histogram | UpDownCounter => {
  switch (type) {
    case 'counter':
      return meter.createCounter(name, options);
    case 'histogram':
      return meter.createHistogram(name, options);
    case 'updown':
      return meter.createUpDownCounter(name, options);
  }
};

/**
 * Batch metric recording
 */
export const recordMetricsBatch = (
  metrics: Array<{
    type: 'business' | 'performance';
    name: string;
    value: number;
    attributes?: Attributes;
  }>
): void => {
  metrics.forEach(({ type, name, value, attributes }) => {
    if (type === 'business') {
      recordBusinessMetric(
        name as keyof typeof businessMetrics,
        value,
        attributes
      );
    } else {
      recordPerformanceMetric(
        name as keyof typeof performanceMetrics,
        value,
        attributes
      );
    }
  });
};

/**
 * Export metric helpers
 */
export const metrics$ = {
  business: businessMetrics,
  performance: performanceMetrics,
  system: systemMetrics,
  record: {
    business: recordBusinessMetric,
    performance: recordPerformanceMetric,
    batch: recordMetricsBatch,
  },
  measure: measureDuration,
  create: createCustomMetric,
};

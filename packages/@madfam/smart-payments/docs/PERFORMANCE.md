# Performance Optimization Guide

This guide covers the performance features and optimization strategies available in @madfam/smart-payments.

## Table of Contents

1. [Performance Features](#performance-features)
2. [Caching](#caching)
3. [Request Batching](#request-batching)
4. [Performance Monitoring](#performance-monitoring)
5. [Optimization Strategies](#optimization-strategies)
6. [Best Practices](#best-practices)

## Performance Features

@madfam/smart-payments is built with performance in mind:

- **Sub-200ms response times** for all operations
- **LRU caching** with configurable TTL
- **Request batching** for external API calls
- **Connection pooling** for reusable connections
- **Lazy loading** for expensive operations
- **Performance monitoring** with detailed metrics

## Caching

### Basic Cache Usage

```typescript
import { CacheManager } from '@madfam/smart-payments/performance';

const cache = new CacheManager({
  maxSize: 50 * 1024 * 1024, // 50MB
  maxEntries: 10000,
  ttl: 300000, // 5 minutes
  enableStats: true,
});

// Set value
cache.set('key', value);

// Get value
const value = cache.get('key');

// Set with custom TTL
cache.set('key', value, 60000); // 1 minute
```

### Multi-Level Cache

```typescript
import { MultiLevelCache } from '@madfam/smart-payments/performance';

const multiCache = new MultiLevelCache([
  {
    maxSize: 1024 * 1024, // 1MB - L1 (hot)
    maxEntries: 100,
    ttl: 60000, // 1 minute
    enableStats: true,
  },
  {
    maxSize: 10 * 1024 * 1024, // 10MB - L2 (warm)
    maxEntries: 1000,
    ttl: 600000, // 10 minutes
    enableStats: true,
  },
  {
    maxSize: 100 * 1024 * 1024, // 100MB - L3 (cold)
    maxEntries: 10000,
    ttl: 3600000, // 1 hour
    enableStats: true,
  },
]);
```

### Cache Statistics

```typescript
// Get cache statistics
const stats = cache.getStats();
console.log(`Hit rate: ${cache.getHitRate()}%`);
console.log(`Entries: ${stats.entries}`);
console.log(`Size: ${stats.size} bytes`);
console.log(`Evictions: ${stats.evictions}`);
```

### Prewarm Cache

```typescript
// Prewarm with common data
await cache.prewarm([
  { key: 'bin:411111', value: binData1 },
  { key: 'bin:555555', value: binData2 },
  { key: 'country:US', value: geoData },
]);
```

## Request Batching

### Basic Batching

```typescript
import { RequestBatcher } from '@madfam/smart-payments/performance';

const batcher = new RequestBatcher({
  maxBatchSize: 50,
  maxWaitTime: 100, // milliseconds
  batchProcessor: async (requests) => {
    // Process batch of requests
    const response = await fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify({ batch: requests }),
    });
    return response.json();
  },
  enableDeduplication: true,
});

// Add requests (automatically batched)
const result1 = await batcher.add({ id: 1 });
const result2 = await batcher.add({ id: 2 });
```

### Specialized Batchers

```typescript
import { BatcherFactory } from '@madfam/smart-payments/performance';

// BIN lookup batcher
const binBatcher = BatcherFactory.createBINBatcher(
  async (bins) => {
    // Batch BIN lookup
    return bins.map(bin => lookupBIN(bin));
  }
);

// Geo lookup batcher
const geoBatcher = BatcherFactory.createGeoBatcher(
  async (ips) => {
    // Batch IP lookup
    return ips.map(ip => lookupGeo(ip));
  }
);

// Generic API batcher
const apiBatcher = BatcherFactory.createAPIBatcher({
  endpoint: 'https://api.example.com/batch',
  maxBatchSize: 25,
  maxWaitTime: 50,
  headers: { 'X-API-Key': 'your-key' },
});
```

## Performance Monitoring

### Basic Monitoring

```typescript
import { PerformanceMonitor } from '@madfam/smart-payments/performance';

const monitor = new PerformanceMonitor({
  processPayment: 200, // Threshold in ms
  binLookup: 50,
  geoLookup: 100,
  routingDecision: 20,
});

// Time an operation
monitor.startTimer('operation');
// ... do work ...
const duration = monitor.endTimer('operation');

// Measure async function
const result = await monitor.measure('asyncOp', async () => {
  return await someAsyncOperation();
});
```

### Performance Decorators

```typescript
import { measurePerformance } from '@madfam/smart-payments/performance';

class PaymentService {
  @measurePerformance()
  async processPayment(request: PaymentRequest) {
    // Automatically measured
    return await this.process(request);
  }

  @measurePerformance('customMetricName')
  async validateCard(cardNumber: string) {
    // Measured with custom name
    return await this.validate(cardNumber);
  }
}
```

### Generate Reports

```typescript
// Generate performance report
const report = monitor.generateReport(60); // Last 60 minutes

console.log('Performance Report:');
console.log(`Period: ${report.period.start} - ${report.period.end}`);

// Metrics
for (const [name, stats] of Object.entries(report.metrics)) {
  console.log(`${name}:`);
  console.log(`  Average: ${stats.average}ms`);
  console.log(`  P95: ${stats.p95}ms`);
  console.log(`  P99: ${stats.p99}ms`);
}

// Alerts
for (const alert of report.alerts) {
  console.log(`${alert.severity}: ${alert.metric} exceeded threshold`);
}

// Recommendations
for (const recommendation of report.recommendations) {
  console.log(`Recommendation: ${recommendation}`);
}
```

### Real-time Monitoring

```typescript
// Get real-time stats
const realtimeStats = monitor.getRealtimeStats();

// Export for external monitoring
const prometheusMetrics = monitor.exportMetrics('prometheus');
const jsonMetrics = monitor.exportMetrics('json');
```

## Optimization Strategies

### Connection Pooling

```typescript
import { ConnectionPool } from '@madfam/smart-payments/performance';

const pool = new ConnectionPool(10, 30000); // Max 10, 30s timeout

// Get or create connection
const connection = await pool.getConnection('api-key', async () => {
  return await createExpensiveConnection();
});

// Connections are automatically reused
const sameConnection = await pool.getConnection('api-key', factory);
```

### Lazy Loading

```typescript
import { LazyLoader } from '@madfam/smart-payments/performance';

const configLoader = new LazyLoader(
  async () => {
    // Load expensive configuration
    return await loadConfiguration();
  },
  3600000 // 1 hour TTL
);

// First call loads data
const config = await configLoader.get();

// Subsequent calls use cached value
const cachedConfig = await configLoader.get();

// Preload before needed
await configLoader.preload();
```

### Data Preloading

```typescript
import { DataPreloader } from '@madfam/smart-payments/performance';

const preloader = new DataPreloader(cache);

// Register preload patterns
preloader.register('common-bins', async () => {
  return await loadCommonBINs();
});

preloader.register('popular-countries', async () => {
  return await loadPopularCountries();
});

// Preload data
await preloader.preload(['common-bins', 'popular-countries']);

// Specialized preloaders
await preloader.preloadCommonBINs(binLookupFn);
await preloader.preloadCommonCountries(geoLookupFn);
```

### Optimization Manager

```typescript
import { OptimizationManager } from '@madfam/smart-payments/performance';

const optimizer = new OptimizationManager({
  enableCaching: true,
  enableBatching: true,
  enablePreloading: true,
  enableLazyLoading: true,
  enableCompression: true,
  preloadPatterns: ['common-bins', 'popular-countries'],
});

// Initialize optimizations
await optimizer.initialize();

// Get optimization components
const cache = optimizer.getCache();
const connectionPool = optimizer.getConnectionPool();
const preloader = optimizer.getPreloader();

// Get stats
const stats = optimizer.getStats();
console.log(`Cache hit rate: ${stats.cacheHitRate}%`);
```

## Best Practices

### 1. Configure Caching Strategically

```typescript
const smartPayments = new SmartPayments({
  cache: {
    enableBINCache: true,
    enableGeoCache: true,
    ttl: 300, // 5 minutes
    maxSize: 10000,
  },
  // ... other config
});
```

### 2. Use Batching for External APIs

```typescript
// Bad: Individual requests
for (const bin of bins) {
  const result = await lookupBIN(bin);
}

// Good: Batched requests
const batcher = BatcherFactory.createBINBatcher(batchLookupFn);
const results = await Promise.all(
  bins.map(bin => batcher.add(bin))
);
```

### 3. Monitor Performance Continuously

```typescript
// Set up global monitoring
import { globalPerformanceMonitor } from '@madfam/smart-payments/performance';

// Regular performance checks
setInterval(() => {
  const report = globalPerformanceMonitor.generateReport(5);
  
  if (report.alerts.length > 0) {
    // Send alerts
    notifyOps(report.alerts);
  }
}, 300000); // Every 5 minutes
```

### 4. Prewarm Critical Data

```typescript
// On application start
async function initializeApp() {
  const optimizer = new OptimizationManager(config);
  
  // Prewarm common data
  await optimizer.initialize();
  
  // Prewarm specific patterns
  const preloader = optimizer.getPreloader();
  await preloader.preloadCommonBINs(binLookup);
  await preloader.preloadCommonCountries(geoLookup);
}
```

### 5. Use Compression for Large Payloads

```typescript
import { CompressionUtils } from '@madfam/smart-payments/performance';

// Check if compression is worthwhile
if (CompressionUtils.shouldCompress(data)) {
  const compressed = CompressionUtils.compress(data);
  // Store or transmit compressed data
  
  // Later, decompress
  const original = CompressionUtils.decompress(compressed);
}
```

### 6. Implement Circuit Breakers

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailure > 60000) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      if (this.state === 'half-open') {
        this.state = 'closed';
        this.failures = 0;
      }
      return result;
    } catch (error) {
      this.failures++;
      this.lastFailure = Date.now();
      
      if (this.failures >= 5) {
        this.state = 'open';
      }
      
      throw error;
    }
  }
}
```

### 7. Use Performance Budgets

```typescript
// Set performance budgets
const budgets = {
  processPayment: 200,
  binLookup: 50,
  geoLookup: 100,
  totalTime: 300,
};

// Check against budgets
async function checkPerformance() {
  const report = monitor.generateReport(60);
  
  for (const [metric, budget] of Object.entries(budgets)) {
    const stats = report.metrics[metric];
    if (stats && stats.p95 > budget) {
      console.warn(`${metric} P95 (${stats.p95}ms) exceeds budget (${budget}ms)`);
    }
  }
}
```

## Example: Optimized Payment Processing

```typescript
import { 
  SmartPayments,
  OptimizationManager,
  globalPerformanceMonitor,
  measurePerformance,
} from '@madfam/smart-payments';

class OptimizedPaymentService {
  private smartPayments: SmartPayments;
  private optimizer: OptimizationManager;

  constructor() {
    this.optimizer = new OptimizationManager({
      enableCaching: true,
      enableBatching: true,
      enablePreloading: true,
      preloadPatterns: ['common-bins', 'popular-countries'],
    });

    this.smartPayments = new SmartPayments({
      // ... config
      cache: {
        enableBINCache: true,
        enableGeoCache: true,
        ttl: 300000,
        maxSize: 10000,
      },
    });
  }

  async initialize() {
    // Initialize optimizations
    await this.optimizer.initialize();
    
    // Prewarm critical data
    const preloader = this.optimizer.getPreloader();
    await preloader.preloadCommonBINs(bin => this.smartPayments.lookupBIN(bin));
  }

  @measurePerformance('optimized.processPayment')
  async processPayment(request: PaymentRequest) {
    // Check cache first
    const cache = this.optimizer.getCache();
    const cacheKey = `payment:${JSON.stringify(request)}`;
    
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Process payment
    const result = await this.smartPayments.processPayment(request);
    
    // Cache result
    cache.set(cacheKey, result, 60000); // 1 minute
    
    return result;
  }

  getPerformanceReport() {
    return globalPerformanceMonitor.generateReport(60);
  }
}

// Usage
const service = new OptimizedPaymentService();
await service.initialize();

// Process payments with automatic optimization
const result = await service.processPayment({
  amount: { amount: 100, currency: 'USD' },
  cardNumber: '4111111111111111',
  ipAddress: '8.8.8.8',
});

// Check performance
const report = service.getPerformanceReport();
console.log(`Average processing time: ${report.metrics['optimized.processPayment'].average}ms`);
```
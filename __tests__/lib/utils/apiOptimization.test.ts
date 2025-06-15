import {
  withCache,
  withRateLimit,
  withMetrics,
  withOptimization,
  QueryOptimizer,
  getAPIStats,
  clearCaches,
  invalidateCache,
  memoryCache,
  rateLimiter,
  metricsCollector,
} from '@/lib/utils/apiOptimization';
import { NextRequest, NextResponse } from 'next/server';

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url: string, init?: RequestInit) => ({
    url,
    method: init?.method || 'GET',
    headers: {
      get: (key: string) => {
        const headers = init?.headers as any || {};
        return headers[key] || null;
      },
      set: jest.fn(),
      forEach: jest.fn(),
      entries: () => Object.entries(init?.headers || {}),
    },
  })),
  NextResponse: {
    json: jest.fn((data: any, init?: ResponseInit) => {
      const response = {
        status: init?.status || 200,
        headers: new Map(Object.entries(init?.headers || {})),
        text: async () => JSON.stringify(data),
        json: async () => data,
      };
      // Add headers.get method for Map
      (response.headers as any).get = function(key: string) {
        return this.get(key) || null;
      };
      (response.headers as any).set = function(key: string, value: string) {
        return this.set(key, value);
      };
      return response;
    }),
  },
}));

describe('API Optimization Utilities', () => {
  beforeEach(() => {
    clearCaches();
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('MemoryCache', () => {
    it('should set and get cache values', () => {
      memoryCache.set('test-key', { data: 'test' }, 60, ['tag1']);
      expect(memoryCache.get('test-key')).toEqual({ data: 'test' });
    });

    it('should return null for non-existent keys', () => {
      expect(memoryCache.get('non-existent')).toBeNull();
    });

    it('should expire cache entries after TTL', () => {
      memoryCache.set('expire-key', 'value', 1, []);
      expect(memoryCache.get('expire-key')).toBe('value');
      
      jest.advanceTimersByTime(1001);
      expect(memoryCache.get('expire-key')).toBeNull();
    });

    it('should delete cache entries', () => {
      memoryCache.set('delete-key', 'value', 60, []);
      expect(memoryCache.delete('delete-key')).toBe(true);
      expect(memoryCache.get('delete-key')).toBeNull();
    });

    it('should invalidate cache by tag', () => {
      memoryCache.set('key1', 'value1', 60, ['tag1', 'tag2']);
      memoryCache.set('key2', 'value2', 60, ['tag2']);
      memoryCache.set('key3', 'value3', 60, ['tag3']);

      const count = memoryCache.invalidateByTag('tag2');
      expect(count).toBe(2);
      expect(memoryCache.get('key1')).toBeNull();
      expect(memoryCache.get('key2')).toBeNull();
      expect(memoryCache.get('key3')).toBe('value3');
    });

    it('should clear all cache entries', () => {
      memoryCache.set('key1', 'value1', 60, []);
      memoryCache.set('key2', 'value2', 60, []);
      
      memoryCache.clear();
      expect(memoryCache.size()).toBe(0);
      expect(memoryCache.get('key1')).toBeNull();
      expect(memoryCache.get('key2')).toBeNull();
    });

    it('should return cache stats', () => {
      memoryCache.set('key1', 'value1', 60, []);
      memoryCache.set('key2', 'value2', 60, []);

      const stats = memoryCache.stats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });

    it('should handle timer cleanup on overwrite', () => {
      memoryCache.set('key', 'value1', 60, []);
      memoryCache.set('key', 'value2', 60, []); // Overwrite
      
      expect(memoryCache.get('key')).toBe('value2');
      expect(memoryCache.size()).toBe(1);
    });
  });

  describe('RateLimiter', () => {
    const config = {
      requests: 3,
      window: 60, // 60 seconds
    };

    it('should allow requests within limit', () => {
      expect(rateLimiter.isAllowed('user1', config)).toBe(true);
      expect(rateLimiter.isAllowed('user1', config)).toBe(true);
      expect(rateLimiter.isAllowed('user1', config)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      // Use up the limit
      rateLimiter.isAllowed('user2', config);
      rateLimiter.isAllowed('user2', config);
      rateLimiter.isAllowed('user2', config);
      
      // Should be blocked
      expect(rateLimiter.isAllowed('user2', config)).toBe(false);
    });

    it('should reset after window expires', () => {
      // Use up the limit
      rateLimiter.isAllowed('user3', config);
      rateLimiter.isAllowed('user3', config);
      rateLimiter.isAllowed('user3', config);
      expect(rateLimiter.isAllowed('user3', config)).toBe(false);

      // Advance time past window
      jest.advanceTimersByTime(61000);
      
      // Should be allowed again
      expect(rateLimiter.isAllowed('user3', config)).toBe(true);
    });

    it('should track remaining requests correctly', () => {
      expect(rateLimiter.getRemainingRequests('user4', config)).toBe(3);
      
      rateLimiter.isAllowed('user4', config);
      expect(rateLimiter.getRemainingRequests('user4', config)).toBe(2);
      
      rateLimiter.isAllowed('user4', config);
      expect(rateLimiter.getRemainingRequests('user4', config)).toBe(1);
    });

    it('should calculate reset time correctly', () => {
      const now = Date.now();
      rateLimiter.isAllowed('user5', config);
      
      const resetTime = rateLimiter.getResetTime('user5', config);
      expect(resetTime).toBeGreaterThanOrEqual(now);
      expect(resetTime).toBeLessThanOrEqual(now + config.window * 1000);
    });

    it('should handle different identifiers separately', () => {
      rateLimiter.isAllowed('user6', config);
      rateLimiter.isAllowed('user6', config);
      rateLimiter.isAllowed('user6', config);
      expect(rateLimiter.isAllowed('user6', config)).toBe(false);

      // Different user should still be allowed
      expect(rateLimiter.isAllowed('user7', config)).toBe(true);
    });
  });

  describe('APIMetricsCollector', () => {
    const createMetric = (overrides = {}) => ({
      endpoint: '/api/test',
      method: 'GET',
      statusCode: 200,
      responseTime: 100,
      timestamp: new Date(),
      ...overrides,
    });

    it('should record metrics', () => {
      const metric = createMetric();
      metricsCollector.record(metric);
      
      const metrics = metricsCollector.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0]).toMatchObject(metric);
    });

    it('should filter metrics by endpoint', () => {
      metricsCollector.record(createMetric({ endpoint: '/api/users' }));
      metricsCollector.record(createMetric({ endpoint: '/api/posts' }));
      metricsCollector.record(createMetric({ endpoint: '/api/users' }));

      const filtered = metricsCollector.getMetrics({ endpoint: '/api/users' });
      expect(filtered).toHaveLength(2);
      expect(filtered.every(m => m.endpoint === '/api/users')).toBe(true);
    });

    it('should filter metrics by status code', () => {
      metricsCollector.record(createMetric({ statusCode: 200 }));
      metricsCollector.record(createMetric({ statusCode: 404 }));
      metricsCollector.record(createMetric({ statusCode: 500 }));

      const filtered = metricsCollector.getMetrics({ statusCode: 404 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].statusCode).toBe(404);
    });

    it('should filter metrics by time range', () => {
      const now = new Date();
      const past = new Date(now.getTime() - 3600000); // 1 hour ago
      const future = new Date(now.getTime() + 3600000); // 1 hour later

      metricsCollector.record(createMetric({ timestamp: past }));
      metricsCollector.record(createMetric({ timestamp: now }));

      const filtered = metricsCollector.getMetrics({
        timeRange: { start: new Date(now.getTime() - 1800000), end: future },
      });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].timestamp).toEqual(now);
    });

    it('should calculate statistics correctly', () => {
      // Clear any existing metrics
      for (let i = 0; i < 1001; i++) {
        metricsCollector.record(createMetric());
      }
      
      // Now add our test metrics
      metricsCollector.record(createMetric({ responseTime: 100, statusCode: 200, endpoint: '/api/a' }));
      metricsCollector.record(createMetric({ responseTime: 200, statusCode: 200, endpoint: '/api/a' }));
      metricsCollector.record(createMetric({ responseTime: 300, statusCode: 404, endpoint: '/api/b' }));
      metricsCollector.record(createMetric({ responseTime: 400, statusCode: 500, endpoint: '/api/b' }));

      const stats = metricsCollector.getStats();
      expect(stats.totalRequests).toBe(1000); // Last 1000 metrics
      expect(stats.averageResponseTime).toBeGreaterThan(0);
      expect(stats.errorRate).toBeGreaterThan(0);
      expect(stats.topEndpoints).toBeDefined();
      expect(Array.isArray(stats.topEndpoints)).toBe(true);
    });

    it('should limit stored metrics to maxMetrics', () => {
      // Add more than maxMetrics
      for (let i = 0; i < 1100; i++) {
        metricsCollector.record(createMetric({ endpoint: `/api/test${i}` }));
      }

      const metrics = metricsCollector.getMetrics();
      expect(metrics).toHaveLength(1000);
    });
  });

  describe('withCache middleware', () => {
    const mockHandler = jest.fn(async (req: NextRequest) => {
      return NextResponse.json({ data: 'test' }, { status: 200 });
    });

    it('should cache GET requests', async () => {
      const cachedHandler = withCache({ strategy: 'memory', ttl: 60 })(mockHandler);
      const req = new NextRequest('http://test.com/api/test', { method: 'GET' });

      // First call - MISS
      const response1 = await cachedHandler(req);
      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(response1.headers.get('X-Cache')).toBe('MISS');

      // Second call - HIT
      const response2 = await cachedHandler(req);
      expect(mockHandler).toHaveBeenCalledTimes(1); // Handler not called again
      expect(response2.headers.get('X-Cache')).toBe('HIT');
    });

    it('should not cache non-GET requests', async () => {
      const cachedHandler = withCache({ strategy: 'memory', ttl: 60 })(mockHandler);
      const req = new NextRequest('http://test.com/api/test', { method: 'POST' });

      await cachedHandler(req);
      await cachedHandler(req);
      
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    it('should skip caching when strategy is none', async () => {
      const cachedHandler = withCache({ strategy: 'none', ttl: 60 })(mockHandler);
      const req = new NextRequest('http://test.com/api/test', { method: 'GET' });

      await cachedHandler(req);
      await cachedHandler(req);
      
      expect(mockHandler).toHaveBeenCalledTimes(2);
    });

    it('should use custom cache key when provided', async () => {
      const cachedHandler = withCache({ 
        strategy: 'memory', 
        ttl: 60, 
        key: 'custom-key' 
      })(mockHandler);
      
      const req1 = new NextRequest('http://test.com/api/test1', { method: 'GET' });
      const req2 = new NextRequest('http://test.com/api/test2', { method: 'GET' });

      await cachedHandler(req1);
      await cachedHandler(req2);
      
      // Both requests should hit the same cache key
      expect(mockHandler).toHaveBeenCalledTimes(1);
    });

    it('should only cache successful responses', async () => {
      const errorHandler = jest.fn(async () => {
        return NextResponse.json({ error: 'test' }, { status: 500 });
      });
      
      const cachedHandler = withCache({ strategy: 'memory', ttl: 60 })(errorHandler);
      const req = new NextRequest('http://test.com/api/test', { method: 'GET' });

      await cachedHandler(req);
      await cachedHandler(req);
      
      // Error responses should not be cached
      expect(errorHandler).toHaveBeenCalledTimes(2);
    });

    it('should add cache tags when provided', async () => {
      const cachedHandler = withCache({ 
        strategy: 'memory', 
        ttl: 60, 
        tags: ['tag1', 'tag2'] 
      })(mockHandler);
      
      const req = new NextRequest('http://test.com/api/test', { method: 'GET' });
      await cachedHandler(req);

      // Verify cache was added with tags
      expect(memoryCache.get(`http://test.com/api/test_GET`)).toBeTruthy();
      
      // Invalidate by tag
      const invalidated = invalidateCache('tag1');
      expect(invalidated).toBe(1);
      expect(memoryCache.get(`http://test.com/api/test_GET`)).toBeNull();
    });
  });

  describe('withRateLimit middleware', () => {
    const mockHandler = jest.fn(async () => {
      return NextResponse.json({ data: 'test' });
    });

    it('should allow requests within limit', async () => {
      const limitedHandler = withRateLimit({ requests: 2, window: 60 })(mockHandler);
      const req = new NextRequest('http://test.com/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.1' },
      });

      const response1 = await limitedHandler(req);
      expect(response1.status).toBe(200);
      expect(response1.headers.get('X-RateLimit-Limit')).toBe('2');
      expect(response1.headers.get('X-RateLimit-Remaining')).toBe('1');

      const response2 = await limitedHandler(req);
      expect(response2.status).toBe(200);
      expect(response2.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should block requests exceeding limit', async () => {
      const limitedHandler = withRateLimit({ requests: 1, window: 60 })(mockHandler);
      const req = new NextRequest('http://test.com/api/test', {
        headers: { 'x-forwarded-for': '192.168.1.2' },
      });

      await limitedHandler(req);
      const response2 = await limitedHandler(req);
      
      expect(response2.status).toBe(429);
      const body = await response2.json();
      expect(body.error).toBe('Rate limit exceeded');
      expect(response2.headers.get('Retry-After')).toBeDefined();
    });

    it('should use custom identifier function', async () => {
      const customIdentifier = jest.fn((req: NextRequest) => 'custom-id');
      const limitedHandler = withRateLimit({ 
        requests: 1, 
        window: 60,
        identifier: customIdentifier,
      })(mockHandler);
      
      const req = new NextRequest('http://test.com/api/test');
      await limitedHandler(req);
      
      expect(customIdentifier).toHaveBeenCalledWith(req);
    });

    it('should handle missing IP headers', async () => {
      const limitedHandler = withRateLimit({ requests: 1, window: 60 })(mockHandler);
      const req = new NextRequest('http://test.com/api/test');

      const response = await limitedHandler(req);
      expect(response.status).toBe(200);
      
      // Should use 'anonymous' as identifier
      const response2 = await limitedHandler(req);
      expect(response2.status).toBe(429);
    });
  });

  describe('withMetrics middleware', () => {
    const mockHandler = jest.fn(async () => {
      return NextResponse.json({ data: 'test' });
    });

    it('should record metrics for successful requests', async () => {
      const metricHandler = withMetrics()(mockHandler);
      const req = new NextRequest('http://test.com/api/test', {
        method: 'POST',
        headers: { 'user-agent': 'Test Agent' },
      });

      const response = await metricHandler(req);
      expect(response.headers.get('X-Response-Time')).toMatch(/^\d+ms$/);

      const metrics = metricsCollector.getMetrics();
      const lastMetric = metrics[metrics.length - 1];
      expect(lastMetric.endpoint).toBe('/api/test');
      expect(lastMetric.method).toBe('POST');
      expect(lastMetric.statusCode).toBe(200);
      expect(lastMetric.userAgent).toBe('Test Agent');
    });

    it('should record metrics for errors', async () => {
      const errorHandler = jest.fn(async () => {
        throw new Error('Test error');
      });
      
      const metricHandler = withMetrics()(errorHandler);
      const req = new NextRequest('http://test.com/api/error');

      await expect(metricHandler(req)).rejects.toThrow('Test error');

      const metrics = metricsCollector.getMetrics();
      const lastMetric = metrics[metrics.length - 1];
      expect(lastMetric.endpoint).toBe('/api/error');
      expect(lastMetric.statusCode).toBe(500);
    });

    it('should extract IP from headers', async () => {
      const metricHandler = withMetrics()(mockHandler);
      const req = new NextRequest('http://test.com/api/test', {
        headers: { 'x-real-ip': '10.0.0.1' },
      });

      await metricHandler(req);

      const metrics = metricsCollector.getMetrics();
      const lastMetric = metrics[metrics.length - 1];
      expect(lastMetric.ip).toBe('10.0.0.1');
    });
  });

  describe('withOptimization middleware', () => {
    const mockHandler = jest.fn(async () => {
      return NextResponse.json({ data: 'test' });
    });

    it('should apply all optimizations when configured', async () => {
      const optimizedHandler = withOptimization({
        cache: { strategy: 'memory', ttl: 60 },
        rateLimit: { requests: 10, window: 60 },
        metrics: true,
      })(mockHandler);

      const req = new NextRequest('http://test.com/api/test', { method: 'GET' });
      
      const response = await optimizedHandler(req);
      expect(response.headers.get('X-Cache')).toBe('MISS');
      expect(response.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(response.headers.get('X-Response-Time')).toMatch(/^\d+ms$/);
    });

    it('should skip metrics when disabled', async () => {
      const optimizedHandler = withOptimization({
        metrics: false,
      })(mockHandler);

      const req = new NextRequest('http://test.com/api/test');
      const response = await optimizedHandler(req);
      
      expect(response.headers.get('X-Response-Time')).toBeNull();
    });

    it('should apply optimizations in correct order', async () => {
      let callOrder: string[] = [];
      
      const trackingHandler = jest.fn(async () => {
        callOrder.push('handler');
        return NextResponse.json({ data: 'test' });
      });

      // Mock the middleware to track order
      const originalWithCache = withCache;
      const originalWithRateLimit = withRateLimit;
      const originalWithMetrics = withMetrics;

      (withCache as any) = (config: any) => (handler: any) => {
        return async (...args: any[]) => {
          callOrder.push('cache');
          return handler(...args);
        };
      };

      (withRateLimit as any) = (config: any) => (handler: any) => {
        return async (...args: any[]) => {
          callOrder.push('rateLimit');
          return handler(...args);
        };
      };

      (withMetrics as any) = () => (handler: any) => {
        return async (...args: any[]) => {
          callOrder.push('metrics');
          return handler(...args);
        };
      };

      const optimizedHandler = withOptimization({
        cache: { strategy: 'memory', ttl: 60 },
        rateLimit: { requests: 10, window: 60 },
        metrics: true,
      })(trackingHandler);

      await optimizedHandler(new NextRequest('http://test.com/api/test'));

      // Order should be: cache -> rateLimit -> metrics -> handler
      expect(callOrder).toEqual(['cache', 'rateLimit', 'metrics', 'handler']);

      // Restore original functions
      Object.assign(withCache, originalWithCache);
      Object.assign(withRateLimit, originalWithRateLimit);
      Object.assign(withMetrics, originalWithMetrics);
    });
  });

  describe('QueryOptimizer', () => {
    describe('batchQueries', () => {
      it('should execute queries in parallel', async () => {
        const query1 = jest.fn(async () => 'result1');
        const query2 = jest.fn(async () => 'result2');
        const query3 = jest.fn(async () => 'result3');

        const results = await QueryOptimizer.batchQueries([query1, query2, query3]);
        
        expect(results).toEqual(['result1', 'result2', 'result3']);
        expect(query1).toHaveBeenCalled();
        expect(query2).toHaveBeenCalled();
        expect(query3).toHaveBeenCalled();
      });

      it('should handle query failures', async () => {
        const query1 = jest.fn(async () => 'result1');
        const query2 = jest.fn(async () => {
          throw new Error('Query failed');
        });

        await expect(
          QueryOptimizer.batchQueries([query1, query2])
        ).rejects.toThrow('Query failed');
      });
    });

    describe('getPaginationParams', () => {
      it('should parse pagination parameters correctly', () => {
        const searchParams = new URLSearchParams('page=2&limit=20');
        const params = QueryOptimizer.getPaginationParams(searchParams);
        
        expect(params).toEqual({
          page: 2,
          limit: 20,
          offset: 20,
        });
      });

      it('should use default values', () => {
        const searchParams = new URLSearchParams();
        const params = QueryOptimizer.getPaginationParams(searchParams);
        
        expect(params).toEqual({
          page: 1,
          limit: 10,
          offset: 0,
        });
      });

      it('should enforce minimum values', () => {
        const searchParams = new URLSearchParams('page=0&limit=0');
        const params = QueryOptimizer.getPaginationParams(searchParams);
        
        expect(params).toEqual({
          page: 1,
          limit: 1,
          offset: 0,
        });
      });

      it('should enforce maximum limit', () => {
        const searchParams = new URLSearchParams('limit=200');
        const params = QueryOptimizer.getPaginationParams(searchParams);
        
        expect(params.limit).toBe(100);
      });
    });

    describe('buildPaginatedResponse', () => {
      it('should build pagination metadata correctly', () => {
        const data = ['item1', 'item2', 'item3'];
        const response = QueryOptimizer.buildPaginatedResponse(
          data,
          25, // total
          2,  // page
          10, // limit
          'http://api.test.com/items'
        );

        expect(response).toEqual({
          data,
          pagination: {
            page: 2,
            limit: 10,
            total: 25,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
            nextUrl: 'http://api.test.com/items?page=3&limit=10',
            prevUrl: 'http://api.test.com/items?page=1&limit=10',
          },
        });
      });

      it('should handle first page correctly', () => {
        const data = ['item1'];
        const response = QueryOptimizer.buildPaginatedResponse(data, 10, 1, 10);

        expect(response.pagination).toMatchObject({
          page: 1,
          hasNext: false,
          hasPrev: false,
        });
      });

      it('should handle last page correctly', () => {
        const data = ['item1'];
        const response = QueryOptimizer.buildPaginatedResponse(data, 21, 3, 10);

        expect(response.pagination).toMatchObject({
          page: 3,
          totalPages: 3,
          hasNext: false,
          hasPrev: true,
        });
      });

      it('should not include URLs when baseUrl is not provided', () => {
        const data = ['item1'];
        const response = QueryOptimizer.buildPaginatedResponse(data, 20, 1, 10);

        expect(response.pagination).not.toHaveProperty('nextUrl');
        expect(response.pagination).not.toHaveProperty('prevUrl');
      });
    });
  });

  describe('Utility functions', () => {
    it('getAPIStats should return current stats', () => {
      // Add some test data
      memoryCache.set('key1', 'value1', 60, []);
      metricsCollector.record({
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 100,
        timestamp: new Date(),
      });

      const stats = getAPIStats();
      expect(stats.cache.size).toBe(1);
      expect(stats.metrics.totalRequests).toBeGreaterThan(0);
    });

    it('clearCaches should clear all caches', () => {
      memoryCache.set('key1', 'value1', 60, []);
      memoryCache.set('key2', 'value2', 60, []);
      
      clearCaches();
      expect(memoryCache.size()).toBe(0);
    });

    it('invalidateCache should invalidate by tag', () => {
      memoryCache.set('key1', 'value1', 60, ['tag1']);
      memoryCache.set('key2', 'value2', 60, ['tag2']);
      memoryCache.set('key3', 'value3', 60, ['tag1', 'tag2']);

      const count = invalidateCache('tag1');
      expect(count).toBe(2);
      expect(memoryCache.get('key2')).toBe('value2');
      expect(memoryCache.get('key1')).toBeNull();
      expect(memoryCache.get('key3')).toBeNull();
    });
  });
});
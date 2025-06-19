import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import { createClient } from '@/lib/supabase/server';
import { setupCommonMocks, createMockRequest } from '@/__tests__/utils/api-route-test-helpers';
import {
// Mock global fetch

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
};

jest.mock('@/lib/auth/supabase-client', () => ({ 
  createClient: jest.fn(() => mockSupabaseClient),
  supabase: mockSupabaseClient,
 }));

global.fetch = jest.fn();
 OptimizedAnalyticsService } from '@/lib/services/analytics/optimized-analytics-service';

// Mock dependencies

jest.mock('@/lib/cache/in-memory', () => ({
  inMemoryCache: {
    get: jest.fn().mockReturnValue(void 0),
    set: jest.fn().mockReturnValue(void 0),
    delete: jest.fn().mockReturnValue(void 0),
    clear: jest.fn().mockReturnValue(void 0),
  },
}));
jest.mock('@/lib/services/error/error-logger');

describe('OptimizedAnalyticsService', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  setupCommonMocks();

  let service: OptimizedAnalyticsService;
  let mockSupabase: any;
  const mockPortfolioId = 'portfolio-123';
  const _mockUserId = 'user-456';

  const mockCachedData = {
    views: 1500,
    visitors: 850,
    engagement: 0.65,
    lastUpdated: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockCachedData,
          error: null,
        }),
      })),
      rpc: jest.fn().mockResolvedValue({
        data: mockCachedData,
        error: null,
      }),
    };

    jest.mocked(createClient).mockReturnValue(mockSupabase);
    service = new OptimizedAnalyticsService();
  });

  describe('getBatchedAnalytics', () => {
    it('should batch multiple analytics requests', async () => {
      const portfolioIds = ['portfolio-1', 'portfolio-2', 'portfolio-3'];
      const batchedData = portfolioIds.map(id => ({
        portfolioId: id,
        analytics: { ...mockCachedData, portfolioId: id },
      }));

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({
          data: batchedData,
          error: null,
        }),
      });

      const result = await service.getBatchedAnalytics(portfolioIds, '7d');

      expect(result).toHaveLength(3);
      expect(mockSupabase.from).toHaveBeenCalledTimes(1); // Single batched query
      expect(mockSupabase.from().in).toHaveBeenCalledWith(
      'portfolio_id',
        portfolioIds
    );
  });

    it('should handle batch size limits', async () => {
      const largePortfolioList = Array.from(
        { length: 150 },
        (_, i) => `portfolio-${i}`

      await service.getBatchedAnalytics(largePortfolioList, '7d');

      // Should split into multiple batches (batch size = 100)
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });
  });

  describe('getOptimizedMetrics', () => {
    it('should use tiered caching strategy', async () => {
      const { inMemoryCache } = require('@/lib/cache/in-memory');

      // First call - cache miss
      inMemoryCache.get.mockReturnValue(null);
      const result1 = await service.getOptimizedMetrics(mockPortfolioId, {
        metrics: ['views', 'visitors'],
        timeRange: '24h',
      });

      expect(result1).toEqual(mockCachedData);
      expect(inMemoryCache.set).toHaveBeenCalled();
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);

      // Second call - cache hit
      inMemoryCache.get.mockReturnValue(mockCachedData);
      const result2 = await service.getOptimizedMetrics(mockPortfolioId, {
        metrics: ['views', 'visitors'],
        timeRange: '24h',
      });

      expect(result2).toEqual(mockCachedData);
      expect(mockSupabase.from).toHaveBeenCalledTimes(1); // No additional DB call
    });

    it('should prefetch related data', async () => {
      const result = await service.getOptimizedMetrics(mockPortfolioId, {
        metrics: ['views', 'visitors', 'engagement'],
        timeRange: '7d',
        prefetch: ['referrers', 'devices'],
      });

      expect(result).toHaveProperty('views');
      expect(result).toHaveProperty('visitors');
      expect(result).toHaveProperty('engagement');
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolio_analytics');
    });
  });

  describe('getStreamingAnalytics', () => {
    it('should stream analytics data progressively', async () => {
      const onProgress = jest.fn().mockReturnValue(void 0);
      const streamData = [
        { metric: 'views', value: 1500 },
        { metric: 'visitors', value: 850 },
        { metric: 'engagement', value: 0.65 },
      ];

      // Mock streaming response
      let streamIndex = 0;
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        subscribe: jest.fn(callback => {
          const interval = setInterval(() => {
            if (streamIndex < streamData.length) {
              callback(streamData[streamIndex]);
              streamIndex++;
            } else {
              clearInterval(interval);
            }
          });
          return { unsubscribe: () => clearInterval(interval) };
        }),
      }));

      await service.getStreamingAnalytics(mockPortfolioId, {
        metrics: ['views', 'visitors', 'engagement'],
        onProgress,
      });

      // Wait for streaming to complete
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(onProgress).toHaveBeenCalledTimes(3);
      expect(onProgress).toHaveBeenCalledWith(streamData[0]);
    });
  });

  describe('getLazyLoadedAnalytics', () => {
    it('should load analytics data on demand', async () => {
      const lazyLoader = await service.getLazyLoadedAnalytics(mockPortfolioId);

      // Initial load should return basic metrics
      const basicMetrics = await lazyLoader.getBasicMetrics();
      expect(basicMetrics).toHaveProperty('views');
      expect(basicMetrics).toHaveProperty('visitors');

      // Detailed metrics should be loaded separately
      const detailedMetrics = await lazyLoader.getDetailedMetrics();
      expect(detailedMetrics).toHaveProperty('referrers');
      expect(detailedMetrics).toHaveProperty('devices');
      expect(detailedMetrics).toHaveProperty('browsers');

      // Should make separate queries for each level
      expect(mockSupabase.from).toHaveBeenCalledTimes(2);
    });

    it('should cache lazy-loaded segments', async () => {
      const lazyLoader = await service.getLazyLoadedAnalytics(mockPortfolioId);

      // Load same metrics twice
      await lazyLoader.getBasicMetrics();
      await lazyLoader.getBasicMetrics();

      // Should only query once due to caching
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAggregatedDashboard', () => {
    it('should aggregate multiple portfolios for user', async () => {
      const mockPortfolios = [
        { id: 'portfolio-1', views: 500, visitors: 300 },
        { id: 'portfolio-2', views: 800, visitors: 450 },
        { id: 'portfolio-3', views: 200, visitors: 100 },
      ];

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolios') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: mockPortfolios.map(p => ({ id: p.id })),
              error: null,
            }),
          };
        }
        return {
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValue({
            data: mockPortfolios,
            error: null,
          }),
        };
      });

      const result = await service.getAggregatedDashboard(mockUserId, {
        timeRange: '30d',
        groupBy: 'portfolio',
      });

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('byPortfolio');
      expect(result.total.views).toBe(1500);
      expect(result.total.visitors).toBe(850);
    });

    it('should calculate growth trends', async () => {
      const result = await service.getAggregatedDashboard(mockUserId, {
        timeRange: '30d',
        includeGrowth: true,
        compareWith: 'previousPeriod',
      });

      expect(result).toHaveProperty('growth');
      expect(result.growth).toHaveProperty('views');
      expect(result.growth).toHaveProperty('visitors');
      expect(result.growth).toHaveProperty('engagement');
    });
  });

  describe('Performance Optimization', () => {
    it('should use query optimization techniques', async () => {
      // Test indexed field usage
      await service.getOptimizedMetrics(mockPortfolioId, {
        metrics: ['views'],
        timeRange: '24h',
        optimize: true,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith(
      'portfolio_analytics_optimized'
    );
  });

    it('should implement request deduplication', async () => {
      // Make multiple concurrent requests for same data
      const promises = Array.from({ length: 5 }, () =>
        service.getOptimizedMetrics(mockPortfolioId, {
          metrics: ['views'],
          timeRange: '24h',
        })

      await Promise.all(promises);

      // Should only make one actual database query
      expect(mockSupabase.from).toHaveBeenCalledTimes(1);
    });

    it('should use connection pooling efficiently', async () => {
      const concurrentRequests = 20;
      const promises = Array.from({ length: concurrentRequests }, (_, i) =>
        service.getOptimizedMetrics(`portfolio-${i}`, {
          metrics: ['views'],
          timeRange: '24h',
        })

      await Promise.all(promises);

      // Verify connection reuse (mock implementation detail)
      expect(createClient).toHaveBeenCalledTimes(1); // Single client instance
    });
  });

  describe('Data Compression', () => {
    it('should compress large analytics responses', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        views: Math.floor(Math.random() * 100),
        visitors: Math.floor(Math.random() * 50),
      }));

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({
          data: largeDataSet,
          error: null,
        }),
      });

      const result = await service.getOptimizedMetrics(mockPortfolioId, {
        metrics: ['views', 'visitors'],
        timeRange: '30d',
        compress: true,
      });

      expect(result).toHaveProperty('compressed', true);
      expect(result).toHaveProperty('encoding', 'gzip');
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should retry failed requests with exponential backoff', async () => {
      let attempts = 0;
      mockSupabase.from.mockImplementation(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          attempts++;
          if (attempts < 3) {
            return Promise.resolve({
              data: null,
              error: new Error('Temporary failure'),
            });
          }
          return Promise.resolve({
            data: mockCachedData,
            error: null,
          });
        }),
      }));

      const result = await service.getOptimizedMetrics(mockPortfolioId, {
        metrics: ['views'],
        timeRange: '24h',
        retryOptions: { maxAttempts: 3, backoffMs: 10 },
      });

      expect(result).toEqual(mockCachedData);
      expect(attempts).toBe(3);
    });

    it('should handle partial failures gracefully', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolio_analytics') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: { views: 1500, visitors: 850 },
              error: null,
            }),
          };
        }
        // Simulate failure for detailed metrics
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: new Error('Failed to fetch detailed metrics'),
          }),
        };
      });

      const result = await service.getOptimizedMetrics(mockPortfolioId, {
        metrics: ['views', 'visitors', 'detailed'],
        timeRange: '24h',
        allowPartialResults: true,
      });

      expect(result).toHaveProperty('views', 1500);
      expect(result).toHaveProperty('visitors', 850);
      expect(result).toHaveProperty('errors');
      expect(result.errors).toContain('detailed');
    });

    it('should implement circuit breaker pattern', async () => {
      const errorLogger = require('@/lib/services/error/error-logger');

      // Simulate multiple failures
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Service unavailable'),
        }),
      });

      // Make requests until circuit opens
      for (let i = 0; i < 5; i++) {
        try {
          await service.getOptimizedMetrics(mockPortfolioId, {
            metrics: ['views'],
            timeRange: '24h',
          });
        } catch (_error) {
          // Expected failures
        }
      }

      // Circuit should be open, next request should fail fast
      await expect(
        service.getOptimizedMetrics(mockPortfolioId, {
          metrics: ['views'],
          timeRange: '24h',
        })
      ).rejects.toThrow('Circuit breaker is open');

      expect(errorLogger.logError).toHaveBeenCalled();
    });
  });

  describe('Data Validation and Sanitization', () => {
    it('should validate analytics data integrity', async () => {
      const invalidData = {
        views: -100, // Invalid negative value
        visitors: 1500,
        engagement: 2.5, // Invalid > 1
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: invalidData,
          error: null,
        }),
      });

      const result = await service.getOptimizedMetrics(mockPortfolioId, {
        metrics: ['views', 'visitors', 'engagement'],
        timeRange: '24h',
        validateData: true,
      });

      // Should sanitize invalid values
      expect(result.views).toBe(0);
      expect(result.engagement).toBeLessThanOrEqual(1);
    });
  });
});

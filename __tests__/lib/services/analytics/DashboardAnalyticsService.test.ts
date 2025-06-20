import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import type { Mock, MockedClass } from 'jest-mock';
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
 DashboardAnalyticsService } from '@/lib/services/analytics/DashboardAnalyticsService';

// Mock dependencies

jest.mock('@/lib/cache/redis-cache.server', () => ({
  redisCache: {
    get: jest.fn().mockReturnValue(void 0),
    set: jest.fn().mockReturnValue(void 0),
    delete: jest.fn().mockReturnValue(void 0),
  },
}));

describe('DashboardAnalyticsService', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  setupCommonMocks();

  let service: DashboardAnalyticsService;
  let mockSupabase: any;
  const _mockUserId = 'user-123';
  const mockPortfolioId = 'portfolio-456';

  const mockAnalyticsData = {
    totalViews: 1500,
    uniqueVisitors: 850,
    avgSessionDuration: 185,
    bounceRate: 0.35,
    topReferrers: [
      { source: 'linkedin.com', visits: 450, percentage: 30 },
      { source: 'github.com', visits: 300, percentage: 20 },
      { source: 'direct', visits: 225, percentage: 15 },
    ],
    viewsByDay: [
      { date: '2025-06-01', views: 120 },
      { date: '2025-06-02', views: 150 },
      { date: '2025-06-03', views: 180 },
    ],
    deviceBreakdown: {
      desktop: 60,
      mobile: 35,
      tablet: 5,
    },
    browserBreakdown: {
      chrome: 65,
      safari: 20,
      firefox: 10,
      edge: 5,
    },
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
          data: mockAnalyticsData,
          error: null,
        }),
      })),
      rpc: jest.fn().mockResolvedValue({
        data: mockAnalyticsData,
        error: null,
      }),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    service = new DashboardAnalyticsService();
  });

  describe('getOverviewMetrics', () => {
    it('should fetch overview metrics for a portfolio', async () => {
      const result = await service.getOverviewMetrics(mockPortfolioId, '7d');

      expect(result).toEqual(mockAnalyticsData);
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolio_analytics');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith(
      'portfolio_id',
        mockPortfolioId
    );
  });

    it('should handle different time ranges', async () => {
      const timeRanges = ['24h', '7d', '30d', '90d', '1y', 'all'];

      for (const range of timeRanges) {
        await service.getOverviewMetrics(mockPortfolioId, range);
      }

      expect(mockSupabase.from).toHaveBeenCalledTimes(timeRanges.length);
    });

    it('should use cache for frequently accessed data', async () => {
      const { redisCache } = require('@/lib/cache/redis-cache.server');
      redisCache.get.mockResolvedValue(JSON.stringify(mockAnalyticsData));

      const result = await service.getOverviewMetrics(mockPortfolioId, '7d');

      expect(result).toEqual(mockAnalyticsData);
      expect(redisCache.get).toHaveBeenCalledWith(
        expect.stringContaining(`analytics:overview:${mockPortfolioId}`)

      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should handle cache miss and populate cache', async () => {
      const { redisCache } = require('@/lib/cache/redis-cache.server');
      redisCache.get.mockResolvedValue(null);

      const result = await service.getOverviewMetrics(mockPortfolioId, '7d');

      expect(result).toEqual(mockAnalyticsData);
      expect(redisCache.set).toHaveBeenCalledWith(
        expect.stringContaining(`analytics:overview:${mockPortfolioId}`),
        JSON.stringify(mockAnalyticsData),
        300 // 5 minutes TTL

    });
  });

  describe('getVisitorAnalytics', () => {
    it('should fetch visitor analytics with demographics', async () => {
      const mockVisitorData = {
        uniqueVisitors: 850,
        returningVisitors: 320,
        newVisitors: 530,
        visitorGrowth: 15.5,
        demographics: {
          countries: [
            { country: 'US', visitors: 450, percentage: 52.9 },
            { country: 'UK', visitors: 150, percentage: 17.6 },
            { country: 'CA', visitors: 100, percentage: 11.8 },
          ],
          languages: [
            { language: 'en', visitors: 600, percentage: 70.6 },
            { language: 'es', visitors: 150, percentage: 17.6 },
            { language: 'fr', visitors: 100, percentage: 11.8 },
          ],
        },
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockVisitorData,
          error: null,
        }),
      });

      const result = await service.getVisitorAnalytics(mockPortfolioId, '30d');

      expect(result).toEqual(mockVisitorData);
      expect(result.demographics).toBeDefined();
      expect(result.demographics.countries).toBeInstanceOf(Array);
    });

    it('should calculate visitor retention metrics', async () => {
      const mockRetentionData = {
        cohorts: [
          { week: '2025-W23', retention: [100, 45, 32, 28, 25] },
          { week: '2025-W24', retention: [100, 48, 35, 30] },
        ],
        averageRetention: {
          day1: 46.5,
          day7: 33.5,
          day30: 27.5,
        },
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockRetentionData,
        error: null,
      });

      const result = await service.getRetentionMetrics(mockPortfolioId);

      expect(result).toEqual(mockRetentionData);
      expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'calculate_retention_cohorts',
        {
          portfolio_id: mockPortfolioId,
        }
    );
  });
  });

  describe('getEngagementMetrics', () => {
    it('should fetch engagement metrics', async () => {
      const mockEngagementData = {
        avgSessionDuration: 185,
        bounceRate: 0.35,
        pagesPerSession: 3.2,
        engagementRate: 0.65,
        interactions: {
          projectClicks: 450,
          contactClicks: 120,
          resumeDownloads: 85,
          socialLinks: 230,
        },
        scrollDepth: {
          25: 92,
          50: 78,
          75: 45,
          100: 23,
        },
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockEngagementData,
          error: null,
        }),
      });

      const result = await service.getEngagementMetrics(mockPortfolioId, '7d');

      expect(result).toEqual(mockEngagementData);
      expect(result.interactions).toBeDefined();
      expect(result.scrollDepth).toBeDefined();
    });

    it('should track interaction events', async () => {
      const interactionEvent = {
        portfolioId: mockPortfolioId,
        eventType: 'project_click',
        eventValue: 'project-123',
        timestamp: new Date().toISOString(),
      };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: { id: 'event-123', ...interactionEvent },
          error: null,
        }),
      });

      await service.trackInteraction(interactionEvent);

      expect(mockSupabase.from).toHaveBeenCalledWith('engagement_events');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(interactionEvent);
    });
  });

  describe('getRealTimeAnalytics', () => {
    it('should fetch real-time visitor data', async () => {
      const mockRealTimeData = {
        activeVisitors: 12,
        activeSessions: [
          {
            sessionId: 'session-1',
            startTime: new Date().toISOString(),
            currentPage: '/projects',
            duration: 45,
          },
          {
            sessionId: 'session-2',
            startTime: new Date().toISOString(),
            currentPage: '/contact',
            duration: 120,
          },
        ],
        pageViews: {
          '/': 5,
          '/projects': 4,
          '/contact': 3,
        },
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockRealTimeData,
        error: null,
      });

      const result = await service.getRealTimeAnalytics(mockPortfolioId);

      expect(result).toEqual(mockRealTimeData);
      expect(result.activeVisitors).toBe(12);
      expect(result.activeSessions).toHaveLength(2);
    });

    it('should handle WebSocket connections for real-time updates', async () => {
      const mockChannel = {
        on: jest.fn().mockReturnThis(),
        subscribe: jest.fn().mockReturnValue(void 0),
      };

      mockSupabase.channel = jest.fn().mockReturnValue(mockChannel);

      const callback = jest.fn().mockReturnValue(void 0);
      await service.subscribeToRealTimeUpdates(mockPortfolioId, callback);

      expect(mockSupabase.channel).toHaveBeenCalledWith(
        expect.stringContaining(`analytics:${mockPortfolioId}`)

      expect(mockChannel.on).toHaveBeenCalled();
      expect(mockChannel.subscribe).toHaveBeenCalled();
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should fetch page performance metrics', async () => {
      const mockPerformanceData = {
        pageLoadTime: {
          avg: 2.3,
          p50: 2.1,
          p75: 2.8,
          p95: 4.2,
        },
        coreWebVitals: {
          lcp: { value: 2.1, rating: 'good' },
          fid: { value: 85, rating: 'good' },
          cls: { value: 0.08, rating: 'good' },
        },
        resourceTimings: {
          images: { avg: 450, count: 12 },
          scripts: { avg: 320, count: 5 },
          styles: { avg: 180, count: 3 },
        },
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPerformanceData,
          error: null,
        }),
      });

      const result = await service.getPerformanceMetrics(mockPortfolioId, '7d');

      expect(result).toEqual(mockPerformanceData);
      expect(result.coreWebVitals).toBeDefined();
      expect(result.coreWebVitals.lcp.rating).toBe('good');
    });
  });

  describe('getConversionMetrics', () => {
    it('should track conversion funnel', async () => {
      const mockConversionData = {
        funnel: [
          { step: 'portfolio_view', count: 1000, rate: 100 },
          { step: 'project_click', count: 450, rate: 45 },
          { step: 'contact_click', count: 120, rate: 12 },
          { step: 'contact_submit', count: 45, rate: 4.5 },
        ],
        goals: {
          contact_form_submission: { achieved: 45, target: 50, rate: 90 },
          resume_download: { achieved: 85, target: 100, rate: 85 },
          project_view: { achieved: 450, target: 400, rate: 112.5 },
        },
      };

      mockSupabase.rpc.mockResolvedValue({
        data: mockConversionData,
        error: null,
      });

      const result = await service.getConversionMetrics(mockPortfolioId, '30d');

      expect(result).toEqual(mockConversionData);
      expect(result.funnel).toHaveLength(4);
      expect(result.goals.contact_form_submission.rate).toBe(90);
    });
  });

  describe('generateAnalyticsReport', () => {
    it('should generate comprehensive analytics report', async () => {
      const report = await service.generateAnalyticsReport(mockPortfolioId, {
        timeRange: '30d',
        includeRealTime: true,
        includePerformance: true,
        format: 'json',
      });

      expect(report).toHaveProperty('overview');
      expect(report).toHaveProperty('visitors');
      expect(report).toHaveProperty('engagement');
      expect(report).toHaveProperty('performance');
      expect(report).toHaveProperty('generatedAt');
    });

    it('should export report in different formats', async () => {
      const formats = ['json', 'csv', 'pdf'];

      for (const format of formats) {
        const report = await service.generateAnalyticsReport(mockPortfolioId, {
          timeRange: '30d',
          format,
        });

        expect(report).toBeDefined();
        if (format === 'csv') {
          expect(typeof report).toBe('string');
          expect(report).toContain(','); // CSV delimiter
        }
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database connection failed'),
        }),
      });

      await expect(
        service.getOverviewMetrics(mockPortfolioId, '7d')
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle cache errors and fallback to database', async () => {
      const { redisCache } = require('@/lib/cache/redis-cache.server');
      redisCache.get.mockRejectedValue(new Error('Redis connection failed'));

      const result = await service.getOverviewMetrics(mockPortfolioId, '7d');

      expect(result).toEqual(mockAnalyticsData);
      expect(mockSupabase.from).toHaveBeenCalled(); // Fallback to database
    });

    it('should validate input parameters', async () => {
      await expect(service.getOverviewMetrics('', '7d')).rejects.toThrow(
        'Portfolio ID is required'

      await expect(
        service.getOverviewMetrics(mockPortfolioId, 'invalid')
      ).rejects.toThrow('Invalid time range');
    });
  });

  describe('Data Aggregation', () => {
    it('should aggregate analytics data by hour/day/week/month', async () => {
      const aggregations = ['hour', 'day', 'week', 'month'];

      for (const aggregation of aggregations) {
        const result = await service.getAggregatedData(mockPortfolioId, {
          timeRange: '30d',
          aggregateBy: aggregation,
          metrics: ['views', 'visitors', 'engagement'],
        });

        expect(result).toHaveProperty('data');
        expect(result.data).toBeInstanceOf(Array);
      }
    });

    it('should compare analytics across periods', async () => {
      const comparison = await service.comparePeriodsca(mockPortfolioId, {
        currentPeriod: '7d',
        previousPeriod: '7d',
      });

      expect(comparison).toHaveProperty('current');
      expect(comparison).toHaveProperty('previous');
      expect(comparison).toHaveProperty('changes');
      expect(comparison.changes).toHaveProperty('views');
      expect(comparison.changes).toHaveProperty('visitors');
    });
  });
});

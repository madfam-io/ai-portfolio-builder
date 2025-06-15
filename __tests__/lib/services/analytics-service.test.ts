import { AnalyticsService } from '@/lib/services/analytics-service';
import { createClient } from '@/lib/supabase/server';
import { cache } from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';
import posthog from 'posthog-js';

jest.mock('@/lib/supabase/server');
jest.mock('@/lib/cache/redis-cache.server');
jest.mock('@/lib/utils/logger');
jest.mock('posthog-js');

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn(),
      rpc: jest.fn()
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    analyticsService = new AnalyticsService();
  });

  describe('trackEvent', () => {
    it('should track event in database', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: 'event-123' },
        error: null
      });

      await analyticsService.trackEvent({
        userId: 'user-123',
        event: 'portfolio_published',
        properties: {
          portfolioId: 'portfolio-123',
          template: 'developer'
        }
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        event_name: 'portfolio_published',
        properties: {
          portfolioId: 'portfolio-123',
          template: 'developer'
        },
        timestamp: expect.any(Date),
        session_id: expect.any(String)
      });
    });

    it('should track event in PostHog', async () => {
      await analyticsService.trackEvent({
        userId: 'user-123',
        event: 'button_clicked',
        properties: { button: 'cta' }
      });

      expect(posthog.capture).toHaveBeenCalledWith('button_clicked', {
        button: 'cta',
        distinct_id: 'user-123'
      });
    });

    it('should handle tracking errors gracefully', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: new Error('DB error')
      });

      await analyticsService.trackEvent({
        userId: 'user-123',
        event: 'error_event'
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to track event',
        expect.any(Error)
      );
    });

    it('should generate session ID for anonymous events', async () => {
      await analyticsService.trackEvent({
        event: 'page_view',
        properties: { page: '/home' }
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: null,
          session_id: expect.any(String)
        })
      );
    });
  });

  describe('trackPageView', () => {
    it('should track page view with metadata', async () => {
      mockSupabase.single.mockResolvedValue({
        data: { id: 'view-123' },
        error: null
      });

      await analyticsService.trackPageView({
        userId: 'user-123',
        url: '/portfolio/123',
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0...',
        ip: '192.168.1.1'
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        url: '/portfolio/123',
        referrer: 'https://google.com',
        user_agent: 'Mozilla/5.0...',
        ip: '192.168.1.1',
        timestamp: expect.any(Date),
        session_id: expect.any(String)
      });
    });

    it('should extract UTM parameters', async () => {
      await analyticsService.trackPageView({
        url: '/home?utm_source=google&utm_medium=cpc&utm_campaign=summer',
        userId: 'user-123'
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'summer'
        })
      );
    });
  });

  describe('getPortfolioAnalytics', () => {
    it('should return cached analytics if available', async () => {
      const cachedAnalytics = {
        views: 1000,
        uniqueVisitors: 800,
        avgTimeOnPage: 120
      };

      (cache.get as jest.Mock).mockResolvedValue(cachedAnalytics);

      const analytics = await analyticsService.getPortfolioAnalytics(
        'portfolio-123',
        { startDate: new Date(), endDate: new Date() }
      );

      expect(analytics).toEqual(cachedAnalytics);
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });

    it('should fetch and aggregate analytics data', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);

      // Mock page views
      mockSupabase.order.mockResolvedValueOnce({
        data: [
          { timestamp: '2023-12-01', session_id: 'session-1' },
          { timestamp: '2023-12-01', session_id: 'session-2' },
          { timestamp: '2023-12-02', session_id: 'session-1' }
        ],
        error: null
      });

      // Mock events
      mockSupabase.order.mockResolvedValueOnce({
        data: [
          { event_name: 'cta_click', properties: {} },
          { event_name: 'form_submit', properties: {} }
        ],
        error: null
      });

      const analytics = await analyticsService.getPortfolioAnalytics('portfolio-123');

      expect(analytics).toEqual({
        views: 3,
        uniqueVisitors: 2,
        avgTimeOnPage: expect.any(Number),
        bounceRate: expect.any(Number),
        topReferrers: expect.any(Array),
        deviceBreakdown: expect.any(Object),
        dailyViews: expect.any(Array),
        events: {
          cta_click: 1,
          form_submit: 1
        }
      });

      expect(cache.set).toHaveBeenCalled();
    });

    it('should calculate bounce rate correctly', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);

      mockSupabase.order.mockResolvedValueOnce({
        data: [
          { session_id: 'bounce-1', timestamp: '2023-12-01T10:00:00' },
          { session_id: 'engaged-1', timestamp: '2023-12-01T10:00:00' },
          { session_id: 'engaged-1', timestamp: '2023-12-01T10:01:00' },
        ],
        error: null
      });

      mockSupabase.order.mockResolvedValueOnce({ data: [], error: null });

      const analytics = await analyticsService.getPortfolioAnalytics('portfolio-123');

      expect(analytics.bounceRate).toBe(50); // 1 bounce out of 2 sessions
    });
  });

  describe('getUserAnalytics', () => {
    it('should aggregate analytics across all user portfolios', async () => {
      // Mock portfolios
      mockSupabase.eq.mockResolvedValueOnce({
        data: [
          { id: 'portfolio-1' },
          { id: 'portfolio-2' }
        ],
        error: null
      });

      // Mock analytics for each portfolio
      jest.spyOn(analyticsService, 'getPortfolioAnalytics')
        .mockResolvedValueOnce({
          views: 100,
          uniqueVisitors: 80,
          events: { cta_click: 5 }
        } as any)
        .mockResolvedValueOnce({
          views: 200,
          uniqueVisitors: 150,
          events: { cta_click: 10 }
        } as any);

      const userAnalytics = await analyticsService.getUserAnalytics('user-123');

      expect(userAnalytics).toEqual({
        totalViews: 300,
        totalUniqueVisitors: 230,
        portfolioMetrics: expect.any(Array),
        topPerformingPortfolio: expect.objectContaining({
          portfolioId: 'portfolio-2',
          views: 200
        })
      });
    });
  });

  describe('getConversionFunnel', () => {
    it('should calculate conversion funnel metrics', async () => {
      const mockEvents = [
        { event_name: 'landing_page_view', user_id: 'user-1' },
        { event_name: 'landing_page_view', user_id: 'user-2' },
        { event_name: 'landing_page_view', user_id: 'user-3' },
        { event_name: 'signup_started', user_id: 'user-1' },
        { event_name: 'signup_started', user_id: 'user-2' },
        { event_name: 'signup_completed', user_id: 'user-1' },
        { event_name: 'portfolio_created', user_id: 'user-1' }
      ];

      mockSupabase.order.mockResolvedValue({
        data: mockEvents,
        error: null
      });

      const funnel = await analyticsService.getConversionFunnel();

      expect(funnel).toEqual({
        steps: [
          { name: 'Landing Page View', count: 3, percentage: 100 },
          { name: 'Signup Started', count: 2, percentage: 66.67 },
          { name: 'Signup Completed', count: 1, percentage: 33.33 },
          { name: 'Portfolio Created', count: 1, percentage: 33.33 }
        ],
        overallConversion: 33.33
      });
    });
  });

  describe('trackError', () => {
    it('should track error events with context', async () => {
      const error = new Error('Test error');
      const errorContext = {
        userId: 'user-123',
        action: 'portfolio_save',
        metadata: { portfolioId: 'portfolio-123' }
      };

      await analyticsService.trackError(error, errorContext);

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        event_name: 'error',
        properties: {
          error_message: 'Test error',
          error_stack: expect.any(String),
          action: 'portfolio_save',
          metadata: { portfolioId: 'portfolio-123' }
        },
        timestamp: expect.any(Date)
      });

      expect(logger.error).toHaveBeenCalledWith(
        'Tracked error',
        error,
        errorContext
      );
    });
  });

  describe('Real-time Analytics', () => {
    it('should get active users count', async () => {
      mockSupabase.gte.mockReturnThis();
      mockSupabase.select.mockResolvedValue({
        data: [
          { user_id: 'user-1' },
          { user_id: 'user-2' },
          { user_id: 'user-1' }, // Duplicate
          { user_id: 'user-3' }
        ],
        error: null
      });

      const activeUsers = await analyticsService.getActiveUsers(5); // Last 5 minutes

      expect(activeUsers).toBe(3); // 3 unique users
    });

    it('should get real-time portfolio views', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [
          { portfolio_id: 'portfolio-1', view_count: 10 },
          { portfolio_id: 'portfolio-2', view_count: 25 },
          { portfolio_id: 'portfolio-3', view_count: 5 }
        ],
        error: null
      });

      const topPortfolios = await analyticsService.getTopPortfolios(24); // Last 24 hours

      expect(topPortfolios).toEqual([
        { portfolioId: 'portfolio-2', views: 25 },
        { portfolioId: 'portfolio-1', views: 10 },
        { portfolioId: 'portfolio-3', views: 5 }
      ]);
    });
  });

  describe('Export Analytics', () => {
    it('should export analytics data to CSV', async () => {
      const analyticsData = {
        views: 1000,
        uniqueVisitors: 800,
        dailyViews: [
          { date: '2023-12-01', views: 100 },
          { date: '2023-12-02', views: 150 }
        ]
      };

      const csv = await analyticsService.exportToCSV(analyticsData);

      expect(csv).toContain('Date,Views');
      expect(csv).toContain('2023-12-01,100');
      expect(csv).toContain('2023-12-02,150');
      expect(csv).toContain('Total Views,1000');
      expect(csv).toContain('Unique Visitors,800');
    });
  });
});
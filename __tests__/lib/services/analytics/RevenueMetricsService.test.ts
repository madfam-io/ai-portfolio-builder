import { RevenueMetricsService } from '@/lib/services/analytics/RevenueMetricsService';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('RevenueMetricsService', () => {
  let service: RevenueMetricsService;
  let mockSupabase: any;

  beforeEach(() => {
    // Create mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    service = new RevenueMetricsService(mockSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateMetrics', () => {
    it('should calculate correct MRR from active subscriptions', async () => {
      const mockSubscriptions = [
        { plan: 'pro', status: 'active', amount: 24, user_id: '1' },
        { plan: 'business', status: 'active', amount: 39, user_id: '2' },
        { plan: 'enterprise', status: 'active', amount: 79, user_id: '3' },
        { plan: 'free', status: 'active', amount: 0, user_id: '4' },
      ];

      mockSupabase.from.mockReturnValue({
        ...mockSupabase,
        data: mockSubscriptions,
        error: null,
      });

      const metrics = await service.calculateMetrics();

      expect(metrics.mrr).toBe(142); // 24 + 39 + 79
      expect(metrics.arr).toBe(1704); // 142 * 12
      expect(metrics.customerCount).toBe(4); // All active subscriptions (implementation counts all active)
    });

    it('should calculate churn rate correctly', async () => {
      const currentSubscriptions = [
        { plan: 'pro', status: 'active', amount: 24, user_id: '1' },
        { plan: 'pro', status: 'active', amount: 24, user_id: '2' },
        { plan: 'pro', status: 'active', amount: 24, user_id: '3' },
        { plan: 'pro', status: 'active', amount: 24, user_id: '4' },
      ];

      const churnedSubscriptions = [
        { plan: 'pro', status: 'canceled', amount: 24, user_id: '5' },
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          ...mockSupabase,
          data: currentSubscriptions,
          error: null,
        })
        .mockReturnValueOnce({
          ...mockSupabase,
          data: [],
          error: null,
        })
        .mockReturnValueOnce({
          ...mockSupabase,
          data: [],
          error: null,
        })
        .mockReturnValueOnce({
          ...mockSupabase,
          data: churnedSubscriptions,
          error: null,
        });

      const metrics = await service.calculateMetrics();

      expect(metrics.churnRate).toBe(25); // 1 churned out of 4 = 25%
      expect(metrics.churnedCustomers).toBe(1);
    });

    it('should calculate ARPU and LTV correctly', async () => {
      const subscriptions = [
        { plan: 'pro', status: 'active', amount: 24, user_id: '1' },
        { plan: 'business', status: 'active', amount: 39, user_id: '2' },
      ];

      mockSupabase.from.mockReturnValue({
        ...mockSupabase,
        data: subscriptions,
        error: null,
      });

      const metrics = await service.calculateMetrics();

      expect(metrics.arpu).toBe(31.5); // (24 + 39) / 2
      expect(metrics.ltv).toBeGreaterThan(0); // Should calculate based on churn rate
    });
  });

  describe('getRevenueByPlan', () => {
    it('should return revenue breakdown by plan', async () => {
      const subscriptions = [
        { plan: 'pro', status: 'active', amount: 24 },
        { plan: 'pro', status: 'active', amount: 24 },
        { plan: 'business', status: 'active', amount: 39 },
        { plan: 'enterprise', status: 'active', amount: 79 },
      ];

      mockSupabase.from.mockReturnValue({
        ...mockSupabase,
        data: subscriptions,
        error: null,
      });

      const breakdown = await service.getRevenueByPlan();

      expect(breakdown).toHaveLength(3); // pro, business, enterprise
      expect(breakdown[0]).toMatchObject({
        plan: 'enterprise',
        customerCount: 1,
        mrr: 79,
        percentage: expect.any(Number),
      });
      expect(breakdown[1]).toMatchObject({
        plan: 'pro',
        customerCount: 2,
        mrr: 48,
      });
    });

    it('should calculate correct percentages', async () => {
      const subscriptions = [
        { plan: 'pro', status: 'active', amount: 50 },
        { plan: 'business', status: 'active', amount: 50 },
      ];

      mockSupabase.from.mockReturnValue({
        ...mockSupabase,
        data: subscriptions,
        error: null,
      });

      const breakdown = await service.getRevenueByPlan();

      expect(breakdown[0].percentage).toBe(50);
      expect(breakdown[1].percentage).toBe(50);
    });
  });

  describe('getCustomerMetrics', () => {
    it('should calculate customer conversion rate', async () => {
      const allUsers = [
        { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
      ];

      const subscriptions = [
        { user_id: '1', plan: 'pro', status: 'active' },
        { user_id: '2', plan: 'business', status: 'active' },
        { user_id: '3', plan: 'free', status: 'active' },
        { user_id: '4', plan: 'pro', status: 'trialing' },
      ];

      mockSupabase.from
        .mockReturnValueOnce({
          ...mockSupabase,
          data: allUsers,
          error: null,
        })
        .mockReturnValueOnce({
          ...mockSupabase,
          data: subscriptions,
          error: null,
        });

      const metrics = await service.getCustomerMetrics();

      expect(metrics.totalCustomers).toBe(5);
      expect(metrics.payingCustomers).toBe(2); // Only pro and business (not free)
      expect(metrics.trialCustomers).toBe(1);
      expect(metrics.conversionRate).toBe(40); // 2 paying out of 5 total
    });
  });

  describe('trackRevenueEvent', () => {
    it('should track revenue events correctly', async () => {
      const mockInsert = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      });

      await service.trackRevenueEvent({
        type: 'new_subscription',
        userId: 'user-123',
        newPlan: 'pro',
        amount: 24,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('revenue_events');
      expect(mockInsert).toHaveBeenCalledWith({
        type: 'new_subscription',
        user_id: 'user-123',
        old_plan: undefined,
        new_plan: 'pro',
        amount: 24,
        created_at: expect.any(String),
      });
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockSupabase.from.mockReturnValue({
        ...mockSupabase,
        insert: jest.fn().mockResolvedValue({ error: new Error('DB Error') }),
      });

      await service.trackRevenueEvent({
        type: 'churn',
        userId: 'user-123',
        oldPlan: 'pro',
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to track revenue event:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should throw errors when database queries fail', async () => {
      const dbError = new Error('Database connection failed');
      mockSupabase.from.mockReturnValue({
        ...mockSupabase,
        data: null,
        error: dbError,
      });

      await expect(service.calculateMetrics()).rejects.toThrow(dbError);
    });
  });
});
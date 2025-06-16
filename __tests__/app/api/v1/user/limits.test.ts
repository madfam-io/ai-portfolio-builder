/**
 * @jest-environment jsdom
 */

import { GET } from '@/app/api/v1/user/limits/route';

// Mock the auth middleware
jest.mock('@/lib/api/middleware/auth', () => ({
  withAuth: jest.fn(handler => handler),
}));

// Mock Supabase client
const mockSupabase = {
  rpc: jest.fn(),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockRequest = (user = { id: 'user123' }) => {
  return {
    auth: { user },
  } as any;
};

const mockLimitsResponse = {
  subscription_tier: 'free',
  subscription_status: 'active',
  current_usage: {
    portfolios: 1,
    ai_requests: 2,
  },
  limits: {
    max_portfolios: 1,
    max_ai_requests: 3,
  },
  can_create_portfolio: false,
  can_use_ai: true,
};

describe('/api/v1/user/limits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/user/limits', () => {
    it('should return user limits successfully', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockLimitsResponse,
        error: null,
      });

      const request = mockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockLimitsResponse);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_user_plan_limits', {
        user_uuid: 'user123',
      });
    });

    it('should handle database errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' },
      });

      const request = mockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to check user limits');
      expect(data.code).toBe('LIMITS_CHECK_FAILED');
    });

    it('should handle function errors', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: { error: 'User not found' },
        error: null,
      });

      const request = mockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
      expect(data.code).toBe('USER_NOT_FOUND');
    });

    it('should return different data for different subscription tiers', async () => {
      const proLimitsResponse = {
        ...mockLimitsResponse,
        subscription_tier: 'pro',
        limits: {
          max_portfolios: 5,
          max_ai_requests: 50,
        },
        can_create_portfolio: true,
        can_use_ai: true,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: proLimitsResponse,
        error: null,
      });

      const request = mockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subscription_tier).toBe('pro');
      expect(data.limits.max_portfolios).toBe(5);
      expect(data.limits.max_ai_requests).toBe(50);
      expect(data.can_create_portfolio).toBe(true);
    });

    it('should handle unlimited plans', async () => {
      const enterpriseLimitsResponse = {
        ...mockLimitsResponse,
        subscription_tier: 'enterprise',
        limits: {
          max_portfolios: -1,
          max_ai_requests: -1,
        },
        can_create_portfolio: true,
        can_use_ai: true,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: enterpriseLimitsResponse,
        error: null,
      });

      const request = mockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.subscription_tier).toBe('enterprise');
      expect(data.limits.max_portfolios).toBe(-1);
      expect(data.limits.max_ai_requests).toBe(-1);
    });

    it('should handle user at portfolio limit', async () => {
      const limitReachedResponse = {
        ...mockLimitsResponse,
        current_usage: {
          portfolios: 1,
          ai_requests: 1,
        },
        limits: {
          max_portfolios: 1,
          max_ai_requests: 3,
        },
        can_create_portfolio: false,
        can_use_ai: true,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: limitReachedResponse,
        error: null,
      });

      const request = mockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.can_create_portfolio).toBe(false);
      expect(data.can_use_ai).toBe(true);
    });

    it('should handle user at AI limit', async () => {
      const aiLimitReachedResponse = {
        ...mockLimitsResponse,
        current_usage: {
          portfolios: 0,
          ai_requests: 3,
        },
        limits: {
          max_portfolios: 1,
          max_ai_requests: 3,
        },
        can_create_portfolio: true,
        can_use_ai: false,
      };

      mockSupabase.rpc.mockResolvedValue({
        data: aiLimitReachedResponse,
        error: null,
      });

      const request = mockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.can_create_portfolio).toBe(true);
      expect(data.can_use_ai).toBe(false);
    });

    it('should call the correct database function', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: mockLimitsResponse,
        error: null,
      });

      const request = mockRequest({ id: 'specific-user-id' });
      await GET(request);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_user_plan_limits', {
        user_uuid: 'specific-user-id',
      });
    });

    it('should handle RPC function throwing error', async () => {
      mockSupabase.rpc.mockRejectedValue(new Error('RPC call failed'));

      const request = mockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to check user limits');
      expect(data.code).toBe('LIMITS_FAILED');
    });

    it('should include current usage statistics', async () => {
      const detailedResponse = {
        ...mockLimitsResponse,
        current_usage: {
          portfolios: 3,
          ai_requests: 45,
        },
      };

      mockSupabase.rpc.mockResolvedValue({
        data: detailedResponse,
        error: null,
      });

      const request = mockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.current_usage.portfolios).toBe(3);
      expect(data.current_usage.ai_requests).toBe(45);
    });
  });
});

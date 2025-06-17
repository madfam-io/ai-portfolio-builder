/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/user/limits/route';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/types/errors';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));
jest.mock('@/lib/api/middleware/auth', () => ({
  withAuth: (handler: any) => handler,
  AuthenticatedRequest: {},
}));

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('/api/v1/user/limits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createAuthenticatedRequest = (userId: string = 'user-123') => {
    const request = new NextRequest(
      'http://localhost:3000/api/v1/user/limits',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Mock the authenticated user from withAuth middleware
    (request as any).user = {
      id: userId,
      email: 'test@example.com',
      role: 'user',
    };

    return request;
  };

  const mockLimitsData = {
    subscription_tier: 'pro',
    current_usage: {
      portfolios: 3,
      ai_requests: 25,
      published_portfolios: 2,
      storage_mb: 150,
    },
    limits: {
      max_portfolios: 10,
      max_ai_requests: 100,
      max_published_portfolios: 5,
      max_storage_mb: 1000,
    },
    reset_date: '2025-02-01T00:00:00Z',
    billing_cycle: 'monthly',
  };

  describe('GET', () => {
    it('should return user limits successfully', async () => {
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: mockLimitsData,
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData).toEqual(mockLimitsData);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_user_plan_limits', {
        user_uuid: 'user-123',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User limits retrieved successfully',
        {
          userId: 'user-123',
          subscriptionTier: 'pro',
        }
      );
    });

    it('should handle different subscription tiers', async () => {
      const freeTierData = {
        subscription_tier: 'free',
        current_usage: {
          portfolios: 1,
          ai_requests: 8,
          published_portfolios: 1,
          storage_mb: 25,
        },
        limits: {
          max_portfolios: 3,
          max_ai_requests: 20,
          max_published_portfolios: 1,
          max_storage_mb: 100,
        },
        reset_date: '2025-02-01T00:00:00Z',
        billing_cycle: 'monthly',
      };

      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: freeTierData,
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.subscription_tier).toBe('free');
      expect(responseData.limits.max_portfolios).toBe(3);
      expect(responseData.limits.max_ai_requests).toBe(20);
    });

    it('should handle enterprise tier with unlimited limits', async () => {
      const enterpriseData = {
        subscription_tier: 'enterprise',
        current_usage: {
          portfolios: 50,
          ai_requests: 500,
          published_portfolios: 25,
          storage_mb: 5000,
        },
        limits: {
          max_portfolios: -1, // Unlimited
          max_ai_requests: -1,
          max_published_portfolios: -1,
          max_storage_mb: -1,
        },
        reset_date: '2025-02-01T00:00:00Z',
        billing_cycle: 'yearly',
      };

      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: enterpriseData,
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.subscription_tier).toBe('enterprise');
      expect(responseData.limits.max_portfolios).toBe(-1);
      expect(responseData.billing_cycle).toBe('yearly');
    });

    it('should return 503 when database is unavailable', async () => {
      mockCreateClient.mockResolvedValue(null);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(503);

      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'DATABASE_NOT_AVAILABLE',
        code: 'Database service unavailable',
      });
    });

    it('should handle database RPC errors', async () => {
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: null,
          error: {
            message: 'Function not found',
            code: 'FUNCTION_NOT_FOUND',
          },
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'LIMITS_CHECK_FAILED',
        code: 'Failed to check user limits',
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to check user limits',
        {
          error: {
            message: 'Function not found',
            code: 'FUNCTION_NOT_FOUND',
          },
          userId: 'user-123',
        }
      );
    });

    it('should handle database function returning user error', async () => {
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: {
            error: 'User not found in system',
          },
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(404);

      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'USER_NOT_FOUND',
        code: 'User not found in system',
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Database function returned error',
        {
          error: 'User not found in system',
          userId: 'user-123',
        }
      );
    });

    it('should handle unexpected errors', async () => {
      mockCreateClient.mockRejectedValue(
        new Error('Network connection failed')
      );

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(500);

      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Failed to get user limits',
        code: 'LIMITS_FAILED',
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get user limits',
        { error: expect.any(Error) }
      );
    });

    it('should handle AppError instances properly', async () => {
      const appError = new AppError(
        'Custom limits error message',
        'CUSTOM_LIMITS_ERROR',
        422
      );

      mockCreateClient.mockRejectedValue(appError);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(422);

      const responseData = await response.json();
      expect(responseData).toEqual({
        error: 'Custom limits error message',
        code: 'CUSTOM_LIMITS_ERROR',
      });
    });

    it('should work with different user IDs', async () => {
      const differentUserId = 'user-456';
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: {
            ...mockLimitsData,
            subscription_tier: 'business',
          },
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest(differentUserId);
      const response = await GET(request as any);

      expect(response.status).toBe(200);

      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_user_plan_limits', {
        user_uuid: differentUserId,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User limits retrieved successfully',
        {
          userId: differentUserId,
          subscriptionTier: 'business',
        }
      );
    });
  });

  describe('Usage Calculation', () => {
    it('should return accurate usage percentages', async () => {
      const nearLimitData = {
        subscription_tier: 'pro',
        current_usage: {
          portfolios: 9, // 90% of limit
          ai_requests: 95, // 95% of limit
          published_portfolios: 5, // 100% of limit
          storage_mb: 800, // 80% of limit
        },
        limits: {
          max_portfolios: 10,
          max_ai_requests: 100,
          max_published_portfolios: 5,
          max_storage_mb: 1000,
        },
        reset_date: '2025-02-01T00:00:00Z',
        billing_cycle: 'monthly',
      };

      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: nearLimitData,
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(200);

      const responseData = await response.json();

      // Verify high usage scenarios
      expect(responseData.current_usage.portfolios).toBe(9);
      expect(responseData.limits.max_portfolios).toBe(10);
      expect(responseData.current_usage.published_portfolios).toBe(5);
      expect(responseData.limits.max_published_portfolios).toBe(5);
    });

    it('should handle zero usage correctly', async () => {
      const zeroUsageData = {
        subscription_tier: 'free',
        current_usage: {
          portfolios: 0,
          ai_requests: 0,
          published_portfolios: 0,
          storage_mb: 0,
        },
        limits: {
          max_portfolios: 3,
          max_ai_requests: 20,
          max_published_portfolios: 1,
          max_storage_mb: 100,
        },
        reset_date: '2025-02-01T00:00:00Z',
        billing_cycle: 'monthly',
      };

      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: zeroUsageData,
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(200);

      const responseData = await response.json();

      // Verify zero usage
      expect(responseData.current_usage.portfolios).toBe(0);
      expect(responseData.current_usage.ai_requests).toBe(0);
      expect(responseData.current_usage.published_portfolios).toBe(0);
      expect(responseData.current_usage.storage_mb).toBe(0);
    });
  });

  describe('Integration', () => {
    it('should integrate with subscription management', async () => {
      // Test flow: User upgrades subscription, limits should reflect new tier
      const upgradedData = {
        subscription_tier: 'business',
        current_usage: {
          portfolios: 5,
          ai_requests: 50,
          published_portfolios: 3,
          storage_mb: 500,
        },
        limits: {
          max_portfolios: 25,
          max_ai_requests: 500,
          max_published_portfolios: 15,
          max_storage_mb: 5000,
        },
        reset_date: '2025-02-01T00:00:00Z',
        billing_cycle: 'monthly',
        upgrade_date: '2025-01-15T10:30:00Z',
      };

      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: upgradedData,
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.subscription_tier).toBe('business');
      expect(responseData.limits.max_portfolios).toBe(25);
      expect(responseData.upgrade_date).toBe('2025-01-15T10:30:00Z');
    });

    it('should handle billing cycle transitions', async () => {
      const cycleTransitionData = {
        subscription_tier: 'pro',
        current_usage: {
          portfolios: 2,
          ai_requests: 5,
          published_portfolios: 1,
          storage_mb: 50,
        },
        limits: {
          max_portfolios: 10,
          max_ai_requests: 100,
          max_published_portfolios: 5,
          max_storage_mb: 1000,
        },
        reset_date: '2025-02-01T00:00:00Z',
        billing_cycle: 'monthly',
        last_reset_date: '2025-01-01T00:00:00Z',
        days_until_reset: 15,
      };

      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: cycleTransitionData,
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest();
      const response = await GET(request as any);

      expect(response.status).toBe(200);

      const responseData = await response.json();
      expect(responseData.reset_date).toBe('2025-02-01T00:00:00Z');
      expect(responseData.days_until_reset).toBe(15);
    });
  });

  describe('Security', () => {
    it('should only return data for authenticated user', async () => {
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: mockLimitsData,
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const userAId = 'user-a-123';
      const request = createAuthenticatedRequest(userAId);

      await GET(request as any);

      // Verify the RPC call uses the authenticated user's ID
      expect(mockSupabase.rpc).toHaveBeenCalledWith('check_user_plan_limits', {
        user_uuid: userAId,
      });

      // Should not be able to query other users
      expect(mockSupabase.rpc).not.toHaveBeenCalledWith(
        'check_user_plan_limits',
        {
          user_uuid: 'user-b-456',
        }
      );
    });

    it('should validate user exists in system', async () => {
      const mockSupabase = {
        rpc: jest.fn().mockResolvedValue({
          data: {
            error: 'User ID does not exist',
          },
          error: null,
        }),
      };

      mockCreateClient.mockResolvedValue(mockSupabase as any);

      const request = createAuthenticatedRequest('invalid-user-id');
      const response = await GET(request as any);

      expect(response.status).toBe(404);

      const responseData = await response.json();
      expect(responseData.code).toBe('User ID does not exist');
    });
  });
});

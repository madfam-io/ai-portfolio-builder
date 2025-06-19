import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';

/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/stripe/portal/route';
import { stripeService } from '@/lib/services/stripe/stripe';
import { logger } from '@/lib/utils/logger';
import { getAppUrl } from '@/lib/config/env';
import { createClient } from '@/lib/supabase/server';
import { AppError } from '@/types/errors';
import { setupCommonMocks, createMockRequest } from '@/__tests__/utils/api-route-test-helpers';


// Mock dependencies
jest.mock('@/lib/services/stripe/stripe');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/config/env');

jest.mock('@/lib/api/middleware/auth', () => ({
  withAuth: (handler: any) => handler,
}));

const mockStripeService = stripeService as jest.Mocked<typeof stripeService>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockGetAppUrl = getAppUrl as jest.MockedFunction<typeof getAppUrl>;
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe('/api/v1/stripe/portal', () => {
  setupCommonMocks();

  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStripeService.isAvailable.mockReturnValue(true);
    mockGetAppUrl.mockReturnValue('https://app.example.com');

    // Mock Supabase client
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn()
    };

    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockAuthenticatedRequest = () => {
    const request = new NextRequest(
      'http://localhost:3000/api/v1/stripe/portal',
      {
        method: 'POST',
      }
    );

    // Mock the withAuth middleware by adding user to request
    (request as any).user = mockUser;
    return request;
  };

  describe('POST', () => {
    const mockPortalSession = {
      id: 'bps_test_123',
      url: 'https://billing.stripe.com/p/session_bps_test_123',
    };

    beforeEach(() => {
      mockStripeService.createPortalSession.mockResolvedValue(
        mockPortalSession as any
      );
    });

    it('should create portal session for user with valid Stripe customer', async () => {
      const mockUserData = {
        stripe_customer_id: 'cus_test_123',
        subscription_status: 'active',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const request = mockAuthenticatedRequest();
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        url: mockPortalSession.url,
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('users');
      expect(mockSupabase.select).toHaveBeenCalledWith(
        'stripe_customer_id, subscription_status'

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', mockUser.id);

      expect(mockStripeService.createPortalSession).toHaveBeenCalledWith(
      {
        customerId: mockUserData.stripe_customer_id,
        returnUrl: 'https://app.example.com/dashboard/billing',
    );
  });

      expect(mockLogger.info).toHaveBeenCalledWith(
      'Portal session created successfully',
        {
          sessionId: mockPortalSession.id,
          userId: mockUser.id,
          customerId: mockUserData.stripe_customer_id,
        }
    );
  });

    it('should return 503 when Stripe service is unavailable', async () => {
      mockStripeService.isAvailable.mockReturnValue(false);

      const request = mockAuthenticatedRequest();
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data).toEqual({
        error: 'Payment service is currently unavailable',
        code: 'STRIPE_NOT_AVAILABLE',
      });

      expect(mockStripeService.createPortalSession).not.toHaveBeenCalled();
    });

    it('should return 503 when database is unavailable', async () => {
      mockCreateClient.mockResolvedValue(null);

      const request = mockAuthenticatedRequest();
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Database service unavailable');
      expect(data.code).toBe('DATABASE_NOT_AVAILABLE');
    });

    it('should return 404 when user data is not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const request = mockAuthenticatedRequest();
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User data not found');
      expect(data.code).toBe('USER_DATA_NOT_FOUND');

      expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to fetch user data for portal',
        {
          error: { message: 'User not found' },
          userId: mockUser.id,
        }
    );
  });

    it('should return 400 when user has no Stripe customer ID', async () => {
      const mockUserData = {
        stripe_customer_id: null,
        subscription_status: 'inactive',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const request = mockAuthenticatedRequest();
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No active subscription found');
      expect(data.code).toBe('NO_STRIPE_CUSTOMER');

      expect(mockStripeService.createPortalSession).not.toHaveBeenCalled();
    });

    it('should handle Stripe service errors', async () => {
      const mockUserData = {
        stripe_customer_id: 'cus_test_456',
        subscription_status: 'active',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const stripeError = new Error('Stripe API error');
      mockStripeService.createPortalSession.mockRejectedValue(stripeError);

      const request = mockAuthenticatedRequest();
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create portal session');
      expect(data.code).toBe('PORTAL_FAILED');

      expect(mockLogger.error).toHaveBeenCalledWith(
      'Portal session creation failed',
        { error: stripeError }
    );
  });

    it('should handle AppError instances', async () => {
      const mockUserData = {
        stripe_customer_id: 'cus_test_789',
        subscription_status: 'active',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const appError = new AppError(
        'Custom error message',
        'CUSTOM_ERROR',
        422

      mockStripeService.createPortalSession.mockRejectedValue(appError);

      const request = mockAuthenticatedRequest();
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.error).toBe('Custom error message');
      expect(data.code).toBe('CUSTOM_ERROR');
    });

    it('should use correct return URL', async () => {
      mockGetAppUrl.mockReturnValue('https://custom-domain.com');

      const mockUserData = {
        stripe_customer_id: 'cus_test_custom',
        subscription_status: 'active',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const request = mockAuthenticatedRequest();
      await POST(request as any);

      expect(mockStripeService.createPortalSession).toHaveBeenCalledWith(
      {
        customerId: 'cus_test_custom',
        returnUrl: 'https://custom-domain.com/dashboard/billing',
    );
  });
    });

    it('should handle database query errors', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'DB_ERROR' },
      });

      const request = mockAuthenticatedRequest();
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User data not found');
      expect(data.code).toBe('USER_DATA_NOT_FOUND');

      expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to fetch user data for portal',
        {
          error: { message: 'Database connection failed', code: 'DB_ERROR' },
          userId: mockUser.id,
        }
    );
  });

    it('should handle empty Stripe customer ID', async () => {
      const mockUserData = {
        stripe_customer_id: '',
        subscription_status: 'active',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      const request = mockAuthenticatedRequest();
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No active subscription found');
      expect(data.code).toBe('NO_STRIPE_CUSTOMER');
    });

    it('should handle user with different subscription statuses', async () => {
      const subscriptionStatuses = ['active', 'canceled', 'past_due', 'unpaid'];

      for (const status of subscriptionStatuses) {
        jest.clearAllMocks();

        const mockUserData = {
          stripe_customer_id: `cus_test_${status}`,
          subscription_status: status,
        };

        mockSupabase.single.mockResolvedValue({
          data: mockUserData,
          error: null,
        });

        mockStripeService.createPortalSession.mockResolvedValue(
      mockPortalSession as any
    );

    const request = mockAuthenticatedRequest();
        const response = await POST(request as any);

        // Portal should be accessible regardless of subscription status
        // as long as they have a Stripe customer ID
        expect(response.status).toBe(200);
        expect(mockStripeService.createPortalSession).toHaveBeenCalledWith(
      {
          customerId: `cus_test_${status}`,
          returnUrl: 'https://app.example.com/dashboard/billing',
    );
  });
      }
    });

    it('should preserve user context in logs', async () => {
      const customUser = {
        id: 'custom-user-789',
        email: 'custom@example.com',
        name: 'Custom User',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/v1/stripe/portal',
        {
          method: 'POST',
        }

      (request as any).user = customUser;

      const mockUserData = {
        stripe_customer_id: 'cus_custom_123',
        subscription_status: 'active',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockUserData,
        error: null,
      });

      await POST(request as any);

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', customUser.id);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Portal session created successfully',
        expect.objectContaining({
          userId: customUser.id,
        })
    );
  });
  });
});

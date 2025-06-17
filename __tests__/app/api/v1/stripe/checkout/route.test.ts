/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/stripe/checkout/route';
import { stripeService } from '@/lib/services/stripe/stripe';
import { logger } from '@/lib/utils/logger';
import { getAppUrl } from '@/lib/config/env';
import { AppError } from '@/types/errors';

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

describe('/api/v1/stripe/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStripeService.isAvailable.mockReturnValue(true);
    mockGetAppUrl.mockReturnValue('https://app.example.com');
  });

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockAuthenticatedRequest = (body: any) => {
    const request = new NextRequest('http://localhost:3000/api/v1/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Mock the withAuth middleware by adding user to request
    (request as any).user = mockUser;
    return request;
  };

  describe('POST', () => {
    const mockSession = {
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
      amount_total: 2400, // $24.00 in cents
    };

    beforeEach(() => {
      mockStripeService.createCheckoutSession.mockResolvedValue(mockSession as any);
    });

    it('should create checkout session for valid plan', async () => {
      const request = mockAuthenticatedRequest({
        planId: 'pro',
        trialDays: 14,
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        sessionId: mockSession.id,
        url: mockSession.url,
        planId: 'pro',
        trialDays: 14,
      });

      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith({
        planId: 'pro',
        userId: mockUser.id,
        userEmail: mockUser.email,
        successUrl: 'https://app.example.com/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true',
        cancelUrl: 'https://app.example.com/pricing?canceled=true',
        trialDays: 14,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Checkout session created successfully',
        {
          sessionId: mockSession.id,
          userId: mockUser.id,
          planId: 'pro',
          amount: mockSession.amount_total,
        }
      );
    });

    it('should use default trial days when not provided', async () => {
      const request = mockAuthenticatedRequest({
        planId: 'business',
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trialDays).toBe(7); // Default value

      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          trialDays: 7,
        })
      );
    });

    it('should handle all valid plan types', async () => {
      const validPlans = ['pro', 'business', 'enterprise'];

      for (const planId of validPlans) {
        jest.clearAllMocks();
        mockStripeService.createCheckoutSession.mockResolvedValue(mockSession as any);

        const request = mockAuthenticatedRequest({ planId });
        const response = await POST(request as any);

        expect(response.status).toBe(200);
        expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
          expect.objectContaining({ planId })
        );
      }
    });

    it('should return 503 when Stripe service is unavailable', async () => {
      mockStripeService.isAvailable.mockReturnValue(false);

      const request = mockAuthenticatedRequest({ planId: 'pro' });
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data).toEqual({
        error: 'Payment service is currently unavailable',
        code: 'STRIPE_NOT_AVAILABLE',
      });

      expect(mockStripeService.createCheckoutSession).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid plan ID', async () => {
      const request = mockAuthenticatedRequest({ planId: 'invalid' });
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.code).toBe('VALIDATION_ERROR');
      expect(data.details).toBeDefined();
    });

    it('should return 400 for missing plan ID', async () => {
      const request = mockAuthenticatedRequest({});
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should validate trial days range', async () => {
      // Test valid trial days
      const validTrialDays = [0, 7, 14, 30];
      for (const trialDays of validTrialDays) {
        jest.clearAllMocks();
        mockStripeService.createCheckoutSession.mockResolvedValue(mockSession as any);

        const request = mockAuthenticatedRequest({ planId: 'pro', trialDays });
        const response = await POST(request as any);

        expect(response.status).toBe(200);
      }

      // Test invalid trial days
      const invalidTrialDays = [-1, 31, 100];
      for (const trialDays of invalidTrialDays) {
        const request = mockAuthenticatedRequest({ planId: 'pro', trialDays });
        const response = await POST(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
        expect(data.code).toBe('VALIDATION_ERROR');
      }
    });

    it('should handle missing user email', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId: 'pro' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // User without email
      (request as any).user = { id: 'user-123', name: 'Test User' };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User email is required for checkout');
      expect(data.code).toBe('USER_EMAIL_REQUIRED');
    });

    it('should handle Stripe service errors', async () => {
      const stripeError = new Error('Stripe API error');
      mockStripeService.createCheckoutSession.mockRejectedValue(stripeError);

      const request = mockAuthenticatedRequest({ planId: 'business' });
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
      expect(data.code).toBe('CHECKOUT_FAILED');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Checkout session creation failed',
        { error: stripeError }
      );
    });

    it('should handle AppError instances', async () => {
      const appError = new AppError(
        'Custom error message',
        'CUSTOM_ERROR',
        422
      );
      mockStripeService.createCheckoutSession.mockRejectedValue(appError);

      const request = mockAuthenticatedRequest({ planId: 'enterprise' });
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(422);
      expect(data.error).toBe('Custom error message');
      expect(data.code).toBe('CUSTOM_ERROR');
    });

    it('should generate correct URLs', async () => {
      mockGetAppUrl.mockReturnValue('https://custom-domain.com');

      const request = mockAuthenticatedRequest({ planId: 'pro' });
      await POST(request as any);

      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          successUrl: 'https://custom-domain.com/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true',
          cancelUrl: 'https://custom-domain.com/pricing?canceled=true',
        })
      );
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/stripe/checkout', {
        method: 'POST',
        body: 'invalid-json',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      (request as any).user = mockUser;

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
      expect(data.code).toBe('CHECKOUT_FAILED');
    });

    it('should preserve user context throughout request', async () => {
      const customUser = {
        id: 'custom-user-789',
        email: 'custom@example.com',
        name: 'Custom User',
      };

      const request = new NextRequest('http://localhost:3000/api/v1/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId: 'business' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      (request as any).user = customUser;

      await POST(request as any);

      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: customUser.id,
          userEmail: customUser.email,
        })
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Checkout session created successfully',
        expect.objectContaining({
          userId: customUser.id,
        })
      );
    });

    it('should handle zero trial days', async () => {
      const request = mockAuthenticatedRequest({
        planId: 'pro',
        trialDays: 0,
      });

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.trialDays).toBe(0);

      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          trialDays: 0,
        })
      );
    });

    it('should include session amount in response', async () => {
      const customSession = {
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/pay/cs_test_456',
        amount_total: 3900, // $39.00 in cents
      };

      mockStripeService.createCheckoutSession.mockResolvedValue(customSession as any);

      const request = mockAuthenticatedRequest({ planId: 'business' });
      const response = await POST(request as any);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Checkout session created successfully',
        expect.objectContaining({
          amount: 3900,
        })
      );
    });
  });
});
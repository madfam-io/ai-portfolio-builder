/**
 * @jest-environment jsdom
 */

import { POST } from '@/app/api/v1/stripe/checkout/route';
import { stripeService } from '@/lib/services/stripe/stripe';

// Mock the entire stripe service
jest.mock('@/lib/services/stripe/stripe', () => ({
  stripeService: {
    isAvailable: jest.fn(),
    createCheckoutSession: jest.fn(),
  },
}));

// Mock auth middleware
jest.mock('@/middleware/auth', () => ({
  withAuth: jest.fn((handler) => handler),
}));

// Mock environment
jest.mock('@/lib/config/env', () => ({
  getAppUrl: jest.fn(() => 'http://localhost:3000'),
}));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

const mockRequest = (body: any, user = { id: 'user123', email: 'test@example.com' }) => {
  return {
    json: () => Promise.resolve(body),
    auth: { user },
  } as any;
};

describe('/api/v1/stripe/checkout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (stripeService.isAvailable as jest.Mock).mockReturnValue(true);
  });

  describe('POST /api/v1/stripe/checkout', () => {
    it('should create checkout session successfully', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        amount_total: 1500,
      };

      (stripeService.createCheckoutSession as jest.Mock).mockResolvedValue(mockSession);

      const request = mockRequest({
        planId: 'pro',
        trialDays: 7,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe('cs_test_123');
      expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_123');
      expect(data.planId).toBe('pro');
      expect(data.trialDays).toBe(7);

      expect(stripeService.createCheckoutSession).toHaveBeenCalledWith({
        planId: 'pro',
        userId: 'user123',
        userEmail: 'test@example.com',
        successUrl: 'http://localhost:3000/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true',
        cancelUrl: 'http://localhost:3000/pricing?canceled=true',
        trialDays: 7,
      });
    });

    it('should return 503 when Stripe is unavailable', async () => {
      (stripeService.isAvailable as jest.Mock).mockReturnValue(false);

      const request = mockRequest({
        planId: 'pro',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Payment service is currently unavailable');
      expect(data.code).toBe('STRIPE_NOT_AVAILABLE');
    });

    it('should return 400 for invalid plan ID', async () => {
      const request = mockRequest({
        planId: 'invalid',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing plan ID', async () => {
      const request = mockRequest({});

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid trial days', async () => {
      const request = mockRequest({
        planId: 'pro',
        trialDays: 50, // Too many days
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.code).toBe('VALIDATION_ERROR');
    });

    it('should use default trial days when not specified', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        amount_total: 1500,
      };

      (stripeService.createCheckoutSession as jest.Mock).mockResolvedValue(mockSession);

      const request = mockRequest({
        planId: 'pro',
      });

      await POST(request);

      expect(stripeService.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          trialDays: 7, // Default value
        })
      );
    });

    it('should return 400 when user email is missing', async () => {
      const request = mockRequest(
        { planId: 'pro' },
        { id: 'user123', email: undefined as any }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('User email is required for checkout');
      expect(data.code).toBe('USER_EMAIL_REQUIRED');
    });

    it('should handle Stripe service errors', async () => {
      (stripeService.createCheckoutSession as jest.Mock).mockRejectedValue(
        new Error('Stripe API error')
      );

      const request = mockRequest({
        planId: 'pro',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
      expect(data.code).toBe('CHECKOUT_FAILED');
    });

    it('should validate plan IDs correctly', async () => {
      const validPlans = ['pro', 'business', 'enterprise'];
      
      for (const planId of validPlans) {
        const mockSession = {
          id: `cs_test_${planId}`,
          url: `https://checkout.stripe.com/pay/cs_test_${planId}`,
          amount_total: 1500,
        };

        (stripeService.createCheckoutSession as jest.Mock).mockResolvedValue(mockSession);

        const request = mockRequest({ planId });
        const response = await POST(request);

        expect(response.status).toBe(200);
      }
    });

    it('should reject free plan requests', async () => {
      const request = mockRequest({
        planId: 'free',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should set correct URLs for checkout session', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
        amount_total: 1500,
      };

      (stripeService.createCheckoutSession as jest.Mock).mockResolvedValue(mockSession);

      const request = mockRequest({
        planId: 'pro',
      });

      await POST(request);

      const callArgs = (stripeService.createCheckoutSession as jest.Mock).mock.calls[0][0];
      
      expect(callArgs.successUrl).toContain('/dashboard/billing');
      expect(callArgs.successUrl).toContain('session_id={CHECKOUT_SESSION_ID}');
      expect(callArgs.successUrl).toContain('success=true');
      
      expect(callArgs.cancelUrl).toContain('/pricing');
      expect(callArgs.cancelUrl).toContain('canceled=true');
    });
  });
});
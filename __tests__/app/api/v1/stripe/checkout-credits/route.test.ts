import { describe, test, it, expect, beforeEach, beforeAll, afterAll, jest } from '@jest/globals';

/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/stripe/checkout-credits/route';
import {
  enhancedStripeService,
  AI_CREDIT_PACKS,
} from '@/lib/services/stripe/stripe-enhanced';
import { logger } from '@/lib/utils/logger';


// Mock dependencies
jest.mock('@/lib/services/stripe/stripe-enhanced');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/api/middleware/auth', () => ({
  withAuth: (handler: any) => handler,
}));
jest.mock('@/lib/api/response-helpers', () => ({
  versionedApiHandler: (handler: any) => handler,
}));

const mockEnhancedStripeService = enhancedStripeService as jest.Mocked<
  typeof enhancedStripeService
>;
const mockLogger = logger as jest.Mocked<typeof logger>;

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_APP_URL: 'https://test.example.com',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

describe('/api/v1/stripe/checkout-credits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnhancedStripeService.isAvailable.mockReturnValue(true);
  });

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockAuthenticatedRequest = (body: any) => {
    const request = new NextRequest(
      'http://localhost:3000/api/v1/stripe/checkout-credits',
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
        },
      }

    // Mock the withAuth middleware by adding user to request
    (request as any).user = mockUser;
    return request;
  };

  describe('POST', () => {
    it('should create checkout session for valid credit pack', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      mockEnhancedStripeService.createAICreditCheckout.mockResolvedValue(
        mockSession as any

      const request = mockAuthenticatedRequest({ packId: 'small' });
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        checkoutUrl: mockSession.url,
        sessionId: mockSession.id,
      });

      expect(
        mockEnhancedStripeService.createAICreditCheckout
      ).toHaveBeenCalledWith({
        packId: 'small',
        userId: mockUser.id,
        userEmail: mockUser.email,
        successUrl:
          'https://test.example.com/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&type=credits',
        cancelUrl: 'https://test.example.com/dashboard/billing?canceled=true',
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'AI credit pack checkout session created',
        {
          sessionId: mockSession.id,
          userId: mockUser.id,
          packId: 'small',
        }

    });

    it('should handle all valid credit pack types', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      mockEnhancedStripeService.createAICreditCheckout.mockResolvedValue(
        mockSession as any

      // Test each valid pack ID
      for (const packId of Object.keys(AI_CREDIT_PACKS)) {
        const request = mockAuthenticatedRequest({ packId });
        const response = await POST(request as any);

        expect(response.status).toBe(200);
        expect(
          mockEnhancedStripeService.createAICreditCheckout
        ).toHaveBeenCalledWith(expect.objectContaining({ packId }));
      }
    });

    it('should return 401 when user is missing', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/stripe/checkout-credits',
        {
          method: 'POST',
          body: JSON.stringify({ packId: 'small' }),
        }

      // No user attached to request
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('User information is required');
    });

    it('should return 401 when user lacks required fields', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/stripe/checkout-credits',
        {
          method: 'POST',
          body: JSON.stringify({ packId: 'small' }),
        }

      // User missing email
      (request as any).user = { id: 'user-123', name: 'Test User' };

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('User information is required');
    });

    it('should return 400 for invalid pack ID', async () => {
      const request = mockAuthenticatedRequest({ packId: 'invalid' });
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid credit pack ID');
      expect(
        mockEnhancedStripeService.createAICreditCheckout
      ).not.toHaveBeenCalled();
    });

    it('should return 400 for missing pack ID', async () => {
      const request = mockAuthenticatedRequest({});
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid credit pack ID');
    });

    it('should return 503 when Stripe service is unavailable', async () => {
      mockEnhancedStripeService.isAvailable.mockReturnValue(false);

      const request = mockAuthenticatedRequest({ packId: 'small' });
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Payment service is currently unavailable');
      expect(
        mockEnhancedStripeService.createAICreditCheckout
      ).not.toHaveBeenCalled();
    });

    it('should handle Stripe service errors', async () => {
      const stripeError = new Error('Stripe API error');
      mockEnhancedStripeService.createAICreditCheckout.mockRejectedValue(
        stripeError

      const request = mockAuthenticatedRequest({ packId: 'medium' });
      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create AI credit checkout session',
        { error: stripeError }

    });

    it('should handle malformed JSON body', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/stripe/checkout-credits',
        {
          method: 'POST',
          body: 'invalid-json',
          headers: {
            'Content-Type': 'application/json',
          },
        }

      (request as any).user = mockUser;

      const response = await POST(request as any);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should generate correct success and cancel URLs', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      };

      mockEnhancedStripeService.createAICreditCheckout.mockResolvedValue(
        mockSession as any

      const request = mockAuthenticatedRequest({ packId: 'large' });
      await POST(request as any);

      expect(
        mockEnhancedStripeService.createAICreditCheckout
      ).toHaveBeenCalledWith({
        packId: 'large',
        userId: mockUser.id,
        userEmail: mockUser.email,
        successUrl:
          'https://test.example.com/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&type=credits',
        cancelUrl: 'https://test.example.com/dashboard/billing?canceled=true',
      });
    });

    it('should validate credit pack enum values', async () => {
      // Test that only valid AI_CREDIT_PACKS keys are accepted
      const validPackIds = ['small', 'medium', 'large'];
      const invalidPackIds = ['tiny', 'huge', 'premium', 'basic'];

      for (const packId of validPackIds) {
        const request = mockAuthenticatedRequest({ packId });
        const response = await POST(request as any);

        // Should not return 400 for valid pack IDs
        expect(response.status).not.toBe(400);
      }

      for (const packId of invalidPackIds) {
        const request = mockAuthenticatedRequest({ packId });
        const response = await POST(request as any);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid credit pack ID');
      }
    });

    it('should preserve user context throughout request', async () => {
      const mockSession = {
        id: 'cs_test_456',
        url: 'https://checkout.stripe.com/pay/cs_test_456',
      };

      mockEnhancedStripeService.createAICreditCheckout.mockResolvedValue(
        mockSession as any

      const customUser = {
        id: 'custom-user-789',
        email: 'custom@example.com',
        name: 'Custom User',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/v1/stripe/checkout-credits',
        {
          method: 'POST',
          body: JSON.stringify({ packId: 'medium' }),
          headers: {
            'Content-Type': 'application/json',
          },
        }

      (request as any).user = customUser;

      await POST(request as any);

      expect(
        mockEnhancedStripeService.createAICreditCheckout
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: customUser.id,
          userEmail: customUser.email,
        })

      expect(mockLogger.info).toHaveBeenCalledWith(
        'AI credit pack checkout session created',
        expect.objectContaining({
          userId: customUser.id,
        })
    });
  });
});

/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/stripe/check-promotion/route';
import {
  enhancedStripeService,
  PROMOTIONAL_CONFIG,
} from '@/lib/services/stripe/stripe-enhanced';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/services/stripe/stripe-enhanced');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/api/middleware/error-handler', () => ({
  withErrorHandling: (handler: any) => handler,
}));
jest.mock('@/lib/api/middleware/rate-limit', () => ({
  withRateLimit: (handler: any) => (req: any) => handler(req),
}));

const mockEnhancedStripeService = enhancedStripeService as jest.Mocked<
  typeof enhancedStripeService
>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('/api/v1/stripe/check-promotion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnhancedStripeService.isAvailable.mockReturnValue(true);
  });

  const createRequest = (body: any, method: string = 'POST') => {
    const config: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Only add body for methods that support it
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      config.body = JSON.stringify(body);
    }

    return new NextRequest(
      'http://localhost:3000/api/v1/stripe/check-promotion',
      config
    );
  };

  describe('POST', () => {
    it('should return promotion details for eligible user', async () => {
      const eligibility = {
        eligible: true,
        remainingSlots: 50,
      };

      mockEnhancedStripeService.checkPromotionalEligibility.mockResolvedValue(
        eligibility
      );

      const request = createRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        eligible: true,
        reason: undefined,
        remainingSlots: 50,
        promotion: {
          code: PROMOTIONAL_CONFIG.code,
          description: PROMOTIONAL_CONFIG.description,
          discountPercentage: PROMOTIONAL_CONFIG.discountPercentage,
          durationMonths: PROMOTIONAL_CONFIG.durationMonths,
          validUntil: PROMOTIONAL_CONFIG.validUntil,
        },
      });

      expect(
        mockEnhancedStripeService.checkPromotionalEligibility
      ).toHaveBeenCalledWith('test@example.com');
    });

    it('should return ineligible status with reason', async () => {
      const eligibility = {
        eligible: false,
        reason: 'Already used promotion',
      };

      mockEnhancedStripeService.checkPromotionalEligibility.mockResolvedValue(
        eligibility
      );

      const request = createRequest({ email: 'used@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        eligible: false,
        reason: 'Already used promotion',
        remainingSlots: undefined,
        promotion: null,
      });
    });

    it('should handle promotion expired scenario', async () => {
      const eligibility = {
        eligible: false,
        reason: 'Promotion expired',
      };

      mockEnhancedStripeService.checkPromotionalEligibility.mockResolvedValue(
        eligibility
      );

      const request = createRequest({ email: 'late@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.eligible).toBe(false);
      expect(data.reason).toBe('Promotion expired');
      expect(data.promotion).toBeNull();
    });

    it('should handle promotion fully redeemed scenario', async () => {
      const eligibility = {
        eligible: false,
        reason: 'Promotion fully redeemed',
        remainingSlots: 0,
      };

      mockEnhancedStripeService.checkPromotionalEligibility.mockResolvedValue(
        eligibility
      );

      const request = createRequest({ email: 'full@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.eligible).toBe(false);
      expect(data.reason).toBe('Promotion fully redeemed');
      expect(data.remainingSlots).toBe(0);
      expect(data.promotion).toBeNull();
    });

    it('should return 400 for invalid email', async () => {
      const request = createRequest({ email: 'invalid-email' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
      expect(
        mockEnhancedStripeService.checkPromotionalEligibility
      ).not.toHaveBeenCalled();
    });

    it('should return 400 for missing email', async () => {
      const request = createRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should return 405 for non-POST methods', async () => {
      const request = createRequest({ email: 'test@example.com' }, 'GET');
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(405);
      expect(data.error).toBe('Method not allowed');
    });

    it('should handle Stripe service unavailable', async () => {
      mockEnhancedStripeService.isAvailable.mockReturnValue(false);

      const request = createRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        eligible: false,
        reason: 'Payment service unavailable',
        promotion: null,
      });

      expect(
        mockEnhancedStripeService.checkPromotionalEligibility
      ).not.toHaveBeenCalled();
    });

    it('should handle service errors', async () => {
      const serviceError = new Error('Stripe API error');
      mockEnhancedStripeService.checkPromotionalEligibility.mockRejectedValue(
        serviceError
      );

      const request = createRequest({ email: 'error@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to check promotional eligibility');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error checking promotional eligibility',
        { error: serviceError }
      );
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/stripe/check-promotion',
        {
          method: 'POST',
          body: 'invalid-json',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to check promotional eligibility');
    });

    it('should validate different email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com',
      ];

      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user.domain.com',
        '',
      ];

      // Test valid emails
      for (const email of validEmails) {
        mockEnhancedStripeService.checkPromotionalEligibility.mockResolvedValue(
          {
            eligible: true,
          }
        );

        const request = createRequest({ email });
        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(
          mockEnhancedStripeService.checkPromotionalEligibility
        ).toHaveBeenCalledWith(email);
        jest.clearAllMocks();
      }

      // Test invalid emails
      for (const email of invalidEmails) {
        const request = createRequest({ email });
        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid request data');
        expect(
          mockEnhancedStripeService.checkPromotionalEligibility
        ).not.toHaveBeenCalled();
        jest.clearAllMocks();
      }
    });

    it('should include remaining slots when available', async () => {
      const eligibility = {
        eligible: true,
        remainingSlots: 25,
      };

      mockEnhancedStripeService.checkPromotionalEligibility.mockResolvedValue(
        eligibility
      );

      const request = createRequest({ email: 'slots@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.remainingSlots).toBe(25);
      expect(data.eligible).toBe(true);
    });

    it('should handle undefined remaining slots', async () => {
      const eligibility = {
        eligible: true,
        remainingSlots: undefined,
      };

      mockEnhancedStripeService.checkPromotionalEligibility.mockResolvedValue(
        eligibility
      );

      const request = createRequest({ email: 'unlimited@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.remainingSlots).toBeUndefined();
      expect(data.eligible).toBe(true);
    });

    it('should return correct promotion configuration', async () => {
      const eligibility = {
        eligible: true,
      };

      mockEnhancedStripeService.checkPromotionalEligibility.mockResolvedValue(
        eligibility
      );

      const request = createRequest({ email: 'config@example.com' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.promotion).toEqual({
        code: PROMOTIONAL_CONFIG.code,
        description: PROMOTIONAL_CONFIG.description,
        discountPercentage: PROMOTIONAL_CONFIG.discountPercentage,
        durationMonths: PROMOTIONAL_CONFIG.durationMonths,
        validUntil: PROMOTIONAL_CONFIG.validUntil,
      });
    });

    it('should handle case-sensitive email validation', async () => {
      const email = 'Test.User@Example.COM';

      mockEnhancedStripeService.checkPromotionalEligibility.mockResolvedValue({
        eligible: true,
      });

      const request = createRequest({ email });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(
        mockEnhancedStripeService.checkPromotionalEligibility
      ).toHaveBeenCalledWith(email);
    });
  });
});

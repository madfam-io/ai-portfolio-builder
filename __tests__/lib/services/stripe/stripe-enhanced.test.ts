/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import Stripe from 'stripe';
import {
  createCheckoutSession,
  createPortalSession,
  handleWebhookEvent,
  createAICreditCheckout,
  SUBSCRIPTION_PLANS,
  AI_CREDIT_PACKS,
  formatPriceWithPromotion,
  getSubscriptionFeatures,
} from '@/lib/services/stripe/stripe-enhanced';

// Mock Stripe
jest.mock('stripe');

describe('Enhanced Stripe Service', () => {
  let mockStripe: jest.Mocked<Stripe>;
  let mockCheckoutSessions: any;
  let mockBillingPortalSessions: any;
  let mockWebhooksConstructEvent: jest.Mock;
  let mockPrices: any;
  let mockCustomers: any;
  let mockSubscriptions: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock implementations
    mockCheckoutSessions = {
      create: jest.fn(),
    };

    mockBillingPortalSessions = {
      create: jest.fn(),
    };

    mockPrices = {
      retrieve: jest.fn(),
    };

    mockCustomers = {
      update: jest.fn(),
    };

    mockSubscriptions = {
      retrieve: jest.fn(),
      update: jest.fn(),
    };

    mockWebhooksConstructEvent = jest.fn();

    // Create Stripe mock instance
    mockStripe = {
      checkout: {
        sessions: mockCheckoutSessions,
      },
      billingPortal: {
        sessions: mockBillingPortalSessions,
      },
      webhooks: {
        constructEvent: mockWebhooksConstructEvent,
      },
      prices: mockPrices,
      customers: mockCustomers,
      subscriptions: mockSubscriptions,
    } as any;

    // Mock Stripe constructor
    (Stripe as unknown as jest.Mock).mockImplementation(() => mockStripe);
  });

  describe('Subscription Plans', () => {
    it('should have correctly structured subscription plans', () => {
      expect(SUBSCRIPTION_PLANS).toHaveProperty('free');
      expect(SUBSCRIPTION_PLANS).toHaveProperty('pro');
      expect(SUBSCRIPTION_PLANS).toHaveProperty('business');
      expect(SUBSCRIPTION_PLANS).toHaveProperty('enterprise');

      // Verify plan features
      expect(SUBSCRIPTION_PLANS.free.portfolios).toBe(1);
      expect(SUBSCRIPTION_PLANS.pro.portfolios).toBe(5);
      expect(SUBSCRIPTION_PLANS.business.portfolios).toBe(25);
      expect(SUBSCRIPTION_PLANS.enterprise.portfolios).toBe(-1); // Unlimited
    });

    it('should have promotional pricing for paid plans', () => {
      expect(SUBSCRIPTION_PLANS.pro.promotionalPrice).toBe(1200); // $12
      expect(SUBSCRIPTION_PLANS.business.promotionalPrice).toBe(1950); // $19.50
      expect(SUBSCRIPTION_PLANS.enterprise.promotionalPrice).toBe(3950); // $39.50
    });
  });

  describe('createCheckoutSession', () => {
    const mockUserId = 'user_123';
    const mockEmail = 'test@example.com';
    const mockSuccessUrl = 'https://example.com/success';
    const mockCancelUrl = 'https://example.com/cancel';

    it('should create a checkout session for Pro plan', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session',
      };

      mockCheckoutSessions.create.mockResolvedValue(mockSession);

      const result = await createCheckoutSession({
        userId: mockUserId,
        email: mockEmail,
        planId: 'pro',
        successUrl: mockSuccessUrl,
        cancelUrl: mockCancelUrl,
      });

      expect(mockCheckoutSessions.create).toHaveBeenCalledWith(
      {
        customer_email: mockEmail,
        metadata: {
          userId: mockUserId,
          planId: 'pro',
        },
        line_items: [
          {
            price: SUBSCRIPTION_PLANS.pro.stripePriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: mockSuccessUrl,
        cancel_url: mockCancelUrl,
        billing_address_collection: 'auto',
        allow_promotion_codes: true,
        subscription_data: {
          trial_period_days: undefined,
          metadata: {
            userId: mockUserId,
            planId: 'pro',
          },
        },
    );
  });

      expect(result).toEqual(mockSession);
    });

    it('should apply promotional pricing when enabled', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com',
      };
      mockCheckoutSessions.create.mockResolvedValue(mockSession);

      await createCheckoutSession({
        userId: mockUserId,
        email: mockEmail,
        planId: 'business',
        successUrl: mockSuccessUrl,
        cancelUrl: mockCancelUrl,
        usePromotionalPrice: true,
      });

      expect(mockCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          line_items: [
            {
              price: SUBSCRIPTION_PLANS.business.promotionalPriceId,
              quantity: 1,
            },
          ],
        })
    });

    it('should include trial period when specified', async () => {
      const mockSession = {
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com',
      };
      mockCheckoutSessions.create.mockResolvedValue(mockSession);

      await createCheckoutSession({
        userId: mockUserId,
        email: mockEmail,
        planId: 'pro',
        successUrl: mockSuccessUrl,
        cancelUrl: mockCancelUrl,
        trialDays: 14,
      });

      expect(mockCheckoutSessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          subscription_data: expect.objectContaining({
            trial_period_days: 14,
          }),
        })
    });

    it('should throw error for invalid plan', async () => {
      await expect(
        createCheckoutSession({
          userId: mockUserId,
          email: mockEmail,
          planId: 'invalid' as any,
          successUrl: mockSuccessUrl,
          cancelUrl: mockCancelUrl,
        })
      ).rejects.toThrow('Invalid plan ID');
    });

    it('should throw error for free plan', async () => {
      await expect(
        createCheckoutSession({
          userId: mockUserId,
          email: mockEmail,
          planId: 'free',
          successUrl: mockSuccessUrl,
          cancelUrl: mockCancelUrl,
        })
      ).rejects.toThrow('Cannot create checkout for free plan');
    });
  });

  describe('createAICreditCheckout', () => {
    const mockUserId = 'user_123';
    const mockEmail = 'test@example.com';

    it('should create checkout for AI credit pack', async () => {
      const mockSession = {
        id: 'cs_test_credits',
        url: 'https://checkout.stripe.com/credits',
      };

      mockCheckoutSessions.create.mockResolvedValue(mockSession);

      const result = await createAICreditCheckout({
        userId: mockUserId,
        email: mockEmail,
        packId: 'medium',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
      });

      expect(mockCheckoutSessions.create).toHaveBeenCalledWith(
      {
        customer_email: mockEmail,
        metadata: {
          userId: mockUserId,
          creditPack: 'medium',
          credits: '25',
        },
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: AI_CREDIT_PACKS.medium.name,
                description: '25 AI enhancement credits',
              },
              unit_amount: AI_CREDIT_PACKS.medium.price,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        billing_address_collection: 'auto',
    );
  });

      expect(result).toEqual(mockSession);
    });

    it('should handle all credit pack sizes', async () => {
      const packIds: Array<keyof typeof AI_CREDIT_PACKS> = [
        'small',
        'medium',
        'large',
      ];

      for (const packId of packIds) {
        mockCheckoutSessions.create.mockResolvedValue({ id: `cs_${packId}` });

        await createAICreditCheckout({
          userId: mockUserId,
          email: mockEmail,
          packId,
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        });

        expect(mockCheckoutSessions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            metadata: expect.objectContaining({
              creditPack: packId,
              credits: AI_CREDIT_PACKS[packId].credits.toString(),
            }),
          })
      }
    });
  });

  describe('createPortalSession', () => {
    it('should create billing portal session', async () => {
      const mockSession = {
        id: 'bps_test_123',
        url: 'https://billing.stripe.com/session',
      };

      mockBillingPortalSessions.create.mockResolvedValue(mockSession);

      const result = await createPortalSession({
        customerId: 'cus_123',
        returnUrl: 'https://example.com/dashboard',
      });

      expect(mockBillingPortalSessions.create).toHaveBeenCalledWith(
      {
        customer: 'cus_123',
        return_url: 'https://example.com/dashboard',
    );
  });

      expect(result).toEqual(mockSession);
    });
  });

  describe('handleWebhookEvent', () => {
    const mockRawBody = 'raw_webhook_body';
    const mockSignature = 'stripe_signature';

    it('should handle checkout.session.completed for subscription', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_123',
            subscription: 'sub_123',
            metadata: {
              userId: 'user_123',
              planId: 'pro',
            },
            customer_details: {
              email: 'test@example.com',
            },
          },
        },
      };

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const handler = jest.fn();
      const result = await handleWebhookEvent(mockRawBody, mockSignature, {
        'checkout.session.completed': handler,
      });

      expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
        mockRawBody,
        mockSignature,
        process.env.STRIPE_WEBHOOK_SECRET

      expect(handler).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual({ received: true });
    });

    it('should handle checkout.session.completed for AI credits', async () => {
      const mockEvent = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_credits',
            customer: 'cus_123',
            metadata: {
              userId: 'user_123',
              creditPack: 'medium',
              credits: '25',
            },
            payment_status: 'paid',
          },
        },
      };

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const handler = jest.fn();
      await handleWebhookEvent(mockRawBody, mockSignature, {
        'checkout.session.completed': handler,
      });

      expect(handler).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle subscription updated events', async () => {
      const mockEvent = {
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            items: {
              data: [
                {
                  price: {
                    id: 'price_pro',
                  },
                },
              ],
            },
            current_period_end:
              Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      };

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const handler = jest.fn();
      await handleWebhookEvent(mockRawBody, mockSignature, {
        'customer.subscription.updated': handler,
      });

      expect(handler).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle subscription deletion', async () => {
      const mockEvent = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
          },
        },
      };

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const handler = jest.fn();
      await handleWebhookEvent(mockRawBody, mockSignature, {
        'customer.subscription.deleted': handler,
      });

      expect(handler).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle webhook signature verification failure', async () => {
      mockWebhooksConstructEvent.mockImplementation(() => {
        throw new Error('Signature verification failed');
      });

      await expect(
        handleWebhookEvent(mockRawBody, mockSignature, {})
      ).rejects.toThrow('Signature verification failed');
    });

    it('should ignore unhandled events', async () => {
      const mockEvent = {
        type: 'some.other.event',
        data: { object: {} },
      };

      mockWebhooksConstructEvent.mockReturnValue(mockEvent);

      const result = await handleWebhookEvent(mockRawBody, mockSignature, {});

      expect(result).toEqual({ received: true });
    });
  });

  describe('formatPriceWithPromotion', () => {
    it('should format price without promotion', () => {
      const result = formatPriceWithPromotion(2400);
      expect(result).toBe('$24.00');
    });

    it('should format price with promotion', () => {
      const result = formatPriceWithPromotion(2400, 1200);
      expect(result).toEqual({
        original: '$24.00',
        promotional: '$12.00',
        savings: '$12.00',
        percentOff: 50,
      });
    });

    it('should handle different currencies', () => {
      const result = formatPriceWithPromotion(2400, undefined, 'eur');
      expect(result).toBe('€24.00');
    });
  });

  describe('getSubscriptionFeatures', () => {
    it('should return correct features for each plan', () => {
      const plans: Array<keyof typeof SUBSCRIPTION_PLANS> = [
        'free',
        'pro',
        'business',
        'enterprise',
      ];

      plans.forEach(plan => {
        const features = getSubscriptionFeatures(plan);
        expect(features).toBeInstanceOf(Array);
        expect(features.length).toBeGreaterThan(0);
        expect(features[0]).toHaveProperty('name');
        expect(features[0]).toHaveProperty('included');
      });
    });

    it('should include AI request limits', () => {
      const proFeatures = getSubscriptionFeatures('pro');
      const aiFeature = proFeatures.find(f => f.name.includes('AI'));
      expect(aiFeature).toBeDefined();
      expect(aiFeature?.included).toBe(true);
    });

    it('should show unlimited features for enterprise', () => {
      const enterpriseFeatures = getSubscriptionFeatures('enterprise');
      const unlimitedFeatures = enterpriseFeatures.filter(f =>
        f.name.toLowerCase().includes('unlimited')

      expect(unlimitedFeatures.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors gracefully', async () => {
      const stripeError = new Error('Stripe API error');
      (stripeError as any).type = 'StripeAPIError';
      (stripeError as any).statusCode = 400;

      mockCheckoutSessions.create.mockRejectedValue(stripeError);

      await expect(
        createCheckoutSession({
          userId: 'user_123',
          email: 'test@example.com',
          planId: 'pro',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        })
      ).rejects.toThrow('Stripe API error');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network error');
      (networkError as any).type = 'StripeConnectionError';

      mockCheckoutSessions.create.mockRejectedValue(networkError);

      await expect(
        createCheckoutSession({
          userId: 'user_123',
          email: 'test@example.com',
          planId: 'pro',
          successUrl: 'https://example.com/success',
          cancelUrl: 'https://example.com/cancel',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Promotional Pricing Logic', () => {
    it('should calculate correct savings percentage', () => {
      const result = formatPriceWithPromotion(3900, 1950);
      expect(result).toEqual({
        original: '$39.00',
        promotional: '$19.50',
        savings: '$19.50',
        percentOff: 50,
      });
    });

    it('should handle edge cases in pricing', () => {
      // Zero promotional price
      const freePromo = formatPriceWithPromotion(1000, 0);
      expect(freePromo.percentOff).toBe(100);

      // Same price (no discount)
      const noDiscount = formatPriceWithPromotion(1000, 1000);
      expect(noDiscount.percentOff).toBe(0);
    });
  });
});

import { StripeService } from '@/lib/services/stripe/stripe-enhanced';
import Stripe from 'stripe';
import { AppError } from '@/types/errors';

// Mock Stripe
jest.mock('stripe');

// Mock environment
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_123';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

describe('StripeService - Comprehensive Tests', () => {
  let stripeService: StripeService;
  let mockStripe: jest.Mocked<Stripe>;

  const mockCustomer = {
    id: 'cus_123',
    email: 'test@example.com',
    metadata: { userId: 'user-123' },
  } as Stripe.Customer;

  const mockSubscription = {
    id: 'sub_123',
    customer: 'cus_123',
    status: 'active',
    current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
    items: {
      data: [{
        price: {
          id: 'price_123',
          product: 'prod_123',
          unit_amount: 2400,
          currency: 'usd',
          recurring: { interval: 'month' },
        },
      }],
    },
    metadata: { userId: 'user-123', planId: 'pro' },
  } as unknown as Stripe.Subscription;

  const mockCheckoutSession = {
    id: 'cs_123',
    url: 'https://checkout.stripe.com/session/123',
    customer: 'cus_123',
    payment_status: 'paid',
    metadata: { userId: 'user-123', planId: 'pro' },
  } as Stripe.Checkout.Session;

  const mockPaymentIntent = {
    id: 'pi_123',
    amount: 2000,
    currency: 'usd',
    status: 'succeeded',
    metadata: { userId: 'user-123', credits: '25' },
  } as Stripe.PaymentIntent;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Stripe instance
    mockStripe = {
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        list: jest.fn(),
      },
      subscriptions: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
        list: jest.fn(),
      },
      checkout: {
        sessions: {
          create: jest.fn(),
          retrieve: jest.fn(),
          list: jest.fn(),
          expire: jest.fn(),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
      paymentIntents: {
        create: jest.fn(),
        retrieve: jest.fn(),
        confirm: jest.fn(),
      },
      prices: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
      },
      products: {
        create: jest.fn(),
        retrieve: jest.fn(),
        list: jest.fn(),
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
    } as unknown as jest.Mocked<Stripe>;

    (Stripe as unknown as jest.Mock).mockImplementation(() => mockStripe);
    
    // Create service instance
    stripeService = new StripeService();
  });

  describe('Service Initialization', () => {
    it('should initialize with valid configuration', () => {
      expect(stripeService.isAvailable()).toBe(true);
    });

    it('should handle missing API key gracefully', () => {
      delete process.env.STRIPE_SECRET_KEY;
      const service = new StripeService();
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('Customer Management', () => {
    describe('createCustomer', () => {
      it('should create a new customer', async () => {
        mockStripe.customers.create.mockResolvedValue(mockCustomer);

        const result = await stripeService.createCustomer({
          email: 'test@example.com',
          userId: 'user-123',
        });

        expect(result).toEqual(mockCustomer);
        expect(mockStripe.customers.create).toHaveBeenCalledWith({
          email: 'test@example.com',
          metadata: { userId: 'user-123' },
        });
      });

      it('should handle customer creation errors', async () => {
        mockStripe.customers.create.mockRejectedValue(new Error('Customer creation failed'));

        await expect(
          stripeService.createCustomer({ email: 'test@example.com', userId: 'user-123' })
        ).rejects.toThrow('Customer creation failed');
      });
    });

    describe('getCustomer', () => {
      it('should retrieve customer by ID', async () => {
        mockStripe.customers.retrieve.mockResolvedValue(mockCustomer);

        const result = await stripeService.getCustomer('cus_123');

        expect(result).toEqual(mockCustomer);
        expect(mockStripe.customers.retrieve).toHaveBeenCalledWith('cus_123');
      });

      it('should handle deleted customers', async () => {
        const deletedCustomer = { ...mockCustomer, deleted: true };
        mockStripe.customers.retrieve.mockResolvedValue(deletedCustomer as any);

        const result = await stripeService.getCustomer('cus_123');

        expect(result).toBeNull();
      });
    });
  });

  describe('Subscription Management', () => {
    describe('createCheckoutSession', () => {
      it('should create checkout session for subscription', async () => {
        mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession);

        const result = await stripeService.createCheckoutSession({
          planId: 'pro',
          userId: 'user-123',
          customerEmail: 'test@example.com',
        });

        expect(result).toEqual(mockCheckoutSession);
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [{
            price: expect.any(String),
            quantity: 1,
          }],
          success_url: expect.stringContaining('/payment/success'),
          cancel_url: expect.stringContaining('/payment/cancel'),
          customer_email: 'test@example.com',
          metadata: {
            userId: 'user-123',
            planId: 'pro',
            type: 'subscription',
          },
          subscription_data: {
            metadata: {
              userId: 'user-123',
              planId: 'pro',
            },
          },
          allow_promotion_codes: true,
        });
      });

      it('should apply promotional discount if available', async () => {
        mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession);

        await stripeService.createCheckoutSession({
          planId: 'pro',
          userId: 'user-123',
          customerEmail: 'test@example.com',
        });

        const createCall = mockStripe.checkout.sessions.create.mock.calls[0][0];
        expect(createCall.discounts).toEqual([{ coupon: 'LAUNCH50' }]);
      });

      it('should create checkout session for credit pack', async () => {
        mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession);

        const result = await stripeService.createCreditPackCheckoutSession({
          packSize: 'medium',
          userId: 'user-123',
          customerEmail: 'test@example.com',
        });

        expect(result).toEqual(mockCheckoutSession);
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            mode: 'payment',
            metadata: {
              userId: 'user-123',
              type: 'ai_credit_pack',
              credits: '25',
            },
          })
        );
      });
    });

    describe('getSubscription', () => {
      it('should retrieve active subscription', async () => {
        mockStripe.subscriptions.retrieve.mockResolvedValue(mockSubscription);

        const result = await stripeService.getSubscription('sub_123');

        expect(result).toEqual(mockSubscription);
      });

      it('should expand customer data when requested', async () => {
        mockStripe.subscriptions.retrieve.mockResolvedValue({
          ...mockSubscription,
          customer: mockCustomer,
        } as any);

        const result = await stripeService.getSubscription('sub_123', { expand: ['customer'] });

        expect(mockStripe.subscriptions.retrieve).toHaveBeenCalledWith('sub_123', {
          expand: ['customer'],
        });
      });
    });

    describe('cancelSubscription', () => {
      it('should cancel subscription at period end', async () => {
        const canceledSubscription = {
          ...mockSubscription,
          cancel_at_period_end: true,
        };
        mockStripe.subscriptions.update.mockResolvedValue(canceledSubscription as any);

        const result = await stripeService.cancelSubscription('sub_123');

        expect(result).toEqual(canceledSubscription);
        expect(mockStripe.subscriptions.update).toHaveBeenCalledWith('sub_123', {
          cancel_at_period_end: true,
        });
      });

      it('should cancel subscription immediately when requested', async () => {
        const canceledSubscription = {
          ...mockSubscription,
          status: 'canceled',
        };
        mockStripe.subscriptions.cancel.mockResolvedValue(canceledSubscription as any);

        const result = await stripeService.cancelSubscription('sub_123', true);

        expect(result).toEqual(canceledSubscription);
        expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith('sub_123');
      });
    });
  });

  describe('Payment Processing', () => {
    describe('createPaymentIntent', () => {
      it('should create payment intent for one-time payment', async () => {
        mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent);

        const result = await stripeService.createPaymentIntent({
          amount: 2000,
          currency: 'usd',
          metadata: { userId: 'user-123', purpose: 'credit_pack' },
        });

        expect(result).toEqual(mockPaymentIntent);
        expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
          amount: 2000,
          currency: 'usd',
          metadata: { userId: 'user-123', purpose: 'credit_pack' },
          automatic_payment_methods: { enabled: true },
        });
      });

      it('should handle payment intent creation errors', async () => {
        mockStripe.paymentIntents.create.mockRejectedValue(
          new Stripe.errors.StripeCardError({
            type: 'card_error',
            message: 'Card declined',
            code: 'card_declined',
          } as any)
        );

        await expect(
          stripeService.createPaymentIntent({ amount: 2000, currency: 'usd' })
        ).rejects.toThrow('Card declined');
      });
    });
  });

  describe('Billing Portal', () => {
    it('should create billing portal session', async () => {
      const mockPortalSession = {
        id: 'bps_123',
        url: 'https://billing.stripe.com/session/123',
      };
      mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortalSession as any);

      const result = await stripeService.createBillingPortalSession({
        customerId: 'cus_123',
        returnUrl: 'http://localhost:3000/dashboard',
      });

      expect(result).toEqual(mockPortalSession);
      expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_123',
        return_url: 'http://localhost:3000/dashboard',
      });
    });
  });

  describe('Webhook Processing', () => {
    it('should verify webhook signature', () => {
      const payload = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'valid_signature';
      const event = { type: 'payment_intent.succeeded', data: {} };

      mockStripe.webhooks.constructEvent.mockReturnValue(event as any);

      const result = stripeService.verifyWebhookSignature(payload, signature);

      expect(result).toEqual(event);
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    });

    it('should throw error for invalid webhook signature', () => {
      const payload = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'invalid_signature';

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Stripe.errors.StripeSignatureVerificationError(
          'Invalid signature',
          payload,
          signature
        );
      });

      expect(() => stripeService.verifyWebhookSignature(payload, signature)).toThrow(
        'Invalid signature'
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle API rate limit errors', async () => {
      mockStripe.customers.create.mockRejectedValue(
        new Stripe.errors.StripeRateLimitError({
          type: 'rate_limit_error',
          message: 'Too many requests',
        } as any)
      );

      await expect(
        stripeService.createCustomer({ email: 'test@example.com', userId: 'user-123' })
      ).rejects.toThrow('Too many requests');
    });

    it('should handle invalid request errors', async () => {
      mockStripe.subscriptions.create.mockRejectedValue(
        new Stripe.errors.StripeInvalidRequestError({
          type: 'invalid_request_error',
          message: 'Missing required parameter',
          param: 'customer',
        } as any)
      );

      await expect(
        stripeService.createSubscription({ customerId: '', priceId: 'price_123' })
      ).rejects.toThrow('Missing required parameter');
    });

    it('should handle authentication errors', async () => {
      mockStripe.customers.list.mockRejectedValue(
        new Stripe.errors.StripeAuthenticationError({
          type: 'authentication_error',
          message: 'Invalid API key',
        } as any)
      );

      await expect(stripeService.listCustomers({})).rejects.toThrow('Invalid API key');
    });
  });

  describe('Utility Methods', () => {
    describe('formatAmount', () => {
      it('should format amount for display', () => {
        expect(stripeService.formatAmount(2400, 'usd')).toBe('$24.00');
        expect(stripeService.formatAmount(9900, 'usd')).toBe('$99.00');
        expect(stripeService.formatAmount(10000, 'eur')).toBe('€100.00');
      });
    });

    describe('getPriceId', () => {
      it('should return correct price ID for plan', () => {
        const priceIds = {
          pro: stripeService.getPriceId('pro'),
          business: stripeService.getPriceId('business'),
          enterprise: stripeService.getPriceId('enterprise'),
        };

        expect(priceIds.pro).toMatch(/^price_/);
        expect(priceIds.business).toMatch(/^price_/);
        expect(priceIds.enterprise).toMatch(/^price_/);
      });

      it('should throw error for invalid plan', () => {
        expect(() => stripeService.getPriceId('invalid' as any)).toThrow();
      });
    });
  });

  describe('Promotional Features', () => {
    it('should check if promotion is active', () => {
      const isActive = stripeService.isPromotionActive();
      expect(typeof isActive).toBe('boolean');
    });

    it('should get promotion details', () => {
      const details = stripeService.getPromotionDetails();
      if (details) {
        expect(details).toHaveProperty('code');
        expect(details).toHaveProperty('description');
        expect(details).toHaveProperty('percentOff');
        expect(details).toHaveProperty('validUntil');
      }
    });
  });
});
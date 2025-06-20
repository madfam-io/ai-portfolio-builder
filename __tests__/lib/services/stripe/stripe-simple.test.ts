import Stripe from 'stripe';
import { AppError } from '@/types/errors';

// Mock stripe module
jest.mock('stripe');

// Mock environment - set before importing StripeService
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.STRIPE_PRO_PRICE_ID = 'price_pro_123';
process.env.STRIPE_BUSINESS_PRICE_ID = 'price_business_123';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Mock env module 
jest.mock('@/lib/config/env', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_123',
    STRIPE_WEBHOOK_SECRET: 'whsec_test_123',
  },
}));

// Import after mocks are set up
import { StripeService } from '@/lib/services/stripe/stripe';

describe('StripeService', () => {
  let stripeService: StripeService;
  let mockStripe: any;

  const mockCheckoutSession = {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/session/123',
    payment_status: 'unpaid',
  } as Stripe.Checkout.Session;

  const mockPortalSession = {
    id: 'bps_test_123',
    url: 'https://billing.stripe.com/session/123',
  } as Stripe.BillingPortal.Session;

  const mockEvent = {
    id: 'evt_test_123',
    type: 'payment_intent.succeeded',
    data: {
      object: {
        id: 'pi_test_123',
        amount: 1500,
      },
    },
  } as Stripe.Event;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Stripe instance
    mockStripe = {
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
      billingPortal: {
        sessions: {
          create: jest.fn(),
        },
      },
      webhooks: {
        constructEvent: jest.fn(),
      },
      customers: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
      },
      subscriptions: {
        create: jest.fn(),
        retrieve: jest.fn(),
        update: jest.fn(),
        cancel: jest.fn(),
      },
    };

    // Mock Stripe constructor
    (Stripe as unknown as jest.Mock).mockImplementation(() => mockStripe);
    
    // Create service instance
    stripeService = new StripeService();
  });

  describe('isAvailable', () => {
    it('should return true when Stripe is configured', () => {
      expect(stripeService.isAvailable()).toBe(true);
    });

    it('should return false when Stripe key is missing', () => {
      delete process.env.STRIPE_SECRET_KEY;
      const service = new StripeService();
      expect(service.isAvailable()).toBe(false);
    });
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session for paid plan', async () => {
      mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession);

      const result = await stripeService.createCheckoutSession({
        userId: 'user_123',
        userEmail: 'test@example.com',
        planId: 'pro',
        successUrl: 'http://localhost:3000/success',
        cancelUrl: 'http://localhost:3000/cancel',
      });

      expect(result).toEqual(mockCheckoutSession);
      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_pro_123',
            quantity: 1,
          },
        ],
        customer_email: 'test@example.com',
        client_reference_id: 'user_123',
        success_url: 'http://localhost:3000/success',
        cancel_url: 'http://localhost:3000/cancel',
        subscription_data: {
          trial_period_days: undefined,
          metadata: {
            userId: 'user_123',
            planId: 'pro',
          },
        },
        metadata: {
          userId: 'user_123',
          planId: 'pro',
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        tax_id_collection: {
          enabled: true,
        },
      });
    });

    it('should throw error for free plan', async () => {
      await expect(
        stripeService.createCheckoutSession({
          userId: 'user_123',
          userEmail: 'test@example.com',
          planId: 'free',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel',
        })
      ).rejects.toThrow();
    });
  });

  describe('createPortalSession', () => {
    it('should create customer portal session', async () => {
      mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortalSession);

      const result = await stripeService.createPortalSession({
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

  describe('verifyWebhookSignature', () => {
    it('should verify valid webhook signature', () => {
      const payload = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'valid_signature';

      mockStripe.webhooks.constructEvent.mockReturnValue(mockEvent);

      const result = stripeService.verifyWebhookSignature(payload, signature);

      expect(result).toEqual(mockEvent);
      expect(mockStripe.webhooks.constructEvent).toHaveBeenCalledWith(
        payload,
        signature,
        undefined // webhook secret is not set in test env
      );
    });

    it('should throw error for invalid signature', () => {
      const payload = JSON.stringify({ type: 'payment_intent.succeeded' });
      const signature = 'invalid_signature';

      mockStripe.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      expect(() => stripeService.verifyWebhookSignature(payload, signature)).toThrow();
    });
  });
});
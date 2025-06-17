/**
 * Test suite for Enhanced Stripe Service
 */

import { enhancedStripeService, SUBSCRIPTION_PLANS, AI_CREDIT_PACKS, PROMOTIONAL_CONFIG } from '@/lib/services/stripe/stripe-enhanced';

// Mock Stripe
const mockStripe = {
  coupons: {
    list: jest.fn(),
    create: jest.fn(),
    retrieve: jest.fn(),
  },
  customers: {
    list: jest.fn(),
  },
  subscriptions: {
    list: jest.fn(),
  },
  checkout: {
    sessions: {
      create: jest.fn(),
    },
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripe);
});

jest.mock('@/lib/config/env', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_123',
  },
}));

describe('Enhanced Stripe Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Subscription Plans', () => {
    test('should have correct plan structure', () => {
      expect(SUBSCRIPTION_PLANS.free).toMatchObject({
        id: 'free',
        price: 0,
        features: expect.objectContaining({
          portfolios: 1,
          aiRequests: 3,
        }),
      });

      expect(SUBSCRIPTION_PLANS.pro).toMatchObject({
        id: 'pro',
        price: 1500,
        promotionalPrice: 750,
        features: expect.objectContaining({
          portfolios: 5,
          aiRequests: 50,
        }),
      });
    });

    test('should have promotional pricing for paid plans', () => {
      const paidPlans = ['pro', 'business', 'enterprise'] as const;
      
      paidPlans.forEach(planId => {
        const plan = SUBSCRIPTION_PLANS[planId];
        expect(plan.promotionalPrice).toBe(plan.price / 2);
      });
    });
  });

  describe('AI Credit Packs', () => {
    test('should have correct pack structure', () => {
      expect(AI_CREDIT_PACKS.small).toMatchObject({
        id: 'ai_pack_small',
        credits: 10,
        price: 500,
      });

      expect(AI_CREDIT_PACKS.medium.popularBadge).toBe(true);
    });

    test('should have value proposition (more credits = better value)', () => {
      const small = AI_CREDIT_PACKS.small;
      const large = AI_CREDIT_PACKS.large;
      
      const smallPricePerCredit = small.price / small.credits;
      const largePricePerCredit = large.price / large.credits;
      
      expect(largePricePerCredit).toBeLessThan(smallPricePerCredit);
    });
  });

  describe('Promotional Features', () => {
    test('should create promotional coupon when enabled', async () => {
      mockStripe.coupons.list.mockResolvedValue({ data: [] });
      mockStripe.coupons.create.mockResolvedValue({
        id: PROMOTIONAL_CONFIG.code,
        percent_off: PROMOTIONAL_CONFIG.discountPercentage,
      });

      // Initialize service (which should create coupon)
      const service = new (enhancedStripeService.constructor as any)();
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async init

      expect(mockStripe.coupons.create).toHaveBeenCalledWith({
        id: PROMOTIONAL_CONFIG.code,
        percent_off: PROMOTIONAL_CONFIG.discountPercentage,
        duration: 'repeating',
        duration_in_months: PROMOTIONAL_CONFIG.durationMonths,
        max_redemptions: PROMOTIONAL_CONFIG.maxRedemptions,
        redeem_by: expect.any(Number),
        metadata: expect.any(Object),
      });
    });
  });

  describe('Checkout Sessions', () => {
    test('should create checkout session with promotional discount', async () => {
      const mockSession = { id: 'cs_test_123', url: 'https://checkout.stripe.com/...' };
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const session = await enhancedStripeService.createCheckoutSession({
        planId: 'pro',
        userId: 'user_123',
        userEmail: 'test@example.com',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
        applyPromotion: true,
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'subscription',
          discounts: expect.arrayContaining([
            expect.objectContaining({
              coupon: expect.any(String),
            }),
          ]),
          custom_fields: expect.any(Array),
        })
      );

      expect(session).toEqual(mockSession);
    });

    test('should create AI credit pack checkout', async () => {
      const mockSession = { id: 'cs_test_456', url: 'https://checkout.stripe.com/...' };
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);

      const session = await enhancedStripeService.createAICreditCheckout({
        packId: 'medium',
        userId: 'user_123',
        userEmail: 'test@example.com',
        successUrl: 'https://app.com/success',
        cancelUrl: 'https://app.com/cancel',
      });

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          mode: 'payment',
          metadata: expect.objectContaining({
            type: 'ai_credit_pack',
            credits: '25',
          }),
        })
      );

      expect(session).toEqual(mockSession);
    });
  });

  describe('Promotional Eligibility', () => {
    test('should check promotional eligibility correctly', async () => {
      const mockCoupon = {
        id: PROMOTIONAL_CONFIG.code,
        max_redemptions: PROMOTIONAL_CONFIG.maxRedemptions,
        times_redeemed: 50,
      };
      
      mockStripe.coupons.retrieve.mockResolvedValue(mockCoupon);
      mockStripe.customers.list.mockResolvedValue({ data: [] });

      const eligibility = await enhancedStripeService.checkPromotionalEligibility('new@example.com');

      expect(eligibility.eligible).toBe(true);
      expect(eligibility.remainingSlots).toBe(50);
    });

    test('should reject eligibility when promotion is fully redeemed', async () => {
      const mockCoupon = {
        id: PROMOTIONAL_CONFIG.code,
        max_redemptions: 100,
        times_redeemed: 100,
      };
      
      mockStripe.coupons.retrieve.mockResolvedValue(mockCoupon);

      const eligibility = await enhancedStripeService.checkPromotionalEligibility('test@example.com');

      expect(eligibility.eligible).toBe(false);
      expect(eligibility.reason).toBe('Promotion fully redeemed');
    });
  });

  describe('Plan Features', () => {
    test('should return enhanced plan features', () => {
      const features = enhancedStripeService.getEnhancedPlanFeatures('pro');

      expect(features).toMatchObject({
        portfolios: 5,
        aiRequests: 50,
        customDomain: true,
        limitations: expect.objectContaining({
          monthlyPageViews: 10000,
          storageGB: 5,
        }),
        price: 1500,
        promotionalPrice: 750,
      });
    });

    test('should throw error for invalid plan', () => {
      expect(() => {
        enhancedStripeService.getEnhancedPlanFeatures('invalid' as any);
      }).toThrow('Invalid plan ID: invalid');
    });
  });

  describe('Usage Statistics', () => {
    test('should get user usage stats', async () => {
      const mockSubscription = {
        current_period_start: Math.floor(Date.now() / 1000) - 86400,
        current_period_end: Math.floor(Date.now() / 1000) + 86400,
      };

      mockStripe.subscriptions.list.mockResolvedValue({
        data: [mockSubscription],
      });

      const stats = await enhancedStripeService.getUserUsageStats('cus_123');

      expect(stats).toMatchObject({
        currentPeriodStart: expect.any(Date),
        currentPeriodEnd: expect.any(Date),
        portfoliosCreated: 0,
        aiRequestsUsed: 0,
      });
    });

    test('should return null for users without subscription', async () => {
      mockStripe.subscriptions.list.mockResolvedValue({ data: [] });

      const stats = await enhancedStripeService.getUserUsageStats('cus_123');

      expect(stats).toBeNull();
    });
  });
});

// Integration tests
describe('Enhanced Stripe Service Integration', () => {
  test('should handle complete subscription flow', async () => {
    // Mock successful coupon creation
    mockStripe.coupons.list.mockResolvedValue({ data: [] });
    mockStripe.coupons.create.mockResolvedValue({
      id: PROMOTIONAL_CONFIG.code,
    });

    // Mock successful checkout session creation
    mockStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/pay/cs_test_123',
    });

    // Create service instance
    const service = enhancedStripeService;

    // Create checkout session
    const session = await service.createCheckoutSession({
      planId: 'pro',
      userId: 'user_123',
      userEmail: 'test@example.com',
      successUrl: 'https://app.com/success',
      cancelUrl: 'https://app.com/cancel',
      applyPromotion: true,
    });

    expect(session.id).toBe('cs_test_123');
    expect(session.url).toContain('checkout.stripe.com');
  });
});
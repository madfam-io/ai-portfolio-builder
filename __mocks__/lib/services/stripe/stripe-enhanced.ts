/**
 * Mock Enhanced Stripe Service for testing
 */

export const PROMOTIONAL_CONFIG = {
  enabled: true,
  discountPercentage: 50,
  durationMonths: 3,
  maxRedemptions: 100,
  code: 'EARLY50',
  description: '50% off for the first 3 months - Limited to first 100 customers!',
  validUntil: new Date('2025-12-31'),
};

export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    originalPrice: 0,
    features: {
      portfolios: 1,
      aiRequests: 3,
      customDomain: false,
      analytics: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1500,
    originalPrice: 1500,
    promotionalPrice: 750,
    features: {
      portfolios: 5,
      aiRequests: 50,
      customDomain: true,
      analytics: true,
    },
  },
};

const mockEnhancedStripeService = {
  isAvailable: jest.fn().mockReturnValue(true),
  createCheckoutSession: jest.fn().mockResolvedValue({
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/pay/cs_test_123',
  }),
  createAICreditCheckout: jest.fn().mockResolvedValue({
    id: 'cs_test_456',
    url: 'https://checkout.stripe.com/pay/cs_test_456',
  }),
  getUserUsageStats: jest.fn().mockResolvedValue({
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    portfoliosCreated: 2,
    aiRequestsUsed: 15,
    storageUsedGB: 1.2,
    bandwidthUsedGB: 5.5,
  }),
  checkPromotionalEligibility: jest.fn().mockResolvedValue({
    eligible: true,
    remainingSlots: 75,
  }),
  getEnhancedPlanFeatures: jest.fn().mockImplementation((planId) => 
    SUBSCRIPTION_PLANS[planId as keyof typeof SUBSCRIPTION_PLANS]
  ),
};

export const enhancedStripeService = mockEnhancedStripeService;

export const formatPriceWithPromotion = jest.fn().mockImplementation(
  (amount, promotionalAmount) => ({
    original: `$${(amount / 100).toFixed(2)}`,
    promotional: promotionalAmount ? `$${(promotionalAmount / 100).toFixed(2)}` : undefined,
    savings: promotionalAmount ? `$${((amount - promotionalAmount) / 100).toFixed(2)}` : undefined,
  })
);

export const calculatePromotionalEndDate = jest.fn().mockImplementation(() => {
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3);
  return endDate;
});

export default mockEnhancedStripeService;
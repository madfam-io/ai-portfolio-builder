/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Unified Pricing Configuration
 *
 * Single source of truth for all pricing across the application.
 * This ensures consistency between frontend display, backend processing,
 * and payment gateway configurations.
 */

export interface TierPricing {
  monthly: number; // Price in cents
  yearly: number; // Price in cents (with 20% discount)
  promotional?: {
    monthly: number; // Promotional price in cents
    yearly: number; // Promotional yearly price in cents
    discountPercentage: number;
    validUntil: Date;
    code: string;
  };
}

export interface TierFeatures {
  portfolios: number; // -1 for unlimited
  aiRequests: number; // -1 for unlimited
  customDomain: boolean;
  analytics: boolean;
  prioritySupport: boolean;
  templates: string[];
  exportFormats: string[];
  seoOptimization: boolean;
  customBranding: boolean;
  teamMembers?: number;
  whiteLabel?: boolean;
  apiAccess?: boolean;
  sla?: boolean;
  dedicatedSupport?: boolean;
}

export interface TierLimitations {
  monthlyPageViews: number; // -1 for unlimited
  storageGB: number; // -1 for unlimited
  bandwidthGB: number; // -1 for unlimited
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  pricing: TierPricing;
  features: TierFeatures;
  limitations: TierLimitations;
  stripePriceIds: {
    monthly?: string;
    yearly?: string;
    monthlyPromo?: string;
    yearlyPromo?: string;
  };
  popularBadge?: boolean;
  enterpriseBadge?: boolean;
}

/**
 * Unified pricing configuration - single source of truth
 */
export const UNIFIED_PRICING_CONFIG = {
  // Global settings
  currency: 'USD',
  baseCurrency: 'USD',
  yearlyDiscountPercentage: 20,

  // Active promotional campaign
  promotion: {
    enabled: true,
    code: 'EARLY50',
    discountPercentage: 50,
    durationMonths: 3,
    maxRedemptions: 100,
    validUntil: new Date('2025-12-31'),
    description:
      '50% off for the first 3 months - Limited to first 100 customers!',
  },

  // Subscription tiers
  tiers: {
    free: {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started',
      pricing: {
        monthly: 0,
        yearly: 0,
      },
      features: {
        portfolios: 1,
        aiRequests: 3,
        customDomain: false,
        analytics: false,
        prioritySupport: false,
        templates: ['basic'],
        exportFormats: ['pdf'],
        seoOptimization: false,
        customBranding: false,
      },
      limitations: {
        monthlyPageViews: 1000,
        storageGB: 0.5,
        bandwidthGB: 1,
      },
      stripePriceIds: {},
    } as SubscriptionTier,

    pro: {
      id: 'pro',
      name: 'Pro',
      description: 'For professionals ready to grow',
      pricing: {
        monthly: 2400, // $24/month
        yearly: 23040, // $230.40/year (20% discount)
        promotional: {
          monthly: 1200, // $12/month
          yearly: 11520, // $115.20/year
          discountPercentage: 50,
          validUntil: new Date('2025-12-31'),
          code: 'EARLY50',
        },
      },
      features: {
        portfolios: 5,
        aiRequests: 50,
        customDomain: true,
        analytics: true,
        prioritySupport: false,
        templates: ['basic', 'professional', 'creative'],
        exportFormats: ['pdf', 'png', 'html'],
        seoOptimization: true,
        customBranding: false,
      },
      limitations: {
        monthlyPageViews: 10000,
        storageGB: 5,
        bandwidthGB: 20,
      },
      stripePriceIds: {
        monthly: process.env.STRIPE_PRO_PRICE_ID,
        yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
        monthlyPromo: process.env.STRIPE_PRO_PROMO_PRICE_ID,
        yearlyPromo: process.env.STRIPE_PRO_YEARLY_PROMO_PRICE_ID,
      },
      popularBadge: true,
    } as SubscriptionTier,

    business: {
      id: 'business',
      name: 'Business',
      description: 'Scale your business with advanced features',
      pricing: {
        monthly: 3900, // $39/month
        yearly: 37440, // $374.40/year (20% discount)
        promotional: {
          monthly: 1950, // $19.50/month
          yearly: 18720, // $187.20/year
          discountPercentage: 50,
          validUntil: new Date('2025-12-31'),
          code: 'EARLY50',
        },
      },
      features: {
        portfolios: 25,
        aiRequests: 200,
        customDomain: true,
        analytics: true,
        prioritySupport: true,
        templates: ['all'],
        exportFormats: ['all'],
        seoOptimization: true,
        customBranding: true,
        teamMembers: 3,
        whiteLabel: false,
      },
      limitations: {
        monthlyPageViews: 50000,
        storageGB: 20,
        bandwidthGB: 100,
      },
      stripePriceIds: {
        monthly: process.env.STRIPE_BUSINESS_PRICE_ID,
        yearly: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
        monthlyPromo: process.env.STRIPE_BUSINESS_PROMO_PRICE_ID,
        yearlyPromo: process.env.STRIPE_BUSINESS_YEARLY_PROMO_PRICE_ID,
      },
    } as SubscriptionTier,

    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Ultimate power for large organizations',
      pricing: {
        monthly: 7900, // $79/month
        yearly: 75840, // $758.40/year (20% discount)
        promotional: {
          monthly: 3950, // $39.50/month
          yearly: 37920, // $379.20/year
          discountPercentage: 50,
          validUntil: new Date('2025-12-31'),
          code: 'EARLY50',
        },
      },
      features: {
        portfolios: -1, // unlimited
        aiRequests: -1, // unlimited
        customDomain: true,
        analytics: true,
        prioritySupport: true,
        templates: ['all', 'custom'],
        exportFormats: ['all'],
        seoOptimization: true,
        customBranding: true,
        teamMembers: -1, // unlimited
        whiteLabel: true,
        apiAccess: true,
        sla: true,
        dedicatedSupport: true,
      },
      limitations: {
        monthlyPageViews: -1, // unlimited
        storageGB: -1, // unlimited
        bandwidthGB: -1, // unlimited
      },
      stripePriceIds: {
        monthly: process.env.STRIPE_ENTERPRISE_PRICE_ID,
        yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
        monthlyPromo: process.env.STRIPE_ENTERPRISE_PROMO_PRICE_ID,
        yearlyPromo: process.env.STRIPE_ENTERPRISE_YEARLY_PROMO_PRICE_ID,
      },
      enterpriseBadge: true,
    } as SubscriptionTier,
  },

  // AI Credit Packs for expansion revenue
  aiCreditPacks: {
    small: {
      id: 'ai_pack_small',
      name: 'Small AI Pack',
      credits: 10,
      price: 500, // $5.00
      stripePriceId: process.env.STRIPE_AI_PACK_SMALL_ID,
    },
    medium: {
      id: 'ai_pack_medium',
      name: 'Medium AI Pack',
      credits: 25,
      price: 1000, // $10.00
      stripePriceId: process.env.STRIPE_AI_PACK_MEDIUM_ID,
      popularBadge: true,
    },
    large: {
      id: 'ai_pack_large',
      name: 'Large AI Pack',
      credits: 60,
      price: 2000, // $20.00
      stripePriceId: process.env.STRIPE_AI_PACK_LARGE_ID,
    },
  },

  // Currency conversion rates (for display purposes)
  // Actual payment processing happens in USD via Stripe
  displayCurrencies: {
    USD: { symbol: '$', rate: 1 },
    EUR: { symbol: '€', rate: 0.85 },
    GBP: { symbol: '£', rate: 0.73 },
    MXN: { symbol: '$', rate: 17.86 },
    BRL: { symbol: 'R$', rate: 5.0 },
    INR: { symbol: '₹', rate: 83 },
    JPY: { symbol: '¥', rate: 150 },
    CNY: { symbol: '¥', rate: 7.2 },
  },
};

/**
 * Helper functions for pricing calculations
 */
export const PricingHelpers = {
  /**
   * Format price for display
   */
  formatPrice(amountInCents: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amountInCents / 100);
  },

  /**
   * Calculate yearly price with discount
   */
  calculateYearlyPrice(
    monthlyPriceInCents: number,
    discountPercentage = 20
  ): number {
    const yearlyBase = monthlyPriceInCents * 12;
    const discount = yearlyBase * (discountPercentage / 100);
    return Math.round(yearlyBase - discount);
  },

  /**
   * Get tier by ID
   */
  getTierById(tierId: string): SubscriptionTier | null {
    return (
      UNIFIED_PRICING_CONFIG.tiers[
        tierId as keyof typeof UNIFIED_PRICING_CONFIG.tiers
      ] || null
    );
  },

  /**
   * Check if promotional pricing is active
   */
  isPromotionActive(): boolean {
    const { promotion } = UNIFIED_PRICING_CONFIG;
    return promotion.enabled && new Date() <= promotion.validUntil;
  },

  /**
   * Get effective price (with or without promotion)
   */
  getEffectivePrice(
    tierId: string,
    interval: 'monthly' | 'yearly',
    applyPromotion = true
  ): number {
    const tier = this.getTierById(tierId);
    if (!tier) return 0;

    if (
      applyPromotion &&
      this.isPromotionActive() &&
      tier.pricing.promotional
    ) {
      return interval === 'monthly'
        ? tier.pricing.promotional.monthly
        : tier.pricing.promotional.yearly;
    }

    return interval === 'monthly' ? tier.pricing.monthly : tier.pricing.yearly;
  },

  /**
   * Convert price to display currency
   */
  convertToDisplayCurrency(
    amountInCents: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    const currencies = UNIFIED_PRICING_CONFIG.displayCurrencies;

    if (fromCurrency === toCurrency) return amountInCents;

    const fromRate =
      currencies[fromCurrency as keyof typeof currencies]?.rate || 1;
    const toRate = currencies[toCurrency as keyof typeof currencies]?.rate || 1;

    // Convert to USD first, then to target currency
    const usdAmount = amountInCents / fromRate;
    return Math.round(usdAmount * toRate);
  },
};

// Type exports
export type TierID = keyof typeof UNIFIED_PRICING_CONFIG.tiers;
export type AICreditPackID = keyof typeof UNIFIED_PRICING_CONFIG.aiCreditPacks;
export type DisplayCurrency =
  keyof typeof UNIFIED_PRICING_CONFIG.displayCurrencies;

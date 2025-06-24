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
 * Enhanced Stripe service with promotional pricing and improved features
 * Phase 1: Immediate Revenue Activation
 */

import Stripe from 'stripe';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/types/errors';

/**
 * Promotional configuration
 */
export const PROMOTIONAL_CONFIG = {
  enabled: true,
  discountPercentage: 50,
  durationMonths: 3,
  maxRedemptions: 100,
  code: 'EARLY50',
  description:
    '50% off for the first 3 months - Limited to first 100 customers!',
  validUntil: new Date('2025-12-31'),
};

/**
 * Enhanced subscription plan definitions with promotional pricing
 */
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    originalPrice: 0,
    currency: 'usd',
    interval: 'month' as const,
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
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 2400, // $24.00 in cents
    originalPrice: 2400,
    promotionalPrice: 1200, // $12.00 with 50% discount
    yearlyPrice: 23040, // $230.40 yearly (20% discount)
    yearlyPromotionalPrice: 11520, // $115.20 yearly with promo
    currency: 'usd',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID,
    stripePromoPriceId: process.env.STRIPE_PRO_PROMO_PRICE_ID,
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
    popularBadge: true,
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 3900, // $39.00 in cents
    originalPrice: 3900,
    promotionalPrice: 1950, // $19.50 with 50% discount
    yearlyPrice: 37440, // $374.40 yearly (20% discount)
    yearlyPromotionalPrice: 18720, // $187.20 yearly with promo
    currency: 'usd',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID,
    stripePromoPriceId: process.env.STRIPE_BUSINESS_PROMO_PRICE_ID,
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
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 7900, // $79.00 in cents
    originalPrice: 7900,
    promotionalPrice: 3950, // $39.50 with 50% discount
    yearlyPrice: 75840, // $758.40 yearly (20% discount)
    yearlyPromotionalPrice: 37920, // $379.20 yearly with promo
    currency: 'usd',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    stripeYearlyPriceId: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID,
    stripePromoPriceId: process.env.STRIPE_ENTERPRISE_PROMO_PRICE_ID,
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
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

/**
 * AI Credit Packs for additional revenue
 */
export const AI_CREDIT_PACKS = {
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
} as const;

export type AICreditPack = keyof typeof AI_CREDIT_PACKS;

/**
 * Enhanced Stripe client with promotional features
 */
class EnhancedStripeService {
  private stripe: Stripe | null = null;
  private initialized = false;
  private promotionId: string | null = null;

  constructor() {
    this.initializeStripe();
  }

  private async initializeStripe() {
    // Skip initialization during build process
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      logger.info('Skipping Stripe initialization during build');
      return;
    }

    if (!env.STRIPE_SECRET_KEY) {
      logger.warn('Stripe secret key not found, payments will be unavailable');
      return;
    }

    try {
      this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-05-28.basil',
        typescript: true,
      });
      this.initialized = true;

      // Create promotional coupon if enabled
      if (PROMOTIONAL_CONFIG.enabled) {
        await this.ensurePromotionalCoupon();
      }

      logger.info('Enhanced Stripe service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Stripe service', { error });
      throw new AppError(
        'STRIPE_INIT_FAILED',
        'Failed to initialize payment service',
        500
      );
    }
  }

  /**
   * Ensure promotional coupon exists
   */
  private async ensurePromotionalCoupon() {
    if (!this.stripe) return;

    try {
      // Check if coupon already exists
      const coupons = await this.stripe.coupons.list({ limit: 100 });
      const existingCoupon = coupons.data.find(
        c => c.id === PROMOTIONAL_CONFIG.code
      );

      if (!existingCoupon) {
        // Create new promotional coupon
        const coupon = await this.stripe.coupons.create({
          id: PROMOTIONAL_CONFIG.code,
          percent_off: PROMOTIONAL_CONFIG.discountPercentage,
          duration: 'repeating',
          duration_in_months: PROMOTIONAL_CONFIG.durationMonths,
          max_redemptions: PROMOTIONAL_CONFIG.maxRedemptions,
          redeem_by: Math.floor(PROMOTIONAL_CONFIG.validUntil.getTime() / 1000),
          metadata: {
            campaign: 'early_adopter',
            description: PROMOTIONAL_CONFIG.description,
          },
        });

        this.promotionId = coupon.id;
        logger.info('Promotional coupon created', { couponId: coupon.id });
      } else {
        this.promotionId = existingCoupon.id;
        logger.info('Promotional coupon already exists', {
          couponId: existingCoupon.id,
        });
      }
    } catch (error) {
      logger.error('Failed to create promotional coupon', { error });
    }
  }

  /**
   * Check if Stripe is available
   */
  public isAvailable(): boolean {
    return this.initialized && this.stripe !== null;
  }

  /**
   * Get Stripe instance (throws if not available)
   */
  private getStripe(): Stripe {
    if (!this.stripe) {
      throw new AppError(
        'STRIPE_NOT_AVAILABLE',
        'Payment service is not available',
        503
      );
    }
    return this.stripe;
  }

  /**
   * Create an enhanced checkout session with promotional pricing
   */
  public async createCheckoutSession({
    planId,
    userId,
    userEmail,
    successUrl,
    cancelUrl,
    applyPromotion = true,
    metadata = {},
  }: {
    planId: SubscriptionPlan;
    userId: string;
    userEmail: string;
    successUrl: string;
    cancelUrl: string;
    applyPromotion?: boolean;
    metadata?: Record<string, string>;
  }): Promise<Stripe.Checkout.Session> {
    if (planId === 'free') {
      throw new AppError(
        'INVALID_PLAN',
        'Cannot create checkout session for free plan',
        400
      );
    }

    const stripe = this.getStripe();
    const plan = SUBSCRIPTION_PLANS[planId];

    if (!plan.stripePriceId) {
      throw new AppError(
        'PRICE_ID_NOT_FOUND',
        `Price ID not configured for plan: ${planId}`,
        500
      );
    }

    try {
      const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        customer_email: userEmail,
        client_reference_id: userId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          metadata: {
            userId,
            planId,
            ...metadata,
          },
        },
        metadata: {
          userId,
          planId,
          ...metadata,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        tax_id_collection: {
          enabled: true,
        },
        // Custom fields for better UX
        custom_fields: [
          {
            key: 'company_name',
            label: {
              type: 'custom',
              custom: 'Company Name (Optional)',
            },
            type: 'text',
            optional: true,
          },
        ],
      };

      // Apply promotional discount if enabled and applicable
      if (applyPromotion && PROMOTIONAL_CONFIG.enabled && this.promotionId) {
        sessionConfig.discounts = [
          {
            coupon: this.promotionId,
          },
        ];
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      logger.info('Enhanced checkout session created', {
        sessionId: session.id,
        userId,
        planId,
        amount: plan.price,
        promotional: applyPromotion && PROMOTIONAL_CONFIG.enabled,
      });

      return session;
    } catch (error) {
      logger.error('Failed to create checkout session', {
        error,
        userId,
        planId,
      });
      throw new AppError(
        'CHECKOUT_SESSION_FAILED',
        'Failed to create checkout session',
        500
      );
    }
  }

  /**
   * Create checkout session for AI credit packs
   */
  public async createAICreditCheckout({
    packId,
    userId,
    userEmail,
    successUrl,
    cancelUrl,
  }: {
    packId: AICreditPack;
    userId: string;
    userEmail: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const stripe = this.getStripe();
    const pack = AI_CREDIT_PACKS[packId];

    if (!pack.stripePriceId) {
      throw new AppError(
        'PRICE_ID_NOT_FOUND',
        `Price ID not configured for AI pack: ${packId}`,
        500
      );
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: pack.stripePriceId,
            quantity: 1,
          },
        ],
        customer_email: userEmail,
        client_reference_id: userId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          packId,
          credits: pack.credits.toString(),
          type: 'ai_credit_pack',
        },
        payment_intent_data: {
          metadata: {
            userId,
            packId,
            credits: pack.credits.toString(),
            type: 'ai_credit_pack',
          },
        },
      });

      logger.info('AI credit pack checkout session created', {
        sessionId: session.id,
        userId,
        packId,
        credits: pack.credits,
      });

      return session;
    } catch (error) {
      logger.error('Failed to create AI credit checkout session', {
        error,
        userId,
        packId,
      });
      throw new AppError(
        'CHECKOUT_SESSION_FAILED',
        'Failed to create checkout session for AI credits',
        500
      );
    }
  }

  /**
   * Get usage statistics for a user
   */
  public async getUserUsageStats(customerId: string): Promise<{
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    portfoliosCreated: number;
    aiRequestsUsed: number;
    storageUsedGB: number;
    bandwidthUsedGB: number;
  } | null> {
    const stripe = this.getStripe();

    try {
      // Get active subscription
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
      });

      if (subscriptions.data.length === 0) {
        return null;
      }

      const subscription = subscriptions.data[0];
      if (!subscription) {
        return null;
      }

      // In a real implementation, these would come from your database
      // This is a placeholder showing the structure
      return {
        currentPeriodStart: new Date(
          (subscription as any).current_period_start * 1000
        ),
        currentPeriodEnd: new Date(
          (subscription as any).current_period_end * 1000
        ),
        portfoliosCreated: 0, // Get from database
        aiRequestsUsed: 0, // Get from database
        storageUsedGB: 0, // Get from storage service
        bandwidthUsedGB: 0, // Get from CDN/analytics
      };
    } catch (error) {
      logger.error('Failed to get user usage stats', { error, customerId });
      return null;
    }
  }

  /**
   * Check promotional eligibility
   */
  public async checkPromotionalEligibility(userEmail: string): Promise<{
    eligible: boolean;
    reason?: string;
    remainingSlots?: number;
  }> {
    if (!PROMOTIONAL_CONFIG.enabled) {
      return { eligible: false, reason: 'Promotion not active' };
    }

    const stripe = this.getStripe();

    try {
      // Check if promotion is still valid
      if (new Date() > PROMOTIONAL_CONFIG.validUntil) {
        return { eligible: false, reason: 'Promotion expired' };
      }

      // Check remaining redemptions
      if (!this.promotionId) {
        return { eligible: false, reason: 'Promotion not configured' };
      }

      const coupon = await stripe.coupons.retrieve(this.promotionId);
      const remainingSlots = coupon.max_redemptions
        ? coupon.max_redemptions - (coupon.times_redeemed || 0)
        : null;

      if (remainingSlots !== null && remainingSlots <= 0) {
        return { eligible: false, reason: 'Promotion fully redeemed' };
      }

      // Check if user already used the promotion
      const hasUsedPromo = await this.checkUserPromoUsage(stripe, userEmail);
      if (hasUsedPromo) {
        return { eligible: false, reason: 'Already used promotion' };
      }

      return {
        eligible: true,
        remainingSlots: remainingSlots || undefined,
      };
    } catch (error) {
      logger.error('Failed to check promotional eligibility', { error });
      return { eligible: false, reason: 'Error checking eligibility' };
    }
  }

  /**
   * Check if user has already used the promotion
   */
  private async checkUserPromoUsage(
    stripe: Stripe,
    userEmail: string
  ): Promise<boolean> {
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return false;
    }

    const customer = customers.data[0];
    if (!customer) {
      return false;
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 100,
    });

    return subscriptions.data.some(sub =>
      sub.discounts?.some(
        d => typeof d !== 'string' && d.coupon?.id === this.promotionId
      )
    );
  }

  // ... Include all other methods from the original stripe.ts file ...

  /**
   * Get enhanced plan features with usage limits
   */
  public getEnhancedPlanFeatures(planId: SubscriptionPlan) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new AppError('INVALID_PLAN', `Invalid plan ID: ${planId}`, 400);
    }
    return {
      ...plan.features,
      limitations: plan.limitations,
      price: plan.price,
      promotionalPrice:
        'promotionalPrice' in plan ? plan.promotionalPrice : undefined,
    };
  }
}

/**
 * Singleton instance
 */
export const enhancedStripeService = new EnhancedStripeService();

/**
 * Helper function to format price with promotional display
 */
export function formatPriceWithPromotion(
  amount: number,
  promotionalAmount?: number,
  currency = 'usd'
): {
  original: string;
  promotional?: string;
  savings?: string;
} {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  });

  const result: any = {
    original: formatter.format(amount / 100),
  };

  if (promotionalAmount !== undefined) {
    result.promotional = formatter.format(promotionalAmount / 100);
    result.savings = formatter.format((amount - promotionalAmount) / 100);
  }

  return result;
}

/**
 * Calculate promotional end date for a user
 */
export function calculatePromotionalEndDate(): Date {
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + PROMOTIONAL_CONFIG.durationMonths);
  return endDate;
}

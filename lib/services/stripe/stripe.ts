/**
 * Stripe service for handling payments and subscriptions
 *
 * This service provides a clean abstraction over Stripe's API,
 * including subscription management, checkout sessions, and webhooks.
 */

import Stripe from 'stripe';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/types/errors';

/**
 * Subscription plan definitions
 */
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'month' as const,
    features: {
      portfolios: 1,
      aiRequests: 3,
      customDomain: false,
      analytics: false,
      prioritySupport: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1500, // $15.00 in cents
    currency: 'usd',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      portfolios: 5,
      aiRequests: 50,
      customDomain: true,
      analytics: true,
      prioritySupport: false,
    },
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 3900, // $39.00 in cents
    currency: 'usd',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_BUSINESS_PRICE_ID,
    features: {
      portfolios: 25,
      aiRequests: 200,
      customDomain: true,
      analytics: true,
      prioritySupport: true,
    },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 7900, // $79.00 in cents
    currency: 'usd',
    interval: 'month' as const,
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      portfolios: -1, // unlimited
      aiRequests: -1, // unlimited
      customDomain: true,
      analytics: true,
      prioritySupport: true,
    },
  },
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

/**
 * Stripe client initialization
 */
class StripeService {
  private stripe: Stripe | null = null;
  private initialized = false;

  constructor() {
    this.initializeStripe();
  }

  private initializeStripe() {
    if (!env.STRIPE_SECRET_KEY) {
      logger.warn('Stripe secret key not found, payments will be unavailable');
      return;
    }

    try {
      this.stripe = new Stripe(env.STRIPE_SECRET_KEY, {
        apiVersion: '2024-06-20',
        typescript: true,
      });
      this.initialized = true;
      logger.info('Stripe service initialized successfully');
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
   * Create a checkout session for subscription
   */
  public async createCheckoutSession({
    planId,
    userId,
    userEmail,
    successUrl,
    cancelUrl,
    trialDays = 7,
  }: {
    planId: SubscriptionPlan;
    userId: string;
    userEmail: string;
    successUrl: string;
    cancelUrl: string;
    trialDays?: number;
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
      const session = await stripe.checkout.sessions.create({
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
          trial_period_days: trialDays,
          metadata: {
            userId,
            planId,
          },
        },
        metadata: {
          userId,
          planId,
        },
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        tax_id_collection: {
          enabled: true,
        },
      });

      logger.info('Checkout session created', {
        sessionId: session.id,
        userId,
        planId,
        amount: plan.price,
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
   * Create a customer portal session
   */
  public async createPortalSession({
    customerId,
    returnUrl,
  }: {
    customerId: string;
    returnUrl: string;
  }): Promise<Stripe.BillingPortal.Session> {
    const stripe = this.getStripe();

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      logger.info('Portal session created', {
        customerId,
        sessionId: session.id,
      });
      return session;
    } catch (error) {
      logger.error('Failed to create portal session', { error, customerId });
      throw new AppError(
        'PORTAL_SESSION_FAILED',
        'Failed to create portal session',
        500
      );
    }
  }

  /**
   * Get customer by ID
   */
  public async getCustomer(
    customerId: string
  ): Promise<Stripe.Customer | null> {
    const stripe = this.getStripe();

    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer.deleted ? null : (customer as Stripe.Customer);
    } catch (error) {
      logger.error('Failed to retrieve customer', { error, customerId });
      return null;
    }
  }

  /**
   * Get subscription by ID
   */
  public async getSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription | null> {
    const stripe = this.getStripe();

    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('Failed to retrieve subscription', {
        error,
        subscriptionId,
      });
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  public async cancelSubscription(
    subscriptionId: string
  ): Promise<Stripe.Subscription> {
    const stripe = this.getStripe();

    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      logger.info('Subscription cancelled', { subscriptionId });
      return subscription;
    } catch (error) {
      logger.error('Failed to cancel subscription', { error, subscriptionId });
      throw new AppError(
        'SUBSCRIPTION_CANCEL_FAILED',
        'Failed to cancel subscription',
        500
      );
    }
  }

  /**
   * Verify webhook signature
   */
  public verifyWebhookSignature(
    payload: string,
    signature: string
  ): Stripe.Event {
    const stripe = this.getStripe();

    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new AppError(
        'WEBHOOK_SECRET_MISSING',
        'Webhook secret not configured',
        500
      );
    }

    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      throw new AppError(
        'WEBHOOK_VERIFICATION_FAILED',
        'Invalid webhook signature',
        400
      );
    }
  }

  /**
   * Get plan features for a given plan ID
   */
  public getPlanFeatures(planId: SubscriptionPlan) {
    const plan = SUBSCRIPTION_PLANS[planId];
    if (!plan) {
      throw new AppError('INVALID_PLAN', `Invalid plan ID: ${planId}`, 400);
    }
    return plan.features;
  }

  /**
   * Check if user has exceeded plan limits
   */
  public checkPlanLimits(
    planId: SubscriptionPlan,
    usage: {
      portfolios: number;
      aiRequests: number;
    }
  ): {
    canCreatePortfolio: boolean;
    canUseAI: boolean;
    portfolioLimit: number;
    aiRequestLimit: number;
  } {
    const features = this.getPlanFeatures(planId);

    return {
      canCreatePortfolio:
        features.portfolios === -1 || usage.portfolios < features.portfolios,
      canUseAI:
        features.aiRequests === -1 || usage.aiRequests < features.aiRequests,
      portfolioLimit: features.portfolios,
      aiRequestLimit: features.aiRequests,
    };
  }
}

/**
 * Singleton instance
 */
export const stripeService = new StripeService();

/**
 * Helper function to get plan by ID
 */
export function getPlan(planId: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[planId];
}

/**
 * Helper function to format price for display
 */
export function formatPrice(amount: number, currency = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

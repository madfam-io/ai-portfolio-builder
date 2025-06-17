/**
 * Client-side Stripe utilities
 *
 * Provides utilities for interacting with Stripe on the client side,
 * including checkout session creation and portal access.
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';

/**
 * Stripe promise for singleton instance
 */
let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    if (!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      logger.warn('Stripe publishable key not found');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  }

  return stripePromise;
}

/**
 * Check if Stripe is available
 */
export async function isStripeAvailable(): Promise<boolean> {
  const stripe = await getStripe();
  return stripe !== null;
}

/**
 * Create a checkout session and redirect to Stripe
 */
export async function createCheckoutSession({
  planId,
  trialDays = 7,
  billingInterval = 'monthly',
}: {
  planId: 'pro' | 'business' | 'enterprise';
  trialDays?: number;
  billingInterval?: 'monthly' | 'yearly';
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if Stripe is available
    if (!(await isStripeAvailable())) {
      return {
        success: false,
        error: 'Payment service is currently unavailable',
      };
    }

    // Create checkout session
    const response = await fetch('/api/v1/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        trialDays,
        billingInterval,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('Checkout session creation failed', {
        status: response.status,
        error: data.error,
      });
      return {
        success: false,
        error: data.error || 'Failed to create checkout session',
      };
    }

    // Redirect to Stripe checkout
    const stripe = await getStripe();
    if (!stripe) {
      return {
        success: false,
        error: 'Payment service initialization failed',
      };
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId,
    });

    if (error) {
      logger.error('Stripe redirect failed', { error });
      return {
        success: false,
        error: error.message || 'Redirect to checkout failed',
      };
    }

    return { success: true };
  } catch (error) {
    logger.error('Checkout process failed', { error });
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Redirect to Stripe customer portal
 */
export async function redirectToPortal(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check if Stripe is available
    if (!(await isStripeAvailable())) {
      return {
        success: false,
        error: 'Payment service is currently unavailable',
      };
    }

    // Create portal session
    const response = await fetch('/api/v1/stripe/portal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      logger.error('Portal session creation failed', {
        status: response.status,
        error: data.error,
      });
      return {
        success: false,
        error: data.error || 'Failed to access billing portal',
      };
    }

    // Redirect to portal
    window.location.href = data.url;
    return { success: true };
  } catch (error) {
    logger.error('Portal access failed', { error });
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

/**
 * Plan configuration for display
 */
export const PLAN_CONFIG = {
  free: {
    name: 'Free',
    price: 0,
    features: {
      portfolios: 1,
      aiRequests: 3,
      customDomain: false,
      analytics: false,
      prioritySupport: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 2400, // $24.00
    features: {
      portfolios: 5,
      aiRequests: 50,
      customDomain: true,
      analytics: true,
      prioritySupport: false,
    },
  },
  business: {
    name: 'Business',
    price: 3900, // $39.00
    features: {
      portfolios: 25,
      aiRequests: 200,
      customDomain: true,
      analytics: true,
      prioritySupport: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 7900, // $79.00
    features: {
      portfolios: -1, // unlimited
      aiRequests: -1, // unlimited
      customDomain: true,
      analytics: true,
      prioritySupport: true,
    },
  },
} as const;

export type PlanId = keyof typeof PLAN_CONFIG;

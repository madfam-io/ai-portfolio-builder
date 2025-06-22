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
 * Checkout service for Stripe integration
 */

import { loadStripe } from '@stripe/stripe-js';
import { logger } from '@/lib/utils/logger';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export interface CheckoutOptions {
  planId: 'pro' | 'business' | 'enterprise';
  applyPromotion?: boolean;
}

/**
 * Create a checkout session and redirect to Stripe
 */
export async function createCheckoutSession({
  planId,
  applyPromotion = true,
}: CheckoutOptions): Promise<void> {
  try {
    // Make API call to create checkout session
    const response = await fetch('/api/v1/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        applyPromotion,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();

    // Get Stripe instance
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    // Redirect to checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error('Checkout failed', { error });
    throw error;
  }
}

/**
 * Create a checkout session for AI credit packs
 */
export async function createAICreditCheckout(
  packId: 'small' | 'medium' | 'large'
): Promise<void> {
  try {
    const response = await fetch('/api/v1/stripe/checkout-credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { sessionId } = await response.json();

    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error('AI credit checkout failed', { error });
    throw error;
  }
}

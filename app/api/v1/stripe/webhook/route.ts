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
 * Stripe webhook handler
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 * Updates user subscription status in the database.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import type Stripe from 'stripe';

import { stripeService } from '@/lib/services/stripe/stripe';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/types/errors';
import { getCurrentUser } from '@/lib/auth/session';
import { RevenueMetricsService } from '@/lib/services/analytics/RevenueMetricsService';
import { prisma } from '@/lib/db/prisma';

// Enhanced Stripe types for better type safety
interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
  current_period_start: number;
  current_period_end: number;
}

interface StripeInvoiceWithSubscription extends Stripe.Invoice {
  subscription: string | { id: string } | null;
}

/**
 * POST /api/v1/stripe/webhook
 *
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check if Stripe is available
    if (!stripeService.isAvailable()) {
      logger.error('Stripe webhook received but service not available');
      return NextResponse.json(
        { error: 'Payment service unavailable' },
        { status: 503 }
      );
    }

    // Get request body and signature
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      logger.error('Missing stripe-signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripeService.verifyWebhookSignature(body, signature);
    } catch (error) {
      logger.error('Webhook signature verification failed', { error });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    logger.info('Processing Stripe webhook', {
      eventId: event.id,
      eventType: event.type,
    });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info('Unhandled webhook event', { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed', { error });

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const type = session.metadata?.type;

  if (!userId) {
    logger.error('Missing userId in checkout session', {
      sessionId: session.id,
      metadata: session.metadata || {},
    });
    return;
  }

  // Handle AI credit pack purchase
  if (type === 'ai_credit_pack') {
    await handleCreditPackPurchase(session);
    return;
  }

  // Handle subscription purchase
  const planId = session.metadata?.planId;
  if (!planId) {
    logger.error('Missing planId in checkout session', {
      sessionId: session.id,
      metadata: session.metadata || {},
    });
    return;
  }

  try {
    // Update user subscription status
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: planId === 'pro' ? 'PRO' : planId === 'business' ? 'BUSINESS' : 'FREE',
        subscriptionStatus: 'ACTIVE',
        subscriptionExpiresAt: null, // Will be set when subscription is created
        updatedAt: new Date(),
      },
    });

    logger.info('User subscription updated after checkout', {
      userId,
      planId,
      sessionId: session.id,
    });
  } catch (error) {
    logger.error('Error handling checkout completion', {
      error,
      userId,
      sessionId: session.id,
    });
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;

  if (!userId) {
    logger.error('Missing userId in subscription metadata', {
      subscriptionId: subscription.id,
      metadata: subscription.metadata || {},
    });
    return;
  }

  try {
    // Calculate subscription end date
    const subscriptionEnd = new Date(
      (subscription as StripeSubscriptionWithPeriod).current_period_end * 1000
    );

    // Get subscription amount
    const amount = subscription.items.data[0]?.price.unit_amount
      ? subscription.items.data[0].price.unit_amount / 100
      : 0;

    // Note: Subscription table would need to be defined in schema
    // This is commented out until the Subscription model is properly defined
    // await prisma.subscription.create({
    //   data: {
    //     userId: userId,
    //     stripeSubscriptionId: subscription.id,
    //     stripeCustomerId: subscription.customer as string,
    //     plan: (planId || 'professional') as 'professional' | 'business',
    //     status: subscription.status,
    //     currentPeriodStart: subscriptionEnd,
    //     currentPeriodEnd: subscriptionEnd,
    //     amount: amount,
    //     createdAt: new Date(),
    //   },
    // });

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: planId === 'pro' ? 'PRO' : planId === 'business' ? 'BUSINESS' : 'FREE',
        subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        subscriptionExpiresAt: subscriptionEnd,
        updatedAt: new Date(),
      },
    });

    // Track revenue event (commented out as RevenueMetricsService needs to be adapted for Prisma)
    // const revenueService = new RevenueMetricsService();
    // await revenueService.trackRevenueEvent({
    //   type: 'new_subscription',
    //   userId,
    //   newPlan: planId || 'professional',
    //   amount,
    // });

    logger.info('User subscription created', {
      userId,
      subscriptionId: subscription.id,
      status: subscription.status,
      expiresAt: subscriptionEnd,
    });
  } catch (error) {
    logger.error('Error handling subscription creation', {
      error,
      userId,
      subscriptionId: subscription.id,
    });
  }
}

/**
 * Handle subscription updates
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    logger.error('Missing userId in subscription metadata', {
      subscriptionId: subscription.id,
    });
    return;
  }

  try {
    const subscriptionEnd = new Date(
      (subscription as StripeSubscriptionWithPeriod).current_period_end * 1000
    );

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'INACTIVE',
        subscriptionExpiresAt: subscriptionEnd,
        updatedAt: new Date(),
      },
    });

    logger.info('User subscription updated', {
      userId,
      subscriptionId: subscription.id,
      status: subscription.status,
      expiresAt: subscriptionEnd,
    });
  } catch (error) {
    logger.error('Error handling subscription update', {
      error,
      userId,
      subscriptionId: subscription.id,
    });
  }
}

/**
 * Handle subscription deletion/cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const planId = subscription.metadata?.planId;

  if (!userId) {
    logger.error('Missing userId in subscription metadata', {
      subscriptionId: subscription.id,
    });
    return;
  }

  try {
    // Get subscription amount for churn tracking
    const amount = subscription.items.data[0]?.price.unit_amount
      ? subscription.items.data[0].price.unit_amount / 100
      : 0;

    // Update subscription record (commented out until Subscription model is defined)
    // await prisma.subscription.updateMany({
    //   where: {
    //     stripeSubscriptionId: subscription.id,
    //   },
    //   data: {
    //     status: 'canceled',
    //     canceledAt: new Date(),
    //     updatedAt: new Date(),
    //   },
    // });

    // Update user record
    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionTier: 'FREE',
        subscriptionStatus: 'INACTIVE',
        subscriptionExpiresAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Track churn event (commented out as RevenueMetricsService needs to be adapted for Prisma)
    // const revenueService = new RevenueMetricsService();
    // await revenueService.trackRevenueEvent({
    //   type: 'churn',
    //   userId,
    //   oldPlan: planId || 'professional',
    //   amount,
    // });

    logger.info('User subscription cancelled', {
      userId,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    logger.error('Error handling subscription deletion', {
      error,
      userId,
      subscriptionId: subscription.id,
    });
  }
}

/**
 * Handle successful payment
 */
function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const invoiceWithSub = invoice as StripeInvoiceWithSubscription;
  const subscriptionId =
    typeof invoiceWithSub.subscription === 'string'
      ? invoiceWithSub.subscription
      : invoiceWithSub.subscription?.id;

  if (!subscriptionId) {
    logger.info('Payment succeeded for non-subscription invoice', {
      invoiceId: invoice.id,
    });
    return;
  }

  logger.info('Payment succeeded for subscription', {
    subscriptionId,
    invoiceId: invoice.id,
    amount: invoice.amount_paid,
  });

  // Could trigger email notifications or update payment history here
}

/**
 * Handle failed payment
 */
function handlePaymentFailed(invoice: Stripe.Invoice) {
  const invoiceWithSub = invoice as StripeInvoiceWithSubscription;
  const subscriptionId =
    typeof invoiceWithSub.subscription === 'string'
      ? invoiceWithSub.subscription
      : invoiceWithSub.subscription?.id;

  if (!subscriptionId) {
    logger.info('Payment failed for non-subscription invoice', {
      invoiceId: invoice.id,
    });
    return;
  }

  logger.error('Payment failed for subscription', {
    subscriptionId,
    invoiceId: invoice.id,
    amount: invoice.amount_due,
  });

  // Could trigger email notifications or grace period logic here
}

/**
 * Handle AI credit pack purchase
 */
async function handleCreditPackPurchase(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const credits = parseInt(session.metadata?.credits || '0');

  if (!userId || !credits) {
    logger.error('Missing metadata for credit pack purchase', {
      sessionId: session.id,
      metadata: session.metadata || {},
    });
    return;
  }

  try {
    // Get current user credits (using aiRequestsCount as proxy for credits)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { aiRequestsCount: true },
    });

    if (!user) {
      logger.error('User not found for credit update', { userId });
      return;
    }

    const currentCredits = user.aiRequestsCount || 0;
    const newCredits = currentCredits + credits;

    // Update user credits (using aiRequestsCount field)
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiRequestsCount: newCredits,
        updatedAt: new Date(),
      },
    });

    // Log credit purchase would need a separate model defined
    logger.info('Credit pack purchase processed', {
      userId,
      credits,
      newTotal: newCredits,
    });

    logger.info('AI credit pack purchase completed', {
      userId,
      credits,
      sessionId: session.id,
    });
  } catch (error) {
    logger.error('Error handling credit pack purchase', {
      error,
      userId,
      sessionId: session.id,
    });
  }
}

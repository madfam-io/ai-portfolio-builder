/**
 * Stripe webhook handler
 *
 * Handles Stripe webhook events for subscription lifecycle management.
 * Updates user subscription status in the database.
 */

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';

import { stripeService } from '@/lib/services/stripe/stripe';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/types/errors';
import { createClient } from '@/lib/supabase/server';
import { RevenueMetricsService } from '@/lib/services/analytics/RevenueMetricsService';

// Enhanced Stripe types for better type safety
interface StripeSubscriptionWithPeriod extends Stripe.Subscription {
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

  const supabase = await createClient();
  if (!supabase) {
    logger.error('Database not available for checkout completion', {
      userId,
      sessionId: session.id,
    });
    return;
  }

  try {
    // Update user subscription status
    const { error } = await supabase
      .from('users')
      .update({
        subscription_tier: planId,
        subscription_status: 'active',
        stripe_customer_id: session.customer as string,
        subscription_expires_at: null, // Will be set when subscription is created
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      logger.error('Failed to update user subscription after checkout', {
        error,
        userId,
        sessionId: session.id,
      });
      return;
    }

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

  const supabase = await createClient();
  if (!supabase) {
    logger.error('Database not available for subscription creation', {
      userId,
      subscriptionId: subscription.id,
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

    // Insert into subscriptions table
    const { error: subError } = await supabase.from('subscriptions').insert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      plan: planId || 'pro',
      status: subscription.status,
      current_period_start: new Date(
        (subscription as unknown).current_period_start * 1000
      ).toISOString(),
      current_period_end: subscriptionEnd.toISOString(),
      amount: amount,
      created_at: new Date().toISOString(),
    });

    if (subError) {
      logger.error('Failed to insert subscription record', {
        error: subError,
        userId,
        subscriptionId: subscription.id,
      });
    }

    // Update user record
    const { error } = await supabase
      .from('users')
      .update({
        subscription_tier: planId || 'pro',
        subscription_status: subscription.status,
        stripe_subscription_id: subscription.id,
        subscription_expires_at: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      logger.error('Failed to update user subscription', {
        error,
        userId,
        subscriptionId: subscription.id,
      });
      return;
    }

    // Track revenue event
    const revenueService = new RevenueMetricsService(supabase);
    await revenueService.trackRevenueEvent({
      type: 'new_subscription',
      userId,
      newPlan: planId || 'pro',
      amount,
    });

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

  const supabase = await createClient();
  if (!supabase) {
    logger.error('Database not available for subscription update', {
      userId,
      subscriptionId: subscription.id,
    });
    return;
  }

  try {
    const subscriptionEnd = new Date(
      (subscription as StripeSubscriptionWithPeriod).current_period_end * 1000
    );

    const { error } = await supabase
      .from('users')
      .update({
        subscription_status: subscription.status,
        subscription_expires_at: subscriptionEnd.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      logger.error('Failed to update subscription status', {
        error,
        userId,
        subscriptionId: subscription.id,
      });
      return;
    }

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

  const supabase = await createClient();
  if (!supabase) {
    logger.error('Database not available for subscription deletion', {
      userId,
      subscriptionId: subscription.id,
    });
    return;
  }

  try {
    // Get subscription amount for churn tracking
    const amount = subscription.items.data[0]?.price.unit_amount
      ? subscription.items.data[0].price.unit_amount / 100
      : 0;

    // Update subscription record
    const { error: subError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (subError) {
      logger.error('Failed to update subscription record', {
        error: subError,
        subscriptionId: subscription.id,
      });
    }

    // Update user record
    const { error } = await supabase
      .from('users')
      .update({
        subscription_tier: 'free',
        subscription_status: 'cancelled',
        subscription_expires_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      logger.error('Failed to update subscription after deletion', {
        error,
        userId,
        subscriptionId: subscription.id,
      });
      return;
    }

    // Track churn event
    const revenueService = new RevenueMetricsService(supabase);
    await revenueService.trackRevenueEvent({
      type: 'churn',
      userId,
      oldPlan: planId || 'pro',
      amount,
    });

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

  const supabase = await createClient();
  if (!supabase) {
    logger.error('Database not available for credit pack purchase', {
      userId,
      sessionId: session.id,
    });
    return;
  }

  try {
    // Get current user credits
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('ai_credits')
      .eq('id', userId)
      .single();

    if (fetchError) {
      logger.error('Failed to fetch user for credit update', {
        error: fetchError,
        userId,
      });
      return;
    }

    const currentCredits = user?.ai_credits || 0;
    const newCredits = currentCredits + credits;

    // Update user credits
    const { error: updateError } = await supabase
      .from('users')
      .update({
        ai_credits: newCredits,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      logger.error('Failed to update user credits', {
        error: updateError,
        userId,
        credits,
      });
      return;
    }

    // Log credit purchase
    await supabase.from('ai_credit_purchases').insert({
      user_id: userId,
      credits_purchased: credits,
      amount_paid: session.amount_total || 0,
      stripe_session_id: session.id,
      created_at: new Date().toISOString(),
    });

    logger.info('AI credit pack purchase completed', {
      userId,
      credits,
      newBalance: newCredits,
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

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

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { withErrorHandling } from '@/lib/api/middleware/error-handler';
import { logger } from '@/lib/utils/logger';

const getServerUser = async () => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Initialize Stripe inside the handler
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    logger.error('Stripe secret key not configured');
    return NextResponse.json(
      { error: 'Payment service not configured' },
      { status: 503 }
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-05-28.basil',
  });

  // Initialize Supabase inside the handler
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logger.error('Supabase configuration missing');
    return NextResponse.json(
      { error: 'Database service not configured' },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get session ID from request body
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    // Verify the session belongs to the authenticated user
    if (session.client_reference_id !== user.id) {
      logger.warn('Session user mismatch', {
        sessionUser: session.client_reference_id,
        authUser: user.id,
      });
      return NextResponse.json(
        { error: 'Session verification failed' },
        { status: 403 }
      );
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get subscription details
    let subscription: Stripe.Subscription;

    if (!session.subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      );
    }

    // If subscription is a string ID, fetch the full subscription object
    if (typeof session.subscription === 'string') {
      subscription = await stripe.subscriptions.retrieve(session.subscription);
    } else {
      subscription = session.subscription as Stripe.Subscription;
    }

    // Update user's subscription in database
    const planId = subscription.items.data[0]?.price.id;
    let planName = 'free';

    // Map Stripe price IDs to plan names
    if (planId === process.env.STRIPE_PRO_PRICE_ID) {
      planName = 'pro';
    } else if (planId === process.env.STRIPE_BUSINESS_PRICE_ID) {
      planName = 'business';
    } else if (planId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      planName = 'enterprise';
    }

    // Get the current period timestamps
    // Use default values as these properties might not exist in all subscription states
    const currentPeriodStart = Math.floor(Date.now() / 1000);
    const currentPeriodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days

    // Update user profile with subscription info
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: planName,
        subscription_status: subscription.status,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_start_date: new Date(
          currentPeriodStart * 1000
        ).toISOString(),
        subscription_end_date: new Date(currentPeriodEnd * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      logger.error('Failed to update user subscription', updateError);
      throw new Error('Failed to update subscription');
    }

    // Log successful payment
    logger.info('Payment verified successfully', {
      userId: user.id,
      sessionId,
      planName,
      subscriptionId: subscription.id,
    });

    return NextResponse.json({
      success: true,
      planName,
      subscriptionId: subscription.id,
      customerId: session.customer,
    });
  } catch (error) {
    logger.error('Payment verification error', error as Error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
});

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { withErrorHandling } from '@/lib/utils/api-helpers';
import { getServerUser } from '@/lib/auth/server';
import { logger } from '@/lib/utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const POST = withErrorHandling(async (request: NextRequest) => {
  try {
    // Get authenticated user
    const user = await getServerUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
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
    const subscription = session.subscription as Stripe.Subscription;
    if (!subscription) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      );
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

    // Update user profile with subscription info
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: planName,
        subscription_status: subscription.status,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
        subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
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
    logger.error('Payment verification error', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
});
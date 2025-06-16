/**
 * Stripe customer portal endpoint
 *
 * Creates a Stripe customer portal session for subscription management.
 * Allows users to update payment methods, view invoices, and cancel subscriptions.
 */

import { NextResponse } from 'next/server';

import { stripeService } from '@/lib/services/stripe/stripe';
import { withAuth, AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { AppError } from '@/types/errors';
import { logger } from '@/lib/utils/logger';
import { getAppUrl } from '@/lib/config/env';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/stripe/portal
 *
 * Creates a Stripe customer portal session
 */
async function handler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    // Check if Stripe is available
    if (!stripeService.isAvailable()) {
      return NextResponse.json(
        {
          error: 'Payment service is currently unavailable',
          code: 'STRIPE_NOT_AVAILABLE',
        },
        { status: 503 }
      );
    }

    // Get authenticated user
    const { user } = request.auth;

    // Get user's Stripe customer ID from database
    const supabase = await createClient();
    if (!supabase) {
      throw new AppError(
        'DATABASE_NOT_AVAILABLE',
        'Database service unavailable',
        503
      );
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_status')
      .eq('id', user.id)
      .single();

    if (error || !userData) {
      logger.error('Failed to fetch user data for portal', {
        error,
        userId: user.id,
      });
      throw new AppError('USER_DATA_NOT_FOUND', 'User data not found', 404);
    }

    if (!userData.stripe_customer_id) {
      throw new AppError(
        'NO_STRIPE_CUSTOMER',
        'No active subscription found',
        400
      );
    }

    // Create return URL
    const returnUrl = `${getAppUrl()}/dashboard/billing`;

    // Create portal session
    const session = await stripeService.createPortalSession({
      customerId: userData.stripe_customer_id,
      returnUrl,
    });

    logger.info('Portal session created successfully', {
      sessionId: session.id,
      userId: user.id,
      customerId: userData.stripe_customer_id,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (error) {
    logger.error('Portal session creation failed', { error });

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create portal session',
        code: 'PORTAL_FAILED',
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);

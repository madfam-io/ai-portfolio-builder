/**
 * Stripe checkout session creation endpoint
 *
 * Creates a Stripe checkout session for subscription purchases.
 * Requires authentication and validates plan selection.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { stripeService, SubscriptionPlan } from '@/lib/services/stripe/stripe';
import { withAuth, AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { AppError } from '@/types/errors';
import { logger } from '@/lib/utils/logger';
import { getAppUrl } from '@/lib/config/env';

/**
 * Request validation schema
 */
const CreateCheckoutSchema = z.object({
  planId: z.enum(['pro', 'business', 'enterprise']),
  trialDays: z.number().min(0).max(30).optional().default(7),
});

/**
 * POST /api/v1/stripe/checkout
 *
 * Creates a Stripe checkout session for subscription purchase
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

    // Parse and validate request body
    const body = await request.json();
    const { planId, trialDays } = CreateCheckoutSchema.parse(body);

    // Get authenticated user
    const { user } = request;
    if (!user?.email) {
      throw new AppError(
        'User email is required for checkout',
        'USER_EMAIL_REQUIRED',
        400
      );
    }

    // Create success and cancel URLs
    const baseUrl = getAppUrl();
    const successUrl = `${baseUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=true`;
    const cancelUrl = `${baseUrl}/pricing?canceled=true`;

    // Create checkout session
    const session = await stripeService.createCheckoutSession({
      planId: planId as SubscriptionPlan,
      userId: user.id,
      userEmail: user.email,
      successUrl,
      cancelUrl,
      trialDays,
    });

    logger.info('Checkout session created successfully', {
      sessionId: session.id,
      userId: user.id,
      planId,
      amount: session.amount_total,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      planId,
      trialDays,
    });
  } catch (error) {
    logger.error('Checkout session creation failed', { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
        { status: 400 }
      );
    }

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
        error: 'Failed to create checkout session',
        code: 'CHECKOUT_FAILED',
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);

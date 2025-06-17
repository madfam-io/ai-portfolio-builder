import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { versionedApiHandler } from '@/lib/api/response-helpers';
import {
  enhancedStripeService,
  AI_CREDIT_PACKS,
  type AICreditPack,
} from '@/lib/services/stripe/stripe-enhanced';
import { logger } from '@/lib/utils/logger';

/**
 * POST /api/v1/stripe/checkout-credits
 * Create a checkout session for purchasing AI credit packs
 */
export const POST = versionedApiHandler(
  withAuth(async (request: AuthenticatedRequest) => {
    try {
      const user = request.user;
      if (!user?.id || !user?.email) {
        return NextResponse.json(
          { error: 'User information is required' },
          { status: 401 }
        );
      }

      const body = await request.json();
      const { packId } = body;

      // Validate pack ID
      if (!packId || !(packId in AI_CREDIT_PACKS)) {
        return NextResponse.json(
          { error: 'Invalid credit pack ID' },
          { status: 400 }
        );
      }

      // Check if Stripe is available
      if (!enhancedStripeService.isAvailable()) {
        return NextResponse.json(
          { error: 'Payment service is currently unavailable' },
          { status: 503 }
        );
      }

      // Create checkout session
      const session = await enhancedStripeService.createAICreditCheckout({
        packId: packId as AICreditPack,
        userId: user.id,
        userEmail: user.email,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&type=credits`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      });

      logger.info('AI credit pack checkout session created', {
        sessionId: session.id,
        userId: user.id,
        packId,
      });

      return NextResponse.json({
        checkoutUrl: session.url,
        sessionId: session.id,
      });
    } catch (error) {
      logger.error('Failed to create AI credit checkout session', { error });
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }
  })
);

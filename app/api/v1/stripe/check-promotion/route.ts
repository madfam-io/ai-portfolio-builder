/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * API endpoint for checking promotional eligibility
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  enhancedStripeService,
  PROMOTIONAL_CONFIG,
} from '@/lib/services/stripe/stripe-enhanced';
import { withErrorHandling } from '@/lib/api/middleware/error-handler';
import { withRateLimit } from '@/lib/api/middleware/rate-limit';
import { logger } from '@/lib/utils/logger';
import { z } from 'zod';

const checkPromotionSchema = z.object({
  email: z.string().email('Invalid email address'),
});

async function handler(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();
    const { email } = checkPromotionSchema.parse(body);

    // Check if Stripe is available
    if (!enhancedStripeService.isAvailable()) {
      return NextResponse.json(
        {
          eligible: false,
          reason: 'Payment service unavailable',
          promotion: null,
        },
        { status: 200 }
      );
    }

    // Check promotional eligibility
    const eligibility =
      await enhancedStripeService.checkPromotionalEligibility(email);

    // Return detailed response
    return NextResponse.json({
      eligible: eligibility.eligible,
      reason: eligibility.reason,
      remainingSlots: eligibility.remainingSlots,
      promotion: eligibility.eligible
        ? {
            code: PROMOTIONAL_CONFIG.code,
            description: PROMOTIONAL_CONFIG.description,
            discountPercentage: PROMOTIONAL_CONFIG.discountPercentage,
            durationMonths: PROMOTIONAL_CONFIG.durationMonths,
            validUntil: PROMOTIONAL_CONFIG.validUntil,
          }
        : null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Error checking promotional eligibility', { error });
    return NextResponse.json(
      { error: 'Failed to check promotional eligibility' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(withErrorHandling(handler), 'api', 100);

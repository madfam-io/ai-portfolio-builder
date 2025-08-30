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

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';

/**
 * @fileoverview API endpoint for tracking experiment events
 * POST /api/v1/experiments/track
 */

/**
 * Request schema for tracking events
 */
const trackEventSchema = z.object({
  experimentId: z.string().uuid(),
  variantId: z.string().uuid(),
  eventType: z.enum(['click', 'conversion', 'engagement', 'pageview']),
  eventData: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()])
    )
    .optional(),
});

/**
 * Track experiment events
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = trackEventSchema.parse(body);

    // Get visitor ID from cookie
    const cookieStore = await cookies();
    const visitorId = cookieStore.get('prisma_visitor_id')?.value;

    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID not found' },
        { status: 400 }
      );
    }

    // Record the event using Prisma
    await prisma.analyticsEvent.create({
      data: {
        eventType: `experiment_${validatedData.eventType}`,
        eventData: {
          sessionId: visitorId,
          experimentId: validatedData.experimentId,
          variantId: validatedData.variantId,
          ...(validatedData.eventData || {}),
        },
      },
    });

    // Special handling for conversion events
    if (validatedData.eventType === 'conversion') {
      // Update variant conversion count atomically
      await prisma.landingPageVariant.update({
        where: { id: validatedData.variantId },
        data: {
          conversionCount: {
            increment: 1,
          },
        },
      });

      // Also update the visitor count if this is a new visitor
      const existingVisitor = await prisma.analyticsEvent.findFirst({
        where: {
          eventType: 'experiment_pageview',
          eventData: {
            path: ['sessionId'],
            equals: visitorId,
          },
        },
      });

      if (!existingVisitor) {
        await prisma.landingPageVariant.update({
          where: { id: validatedData.variantId },
          data: {
            visitorCount: {
              increment: 1,
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to track experiment event', error as Error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

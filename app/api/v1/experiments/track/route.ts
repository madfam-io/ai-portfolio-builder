import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';
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
    .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
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

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    // Record the event
    const { error } = await supabase.rpc('record_landing_page_event', {
      p_session_id: visitorId,
      p_experiment_id: validatedData.experimentId,
      p_variant_id: validatedData.variantId,
      p_event_type: validatedData.eventType,
      p_event_data: validatedData.eventData || {},
    });

    if (error) {
      throw error;
    }

    // Special handling for conversion events
    if (validatedData.eventType === 'conversion') {
      // Update variant conversion count
      const { data: currentVariant } = await supabase
        .from('landing_page_variants')
        .select('conversions')
        .eq('id', validatedData.variantId)
        .single();

      if (currentVariant) {
        await supabase
          .from('landing_page_variants')
          .update({
            conversions: ((currentVariant.conversions as number) ?? 0) + 1,
          })
          .eq('id', validatedData.variantId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Failed to track experiment event', error as Error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

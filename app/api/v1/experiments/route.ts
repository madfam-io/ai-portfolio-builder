import { NextResponse } from 'next/server';
import { z } from 'zod';

// TODO: Implement auth functions
// import {
//   authenticateUser,
//   hasPermission,
//   unauthorizedResponse,
//   forbiddenResponse,
// } from '@/lib/auth/server';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

import type { CreateExperimentRequest } from '@/types/experiments';

/**
 * @fileoverview API endpoints for experiment management
 * GET /api/v1/experiments - List all experiments
 * POST /api/v1/experiments - Create new experiment
 */

/**
 * Schema for creating experiments
 */
const createExperimentSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  hypothesis: z.string().optional(),
  trafficPercentage: z.number().min(1).max(100).default(100),
  targetAudience: z.record(z.array(z.string())).default({}),
  primaryMetric: z.string(),
  secondaryMetrics: z.array(z.string()).optional(),
  variants: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        isControl: z.boolean(),
        trafficPercentage: z.number().min(0).max(100),
        components: z.array(
          z.object({
            type: z.string(),
            order: z.number(),
            visible: z.boolean(),
            variant: z.string(),
            props: z.record(z.any()),
          })
        ),
        themeOverrides: z.record(z.any()).default({}),
      })
    )
    .min(2), // At least 2 variants required
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

/**
 * GET /api/v1/experiments
 * List all experiments
 */
export async function GET(request: Request): Promise<Response> {
  try {
    // TODO: Implement authentication
    // const user = await authenticateUser(request);
    // if (!user) {
    //   return unauthorizedResponse();
    // }

    // TODO: Check permissions
    // if (!hasPermission(user, 'experiments:view')) {
    //   return forbiddenResponse();
    // }

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('landing_page_experiments')
      .select(
        `
        *,
        variants:landing_page_variants(
          id,
          name,
          is_control,
          traffic_percentage,
          conversion_rate
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: experiments, error } = await query;

    if (error) {
      logger.error('Failed to fetch experiments', error as Error);
      return NextResponse.json(
        { error: 'Failed to fetch experiments' },
        { status: 500 }
      );
    }

    // Calculate additional metrics
    const experimentsWithMetrics = experiments?.map(experiment => {
      const totalVisitors = experiment.variants.reduce(
        (sum: number, v: Record<string, unknown>) =>
          sum + ((v.visitor_count as number) ?? 0),
        0
      );
      const totalConversions = experiment.variants.reduce(
        (sum: number, v: Record<string, unknown>) =>
          sum + ((v.conversion_count as number) ?? 0),
        0
      );

      return {
        ...experiment,
        totalVisitors,
        totalConversions,
        overallConversionRate:
          totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0,
      };
    });

    return NextResponse.json({
      experiments: experimentsWithMetrics ?? [],
      pagination: {
        limit,
        offset,
        total: experiments?.length ?? 0,
      },
    });
  } catch (error) {
    logger.error('Experiment list error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/experiments
 * Create new experiment
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // TODO: Implement authentication
    // const user = await authenticateUser(request);
    // if (!user) {
    //   return unauthorizedResponse();
    // }

    // TODO: Check permissions
    // if (!hasPermission(user, 'experiments:manage')) {
    //   return forbiddenResponse();
    // }

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const validatedData = createExperimentSchema.parse(
      body
    ) as CreateExperimentRequest;

    // Validate traffic percentages sum to 100
    const totalTraffic = validatedData.variants.reduce(
      (sum, v) => sum + v.trafficPercentage,
      0
    );
    if (Math.abs(totalTraffic - 100) > 0.01) {
      return NextResponse.json(
        { error: 'Variant traffic percentages must sum to 100%' },
        { status: 400 }
      );
    }

    // Create experiment
    const { data: experiment, error: experimentError } = await supabase
      .from('landing_page_experiments')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        hypothesis: validatedData.hypothesis,
        status: 'draft',
        traffic_percentage: validatedData.trafficPercentage,
        target_audience: validatedData.targetAudience,
        primary_metric: validatedData.primaryMetric,
        secondary_metrics: validatedData.secondaryMetrics || [],
        start_date: validatedData.startDate,
        end_date: validatedData.endDate,
        // created_by: user.id, // TODO: Add authentication
      })
      .select()
      .single();

    if (
      experimentError !== null ||
      experiment === null ||
      experiment === undefined
    ) {
      logger.error(
        'Failed to create experiment',
        experimentError ?? new Error('No experiment returned')
      );
      return NextResponse.json(
        { error: 'Failed to create experiment' },
        { status: 500 }
      );
    }

    // Create variants
    const variantsToInsert = validatedData.variants.map(variant => ({
      experiment_id: experiment.id,
      name: variant.name,
      description: variant.description,
      is_control: variant.isControl,
      traffic_percentage: variant.trafficPercentage,
      components: variant.components,
      theme_overrides: variant.themeOverrides,
    }));

    const { error: variantsError } = await supabase
      .from('landing_page_variants')
      .insert(variantsToInsert);

    if (variantsError) {
      // Rollback experiment creation
      await supabase
        .from('landing_page_experiments')
        .delete()
        .eq('id', experiment.id);

      logger.error('Failed to create variants', variantsError as Error);
      return NextResponse.json(
        { error: 'Failed to create experiment variants' },
        { status: 500 }
      );
    }

    // Fetch complete experiment with variants
    const { data: completeExperiment, error: fetchError } = await supabase
      .from('landing_page_experiments')
      .select(
        `
        *,
        variants:landing_page_variants(*)
      `
      )
      .eq('id', experiment.id)
      .single();

    if (
      fetchError !== null ||
      completeExperiment === null ||
      completeExperiment === undefined
    ) {
      return NextResponse.json(
        { error: 'Failed to fetch created experiment' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { experiment: completeExperiment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Experiment creation error', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

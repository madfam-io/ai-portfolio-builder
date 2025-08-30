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

import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';

import {
  authenticateUser,
  hasPermission,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api/middleware/auth';

import { prisma } from '@/lib/db/prisma';
import { getCurrentUser } from '@/lib/auth/session';
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
  targetAudience: z.record(z.string(), z.array(z.string())).default({}),
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
            props: z.record(z.string(), z.unknown()),
          })
        ),
        themeOverrides: z.record(z.string(), z.unknown()).default({}),
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
    const user = await authenticateUser(request as NextRequest);
    if (!user) {
      return unauthorizedResponse();
    }

    if (!hasPermission(user, 'experiments:view')) {
      return forbiddenResponse();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereCondition: any = {};
    if (status) {
      whereCondition.status = status;
    }

    const experiments = await prisma.landingPageExperiment.findMany({
      where: whereCondition,
      include: {
        variants: {
          select: {
            id: true,
            name: true,
            isControl: true,
            trafficPercentage: true,
            conversionRate: true,
            visitorCount: true,
            conversionCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    // Calculate additional metrics
    const experimentsWithMetrics = experiments.map((experiment: any) => {
      const totalVisitors = experiment.variants.reduce(
        (sum: number, v: any) => sum + (v.visitorCount ?? 0),
        0
      );
      const totalConversions = experiment.variants.reduce(
        (sum: number, v: any) => sum + (v.conversionCount ?? 0),
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
      experiments: experimentsWithMetrics,
      pagination: {
        limit,
        offset,
        total: experiments.length,
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
    const user = await authenticateUser(request as NextRequest);
    if (!user) {
      return unauthorizedResponse();
    }

    if (!hasPermission(user, 'experiments:manage')) {
      return forbiddenResponse();
    }

    const supabase = await getCurrentUser();

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
    const experiment = await prisma.landingPageExperiment.create({
      data: {
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
        created_by: user.id,
      },
    });

    // Create variants
    try {
      await prisma.landingPageVariant.createMany({
        data: validatedData.variants.map(variant => ({
          experimentId: experiment.id,
          name: variant.name,
          description: variant.description,
          isControl: variant.isControl,
          trafficPercentage: variant.trafficPercentage,
          components: variant.components,
          themeOverrides: variant.themeOverrides,
        })),
      });
    } catch (variantsError) {
      // Rollback experiment creation
      await prisma.landingPageExperiment.delete({
        where: { id: experiment.id },
      });

      logger.error('Failed to create variants', variantsError as Error);
      return NextResponse.json(
        { error: 'Failed to create experiment variants' },
        { status: 500 }
      );
    }

    // Fetch complete experiment with variants
    const completeExperiment = await prisma.landingPageExperiment.findUnique({
      where: { id: experiment.id },
      include: {
        variants: true,
      },
    });

    if (!completeExperiment) {
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
        { error: 'Invalid request data', details: error.issues },
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

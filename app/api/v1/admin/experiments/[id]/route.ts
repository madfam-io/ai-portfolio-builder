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
 * @fileoverview Individual Experiment API Endpoints
 *
 * API for managing individual experiments:
 * - Get experiment details and results
 * - Update experiment configuration
 * - Control experiment lifecycle (start/pause/stop)
 * - Export experiment data
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  universalExperimentEngine,
  UniversalExperimentConfig,
} from '@/lib/experimentation/universal-experiments';
import { experimentManager } from '@/lib/admin/experiment-manager';
import { logger } from '@/lib/utils/logger';

const UpdateExperimentSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  hypothesis: z.string().max(1000).optional(),
  status: z
    .enum(['draft', 'active', 'paused', 'completed', 'archived'])
    .optional(),
  trafficAllocation: z.number().min(0.01).max(1.0).optional(),
  targeting: z
    .object({
      userTiers: z.array(z.string()).optional(),
      geographicRegions: z.array(z.string()).optional(),
      deviceTypes: z.array(z.string()).optional(),
    })
    .optional(),
});

const ExperimentActionSchema = z.object({
  action: z.enum(['start', 'pause', 'stop', 'archive']),
  winnerVariantId: z.string().optional(),
  reason: z.string().optional(),
});

/**
 * GET /api/v1/admin/experiments/[id]
 * Get experiment details and results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const experimentId = params.id;

    // Mock experiment data - in production this would query the database
    const mockExperiment: UniversalExperimentConfig = {
      id: experimentId,
      name: 'Hero CTA Button Test',
      description:
        'Testing different CTA button colors and text to improve conversion rates',
      hypothesis:
        'Changing the CTA button from blue to green and updating the text from "Get Started" to "Start Building Now" will increase click-through rates by at least 10%',

      context: 'landing_page',
      type: 'component',
      status: 'active',
      priority: 'high',

      targeting: {
        userSegments: [],
        userTiers: ['free', 'professional'],
        geographicRegions: ['US', 'MX', 'ES'],
        deviceTypes: ['desktop', 'mobile'],
        trafficAllocation: 0.5,
        customRules: [],
        excludeRules: [],
      },

      variants: [
        {
          id: 'var-001',
          name: 'Control (Blue Button)',
          description: 'Current blue CTA button with "Get Started" text',
          isControl: true,
          allocation: 0.5,
          config: {
            componentProps: {
              text: 'Get Started',
              color: 'blue',
              size: 'medium',
            },
          },
          performance: {
            assignments: 1250,
            exposures: 1250,
            conversions: 156,
            revenue: 4680,
          },
        },
        {
          id: 'var-002',
          name: 'Green Button',
          description: 'Green CTA button with "Start Building Now" text',
          isControl: false,
          allocation: 0.5,
          config: {
            componentProps: {
              text: 'Start Building Now',
              color: 'green',
              size: 'medium',
            },
          },
          performance: {
            assignments: 1280,
            exposures: 1280,
            conversions: 184,
            revenue: 5520,
          },
        },
      ],

      metrics: {
        primary: {
          id: 'cta_click_rate',
          name: 'CTA Click Rate',
          description: 'Percentage of visitors who click the CTA button',
          type: 'conversion',
          calculation: {
            eventName: 'cta_click',
            aggregation: 'conversion_rate',
          },
          goal: 'increase',
          statisticalTest: 'z_test',
        },
        secondary: [
          {
            id: 'signup_rate',
            name: 'Signup Rate',
            description: 'Percentage of visitors who complete signup',
            type: 'conversion',
            calculation: {
              eventName: 'signup_completed',
              aggregation: 'conversion_rate',
            },
            goal: 'increase',
            statisticalTest: 'z_test',
          },
          {
            id: 'time_to_click',
            name: 'Time to Click',
            description: 'Average time before CTA click',
            type: 'engagement',
            calculation: {
              propertyName: 'timeToClick',
              aggregation: 'average',
            },
            goal: 'decrease',
            statisticalTest: 't_test',
          },
        ],
        guardrail: [],
      },

      schedule: {
        startDate: new Date('2025-01-15'),
        duration: 14,
        minSampleSize: 2000,
      },

      statistics: {
        confidenceLevel: 0.95,
        minimumDetectableEffect: 0.1,
        statisticalPower: 0.8,
        multipleTestingCorrection: false,
      },

      business: {
        estimatedImpact: 12000,
        riskLevel: 'low',
        rollbackCriteria: ['significant_negative_impact', 'technical_issues'],
        successCriteria: ['statistical_significance', 'practical_significance'],
      },

      tags: ['cta', 'conversion', 'landing-page', 'high-priority'],
      createdBy: 'admin',
      createdAt: new Date('2025-01-15'),
      updatedAt: new Date('2025-01-20'),
    };

    // Get experiment results
    const results =
      await universalExperimentEngine.getExperimentResults(experimentId);

    // Check if experiment should stop
    const stopRecommendation =
      await universalExperimentEngine.shouldStopExperiment(experimentId);

    return NextResponse.json({
      success: true,
      data: {
        experiment: mockExperiment,
        results: Object.fromEntries(results),
        stopRecommendation,
        analytics: {
          totalParticipants: mockExperiment.variants.reduce(
            (sum, v) => sum + v.performance.assignments,
            0
          ),
          totalConversions: mockExperiment.variants.reduce(
            (sum, v) => sum + v.performance.conversions,
            0
          ),
          totalRevenue: mockExperiment.variants.reduce(
            (sum, v) => sum + v.performance.revenue,
            0
          ),
          daysRunning: Math.ceil(
            (Date.now() - mockExperiment.createdAt.getTime()) /
              (1000 * 60 * 60 * 24)
          ),
          progressToTarget: Math.min(
            (mockExperiment.variants.reduce(
              (sum, v) => sum + v.performance.assignments,
              0
            ) /
              mockExperiment.schedule.minSampleSize) *
              100,
            100
          ),
        },
      },
    });
  } catch (error) {
    logger.error(`Failed to fetch experiment ${params.id}:`, error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/admin/experiments/[id]
 * Update experiment configuration
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const experimentId = params.id;
    const body = await request.json();
    const validatedData = UpdateExperimentSchema.parse(body);

    // Mock update - in production this would update the database
    logger.info(`Updating experiment ${experimentId}:`, validatedData);

    return NextResponse.json({
      success: true,
      message: 'Experiment updated successfully',
      data: {
        experimentId,
        updatedFields: Object.keys(validatedData),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error(`Failed to update experiment ${params.id}:`, error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to update experiment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/admin/experiments/[id]
 * Archive an experiment
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await Promise.resolve(); // Satisfy ESLint
  try {
    const experimentId = params.id;

    // Mock deletion - in production this would archive the experiment
    logger.info(`Archiving experiment ${experimentId}`);

    return NextResponse.json({
      success: true,
      message: 'Experiment archived successfully',
      data: { experimentId },
    });
  } catch (error) {
    logger.error(`Failed to archive experiment ${params.id}:`, error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to archive experiment' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/experiments/[id]/action
 * Perform experiment lifecycle actions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const experimentId = params.id;
    const body = await request.json();
    const validatedData = ExperimentActionSchema.parse(body);

    const { action, winnerVariantId, reason } = validatedData;

    switch (action) {
      case 'start':
        await experimentManager.startExperiment(experimentId);
        break;
      case 'pause':
        await experimentManager.pauseExperiment(experimentId);
        break;
      case 'stop':
        await experimentManager.stopExperiment(
          experimentId,
          winnerVariantId,
          reason
        );
        break;
      case 'archive':
        // Implementation for archiving
        break;
    }

    return NextResponse.json({
      success: true,
      message: `Experiment ${action} completed successfully`,
      data: {
        experimentId,
        action,
        winnerVariantId,
        reason,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error(
      `Failed to perform action on experiment ${params.id}:`,
      error as Error
    );
    return NextResponse.json(
      { success: false, error: 'Failed to perform experiment action' },
      { status: 500 }
    );
  }
}

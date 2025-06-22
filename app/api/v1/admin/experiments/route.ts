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

/**
 * @fileoverview Universal Experiments API Endpoints
 *
 * Admin API for managing experiments across the PRISMA platform:
 * - CRUD operations for experiments
 * - Template management and creation
 * - Bulk operations and scheduling
 * - Statistical analysis and reporting
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  universalExperimentEngine,
  UniversalExperimentConfig,
  ExperimentContext,
  ExperimentType,
} from '@/lib/experimentation/universal-experiments';
import { experimentManager } from '@/lib/admin/experiment-manager';
import { logger } from '@/lib/utils/logger';

// Validation schemas
const CreateExperimentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000),
  hypothesis: z.string().max(1000),
  context: z.enum([
    'landing_page',
    'editor',
    'onboarding',
    'pricing',
    'upgrade_flow',
    'ai_enhancement',
    'template_selection',
    'publishing',
    'dashboard',
    'global',
  ]),
  type: z.enum([
    'component',
    'flow',
    'content',
    'algorithm',
    'pricing',
    'feature',
    'performance',
    'layout',
    'business_logic',
    'personalization',
  ]),
  trafficAllocation: z.number().min(0.01).max(1.0),
  variants: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        isControl: z.boolean(),
        allocation: z.number().min(0).max(1),
        config: z.record(z.unknown()),
      })
    )
    .min(2),
  primaryMetric: z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum([
      'conversion',
      'revenue',
      'engagement',
      'retention',
      'custom',
    ]),
  }),
  secondaryMetrics: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum([
          'conversion',
          'revenue',
          'engagement',
          'retention',
          'custom',
        ]),
      })
    )
    .optional(),
  targeting: z
    .object({
      userTiers: z.array(z.string()).optional(),
      geographicRegions: z.array(z.string()).optional(),
      deviceTypes: z.array(z.string()).optional(),
    })
    .optional(),
  statistics: z
    .object({
      confidenceLevel: z.number().min(0.8).max(0.99),
      minimumDetectableEffect: z.number().min(0.01).max(0.5),
      statisticalPower: z.number().min(0.7).max(0.95),
    })
    .optional(),
});

const BulkOperationSchema = z.object({
  experimentIds: z.array(z.string()).min(1),
  operation: z.enum(['start', 'pause', 'stop', 'archive', 'clone']),
  options: z.record(z.unknown()).optional(),
});

/**
 * GET /api/v1/admin/experiments
 * Fetch all experiments with filtering and pagination
 */
export async function GET(_request: NextRequest) {
  await Promise.resolve(); // Satisfy ESLint
  try {
    const { searchParams } = new URL(_request.url);
    const status = searchParams.get('status');
    const context = searchParams.get('context');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');

    // Mock response - in production this would query the database
    const mockExperiments: Partial<UniversalExperimentConfig>[] = [
      {
        id: 'exp-001',
        name: 'Hero CTA Button Test',
        description: 'Testing different CTA button colors and text',
        context: 'landing_page',
        type: 'component',
        status: 'active',
        priority: 'high',
        createdAt: new Date('2025-01-15'),
        variants: [
          {
            id: 'var-001',
            name: 'Control',
            description: 'Current button style',
            isControl: true,
            allocation: 0.5,
            config: {},
            performance: {
              assignments: 1250,
              exposures: 1250,
              conversions: 156,
              revenue: 0,
            },
          },
          {
            id: 'var-002',
            name: 'Green Button',
            description: 'Green CTA button variant',
            isControl: false,
            allocation: 0.5,
            config: {},
            performance: {
              assignments: 1280,
              exposures: 1280,
              conversions: 184,
              revenue: 0,
            },
          },
        ],
      },
      {
        id: 'exp-002',
        name: 'Onboarding Flow Optimization',
        description: 'Streamlining the user onboarding process',
        context: 'onboarding',
        type: 'flow',
        status: 'active',
        priority: 'medium',
        createdAt: new Date('2025-01-10'),
        variants: [
          {
            id: 'var-003',
            name: 'Current Flow',
            description: '5-step onboarding',
            isControl: true,
            allocation: 0.5,
            config: {},
            performance: {
              assignments: 890,
              exposures: 890,
              conversions: 267,
              revenue: 0,
            },
          },
          {
            id: 'var-004',
            name: 'Simplified Flow',
            description: '3-step streamlined onboarding',
            isControl: false,
            allocation: 0.5,
            config: {},
            performance: {
              assignments: 910,
              exposures: 910,
              conversions: 310,
              revenue: 0,
            },
          },
        ],
      },
      {
        id: 'exp-003',
        name: 'AI Model Comparison',
        description: 'Testing different AI models for content generation',
        context: 'ai_enhancement',
        type: 'algorithm',
        status: 'completed',
        priority: 'high',
        createdAt: new Date('2025-01-01'),
        variants: [
          {
            id: 'var-005',
            name: 'Llama 3.1',
            description: 'Current Llama model',
            isControl: true,
            allocation: 0.33,
            config: {},
            performance: {
              assignments: 2100,
              exposures: 2100,
              conversions: 1890,
              revenue: 0,
            },
          },
          {
            id: 'var-006',
            name: 'Phi-3.5',
            description: 'Microsoft Phi model',
            isControl: false,
            allocation: 0.33,
            config: {},
            performance: {
              assignments: 2050,
              exposures: 2050,
              conversions: 1950,
              revenue: 0,
            },
          },
          {
            id: 'var-007',
            name: 'Mistral 7B',
            description: 'Mistral model variant',
            isControl: false,
            allocation: 0.34,
            config: {},
            performance: {
              assignments: 2080,
              exposures: 2080,
              conversions: 1830,
              revenue: 0,
            },
          },
        ],
      },
    ];

    // Apply filters
    let filteredExperiments = mockExperiments;

    if (status && status !== 'all') {
      filteredExperiments = filteredExperiments.filter(
        exp => exp.status === status
      );
    }

    if (context && context !== 'all') {
      filteredExperiments = filteredExperiments.filter(
        exp => exp.context === context
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredExperiments = filteredExperiments.filter(
        exp =>
          exp.name?.toLowerCase().includes(searchLower) ||
          exp.description?.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedExperiments = filteredExperiments.slice(
      startIndex,
      startIndex + limit
    );

    return NextResponse.json({
      success: true,
      data: {
        experiments: paginatedExperiments,
        pagination: {
          page,
          limit,
          total: filteredExperiments.length,
          totalPages: Math.ceil(filteredExperiments.length / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Failed to fetch experiments:', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experiments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/experiments
 * Create a new experiment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateExperimentSchema.parse(body);

    const experimentId = crypto.randomUUID();
    const experiment: UniversalExperimentConfig = {
      id: experimentId,
      name: validatedData.name,
      description: validatedData.description,
      hypothesis: validatedData.hypothesis,

      context: validatedData.context as ExperimentContext,
      type: validatedData.type as ExperimentType,
      status: 'draft',
      priority: 'medium',

      targeting: {
        userSegments: [],
        userTiers: validatedData.targeting?.userTiers || [
          'free',
          'professional',
          'business',
        ],
        geographicRegions: validatedData.targeting?.geographicRegions || [],
        deviceTypes: validatedData.targeting?.deviceTypes || [],
        trafficAllocation: validatedData.trafficAllocation,
        customRules: [],
        excludeRules: [],
      },

      variants: validatedData.variants.map(variant => ({
        id: crypto.randomUUID(),
        name: variant.name,
        description: variant.description,
        isControl: variant.isControl,
        allocation: variant.allocation,
        config: variant.config,
        performance: {
          assignments: 0,
          exposures: 0,
          conversions: 0,
          revenue: 0,
        },
      })),

      metrics: {
        primary: {
          id: validatedData.primaryMetric.id,
          name: validatedData.primaryMetric.name,
          description: '',
          type: validatedData.primaryMetric.type,
          calculation: { aggregation: 'conversion_rate' },
          goal: 'increase',
          statisticalTest: 'z_test',
        },
        secondary:
          validatedData.secondaryMetrics?.map(metric => ({
            id: metric.id,
            name: metric.name,
            description: '',
            type: metric.type,
            calculation: { aggregation: 'count' },
            goal: 'increase',
            statisticalTest: 'z_test',
          })) || [],
        guardrail: [],
      },

      schedule: {
        duration: 14,
        minSampleSize: 1000,
      },

      statistics: {
        confidenceLevel: validatedData.statistics?.confidenceLevel || 0.95,
        minimumDetectableEffect:
          validatedData.statistics?.minimumDetectableEffect || 0.05,
        statisticalPower: validatedData.statistics?.statisticalPower || 0.8,
        multipleTestingCorrection: false,
      },

      business: {
        estimatedImpact: 0,
        riskLevel: 'medium',
        rollbackCriteria: [],
        successCriteria: [],
      },

      tags: [validatedData.context, validatedData.type],
      createdBy: 'admin', // Would be replaced with actual user ID
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await universalExperimentEngine.createExperiment(experiment);

    logger.info(`Created new experiment: ${experimentId} - ${experiment.name}`);

    return NextResponse.json(
      {
        success: true,
        data: {
          experimentId,
          experiment,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Failed to create experiment:', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to create experiment' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/admin/experiments/bulk
 * Perform bulk operations on multiple experiments
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = BulkOperationSchema.parse(body);

    await experimentManager.bulkOperation(validatedData);

    return NextResponse.json({
      success: true,
      message: `Bulk ${validatedData.operation} completed for ${validatedData.experimentIds.length} experiments`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    logger.error('Bulk operation failed:', error as Error);
    return NextResponse.json(
      { success: false, error: 'Bulk operation failed' },
      { status: 500 }
    );
  }
}

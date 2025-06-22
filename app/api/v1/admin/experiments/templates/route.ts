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
 * @fileoverview Experiment Templates API Endpoints
 *
 * API for managing experiment templates:
 * - Fetch pre-built templates
 * - Create experiments from templates
 * - Template customization and validation
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import {
  experimentManager,
  ExperimentManager,
} from '@/lib/admin/experiment-manager';
import { UniversalExperimentConfig } from '@/lib/experimentation/universal-experiments';
import { logger } from '@/lib/utils/logger';

const CreateFromTemplateSchema = z.object({
  templateId: z.string(),
  customizations: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      hypothesis: z.string().optional(),
      trafficAllocation: z.number().min(0.01).max(1.0).optional(),
      targeting: z
        .object({
          userTiers: z.array(z.string()).optional(),
          geographicRegions: z.array(z.string()).optional(),
          deviceTypes: z.array(z.string()).optional(),
        })
        .optional(),
    })
    .optional(),
});

/**
 * GET /api/v1/admin/experiments/templates
 * Fetch all available experiment templates
 */
export async function GET(request: NextRequest) {
  await Promise.resolve(); // Satisfy ESLint
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const context = searchParams.get('context');
    const type = searchParams.get('type');

    let templates = ExperimentManager.EXPERIMENT_TEMPLATES;

    // Apply filters
    if (category) {
      templates = templates.filter(template => template.category === category);
    }

    if (context) {
      templates = templates.filter(template => template.context === context);
    }

    if (type) {
      templates = templates.filter(template => template.type === type);
    }

    // Add usage statistics (mock data)
    const templatesWithStats = templates.map(template => ({
      ...template,
      usage: {
        timesUsed: Math.floor(Math.random() * 50) + 5,
        averageSuccessRate: Math.random() * 0.4 + 0.1,
        lastUsed: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ),
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        templates: templatesWithStats,
        categories: [
          ...new Set(
            ExperimentManager.EXPERIMENT_TEMPLATES.map(t => t.category)
          ),
        ],
        contexts: [
          ...new Set(
            ExperimentManager.EXPERIMENT_TEMPLATES.map(t => t.context)
          ),
        ],
        types: [
          ...new Set(ExperimentManager.EXPERIMENT_TEMPLATES.map(t => t.type)),
        ],
      },
    });
  } catch (error) {
    logger.error('Failed to fetch experiment templates:', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/admin/experiments/templates
 * Create experiment from template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateFromTemplateSchema.parse(body);

    const experimentId = await experimentManager.createFromTemplate(
      validatedData.templateId,
      (validatedData.customizations || {}) as Partial<UniversalExperimentConfig>
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          experimentId,
          message: 'Experiment created from template successfully',
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

    logger.error('Failed to create experiment from template:', error as Error);
    return NextResponse.json(
      { success: false, error: 'Failed to create experiment from template' },
      { status: 500 }
    );
  }
}

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
 * @fileoverview Universal Experiment Management Utilities
 *
 * Administrative tools for managing experiments across the PRISMA platform:
 * - Experiment lifecycle management (create, start, pause, stop)
 * - Template system for common experiment patterns
 * - Bulk operations and experiment scheduling
 * - Integration with existing landing page experiments
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
 */

import {
  universalExperimentEngine,
  UniversalExperimentConfig,
  UniversalExperimentVariant,
  ExperimentContext,
  ExperimentType,
  ExperimentStatus,
  ExperimentMetric,
} from '@/lib/experimentation/universal-experiments';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  context: ExperimentContext;
  type: ExperimentType;
  variants: Partial<UniversalExperimentVariant>[];
  metrics: {
    primary: Partial<ExperimentMetric>;
    secondary: Partial<ExperimentMetric>[];
  };
  defaultSettings: {
    trafficAllocation: number;
    confidenceLevel: number;
    minimumDetectableEffect: number;
    duration: number;
  };
  tags: string[];
}

export interface ExperimentSchedule {
  experimentId: string;
  action: 'start' | 'pause' | 'stop' | 'archive';
  scheduledAt: Date;
  conditions?: {
    minSampleSize?: number;
    maxDuration?: number;
    significanceThreshold?: number;
  };
}

export interface BulkExperimentOperation {
  experimentIds: string[];
  operation: 'start' | 'pause' | 'stop' | 'archive' | 'clone';
  options?: Record<string, unknown>;
}

/**
 * Universal Experiment Manager for administrative operations
 */
export class ExperimentManager {
  private supabase = createClient();

  /**
   * Pre-built experiment templates for common use cases
   */
  static readonly EXPERIMENT_TEMPLATES: ExperimentTemplate[] = [
    {
      id: 'hero-cta-test',
      name: 'Hero CTA Button Test',
      description: 'Test different call-to-action button styles and messaging',
      category: 'conversion_optimization',
      context: 'landing_page',
      type: 'component',
      variants: [
        {
          name: 'Control',
          description: 'Current CTA button',
          isControl: true,
          allocation: 0.5,
          config: {
            componentProps: {
              text: 'Get Started',
              style: 'primary',
              size: 'medium',
            },
          },
        },
        {
          name: 'Large Orange',
          description: 'Larger button with orange color',
          isControl: false,
          allocation: 0.5,
          config: {
            componentProps: {
              text: 'Start Building Now',
              style: 'orange',
              size: 'large',
            },
          },
        },
      ],
      metrics: {
        primary: {
          id: 'cta_click_rate',
          name: 'CTA Click Rate',
          type: 'conversion',
          calculation: {
            eventName: 'cta_click',
            aggregation: 'conversion_rate',
          },
        },
        secondary: [
          {
            id: 'signup_rate',
            name: 'Signup Rate',
            type: 'conversion',
            calculation: {
              eventName: 'signup_completed',
              aggregation: 'conversion_rate',
            },
          },
        ],
      },
      defaultSettings: {
        trafficAllocation: 0.5,
        confidenceLevel: 0.95,
        minimumDetectableEffect: 0.05,
        duration: 14,
      },
      tags: ['cta', 'conversion', 'landing-page'],
    },
    {
      id: 'onboarding-flow-test',
      name: 'Onboarding Flow Optimization',
      description: 'Test different onboarding sequences and step arrangements',
      category: 'user_experience',
      context: 'onboarding',
      type: 'flow',
      variants: [
        {
          name: 'Current Flow',
          description: '5-step onboarding process',
          isControl: true,
          allocation: 0.5,
          config: {
            flowSteps: [
              { stepId: 'welcome', config: { showVideo: false } },
              {
                stepId: 'profile',
                config: { fieldsRequired: ['name', 'email'] },
              },
              { stepId: 'preferences', config: { skipOptional: false } },
              { stepId: 'template', config: { showAll: true } },
              { stepId: 'complete', config: { showTips: true } },
            ],
          },
        },
        {
          name: 'Streamlined Flow',
          description: '3-step simplified onboarding',
          isControl: false,
          allocation: 0.5,
          config: {
            flowSteps: [
              { stepId: 'welcome', config: { showVideo: true } },
              {
                stepId: 'quick-setup',
                config: { autoDetectPreferences: true },
              },
              { stepId: 'complete', config: { showTips: false } },
            ],
          },
        },
      ],
      metrics: {
        primary: {
          id: 'onboarding_completion_rate',
          name: 'Onboarding Completion Rate',
          type: 'conversion',
          calculation: {
            eventName: 'onboarding_completed',
            aggregation: 'conversion_rate',
          },
        },
        secondary: [
          {
            id: 'time_to_first_portfolio',
            name: 'Time to First Portfolio',
            type: 'engagement',
            calculation: {
              eventName: 'first_portfolio_created',
              aggregation: 'average',
            },
          },
        ],
      },
      defaultSettings: {
        trafficAllocation: 0.3,
        confidenceLevel: 0.95,
        minimumDetectableEffect: 0.1,
        duration: 21,
      },
      tags: ['onboarding', 'ux', 'completion-rate'],
    },
    {
      id: 'ai-enhancement-model-test',
      name: 'AI Enhancement Model Comparison',
      description: 'Compare different AI models for content generation quality',
      category: 'ai_optimization',
      context: 'ai_enhancement',
      type: 'algorithm',
      variants: [
        {
          name: 'Llama 3.1 (Control)',
          description: 'Current Llama 3.1 model',
          isControl: true,
          allocation: 0.33,
          config: {
            algorithmParams: {
              model: 'llama-3.1-8b',
              temperature: 0.7,
              maxTokens: 150,
            },
          },
        },
        {
          name: 'Phi-3.5 Mini',
          description: 'Microsoft Phi-3.5 model',
          isControl: false,
          allocation: 0.33,
          config: {
            algorithmParams: {
              model: 'phi-3.5-mini',
              temperature: 0.6,
              maxTokens: 150,
            },
          },
        },
        {
          name: 'Mistral 7B',
          description: 'Mistral 7B model',
          isControl: false,
          allocation: 0.34,
          config: {
            algorithmParams: {
              model: 'mistral-7b',
              temperature: 0.8,
              maxTokens: 150,
            },
          },
        },
      ],
      metrics: {
        primary: {
          id: 'content_quality_score',
          name: 'Content Quality Score',
          type: 'custom',
          calculation: {
            propertyName: 'qualityScore',
            aggregation: 'average',
          },
        },
        secondary: [
          {
            id: 'generation_time',
            name: 'Generation Time',
            type: 'custom',
            calculation: {
              propertyName: 'processingTime',
              aggregation: 'average',
            },
          },
        ],
      },
      defaultSettings: {
        trafficAllocation: 0.2,
        confidenceLevel: 0.95,
        minimumDetectableEffect: 0.05,
        duration: 30,
      },
      tags: ['ai', 'content-generation', 'model-comparison'],
    },
    {
      id: 'pricing-strategy-test',
      name: 'Dynamic Pricing Strategy',
      description: 'Test different pricing displays and discount strategies',
      category: 'monetization',
      context: 'pricing',
      type: 'pricing',
      variants: [
        {
          name: 'Standard Pricing',
          description: 'Current pricing display',
          isControl: true,
          allocation: 0.25,
          config: {
            pricingConfig: {
              basePrice: 29,
              discounts: [],
              currency: 'USD',
            },
          },
        },
        {
          name: 'First Month Free',
          description: 'Free trial with full price after',
          isControl: false,
          allocation: 0.25,
          config: {
            pricingConfig: {
              basePrice: 29,
              discounts: [{ type: 'percentage', value: 100 }],
              currency: 'USD',
            },
          },
        },
        {
          name: '20% Launch Discount',
          description: 'Limited time discount pricing',
          isControl: false,
          allocation: 0.25,
          config: {
            pricingConfig: {
              basePrice: 29,
              discounts: [{ type: 'percentage', value: 20 }],
              currency: 'USD',
            },
          },
        },
        {
          name: 'Premium Pricing',
          description: 'Higher price point with premium positioning',
          isControl: false,
          allocation: 0.25,
          config: {
            pricingConfig: {
              basePrice: 49,
              discounts: [],
              currency: 'USD',
            },
          },
        },
      ],
      metrics: {
        primary: {
          id: 'conversion_to_paid',
          name: 'Conversion to Paid',
          type: 'revenue',
          calculation: {
            eventName: 'subscription_started',
            aggregation: 'conversion_rate',
          },
        },
        secondary: [
          {
            id: 'revenue_per_user',
            name: 'Revenue per User',
            type: 'revenue',
            calculation: {
              propertyName: 'subscriptionValue',
              aggregation: 'average',
            },
          },
        ],
      },
      defaultSettings: {
        trafficAllocation: 0.4,
        confidenceLevel: 0.95,
        minimumDetectableEffect: 0.15,
        duration: 28,
      },
      tags: ['pricing', 'monetization', 'conversion'],
    },
  ];

  /**
   * Create experiment from template
   */
  async createFromTemplate(
    templateId: string,
    customizations: Partial<UniversalExperimentConfig> = {}
  ): Promise<string> {
    const template = ExperimentManager.EXPERIMENT_TEMPLATES.find(
      t => t.id === templateId
    );
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    const experimentId = crypto.randomUUID();
    const experiment: UniversalExperimentConfig = {
      id: experimentId,
      name: customizations.name || template.name,
      description: customizations.description || template.description,
      hypothesis:
        customizations.hypothesis ||
        `Testing ${template.description.toLowerCase()}`,

      context: template.context,
      type: template.type,
      status: 'draft',
      priority: 'medium',

      targeting: {
        userSegments: [],
        userTiers: ['free', 'professional', 'business'],
        geographicRegions: [],
        deviceTypes: [],
        trafficAllocation: template.defaultSettings.trafficAllocation,
        customRules: [],
        excludeRules: [],
      },

      variants: template.variants.map((variantTemplate, index) => ({
        id: crypto.randomUUID(),
        name: variantTemplate.name || `Variant ${index + 1}`,
        description: variantTemplate.description || '',
        isControl: variantTemplate.isControl || false,
        allocation: variantTemplate.allocation || 1 / template.variants.length,
        config: variantTemplate.config || {},
        performance: {
          assignments: 0,
          exposures: 0,
          conversions: 0,
          revenue: 0,
        },
      })),

      metrics: {
        primary: {
          id: template.metrics.primary.id || 'primary_metric',
          name: template.metrics.primary.name || 'Primary Metric',
          description: '',
          type: template.metrics.primary.type || 'conversion',
          calculation: template.metrics.primary.calculation || {
            aggregation: 'conversion_rate',
          },
          goal: 'increase',
          statisticalTest: 'z_test',
        },
        secondary: template.metrics.secondary.map(metric => ({
          id: metric.id || crypto.randomUUID(),
          name: metric.name || 'Secondary Metric',
          description: '',
          type: metric.type || 'engagement',
          calculation: metric.calculation || {
            aggregation: 'count',
          },
          goal: 'increase',
          statisticalTest: 'z_test',
        })),
        guardrail: [],
      },

      schedule: {
        duration: template.defaultSettings.duration,
        minSampleSize: this.calculateSampleSize(
          template.defaultSettings.confidenceLevel,
          template.defaultSettings.minimumDetectableEffect,
          0.8
        ),
      },

      statistics: {
        confidenceLevel: template.defaultSettings.confidenceLevel,
        minimumDetectableEffect:
          template.defaultSettings.minimumDetectableEffect,
        statisticalPower: 0.8,
        multipleTestingCorrection: false,
      },

      business: {
        estimatedImpact: 0,
        riskLevel: 'medium',
        rollbackCriteria: ['significant_negative_impact'],
        successCriteria: ['statistical_significance', 'practical_significance'],
      },

      tags: template.tags,
      createdBy: 'admin', // Would be replaced with actual user ID
      createdAt: new Date(),
      updatedAt: new Date(),

      ...customizations,
    };

    await universalExperimentEngine.createExperiment(experiment);

    logger.info(
      `Created experiment from template: ${templateId} -> ${experimentId}`
    );
    return experimentId;
  }

  /**
   * Start an experiment
   */
  startExperiment(experimentId: string): void {
    // Implementation would update experiment status to 'active'
    // and set start date
    logger.info(`Starting experiment: ${experimentId}`);
  }

  /**
   * Pause an experiment
   */
  pauseExperiment(experimentId: string): void {
    // Implementation would update experiment status to 'paused'
    logger.info(`Pausing experiment: ${experimentId}`);
  }

  /**
   * Stop an experiment and declare winner
   */
  stopExperiment(
    experimentId: string,
    winnerVariantId?: string,
    _reason?: string
  ): void {
    // Implementation would:
    // 1. Update experiment status to 'completed'
    // 2. Set winning variant if provided
    // 3. Archive or deploy winner
    logger.info(
      `Stopping experiment: ${experimentId}, winner: ${winnerVariantId}`
    );
  }

  /**
   * Clone an existing experiment
   */
  cloneExperiment(
    experimentId: string,
    _modifications: Partial<UniversalExperimentConfig> = {}
  ): string {
    // Implementation would:
    // 1. Fetch existing experiment
    // 2. Create new experiment with cloned config
    // 3. Apply modifications
    // 4. Reset performance metrics

    const newExperimentId = crypto.randomUUID();
    logger.info(`Cloning experiment: ${experimentId} -> ${newExperimentId}`);
    return newExperimentId;
  }

  /**
   * Schedule experiment action
   */
  scheduleAction(schedule: ExperimentSchedule): void {
    // Implementation would store scheduled action in database
    // and set up cron job or timer to execute
    logger.info(
      `Scheduling ${schedule.action} for experiment ${schedule.experimentId} at ${schedule.scheduledAt}`
    );
  }

  /**
   * Perform bulk operations on multiple experiments
   */
  bulkOperation(operation: BulkExperimentOperation): void {
    const { experimentIds, operation: action, options = {} } = operation;

    for (const experimentId of experimentIds) {
      try {
        switch (action) {
          case 'start':
            this.startExperiment(experimentId);
            break;
          case 'pause':
            this.pauseExperiment(experimentId);
            break;
          case 'stop':
            this.stopExperiment(experimentId);
            break;
          case 'archive':
            // Implementation for archiving
            break;
          case 'clone':
            this.cloneExperiment(
              experimentId,
              options as Partial<UniversalExperimentConfig>
            );
            break;
        }
      } catch (error) {
        logger.error(
          `Bulk operation ${action} failed for experiment ${experimentId}:`,
          error as Error
        );
      }
    }

    logger.info(
      `Completed bulk ${action} operation on ${experimentIds.length} experiments`
    );
  }

  /**
   * Migrate existing landing page experiments to universal system
   */
  async migrateLandingPageExperiments(): Promise<void> {
    try {
      if (!this.supabase) {
        logger.error('Supabase client not initialized');
        return;
      }
      const { data: existingExperiments, error } = await this.supabase
        .from('landing_page_experiments')
        .select(
          `
          *,
          variants:landing_page_variants(*)
        `
        )
        .eq('status', 'active');

      if (error) {
        logger.error('Failed to fetch existing experiments:', error as Error);
        return;
      }

      for (const oldExperiment of existingExperiments || []) {
        const newExperiment: UniversalExperimentConfig = {
          id: oldExperiment.id,
          name: oldExperiment.name,
          description: oldExperiment.description || '',
          hypothesis: oldExperiment.hypothesis || '',

          context: 'landing_page',
          type: 'component',
          status: oldExperiment.status as ExperimentStatus,
          priority: 'medium',

          targeting: {
            userSegments: [],
            userTiers: [],
            geographicRegions: oldExperiment.target_audience?.geo || [],
            deviceTypes: oldExperiment.target_audience?.device || [],
            trafficAllocation: (oldExperiment.traffic_percentage || 100) / 100,
            customRules: [],
            excludeRules: [],
          },

          variants:
            oldExperiment.variants?.map(
              (variant: {
                id: string;
                name: string;
                description?: string;
                is_control: boolean;
                traffic_percentage?: number;
                components?: Record<string, unknown>;
                content?: Record<string, unknown>;
                theme_overrides?: Record<string, unknown>;
                visitors?: number;
                conversions?: number;
              }) => ({
                id: variant.id,
                name: variant.name,
                description: variant.description || '',
                isControl: variant.is_control,
              allocation: (variant.traffic_percentage || 0) / 100,
              config: {
                componentProps: variant.components || {},
                cssOverrides: variant.theme_overrides || {},
              },
              performance: {
                assignments: variant.visitors || 0,
                exposures: variant.visitors || 0,
                conversions: variant.conversions || 0,
                revenue: 0,
              },
            })) || [],

          metrics: {
            primary: {
              id: oldExperiment.primary_metric,
              name: oldExperiment.primary_metric.replace('_', ' '),
              description: '',
              type: 'conversion',
              calculation: { aggregation: 'conversion_rate' },
              goal: 'increase',
              statisticalTest: 'z_test',
            },
            secondary: (oldExperiment.secondary_metrics || []).map(
              (metric: string) => ({
                id: metric,
                name: metric.replace('_', ' '),
                description: '',
                type: 'engagement',
                calculation: { aggregation: 'count' },
                goal: 'increase',
                statisticalTest: 'z_test',
              })
            ),
            guardrail: [],
          },

          schedule: {
            startDate: oldExperiment.start_date
              ? new Date(oldExperiment.start_date)
              : undefined,
            endDate: oldExperiment.end_date
              ? new Date(oldExperiment.end_date)
              : undefined,
            minSampleSize: 1000,
          },

          statistics: {
            confidenceLevel: 0.95,
            minimumDetectableEffect: 0.05,
            statisticalPower: 0.8,
            multipleTestingCorrection: false,
          },

          business: {
            estimatedImpact: 0,
            riskLevel: 'medium',
            rollbackCriteria: [],
            successCriteria: [],
          },

          tags: ['migrated', 'landing-page'],
          createdBy: oldExperiment.created_by || 'system',
          createdAt: new Date(oldExperiment.created_at),
          updatedAt: new Date(oldExperiment.updated_at),
        };

        await universalExperimentEngine.createExperiment(newExperiment);
      }

      logger.info(
        `Migrated ${existingExperiments?.length || 0} landing page experiments to universal system`
      );
    } catch (error) {
      logger.error(
        'Failed to migrate landing page experiments:',
        error as Error
      );
    }
  }

  /**
   * Calculate required sample size for statistical power
   */
  private calculateSampleSize(
    confidence: number,
    mde: number,
    power: number
  ): number {
    // Simplified sample size calculation
    const alpha = 1 - confidence;
    const beta = 1 - power;

    const zAlpha = confidence > 0.95 ? 1.96 : 1.645;
    const zBeta = power > 0.8 ? 0.84 : 0.67;

    const baselineRate = 0.1;
    const treatmentRate = baselineRate * (1 + mde);
    const pooledRate = (baselineRate + treatmentRate) / 2;

    const numerator =
      Math.pow(zAlpha + zBeta, 2) * 2 * pooledRate * (1 - pooledRate);
    const denominator = Math.pow(treatmentRate - baselineRate, 2);

    return Math.ceil(numerator / denominator);
  }

  /**
   * Get experiment performance summary
   */
  getPerformanceSummary(): {
    totalExperiments: number;
    activeExperiments: number;
    significantWinners: number;
    averageUplift: number;
    totalRevenueLift: number;
  } {
    // Implementation would aggregate data from all experiments
    return {
      totalExperiments: 42,
      activeExperiments: 8,
      significantWinners: 15,
      averageUplift: 0.127,
      totalRevenueLift: 24500,
    };
  }
}

/**
 * Global experiment manager instance
 */
export const experimentManager = new ExperimentManager();

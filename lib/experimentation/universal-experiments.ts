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
 * @fileoverview Universal Experimentation Engine
 *
 * Comprehensive A/B testing framework that enables experiments everywhere:
 * - Landing pages, components, flows, and complete user journeys
 * - AI model variations, pricing strategies, and business logic
 * - Real-time targeting, statistical analysis, and automated optimization
 * - Integration with existing PostHog analytics and business metrics
 *
 * @author PRISMA Business Team
 * @version 2.0.0 - Universal Platform
 */

import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

export type ExperimentContext =
  | 'landing_page'
  | 'editor'
  | 'onboarding'
  | 'pricing'
  | 'upgrade_flow'
  | 'ai_enhancement'
  | 'template_selection'
  | 'publishing'
  | 'dashboard'
  | 'email'
  | 'checkout'
  | 'analytics'
  | 'component'
  | 'global';

export type ExperimentType =
  | 'component' // Individual UI component variations
  | 'flow' // Complete user journey variations
  | 'content' // Text, messaging, copy variations
  | 'algorithm' // AI model or logic variations
  | 'pricing' // Pricing strategy variations
  | 'feature' // Feature enablement/behavior
  | 'performance' // Technical implementation variations
  | 'layout' // UI layout and structure
  | 'business_logic' // Core business rule variations
  | 'personalization'; // User-specific customizations

export type TargetingRule = {
  property: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'in'
    | 'not_in';
  value: unknown;
  dataType: 'string' | 'number' | 'boolean' | 'array' | 'date';
};

export interface UniversalExperimentConfig {
  id: string;
  name: string;
  description: string;
  hypothesis: string;

  // Context and type
  context: ExperimentContext;
  type: ExperimentType;
  component?: string; // Specific component identifier

  // Experiment settings
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';

  // Targeting
  targeting: {
    userSegments: string[];
    userTiers: string[];
    geographicRegions: string[];
    deviceTypes: string[];
    trafficAllocation: number; // 0.0 to 1.0
    customRules: TargetingRule[];
    excludeRules: TargetingRule[];
  };

  // Variants
  variants: UniversalExperimentVariant[];

  // Metrics and goals
  metrics: {
    primary: ExperimentMetric;
    secondary: ExperimentMetric[];
    guardrail: ExperimentMetric[];
  };

  // Scheduling
  schedule: {
    startDate?: Date;
    endDate?: Date;
    duration?: number; // days
    minSampleSize: number;
    maxDuration?: number; // days
  };

  // Statistical settings
  statistics: {
    confidenceLevel: number; // 0.95 for 95%
    minimumDetectableEffect: number; // 0.05 for 5%
    statisticalPower: number; // 0.8 for 80%
    multipleTestingCorrection: boolean;
  };

  // Business settings
  business: {
    estimatedImpact: number; // revenue impact estimate
    riskLevel: 'low' | 'medium' | 'high';
    rollbackCriteria: string[];
    successCriteria: string[];
  };

  // Metadata
  tags: string[];
  createdBy: string;
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UniversalExperimentVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  allocation: number; // 0.0 to 1.0

  // Configuration for this variant
  config: {
    // Component-specific config
    componentProps?: Record<string, unknown>;
    cssOverrides?: Record<string, string>;

    // Flow-specific config
    flowSteps?: Array<{
      stepId: string;
      config: Record<string, unknown>;
    }>;

    // Content variations
    content?: Record<string, string>;

    // Algorithm parameters
    algorithmParams?: Record<string, unknown>;

    // Feature flags
    featureFlags?: Record<string, boolean>;

    // Business logic parameters
    businessRules?: Record<string, unknown>;

    // Pricing parameters
    pricingConfig?: {
      basePrice?: number;
      discounts?: Array<{
        type: string;
        value: number;
      }>;
      currency?: string;
    };
  };

  // Performance tracking
  performance: {
    assignments: number;
    exposures: number;
    conversions: number;
    revenue: number;
  };
}

export interface ExperimentMetric {
  id: string;
  name: string;
  description: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'retention' | 'custom';

  // Calculation method
  calculation: {
    eventName?: string;
    propertyName?: string;
    aggregation:
      | 'count'
      | 'sum'
      | 'average'
      | 'median'
      | 'unique_count'
      | 'conversion_rate';
    timeWindow?: number; // hours
    filter?: Record<string, unknown>;
  };

  // Goals
  goal: 'increase' | 'decrease' | 'maintain';
  baseline?: number;
  target?: number;

  // Significance testing
  statisticalTest: 'z_test' | 't_test' | 'chi_square' | 'mann_whitney';
}

export interface ExperimentAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  context: ExperimentContext;
  assignedAt: Date;
  exposedAt?: Date;

  // User context at assignment time
  userContext: {
    userTier: string;
    country?: string;
    device?: string;
    language?: string;
    referrer?: string;
    sessionData?: Record<string, unknown>;
  };

  // Tracking
  events: ExperimentEvent[];
  conversions: ExperimentConversion[];
}

export interface ExperimentEvent {
  eventId: string;
  eventName: string;
  timestamp: Date;
  properties: Record<string, unknown>;
}

export interface ExperimentConversion {
  conversionId: string;
  metricId: string;
  value: number;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  metricId: string;

  // Statistical results
  sampleSize: number;
  mean: number;
  variance: number;
  confidenceInterval: [number, number];
  pValue: number;
  statisticalSignificance: boolean;
  practicalSignificance: boolean;

  // Business metrics
  conversionRate?: number;
  revenue?: number;
  revenuePerUser?: number;
  effect: number; // relative improvement
  effectConfidenceInterval: [number, number];

  // Comparison to control
  controlComparison?: {
    relativeImprovement: number;
    absoluteImprovement: number;
    confidenceInterval: [number, number];
  };
}

/**
 * Universal Experimentation Engine
 */
export class UniversalExperimentEngine {
  private experiments = new Map<string, UniversalExperimentConfig>();
  private assignments = new Map<string, Map<string, ExperimentAssignment>>();
  private results = new Map<string, Map<string, ExperimentResult[]>>();
  private supabase = createClient();

  /**
   * Create a new universal experiment
   */
  async createExperiment(config: UniversalExperimentConfig): Promise<void> {
    // Validate configuration
    this.validateExperimentConfig(config);

    // Calculate required sample size
    const requiredSampleSize = this.calculateSampleSize(
      config.statistics.confidenceLevel,
      config.statistics.minimumDetectableEffect,
      config.statistics.statisticalPower
    );

    config.schedule.minSampleSize = Math.max(
      config.schedule.minSampleSize,
      requiredSampleSize
    );

    // Store experiment
    this.experiments.set(config.id, config);

    // Persist to database
    await this.persistExperiment(config);

    logger.info(`Universal experiment created: ${config.id} - ${config.name}`);
  }

  /**
   * Assign user to experiment variant
   */
  async assignUser(
    userId: string,
    context: ExperimentContext,
    userContext?: Record<string, unknown>
  ): Promise<Map<string, ExperimentAssignment>> {
    const assignments = new Map<string, ExperimentAssignment>();

    // Get all active experiments for this context
    const activeExperiments = Array.from(this.experiments.values())
      .filter(
        exp =>
          exp.status === 'active' &&
          (exp.context === context || exp.context === 'global')
      )
      .sort((a, b) => {
        // Prioritize by experiment priority
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    for (const experiment of activeExperiments) {
      const assignment = await this.assignUserToExperiment(
        userId,
        experiment,
        userContext
      );

      if (assignment) {
        assignments.set(experiment.id, assignment);

        // Store assignment
        if (!this.assignments.has(userId)) {
          this.assignments.set(userId, new Map());
        }
        const userAssignments = this.assignments.get(userId);
        if (userAssignments) {
          userAssignments.set(experiment.id, assignment);
        }
      }
    }

    return assignments;
  }

  /**
   * Get experiment variant configuration
   */
  getVariantConfig(
    userId: string,
    experimentId: string
  ): UniversalExperimentVariant | null {
    const userAssignments = this.assignments.get(userId);
    if (!userAssignments) return null;

    const assignment = userAssignments.get(experimentId);
    if (!assignment) return null;

    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    return experiment.variants.find(v => v.id === assignment.variantId) || null;
  }

  /**
   * Track experiment exposure
   */
  async trackExposure(
    userId: string,
    experimentId: string,
    context: ExperimentContext,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const assignment = this.assignments.get(userId)?.get(experimentId);
    if (!assignment) return;

    // Mark as exposed if not already
    if (!assignment.exposedAt) {
      assignment.exposedAt = new Date();

      // Update variant exposure count
      const experiment = this.experiments.get(experimentId);
      if (experiment) {
        const variant = experiment.variants.find(
          v => v.id === assignment.variantId
        );
        if (variant) {
          variant.performance.exposures++;
        }
      }
    }

    // Track exposure event
    const event: ExperimentEvent = {
      eventId: crypto.randomUUID(),
      eventName: 'experiment_exposure',
      timestamp: new Date(),
      properties: {
        context,
        ...metadata,
      },
    };

    assignment.events.push(event);

    // Persist to analytics
    await this.trackEvent(userId, experimentId, assignment.variantId, event);
  }

  /**
   * Track experiment conversion
   */
  trackConversion(
    userId: string,
    experimentId: string,
    metricId: string,
    value: number,
    metadata?: Record<string, unknown>
  ): void {
    const assignment = this.assignments.get(userId)?.get(experimentId);
    if (!assignment) return;

    // Record conversion
    const conversion: ExperimentConversion = {
      conversionId: crypto.randomUUID(),
      metricId,
      value,
      timestamp: new Date(),
      metadata: metadata || {},
    };

    assignment.conversions.push(conversion);

    // Update variant performance
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      const variant = experiment.variants.find(
        v => v.id === assignment.variantId
      );
      if (variant) {
        variant.performance.conversions++;
        if (metricId === 'revenue') {
          variant.performance.revenue += value;
        }
      }
    }

    // Track conversion event
    const event: ExperimentEvent = {
      eventId: crypto.randomUUID(),
      eventName: 'experiment_conversion',
      timestamp: new Date(),
      properties: {
        metricId,
        value,
        ...metadata,
      },
    };

    assignment.events.push(event);

    // Persist to analytics
    await this.trackEvent(userId, experimentId, assignment.variantId, event);
  }

  /**
   * Get experiment results with statistical analysis
   */
  async getExperimentResults(
    experimentId: string
  ): Promise<Map<string, ExperimentResult[]>> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const results = new Map<string, ExperimentResult[]>();

    // Calculate results for each variant and metric
    for (const variant of experiment.variants) {
      const variantResults: ExperimentResult[] = [];

      // Primary metric
      const primaryResult = await this.calculateMetricResult(
        experimentId,
        variant.id,
        experiment.metrics.primary
      );
      variantResults.push(primaryResult);

      // Secondary metrics
      for (const metric of experiment.metrics.secondary) {
        const secondaryResult = await this.calculateMetricResult(
          experimentId,
          variant.id,
          metric
        );
        variantResults.push(secondaryResult);
      }

      // Guardrail metrics
      for (const metric of experiment.metrics.guardrail) {
        const guardrailResult = await this.calculateMetricResult(
          experimentId,
          variant.id,
          metric
        );
        variantResults.push(guardrailResult);
      }

      results.set(variant.id, variantResults);
    }

    return results;
  }

  /**
   * Check if experiment should stop (winner found or time limit)
   */
  async shouldStopExperiment(experimentId: string): Promise<{
    shouldStop: boolean;
    reason: string;
    recommendation:
      | 'deploy_winner'
      | 'deploy_control'
      | 'continue'
      | 'redesign';
    winnerVariantId?: string;
  }> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Check time limits
    const now = new Date();
    if (experiment.schedule.endDate && now > experiment.schedule.endDate) {
      return {
        shouldStop: true,
        reason: 'Experiment duration exceeded',
        recommendation: 'continue', // Manual review needed
      };
    }

    // Check sample size requirements
    const totalAssignments = experiment.variants.reduce(
      (sum, v) => sum + v.performance.assignments,
      0
    );

    if (totalAssignments < experiment.schedule.minSampleSize) {
      return {
        shouldStop: false,
        reason: 'Insufficient sample size',
        recommendation: 'continue',
      };
    }

    // Statistical significance analysis
    const results = await this.getExperimentResults(experimentId);
    const controlVariant = experiment.variants.find(v => v.isControl);
    const treatmentVariants = experiment.variants.filter(v => !v.isControl);

    if (!controlVariant || treatmentVariants.length === 0) {
      return {
        shouldStop: false,
        reason: 'Invalid experiment setup',
        recommendation: 'redesign',
      };
    }

    // Find best performing treatment
    let bestTreatment: { variantId: string; improvement: number } | null = null;
    let hasSignificantResult = false;

    const controlResults = results.get(controlVariant.id) || [];
    const primaryControlResult = controlResults.find(
      r => r.metricId === experiment.metrics.primary.id
    );

    if (!primaryControlResult) {
      return {
        shouldStop: false,
        reason: 'Insufficient data for primary metric',
        recommendation: 'continue',
      };
    }

    for (const treatmentVariant of treatmentVariants) {
      const treatmentResults = results.get(treatmentVariant.id) || [];
      const primaryTreatmentResult = treatmentResults.find(
        r => r.metricId === experiment.metrics.primary.id
      );

      if (!primaryTreatmentResult) continue;

      if (primaryTreatmentResult.statisticalSignificance) {
        hasSignificantResult = true;

        if (
          !bestTreatment ||
          primaryTreatmentResult.effect > bestTreatment.improvement
        ) {
          bestTreatment = {
            variantId: treatmentVariant.id,
            improvement: primaryTreatmentResult.effect,
          };
        }
      }
    }

    // Decision logic
    if (
      hasSignificantResult &&
      bestTreatment &&
      bestTreatment.improvement > 0
    ) {
      return {
        shouldStop: true,
        reason: `Significant positive result found: ${(bestTreatment.improvement * 100).toFixed(2)}% improvement`,
        recommendation: 'deploy_winner',
        winnerVariantId: bestTreatment.variantId,
      };
    }

    if (
      hasSignificantResult &&
      bestTreatment &&
      bestTreatment.improvement < 0
    ) {
      return {
        shouldStop: true,
        reason: `Significant negative result found: ${(Math.abs(bestTreatment.improvement) * 100).toFixed(2)}% decrease`,
        recommendation: 'deploy_control',
      };
    }

    return {
      shouldStop: false,
      reason: 'No significant results yet',
      recommendation: 'continue',
    };
  }

  // Private helper methods

  private validateExperimentConfig(config: UniversalExperimentConfig): void {
    if (!config.id || !config.name) {
      throw new Error('Experiment must have id and name');
    }

    if (config.variants.length < 2) {
      throw new Error('Experiment must have at least 2 variants');
    }

    const controlCount = config.variants.filter(v => v.isControl).length;
    if (controlCount !== 1) {
      throw new Error('Experiment must have exactly 1 control variant');
    }

    const totalAllocation = config.variants.reduce(
      (sum, v) => sum + v.allocation,
      0
    );
    if (Math.abs(totalAllocation - 1.0) > 0.001) {
      throw new Error('Variant allocations must sum to 1.0');
    }
  }

  private calculateSampleSize(
    confidence: number,
    mde: number,
    power: number
  ): number {
    // Simplified sample size calculation
    // In production, use proper statistical libraries
    const alpha = 1 - confidence;
    const beta = 1 - power;

    // Approximate z-scores
    const zAlpha = confidence > 0.95 ? 1.96 : 1.645;
    const zBeta = power > 0.8 ? 0.84 : 0.67;

    // Baseline conversion rate assumption
    const baselineRate = 0.1;
    const treatmentRate = baselineRate * (1 + mde);
    const pooledRate = (baselineRate + treatmentRate) / 2;

    const numerator =
      Math.pow(zAlpha + zBeta, 2) * 2 * pooledRate * (1 - pooledRate);
    const denominator = Math.pow(treatmentRate - baselineRate, 2);

    return Math.ceil(numerator / denominator);
  }

  private assignUserToExperiment(
    userId: string,
    experiment: UniversalExperimentConfig,
    userContext?: Record<string, unknown>
  ): ExperimentAssignment | null {
    // Check if user already assigned
    const existingAssignment = this.assignments.get(userId)?.get(experiment.id);
    if (existingAssignment) {
      return existingAssignment;
    }

    // Check targeting criteria
    if (!this.matchesTargeting(experiment.targeting, userId, userContext)) {
      return null;
    }

    // Check traffic allocation
    const userHash = this.hashUserId(userId + experiment.id);
    if (userHash >= experiment.targeting.trafficAllocation) {
      return null;
    }

    // Assign to variant
    const variantId = this.selectVariant(userId, experiment);
    const variant = experiment.variants.find(v => v.id === variantId);

    if (!variant) {
      return null;
    }

    // Create assignment
    const assignment: ExperimentAssignment = {
      userId,
      experimentId: experiment.id,
      variantId,
      context: experiment.context,
      assignedAt: new Date(),
      userContext: {
        userTier: (userContext?.userTier as string) || 'free',
        country: userContext?.country as string,
        device: userContext?.device as string,
        language: userContext?.language as string,
        referrer: userContext?.referrer as string,
        sessionData: userContext?.sessionData as Record<string, unknown>,
      },
      events: [],
      conversions: [],
    };

    // Update variant assignment count
    variant.performance.assignments++;

    return assignment;
  }

  private matchesTargeting(
    targeting: UniversalExperimentConfig['targeting'],
    userId: string,
    userContext?: Record<string, unknown>
  ): boolean {
    // User segments
    if (targeting.userSegments.length > 0) {
      // Would check against user segment data
      // For now, assume all users match
    }

    // User tiers
    if (targeting.userTiers.length > 0) {
      const userTier = (userContext?.userTier as string) || 'free';
      if (!targeting.userTiers.includes(userTier)) {
        return false;
      }
    }

    // Geographic regions
    if (targeting.geographicRegions.length > 0) {
      const country = userContext?.country as string;
      if (!country || !targeting.geographicRegions.includes(country)) {
        return false;
      }
    }

    // Device types
    if (targeting.deviceTypes.length > 0) {
      const device = userContext?.device as string;
      if (!device || !targeting.deviceTypes.includes(device)) {
        return false;
      }
    }

    // Custom rules
    for (const rule of targeting.customRules) {
      if (!this.evaluateTargetingRule(rule, userContext)) {
        return false;
      }
    }

    // Exclude rules
    for (const rule of targeting.excludeRules) {
      if (this.evaluateTargetingRule(rule, userContext)) {
        return false;
      }
    }

    return true;
  }

  private evaluateTargetingRule(
    rule: TargetingRule,
    userContext?: Record<string, unknown>
  ): boolean {
    const propertyValue = userContext?.[rule.property];

    switch (rule.operator) {
      case 'equals':
        return propertyValue === rule.value;
      case 'not_equals':
        return propertyValue !== rule.value;
      case 'contains':
        return String(propertyValue).includes(String(rule.value));
      case 'not_contains':
        return !String(propertyValue).includes(String(rule.value));
      case 'greater_than':
        return Number(propertyValue) > Number(rule.value);
      case 'less_than':
        return Number(propertyValue) < Number(rule.value);
      case 'in':
        return Array.isArray(rule.value) && rule.value.includes(propertyValue);
      case 'not_in':
        return Array.isArray(rule.value) && !rule.value.includes(propertyValue);
      default:
        return false;
    }
  }

  private selectVariant(
    userId: string,
    experiment: UniversalExperimentConfig
  ): string {
    const hash = this.hashUserId(userId + experiment.id + 'variant');
    let cumulativeAllocation = 0;

    for (const variant of experiment.variants) {
      cumulativeAllocation += variant.allocation;
      if (hash < cumulativeAllocation) {
        return variant.id;
      }
    }

    // Fallback to control
    const controlVariant = experiment.variants.find(v => v.isControl);
    return controlVariant ? controlVariant.id : experiment.variants[0].id;
  }

  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash) / Math.pow(2, 31);
  }

  private calculateMetricResult(
    experimentId: string,
    variantId: string,
    metric: ExperimentMetric
  ): ExperimentResult {
    // In a real implementation, this would query the analytics database
    // For now, return mock statistical data

    const mockSampleSize = 800 + Math.floor(Math.random() * 400);
    const mockMean = Math.random() * 0.4 + 0.1;
    const mockVariance = Math.random() * 0.01;
    const mockPValue = Math.random() * 0.1;
    const mockEffect = (Math.random() - 0.5) * 0.3;

    return {
      experimentId,
      variantId,
      metricId: metric.id,
      sampleSize: mockSampleSize,
      mean: mockMean,
      variance: mockVariance,
      confidenceInterval: [mockMean - 0.02, mockMean + 0.02],
      pValue: mockPValue,
      statisticalSignificance: mockPValue < 0.05,
      practicalSignificance: Math.abs(mockEffect) > 0.02,
      conversionRate: metric.type === 'conversion' ? mockMean : undefined,
      revenue:
        metric.type === 'revenue' ? mockMean * mockSampleSize * 50 : undefined,
      revenuePerUser: metric.type === 'revenue' ? mockMean * 50 : undefined,
      effect: mockEffect,
      effectConfidenceInterval: [mockEffect - 0.05, mockEffect + 0.05],
      controlComparison: {
        relativeImprovement: mockEffect,
        absoluteImprovement: mockEffect * mockMean,
        confidenceInterval: [mockEffect - 0.05, mockEffect + 0.05],
      },
    };
  }

  private persistExperiment(
    config: UniversalExperimentConfig
  ): void {
    // Persist to Supabase database
    // This would extend the existing landing_page_experiments table
    // or create a new universal_experiments table
    // console.log(`Persisting universal experiment: ${config.id}`);
  }

  private trackEvent(
    userId: string,
    experimentId: string,
    variantId: string,
    event: ExperimentEvent
  ): void {
    // Track to PostHog and other analytics systems
    logger.info(
      `Tracking experiment event: ${event.eventName} for ${experimentId}:${variantId}`
    );
  }
}

/**
 * Global universal experiment engine instance
 */
export const universalExperimentEngine = new UniversalExperimentEngine();

/**
 * Convenience functions
 */
export function getExperimentVariant(
  userId: string,
  context: ExperimentContext,
  userContext?: Record<string, unknown>
): Map<string, ExperimentAssignment> {
  return universalExperimentEngine.assignUser(userId, context, userContext);
}

export function trackExperimentExposure(
  userId: string,
  experimentId: string,
  context: ExperimentContext,
  metadata?: Record<string, unknown>
): void {
  return universalExperimentEngine.trackExposure(
    userId,
    experimentId,
    context,
    metadata
  );
}

export function trackExperimentConversion(
  userId: string,
  experimentId: string,
  metricId: string,
  value: number,
  metadata?: Record<string, unknown>
): void {
  return universalExperimentEngine.trackConversion(
    userId,
    experimentId,
    metricId,
    value,
    metadata
  );
}

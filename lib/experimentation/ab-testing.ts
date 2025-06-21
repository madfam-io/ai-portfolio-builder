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
 * @fileoverview A/B Testing and Monetization Experiment Framework
 *
 * Comprehensive experimentation system for business excellence:
 * - Statistical A/B testing with proper significance calculation
 * - Monetization experiment management
 * - Conversion rate optimization
 * - Revenue impact measurement
 * - Feature flag integration
 * - Cohort analysis and user segmentation
 *
 * @author PRISMA Business Team
 * @version 1.0.0 - Business Excellence Foundation
 */

import { logger } from '@/lib/utils/logger';

export interface ExperimentConfig {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'retention' | 'feature';
  status: 'draft' | 'running' | 'completed' | 'paused' | 'archived';
  variants: ExperimentVariant[];
  targeting: ExperimentTargeting;
  metrics: ExperimentMetrics;
  duration: {
    startDate: Date;
    endDate: Date;
    minSampleSize: number;
    maxDuration: number;
  };
  significance: {
    threshold: number; // e.g., 0.95 for 95% confidence
    requiredEffect: number; // minimum detectable effect
    currentSignificance?: number;
    statisticalPower?: number;
  };
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  allocation: number; // 0.0 to 1.0
  config: Record<string, unknown>;
  isControl: boolean;
}

export interface ExperimentTargeting {
  userSegments: string[];
  geographicRegions: string[];
  userTiers: string[];
  featureFlags: string[];
  customFilters: Array<{
    property: string;
    operator:
      | 'equals'
      | 'not_equals'
      | 'contains'
      | 'greater_than'
      | 'less_than';
    value: unknown;
  }>;
  trafficAllocation: number; // percentage of eligible users to include
}

export interface ExperimentMetrics {
  primary: MetricDefinition;
  secondary: MetricDefinition[];
  guardrail: MetricDefinition[]; // metrics that shouldn't degrade
}

export interface MetricDefinition {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'count' | 'duration' | 'ratio';
  aggregation: 'sum' | 'average' | 'median' | 'count' | 'unique_count';
  eventName?: string;
  filter?: Record<string, unknown>;
  goal: 'increase' | 'decrease' | 'maintain';
  baseline?: number;
  target?: number;
}

export interface ExperimentResult {
  experimentId: string;
  variantId: string;
  metric: string;
  value: number;
  sampleSize: number;
  conversionRate?: number;
  revenue?: number;
  confidence: number;
  pValue: number;
  effect: number; // relative lift
  isSignificant: boolean;
}

export interface UserAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignmentTime: Date;
  exposureTime?: Date;
  conversionTime?: Date;
  metadata: Record<string, unknown>;
}

/**
 * A/B Testing Engine for Monetization Experiments
 */
export class ExperimentationEngine {
  private experiments = new Map<string, ExperimentConfig>();
  private userAssignments = new Map<string, Map<string, UserAssignment>>();
  private results = new Map<string, Map<string, ExperimentResult[]>>();

  /**
   * Create a new monetization experiment
   */
  async createExperiment(config: ExperimentConfig): Promise<void> {
    // Validate experiment configuration
    this.validateExperimentConfig(config);

    // Calculate required sample size
    const requiredSampleSize = this.calculateSampleSize(
      config.significance.threshold,
      config.significance.requiredEffect,
      0.8 // statistical power
    );

    config.duration.minSampleSize = requiredSampleSize;

    this.experiments.set(config.id, config);

    // Log experiment creation for analytics
    logger.info(`Experiment created: ${config.id} - ${config.name}`);
    logger.info(`Required sample size: ${requiredSampleSize} per variant`);
  }

  /**
   * Assign user to experiment variant
   */
  async assignUser(
    userId: string,
    experimentId: string,
    userContext?: Record<string, unknown>
  ): Promise<string | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user already assigned
    const existingAssignment = this.userAssignments
      .get(userId)
      ?.get(experimentId);
    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Check if user matches targeting criteria
    if (!this.isUserEligible(userId, experiment, userContext)) {
      return null;
    }

    // Assign to variant using deterministic hash
    const variantId = this.assignToVariant(userId, experiment);

    const assignment: UserAssignment = {
      userId,
      experimentId,
      variantId,
      assignmentTime: new Date(),
      metadata: userContext || {},
    };

    // Store assignment
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    this.userAssignments.get(userId)!.set(experimentId, assignment);

    return variantId;
  }

  /**
   * Track user exposure to experiment
   */
  async trackExposure(userId: string, experimentId: string): Promise<void> {
    const assignment = this.userAssignments.get(userId)?.get(experimentId);
    if (assignment && !assignment.exposureTime) {
      assignment.exposureTime = new Date();

      // Log exposure for analytics
      await this.logEvent('experiment_exposure', {
        experiment_id: experimentId,
        variant_id: assignment.variantId,
        user_id: userId,
        assignment_time: assignment.assignmentTime,
        exposure_time: assignment.exposureTime,
      });
    }
  }

  /**
   * Track conversion event for experiment
   */
  async trackConversion(
    userId: string,
    experimentId: string,
    metricId: string,
    value: number,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    const assignment = this.userAssignments.get(userId)?.get(experimentId);
    if (!assignment) return;

    // Update assignment with conversion
    if (!assignment.conversionTime) {
      assignment.conversionTime = new Date();
    }

    // Log conversion for analytics
    await this.logEvent('experiment_conversion', {
      experiment_id: experimentId,
      variant_id: assignment.variantId,
      user_id: userId,
      metric_id: metricId,
      value,
      conversion_time: assignment.conversionTime,
      ...metadata,
    });

    // Update experiment results
    await this.updateResults(
      experimentId,
      assignment.variantId,
      metricId,
      value
    );
  }

  /**
   * Get experiment variant for user
   */
  getVariant(userId: string, experimentId: string): string | null {
    return (
      this.userAssignments.get(userId)?.get(experimentId)?.variantId || null
    );
  }

  /**
   * Get experiment configuration by variant
   */
  getVariantConfig(
    experimentId: string,
    variantId: string
  ): Record<string, unknown> | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    const variant = experiment.variants.find(v => v.id === variantId);
    return variant?.config || null;
  }

  /**
   * Calculate current experiment results
   */
  async getResults(
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

      // Calculate primary metric
      const primaryResult = await this.calculateMetricResult(
        experimentId,
        variant.id,
        experiment.metrics.primary
      );
      variantResults.push(primaryResult);

      // Calculate secondary metrics
      for (const metric of experiment.metrics.secondary) {
        const secondaryResult = await this.calculateMetricResult(
          experimentId,
          variant.id,
          metric
        );
        variantResults.push(secondaryResult);
      }

      results.set(variant.id, variantResults);
    }

    return results;
  }

  /**
   * Check if experiment has reached statistical significance
   */
  async checkSignificance(experimentId: string): Promise<{
    isSignificant: boolean;
    confidence: number;
    pValue: number;
    effect: number;
    recommendation:
      | 'continue'
      | 'stop_winner'
      | 'stop_no_effect'
      | 'need_more_data';
  }> {
    const results = await this.getResults(experimentId);
    const experiment = this.experiments.get(experimentId)!;

    // Get control and treatment results for primary metric
    const controlVariant = experiment.variants.find(v => v.isControl);
    const treatmentVariants = experiment.variants.filter(v => !v.isControl);

    if (!controlVariant || treatmentVariants.length === 0) {
      throw new Error(
        'Invalid experiment configuration: missing control or treatment variants'
      );
    }

    const controlResults = results.get(controlVariant.id)!;
    const primaryMetricControl = controlResults.find(
      r => r.metric === experiment.metrics.primary.id
    )!;

    // Calculate significance against each treatment
    let bestTreatment: ExperimentResult | null = null;
    let maxEffect = 0;

    for (const treatmentVariant of treatmentVariants) {
      const treatmentResults = results.get(treatmentVariant.id)!;
      const primaryMetricTreatment = treatmentResults.find(
        r => r.metric === experiment.metrics.primary.id
      )!;

      if (Math.abs(primaryMetricTreatment.effect) > Math.abs(maxEffect)) {
        maxEffect = primaryMetricTreatment.effect;
        bestTreatment = primaryMetricTreatment;
      }
    }

    if (!bestTreatment) {
      return {
        isSignificant: false,
        confidence: 0,
        pValue: 1,
        effect: 0,
        recommendation: 'need_more_data',
      };
    }

    // Statistical significance calculation using z-test
    const { confidence, pValue, isSignificant } = this.calculateSignificance(
      primaryMetricControl,
      bestTreatment,
      experiment.significance.threshold
    );

    // Determine recommendation
    let recommendation:
      | 'continue'
      | 'stop_winner'
      | 'stop_no_effect'
      | 'need_more_data';

    if (isSignificant) {
      recommendation =
        bestTreatment.effect > 0 ? 'stop_winner' : 'stop_no_effect';
    } else if (this.hasMinimumSampleSize(experimentId)) {
      recommendation = 'need_more_data';
    } else {
      recommendation = 'continue';
    }

    return {
      isSignificant,
      confidence,
      pValue,
      effect: bestTreatment.effect,
      recommendation,
    };
  }

  // Private helper methods

  private validateExperimentConfig(config: ExperimentConfig): void {
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
    minimumDetectableEffect: number,
    statisticalPower: number
  ): number {
    // Simplified sample size calculation for conversion rate experiments
    // In production, use more sophisticated statistical libraries
    const alpha = 1 - confidence;
    const beta = 1 - statisticalPower;

    // Z-scores for two-tailed test
    const zAlpha = this.getZScore(1 - alpha / 2);
    const zBeta = this.getZScore(statisticalPower);

    // Baseline conversion rate assumption (if not provided)
    const baselineConversion = 0.1; // 10%
    const treatmentConversion =
      baselineConversion * (1 + minimumDetectableEffect);

    const pooledConversion = (baselineConversion + treatmentConversion) / 2;

    const numerator =
      Math.pow(zAlpha + zBeta, 2) *
      2 *
      pooledConversion *
      (1 - pooledConversion);
    const denominator = Math.pow(treatmentConversion - baselineConversion, 2);

    return Math.ceil(numerator / denominator);
  }

  private getZScore(probability: number): number {
    // Approximate z-score calculation
    // In production, use a proper statistical library
    if (probability === 0.5) return 0;
    if (probability === 0.95) return 1.645;
    if (probability === 0.975) return 1.96;
    if (probability === 0.99) return 2.33;
    if (probability === 0.995) return 2.576;

    // Fallback approximation
    return Math.sqrt(2) * this.inverseErrorFunction(2 * probability - 1);
  }

  private inverseErrorFunction(x: number): number {
    // Simplified inverse error function approximation
    const a = 0.147;
    const term1 = Math.log(1 - x * x);
    const term2 = 2 / (Math.PI * a) + term1 / 2;
    const term3 = term1 / a;

    return Math.sign(x) * Math.sqrt(Math.sqrt(term2 * term2 - term3) - term2);
  }

  private isUserEligible(
    userId: string,
    experiment: ExperimentConfig,
    userContext?: Record<string, unknown>
  ): boolean {
    // Check traffic allocation
    const userHash = this.hashUserId(userId);
    if (userHash >= experiment.targeting.trafficAllocation) {
      return false;
    }

    // Check user segments, tiers, etc.
    // In a real implementation, this would check against user database
    return true;
  }

  private assignToVariant(
    userId: string,
    experiment: ExperimentConfig
  ): string {
    const userHash = this.hashUserId(userId + experiment.id);
    let cumulativeAllocation = 0;

    for (const variant of experiment.variants) {
      cumulativeAllocation += variant.allocation;
      if (userHash < cumulativeAllocation) {
        return variant.id;
      }
    }

    // Fallback to control
    return experiment.variants.find(v => v.isControl)!.id;
  }

  private hashUserId(input: string): number {
    // Simple hash function for user assignment
    // In production, use a cryptographic hash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / Math.pow(2, 31);
  }

  private async calculateMetricResult(
    experimentId: string,
    variantId: string,
    metric: MetricDefinition
  ): Promise<ExperimentResult> {
    // In a real implementation, this would query the analytics database
    // For now, return mock data
    const mockSampleSize = 1000 + Math.floor(Math.random() * 500);
    const mockValue = Math.random() * 0.3 + 0.1; // 10-40% conversion rate
    const mockRevenue = mockValue * mockSampleSize * 50; // $50 average revenue per conversion

    return {
      experimentId,
      variantId,
      metric: metric.id,
      value: mockValue,
      sampleSize: mockSampleSize,
      conversionRate: metric.type === 'conversion' ? mockValue : undefined,
      revenue: metric.type === 'revenue' ? mockRevenue : undefined,
      confidence: 0.95,
      pValue: Math.random() * 0.1,
      effect: (Math.random() - 0.5) * 0.4, // -20% to +20% effect
      isSignificant: Math.random() > 0.5,
    };
  }

  private calculateSignificance(
    control: ExperimentResult,
    treatment: ExperimentResult,
    threshold: number
  ): { confidence: number; pValue: number; isSignificant: boolean } {
    // Simplified significance calculation
    // In production, use proper statistical libraries
    const controlRate = control.value;
    const treatmentRate = treatment.value;
    const controlSize = control.sampleSize;
    const treatmentSize = treatment.sampleSize;

    // Standard error for difference in proportions
    const pooledRate =
      (controlRate * controlSize + treatmentRate * treatmentSize) /
      (controlSize + treatmentSize);
    const standardError = Math.sqrt(
      pooledRate * (1 - pooledRate) * (1 / controlSize + 1 / treatmentSize)
    );

    // Z-score
    const zScore = (treatmentRate - controlRate) / standardError;

    // Two-tailed p-value approximation
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

    const confidence = 1 - pValue;
    const isSignificant = confidence >= threshold;

    return { confidence, pValue, isSignificant };
  }

  private normalCDF(x: number): number {
    // Approximation of standard normal cumulative distribution function
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of error function
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y =
      1.0 -
      ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private hasMinimumSampleSize(experimentId: string): boolean {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return false;

    // Check if we have minimum sample size for each variant
    // In a real implementation, this would query actual assignment counts
    return true; // Mock implementation
  }

  private async updateResults(
    experimentId: string,
    variantId: string,
    metricId: string,
    value: number
  ): Promise<void> {
    // Update experiment results cache
    // In a real implementation, this would update a database
    logger.info(
      `Result updated: ${experimentId}:${variantId}:${metricId} = ${value}`
    );
  }

  private async logEvent(
    eventName: string,
    properties: Record<string, unknown>
  ): Promise<void> {
    // Log to analytics system (PostHog, etc.)
    logger.info(`Event logged: ${eventName}`, properties);
  }
}

/**
 * Global experimentation engine instance
 */
export const experimentationEngine = new ExperimentationEngine();

/**
 * Convenience function for checking experiment variants
 */
export async function getExperimentVariant(
  userId: string,
  experimentId: string,
  userContext?: Record<string, unknown>
): Promise<string | null> {
  return experimentationEngine.assignUser(userId, experimentId, userContext);
}

/**
 * Convenience function for tracking experiment conversions
 */
export async function trackExperimentConversion(
  userId: string,
  experimentId: string,
  metricId: string,
  value: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  return experimentationEngine.trackConversion(
    userId,
    experimentId,
    metricId,
    value,
    metadata
  );
}

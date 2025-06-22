/**
 * @madfam/experiments
 *
 * Core experiments manager
 */

import { Logger } from '@madfam/logger';
import type {
  ExperimentsConfig,
  Experiment,
  ExperimentStatus,
  UserContext,
  Assignment,
  FeatureFlag,
  FeatureFlagAssignment,
  ExperimentEvent,
  ExperimentResults,
  Variation,
} from './types';
import { AllocationEngine } from './allocation-engine';
import { TargetingEngine } from './targeting-engine';
import { AnalyticsEngine } from './analytics-engine';
import { CacheManager } from './cache-manager';
import { EventEmitter } from '../utils/event-emitter';

export class Experiments extends EventEmitter {
  private config: ExperimentsConfig;
  private logger: Logger;
  private allocation: AllocationEngine;
  private targeting: TargetingEngine;
  private analytics: AnalyticsEngine;
  private cache: CacheManager;
  private experiments: Map<string, Experiment> = new Map();
  private flags: Map<string, FeatureFlag> = new Map();

  constructor(config: ExperimentsConfig = {}) {
    super();
    this.config = config;
    this.logger = new Logger({
      name: 'experiments',
      level: config.logger?.level || 'info',
      enabled: config.logger?.enabled !== false,
    });

    this.allocation = new AllocationEngine(config.defaultAllocation);
    this.targeting = new TargetingEngine();
    this.analytics = new AnalyticsEngine(config.enableAnalytics !== false);
    this.cache = new CacheManager(config.cacheStrategy);

    this.logger.info('Experiments initialized', { config });
  }

  /**
   * Register an experiment
   */
  async registerExperiment(experiment: Experiment): Promise<void> {
    this.logger.debug('Registering experiment', { experimentId: experiment.id });

    // Validate experiment
    this.validateExperiment(experiment);

    // Store experiment
    this.experiments.set(experiment.id, experiment);
    this.cache.setExperiment(experiment.id, experiment);

    this.logger.info('Experiment registered', { experimentId: experiment.id });
    await this.emit('experiment.registered', experiment);
  }

  /**
   * Get experiment variation for a user
   */
  async getVariation(
    experimentId: string,
    userContext: UserContext
  ): Promise<Assignment> {
    this.logger.debug('Getting variation', { experimentId, userId: userContext.userId });

    // Get experiment
    const experiment = await this.getExperiment(experimentId);
    if (!experiment) {
      throw this.createError('EXPERIMENT_NOT_FOUND', `Experiment ${experimentId} not found`);
    }

    // Check if experiment is running
    if (experiment.status !== 'running') {
      return this.createAssignment(experiment, userContext, null, false, 'Experiment not running');
    }

    // Execute pre-assignment hook
    if (this.config.hooks?.beforeAssignment) {
      await this.config.hooks.beforeAssignment(experiment, userContext);
    }

    // Check targeting
    const isEligible = await this.targeting.evaluate(
      experiment.targeting,
      userContext
    );

    if (!isEligible) {
      return this.createAssignment(experiment, userContext, null, false, 'User not eligible');
    }

    // Check for overrides
    const override = this.checkOverrides(experiment, userContext);
    if (override) {
      const assignment = this.createAssignment(experiment, userContext, override, true, 'Override', true);
      await this.trackAssignment(assignment);
      return assignment;
    }

    // Get cached assignment if sticky
    if (experiment.allocation.sticky) {
      const cached = await this.cache.getAssignment(experimentId, userContext.userId);
      if (cached) {
        await this.trackExposure(cached);
        return cached;
      }
    }

    // Allocate variation
    const variation = await this.allocation.allocate(
      experiment,
      userContext
    );

    const assignment = this.createAssignment(experiment, userContext, variation, true);

    // Cache assignment if sticky
    if (experiment.allocation.sticky) {
      await this.cache.setAssignment(experimentId, userContext.userId, assignment);
    }

    // Execute post-assignment hook
    if (this.config.hooks?.afterAssignment) {
      await this.config.hooks.afterAssignment(assignment);
    }

    // Track assignment
    await this.trackAssignment(assignment);

    return assignment;
  }

  /**
   * Register a feature flag
   */
  async registerFlag(flag: FeatureFlag): Promise<void> {
    this.logger.debug('Registering feature flag', { flagKey: flag.key });

    // Validate flag
    this.validateFlag(flag);

    // Store flag
    this.flags.set(flag.key, flag);
    this.cache.setFlag(flag.key, flag);

    this.logger.info('Feature flag registered', { flagKey: flag.key });
    await this.emit('flag.registered', flag);
  }

  /**
   * Evaluate a feature flag
   */
  async evaluateFlag(
    flagKey: string,
    userContext: UserContext,
    defaultValue?: unknown
  ): Promise<FeatureFlagAssignment> {
    this.logger.debug('Evaluating flag', { flagKey, userId: userContext.userId });

    // Get flag
    const flag = await this.getFlag(flagKey);
    if (!flag) {
      return {
        flagKey,
        userId: userContext.userId,
        enabled: false,
        value: defaultValue ?? false,
        timestamp: new Date(),
        reason: 'Flag not found',
      };
    }

    // Check if flag is enabled
    if (!flag.enabled) {
      return {
        flagKey,
        userId: userContext.userId,
        enabled: false,
        value: flag.defaultValue ?? defaultValue ?? false,
        timestamp: new Date(),
        reason: 'Flag disabled',
      };
    }

    // Check prerequisites
    if (flag.prerequisites && flag.prerequisites.length > 0) {
      const prerequisitesMet = await this.checkPrerequisites(flag.prerequisites, userContext);
      if (!prerequisitesMet) {
        return {
          flagKey,
          userId: userContext.userId,
          enabled: false,
          value: flag.defaultValue ?? defaultValue ?? false,
          timestamp: new Date(),
          reason: 'Prerequisites not met',
        };
      }
    }

    // Check targeting
    if (flag.targeting) {
      const isEligible = await this.targeting.evaluate(flag.targeting, userContext);
      if (!isEligible) {
        return {
          flagKey,
          userId: userContext.userId,
          enabled: false,
          value: flag.defaultValue ?? defaultValue ?? false,
          timestamp: new Date(),
          reason: 'Targeting not met',
        };
      }
    }

    // Handle simple boolean flags
    if (!flag.variations || flag.variations.length === 0) {
      const enabled = flag.rolloutPercentage
        ? this.isInRollout(userContext.userId, flag.key, flag.rolloutPercentage)
        : true;

      return {
        flagKey,
        userId: userContext.userId,
        enabled,
        value: enabled ? flag.defaultValue : (defaultValue ?? false),
        timestamp: new Date(),
      };
    }

    // Handle variations
    const variation = await this.allocation.allocateFlag(flag, userContext);
    
    return {
      flagKey,
      userId: userContext.userId,
      enabled: true,
      value: variation.value,
      variation: variation.id,
      timestamp: new Date(),
    };
  }

  /**
   * Track conversion event
   */
  async trackConversion(
    experimentId: string,
    userId: string,
    eventName: string,
    properties?: Record<string, unknown>
  ): Promise<void> {
    this.logger.debug('Tracking conversion', { experimentId, userId, eventName });

    const event: ExperimentEvent = {
      id: this.generateId(),
      type: 'conversion',
      experimentId,
      userId,
      timestamp: new Date(),
      properties: {
        ...properties,
        eventName,
      },
    };

    await this.analytics.trackEvent(event);

    if (this.config.hooks?.onConversion) {
      await this.config.hooks.onConversion(event);
    }

    await this.emit('conversion.tracked', event);
  }

  /**
   * Track custom metric
   */
  async trackMetric(
    experimentId: string,
    userId: string,
    metricName: string,
    value: number,
    properties?: Record<string, unknown>
  ): Promise<void> {
    this.logger.debug('Tracking metric', { experimentId, userId, metricName, value });

    const event: ExperimentEvent = {
      id: this.generateId(),
      type: 'metric',
      experimentId,
      userId,
      timestamp: new Date(),
      value,
      properties: {
        ...properties,
        metricName,
      },
    };

    await this.analytics.trackEvent(event);
    await this.emit('metric.tracked', event);
  }

  /**
   * Get experiment results
   */
  async getResults(experimentId: string): Promise<ExperimentResults> {
    this.logger.debug('Getting results', { experimentId });

    const experiment = await this.getExperiment(experimentId);
    if (!experiment) {
      throw this.createError('EXPERIMENT_NOT_FOUND', `Experiment ${experimentId} not found`);
    }

    return this.analytics.calculateResults(experiment);
  }

  /**
   * Update experiment status
   */
  async updateExperimentStatus(
    experimentId: string,
    status: ExperimentStatus
  ): Promise<void> {
    this.logger.debug('Updating experiment status', { experimentId, status });

    const experiment = await this.getExperiment(experimentId);
    if (!experiment) {
      throw this.createError('EXPERIMENT_NOT_FOUND', `Experiment ${experimentId} not found`);
    }

    experiment.status = status;
    experiment.updatedAt = new Date();

    if (status === 'running' && !experiment.startDate) {
      experiment.startDate = new Date();
    } else if ((status === 'completed' || status === 'archived') && !experiment.endDate) {
      experiment.endDate = new Date();
    }

    this.experiments.set(experimentId, experiment);
    await this.cache.setExperiment(experimentId, experiment);

    await this.emit('experiment.status_changed', { experimentId, status });
  }

  /**
   * Private helper methods
   */
  private async getExperiment(experimentId: string): Promise<Experiment | null> {
    // Check cache first
    const cached = await this.cache.getExperiment(experimentId);
    if (cached) return cached;

    // Get from memory
    return this.experiments.get(experimentId) || null;
  }

  private async getFlag(flagKey: string): Promise<FeatureFlag | null> {
    // Check cache first
    const cached = await this.cache.getFlag(flagKey);
    if (cached) return cached;

    // Get from memory
    return this.flags.get(flagKey) || null;
  }

  private validateExperiment(experiment: Experiment): void {
    if (!experiment.id || !experiment.name) {
      throw this.createError('INVALID_CONFIGURATION', 'Experiment must have id and name');
    }

    if (!experiment.variations || experiment.variations.length < 2) {
      throw this.createError('INVALID_CONFIGURATION', 'Experiment must have at least 2 variations');
    }

    const totalWeight = experiment.variations.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw this.createError('INVALID_CONFIGURATION', 'Variation weights must sum to 100');
    }
  }

  private validateFlag(flag: FeatureFlag): void {
    if (!flag.key || !flag.name) {
      throw this.createError('INVALID_CONFIGURATION', 'Flag must have key and name');
    }

    if (flag.variations) {
      const totalWeight = flag.variations.reduce((sum, v) => sum + v.weight, 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        throw this.createError('INVALID_CONFIGURATION', 'Variation weights must sum to 100');
      }
    }
  }

  private checkOverrides(
    experiment: Experiment,
    userContext: UserContext
  ): Variation | null {
    if (!experiment.allocation.overrides) return null;

    for (const override of experiment.allocation.overrides) {
      if (override.userId === userContext.userId) {
        return experiment.variations.find(v => v.id === override.variationId) || null;
      }

      if (override.segmentId && userContext.segments?.includes(override.segmentId)) {
        return experiment.variations.find(v => v.id === override.variationId) || null;
      }
    }

    return null;
  }

  private async checkPrerequisites(
    prerequisites: string[],
    userContext: UserContext
  ): Promise<boolean> {
    for (const flagKey of prerequisites) {
      const result = await this.evaluateFlag(flagKey, userContext);
      if (!result.enabled) return false;
    }
    return true;
  }

  private isInRollout(userId: string, flagKey: string, percentage: number): boolean {
    const hash = this.hash(`${userId}:${flagKey}`);
    return (hash % 100) < percentage;
  }

  private createAssignment(
    experiment: Experiment,
    userContext: UserContext,
    variation: Variation | null,
    eligible: boolean,
    reason?: string,
    forced?: boolean
  ): Assignment {
    return {
      experimentId: experiment.id,
      userId: userContext.userId,
      variationId: variation?.id || '',
      timestamp: new Date(),
      eligible,
      reason,
      forced,
      context: userContext.attributes,
    };
  }

  private async trackAssignment(assignment: Assignment): Promise<void> {
    if (!assignment.eligible) return;

    const event: ExperimentEvent = {
      id: this.generateId(),
      type: 'exposure',
      experimentId: assignment.experimentId,
      userId: assignment.userId,
      variationId: assignment.variationId,
      timestamp: assignment.timestamp,
    };

    await this.analytics.trackEvent(event);
    await this.emit('assignment.tracked', assignment);
  }

  private async trackExposure(assignment: Assignment): Promise<void> {
    if (this.config.hooks?.onExposure) {
      const event: ExperimentEvent = {
        id: this.generateId(),
        type: 'exposure',
        experimentId: assignment.experimentId,
        userId: assignment.userId,
        variationId: assignment.variationId,
        timestamp: new Date(),
      };
      await this.config.hooks.onExposure(event);
    }
  }

  private createError(code: string, message: string): Error {
    const error = new Error(message) as any;
    error.code = code;
    return error;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private hash(input: string): number {
    // Simple hash function for demo - in production use murmurhash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
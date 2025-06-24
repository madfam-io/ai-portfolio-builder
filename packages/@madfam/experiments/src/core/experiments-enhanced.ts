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

import { Experiments } from './experiments';
import { MemoryStorageAdapter } from '../adapters/storage/memory';
import { MemoryPersistenceAdapter } from '../adapters/persistence/memory';
import type {
  StorageAdapter,
  PersistenceAdapter,
  AnalyticsAdapter,
} from '../adapters/types';
import type { ExperimentsConfigWithAdapters } from './config';
import type {
  Experiment,
  FeatureFlag,
  UserContext,
  Assignment,
  FeatureFlagAssignment,
  ExperimentEvent,
} from './types';

/**
 * Enhanced Experiments class with adapter support
 */
export class ExperimentsEnhanced extends Experiments {
  private storageAdapter: StorageAdapter;
  private persistenceAdapter: PersistenceAdapter;
  private analyticsAdapter?: AnalyticsAdapter;

  constructor(config: ExperimentsConfigWithAdapters = {}) {
    super(config);

    // Initialize adapters with defaults
    this.storageAdapter = config.storage || new MemoryStorageAdapter();
    this.persistenceAdapter =
      config.persistence || new MemoryPersistenceAdapter();
    this.analyticsAdapter = config.analytics;
  }

  /**
   * Load experiments from storage
   */
  async loadExperiments(): Promise<void> {
    const experiments = await this.storageAdapter.listExperiments({
      status: 'active',
    });

    for (const experiment of experiments) {
      await this.registerExperiment(experiment);
    }
  }

  /**
   * Load feature flags from storage
   */
  async loadFlags(): Promise<void> {
    const flags = await this.storageAdapter.listFlags({
      enabled: true,
    });

    for (const flag of flags) {
      await this.registerFlag(flag);
    }
  }

  /**
   * Override registerExperiment to save to storage
   */
  async registerExperiment(experiment: Experiment): Promise<void> {
    await super.registerExperiment(experiment);
    await this.storageAdapter.saveExperiment(experiment);
  }

  /**
   * Override registerFlag to save to storage
   */
  async registerFlag(flag: FeatureFlag): Promise<void> {
    await super.registerFlag(flag);
    await this.storageAdapter.saveFlag(flag);
  }

  /**
   * Get variation with persistence support
   */
  async getVariation(
    experimentId: string,
    userContext: UserContext
  ): Promise<Assignment> {
    // Check for persisted assignment first
    const persisted = await this.persistenceAdapter.getAssignment(
      experimentId,
      userContext.userId
    );

    if (persisted) {
      // Track exposure for persisted assignment
      await this.trackExposure(persisted);
      return persisted;
    }

    // Get new assignment
    const assignment = await super.getVariation(experimentId, userContext);

    // Persist the assignment
    await this.persistenceAdapter.saveAssignment(assignment);

    return assignment;
  }

  /**
   * Evaluate flag with persistence support
   */
  async evaluateFlag(
    flagKey: string,
    userContext: UserContext,
    defaultValue?: import('./value-types').FeatureFlagValue
  ): Promise<FeatureFlagAssignment> {
    // Check for persisted assignment first
    const persisted = await this.persistenceAdapter.getFlagAssignment(
      flagKey,
      userContext.userId
    );

    if (persisted) {
      return persisted;
    }

    // Get new assignment
    const assignment = await super.evaluateFlag(
      flagKey,
      userContext,
      defaultValue
    );

    // Persist the assignment
    await this.persistenceAdapter.saveFlagAssignment(assignment);

    return assignment;
  }

  /**
   * Track assignment with analytics adapter
   */
  protected async trackAssignment(assignment: Assignment): Promise<void> {
    await super.trackAssignment(assignment);

    if (this.analyticsAdapter) {
      await this.analyticsAdapter.trackAssignment(assignment);
    }

    // Store event
    const event: ExperimentEvent = {
      id: this.generateEventId(),
      experimentId: assignment.experimentId,
      userId: assignment.userId,
      type: 'assignment',
      variationId: assignment.variation.id,
      timestamp: new Date(),
      metadata: {
        reason: assignment.reason,
      },
    };

    await this.storageAdapter.recordEvent(event);
  }

  /**
   * Track exposure with analytics adapter
   */
  protected async trackExposure(assignment: Assignment): Promise<void> {
    await super.trackExposure(assignment);

    if (this.analyticsAdapter) {
      await this.analyticsAdapter.trackExposure(assignment);
    }
  }

  /**
   * Track conversion event
   */
  async trackConversion(
    experimentId: string,
    userId: string,
    value?: number,
    metadata?: import('./value-types').AnalyticsProperties
  ): Promise<void> {
    await super.trackConversion(experimentId, userId, value, metadata);

    if (this.analyticsAdapter) {
      await this.analyticsAdapter.trackConversion(
        experimentId,
        userId,
        value,
        metadata
      );
    }

    // Store event
    const assignment = await this.persistenceAdapter.getAssignment(
      experimentId,
      userId
    );

    if (assignment) {
      const event: ExperimentEvent = {
        id: this.generateEventId(),
        experimentId,
        userId,
        type: 'conversion',
        variationId: assignment.variation.id,
        timestamp: new Date(),
        value,
        metadata,
      };

      await this.storageAdapter.recordEvent(event);
    }
  }

  /**
   * Get or create visitor ID
   */
  getOrCreateVisitorId(): Promise<string> {
    return this.persistenceAdapter.getOrCreateVisitorId();
  }

  /**
   * Clear user assignments
   */
  async clearUserAssignments(userId: string): Promise<void> {
    await this.persistenceAdapter.clearUserAssignments(userId);
  }

  /**
   * Get experiment results
   */
  async getExperimentResults(
    experimentId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    experimentId: string;
    totalAssignments: number;
    totalConversions: number;
    conversionRate: number;
    variations: Map<
      string,
      {
        assignments: number;
        conversions: number;
        conversionRate: number;
      }
    >;
  }> {
    const events = await this.storageAdapter.getEvents(experimentId, {
      startDate,
      endDate,
    });

    // Calculate results from events
    // This is a simplified version - in production you'd want more sophisticated analysis
    const results = {
      experimentId,
      totalAssignments: events.filter(e => e.type === 'assignment').length,
      totalConversions: events.filter(e => e.type === 'conversion').length,
      conversionRate:
        events.filter(e => e.type === 'conversion').length /
        events.filter(e => e.type === 'assignment').length,
      variations: new Map<
        string,
        {
          assignments: number;
          conversions: number;
          conversionRate: number;
        }
      >(),
    };

    // Group by variation
    for (const event of events) {
      if (!results.variations.has(event.variationId)) {
        results.variations.set(event.variationId, {
          assignments: 0,
          conversions: 0,
          conversionRate: 0,
        });
      }

      const varStats = results.variations.get(event.variationId);
      if (event.type === 'assignment') {
        varStats.assignments++;
      } else if (event.type === 'conversion') {
        varStats.conversions++;
      }
    }

    // Calculate conversion rates per variation
    for (const [, stats] of results.variations) {
      stats.conversionRate = stats.conversions / stats.assignments;
    }

    return results;
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

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

import { ExperimentsEnhanced } from '../../core/experiments-enhanced';
import { SupabaseStorageAdapter } from '../../adapters/storage/supabase';
import { NextJsPersistenceAdapter } from './persistence';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserContext } from '../../core/types';

/**
 * Response type for landing page experiments
 * Matches the existing feature flag service API
 */
interface GetActiveExperimentResponse {
  experimentId: string;
  variantId: string;
  variantName: string;
  components: Array<Record<string, unknown>>;
  themeOverrides?: Record<string, unknown>;
}

/**
 * Visitor assignment type from the old system
 */
interface VisitorAssignment {
  experimentId: string;
  variantId: string;
  assignedAt: Date;
}

/**
 * Migration wrapper that provides compatibility with the existing FeatureFlagService
 * while using the new experiments package under the hood
 */
export class LegacyFeatureFlagService {
  private experiments: ExperimentsEnhanced;

  constructor(supabaseClient?: SupabaseClient) {
    // Initialize with adapters that match the old behavior
    this.experiments = new ExperimentsEnhanced({
      storage: supabaseClient
        ? new SupabaseStorageAdapter(supabaseClient)
        : undefined,
      persistence: new NextJsPersistenceAdapter({
        maxAge: 90 * 24 * 60 * 60, // 90 days like the old system
      }),
      enableAnalytics: true,
    });

    // Load experiments from storage on initialization
    if (supabaseClient) {
      this.loadExperiments();
    }
  }

  /**
   * Load active experiments from Supabase
   */
  private async loadExperiments(): Promise<void> {
    try {
      await this.experiments.loadExperiments();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to load experiments:', error);
      }
    }
  }

  /**
   * Get active experiment for visitor (legacy API)
   */
  static async getActiveExperiment(visitorContext?: {
    country?: string;
    device?: string;
    language?: string;
    referrer?: string;
    utmSource?: string;
  }): Promise<GetActiveExperimentResponse | null> {
    // Create a singleton instance for static method
    const service = new LegacyFeatureFlagService();

    // Get or create visitor ID
    const visitorId = await service.experiments.getOrCreateVisitorId();

    // Build user context from visitor context
    const userContext: UserContext = {
      userId: visitorId,
      attributes: {
        ...visitorContext,
        isAnonymous: true,
      },
    };

    try {
      // Get all active experiments
      const experiments = await service.experiments.listExperiments();

      // Find the first matching experiment (like the old system)
      for (const experiment of experiments) {
        if (experiment.status !== 'active') continue;

        // Check schedule
        const now = new Date();
        if (experiment.startDate && now < experiment.startDate) continue;
        if (experiment.endDate && now > experiment.endDate) continue;

        // Get assignment
        const assignment = await service.experiments.getVariation(
          experiment.id,
          userContext
        );

        if (assignment && assignment.eligible) {
          // Map to legacy response format
          return {
            experimentId: experiment.id,
            variantId: assignment.variation.id,
            variantName: assignment.variation.name,
            components: assignment.variation.changes?.components || [],
            themeOverrides: assignment.variation.changes?.theme,
          };
        }
      }

      return null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.error('Failed to get active experiment:', error);
      }
      return null;
    }
  }

  /**
   * Record conversion event (legacy API)
   */
  static async recordConversion(
    experimentId: string,
    variantId: string,
    conversionData?: import('../../core/value-types').AnalyticsProperties
  ): Promise<void> {
    const service = new LegacyFeatureFlagService();
    const visitorId = await service.experiments.getOrCreateVisitorId();

    await service.experiments.trackConversion(
      experimentId,
      visitorId,
      undefined,
      {
        ...conversionData,
        variantId,
      }
    );
  }

  /**
   * Record click event (legacy API)
   */
  static async recordClick(
    experimentId: string,
    variantId: string,
    element: string,
    additionalData?: import('../../core/value-types').AnalyticsProperties
  ): Promise<void> {
    const service = new LegacyFeatureFlagService();
    const visitorId = await service.experiments.getOrCreateVisitorId();

    await service.experiments.trackEvent('click', {
      experimentId,
      variantId,
      element,
      userId: visitorId,
      timestamp: new Date().toISOString(),
      ...additionalData,
    });
  }

  /**
   * Get all assignments for the current visitor (legacy API)
   */
  static async getAssignments(): Promise<Record<string, VisitorAssignment>> {
    const service = new LegacyFeatureFlagService();
    const visitorId = await service.experiments.getOrCreateVisitorId();

    const assignments = await service.experiments.getUserAssignments(visitorId);

    // Convert to legacy format
    const legacyAssignments: Record<string, VisitorAssignment> = {};

    for (const assignment of assignments) {
      legacyAssignments[assignment.experimentId] = {
        experimentId: assignment.experimentId,
        variantId: assignment.variation.id,
        assignedAt: assignment.timestamp,
      };
    }

    return legacyAssignments;
  }

  /**
   * Clear all assignments (legacy API)
   */
  static async clearAssignments(): Promise<void> {
    const service = new LegacyFeatureFlagService();
    const visitorId = await service.experiments.getOrCreateVisitorId();

    await service.experiments.clearUserAssignments(visitorId);
  }

  /**
   * Check if a specific feature is enabled (legacy API)
   */
  static async isFeatureEnabled(
    componentType: string,
    variantName: string
  ): Promise<boolean> {
    const experiment = await this.getActiveExperiment();

    if (!experiment) {
      return false;
    }

    const component = experiment.components.find(
      c => c.type === componentType && c.variant === variantName
    );

    return component?.visible || false;
  }
}

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

import type {
  Experiment,
  FeatureFlag,
  Assignment,
  FeatureFlagAssignment,
  ExperimentEvent,
} from '../core/types';

/**
 * Storage adapter for experiments and feature flags
 */
export interface StorageAdapter {
  /**
   * Get an experiment by ID
   */
  getExperiment(id: string): Promise<Experiment | null>;

  /**
   * Save an experiment
   */
  saveExperiment(experiment: Experiment): Promise<void>;

  /**
   * List all experiments
   */
  listExperiments(filters?: {
    status?: string;
    type?: string;
  }): Promise<Experiment[]>;

  /**
   * Get a feature flag by key
   */
  getFlag(key: string): Promise<FeatureFlag | null>;

  /**
   * Save a feature flag
   */
  saveFlag(flag: FeatureFlag): Promise<void>;

  /**
   * List all feature flags
   */
  listFlags(filters?: { enabled?: boolean }): Promise<FeatureFlag[]>;

  /**
   * Record an event
   */
  recordEvent(event: ExperimentEvent): Promise<void>;

  /**
   * Get events for an experiment
   */
  getEvents(
    experimentId: string,
    filters?: {
      userId?: string;
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ExperimentEvent[]>;
}

/**
 * Persistence adapter for user assignments
 */
export interface PersistenceAdapter {
  /**
   * Get a user's assignment for an experiment
   */
  getAssignment(
    experimentId: string,
    userId: string
  ): Promise<Assignment | null>;

  /**
   * Save a user's assignment
   */
  saveAssignment(assignment: Assignment): Promise<void>;

  /**
   * Get all assignments for a user
   */
  getUserAssignments(userId: string): Promise<Assignment[]>;

  /**
   * Clear assignments for a user
   */
  clearUserAssignments(userId: string): Promise<void>;

  /**
   * Get a feature flag assignment
   */
  getFlagAssignment(
    flagKey: string,
    userId: string
  ): Promise<FeatureFlagAssignment | null>;

  /**
   * Save a feature flag assignment
   */
  saveFlagAssignment(assignment: FeatureFlagAssignment): Promise<void>;

  /**
   * Get or create a visitor ID
   */
  getOrCreateVisitorId(): Promise<string>;
}

/**
 * Analytics adapter for tracking metrics
 */
export interface AnalyticsAdapter {
  /**
   * Track an assignment event
   */
  trackAssignment(assignment: Assignment): Promise<void>;

  /**
   * Track an exposure event
   */
  trackExposure(assignment: Assignment): Promise<void>;

  /**
   * Track a conversion event
   */
  trackConversion(
    experimentId: string,
    userId: string,
    value?: number,
    metadata?: Record<string, any>
  ): Promise<void>;

  /**
   * Track a custom event
   */
  trackEvent(
    eventName: string,
    properties?: Record<string, any>
  ): Promise<void>;

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>): Promise<void>;
}

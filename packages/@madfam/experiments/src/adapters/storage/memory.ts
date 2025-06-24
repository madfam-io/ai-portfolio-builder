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

import type { StorageAdapter } from '../types';
import type {
  Experiment,
  FeatureFlag,
  ExperimentEvent,
} from '../../core/types';

/**
 * In-memory storage adapter for experiments and feature flags
 * Useful for testing and development
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private experiments: Map<string, Experiment> = new Map();
  private flags: Map<string, FeatureFlag> = new Map();
  private events: ExperimentEvent[] = [];

  getExperiment(id: string): Promise<Experiment | null> {
    return this.experiments.get(id) || null;
  }

  saveExperiment(experiment: Experiment): Promise<void> {
    this.experiments.set(experiment.id, experiment);
  }

  listExperiments(filters?: {
    status?: string;
    type?: string;
  }): Promise<Experiment[]> {
    let experiments = Array.from(this.experiments.values());

    if (filters?.status) {
      experiments = experiments.filter(e => e.status === filters.status);
    }

    if (filters?.type) {
      experiments = experiments.filter(e => e.type === filters.type);
    }

    return experiments;
  }

  getFlag(key: string): Promise<FeatureFlag | null> {
    return this.flags.get(key) || null;
  }

  saveFlag(flag: FeatureFlag): Promise<void> {
    this.flags.set(flag.key, flag);
  }

  listFlags(filters?: { enabled?: boolean }): Promise<FeatureFlag[]> {
    let flags = Array.from(this.flags.values());

    if (filters?.enabled !== undefined) {
      flags = flags.filter(f => f.enabled === filters.enabled);
    }

    return flags;
  }

  recordEvent(event: ExperimentEvent): Promise<void> {
    this.events.push(event);
  }

  getEvents(
    experimentId: string,
    filters?: {
      userId?: string;
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ExperimentEvent[]> {
    let events = this.events.filter(e => e.experimentId === experimentId);

    if (filters?.userId) {
      events = events.filter(e => e.userId === filters.userId);
    }

    if (filters?.eventType) {
      events = events.filter(e => e.type === filters.eventType);
    }

    if (filters?.startDate) {
      events = events.filter(
        e => filters.startDate && e.timestamp >= filters.startDate
      );
    }

    if (filters?.endDate) {
      events = events.filter(
        e => filters.endDate && e.timestamp <= filters.endDate
      );
    }

    return events;
  }

  /**
   * Clear all data (useful for testing)
   */
  clear(): void {
    this.experiments.clear();
    this.flags.clear();
    this.events = [];
  }
}

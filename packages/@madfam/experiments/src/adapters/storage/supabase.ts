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

import type { SupabaseClient } from '@supabase/supabase-js';
import type { StorageAdapter } from '../types';
import type {
  Experiment,
  FeatureFlag,
  ExperimentEvent,
} from '../../core/types';
import type {
  DatabaseExperimentRecord,
  DatabaseEventRecord,
} from '../../core/value-types';

/**
 * Supabase storage adapter for experiments and feature flags
 */
export class SupabaseStorageAdapter implements StorageAdapter {
  constructor(private supabase: SupabaseClient) {}

  async getExperiment(id: string): Promise<Experiment | null> {
    const { data, error } = await this.supabase
      .from('experiments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToExperiment(data);
  }

  async saveExperiment(experiment: Experiment): Promise<void> {
    const { error } = await this.supabase
      .from('experiments')
      .upsert(this.mapFromExperiment(experiment));

    if (error) {
      throw new Error(`Failed to save experiment: ${error.message}`);
    }
  }

  async listExperiments(filters?: {
    status?: string;
    type?: string;
  }): Promise<Experiment[]> {
    let query = this.supabase.from('experiments').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list experiments: ${error.message}`);
    }

    return (data || []).map(this.mapToExperiment);
  }

  async getFlag(key: string): Promise<FeatureFlag | null> {
    const { data, error } = await this.supabase
      .from('feature_flags')
      .select('*')
      .eq('key', key)
      .single();

    if (error || !data) return null;

    return this.mapToFeatureFlag(data);
  }

  async saveFlag(flag: FeatureFlag): Promise<void> {
    const { error } = await this.supabase
      .from('feature_flags')
      .upsert(this.mapFromFeatureFlag(flag));

    if (error) {
      throw new Error(`Failed to save feature flag: ${error.message}`);
    }
  }

  async listFlags(filters?: { enabled?: boolean }): Promise<FeatureFlag[]> {
    let query = this.supabase.from('feature_flags').select('*');

    if (filters?.enabled !== undefined) {
      query = query.eq('enabled', filters.enabled);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to list feature flags: ${error.message}`);
    }

    return (data || []).map(this.mapToFeatureFlag);
  }

  async recordEvent(event: ExperimentEvent): Promise<void> {
    const { error } = await this.supabase.from('experiment_events').insert({
      experiment_id: event.experimentId,
      user_id: event.userId,
      type: event.type,
      variation_id: event.variationId,
      timestamp: event.timestamp.toISOString(),
      value: event.value,
      metadata: event.metadata,
    });

    if (error) {
      throw new Error(`Failed to record event: ${error.message}`);
    }
  }

  async getEvents(
    experimentId: string,
    filters?: {
      userId?: string;
      eventType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<ExperimentEvent[]> {
    let query = this.supabase
      .from('experiment_events')
      .select('*')
      .eq('experiment_id', experimentId);

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters?.eventType) {
      query = query.eq('type', filters.eventType);
    }

    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate.toISOString());
    }

    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get events: ${error.message}`);
    }

    return (data || []).map(this.mapToEvent);
  }

  /**
   * Map database record to Experiment type
   */
  private mapToExperiment(data: DatabaseExperimentRecord): Experiment {
    return {
      id: data.id,
      key: data.key,
      name: data.name,
      description: data.description,
      type: data.type,
      status: data.status,
      variations: data.variations,
      metrics: data.metrics,
      targeting: data.targeting,
      allocation: data.allocation,
      schedule: data.schedule
        ? {
            startDate: new Date(data.schedule.start_date),
            endDate: data.schedule.end_date
              ? new Date(data.schedule.end_date)
              : undefined,
          }
        : undefined,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Map Experiment type to database record
   */
  private mapFromExperiment(
    experiment: Experiment
  ): Partial<DatabaseExperimentRecord> {
    return {
      id: experiment.id,
      key: experiment.key || experiment.id,
      name: experiment.name,
      description: experiment.description || null,
      type: experiment.type as string,
      status: experiment.status as string,
      variations: experiment.variations as import('../value-types').JsonValue,
      metrics: experiment.metrics as import('../value-types').JsonValue,
      targeting: experiment.targeting as import('../value-types').JsonValue,
      allocation: experiment.allocation as import('../value-types').JsonValue,
      schedule: experiment.schedule
        ? {
            start_date: experiment.schedule.startDate.toISOString(),
            end_date: experiment.schedule.endDate?.toISOString(),
          }
        : null,
      metadata: experiment.metadata as import('../value-types').JsonValue,
      created_at: experiment.createdAt.toISOString(),
      updated_at: experiment.updatedAt.toISOString(),
    };
  }

  /**
   * Map database record to FeatureFlag type
   */
  private mapToFeatureFlag(data: DatabaseExperimentRecord): FeatureFlag {
    return {
      id: data.id,
      key: data.key,
      name: data.name,
      description: data.description,
      type: data.type,
      enabled: data.enabled,
      defaultValue: data.default_value,
      variations: data.variations,
      targeting: data.targeting,
      metadata: data.metadata,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  /**
   * Map FeatureFlag type to database record
   */
  private mapFromFeatureFlag(
    flag: FeatureFlag
  ): Partial<import('../value-types').DatabaseExperimentRecord> {
    return {
      id: flag.id,
      key: flag.key,
      name: flag.name,
      description: flag.description,
      type: flag.type,
      enabled: flag.enabled,
      default_value: flag.defaultValue,
      variations: flag.variations,
      targeting: flag.targeting,
      metadata: flag.metadata,
      created_at: flag.createdAt.toISOString(),
      updated_at: flag.updatedAt.toISOString(),
    };
  }

  /**
   * Map database record to ExperimentEvent type
   */
  private mapToEvent(data: DatabaseEventRecord): ExperimentEvent {
    return {
      id: data.id,
      experimentId: data.experiment_id,
      userId: data.user_id,
      type: data.type,
      variationId: data.variation_id,
      timestamp: new Date(data.timestamp),
      value: data.value,
      metadata: data.metadata,
    };
  }
}

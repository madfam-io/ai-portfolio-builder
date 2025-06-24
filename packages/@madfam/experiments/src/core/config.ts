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
  StorageAdapter,
  PersistenceAdapter,
  AnalyticsAdapter,
} from '../adapters/types';
import type {
  ExperimentsConfig as BaseConfig,
  AllocationStrategy,
  CacheStrategy,
  LoggerConfig,
  ExperimentHooks,
} from './types';

/**
 * Extended configuration for experiments with adapter support
 */
export interface ExperimentsConfigWithAdapters extends BaseConfig {
  /**
   * Storage adapter for experiments and feature flags
   */
  storage?: StorageAdapter;

  /**
   * Persistence adapter for user assignments
   */
  persistence?: PersistenceAdapter;

  /**
   * Analytics adapter for tracking events
   */
  analytics?: AnalyticsAdapter;

  /**
   * Default allocation strategy
   */
  defaultAllocation?: AllocationStrategy;

  /**
   * Enable built-in analytics
   */
  enableAnalytics?: boolean;

  /**
   * Enable debug mode
   */
  enableDebugMode?: boolean;

  /**
   * Refresh interval for fetching experiments (ms)
   */
  refreshInterval?: number;

  /**
   * Request timeout (ms)
   */
  timeout?: number;

  /**
   * Cache strategy
   */
  cacheStrategy?: CacheStrategy;

  /**
   * Logger configuration
   */
  logger?: LoggerConfig;

  /**
   * Lifecycle hooks
   */
  hooks?: ExperimentHooks;
}

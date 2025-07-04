/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @madfam/experiments
 *
 * Core type definitions for the experiments system
 */

// Experiment types
export interface Experiment {
  id: string;
  key?: string;
  name: string;
  description?: string;
  status: ExperimentStatus;
  type: ExperimentType;
  startDate?: Date;
  endDate?: Date;
  targeting?: TargetingRules;
  variations: Variation[];
  allocation: AllocationStrategy;
  metrics: Metric[];
  schedule?: {
    startDate: Date;
    endDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  tags?: string[];
  metadata?: import('./value-types').ExperimentMetadata;
}

export type ExperimentStatus =
  | 'draft'
  | 'scheduled'
  | 'running'
  | 'paused'
  | 'completed'
  | 'archived';

export type ExperimentType =
  | 'a/b'
  | 'multivariate'
  | 'feature-flag'
  | 'rollout'
  | 'holdout';

// Variation types
export interface Variation {
  id: string;
  name: string;
  description?: string;
  weight: number; // 0-100
  isControl?: boolean;
  changes?: import('./value-types').VariationChanges;
  overrides?: import('./value-types').JsonValue;
}

// Feature flag types
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  defaultValue: import('./value-types').FeatureFlagValue;
  type: FeatureFlagType;
  variations?: FeatureFlagVariation[];
  targeting?: TargetingRules;
  rolloutPercentage?: number;
  prerequisites?: string[]; // Other flag keys
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type FeatureFlagType =
  | 'boolean'
  | 'string'
  | 'number'
  | 'json'
  | 'percentage';

export interface FeatureFlagVariation {
  id: string;
  value: import('./value-types').FeatureFlagValue;
  weight: number;
  name?: string;
  description?: string;
}

// Targeting types
export interface TargetingRules {
  audiences?: Audience[];
  segments?: Segment[];
  conditions?: TargetingCondition[];
  percentage?: number;
  enabled?: boolean;
}

export interface Audience {
  id: string;
  name: string;
  description?: string;
  conditions: AudienceCondition[];
  operator: 'AND' | 'OR';
}

export interface Segment {
  id: string;
  name: string;
  userIds?: string[];
  attributes?: import('./value-types').SegmentAttributes;
}

export interface TargetingCondition {
  attribute: string;
  operator: ConditionOperator;
  value: import('./value-types').TargetingValue;
  negate?: boolean;
}

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in'
  | 'regex'
  | 'exists'
  | 'not_exists';

export interface AudienceCondition extends TargetingCondition {
  id: string;
}

// Allocation types
export interface AllocationStrategy {
  type: AllocationType;
  seed?: string;
  salt?: string;
  sticky?: boolean;
  overrides?: AllocationOverride[];
}

export type AllocationType =
  | 'random'
  | 'deterministic'
  | 'weighted'
  | 'percentage'
  | 'custom';

export interface AllocationOverride {
  userId?: string;
  segmentId?: string;
  variationId: string;
}

// Metric types
export interface Metric {
  id: string;
  name: string;
  type: MetricType;
  goal?: MetricGoal;
  unit?: string;
  aggregation?: AggregationType;
  winCondition?: WinCondition;
}

export type MetricType =
  | 'conversion'
  | 'revenue'
  | 'count'
  | 'duration'
  | 'percentage'
  | 'custom';

export type MetricGoal = 'increase' | 'decrease' | 'maintain';

export type AggregationType =
  | 'sum'
  | 'average'
  | 'median'
  | 'min'
  | 'max'
  | 'count'
  | 'unique';

export interface WinCondition {
  threshold: number;
  confidence: number;
  minimumSampleSize?: number;
}

// User context types
export interface UserContext {
  userId: string;
  attributes?: UserAttributes;
  segments?: string[];
  overrides?: Record<string, import('./value-types').JsonValue>;
  sticky?: boolean;
}

export interface UserAttributes {
  [key: string]: string | number | boolean | Date | string[] | undefined;
  userAgent?: string;
  ip?: string;
  referer?: string;
  country?: string;
  userId?: string;
}

// Assignment types
export interface Assignment {
  experimentId: string;
  userId: string;
  variationId: string;
  timestamp: Date;
  eligible: boolean;
  reason?: string;
  forced?: boolean;
  context?: import('./value-types').UserAttributes;
}

export interface FeatureFlagAssignment {
  flagKey: string;
  userId: string;
  enabled: boolean;
  value: import('./value-types').FeatureFlagValue;
  variation?: string;
  timestamp: Date;
  reason?: string;
}

// Event types
export interface ExperimentEvent {
  id: string;
  type: EventType;
  experimentId?: string;
  flagKey?: string;
  userId: string;
  variationId?: string;
  timestamp: Date;
  properties?: import('./value-types').AnalyticsProperties;
  revenue?: number;
  value?: number;
}

export type EventType = 'exposure' | 'conversion' | 'metric' | 'custom';

// Analytics types
export interface ExperimentResults {
  experimentId: string;
  status: ResultStatus;
  startDate: Date;
  endDate?: Date;
  variations: VariationResults[];
  winner?: string;
  confidence?: number;
  sampleSize: number;
}

export type ResultStatus =
  | 'insufficient_data'
  | 'no_winner'
  | 'winner_found'
  | 'inconclusive';

export interface VariationResults {
  variationId: string;
  metrics: MetricResults[];
  sampleSize: number;
  exposures: number;
  conversions: number;
}

export interface MetricResults {
  metricId: string;
  value: number;
  confidence: number;
  standardError: number;
  pValue?: number;
  uplift?: number;
  significant?: boolean;
}

// Provider types
export interface ExperimentProvider {
  name: string;
  type: ProviderType;
  config: ProviderConfig;
}

export type ProviderType =
  | 'local'
  | 'remote'
  | 'launchdarkly'
  | 'optimizely'
  | 'split'
  | 'custom';

export interface ProviderConfig {
  [key: string]: import('./value-types').JsonValue;
}

// Configuration types
export interface ExperimentsConfig {
  provider?: ExperimentProvider;
  defaultAllocation?: AllocationStrategy;
  enableAnalytics?: boolean;
  enableDebugMode?: boolean;
  refreshInterval?: number;
  timeout?: number;
  cacheStrategy?: CacheStrategy;
  logger?: LoggerConfig;
  hooks?: ExperimentHooks;
}

export interface CacheStrategy {
  type: 'memory' | 'localStorage' | 'custom';
  ttl?: number;
  maxSize?: number;
}

export interface LoggerConfig {
  level?: 'debug' | 'info' | 'warn' | 'error';
  enabled?: boolean;
  custom?: (
    level: string,
    message: string,
    data?: import('./value-types').JsonValue
  ) => void;
}

export interface ExperimentHooks {
  beforeAssignment?: (
    experiment: Experiment,
    user: UserContext
  ) => void | Promise<void>;
  afterAssignment?: (assignment: Assignment) => void | Promise<void>;
  onExposure?: (event: ExperimentEvent) => void | Promise<void>;
  onConversion?: (event: ExperimentEvent) => void | Promise<void>;
  onError?: (error: Error) => void;
}

// Error types
export interface ExperimentError {
  code: ExperimentErrorCode;
  message: string;
  details?: import('./value-types').ErrorContext;
}

export type ExperimentErrorCode =
  | 'EXPERIMENT_NOT_FOUND'
  | 'FLAG_NOT_FOUND'
  | 'INVALID_CONFIGURATION'
  | 'PROVIDER_ERROR'
  | 'TARGETING_ERROR'
  | 'ALLOCATION_ERROR'
  | 'ANALYTICS_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'UNKNOWN_ERROR';

// Re-export commonly used types from value-types
export type { VariationChanges } from './value-types';

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type AsyncResult<T> = Promise<T>;

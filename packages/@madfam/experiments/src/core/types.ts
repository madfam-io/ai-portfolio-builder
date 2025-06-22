/**
 * @madfam/experiments
 *
 * Core type definitions for the experiments system
 */

// Experiment types
export interface Experiment {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
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
  changes?: VariationChanges;
  overrides?: Record<string, unknown>;
}

export interface VariationChanges {
  [key: string]: unknown;
}

// Feature flag types
export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  defaultValue: unknown;
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
  value: unknown;
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
  attributes?: Record<string, unknown>;
}

export interface TargetingCondition {
  attribute: string;
  operator: ConditionOperator;
  value: unknown;
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

export type MetricGoal = 
  | 'increase'
  | 'decrease'
  | 'maintain';

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
  overrides?: Record<string, unknown>;
  sticky?: boolean;
}

export interface UserAttributes {
  [key: string]: string | number | boolean | Date | string[] | undefined;
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
  context?: Record<string, unknown>;
}

export interface FeatureFlagAssignment {
  flagKey: string;
  userId: string;
  enabled: boolean;
  value: unknown;
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
  properties?: Record<string, unknown>;
  revenue?: number;
  value?: number;
}

export type EventType = 
  | 'exposure'
  | 'conversion'
  | 'metric'
  | 'custom';

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
  [key: string]: unknown;
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
  custom?: (level: string, message: string, data?: unknown) => void;
}

export interface ExperimentHooks {
  beforeAssignment?: (experiment: Experiment, user: UserContext) => void | Promise<void>;
  afterAssignment?: (assignment: Assignment) => void | Promise<void>;
  onExposure?: (event: ExperimentEvent) => void | Promise<void>;
  onConversion?: (event: ExperimentEvent) => void | Promise<void>;
  onError?: (error: Error) => void;
}

// Error types
export interface ExperimentError {
  code: ExperimentErrorCode;
  message: string;
  details?: Record<string, unknown>;
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

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type AsyncResult<T> = Promise<T>;
/**
 * @madfam/experiments
 *
 * Enterprise-grade A/B testing and feature flags system
 */

// Core exports
export { Experiments } from './core/experiments';
export { AllocationEngine } from './core/allocation-engine';
export { TargetingEngine } from './core/targeting-engine';
export { AnalyticsEngine } from './core/analytics-engine';
export { CacheManager } from './core/cache-manager';

// Type exports
export type {
  // Experiment types
  Experiment,
  ExperimentStatus,
  ExperimentType,
  Variation,
  VariationChanges,

  // Feature flag types
  FeatureFlag,
  FeatureFlagType,
  FeatureFlagVariation,

  // Targeting types
  TargetingRules,
  Audience,
  Segment,
  TargetingCondition,
  ConditionOperator,
  AudienceCondition,

  // Allocation types
  AllocationStrategy,
  AllocationType,
  AllocationOverride,

  // Metric types
  Metric,
  MetricType,
  MetricGoal,
  AggregationType,
  WinCondition,

  // User context types
  UserContext,
  UserAttributes,

  // Assignment types
  Assignment,
  FeatureFlagAssignment,

  // Event types
  ExperimentEvent,
  EventType,

  // Analytics types
  ExperimentResults,
  ResultStatus,
  VariationResults,
  MetricResults,

  // Provider types
  ExperimentProvider,
  ProviderType,
  ProviderConfig,

  // Configuration types
  ExperimentsConfig,
  CacheStrategy,
  LoggerConfig,
  ExperimentHooks,

  // Error types
  ExperimentError,
  ExperimentErrorCode,

  // Utility types
  DeepPartial,
  Nullable,
  AsyncResult,
} from './core/types';

// Factory function
export function createExperiments(
  config?: import('./core/types').ExperimentsConfig
) {
  return new Experiments(config);
}

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
 * Enterprise-grade A/B testing and feature flags system with adapter support
 */

// Core exports
export { Experiments } from './core/experiments';
export { ExperimentsEnhanced } from './core/experiments-enhanced';
export { AllocationEngine } from './core/allocation-engine';
export { TargetingEngine } from './core/targeting-engine';
export { AnalyticsEngine } from './core/analytics-engine';
export { CacheManager } from './core/cache-manager';

// Configuration exports
export type { ExperimentsConfigWithAdapters } from './core/config';

// Adapter exports
export * from './adapters';

// Next.js integration exports
export * from './integrations/nextjs';

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

// Factory functions
export function createExperiments(
  config?: import('./core/types').ExperimentsConfig
) {
  return new Experiments(config);
}

export function createExperimentsWithAdapters(
  config?: import('./core/config').ExperimentsConfigWithAdapters
) {
  return new ExperimentsEnhanced(config);
}

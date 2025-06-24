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

/**
 * Specific value types for experiments system
 * These replace generic 'unknown' and 'any' types with proper type definitions
 */

// Experiment metadata types
export interface ExperimentMetadata {
  description?: string;
  notes?: string;
  owner?: string;
  team?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  labels?: string[];
  customFields?: Record<string, string | number | boolean>;
}

// Feature flag value types
export type FeatureFlagValue = boolean | string | number | JsonValue;

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// Variation changes types
export interface VariationChanges {
  components?: ComponentChange[];
  theme?: ThemeOverrides;
  config?: ConfigChanges;
  content?: ContentChanges;
}

export interface ComponentChange {
  type: string;
  variant: string;
  visible: boolean;
  props?: Record<string, JsonValue>;
}

export interface ThemeOverrides {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  spacing?: Record<string, number>;
  breakpoints?: Record<string, number>;
}

export interface ConfigChanges {
  features?: Record<string, boolean>;
  limits?: Record<string, number>;
  settings?: Record<string, string>;
}

export interface ContentChanges {
  text?: Record<string, string>;
  images?: Record<string, string>;
  links?: Record<string, string>;
}

// User attributes types
export interface UserAttributes {
  email?: string;
  name?: string;
  userId?: string;
  plan?: string;
  country?: string;
  language?: string;
  device?: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  version?: string;
  customAttributes?: Record<string, string | number | boolean>;
}

// Analytics event properties
export interface AnalyticsProperties {
  experimentId?: string;
  variationId?: string;
  page?: string;
  section?: string;
  action?: string;
  value?: number;
  currency?: string;
  category?: string;
  label?: string;
  customProperties?: Record<string, string | number | boolean>;
}

// Analytics traits for user identification
export interface AnalyticsTraits {
  name?: string;
  email?: string;
  plan?: string;
  createdAt?: string;
  company?: string;
  role?: string;
  customTraits?: Record<string, string | number | boolean>;
}

// Error context types
export interface ErrorContext {
  experimentId?: string;
  userId?: string;
  operation?: string;
  timestamp?: Date;
  details?: Record<string, string | number | boolean>;
}

// HTTP request/response types for middleware
export interface RequestContext {
  method: string;
  url: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  body?: JsonValue;
  user?: UserAttributes;
}

export interface ResponseContext {
  status: number;
  headers: Record<string, string>;
  body?: JsonValue;
  duration?: number;
}

// Database record types
export interface DatabaseExperimentRecord {
  id: string;
  key: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  variations: JsonValue;
  metrics: JsonValue | null;
  targeting: JsonValue | null;
  allocation: JsonValue;
  schedule: JsonValue | null;
  metadata: JsonValue | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEventRecord {
  id: number;
  experiment_id: string;
  user_id: string;
  type: string;
  variation_id: string | null;
  timestamp: string;
  value: number | null;
  metadata: JsonValue | null;
}

// Event emitter argument types
export type EventHandlerArgs = JsonValue[];

// Segment and targeting value types
export type TargetingValue = string | number | boolean | string[];
export type SegmentAttributes = Record<string, TargetingValue>;

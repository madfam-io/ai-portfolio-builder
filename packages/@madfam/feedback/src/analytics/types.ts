/**
 * @madfam/feedback
 *
 * World-class feedback collection and analytics system
 *
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 *
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 *
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

/**
 * Analytics Types
 *
 * Type definitions for analytics providers and tracking
 */

import type { AnalyticsEvent } from '../core/types';

export interface AnalyticsProvider {
  /**
   * Initialize the provider
   */
  initialize?(): Promise<void>;

  /**
   * Identify a user
   */
  identify(userId: string, traits?: UserIdentity): Promise<void>;

  /**
   * Track a single event
   */
  track(event: AnalyticsEvent): Promise<AnalyticsResult>;

  /**
   * Track multiple events in batch
   */
  batchTrack?(batch: EventBatch): Promise<AnalyticsResult[]>;

  /**
   * Set user properties
   */
  setUserProperties?(userId: string, properties: Record<string, unknown>): Promise<void>;

  /**
   * Group tracking (for team/organization analytics)
   */
  group?(userId: string, groupId: string, traits?: Record<string, unknown>): Promise<void>;

  /**
   * Page/screen tracking
   */
  page?(userId: string, name: string, properties?: Record<string, unknown>): Promise<void>;

  /**
   * Reset user data (for privacy compliance)
   */
  reset?(): Promise<void>;

  /**
   * Flush pending events
   */
  flush?(): Promise<void>;

  /**
   * Shutdown provider
   */
  shutdown?(): Promise<void>;
}

export interface UserIdentity {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt?: Date;
  plan?: string;
  accountType?: 'free' | 'pro' | 'enterprise';
  portfoliosCreated?: number;
  lastActive?: Date;
  preferences?: Record<string, unknown>;
  customTraits?: Record<string, unknown>;
}

export interface AnalyticsResult {
  success: boolean;
  messageId?: string;
  timestamp: Date;
  error?: string;
  retryable?: boolean;
}

export interface EventBatch {
  events: AnalyticsEvent[];
  timestamp: Date;
  batchId: string;
  context?: Record<string, unknown>;
}

export interface TrackingOptions {
  immediate?: boolean;
  retry?: boolean;
  timeout?: number;
  context?: Record<string, unknown>;
}

export interface AnalyticsMetrics {
  eventsTracked: number;
  eventsSent: number;
  eventsFailed: number;
  avgBatchSize: number;
  queueSize: number;
  lastEventTime: Date | null;
  
  // Breakdown by event type
  byEvent: Record<string, {
    count: number;
    lastSeen: Date;
    avgPropertiesCount: number;
  }>;
  
  // Breakdown by user
  byUser: Record<string, {
    eventsCount: number;
    lastSeen: Date;
    firstSeen: Date;
  }>;
}

// Provider-specific configuration types
export interface PostHogConfig {
  apiKey: string;
  host?: string;
  flushAt?: number;
  flushInterval?: number;
  personalApiKey?: string;
  featureFlags?: boolean;
  capturePageviews?: boolean;
  autocapture?: boolean;
}

export interface MixpanelConfig {
  token: string;
  apiSecret?: string;
  debug?: boolean;
  trackAutomaticEvents?: boolean;
  batchRequests?: boolean;
  flushBatchSize?: number;
  flushInterval?: number;
}

export interface AmplitudeConfig {
  apiKey: string;
  secretKey?: string;
  serverUrl?: string;
  batchMode?: boolean;
  eventUploadThreshold?: number;
  eventUploadPeriodMillis?: number;
  identifyBatchIntervalMillis?: number;
  flushQueueSize?: number;
}

export interface CustomProviderConfig {
  provider: AnalyticsProvider;
  options?: Record<string, unknown>;
}

// Event context types
export interface FeedbackEventContext {
  feedbackType: string;
  severity: string;
  hasAttachments: boolean;
  wordCount: number;
  timeToSubmit?: number;
}

export interface SurveyEventContext {
  surveyType: string;
  completionRate: number;
  timeToComplete: number;
  skipCount: number;
  npsScore: number;
}

export interface PortfolioEventContext {
  portfolioId: string;
  templateUsed: string;
  sectionsCompleted: number;
  timeSpent: number;
  deviceType: string;
}

export interface FeatureEventContext {
  featureName: string;
  action: string;
  successful: boolean;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

// Funnel and conversion tracking
export interface FunnelStep {
  name: string;
  timestamp: Date;
  properties?: Record<string, unknown>;
}

export interface ConversionEvent {
  userId: string;
  funnelName: string;
  steps: FunnelStep[];
  completed: boolean;
  conversionTime?: number;
  dropOffStep?: string;
}

// A/B testing support
export interface ExperimentVariant {
  experimentId: string;
  variantId: string;
  userId: string;
  assignedAt: Date;
  properties?: Record<string, unknown>;
}

export interface ExperimentEvent {
  experimentId: string;
  variantId: string;
  userId: string;
  eventName: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

// Cohort analysis
export interface CohortDefinition {
  id: string;
  name: string;
  criteria: Record<string, unknown>;
  createdAt: Date;
  size: number;
}

export interface CohortEvent {
  cohortId: string;
  userId: string;
  eventName: string;
  properties?: Record<string, unknown>;
  timestamp: Date;
}

// Real-time analytics
export interface RealtimeMetrics {
  activeUsers: number;
  eventsPerMinute: number;
  topEvents: Array<{
    name: string;
    count: number;
  }>;
  errorRate: number;
  avgSessionDuration: number;
}

export interface RealtimeAlert {
  id: string;
  type: 'spike' | 'drop' | 'error' | 'anomaly';
  metric: string;
  threshold: number;
  currentValue: number;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}
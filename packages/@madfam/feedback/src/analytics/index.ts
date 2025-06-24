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
 * Analytics Module
 *
 * Comprehensive analytics integration for feedback and user behavior tracking
 */

export { AnalyticsService, createAnalyticsService } from './analytics-service';
export { PostHogProvider } from './providers/posthog';
export { MixpanelProvider } from './providers/mixpanel';
export { AmplitudeProvider } from './providers/amplitude';

export type {
  AnalyticsProvider,
  AnalyticsResult,
  TrackingOptions,
  UserIdentity,
  EventBatch,
  AnalyticsMetrics,
  PostHogConfig,
  MixpanelConfig,
  AmplitudeConfig,
  CustomProviderConfig,
  FeedbackEventContext,
  SurveyEventContext,
  PortfolioEventContext,
  FeatureEventContext,
  FunnelStep,
  ConversionEvent,
  ExperimentVariant,
  ExperimentEvent,
  CohortDefinition,
  CohortEvent,
  RealtimeMetrics,
  RealtimeAlert,
} from './types';

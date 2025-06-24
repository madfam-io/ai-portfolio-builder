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
 * Main Entry Point
 *
 * Export all public APIs for the feedback system
 */

// Core functionality
export {
  FeedbackSystem,
  createFeedbackSystem,
  BetaAnalytics,
  createBetaAnalytics,
  BetaLaunchChecker,
  createBetaLaunchChecker,
  DEFAULT_CONFIG,
} from './core';

// Types
export type {
  // Feedback types
  FeedbackEntry,
  FeedbackType,
  FeedbackSeverity,
  FeedbackStatus,
  UserContext,

  // Survey types
  SatisfactionSurvey,
  NPSCategory,

  // Analytics types
  BetaMetrics,
  UserRetention,
  FeedbackEvent,
  FeedbackTrend,
  FeedbackReport,
  AnalyticsEvent,
  PortfolioJourneyEvent,
  FeatureUsageEvent,
  SessionEvent,

  // Configuration types
  FeedbackSystemConfig,
  StorageConfig,
  AnalyticsConfig,
  NotificationConfig,
  WebhookConfig,
  UIConfig,
  FeatureConfig,
  SurveyTriggers,
  CustomTrigger,

  // API types
  FeedbackFilter,
  APIResponse,
  PaginatedResponse,

  // Beta launch types
  BetaReadinessReport,
  ReadinessCheck,

  // Error types
  FeedbackError,
  StorageError,
  ValidationError,

  // Storage interface
  StorageAdapter,
} from './core/types';

// Storage adapters
export {
  createStorageAdapter,
  MemoryStorageAdapter,
  SupabaseStorageAdapter,
  BaseStorageAdapter,
} from './storage';

// Analytics
export {
  AnalyticsService,
  createAnalyticsService,
  PostHogProvider,
  MixpanelProvider,
  AmplitudeProvider,
} from './analytics';

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
} from './analytics';

// Notifications
export { NotificationManager, EmailService } from './notifications';

export type {
  NotificationConfig,
  EmailConfig,
  EmailCredentials,
  EmailTemplate,
  EmailNotification,
  WebhookConfig,
  SlackConfig,
  NotificationEvent,
  NotificationPayload,
} from './notifications';

// Utilities
export { Logger } from './utils/logger';
export { EventEmitter } from './utils/event-emitter';
export {
  validateFeedback,
  validateSurvey,
  sanitizeInput,
  validateTags,
  isValidEmail,
  isValidUrl,
} from './utils/validators';

// Version
export const VERSION = '1.0.0';

// Quick start function
export function quickStart(config?: {
  storage?: 'memory' | 'supabase';
  supabaseUrl?: string;
  supabaseKey?: string;
  analytics?: {
    enabled: boolean;
    provider?: 'posthog' | 'mixpanel' | 'amplitude';
    apiKey?: string;
  };
  notifications?: {
    email?: {
      enabled: boolean;
      provider?: 'sendgrid' | 'ses' | 'smtp' | 'resend';
      apiKey?: string;
    };
  };
}) {
  const storageConfig =
    config?.storage === 'supabase' && config.supabaseUrl && config.supabaseKey
      ? {
          type: 'supabase' as const,
          options: {
            supabaseUrl: config.supabaseUrl,
            supabaseKey: config.supabaseKey,
          },
        }
      : { type: 'memory' as const };

  const analyticsConfig = config?.analytics?.enabled
    ? {
        enabled: true,
        provider: config.analytics.provider || 'posthog',
        apiKey: config.analytics.apiKey,
      }
    : { enabled: false };

  const notificationsConfig = config?.notifications?.email?.enabled
    ? {
        email: {
          enabled: true,
          provider: config.notifications.email.provider || 'sendgrid',
          credentials: {
            apiKey: config.notifications.email.apiKey,
          },
        },
      }
    : undefined;

  const feedbackSystem = createFeedbackSystem({
    storage: storageConfig,
    analytics: analyticsConfig,
    notifications: notificationsConfig,
  });

  const analytics = createBetaAnalytics({ storage: storageConfig });
  const betaChecker = createBetaLaunchChecker(feedbackSystem, analytics);

  return {
    feedbackSystem,
    analytics,
    betaChecker,
  };
}

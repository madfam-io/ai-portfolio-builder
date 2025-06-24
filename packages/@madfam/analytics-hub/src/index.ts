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
 * @madfam/analytics-hub
 *
 * Universal analytics abstraction with multi-provider support and type safety
 *
 * @version 1.0.0
 * @license MIT
 * @author MADFAM Team <engineering@madfam.io>
 */

// Core exports
export { UniversalAnalyticsClient } from './core/analytics-client';
export type {
  AnalyticsConfig,
  AnalyticsClient,
  AnalyticsProvider,
  PostHogConfig,
  MixpanelConfig,
  AmplitudeConfig,
  SegmentConfig,
  CustomProviderConfig,
  AnalyticsEvent,
  EventProperties,
  UserProperties,
  TrackOptions,
  EventContext,
  EventCatalog,
  TypeSafeTrack,
  AnalyticsHookResult,
  AnalyticsContextValue,
} from './core/types';

// Provider exports
export { PostHogProvider } from './providers/posthog';
export { MixpanelProvider } from './providers/mixpanel';
export { AmplitudeProvider } from './providers/amplitude';
export { SegmentProvider } from './providers/segment';
export { CustomProvider } from './providers/custom';

// React exports (client-side only)
export { AnalyticsProvider, useAnalyticsContext } from './react/provider';
export {
  useAnalytics,
  usePageTracking,
  useUserTracking,
  useEventTracker,
  useFormTracking,
  useVisibilityTracking,
  usePerformanceTracking,
  useScrollTracking,
} from './react/hooks';

/**
 * Factory function to create analytics client
 */
export function createAnalyticsClient(
  config: AnalyticsConfig
): UniversalAnalyticsClient {
  return new UniversalAnalyticsClient(config);
}

/**
 * Default configurations for common providers
 */
export const defaultConfigs = {
  posthog: (apiKey: string, host?: string): AnalyticsConfig => ({
    provider: 'posthog',
    providers: {
      posthog: {
        apiKey,
        host: host || 'https://app.posthog.com',
        autocapture: true,
        sessionRecording: false,
      },
    },
    autoCapture: true,
    privacy: {
      respectDNT: true,
      anonymizeIPs: true,
    },
  }),

  mixpanel: (token: string): AnalyticsConfig => ({
    provider: 'mixpanel',
    providers: {
      mixpanel: {
        token,
        config: {
          debug: false,
          track_pageview: true,
          persistence: 'localStorage',
        },
      },
    },
    autoCapture: true,
    privacy: {
      respectDNT: true,
    },
  }),

  amplitude: (apiKey: string): AnalyticsConfig => ({
    provider: 'amplitude',
    providers: {
      amplitude: {
        apiKey,
        config: {
          autocapture: true,
        },
      },
    },
    autoCapture: true,
    privacy: {
      respectDNT: true,
    },
  }),

  segment: (writeKey: string): AnalyticsConfig => ({
    provider: 'segment',
    providers: {
      segment: {
        writeKey,
        config: {
          integrations: {
            'Segment.io': {
              deliveryStrategy: {
                strategy: 'batching',
                config: {
                  size: 10,
                  timeout: 5000,
                },
              },
            },
          },
        },
      },
    },
    batchEvents: true,
    privacy: {
      respectDNT: true,
    },
  }),

  custom: (
    endpoint: string,
    headers?: Record<string, string>
  ): AnalyticsConfig => ({
    provider: 'custom',
    providers: {
      custom: {
        endpoint,
        headers,
        batch: true,
      },
    },
    batchEvents: true,
    privacy: {
      respectDNT: true,
    },
  }),
};

/**
 * Event name constants for type safety
 */
export const EVENTS = {
  // User lifecycle
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  USER_UPDATED_PROFILE: 'user_updated_profile',

  // Feature usage
  FEATURE_USED: 'feature_used',
  BUTTON_CLICKED: 'button_clicked',
  FORM_SUBMITTED: 'form_submitted',

  // Content engagement
  PAGE_VIEWED: 'page_viewed',
  CONTENT_VIEWED: 'content_viewed',
  VIDEO_PLAYED: 'video_played',

  // E-commerce
  PRODUCT_VIEWED: 'product_viewed',
  CART_UPDATED: 'cart_updated',
  CHECKOUT_STARTED: 'checkout_started',
  PURCHASE_COMPLETED: 'purchase_completed',

  // Subscription
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  TRIAL_STARTED: 'trial_started',

  // Performance
  PAGE_LOAD_PERFORMANCE: 'page_load_performance',
  ERROR_OCCURRED: 'error_occurred',
} as const;

/**
 * User property constants
 */
export const USER_PROPERTIES = {
  EMAIL: 'email',
  NAME: 'name',
  PLAN: 'plan',
  SIGNUP_DATE: 'signup_date',
  LAST_SEEN: 'last_seen',
  TOTAL_SESSIONS: 'total_sessions',
  COUNTRY: 'country',
  LANGUAGE: 'language',
} as const;

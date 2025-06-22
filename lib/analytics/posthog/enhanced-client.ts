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
 * Enhanced PostHog Client with A/B Testing and Advanced Analytics
 */

'use client';

import React from 'react';
import { PostHog } from 'posthog-js';
import { useEffect, useState } from 'react';
import { env } from '@/lib/config/env';
import { logger } from '@/lib/utils/logger';
import { useAuth } from '@/lib/contexts/AuthContext';

// Enhanced event definitions
export const ENHANCED_EVENTS = {
  // User lifecycle
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  USER_ONBOARDED: 'user_onboarded',

  // Portfolio events
  PORTFOLIO_CREATED: 'portfolio_created',
  PORTFOLIO_PUBLISHED: 'portfolio_published',
  PORTFOLIO_SHARED: 'portfolio_shared',
  PORTFOLIO_VIEWED: 'portfolio_viewed',
  PORTFOLIO_DOWNLOADED: 'portfolio_downloaded',

  // AI events
  AI_ENHANCEMENT_STARTED: 'ai_enhancement_started',
  AI_ENHANCEMENT_COMPLETED: 'ai_enhancement_completed',
  AI_ENHANCEMENT_FAILED: 'ai_enhancement_failed',
  AI_MODEL_SELECTED: 'ai_model_selected',

  // Conversion events
  PRICING_PAGE_VIEWED: 'pricing_page_viewed',
  UPGRADE_BUTTON_CLICKED: 'upgrade_button_clicked',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  PAYMENT_COMPLETED: 'payment_completed',
  PAYMENT_FAILED: 'payment_failed',

  // Feature usage
  TEMPLATE_SELECTED: 'template_selected',
  EDITOR_OPENED: 'editor_opened',
  EXPORT_STARTED: 'export_started',
  IMPORT_STARTED: 'import_started',

  // Engagement
  HELP_OPENED: 'help_opened',
  TUTORIAL_STARTED: 'tutorial_started',
  TUTORIAL_COMPLETED: 'tutorial_completed',
  FEEDBACK_SUBMITTED: 'feedback_submitted',

  // A/B Test events
  AB_TEST_VIEWED: 'ab_test_viewed',
  AB_TEST_CONVERTED: 'ab_test_converted',
  FEATURE_FLAG_EVALUATED: 'feature_flag_evaluated',
} as const;

// A/B Test configurations
export interface ABTestConfig {
  testKey: string;
  variants: string[];
  traffic: number; // Percentage of users to include
  description: string;
  startDate: Date;
  endDate?: Date;
  conversionEvent: string;
  enabled: boolean;
}

export const AB_TESTS: Record<string, ABTestConfig> = {
  pricing_display: {
    testKey: 'pricing_display_test',
    variants: ['original', 'annual_emphasis', 'savings_highlight'],
    traffic: 100, // Include all users
    description: 'Test different pricing page layouts',
    startDate: new Date('2025-01-01'),
    conversionEvent: ENHANCED_EVENTS.SUBSCRIPTION_STARTED,
    enabled: true,
  },
  onboarding_flow: {
    testKey: 'onboarding_flow_test',
    variants: ['standard', 'guided', 'minimal'],
    traffic: 50, // 50% of new users
    description: 'Test different onboarding experiences',
    startDate: new Date('2025-01-01'),
    conversionEvent: ENHANCED_EVENTS.PORTFOLIO_CREATED,
    enabled: true,
  },
  ai_upsell: {
    testKey: 'ai_upsell_test',
    variants: ['soft_prompt', 'modal_prompt', 'inline_prompt'],
    traffic: 75,
    description: 'Test AI enhancement upsell strategies',
    startDate: new Date('2025-01-01'),
    conversionEvent: ENHANCED_EVENTS.AI_ENHANCEMENT_STARTED,
    enabled: true,
  },
};

// Feature flags
export const FEATURE_FLAGS = {
  ADVANCED_ANALYTICS: 'advanced_analytics',
  NEW_EDITOR: 'new_editor_ui',
  AI_CHAT_SUPPORT: 'ai_chat_support',
  COLLABORATION: 'portfolio_collaboration',
  CUSTOM_DOMAINS: 'custom_domains',
  WHITE_LABEL: 'white_label_mode',
} as const;

/**
 * Enhanced PostHog service with A/B testing
 */
class EnhancedPostHogService {
  private posthog: PostHog | null = null;
  private initialized = false;
  private abTestCache = new Map<string, string>();
  private featureFlagCache = new Map<string, boolean>();

  /**
   * Initialize PostHog with enhanced configuration
   */
  init() {
    if (typeof window === 'undefined' || this.initialized) return;

    const apiKey = env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = env.NEXT_PUBLIC_POSTHOG_HOST;

    if (!apiKey) {
      logger.warn('PostHog API key not found, analytics will be disabled');
      return;
    }

    try {
      import('posthog-js').then(({ default: posthog }) => {
        posthog.init(apiKey, {
          api_host: host || 'https://app.posthog.com',
          loaded: posthog => {
            this.posthog = posthog;
            this.initialized = true;
            logger.info('Enhanced PostHog initialized successfully');
          },
          capture_pageview: false, // We handle this manually
          capture_pageleave: true,
          cross_subdomain_cookie: true,
          persistence: 'localStorage+cookie',
          person_profiles: 'identified_only',
          bootstrap: {
            distinctID: this.getStoredDistinctId(),
          },
          session_recording: {
            maskAllInputs: true,
            maskInputOptions: {
              password: true,
              email: true,
            },
          },
          autocapture: {
            dom_event_allowlist: ['click', 'submit'],
            url_allowlist: [window.location.origin],
          },
        });

        // Load initial feature flags and A/B tests
        this.loadFeatureFlags();
        this.initializeABTests();
      });
    } catch (error) {
      logger.error('Failed to initialize PostHog', { error });
    }
  }

  /**
   * Identify user with enhanced properties
   */
  identify(userId: string, userProperties: Record<string, unknown>) {
    if (!this.posthog || !this.initialized) return;

    try {
      const enhancedProperties = {
        ...userProperties,
        $set: {
          ...userProperties,
          first_seen: new Date().toISOString(),
          platform: 'web',
          environment: env.NODE_ENV,
        },
        $set_once: {
          initial_utm_source: this.getUtmSource(),
          initial_utm_medium: this.getUtmMedium(),
          initial_utm_campaign: this.getUtmCampaign(),
          signup_date: new Date().toISOString(),
        },
      };

      this.posthog.identify(userId, enhancedProperties);

      // Store distinct ID for bootstrap
      localStorage.setItem('posthog_distinct_id', userId);

      logger.info('User identified in PostHog', { userId });
    } catch (error) {
      logger.error('Failed to identify user in PostHog', { error, userId });
    }
  }

  /**
   * Capture enhanced event
   */
  capture(
    eventName: string,
    properties: Record<string, unknown> = {},
    options: { send_instantly?: boolean } = {}
  ) {
    if (!this.posthog || !this.initialized) return;

    try {
      const enhancedProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        page_url: window.location.href,
        page_title: document.title,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,

        // Include active A/B test variants
        ab_tests: Object.fromEntries(this.abTestCache),

        // Include feature flags
        feature_flags: Object.fromEntries(this.featureFlagCache),
      };

      this.posthog.capture(eventName, enhancedProperties, options);

      logger.debug('Event captured', {
        eventName,
        properties: enhancedProperties,
      });
    } catch (error) {
      logger.error('Failed to capture event', { error, eventName, properties });
    }
  }

  /**
   * Get A/B test variant for a user
   */
  getABTestVariant(testKey: string): string | null {
    if (!this.posthog || !this.initialized) return null;

    // Check cache first
    if (this.abTestCache.has(testKey)) {
      return this.abTestCache.get(testKey) as string;
    }

    const testConfig = AB_TESTS[testKey];
    if (!testConfig || !testConfig.enabled) {
      return null;
    }

    // Check if test is active
    const now = new Date();
    if (
      now < testConfig.startDate ||
      (testConfig.endDate && now > testConfig.endDate)
    ) {
      return null;
    }

    try {
      // Use PostHog's feature flag system for A/B testing
      const variant = this.posthog.getFeatureFlag(testKey);

      if (variant && testConfig.variants.includes(variant as string)) {
        this.abTestCache.set(testKey, variant as string);

        // Track A/B test exposure
        this.capture(ENHANCED_EVENTS.AB_TEST_VIEWED, {
          test_key: testKey,
          variant,
          test_description: testConfig.description,
        });

        return variant as string;
      }
    } catch (error) {
      logger.error('Failed to get A/B test variant', { error, testKey });
    }

    return null;
  }

  /**
   * Track A/B test conversion
   */
  trackABTestConversion(
    testKey: string,
    variant: string,
    conversionValue?: number
  ) {
    this.capture(ENHANCED_EVENTS.AB_TEST_CONVERTED, {
      test_key: testKey,
      variant,
      conversion_value: conversionValue,
    });
  }

  /**
   * Check if feature flag is enabled
   */
  isFeatureEnabled(flagKey: string): boolean {
    if (!this.posthog || !this.initialized) return false;

    // Check cache first
    if (this.featureFlagCache.has(flagKey)) {
      return this.featureFlagCache.get(flagKey) as boolean;
    }

    try {
      const enabled = Boolean(this.posthog.isFeatureEnabled(flagKey));
      this.featureFlagCache.set(flagKey, enabled);

      // Track feature flag evaluation
      this.capture(ENHANCED_EVENTS.FEATURE_FLAG_EVALUATED, {
        flag_key: flagKey,
        enabled,
      });

      return enabled;
    } catch (error) {
      logger.error('Failed to check feature flag', { error, flagKey });
      return false;
    }
  }

  /**
   * Get feature flag payload
   */
  getFeatureFlagPayload(flagKey: string): unknown {
    if (!this.posthog || !this.initialized) return null;

    try {
      return this.posthog.getFeatureFlagPayload(flagKey);
    } catch (error) {
      logger.error('Failed to get feature flag payload', { error, flagKey });
      return null;
    }
  }

  /**
   * Start user session recording
   */
  startRecording() {
    if (!this.posthog || !this.initialized) return;

    try {
      this.posthog.startSessionRecording();
    } catch (error) {
      logger.error('Failed to start session recording', { error });
    }
  }

  /**
   * Stop user session recording
   */
  stopRecording() {
    if (!this.posthog || !this.initialized) return;

    try {
      this.posthog.stopSessionRecording();
    } catch (error) {
      logger.error('Failed to stop session recording', { error });
    }
  }

  /**
   * Reset user (for logout)
   */
  reset() {
    if (!this.posthog || !this.initialized) return;

    try {
      this.posthog.reset();
      this.abTestCache.clear();
      this.featureFlagCache.clear();
      localStorage.removeItem('posthog_distinct_id');
    } catch (error) {
      logger.error('Failed to reset PostHog', { error });
    }
  }

  /**
   * Get user properties
   */
  getPersonProperties(): Record<string, unknown> {
    if (!this.posthog || !this.initialized) return {};

    try {
      // PostHog doesn't have a direct getPersonProperties method
      // We'll return an empty object for now
      return {};
    } catch (error) {
      logger.error('Failed to get person properties', { error });
      return {};
    }
  }

  /**
   * Initialize A/B tests
   */
  private initializeABTests() {
    if (!this.posthog) return;

    // Pre-load A/B test assignments
    Object.keys(AB_TESTS).forEach(testKey => {
      this.getABTestVariant(testKey);
    });
  }

  /**
   * Load feature flags
   */
  private loadFeatureFlags() {
    if (!this.posthog) return;

    // Pre-load feature flag states
    Object.values(FEATURE_FLAGS).forEach(flagKey => {
      this.isFeatureEnabled(flagKey);
    });
  }

  /**
   * Get stored distinct ID for bootstrap
   */
  private getStoredDistinctId(): string | undefined {
    try {
      return localStorage.getItem('posthog_distinct_id') || undefined;
    } catch (_error) {
      return undefined;
    }
  }

  /**
   * Get UTM parameters
   */
  private getUtmSource(): string | null {
    return new URLSearchParams(window.location.search).get('utm_source');
  }

  private getUtmMedium(): string | null {
    return new URLSearchParams(window.location.search).get('utm_medium');
  }

  private getUtmCampaign(): string | null {
    return new URLSearchParams(window.location.search).get('utm_campaign');
  }
}

// Singleton instance
export const enhancedPostHog = new EnhancedPostHogService();

/**
 * React hook for PostHog with A/B testing
 */
export function useEnhancedPostHog() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    enhancedPostHog.init();
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && user) {
      const userAny = user as any;
      const userWithMetadata = {
        ...user,
        user_metadata: userAny.user_metadata as
          | { full_name?: string }
          | undefined,
        created_at: userAny.created_at as string | undefined,
        email_confirmed_at: userAny.email_confirmed_at as
          | string
          | null
          | undefined,
      };
      enhancedPostHog.identify(user.id, {
        email: user.email,
        name: userWithMetadata.user_metadata?.full_name,
        created_at: userWithMetadata.created_at,
        email_verified: userWithMetadata.email_confirmed_at !== null,
      });
    }
  }, [isInitialized, user]);

  return {
    isInitialized,
    capture: enhancedPostHog.capture.bind(enhancedPostHog),
    getABTestVariant: enhancedPostHog.getABTestVariant.bind(enhancedPostHog),
    trackABTestConversion:
      enhancedPostHog.trackABTestConversion.bind(enhancedPostHog),
    isFeatureEnabled: enhancedPostHog.isFeatureEnabled.bind(enhancedPostHog),
    getFeatureFlagPayload:
      enhancedPostHog.getFeatureFlagPayload.bind(enhancedPostHog),
    startRecording: enhancedPostHog.startRecording.bind(enhancedPostHog),
    stopRecording: enhancedPostHog.stopRecording.bind(enhancedPostHog),
    reset: enhancedPostHog.reset.bind(enhancedPostHog),
  };
}

/**
 * A/B Test component wrapper
 */
export function ABTestWrapper({
  testKey,
  children,
}: {
  testKey: string;
  children: (variant: string | null) => React.ReactNode;
}) {
  const { getABTestVariant } = useEnhancedPostHog();
  const variant = getABTestVariant(testKey);

  return React.createElement(React.Fragment, null, children(variant));
}

/**
 * Feature flag component wrapper
 */
export function FeatureFlagWrapper({
  flagKey,
  fallback,
  children,
}: {
  flagKey: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { isFeatureEnabled } = useEnhancedPostHog();
  const enabled = isFeatureEnabled(flagKey);

  return React.createElement(
    React.Fragment,
    null,
    enabled ? children : fallback
  );
}

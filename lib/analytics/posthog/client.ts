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

'use client';

import posthog from 'posthog-js';
import { PostHogConfig } from 'posthog-js';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';

/**
 * PostHog Analytics Client
 *
 * Provides a centralized client for PostHog analytics with:
 * - Automatic initialization
 * - User identification
 * - Privacy-compliant configuration
 * - Event batching and retry logic
 */

// PostHog configuration
const posthogConfig: Partial<PostHogConfig> = {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  capture_pageview: true,
  capture_pageleave: true,
  persistence: 'localStorage+cookie',
  autocapture: {
    url_ignorelist: [/\/api\//], // Don't capture API calls
    element_allowlist: ['button', 'a', 'input'], // Only capture important elements
    css_selector_allowlist: ['.ph-capture'], // Allow explicit capture
  },
  session_recording: {
    maskAllInputs: true, // Privacy: mask sensitive inputs
  },
  loaded: _posthog => {
    if (process.env.NODE_ENV === 'development') {
      // PostHog loaded
    }
  },
  bootstrap: {
    distinctID: undefined, // Will be set on user identification
    isIdentifiedID: false,
  },
  opt_out_capturing_by_default: false,
  disable_session_recording: process.env.NODE_ENV === 'development',
  capture_performance: true,
  enable_recording_console_log: false,
  respect_dnt: true, // Respect Do Not Track
  secure_cookie: process.env.NODE_ENV === 'production',
  cross_subdomain_cookie: true,
};

// Initialize PostHog
export const initializePostHog = () => {
  if (typeof window === 'undefined') return;

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_POSTHOG === 'true';

  if (!posthogKey || !isEnabled) {
    return;
  }

  if (!posthog.__loaded) {
    posthog.init(posthogKey, posthogConfig);
  }
};

// Identify user
export const identifyUser = (
  userId: string,
  properties?: Record<string, unknown>
) => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.identify(userId, {
    ...properties,
    identified_at: new Date().toISOString(),
  });
};

// Reset user (on logout)
export const resetUser = () => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.reset();
};

// Capture custom event
export const captureEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.capture(eventName, {
    ...properties,
    timestamp: new Date().toISOString(),
    source: 'web_app',
  });
};

// Capture with enhanced properties
export const captureEnhancedEvent = (
  eventName: string,
  properties?: Record<string, unknown>
) => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  const enhancedProperties = {
    ...properties,
    // Page context
    page_url: window.location.href,
    page_title: document.title,
    referrer: document.referrer,
    // Device context
    screen_width: window.screen.width,
    screen_height: window.screen.height,
    viewport_width: window.innerWidth,
    viewport_height: window.innerHeight,
    // Time context
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  captureEvent(eventName, enhancedProperties);
};

// Feature flag check
export const isFeatureEnabled = (flagName: string): boolean => {
  if (typeof window === 'undefined' || !posthog.__loaded) return false;

  return posthog.isFeatureEnabled(flagName) ?? false;
};

// Get feature flag payload
export const getFeatureFlagPayload = (flagName: string): unknown => {
  if (typeof window === 'undefined' || !posthog.__loaded) return null;

  return posthog.getFeatureFlagPayload(flagName);
};

// Set user properties
export const setUserProperties = (properties: Record<string, unknown>) => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.people.set(properties);
};

// Increment user property
export const incrementUserProperty = (property: string, value = 1) => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  // PostHog JS doesn't have increment, use set with current value + increment
  const currentValue = posthog.get_property(property) || 0;
  posthog.people.set({ [property]: currentValue + value });
};

// Track revenue
export const trackRevenue = (
  amount: number,
  properties?: Record<string, unknown>
) => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  captureEvent('revenue', {
    revenue: amount,
    currency: 'USD',
    ...properties,
  });
};

// Start session recording
export const startSessionRecording = () => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;
  if (process.env.NODE_ENV === 'development') return;

  posthog.startSessionRecording();
};

// Stop session recording
export const stopSessionRecording = () => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.stopSessionRecording();
};

// Opt user out of tracking
export const optOut = () => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.opt_out_capturing();
};

// Opt user back in to tracking
export const optIn = () => {
  if (typeof window === 'undefined' || !posthog.__loaded) return;

  posthog.opt_in_capturing();
};

// Check if user has opted out
export const hasOptedOut = (): boolean => {
  if (typeof window === 'undefined' || !posthog.__loaded) return false;

  return posthog.has_opted_out_capturing();
};

// React hook for PostHog initialization
export const usePostHog = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    initializePostHog();

    if (user) {
      identifyUser(user.id, {
        email: user.email,
        created_at: user.created_at,
      });
    } else {
      resetUser();
    }
  }, [user]);
};

// Export posthog instance for direct access if needed
export { posthog };

// Event name constants
export const EVENTS = {
  // User journey
  USER_SIGNED_UP: 'user_signed_up',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  USER_UPDATED_PROFILE: 'user_updated_profile',

  // Portfolio events
  PORTFOLIO_CREATED: 'portfolio_created',
  PORTFOLIO_UPDATED: 'portfolio_updated',
  PORTFOLIO_PUBLISHED: 'portfolio_published',
  PORTFOLIO_UNPUBLISHED: 'portfolio_unpublished',
  PORTFOLIO_DELETED: 'portfolio_deleted',
  PORTFOLIO_VIEWED: 'portfolio_viewed',

  // Editor events
  EDITOR_OPENED: 'editor_opened',
  EDITOR_SECTION_EDITED: 'editor_section_edited',
  EDITOR_THEME_CHANGED: 'editor_theme_changed',
  EDITOR_PREVIEW_TOGGLED: 'editor_preview_toggled',

  // Variant events
  VARIANT_CREATED: 'variant_created',
  VARIANT_UPDATED: 'variant_updated',
  VARIANT_DELETED: 'variant_deleted',
  VARIANT_SWITCHED: 'variant_switched',
  VARIANT_PUBLISHED: 'variant_published',

  // AI events
  AI_CONTENT_GENERATED: 'ai_content_generated',
  AI_SUGGESTION_ACCEPTED: 'ai_suggestion_accepted',
  AI_SUGGESTION_REJECTED: 'ai_suggestion_rejected',

  // Engagement events
  CONTACT_CLICKED: 'contact_clicked',
  RESUME_DOWNLOADED: 'resume_downloaded',
  SOCIAL_LINK_CLICKED: 'social_link_clicked',
  PROJECT_VIEWED: 'project_viewed',

  // Revenue events
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  PAYMENT_COMPLETED: 'payment_completed',
} as const;

// User property constants
export const USER_PROPERTIES = {
  TOTAL_PORTFOLIOS: 'total_portfolios',
  TOTAL_VARIANTS: 'total_variants',
  TOTAL_PUBLISHES: 'total_publishes',
  SUBSCRIPTION_TIER: 'subscription_tier',
  SIGNUP_SOURCE: 'signup_source',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

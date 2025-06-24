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

import posthog from 'posthog-js';
import type {
  AnalyticsProvider,
  PostHogConfig,
  EventProperties,
  UserProperties,
  TrackOptions,
} from '../core/types';

/**
 * PostHog Analytics Provider
 */
export class PostHogProvider implements AnalyticsProvider {
  name = 'posthog';
  private initialized = false;

  async initialize(config: PostHogConfig): Promise<void> {
    if (typeof window === 'undefined') {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[AnalyticsHub] PostHog requires browser environment');
      }
      return;
    }

    if (!config.apiKey) {
      throw new Error('[AnalyticsHub] PostHog API key is required');
    }

    const posthogConfig = {
      api_host: config.host || 'https://app.posthog.com',
      autocapture: config.autocapture ?? true,
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      cookie_name: config.cookieName || 'ph_analytics',
      session_recording: {
        maskAllInputs: true,
        ...((config.sessionRecording ?? false) && { enabled: true }),
      },
      loaded: () => {
        this.initialized = true;
      },
      bootstrap: {
        distinctID: undefined,
        isIdentifiedID: false,
      },
      opt_out_capturing_by_default: false,
      disable_session_recording: !config.sessionRecording,
      capture_performance: true,
      enable_recording_console_log: false,
      respect_dnt: true,
      secure_cookie: window.location.protocol === 'https:',
      cross_subdomain_cookie: true,
    };

    if (!posthog.__loaded) {
      posthog.init(config.apiKey, posthogConfig);
    }

    // Wait for initialization
    await this.waitForInitialization();
  }

  identify(userId: string, traits?: UserProperties): Promise<void> {
    if (!this.isReady()) return Promise.resolve();

    posthog.identify(userId, {
      ...traits,
      $set: traits,
      $set_once: {
        first_seen: new Date().toISOString(),
      },
    });
    return Promise.resolve();
  }

  track(
    event: string,
    properties?: EventProperties,
    options?: TrackOptions
  ): Promise<void> {
    if (!this.isReady()) return Promise.resolve();

    const enhancedProperties = {
      ...properties,
      timestamp: options?.timestamp || new Date(),
    };

    posthog.capture(event, enhancedProperties);
    return Promise.resolve();
  }

  page(name?: string, properties?: EventProperties): Promise<void> {
    if (!this.isReady()) return Promise.resolve();

    const pageProperties = {
      ...properties,
      $current_url: window.location.href,
      $title: document.title,
      $referrer: document.referrer,
    };

    if (name) {
      posthog.capture('$pageview', {
        ...pageProperties,
        $page_name: name,
      });
    } else {
      // Let PostHog handle automatic pageview tracking
      posthog.capture('$pageview', pageProperties);
    }
    return Promise.resolve();
  }

  group(groupId: string, traits?: UserProperties): Promise<void> {
    if (!this.isReady()) return Promise.resolve();

    posthog.group('company', groupId, traits);
    return Promise.resolve();
  }

  reset(): Promise<void> {
    if (!this.isReady()) return Promise.resolve();

    posthog.reset();
    return Promise.resolve();
  }

  flush(): Promise<void> {
    if (!this.isReady()) return Promise.resolve();

    // PostHog doesn't have an explicit flush method
    // Events are automatically batched and sent
    return Promise.resolve();
  }

  isReady(): boolean {
    return this.initialized && posthog.__loaded;
  }

  /**
   * PostHog-specific methods
   */

  /**
   * Check if feature flag is enabled
   */
  isFeatureEnabled(flagName: string): boolean {
    if (!this.isReady()) return false;
    return posthog.isFeatureEnabled(flagName) ?? false;
  }

  /**
   * Get feature flag payload
   */
  getFeatureFlagPayload(flagName: string): unknown {
    if (!this.isReady()) return null;
    return posthog.getFeatureFlagPayload(flagName);
  }

  /**
   * Start session recording
   */
  startSessionRecording(): void {
    if (!this.isReady()) return;
    posthog.startSessionRecording();
  }

  /**
   * Stop session recording
   */
  stopSessionRecording(): void {
    if (!this.isReady()) return;
    posthog.stopSessionRecording();
  }

  /**
   * Opt user out of tracking
   */
  optOut(): void {
    if (!this.isReady()) return;
    posthog.opt_out_capturing();
  }

  /**
   * Opt user back in to tracking
   */
  optIn(): void {
    if (!this.isReady()) return;
    posthog.opt_in_capturing();
  }

  /**
   * Check if user has opted out
   */
  hasOptedOut(): boolean {
    if (!this.isReady()) return false;
    return posthog.has_opted_out_capturing();
  }

  /**
   * Wait for PostHog to initialize
   */
  private waitForInitialization(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.initialized) {
        resolve();
        return;
      }

      const checkInitialized = () => {
        if (this.initialized) {
          resolve();
        } else {
          setTimeout(checkInitialized, 100);
        }
      };

      checkInitialized();
    });
  }
}

/**
 * Export PostHog instance for direct access if needed
 */
export { posthog };

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

import mixpanel from 'mixpanel-browser';
import type {
  AnalyticsProvider,
  MixpanelConfig,
  EventProperties,
  UserProperties,
  TrackOptions,
} from '../core/types';

/**
 * Mixpanel Analytics Provider
 */
export class MixpanelProvider implements AnalyticsProvider {
  name = 'mixpanel';
  private initialized = false;

  initialize(config: MixpanelConfig): Promise<void> {
    if (typeof window === 'undefined') {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn('[AnalyticsHub] Mixpanel requires browser environment');
      }
      return Promise.resolve();
    }

    if (!config.token) {
      throw new Error('[AnalyticsHub] Mixpanel token is required');
    }

    const mixpanelConfig = {
      debug: false,
      track_pageview: true,
      persistence: 'localStorage',
      cross_subdomain_cookie: true,
      secure_cookie: window.location.protocol === 'https:',
      ip: false, // Don't track IP for privacy
      property_blacklist: ['$current_url', '$initial_referrer'],
      ...config.config,
    };

    mixpanel.init(config.token, mixpanelConfig);
    this.initialized = true;
    return Promise.resolve();
  }

  identify(userId: string, traits?: UserProperties): Promise<void> {
    if (!this.isReady()) return;

    mixpanel.identify(userId);

    if (traits) {
      mixpanel.people.set(traits);
    }
    return Promise.resolve();
  }

  track(
    event: string,
    properties?: EventProperties,
    options?: TrackOptions
  ): Promise<void> {
    if (!this.isReady()) return;

    const enhancedProperties = {
      ...properties,
      time: options?.timestamp || new Date(),
    };

    mixpanel.track(event, enhancedProperties);
    return Promise.resolve();
  }

  page(name?: string, properties?: EventProperties): Promise<void> {
    if (!this.isReady()) return;

    const pageProperties = {
      ...properties,
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      path: window.location.pathname,
    };

    const eventName = name ? `Page Viewed: ${name}` : 'Page Viewed';
    mixpanel.track(eventName, pageProperties);
    return Promise.resolve();
  }

  group(groupId: string, traits?: UserProperties): Promise<void> {
    if (!this.isReady()) return;

    // Mixpanel doesn't have native group support like Segment
    // We'll set it as a user property instead
    mixpanel.people.set({
      group_id: groupId,
      ...traits,
    });
    return Promise.resolve();
  }

  reset(): Promise<void> {
    if (!this.isReady()) return;

    mixpanel.reset();
    return Promise.resolve();
  }

  flush(): Promise<void> {
    if (!this.isReady()) return;

    // Mixpanel doesn't have an explicit flush method
    // Events are automatically sent
    return Promise.resolve();
  }

  isReady(): boolean {
    return this.initialized && typeof mixpanel !== 'undefined';
  }

  /**
   * Mixpanel-specific methods
   */

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    if (!this.isReady()) return;
    mixpanel.people.set(properties);
  }

  /**
   * Set user properties once (won't override existing values)
   */
  setUserPropertiesOnce(properties: UserProperties): void {
    if (!this.isReady()) return;
    mixpanel.people.set_once(properties);
  }

  /**
   * Increment user property
   */
  incrementUserProperty(property: string, value = 1): void {
    if (!this.isReady()) return;
    mixpanel.people.increment(property, value);
  }

  /**
   * Track revenue
   */
  trackRevenue(amount: number, properties?: EventProperties): void {
    if (!this.isReady()) return;

    mixpanel.people.track_charge(amount, properties);

    // Also track as a regular event
    this.track('Revenue', {
      ...properties,
      revenue: amount,
    });
  }

  /**
   * Delete user data
   */
  deleteUser(): void {
    if (!this.isReady()) return;
    mixpanel.people.delete_user();
  }

  /**
   * Opt user out of tracking
   */
  optOut(): void {
    if (!this.isReady()) return;
    mixpanel.opt_out_tracking();
  }

  /**
   * Opt user back in to tracking
   */
  optIn(): void {
    if (!this.isReady()) return;
    mixpanel.opt_in_tracking();
  }

  /**
   * Check if user has opted out
   */
  hasOptedOut(): boolean {
    if (!this.isReady()) return false;
    return mixpanel.has_opted_out_tracking();
  }
}

/**
 * Export Mixpanel instance for direct access if needed
 */
export { mixpanel };

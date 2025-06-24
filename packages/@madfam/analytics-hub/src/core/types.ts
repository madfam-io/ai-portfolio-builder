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
 * Universal analytics abstraction with multi-provider support
 */

export interface AnalyticsConfig {
  /**
   * Primary analytics provider
   */
  provider: 'posthog' | 'mixpanel' | 'amplitude' | 'segment' | 'custom';

  /**
   * Provider-specific configuration
   */
  providers: {
    posthog?: PostHogConfig;
    mixpanel?: MixpanelConfig;
    amplitude?: AmplitudeConfig;
    segment?: SegmentConfig;
    custom?: CustomProviderConfig;
  };

  /**
   * Global configuration
   */
  debug?: boolean;
  disabled?: boolean;
  autoCapture?: boolean;
  batchEvents?: boolean;
  batchSize?: number;
  flushInterval?: number;

  /**
   * Privacy settings
   */
  privacy?: {
    respectDNT?: boolean;
    anonymizeIPs?: boolean;
    cookieConsent?: boolean;
    dataRetentionDays?: number;
  };
}

export interface PostHogConfig {
  apiKey: string;
  host?: string;
  autocapture?: boolean;
  sessionRecording?: boolean;
  cookieName?: string;
}

export interface MixpanelConfig {
  token: string;
  config?: Record<string, unknown>;
}

export interface AmplitudeConfig {
  apiKey: string;
  config?: Record<string, unknown>;
}

export interface SegmentConfig {
  writeKey: string;
  config?: Record<string, unknown>;
}

export interface CustomProviderConfig {
  endpoint: string;
  headers?: Record<string, string>;
  batch?: boolean;
}

/**
 * Event types
 */
export interface AnalyticsEvent {
  name: string;
  properties?: EventProperties;
  timestamp?: Date;
  userId?: string;
  anonymousId?: string;
}

export interface EventProperties {
  [key: string]: string | number | boolean | Date | string[] | number[] | null;
}

export interface UserProperties {
  [key: string]: string | number | boolean | Date | string[] | number[] | null;
}

export interface TrackOptions {
  timestamp?: Date;
  anonymousId?: string;
  context?: EventContext;
}

export interface EventContext {
  page?: {
    url?: string;
    title?: string;
    referrer?: string;
  };
  device?: {
    type?: 'mobile' | 'tablet' | 'desktop';
    browser?: string;
    os?: string;
  };
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  campaign?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

/**
 * Analytics Provider Interface
 */
export interface AnalyticsProvider {
  name: string;
  initialize(config: unknown): Promise<void>;
  identify(userId: string, traits?: UserProperties): Promise<void>;
  track(
    event: string,
    properties?: EventProperties,
    options?: TrackOptions
  ): Promise<void>;
  page(name?: string, properties?: EventProperties): Promise<void>;
  group(groupId: string, traits?: UserProperties): Promise<void>;
  reset(): Promise<void>;
  flush(): Promise<void>;
  isReady(): boolean;
}

/**
 * Analytics Client Interface
 */
export interface AnalyticsClient {
  /**
   * Initialize the analytics client
   */
  initialize(): Promise<void>;

  /**
   * Identify a user
   */
  identify(userId: string, traits?: UserProperties): Promise<void>;

  /**
   * Track an event
   */
  track(
    event: string,
    properties?: EventProperties,
    options?: TrackOptions
  ): Promise<void>;

  /**
   * Track a page view
   */
  page(name?: string, properties?: EventProperties): Promise<void>;

  /**
   * Associate user with a group
   */
  group(groupId: string, traits?: UserProperties): Promise<void>;

  /**
   * Reset user identity
   */
  reset(): Promise<void>;

  /**
   * Flush pending events
   */
  flush(): Promise<void>;

  /**
   * Check if analytics is ready
   */
  isReady(): boolean;

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void;

  /**
   * Get current configuration
   */
  getConfig(): AnalyticsConfig;
}

/**
 * Event definitions for type safety
 */
export interface EventCatalog {
  // User events
  user_signed_up: {
    method: 'email' | 'oauth' | 'magic_link';
    provider?: string;
  };

  user_signed_in: {
    method: 'email' | 'oauth' | 'magic_link';
    provider?: string;
  };

  user_signed_out: {};

  // Feature usage
  feature_used: {
    feature_name: string;
    feature_category: string;
    user_plan?: string;
  };

  // Conversion events
  subscription_started: {
    plan: string;
    price: number;
    currency: string;
    trial?: boolean;
  };

  purchase_completed: {
    product_id: string;
    revenue: number;
    currency: string;
  };
}

/**
 * Type-safe event tracking
 */
export type TypeSafeTrack = <K extends keyof EventCatalog>(
  event: K,
  properties: EventCatalog[K],
  options?: TrackOptions
) => Promise<void>;

/**
 * Analytics Hook Result
 */
export interface AnalyticsHookResult {
  track: TypeSafeTrack;
  identify: (userId: string, traits?: UserProperties) => Promise<void>;
  page: (name?: string, properties?: EventProperties) => Promise<void>;
  group: (groupId: string, traits?: UserProperties) => Promise<void>;
  reset: () => Promise<void>;
  isReady: boolean;
}

/**
 * Analytics Context
 */
export interface AnalyticsContextValue {
  client: AnalyticsClient | null;
  isReady: boolean;
  isEnabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

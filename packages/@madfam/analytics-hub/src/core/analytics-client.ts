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

import type {
  AnalyticsConfig,
  AnalyticsClient,
  AnalyticsProvider,
  EventProperties,
  UserProperties,
  TrackOptions,
} from './types';

/**
 * Universal Analytics Client
 *
 * Provides a unified interface for multiple analytics providers
 */
export class UniversalAnalyticsClient implements AnalyticsClient {
  private config: AnalyticsConfig;
  private provider: AnalyticsProvider | null = null;
  private eventQueue: Array<() => Promise<void>> = [];
  private isInitialized = false;
  private isEnabled = true;

  constructor(config: AnalyticsConfig) {
    this.config = { ...config };

    // Respect privacy settings
    if (config.privacy?.respectDNT && this.isDNTEnabled()) {
      this.isEnabled = false;
    }
  }

  /**
   * Initialize the analytics client
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Import and initialize the provider
      this.provider = await this.createProvider();

      if (this.provider) {
        await this.provider.initialize(this.getProviderConfig());
        this.isInitialized = true;

        // Flush queued events
        await this.flushQueue();
      }
    } catch (error) {
      if (this.config.debug && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('[AnalyticsHub] Failed to initialize:', error);
      }
    }
  }

  /**
   * Identify a user
   */
  async identify(userId: string, traits?: UserProperties): Promise<void> {
    if (!this.isEnabled) return;

    const operation = async () => {
      if (this.provider && this.provider.isReady()) {
        await this.provider.identify(userId, traits);
      }
    };

    if (this.isReady()) {
      await operation();
    } else {
      this.eventQueue.push(operation);
    }
  }

  /**
   * Track an event
   */
  async track(
    event: string,
    properties?: EventProperties,
    options?: TrackOptions
  ): Promise<void> {
    if (!this.isEnabled) return;

    const enhancedProperties = {
      ...properties,
      // Add automatic properties
      $timestamp: options?.timestamp || new Date(),
      $source: 'analytics-hub',
      ...this.getContextProperties(),
    };

    const operation = async () => {
      if (this.provider && this.provider.isReady()) {
        await this.provider.track(event, enhancedProperties, options);
      }
    };

    if (this.isReady()) {
      await operation();
    } else {
      this.eventQueue.push(operation);
    }
  }

  /**
   * Track a page view
   */
  async page(name?: string, properties?: EventProperties): Promise<void> {
    if (!this.isEnabled) return;

    const enhancedProperties = {
      ...properties,
      ...this.getPageProperties(),
    };

    const operation = async () => {
      if (this.provider && this.provider.isReady()) {
        await this.provider.page(name, enhancedProperties);
      }
    };

    if (this.isReady()) {
      await operation();
    } else {
      this.eventQueue.push(operation);
    }
  }

  /**
   * Associate user with a group
   */
  async group(groupId: string, traits?: UserProperties): Promise<void> {
    if (!this.isEnabled) return;

    const operation = async () => {
      if (this.provider && this.provider.isReady()) {
        await this.provider.group(groupId, traits);
      }
    };

    if (this.isReady()) {
      await operation();
    } else {
      this.eventQueue.push(operation);
    }
  }

  /**
   * Reset user identity
   */
  async reset(): Promise<void> {
    if (!this.isEnabled) return;

    if (this.provider && this.provider.isReady()) {
      await this.provider.reset();
    }
  }

  /**
   * Flush pending events
   */
  async flush(): Promise<void> {
    if (this.provider && this.provider.isReady()) {
      await this.provider.flush();
    }
    await this.flushQueue();
  }

  /**
   * Check if analytics is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.provider?.isReady() === true;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    if (!enabled) {
      // Clear event queue when disabled
      this.eventQueue = [];
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Create provider instance based on configuration
   */
  private async createProvider(): Promise<AnalyticsProvider | null> {
    const { provider } = this.config;

    switch (provider) {
      case 'posthog': {
        const { PostHogProvider } = await import('../providers/posthog');
        return new PostHogProvider();
      }
      case 'mixpanel': {
        const { MixpanelProvider } = await import('../providers/mixpanel');
        return new MixpanelProvider();
      }
      case 'amplitude': {
        const { AmplitudeProvider } = await import('../providers/amplitude');
        return new AmplitudeProvider();
      }
      case 'segment': {
        const { SegmentProvider } = await import('../providers/segment');
        return new SegmentProvider();
      }
      case 'custom': {
        const { CustomProvider } = await import('../providers/custom');
        return new CustomProvider();
      }
      default:
        if (this.config.debug && process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.warn(`[AnalyticsHub] Unknown provider: ${provider}`);
        }
        return null;
    }
  }

  /**
   * Get provider-specific configuration
   */
  private getProviderConfig(): unknown {
    const { provider, providers } = this.config;
    return providers[provider] || {};
  }

  /**
   * Flush queued events
   */
  private async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const operations = [...this.eventQueue];
    this.eventQueue = [];

    // Execute all queued operations
    await Promise.allSettled(operations.map(op => op()));
  }

  /**
   * Get automatic context properties
   */
  private getContextProperties(): EventProperties {
    if (typeof window === 'undefined') return {};

    return {
      $screen_width: window.screen?.width,
      $screen_height: window.screen?.height,
      $viewport_width: window.innerWidth,
      $viewport_height: window.innerHeight,
      $timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      $user_agent: navigator.userAgent,
      $language: navigator.language,
    };
  }

  /**
   * Get page properties
   */
  private getPageProperties(): EventProperties {
    if (typeof window === 'undefined') return {};

    return {
      $page_url: window.location.href,
      $page_title: document.title,
      $page_referrer: document.referrer,
      $page_path: window.location.pathname,
      $page_search: window.location.search,
    };
  }

  /**
   * Check if Do Not Track is enabled
   */
  private isDNTEnabled(): boolean {
    if (typeof navigator === 'undefined') return false;
    return (
      navigator.doNotTrack === '1' ||
      (window as unknown as { doNotTrack?: string }).doNotTrack === '1' ||
      (navigator as unknown as { msDoNotTrack?: string }).msDoNotTrack === '1'
    );
  }
}

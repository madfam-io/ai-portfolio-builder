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
  AnalyticsProvider,
  CustomProviderConfig,
  EventProperties,
  UserProperties,
  TrackOptions,
} from '../core/types';

/**
 * Custom Analytics Provider
 *
 * Sends analytics events to a custom HTTP endpoint
 */
export class CustomProvider implements AnalyticsProvider {
  name = 'custom';
  private config: CustomProviderConfig | null = null;
  private initialized = false;
  private eventQueue: Array<{
    type: 'identify' | 'track' | 'page' | 'group';
    data: unknown;
  }> = [];

  async initialize(config: CustomProviderConfig): Promise<void> {
    if (!config.endpoint) {
      throw new Error('[AnalyticsHub] Custom provider endpoint is required');
    }

    this.config = config;
    this.initialized = true;

    // Process any queued events
    if (this.eventQueue.length > 0) {
      await this.sendBatch(this.eventQueue);
      this.eventQueue = [];
    }
  }

  async identify(userId: string, traits?: UserProperties): Promise<void> {
    const payload = {
      type: 'identify',
      userId,
      traits,
      timestamp: new Date().toISOString(),
    };

    await this.sendEvent(payload);
  }

  async track(
    event: string,
    properties?: EventProperties,
    options?: TrackOptions
  ): Promise<void> {
    const payload = {
      type: 'track',
      event,
      properties,
      userId: options?.anonymousId,
      timestamp: options?.timestamp?.toISOString() || new Date().toISOString(),
      context: options?.context,
    };

    await this.sendEvent(payload);
  }

  async page(name?: string, properties?: EventProperties): Promise<void> {
    const payload = {
      type: 'page',
      name,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        title: typeof document !== 'undefined' ? document.title : undefined,
        path:
          typeof window !== 'undefined' ? window.location.pathname : undefined,
      },
      timestamp: new Date().toISOString(),
    };

    await this.sendEvent(payload);
  }

  async group(groupId: string, traits?: UserProperties): Promise<void> {
    const payload = {
      type: 'group',
      groupId,
      traits,
      timestamp: new Date().toISOString(),
    };

    await this.sendEvent(payload);
  }

  async reset(): Promise<void> {
    // Custom providers may not support reset
    // This is a no-op implementation
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length > 0) {
      await this.sendBatch(this.eventQueue);
      this.eventQueue = [];
    }
  }

  isReady(): boolean {
    return this.initialized && this.config !== null;
  }

  /**
   * Send individual event
   */
  private async sendEvent(payload: unknown): Promise<void> {
    if (!this.isReady()) {
      this.eventQueue.push({
        type: 'track',
        data: payload,
      });
      return;
    }

    if (this.config?.batch) {
      this.eventQueue.push({
        type: 'track',
        data: payload,
      });

      // Send batch if queue is full
      if (this.eventQueue.length >= 10) {
        await this.sendBatch(this.eventQueue);
        this.eventQueue = [];
      }
    } else {
      await this.sendToEndpoint([payload]);
    }
  }

  /**
   * Send batch of events
   */
  private async sendBatch(
    events: Array<{ type: string; data: unknown }>
  ): Promise<void> {
    if (!this.isReady() || events.length === 0) return;

    const payload = events.map(event => event.data);
    await this.sendToEndpoint(payload);
  }

  /**
   * Send payload to HTTP endpoint
   */
  private async sendToEndpoint(payload: unknown[]): Promise<void> {
    if (!this.config) return;

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify({
          events: payload,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok && process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error(
          `[AnalyticsHub] Custom provider request failed: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('[AnalyticsHub] Custom provider request error:', error);
      }
    }
  }
}

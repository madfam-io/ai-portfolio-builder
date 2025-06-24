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
 * PostHog Analytics Provider
 *
 * Integration with PostHog for product analytics and feature flags
 */

import type { AnalyticsConfig, AnalyticsEvent } from '../../core/types';
import type {
  AnalyticsProvider,
  AnalyticsResult,
  EventBatch,
  UserIdentity,
  PostHogConfig,
} from '../types';

export class PostHogProvider implements AnalyticsProvider {
  private config: PostHogConfig;
  private client: any; // PostHog client type
  private initialized = false;

  constructor(analyticsConfig: AnalyticsConfig) {
    if (!analyticsConfig.apiKey) {
      throw new Error('PostHog API key is required');
    }

    this.config = {
      apiKey: analyticsConfig.apiKey,
      host: analyticsConfig.options?.host || 'https://app.posthog.com',
      flushAt: analyticsConfig.batchSize || 20,
      flushInterval: analyticsConfig.flushInterval || 10000,
      personalApiKey: analyticsConfig.options?.personalApiKey,
      featureFlags: analyticsConfig.options?.featureFlags !== false,
      capturePageviews: analyticsConfig.options?.capturePageviews !== false,
      autocapture: analyticsConfig.options?.autocapture !== false,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic import to avoid bundling PostHog in environments where it's not needed
      const { PostHog } = await import('posthog-node');

      this.client = new PostHog(this.config.apiKey, {
        host: this.config.host,
        flushAt: this.config.flushAt,
        flushInterval: this.config.flushInterval,
        personalApiKey: this.config.personalApiKey,
        featureFlags: this.config.featureFlags,
        // Additional PostHog-specific options
        requestTimeout: 10000,
        maxCacheSize: 10000,
      });

      this.initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize PostHog: ${(error as Error).message}`
      );
    }
  }

  async identify(userId: string, traits: UserIdentity = {}): Promise<void> {
    await this.ensureInitialized();

    const postHogTraits = {
      email: traits.email,
      name: traits.name,
      firstName: traits.firstName,
      lastName: traits.lastName,
      avatar: traits.avatar,
      created_at: traits.createdAt,
      plan: traits.plan,
      account_type: traits.accountType,
      portfolios_created: traits.portfoliosCreated,
      last_active: traits.lastActive,
      preferences: traits.preferences,
      ...traits.customTraits,
    };

    this.client.identify({
      distinctId: userId,
      properties: postHogTraits,
    });
  }

  async track(event: AnalyticsEvent): Promise<AnalyticsResult> {
    await this.ensureInitialized();

    try {
      const properties = {
        ...event.properties,
        $timestamp: event.timestamp,
        $ip: event.context?.ip,
        $current_url: event.context?.page,
        $referrer: event.context?.referrer,
        $user_agent: event.context?.userAgent,
        $session_id: event.context?.sessionId,
      };

      this.client.capture({
        distinctId: event.userId,
        event: event.event,
        properties,
        timestamp: event.timestamp,
      });

      return {
        success: true,
        timestamp: new Date(),
        messageId: this.generateMessageId(),
      };
    } catch (error) {
      return {
        success: false,
        timestamp: new Date(),
        error: (error as Error).message,
        retryable: true,
      };
    }
  }

  async batchTrack(batch: EventBatch): Promise<AnalyticsResult[]> {
    await this.ensureInitialized();

    const results: AnalyticsResult[] = [];

    for (const event of batch.events) {
      const result = await this.track(event);
      results.push(result);
    }

    return results;
  }

  async setUserProperties(
    userId: string,
    properties: Record<string, string | number | boolean | Date | null>
  ): Promise<void> {
    await this.ensureInitialized();

    this.client.identify({
      distinctId: userId,
      properties,
    });
  }

  async group(
    userId: string,
    groupId: string,
    traits: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    this.client.groupIdentify({
      distinctId: userId,
      groupType: 'company',
      groupKey: groupId,
      properties: traits,
    });
  }

  async page(
    userId: string,
    name: string,
    properties: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    this.client.capture({
      distinctId: userId,
      event: '$pageview',
      properties: {
        $current_url: name,
        ...properties,
      },
    });
  }

  async reset(): Promise<void> {
    // PostHog doesn't have a specific reset method
    // This would typically be handled client-side
  }

  async flush(): Promise<void> {
    if (this.client) {
      await this.client.flush();
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
    }
    this.initialized = false;
  }

  /**
   * PostHog-specific methods
   */

  async getFeatureFlag(
    userId: string,
    flagKey: string
  ): Promise<boolean | string | undefined> {
    await this.ensureInitialized();

    if (!this.config.featureFlags) {
      throw new Error('Feature flags not enabled');
    }

    try {
      return await this.client.getFeatureFlag(flagKey, userId);
    } catch (error) {
      throw new Error(
        `Failed to get feature flag: ${(error as Error).message}`
      );
    }
  }

  async getAllFeatureFlags(
    userId: string
  ): Promise<Record<string, boolean | string>> {
    await this.ensureInitialized();

    if (!this.config.featureFlags) {
      throw new Error('Feature flags not enabled');
    }

    try {
      return await this.client.getAllFlags(userId);
    } catch (error) {
      throw new Error(
        `Failed to get feature flags: ${(error as Error).message}`
      );
    }
  }

  async isFeatureEnabled(userId: string, flagKey: string): Promise<boolean> {
    await this.ensureInitialized();

    try {
      return await this.client.isFeatureEnabled(flagKey, userId);
    } catch (error) {
      throw new Error(
        `Failed to check feature flag: ${(error as Error).message}`
      );
    }
  }

  /**
   * Cohort analysis
   */
  async createCohort(
    name: string,
    query: Record<string, string | number | boolean | string[]>
  ): Promise<string> {
    await this.ensureInitialized();

    if (!this.config.personalApiKey) {
      throw new Error('Personal API key required for cohort operations');
    }

    // Implementation would use PostHog's API to create cohorts
    throw new Error('Cohort creation not implemented');
  }

  /**
   * Custom insights and queries
   */
  async runQuery(
    query: Record<string, string | number | boolean | string[]>
  ): Promise<unknown> {
    await this.ensureInitialized();

    if (!this.config.personalApiKey) {
      throw new Error('Personal API key required for custom queries');
    }

    // Implementation would use PostHog's query API
    throw new Error('Custom queries not implemented');
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private generateMessageId(): string {
    return `posthog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

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
 * Mixpanel Analytics Provider
 *
 * Integration with Mixpanel for event tracking and user analytics
 */

import type { AnalyticsConfig, AnalyticsEvent } from '../../core/types';
import type {
  AnalyticsProvider,
  AnalyticsResult,
  EventBatch,
  UserIdentity,
  MixpanelConfig,
} from '../types';

export class MixpanelProvider implements AnalyticsProvider {
  private config: MixpanelConfig;
  private client: any; // Mixpanel client type
  private initialized = false;

  constructor(analyticsConfig: AnalyticsConfig) {
    if (!analyticsConfig.apiKey) {
      throw new Error('Mixpanel token is required');
    }

    this.config = {
      token: analyticsConfig.apiKey,
      apiSecret: analyticsConfig.options?.apiSecret,
      debug: analyticsConfig.options?.debug || false,
      trackAutomaticEvents:
        analyticsConfig.options?.trackAutomaticEvents !== false,
      batchRequests: analyticsConfig.options?.batchRequests !== false,
      flushBatchSize: analyticsConfig.batchSize || 50,
      flushInterval: analyticsConfig.flushInterval || 10000,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic import to avoid bundling Mixpanel in environments where it's not needed
      const Mixpanel = await import('mixpanel');

      this.client = Mixpanel.init(this.config.token, {
        debug: this.config.debug,
        host: 'api.mixpanel.com',
        protocol: 'https',
        requestTimeout: 10000,
      });

      this.initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize Mixpanel: ${(error as Error).message}`
      );
    }
  }

  async identify(userId: string, traits: UserIdentity = {}): Promise<void> {
    await this.ensureInitialized();

    const mixpanelTraits = {
      $email: traits.email,
      $name: traits.name,
      $first_name: traits.firstName,
      $last_name: traits.lastName,
      $avatar: traits.avatar,
      $created: traits.createdAt,
      plan: traits.plan,
      account_type: traits.accountType,
      portfolios_created: traits.portfoliosCreated,
      last_active: traits.lastActive,
      preferences: traits.preferences,
      ...traits.customTraits,
    };

    this.client.people.set(userId, mixpanelTraits);
  }

  async track(event: AnalyticsEvent): Promise<AnalyticsResult> {
    await this.ensureInitialized();

    try {
      const properties = {
        distinct_id: event.userId,
        time: Math.floor((event.timestamp || new Date()).getTime() / 1000),
        $ip: event.context?.ip,
        $current_url: event.context?.page,
        $referrer: event.context?.referrer,
        $user_agent: event.context?.userAgent,
        $session_id: event.context?.sessionId,
        ...event.properties,
      };

      this.client.track(event.event, properties);

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

    const events = batch.events.map(event => ({
      event: event.event,
      properties: {
        distinct_id: event.userId,
        time: Math.floor((event.timestamp || new Date()).getTime() / 1000),
        $ip: event.context?.ip,
        $current_url: event.context?.page,
        $referrer: event.context?.referrer,
        $user_agent: event.context?.userAgent,
        $session_id: event.context?.sessionId,
        ...event.properties,
      },
    }));

    return new Promise(resolve => {
      this.client.track_batch(events, (error: any) => {
        if (error) {
          const results = batch.events.map(() => ({
            success: false,
            timestamp: new Date(),
            error: error.message,
            retryable: true,
          }));
          resolve(results);
        } else {
          const results = batch.events.map(() => ({
            success: true,
            timestamp: new Date(),
            messageId: this.generateMessageId(),
          }));
          resolve(results);
        }
      });
    });
  }

  async setUserProperties(
    userId: string,
    properties: Record<string, string | number | boolean | Date | null>
  ): Promise<void> {
    await this.ensureInitialized();

    // Convert properties to Mixpanel format
    const mixpanelProperties: Record<
      string,
      string | number | boolean | Date | null
    > = {};
    for (const [key, value] of Object.entries(properties)) {
      if (key === 'email') {
        mixpanelProperties.$email = value;
      } else if (key === 'name') {
        mixpanelProperties.$name = value;
      } else if (key === 'firstName') {
        mixpanelProperties.$first_name = value;
      } else if (key === 'lastName') {
        mixpanelProperties.$last_name = value;
      } else if (key === 'avatar') {
        mixpanelProperties.$avatar = value;
      } else if (key === 'phone') {
        mixpanelProperties.$phone = value;
      } else {
        mixpanelProperties[key] = value;
      }
    }

    this.client.people.set(userId, mixpanelProperties);
  }

  async page(
    userId: string,
    name: string,
    properties: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    this.client.track('Page View', {
      distinct_id: userId,
      page_name: name,
      $current_url: name,
      ...properties,
    });
  }

  async reset(): Promise<void> {
    // Mixpanel doesn't have a server-side reset method
    // This would typically be handled client-side
  }

  async flush(): Promise<void> {
    // Mixpanel automatically handles flushing
  }

  shutdown(): void {
    this.initialized = false;
  }

  /**
   * Mixpanel-specific methods
   */

  async incrementUserProperty(
    userId: string,
    property: string,
    value: number = 1
  ): Promise<void> {
    await this.ensureInitialized();

    this.client.people.increment(userId, property, value);
  }

  async appendToUserProperty(
    userId: string,
    property: string,
    value: any
  ): Promise<void> {
    await this.ensureInitialized();

    this.client.people.append(userId, property, value);
  }

  async setUserPropertyOnce(
    userId: string,
    properties: Record<string, string | number | boolean | Date | null>
  ): Promise<void> {
    await this.ensureInitialized();

    this.client.people.set_once(userId, properties);
  }

  async deleteUser(userId: string): Promise<void> {
    await this.ensureInitialized();

    this.client.people.delete_user(userId);
  }

  async trackRevenue(
    userId: string,
    amount: number,
    properties: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    this.client.people.track_charge(userId, amount, properties);
  }

  /**
   * Funnel analysis
   */
  async trackFunnelStep(
    userId: string,
    funnelName: string,
    step: string,
    properties: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    await this.track({
      userId,
      event: `${funnelName} - ${step}`,
      properties: {
        funnel_name: funnelName,
        funnel_step: step,
        ...properties,
      },
      timestamp: new Date(),
    });
  }

  /**
   * Cohort analysis
   */
  async addUserToCohort(_userId: string, _cohortId: string): Promise<void> {
    await this.ensureInitialized();

    if (!this.config.apiSecret) {
      throw new Error('API secret required for cohort operations');
    }

    // Implementation would use Mixpanel's Engage API
    throw new Error('Cohort operations not implemented');
  }

  /**
   * A/B testing support
   */
  async trackExperiment(
    userId: string,
    experimentName: string,
    variant: string,
    properties: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    await this.track({
      userId,
      event: 'Experiment Viewed',
      properties: {
        experiment_name: experimentName,
        variant_name: variant,
        ...properties,
      },
      timestamp: new Date(),
    });

    // Also set as user property
    await this.setUserProperties(userId, {
      [`experiment_${experimentName}`]: variant,
    });
  }

  /**
   * Custom queries (requires API secret)
   */
  async runJQLQuery(_query: string): Promise<unknown> {
    await this.ensureInitialized();

    if (!this.config.apiSecret) {
      throw new Error('API secret required for JQL queries');
    }

    // Implementation would use Mixpanel's JQL API
    throw new Error('JQL queries not implemented');
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private generateMessageId(): string {
    return `mixpanel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

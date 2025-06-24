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
 * Amplitude Analytics Provider
 *
 * Integration with Amplitude for behavioral analytics and user insights
 */

import type { AnalyticsConfig, AnalyticsEvent } from '../../core/types';
import type {
  AnalyticsProvider,
  AnalyticsResult,
  EventBatch,
  UserIdentity,
  AmplitudeConfig,
} from '../types';

export class AmplitudeProvider implements AnalyticsProvider {
  private config: AmplitudeConfig;
  private client: any; // Amplitude client type
  private initialized = false;

  constructor(analyticsConfig: AnalyticsConfig) {
    if (!analyticsConfig.apiKey) {
      throw new Error('Amplitude API key is required');
    }

    this.config = {
      apiKey: analyticsConfig.apiKey,
      secretKey: analyticsConfig.options?.secretKey,
      serverUrl:
        analyticsConfig.options?.serverUrl ||
        'https://api2.amplitude.com/2/httpapi',
      batchMode: analyticsConfig.options?.batchMode !== false,
      eventUploadThreshold: analyticsConfig.batchSize || 30,
      eventUploadPeriodMillis: analyticsConfig.flushInterval || 30000,
      identifyBatchIntervalMillis:
        analyticsConfig.options?.identifyBatchIntervalMillis || 30000,
      flushQueueSize: analyticsConfig.options?.flushQueueSize || 200,
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Dynamic import to avoid bundling Amplitude in environments where it's not needed
      const amplitude = await import('@amplitude/node');

      this.client = amplitude.init(this.config.apiKey, {
        serverUrl: this.config.serverUrl,
        batchMode: this.config.batchMode,
        eventUploadThreshold: this.config.eventUploadThreshold,
        eventUploadPeriodMillis: this.config.eventUploadPeriodMillis,
        identifyBatchIntervalMillis: this.config.identifyBatchIntervalMillis,
        flushQueueSize: this.config.flushQueueSize,
        requestTimeoutMillis: 10000,
      });

      this.initialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize Amplitude: ${(error as Error).message}`
      );
    }
  }

  async identify(userId: string, traits: UserIdentity = {}): Promise<void> {
    await this.ensureInitialized();

    const identifyEvent = {
      user_id: userId,
      user_properties: {
        email: traits.email,
        name: traits.name,
        first_name: traits.firstName,
        last_name: traits.lastName,
        avatar: traits.avatar,
        created_at: traits.createdAt?.toISOString(),
        plan: traits.plan,
        account_type: traits.accountType,
        portfolios_created: traits.portfoliosCreated,
        last_active: traits.lastActive?.toISOString(),
        preferences: traits.preferences,
        ...traits.customTraits,
      },
    };

    this.client.identify(identifyEvent);
  }

  async track(event: AnalyticsEvent): Promise<AnalyticsResult> {
    await this.ensureInitialized();

    try {
      const amplitudeEvent = {
        user_id: event.userId,
        event_type: event.event,
        time: (event.timestamp || new Date()).getTime(),
        event_properties: event.properties || {},
        user_properties: {},
        ip: event.context?.ip,
        platform: this.getPlatform(event.context?.userAgent),
        os_name: this.getOSName(event.context?.userAgent),
        device_type: this.getDeviceType(event.context?.userAgent),
        session_id: event.context?.sessionId
          ? parseInt(event.context.sessionId, 10)
          : undefined,
        insert_id: this.generateInsertId(),
      };

      this.client.logEvent(amplitudeEvent);

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
      user_id: event.userId,
      event_type: event.event,
      time: (event.timestamp || new Date()).getTime(),
      event_properties: event.properties || {},
      user_properties: {},
      ip: event.context?.ip,
      platform: this.getPlatform(event.context?.userAgent),
      os_name: this.getOSName(event.context?.userAgent),
      device_type: this.getDeviceType(event.context?.userAgent),
      session_id: event.context?.sessionId
        ? parseInt(event.context.sessionId, 10)
        : undefined,
      insert_id: this.generateInsertId(),
    }));

    try {
      for (const event of events) {
        this.client.logEvent(event);
      }

      return batch.events.map(() => ({
        success: true,
        timestamp: new Date(),
        messageId: this.generateMessageId(),
      }));
    } catch (error) {
      return batch.events.map(() => ({
        success: false,
        timestamp: new Date(),
        error: (error as Error).message,
        retryable: true,
      }));
    }
  }

  async setUserProperties(
    userId: string,
    properties: Record<string, string | number | boolean | Date | null>
  ): Promise<void> {
    await this.ensureInitialized();

    const identifyEvent = {
      user_id: userId,
      user_properties: properties,
    };

    this.client.identify(identifyEvent);
  }

  async group(
    userId: string,
    groupId: string,
    traits: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    const groupIdentifyEvent = {
      user_id: userId,
      group_properties: {
        '[Identify]company': {
          company_id: groupId,
          ...traits,
        },
      },
    };

    this.client.groupIdentify(groupIdentifyEvent);

    // Also set group on user
    await this.setUserProperties(userId, {
      company_id: groupId,
    });
  }

  async page(
    userId: string,
    name: string,
    properties: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    await this.track({
      userId,
      event: 'Page Viewed',
      properties: {
        page_name: name,
        page_url: name,
        ...properties,
      },
      timestamp: new Date(),
    });
  }

  async reset(): Promise<void> {
    // Amplitude doesn't have a specific reset method
    // This would typically be handled by clearing user_id
  }

  async flush(): Promise<void> {
    if (this.client) {
      await this.client.flush();
    }
  }

  async shutdown(): Promise<void> {
    if (this.client) {
      await this.client.flush();
    }
    this.initialized = false;
  }

  /**
   * Amplitude-specific methods
   */

  async setUserProperty(
    userId: string,
    property: string,
    value: any
  ): Promise<void> {
    await this.ensureInitialized();

    const identifyEvent = {
      user_id: userId,
      user_properties: {
        [property]: value,
      },
    };

    this.client.identify(identifyEvent);
  }

  async incrementUserProperty(
    userId: string,
    property: string,
    value: number = 1
  ): Promise<void> {
    await this.ensureInitialized();

    const identifyEvent = {
      user_id: userId,
      user_properties: {
        [`$add`]: {
          [property]: value,
        },
      },
    };

    this.client.identify(identifyEvent);
  }

  async appendToUserProperty(
    userId: string,
    property: string,
    value: any
  ): Promise<void> {
    await this.ensureInitialized();

    const identifyEvent = {
      user_id: userId,
      user_properties: {
        [`$append`]: {
          [property]: value,
        },
      },
    };

    this.client.identify(identifyEvent);
  }

  async setUserPropertyOnce(
    userId: string,
    properties: Record<string, string | number | boolean | Date | null>
  ): Promise<void> {
    await this.ensureInitialized();

    const identifyEvent = {
      user_id: userId,
      user_properties: {
        [`$setOnce`]: properties,
      },
    };

    this.client.identify(identifyEvent);
  }

  async unsetUserProperty(userId: string, property: string): Promise<void> {
    await this.ensureInitialized();

    const identifyEvent = {
      user_id: userId,
      user_properties: {
        [`$unset`]: {
          [property]: '-',
        },
      },
    };

    this.client.identify(identifyEvent);
  }

  /**
   * Revenue tracking
   */
  async trackRevenue(
    userId: string,
    productId: string,
    price: number,
    quantity: number = 1,
    properties: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    await this.ensureInitialized();

    const revenueEvent = {
      user_id: userId,
      event_type: 'revenue',
      revenue: price * quantity,
      productId,
      quantity,
      price,
      ...properties,
    };

    this.client.logRevenue(revenueEvent);
  }

  /**
   * Cohort analysis
   */
  async getCohortMembership(userId: string): Promise<string[]> {
    await this.ensureInitialized();

    if (!this.config.secretKey) {
      throw new Error('Secret key required for cohort operations');
    }

    // Implementation would use Amplitude's Cohort Discovery API
    throw new Error('Cohort membership not implemented');
  }

  /**
   * User lookup
   */
  async getUserProfile(userId: string): Promise<unknown> {
    await this.ensureInitialized();

    if (!this.config.secretKey) {
      throw new Error('Secret key required for user lookup');
    }

    // Implementation would use Amplitude's User Profile API
    throw new Error('User profile lookup not implemented');
  }

  /**
   * Custom queries
   */
  async runQuery(
    query: Record<string, string | number | boolean | string[]>
  ): Promise<unknown> {
    await this.ensureInitialized();

    if (!this.config.secretKey) {
      throw new Error('Secret key required for custom queries');
    }

    // Implementation would use Amplitude's Dashboard REST API
    throw new Error('Custom queries not implemented');
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  private generateMessageId(): string {
    return `amplitude_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateInsertId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getPlatform(userAgent?: string): string {
    if (!userAgent) return 'Unknown';

    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Web';
  }

  private getOSName(userAgent?: string): string {
    if (!userAgent) return 'Unknown';

    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Macintosh')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';

    return 'Unknown';
  }

  private getDeviceType(userAgent?: string): string {
    if (!userAgent) return 'Unknown';

    if (userAgent.includes('Mobile')) return 'Mobile';
    if (userAgent.includes('Tablet')) return 'Tablet';
    return 'Desktop';
  }
}

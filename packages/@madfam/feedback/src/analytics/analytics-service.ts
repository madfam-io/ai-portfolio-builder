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
 * Analytics Service
 *
 * Comprehensive analytics provider integration for tracking feedback events
 */

import type {
  AnalyticsConfig,
  FeedbackEntry,
  SatisfactionSurvey,
  AnalyticsEvent,
  PortfolioJourneyEvent,
  FeatureUsageEvent,
  SessionEvent,
} from '../core/types';
import type {
  AnalyticsProvider,
  AnalyticsResult,
  TrackingOptions,
  UserIdentity,
  EventBatch,
  AnalyticsMetrics,
} from './types';
import { PostHogProvider } from './providers/posthog';
import { MixpanelProvider } from './providers/mixpanel';
import { AmplitudeProvider } from './providers/amplitude';
import { Logger } from '../utils/logger';
import { EventEmitter } from '../utils/event-emitter';

export class AnalyticsService extends EventEmitter {
  private config: AnalyticsConfig;
  private logger: Logger;
  private provider?: AnalyticsProvider;
  private eventQueue: AnalyticsEvent[] = [];
  private batchTimer?: NodeJS.Timeout;
  private userId?: string;
  private sessionId?: string;
  private isEnabled = true;

  constructor(config: AnalyticsConfig) {
    super();
    this.config = config;
    this.logger = new Logger('AnalyticsService');

    this.initializeProvider();
    this.startBatchProcessor();
  }

  /**
   * Identify user for analytics tracking
   */
  async identify(userId: string, traits: UserIdentity = {}): Promise<void> {
    if (!this.isEnabled || !this.provider) return;

    this.userId = userId;
    
    try {
      await this.provider.identify(userId, traits);
      this.logger.debug('User identified', { userId, traits });
      this.emit('user.identified', { userId, traits });
    } catch (error) {
      this.logger.error('Failed to identify user', error as Error);
      this.emit('error', error);
    }
  }

  /**
   * Track feedback submission
   */
  async trackFeedbackSubmitted(feedback: FeedbackEntry): Promise<void> {
    const event: AnalyticsEvent = {
      userId: feedback.userId,
      event: 'feedback_submitted',
      properties: {
        feedbackId: feedback.id,
        type: feedback.type,
        severity: feedback.severity,
        category: feedback.category,
        hasAttachments: (feedback.attachments?.length || 0) > 0,
        hasRating: feedback.rating !== undefined,
        tags: feedback.tags,
        userPlan: feedback.userContext?.plan,
        accountAge: feedback.userContext?.accountAge,
        portfoliosCreated: feedback.userContext?.portfoliosCreated,
      },
      timestamp: feedback.timestamp,
      context: {
        userAgent: feedback.userAgent,
        page: feedback.url,
      },
    };

    await this.track(event);
  }

  /**
   * Track survey completion
   */
  async trackSurveyCompleted(survey: SatisfactionSurvey): Promise<void> {
    const event: AnalyticsEvent = {
      userId: survey.userId,
      event: 'survey_completed',
      properties: {
        surveyId: survey.id,
        overallSatisfaction: survey.overallSatisfaction,
        easeOfUse: survey.easeOfUse,
        performance: survey.performance,
        features: survey.features,
        design: survey.design,
        npsScore: survey.likelihoodToRecommend,
        npsCategory: survey.npsCategory,
        completionTime: survey.completedIn,
        completionContext: survey.completionContext,
        mostUsefulFeature: survey.mostUsefulFeature,
        leastUsefulFeature: survey.leastUsefulFeature,
        hasComments: survey.additionalComments.length > 0,
        missingFeaturesCount: survey.missingFeatures.length,
      },
      timestamp: survey.timestamp,
    };

    await this.track(event);
  }

  /**
   * Track portfolio journey events
   */
  async trackPortfolioJourney(event: PortfolioJourneyEvent): Promise<void> {
    await this.track(event);
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(event: FeatureUsageEvent): Promise<void> {
    await this.track(event);
  }

  /**
   * Track session completion
   */
  async trackSessionComplete(event: SessionEvent): Promise<void> {
    await this.track(event);
  }

  /**
   * Track custom event
   */
  async track(event: AnalyticsEvent, options: TrackingOptions = {}): Promise<void> {
    if (!this.isEnabled) return;

    // Add session context
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      userId: event.userId || this.userId,
      timestamp: event.timestamp || new Date(),
      context: {
        sessionId: this.sessionId,
        ...event.context,
      },
    };

    // Add to queue for batch processing or send immediately
    if (options.immediate || this.config.batchSize === 1) {
      await this.sendEvent(enrichedEvent);
    } else {
      this.eventQueue.push(enrichedEvent);
      
      if (this.eventQueue.length >= (this.config.batchSize || 10)) {
        await this.flushQueue();
      }
    }

    this.logger.debug('Event tracked', {
      event: enrichedEvent.event,
      userId: enrichedEvent.userId,
      immediate: options.immediate,
    });

    this.emit('event.tracked', enrichedEvent);
  }

  /**
   * Set user properties
   */
  async setUserProperties(userId: string, properties: Record<string, string | number | boolean | Date | null>): Promise<void> {
    if (!this.isEnabled || !this.provider) return;

    try {
      await this.provider.setUserProperties?.(userId, properties);
      this.logger.debug('User properties set', { userId, properties });
    } catch (error) {
      this.logger.error('Failed to set user properties', error as Error);
      this.emit('error', error);
    }
  }

  /**
   * Start new session
   */
  startSession(sessionId?: string): void {
    this.sessionId = sessionId || this.generateSessionId();
    this.logger.debug('Session started', { sessionId: this.sessionId });
    this.emit('session.started', { sessionId: this.sessionId });
  }

  /**
   * End current session
   */
  async endSession(): Promise<void> {
    if (this.sessionId) {
      this.logger.debug('Session ended', { sessionId: this.sessionId });
      this.emit('session.ended', { sessionId: this.sessionId });
      this.sessionId = undefined;
    }

    // Flush any remaining events
    await this.flushQueue();
  }

  /**
   * Enable/disable analytics tracking
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.logger.info(`Analytics tracking ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get analytics metrics
   */
  async getMetrics(): Promise<AnalyticsMetrics> {
    const baseMetrics: AnalyticsMetrics = {
      eventsTracked: 0,
      eventsSent: 0,
      eventsFailed: 0,
      avgBatchSize: 0,
      queueSize: this.eventQueue.length,
      lastEventTime: null,
      byEvent: {},
      byUser: {},
    };

    if (this.provider && typeof (this.provider as any).getMetrics === 'function') {
      const providerMetrics = await (this.provider as any).getMetrics();
      Object.assign(baseMetrics, providerMetrics);
    }

    return baseMetrics;
  }

  /**
   * Flush event queue
   */
  async flushQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      await this.sendEventBatch(events);
      this.logger.debug('Event batch flushed', { count: events.length });
    } catch (error) {
      // Re-queue failed events
      this.eventQueue.unshift(...events);
      this.logger.error('Failed to flush event batch', error as Error);
      this.emit('error', error);
    }
  }

  /**
   * Send single event
   */
  private async sendEvent(event: AnalyticsEvent): Promise<AnalyticsResult> {
    if (!this.provider) {
      throw new Error('Analytics provider not configured');
    }

    try {
      const result = await this.provider.track(event);
      this.emit('event.sent', { event, result });
      return result;
    } catch (error) {
      this.emit('event.failed', { event, error });
      throw error;
    }
  }

  /**
   * Send event batch
   */
  private async sendEventBatch(events: AnalyticsEvent[]): Promise<AnalyticsResult[]> {
    if (!this.provider) {
      throw new Error('Analytics provider not configured');
    }

    const batch: EventBatch = {
      events,
      timestamp: new Date(),
      batchId: this.generateBatchId(),
    };

    try {
      const results = this.provider.batchTrack
        ? await this.provider.batchTrack(batch)
        : await Promise.all(events.map(event => this.provider!.track(event)));

      this.emit('batch.sent', { batch, results });
      return results;
    } catch (error) {
      this.emit('batch.failed', { batch, error });
      throw error;
    }
  }

  /**
   * Initialize analytics provider
   */
  private initializeProvider(): void {
    if (!this.config.enabled) {
      this.logger.info('Analytics disabled');
      return;
    }

    try {
      switch (this.config.provider) {
        case 'posthog':
          this.provider = new PostHogProvider(this.config);
          break;
        case 'mixpanel':
          this.provider = new MixpanelProvider(this.config);
          break;
        case 'amplitude':
          this.provider = new AmplitudeProvider(this.config);
          break;
        case 'custom':
          if (this.config.customProvider) {
            this.provider = this.config.customProvider;
          }
          break;
        default:
          throw new Error(`Unknown analytics provider: ${this.config.provider}`);
      }

      this.logger.info('Analytics provider initialized', {
        provider: this.config.provider,
      });
    } catch (error) {
      this.logger.error('Failed to initialize analytics provider', error as Error);
      this.isEnabled = false;
    }
  }

  /**
   * Start batch processor
   */
  private startBatchProcessor(): void {
    const flushInterval = this.config.flushInterval || 30000; // 30 seconds default

    this.batchTimer = setInterval(async () => {
      if (this.eventQueue.length > 0) {
        await this.flushQueue();
      }
    }, flushInterval);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate batch ID
   */
  private generateBatchId(): string {
    return `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down analytics service');

    // Clear batch timer
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = undefined;
    }

    // Flush remaining events
    await this.flushQueue();

    // Cleanup provider
    if (this.provider && typeof (this.provider as any).shutdown === 'function') {
      await (this.provider as any).shutdown();
    }

    this.removeAllListeners();
  }
}

/**
 * Factory function to create analytics service
 */
export function createAnalyticsService(config: AnalyticsConfig): AnalyticsService {
  return new AnalyticsService(config);
}
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

import type {
  AnalyticsEvent,
  PortfolioJourneyEvent,
  FeatureUsageEvent,
  SessionEvent,
  StorageAdapter,
  FeedbackSystemConfig,
} from './types';
import { createStorageAdapter } from '../storage';
import { Logger } from '../utils/logger';
import { EventEmitter } from '../utils/event-emitter';

/**
 * Beta Analytics System
 * 
 * Advanced analytics and user behavior tracking for beta testing
 * with journey mapping, feature usage analysis, and conversion tracking
 */
export class BetaAnalytics extends EventEmitter {
  private storage: StorageAdapter;
  private logger: Logger;
  private sessionData: Map<string, SessionData> = new Map();
  private eventQueue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private config: BetaAnalyticsConfig;

  constructor(config: BetaAnalyticsConfig = {}) {
    super();
    
    this.config = {
      flushInterval: 30000, // 30 seconds
      maxQueueSize: 100,
      enableSessionTracking: true,
      enableJourneyMapping: true,
      ...config,
    };
    
    this.logger = new Logger('BetaAnalytics');
    this.storage = createStorageAdapter(config.storage || { type: 'memory' });
    
    this.initialize();
  }

  /**
   * Initialize analytics system
   */
  private initialize(): void {
    // Start flush interval
    if (this.config.flushInterval > 0) {
      this.flushInterval = setInterval(() => {
        this.flushEvents().catch(error => {
          this.logger.error('Failed to flush events', error);
        });
      }, this.config.flushInterval);
    }

    // Handle process termination
    if (typeof process !== 'undefined') {
      process.on('beforeExit', () => {
        this.shutdown();
      });
    }

    this.logger.info('Beta analytics initialized');
  }

  /**
   * Track user event
   */
  async trackEvent(event: {
    userId: string;
    event: string;
    properties?: Record<string, unknown>;
    timestamp?: Date;
    context?: AnalyticsEvent['context'];
  }): Promise<void> {
    const analyticsEvent: AnalyticsEvent = {
      userId: event.userId,
      event: event.event,
      properties: event.properties || {},
      timestamp: event.timestamp || new Date(),
      context: event.context || this.getDefaultContext(),
    };

    // Add to queue
    this.eventQueue.push(analyticsEvent);
    
    // Emit event for real-time processing
    this.emit('event:tracked', analyticsEvent);

    // Update session if tracking enabled
    if (this.config.enableSessionTracking) {
      this.updateSession(event.userId, event.event);
    }

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.maxQueueSize) {
      await this.flushEvents();
    }
  }

  /**
   * Track portfolio creation journey
   */
  async trackPortfolioJourney(
    userId: string,
    step: string,
    data?: {
      duration?: number;
      completed?: boolean;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    const journeyEvent: PortfolioJourneyEvent = {
      userId,
      event: 'portfolio_journey',
      properties: {
        step,
        duration: data?.duration,
        completed: data?.completed,
        metadata: data?.metadata,
      },
      timestamp: new Date(),
    };

    await this.trackEvent(journeyEvent);

    // Track journey progression
    if (this.config.enableJourneyMapping) {
      this.trackJourneyProgression(userId, step, data?.completed || false);
    }
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(
    userId: string,
    feature: string,
    action: string,
    data?: {
      value?: unknown;
      metadata?: Record<string, unknown>;
    }
  ): Promise<void> {
    const usageEvent: FeatureUsageEvent = {
      userId,
      event: 'feature_usage',
      properties: {
        feature,
        action,
        value: data?.value,
        metadata: data?.metadata,
      },
      timestamp: new Date(),
    };

    await this.trackEvent(usageEvent);

    // Update feature usage stats
    this.updateFeatureStats(feature, action);
  }

  /**
   * Track user session
   */
  async trackSession(
    userId: string,
    sessionData: {
      duration: number;
      pagesViewed: string[];
      actionsPerformed: string[];
      exitPage: string;
      errors?: number;
    }
  ): Promise<void> {
    const sessionEvent: SessionEvent = {
      userId,
      event: 'session_complete',
      properties: sessionData,
      timestamp: new Date(),
    };

    await this.trackEvent(sessionEvent);
    
    // Clear session data
    this.sessionData.delete(userId);
  }

  /**
   * Get user journey analytics
   */
  async getUserJourneys(limit: number = 100): Promise<UserJourney[]> {
    try {
      const events = await this.storage.getEvents({
        limit,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      // Group events by user and reconstruct journeys
      const journeyMap = new Map<string, AnalyticsEvent[]>();
      
      events
        .filter(e => e.event === 'portfolio_journey')
        .forEach(event => {
          const userEvents = journeyMap.get(event.userId) || [];
          userEvents.push(event);
          journeyMap.set(event.userId, userEvents);
        });

      // Convert to journey objects
      const journeys: UserJourney[] = [];
      
      for (const [userId, userEvents] of journeyMap) {
        const sortedEvents = userEvents.sort(
          (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
        );

        const journey: UserJourney = {
          userId,
          steps: sortedEvents.map(e => ({
            step: e.properties?.step as string || 'unknown',
            timestamp: e.timestamp,
            duration: e.properties?.duration as number,
            completed: e.properties?.completed as boolean,
          })),
          startTime: sortedEvents[0]?.timestamp || new Date(),
          endTime: sortedEvents[sortedEvents.length - 1]?.timestamp || new Date(),
          completed: sortedEvents.some(e => e.properties?.completed === true),
        };

        journeys.push(journey);
      }

      return journeys;
    } catch (error) {
      this.logger.error('Error fetching user journeys', error as Error);
      return [];
    }
  }

  /**
   * Get feature usage statistics
   */
  async getFeatureUsage(): Promise<FeatureUsageStats> {
    try {
      const events = await this.storage.getEvents({
        limit: 10000,
      });

      const featureStats: FeatureUsageStats = {};

      events
        .filter(e => e.event === 'feature_usage')
        .forEach(event => {
          const feature = event.properties?.feature as string || 'unknown';
          const action = event.properties?.action as string || 'unknown';

          if (!featureStats[feature]) {
            featureStats[feature] = {
              totalUsage: 0,
              uniqueUsers: new Set(),
              actions: {},
            };
          }

          featureStats[feature].totalUsage++;
          featureStats[feature].uniqueUsers.add(event.userId);

          if (!featureStats[feature].actions[action]) {
            featureStats[feature].actions[action] = 0;
          }
          featureStats[feature].actions[action]++;
        });

      // Convert Sets to counts
      const result: FeatureUsageStats = {};
      for (const [feature, stats] of Object.entries(featureStats)) {
        result[feature] = {
          totalUsage: stats.totalUsage,
          uniqueUsers: stats.uniqueUsers.size,
          actions: stats.actions,
        };
      }

      return result;
    } catch (error) {
      this.logger.error('Error fetching feature usage', error as Error);
      return {};
    }
  }

  /**
   * Get conversion funnel analytics
   */
  async getConversionFunnel(steps: string[]): Promise<ConversionFunnel> {
    try {
      const journeys = await this.getUserJourneys(1000);
      const funnel: ConversionFunnel = {
        steps: [],
        overallConversion: 0,
      };

      // Calculate conversion for each step
      let previousCount = journeys.length;
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const usersAtStep = journeys.filter(journey =>
          journey.steps.some(s => s.step === step)
        ).length;

        const conversion = previousCount > 0 ? (usersAtStep / previousCount) * 100 : 0;

        funnel.steps.push({
          name: step,
          users: usersAtStep,
          conversionRate: Math.round(conversion * 10) / 10,
          dropoff: previousCount - usersAtStep,
        });

        previousCount = usersAtStep;
      }

      // Calculate overall conversion
      const completedJourneys = journeys.filter(j => j.completed).length;
      funnel.overallConversion = journeys.length > 0
        ? Math.round((completedJourneys / journeys.length) * 1000) / 10
        : 0;

      return funnel;
    } catch (error) {
      this.logger.error('Error calculating conversion funnel', error as Error);
      return { steps: [], overallConversion: 0 };
    }
  }

  /**
   * Get user behavior insights
   */
  async getUserBehaviorInsights(): Promise<BehaviorInsights> {
    try {
      const events = await this.storage.getEvents({ limit: 10000 });
      const sessions = events.filter(e => e.event === 'session_complete');

      // Calculate average session duration
      const durations = sessions
        .map(s => s.properties?.duration as number || 0)
        .filter(d => d > 0);
      
      const avgSessionDuration = durations.length > 0
        ? durations.reduce((sum, d) => sum + d, 0) / durations.length
        : 0;

      // Calculate average pages per session
      const pagesPerSession = sessions
        .map(s => (s.properties?.pagesViewed as string[] || []).length)
        .filter(p => p > 0);
      
      const avgPagesPerSession = pagesPerSession.length > 0
        ? pagesPerSession.reduce((sum, p) => sum + p, 0) / pagesPerSession.length
        : 0;

      // Find most common actions
      const actionCounts: Record<string, number> = {};
      sessions.forEach(session => {
        const actions = session.properties?.actionsPerformed as string[] || [];
        actions.forEach(action => {
          actionCounts[action] = (actionCounts[action] || 0) + 1;
        });
      });

      const topActions = Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([action, count]) => ({ action, count }));

      // Calculate bounce rate
      const bouncedSessions = sessions.filter(s =>
        (s.properties?.pagesViewed as string[] || []).length <= 1
      ).length;
      
      const bounceRate = sessions.length > 0
        ? Math.round((bouncedSessions / sessions.length) * 1000) / 10
        : 0;

      return {
        avgSessionDuration: Math.round(avgSessionDuration),
        avgPagesPerSession: Math.round(avgPagesPerSession * 10) / 10,
        bounceRate,
        topActions,
        totalSessions: sessions.length,
      };
    } catch (error) {
      this.logger.error('Error calculating behavior insights', error as Error);
      return {
        avgSessionDuration: 0,
        avgPagesPerSession: 0,
        bounceRate: 0,
        topActions: [],
        totalSessions: 0,
      };
    }
  }

  /**
   * Private helper methods
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToFlush = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Store events in batches
      const batchSize = 50;
      for (let i = 0; i < eventsToFlush.length; i += batchSize) {
        const batch = eventsToFlush.slice(i, i + batchSize);
        await Promise.all(
          batch.map(event => this.storage.trackEvent(event))
        );
      }

      this.logger.debug(`Flushed ${eventsToFlush.length} events`);
    } catch (error) {
      this.logger.error('Failed to flush events', error as Error);
      // Re-add events to queue on failure
      this.eventQueue.unshift(...eventsToFlush);
    }
  }

  private getDefaultContext(): AnalyticsEvent['context'] {
    if (typeof window === 'undefined') {
      return {};
    }

    return {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      page: window.location.href,
    };
  }

  private updateSession(userId: string, event: string): void {
    const session = this.sessionData.get(userId) || {
      startTime: Date.now(),
      pagesViewed: new Set<string>(),
      actionsPerformed: [],
      lastActivity: Date.now(),
    };

    session.lastActivity = Date.now();
    session.actionsPerformed.push(event);

    if (typeof window !== 'undefined') {
      session.pagesViewed.add(window.location.pathname);
    }

    this.sessionData.set(userId, session);
  }

  private trackJourneyProgression(userId: string, step: string, completed: boolean): void {
    this.emit('journey:progress', {
      userId,
      step,
      completed,
      timestamp: new Date(),
    });
  }

  private updateFeatureStats(feature: string, action: string): void {
    this.emit('feature:used', {
      feature,
      action,
      timestamp: new Date(),
    });
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down beta analytics');
    
    // Flush remaining events
    await this.flushEvents();
    
    // Clear interval
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Clear data
    this.sessionData.clear();
    this.eventQueue = [];
    this.removeAllListeners();
  }
}

/**
 * Type definitions for analytics
 */
interface BetaAnalyticsConfig extends Partial<FeedbackSystemConfig> {
  flushInterval?: number;
  maxQueueSize?: number;
  enableSessionTracking?: boolean;
  enableJourneyMapping?: boolean;
}

interface SessionData {
  startTime: number;
  pagesViewed: Set<string>;
  actionsPerformed: string[];
  lastActivity: number;
}

interface UserJourney {
  userId: string;
  steps: {
    step: string;
    timestamp: Date;
    duration?: number;
    completed?: boolean;
  }[];
  startTime: Date;
  endTime: Date;
  completed: boolean;
}

interface FeatureUsageStats {
  [feature: string]: {
    totalUsage: number;
    uniqueUsers: number | Set<string>;
    actions: Record<string, number>;
  };
}

interface ConversionFunnel {
  steps: {
    name: string;
    users: number;
    conversionRate: number;
    dropoff: number;
  }[];
  overallConversion: number;
}

interface BehaviorInsights {
  avgSessionDuration: number; // milliseconds
  avgPagesPerSession: number;
  bounceRate: number; // percentage
  topActions: { action: string; count: number }[];
  totalSessions: number;
}

/**
 * Factory function to create beta analytics instance
 */
export function createBetaAnalytics(config?: BetaAnalyticsConfig): BetaAnalytics {
  return new BetaAnalytics(config);
}
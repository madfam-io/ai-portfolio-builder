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
  FeedbackEntry,
  SatisfactionSurvey,
  BetaMetrics,
  FeedbackSystemConfig,
  FeedbackFilter,
  FeedbackReport,
  FeedbackTrend,
  StorageAdapter,
  PaginatedResponse,
  ValidationError,
} from './types';
import { createStorageAdapter } from '../storage';
import { Logger } from '../utils/logger';
import { validateFeedback, validateSurvey } from '../utils/validators';
import { EventEmitter } from '../utils/event-emitter';
import { NotificationManager } from '../notifications';
import { AnalyticsService, createAnalyticsService } from '../analytics';

/**
 * Core Feedback System
 *
 * Enterprise-grade feedback collection and management system with
 * advanced analytics, real-time notifications, and flexible storage
 */
export class FeedbackSystem extends EventEmitter {
  private storage: StorageAdapter;
  private config: Required<FeedbackSystemConfig>;
  private logger: Logger;
  private cache: Map<string, unknown> = new Map();
  private notificationManager?: NotificationManager;
  private analyticsService?: AnalyticsService;

  constructor(config: FeedbackSystemConfig = {}) {
    super();

    // Initialize configuration with defaults
    this.config = this.mergeConfig(config);

    // Initialize logger
    this.logger = new Logger('FeedbackSystem', {
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    });

    // Initialize storage adapter
    this.storage = createStorageAdapter(this.config.storage);

    // Initialize notification manager
    if (this.config.notifications) {
      this.notificationManager = new NotificationManager(
        this.config.notifications
      );
    }

    // Initialize analytics service
    if (this.config.analytics?.enabled) {
      this.analyticsService = createAnalyticsService(this.config.analytics);
    }

    // Initialize system
    this.initialize();
  }

  /**
   * Initialize the feedback system
   */
  private async initialize(): Promise<void> {
    try {
      // Run storage migrations
      await this.storage.migrate();

      // Verify storage health
      const isHealthy = await this.storage.health();
      if (!isHealthy) {
        throw new Error('Storage adapter health check failed');
      }

      this.logger.info('Feedback system initialized successfully');
      this.emit('initialized');
    } catch (error) {
      this.logger.error('Failed to initialize feedback system', error as Error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Submit user feedback
   */
  async submitFeedback(
    feedback: Omit<FeedbackEntry, 'id' | 'timestamp' | 'status'>
  ): Promise<FeedbackEntry> {
    try {
      // Validate feedback data
      const validationResult = validateFeedback(feedback);
      if (!validationResult.valid) {
        throw new ValidationError('Invalid feedback data', {
          errors: validationResult.errors,
        });
      }

      // Create feedback entry
      const feedbackEntry = await this.storage.createFeedback({
        ...feedback,
        status: 'open',
      });

      this.logger.info('Feedback submitted', {
        feedbackId: feedbackEntry.id,
        type: feedbackEntry.type,
        severity: feedbackEntry.severity,
        userId: feedbackEntry.userId,
      });

      // Emit event for real-time updates
      this.emit('feedback:created', feedbackEntry);

      // Send notifications
      if (this.notificationManager) {
        await this.notificationManager.onFeedbackCreated(feedbackEntry);
      }

      // Track analytics
      if (this.analyticsService) {
        await this.analyticsService.trackFeedbackSubmitted(feedbackEntry);
      }

      // Handle critical feedback
      if (
        feedbackEntry.severity === 'critical' ||
        feedbackEntry.type === 'bug'
      ) {
        await this.handleCriticalFeedback(feedbackEntry);
      }

      // Clear relevant caches
      this.clearCache('metrics');
      this.clearCache('trends');

      return feedbackEntry;
    } catch (error) {
      this.logger.error('Error submitting feedback', error as Error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Submit satisfaction survey
   */
  async submitSurvey(
    survey: Omit<SatisfactionSurvey, 'id' | 'timestamp' | 'npsCategory'>
  ): Promise<SatisfactionSurvey> {
    try {
      // Validate survey data
      const validationResult = validateSurvey(survey);
      if (!validationResult.valid) {
        throw new ValidationError('Invalid survey data', {
          errors: validationResult.errors,
        });
      }

      // Calculate NPS category
      const npsCategory = this.calculateNPSCategory(
        survey.likelihoodToRecommend
      );

      // Create survey entry
      const surveyEntry = await this.storage.createSurvey({
        ...survey,
        npsCategory,
      });

      this.logger.info('Survey submitted', {
        surveyId: surveyEntry.id,
        userId: surveyEntry.userId,
        npsScore: surveyEntry.likelihoodToRecommend,
        npsCategory,
      });

      // Emit event
      this.emit('survey:created', surveyEntry);

      // Send notifications
      if (this.notificationManager) {
        await this.notificationManager.onSurveyCompleted(surveyEntry);
      }

      // Track analytics
      if (this.analyticsService) {
        await this.analyticsService.trackSurveyCompleted(surveyEntry);
      }

      // Clear relevant caches
      this.clearCache('metrics');
      this.clearCache('nps');

      return surveyEntry;
    } catch (error) {
      this.logger.error('Error submitting survey', error as Error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Get feedback entries with filtering
   */
  async getFeedback(
    filter?: FeedbackFilter
  ): Promise<PaginatedResponse<FeedbackEntry>> {
    try {
      const cacheKey = `feedback:${JSON.stringify(filter)}`;
      const cached =
        this.getFromCache<PaginatedResponse<FeedbackEntry>>(cacheKey);
      if (cached) return cached;

      const result = await this.storage.listFeedback(filter);

      // Cache for 5 minutes
      this.setCache(cacheKey, result, 5 * 60 * 1000);

      return result;
    } catch (error) {
      this.logger.error('Error fetching feedback', error as Error);
      throw error;
    }
  }

  /**
   * Get beta metrics and analytics
   */
  async getBetaMetrics(): Promise<BetaMetrics> {
    try {
      const cached = this.getFromCache<BetaMetrics>('metrics');
      if (cached) return cached;

      const metrics = await this.storage.getMetrics();

      // Cache for 10 minutes
      this.setCache('metrics', metrics, 10 * 60 * 1000);

      return metrics;
    } catch (error) {
      this.logger.error('Error fetching beta metrics', error as Error);
      throw error;
    }
  }

  /**
   * Calculate NPS score from surveys
   */
  async calculateNPS(): Promise<number> {
    try {
      const cached = this.getFromCache<number>('nps');
      if (cached !== undefined) return cached;

      const surveys = await this.storage.listSurveys({
        limit: 1000, // Get recent surveys
      });

      if (!surveys.data || surveys.data.length === 0) return 0;

      const scores = surveys.data.map(s => s.likelihoodToRecommend);
      const promoters = scores.filter(score => score >= 9).length;
      const detractors = scores.filter(score => score <= 6).length;
      const total = scores.length;

      const nps = Math.round(((promoters - detractors) / total) * 100);

      // Cache for 1 hour
      this.setCache('nps', nps, 60 * 60 * 1000);

      return nps;
    } catch (error) {
      this.logger.error('Error calculating NPS', error as Error);
      return 0;
    }
  }

  /**
   * Get feedback trends over time
   */
  async getFeedbackTrends(days: number = 30): Promise<FeedbackTrend[]> {
    try {
      const cacheKey = `trends:${days}`;
      const cached = this.getFromCache<FeedbackTrend[]>(cacheKey);
      if (cached) return cached;

      const trends = await this.storage.getFeedbackTrends(days);

      // Cache for 30 minutes
      this.setCache(cacheKey, trends, 30 * 60 * 1000);

      return trends;
    } catch (error) {
      this.logger.error('Error fetching feedback trends', error as Error);
      return [];
    }
  }

  /**
   * Generate comprehensive feedback report
   */
  async generateFeedbackReport(): Promise<FeedbackReport> {
    try {
      const [feedback, surveys, _metrics, nps] = await Promise.all([
        this.getFeedback({ limit: 1000 }),
        this.storage.listSurveys({ limit: 100 }),
        this.getBetaMetrics(),
        this.calculateNPS(),
      ]);

      const feedbackData = feedback.data || [];
      const surveyData = surveys.data || [];

      // Calculate summary
      const criticalIssues = feedbackData.filter(
        f => f.severity === 'critical'
      ).length;
      const ratingsSum = feedbackData.reduce(
        (sum, f) => sum + (f.rating || 0),
        0
      );
      const ratingsCount = feedbackData.filter(f => f.rating).length;
      const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

      // Calculate breakdowns
      const byType: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};
      const byStatus: Record<string, number> = {};

      feedbackData.forEach(entry => {
        byType[entry.type] = (byType[entry.type] || 0) + 1;
        bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;
        byStatus[entry.status] = (byStatus[entry.status] || 0) + 1;
      });

      // Get top issues
      const topIssues = feedbackData
        .filter(f => f.severity === 'critical' || f.severity === 'high')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      // Get recent surveys
      const recentSurveys = surveyData
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

      return {
        summary: {
          totalFeedback: feedbackData.length,
          criticalIssues,
          averageRating: Math.round(averageRating * 10) / 10,
          npsScore: nps,
        },
        breakdown: {
          byType,
          bySeverity,
          byStatus,
        },
        topIssues,
        recentSurveys,
      };
    } catch (error) {
      this.logger.error('Error generating feedback report', error as Error);
      throw error;
    }
  }

  /**
   * Identify user for analytics tracking
   */
  async identifyUser(
    userId: string,
    traits: Record<string, string | number | boolean | Date | null> = {}
  ): Promise<void> {
    if (this.analyticsService) {
      await this.analyticsService.identify(userId, traits);
    }
  }

  /**
   * Track custom analytics event
   */
  async trackEvent(
    userId: string,
    event: string,
    properties: Record<string, string | number | boolean | Date> = {}
  ): Promise<void> {
    if (this.analyticsService) {
      await this.analyticsService.track({
        userId,
        event,
        properties,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Update feedback status
   */
  async updateFeedbackStatus(
    feedbackId: string,
    status: FeedbackEntry['status'],
    metadata?: Record<string, string | number | boolean | string[]>
  ): Promise<FeedbackEntry> {
    try {
      // Get original feedback for comparison
      const original = await this.storage.getFeedback(feedbackId);
      if (!original) {
        throw new Error(`Feedback not found: ${feedbackId}`);
      }

      const updated = await this.storage.updateFeedback(feedbackId, {
        status,
        metadata,
      });

      this.logger.info('Feedback status updated', {
        feedbackId,
        previousStatus: original.status,
        newStatus: status,
      });

      // Send notifications for status changes
      if (this.notificationManager && original.status !== status) {
        await this.notificationManager.onFeedbackUpdated(updated, {
          status: original.status,
        });
      }

      this.emit('feedback:updated', updated);
      this.clearCache('feedback');

      return updated;
    } catch (error) {
      this.logger.error('Error updating feedback status', error as Error);
      throw error;
    }
  }

  /**
   * Handle critical feedback with notifications
   */
  private async handleCriticalFeedback(feedback: FeedbackEntry): Promise<void> {
    this.logger.warn('Critical feedback received', {
      feedbackId: feedback.id,
      type: feedback.type,
      severity: feedback.severity,
      title: feedback.title,
    });

    // Emit critical feedback event
    this.emit('feedback:critical', feedback);

    // Send notifications if configured
    if (this.config.notifications) {
      const { criticalBugWebhook, emailOnCritical, slackIntegration } =
        this.config.notifications;

      const promises: Promise<void>[] = [];

      if (criticalBugWebhook) {
        promises.push(
          this.sendWebhook(criticalBugWebhook, {
            type: 'critical_feedback',
            feedback,
          })
        );
      }

      if (slackIntegration) {
        promises.push(this.sendSlackNotification(slackIntegration, feedback));
      }

      // Note: Email notification would require email service integration
      if (emailOnCritical) {
        this.logger.info('Email notification configured but not implemented', {
          email: emailOnCritical,
        });
      }

      await Promise.allSettled(promises);
    }
  }

  /**
   * Send webhook notification
   */
  private async sendWebhook(url: string, data: unknown): Promise<void> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Failed to send webhook', error as Error);
    }
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(
    config: { webhookUrl: string; channel?: string },
    feedback: FeedbackEntry
  ): Promise<void> {
    const message = {
      channel: config.channel,
      text: `🚨 Critical Feedback Received`,
      attachments: [
        {
          color: 'danger',
          fields: [
            { title: 'Type', value: feedback.type, short: true },
            { title: 'Severity', value: feedback.severity, short: true },
            { title: 'Title', value: feedback.title },
            { title: 'Description', value: feedback.description },
            { title: 'User', value: feedback.userId, short: true },
            { title: 'URL', value: feedback.url, short: true },
          ],
          footer: 'MADFAM Feedback System',
          ts: Math.floor(feedback.timestamp.getTime() / 1000),
        },
      ],
    };

    await this.sendWebhook(config.webhookUrl, message);
  }

  /**
   * Calculate NPS category from score
   */
  private calculateNPSCategory(
    score: number
  ): 'promoter' | 'passive' | 'detractor' {
    if (score >= 9) return 'promoter';
    if (score >= 7) return 'passive';
    return 'detractor';
  }

  /**
   * Merge configuration with defaults
   */
  private mergeConfig(
    config: FeedbackSystemConfig
  ): Required<FeedbackSystemConfig> {
    return {
      apiEndpoint: config.apiEndpoint || '/api/v1/feedback',
      storage: config.storage || { type: 'memory' },
      analytics: config.analytics || { enabled: true },
      notifications: config.notifications || {},
      ui: config.ui || {},
      features: config.features || {},
      maxFeedbackEntries: config.maxFeedbackEntries || 10000,
      feedbackRetentionDays: config.feedbackRetentionDays || 365,
      analyticsRetentionDays: config.analyticsRetentionDays || 90,
    };
  }

  /**
   * Cache management
   */
  private getFromCache<T>(key: string): T | undefined {
    const cached = this.cache.get(key) as
      | { value: T; expires: number }
      | undefined;
    if (!cached) return undefined;

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return undefined;
    }

    return cached.value;
  }

  private setCache<T>(key: string, value: T, ttl: number): void {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl,
    });
  }

  private clearCache(prefix?: string): void {
    if (!prefix) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down feedback system');

    // Shutdown analytics service
    if (this.analyticsService) {
      await this.analyticsService.shutdown();
    }

    this.removeAllListeners();
    this.cache.clear();
  }
}

/**
 * Factory function to create feedback system instance
 */
export function createFeedbackSystem(
  config?: FeedbackSystemConfig
): FeedbackSystem {
  return new FeedbackSystem(config);
}

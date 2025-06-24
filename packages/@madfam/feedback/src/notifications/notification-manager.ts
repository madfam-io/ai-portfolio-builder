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
 * Notification Manager
 *
 * Orchestrates all notification channels and handles event routing
 */

import { EmailService } from './email-service';
import { WebhookService } from './webhook-service';
import { SlackService } from './slack-service';
import type {
  FeedbackEntry,
  SatisfactionSurvey,
  FeedbackReport,
  NotificationConfig,
  NotificationPayload,
} from '../core/types';
import type { NotificationQueue, NotificationMetrics } from './types';
import { Logger } from '../utils/logger';
import { EventEmitter } from '../utils/event-emitter';

export class NotificationManager extends EventEmitter {
  private config: NotificationConfig;
  private logger: Logger;
  private emailService?: EmailService;
  private webhookService?: WebhookService;
  private slackService?: SlackService;
  private queue: NotificationQueue[] = [];
  private processing = false;

  constructor(config: NotificationConfig) {
    super();
    this.config = config;
    this.logger = new Logger('NotificationManager');

    this.initializeServices();
    this.startQueueProcessor();
  }

  /**
   * Handle feedback created event
   */
  async onFeedbackCreated(feedback: FeedbackEntry): Promise<void> {
    this.logger.info('Processing feedback created event', {
      feedbackId: feedback.id,
    });

    // Critical bug notifications
    if (feedback.severity === 'critical') {
      await this.handleCriticalBug(feedback);
    }

    // New feedback notifications
    await this.handleNewFeedback(feedback);

    // Emit event for custom handlers
    this.emit('feedback.created', feedback);
  }

  /**
   * Handle feedback updated event
   */
  async onFeedbackUpdated(
    feedback: FeedbackEntry,
    previousState: Partial<FeedbackEntry>
  ): Promise<void> {
    this.logger.info('Processing feedback updated event', {
      feedbackId: feedback.id,
    });

    // Status change notifications
    if (previousState.status && previousState.status !== feedback.status) {
      await this.handleStatusChange(feedback, previousState.status);
    }

    // Severity escalation
    if (
      previousState.severity !== 'critical' &&
      feedback.severity === 'critical'
    ) {
      await this.handleCriticalBug(feedback);
    }

    this.emit('feedback.updated', feedback, previousState);
  }

  /**
   * Handle survey completed event
   */
  async onSurveyCompleted(survey: SatisfactionSurvey): Promise<void> {
    this.logger.info('Processing survey completed event', {
      surveyId: survey.id,
    });

    // NPS detractor notifications
    if (survey.npsCategory === 'detractor' || survey.overallSatisfaction <= 5) {
      await this.handleLowSatisfaction(survey);
    }

    this.emit('survey.completed', survey);
  }

  /**
   * Send weekly digest
   */
  async sendWeeklyDigest(_report: FeedbackReport): Promise<void> {
    this.logger.info('Sending weekly digest');

    const payload: NotificationPayload = {
      event: 'analytics.weekly_digest',
      timestamp: new Date(),
      data: { report },
    };

    await this.queueNotification('email', payload, 'normal');

    if (this.slackService) {
      await this.slackService.sendWeeklyDigest(report);
    }

    this.emit('digest.sent', report);
  }

  /**
   * Send test notifications
   */
  async sendTestNotifications(recipient: string): Promise<void> {
    this.logger.info('Sending test notifications', { recipient });

    // Test email
    if (this.emailService) {
      await this.emailService.sendTestEmail(recipient);
    }

    // Test webhook
    if (this.webhookService) {
      const testPayload: NotificationPayload = {
        event: 'system.test',
        timestamp: new Date(),
        data: { recipient, message: 'Test notification' },
      };
      await this.webhookService.sendWebhook(testPayload);
    }

    // Test Slack
    if (this.slackService) {
      await this.slackService.sendTestMessage();
    }
  }

  /**
   * Get notification metrics
   */
  async getMetrics(): Promise<NotificationMetrics> {
    const baseMetrics = {
      totalSent: 0,
      totalDelivered: 0,
      totalFailed: 0,
      deliveryRate: 0,
      bounceRate: 0,
      complaintRate: 0,
      avgDeliveryTime: 0,
      byType: {},
      byPeriod: {},
    };

    // Aggregate metrics from services
    if (
      this.emailService &&
      typeof (this.emailService as any).getMetrics === 'function'
    ) {
      const emailMetrics = await (this.emailService as any).getMetrics();
      // Merge email metrics
      Object.assign(baseMetrics, emailMetrics);
    }

    return baseMetrics;
  }

  /**
   * Handle critical bug notifications
   */
  private async handleCriticalBug(feedback: FeedbackEntry): Promise<void> {
    const payload: NotificationPayload = {
      event: 'feedback.critical',
      timestamp: new Date(),
      data: { feedback },
    };

    // High priority email
    await this.queueNotification('email', payload, 'high');

    // Immediate Slack notification
    if (this.slackService) {
      await this.slackService.sendCriticalBugAlert(feedback);
    }

    // Legacy webhook support
    if (this.config.criticalBugWebhook) {
      await this.queueNotification('webhook', payload, 'high');
    }
  }

  /**
   * Handle new feedback notifications
   */
  private async handleNewFeedback(feedback: FeedbackEntry): Promise<void> {
    // Only notify for important feedback
    if (feedback.severity === 'low' && feedback.type === 'general') {
      return;
    }

    const payload: NotificationPayload = {
      event: 'feedback.created',
      timestamp: new Date(),
      data: { feedback },
    };

    await this.queueNotification('email', payload, 'normal');

    if (this.slackService) {
      await this.slackService.sendNewFeedbackNotification(feedback);
    }
  }

  /**
   * Handle status change notifications
   */
  private async handleStatusChange(
    feedback: FeedbackEntry,
    previousStatus: string
  ): Promise<void> {
    // Notify user of status changes
    if (this.config.email?.userNotifications) {
      const payload: NotificationPayload = {
        event: 'user.status_update',
        timestamp: new Date(),
        data: { feedback, previousStatus },
      };

      await this.queueNotification('email', payload, 'normal');
    }

    // Team notifications for resolutions
    if (feedback.status === 'resolved') {
      const _payload: NotificationPayload = {
        event: 'feedback.resolved',
        timestamp: new Date(),
        data: { feedback, previousStatus },
      };

      if (this.slackService) {
        await this.slackService.sendResolutionNotification(feedback);
      }
    }
  }

  /**
   * Handle low satisfaction surveys
   */
  private async handleLowSatisfaction(
    survey: SatisfactionSurvey
  ): Promise<void> {
    const payload: NotificationPayload = {
      event: 'survey.nps_detractor',
      timestamp: new Date(),
      data: { survey },
    };

    await this.queueNotification('email', payload, 'high');

    if (this.slackService) {
      await this.slackService.sendLowSatisfactionAlert(survey);
    }
  }

  /**
   * Queue notification for processing
   */
  private queueNotification(
    type: 'email' | 'webhook' | 'slack',
    payload: NotificationPayload,
    priority: 'low' | 'normal' | 'high'
  ): Promise<void> {
    const notification: NotificationQueue = {
      id: this.generateId(),
      type,
      payload,
      priority,
      scheduledAt: new Date(),
      attempts: 0,
      maxAttempts: 3,
      status: 'pending',
    };

    this.queue.push(notification);
    this.queue.sort(
      (a, b) =>
        this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority)
    );

    this.logger.debug('Notification queued', {
      id: notification.id,
      type,
      event: payload.event,
      priority,
    });
  }

  /**
   * Process notification queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      const notification = this.queue.shift();
      if (!notification) {
        return;
      }

      notification.status = 'processing';
      notification.attempts++;

      try {
        await this.processNotification(notification);
        notification.status = 'completed';
        this.logger.debug('Notification processed successfully', {
          id: notification.id,
        });
      } catch (error) {
        notification.status = 'failed';
        notification.lastError = (error as Error).message;

        // Retry if not exceeded max attempts
        if (notification.attempts < notification.maxAttempts) {
          notification.status = 'pending';
          notification.scheduledAt = new Date(
            Date.now() + this.getRetryDelay(notification.attempts)
          );
          this.queue.push(notification);
        }

        this.logger.error('Notification processing failed', error as Error, {
          id: notification.id,
          attempts: notification.attempts,
        });
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process individual notification
   */
  private async processNotification(
    notification: NotificationQueue
  ): Promise<void> {
    switch (notification.type) {
      case 'email':
        await this.processEmailNotification(notification);
        break;
      case 'webhook':
        await this.processWebhookNotification(notification);
        break;
      case 'slack':
        await this.processSlackNotification(notification);
        break;
      default:
        throw new Error(`Unknown notification type: ${notification.type}`);
    }
  }

  /**
   * Process email notification
   */
  private async processEmailNotification(
    notification: NotificationQueue
  ): Promise<void> {
    if (!this.emailService) {
      throw new Error('Email service not configured');
    }

    const { event, data } = notification.payload;

    switch (event) {
      case 'feedback.critical':
        await this.emailService.sendCriticalBugNotification(data.feedback);
        break;
      case 'feedback.created':
        await this.emailService.sendNewFeedbackNotification(data.feedback);
        break;
      case 'survey.nps_detractor':
        await this.emailService.sendNPSSurveyNotification(data.survey);
        break;
      case 'analytics.weekly_digest':
        const recipients = this.config.email?.teamRecipients || [];
        await this.emailService.sendWeeklyDigest(data.report, recipients);
        break;
      case 'user.status_update':
        // Would need user email lookup
        // await this.emailService.sendStatusUpdateToUser(data.feedback, userEmail, data.previousStatus);
        break;
      default:
        this.logger.warn('Unknown email event type', { event });
    }
  }

  /**
   * Process webhook notification
   */
  private async processWebhookNotification(
    notification: NotificationQueue
  ): Promise<void> {
    if (!this.webhookService) {
      throw new Error('Webhook service not configured');
    }

    await this.webhookService.sendWebhook(notification.payload);
  }

  /**
   * Process Slack notification
   */
  private processSlackNotification(_notification: NotificationQueue): void {
    if (!this.slackService) {
      throw new Error('Slack service not configured');
    }

    // Slack notifications are typically handled directly, not queued
  }

  /**
   * Initialize notification services
   */
  private initializeServices(): void {
    if (this.config.email?.enabled) {
      this.emailService = new EmailService(this.config);
    }

    if (this.config.customWebhooks?.length || this.config.criticalBugWebhook) {
      this.webhookService = new WebhookService(this.config);
    }

    if (this.config.slackIntegration?.webhookUrl) {
      this.slackService = new SlackService(this.config);
    }
  }

  /**
   * Start queue processor
   */
  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueue().catch(error => {
        this.logger.error('Queue processing error', error as Error);
      });
    }, 1000); // Process queue every second
  }

  /**
   * Helper methods
   */
  private getPriorityWeight(priority: string): number {
    const weights = { low: 1, normal: 2, high: 3 };
    return weights[priority as keyof typeof weights] || 2;
  }

  private getRetryDelay(attempt: number): number {
    // Exponential backoff: 2^attempt * 1000ms
    return Math.min(Math.pow(2, attempt) * 1000, 30000); // Max 30 seconds
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Placeholder services (would be implemented in separate files)
class WebhookService {
  constructor(private config: NotificationConfig) {}

  async sendWebhook(_payload: NotificationPayload): Promise<void> {
    // Webhook implementation
  }
}

class SlackService {
  constructor(private config: NotificationConfig) {}

  async sendCriticalBugAlert(_feedback: FeedbackEntry): Promise<void> {
    // Slack implementation
  }

  async sendNewFeedbackNotification(_feedback: FeedbackEntry): Promise<void> {
    // Slack implementation
  }

  async sendResolutionNotification(_feedback: FeedbackEntry): Promise<void> {
    // Slack implementation
  }

  async sendLowSatisfactionAlert(_survey: SatisfactionSurvey): Promise<void> {
    // Slack implementation
  }

  async sendWeeklyDigest(_report: FeedbackReport): Promise<void> {
    // Slack implementation
  }

  async sendTestMessage(): Promise<void> {
    // Slack implementation
  }
}

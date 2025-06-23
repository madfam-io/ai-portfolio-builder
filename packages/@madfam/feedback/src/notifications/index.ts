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
 * Notifications Module
 *
 * Comprehensive notification system for feedback events
 */

export { NotificationManager } from './notification-manager';
export { EmailService } from './email-service';

export type {
  NotificationConfig,
  EmailConfig,
  EmailCredentials,
  EmailTemplate,
  EmailNotification,
  WebhookConfig,
  SlackConfig,
  NotificationEvent,
  NotificationPayload,
  NotificationQueue,
  NotificationMetrics,
  EmailProvider,
  EmailDeliveryResult,
  EmailDeliveryStatus,
  FeedbackEmailContext,
  SurveyEmailContext,
  DigestEmailContext,
  StatusUpdateEmailContext,
} from './types';
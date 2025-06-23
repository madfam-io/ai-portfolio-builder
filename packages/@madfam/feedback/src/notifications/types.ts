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
 * Notification Types
 *
 * Type definitions for email notifications and messaging
 */

import type { FeedbackEntry, SatisfactionSurvey, FeedbackReport } from '../core/types';

export interface NotificationConfig {
  // Email configuration
  email?: EmailConfig;
  
  // Webhook configuration
  webhooks?: WebhookConfig[];
  
  // Slack integration
  slack?: SlackConfig;
  
  // General notification settings
  enabled?: boolean;
  environment?: 'development' | 'staging' | 'production';
}

export interface EmailConfig {
  enabled: boolean;
  provider: 'sendgrid' | 'ses' | 'smtp' | 'resend';
  credentials?: EmailCredentials;
  
  // Recipients
  criticalBugRecipients?: string[];
  newFeedbackRecipients?: string[];
  surveyRecipients?: string[];
  teamRecipients?: string[];
  
  // User notifications
  userNotifications?: boolean;
  
  // Rate limiting
  rateLimit?: {
    maxPerMinute: number;
    maxPerHour: number;
  };
  
  // Delivery tracking
  trackDelivery?: boolean;
  
  // URLs
  dashboardUrl?: string;
  unsubscribeUrl?: string;
  
  // Templates
  customTemplates?: Record<string, EmailTemplate>;
}

export interface EmailCredentials {
  // SendGrid
  apiKey?: string;
  
  // AWS SES
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  
  // SMTP
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  
  // Resend
  resendApiKey?: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content: string | Buffer;
  contentType?: string;
  encoding?: string;
}

export interface EmailNotification {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, string | number | boolean | Date>;
  attachments?: EmailAttachment[];
  priority: 'low' | 'normal' | 'high';
  tags?: string[];
  metadata?: Record<string, string | number | boolean>;
}

export interface WebhookConfig {
  url: string;
  events: NotificationEvent[];
  headers?: Record<string, string>;
  secret?: string;
  retryAttempts?: number;
  timeout?: number;
}

export interface SlackConfig {
  enabled: boolean;
  webhookUrl?: string;
  token?: string;
  channel?: string;
  username?: string;
  iconEmoji?: string;
  
  // Event-specific channels
  criticalBugChannel?: string;
  feedbackChannel?: string;
  surveyChannel?: string;
}

export type NotificationEvent =
  | 'feedback.created'
  | 'feedback.updated'
  | 'feedback.resolved'
  | 'feedback.critical'
  | 'survey.completed'
  | 'survey.nps_detractor'
  | 'analytics.weekly_digest'
  | 'system.error'
  | 'user.status_update';

export interface NotificationPayload {
  event: NotificationEvent;
  timestamp: Date;
  data: FeedbackEntry | SatisfactionSurvey | FeedbackReport | { feedback: FeedbackEntry; previousStatus?: string } | { recipient: string; message: string };
  metadata?: Record<string, string | number | boolean>;
}

export interface EmailDeliveryStatus {
  id: string;
  recipient: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'bounced' | 'complained';
  timestamp: Date;
  errorMessage?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface NotificationQueue {
  id: string;
  type: 'email' | 'webhook' | 'slack';
  payload: NotificationPayload;
  priority: 'low' | 'normal' | 'high';
  scheduledAt: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastError?: string;
}

export interface NotificationMetrics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  deliveryRate: number;
  bounceRate: number;
  complaintRate: number;
  avgDeliveryTime: number;
  
  // By type
  byType: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
  }>;
  
  // By period
  byPeriod: Record<string, number>;
}

export interface EmailProvider {
  send(notification: EmailNotification): Promise<EmailDeliveryResult>;
  getDeliveryStatus?(messageId: string): Promise<EmailDeliveryStatus>;
  webhook?(payload: any): Promise<EmailDeliveryStatus[]>;
}

export interface EmailDeliveryResult {
  messageId: string;
  status: 'queued' | 'sent' | 'failed';
  message?: string;
}

// Template context types
export interface FeedbackEmailContext {
  feedback: FeedbackEntry;
  dashboardUrl: string;
  resolveUrl?: string;
  trackingUrl?: string;
}

export interface SurveyEmailContext {
  survey: SatisfactionSurvey;
  dashboardUrl: string;
}

export interface DigestEmailContext {
  report: FeedbackReport;
  weekStart: Date;
  weekEnd: Date;
  dashboardUrl: string;
}

export interface StatusUpdateEmailContext {
  feedback: any; // FeedbackEntry type
  previousStatus: string;
  statusEmoji: string;
  trackingUrl: string;
}
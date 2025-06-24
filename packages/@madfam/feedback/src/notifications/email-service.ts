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
 * Email Service for Feedback Notifications
 *
 * Handles email notifications for various feedback events
 */

import type {
  FeedbackEntry,
  SatisfactionSurvey,
  FeedbackReport,
  NotificationConfig,
  EmailProvider,
  EmailTemplate,
  EmailNotification,
} from './types';
import { Logger } from '../utils/logger';

export class EmailService {
  private config: NotificationConfig;
  private logger: Logger;
  private provider: EmailProvider;

  constructor(config: NotificationConfig) {
    this.config = config;
    this.logger = new Logger('EmailService');
    this.provider = this.initializeProvider();
  }

  /**
   * Send critical bug notification
   */
  async sendCriticalBugNotification(feedback: FeedbackEntry): Promise<void> {
    if (
      !this.config.email?.enabled ||
      !this.config.email.criticalBugRecipients?.length
    ) {
      return;
    }

    const emailData: EmailNotification = {
      to: this.config.email.criticalBugRecipients,
      subject: `🚨 Critical Bug Reported: ${feedback.title}`,
      templateId: 'critical-bug',
      templateData: {
        feedback,
        dashboardUrl: this.getDashboardUrl(feedback.id),
        resolveUrl: this.getResolveUrl(feedback.id),
      },
      priority: 'high',
      tags: ['critical', 'bug', 'feedback'],
    };

    await this.sendEmail(emailData);
    this.logger.info('Critical bug notification sent', {
      feedbackId: feedback.id,
    });
  }

  /**
   * Send new feedback notification
   */
  async sendNewFeedbackNotification(feedback: FeedbackEntry): Promise<void> {
    if (
      !this.config.email?.enabled ||
      !this.config.email.newFeedbackRecipients?.length
    ) {
      return;
    }

    // Only send for high priority or feature requests
    if (feedback.severity !== 'high' && feedback.type !== 'feature_request') {
      return;
    }

    const emailData: EmailNotification = {
      to: this.config.email.newFeedbackRecipients,
      subject: `New ${feedback.type.replace('_', ' ')} feedback: ${feedback.title}`,
      templateId: 'new-feedback',
      templateData: {
        feedback,
        dashboardUrl: this.getDashboardUrl(feedback.id),
      },
      priority: 'normal',
      tags: ['feedback', feedback.type, feedback.severity],
    };

    await this.sendEmail(emailData);
    this.logger.info('New feedback notification sent', {
      feedbackId: feedback.id,
    });
  }

  /**
   * Send NPS survey response notification
   */
  async sendNPSSurveyNotification(survey: SatisfactionSurvey): Promise<void> {
    if (
      !this.config.email?.enabled ||
      !this.config.email.surveyRecipients?.length
    ) {
      return;
    }

    // Only send for detractors or low satisfaction scores
    if (survey.npsCategory === 'detractor' || survey.overallSatisfaction <= 5) {
      const emailData: EmailNotification = {
        to: this.config.email.surveyRecipients,
        subject: `${survey.npsCategory === 'detractor' ? '😞' : '⚠️'} Low satisfaction survey response`,
        templateId: 'nps-survey',
        templateData: {
          survey,
          dashboardUrl: this.getDashboardUrl(),
        },
        priority: survey.npsCategory === 'detractor' ? 'high' : 'normal',
        tags: ['survey', 'nps', survey.npsCategory],
      };

      await this.sendEmail(emailData);
      this.logger.info('NPS survey notification sent', { surveyId: survey.id });
    }
  }

  /**
   * Send weekly feedback digest
   */
  async sendWeeklyDigest(
    report: FeedbackReport,
    recipients: string[]
  ): Promise<void> {
    if (!this.config.email?.enabled || !recipients.length) {
      return;
    }

    const emailData: EmailNotification = {
      to: recipients,
      subject: `📊 Weekly Feedback Digest - ${new Date().toLocaleDateString()}`,
      templateId: 'weekly-digest',
      templateData: {
        report,
        weekStart: this.getWeekStart(),
        weekEnd: new Date(),
        dashboardUrl: this.getDashboardUrl(),
      },
      priority: 'normal',
      tags: ['digest', 'weekly', 'report'],
    };

    await this.sendEmail(emailData);
    this.logger.info('Weekly digest sent', {
      recipientCount: recipients.length,
    });
  }

  /**
   * Send feedback status update to user
   */
  async sendStatusUpdateToUser(
    feedback: FeedbackEntry,
    userEmail: string,
    previousStatus: string
  ): Promise<void> {
    if (!this.config.email?.enabled || !this.config.email.userNotifications) {
      return;
    }

    const statusEmoji = this.getStatusEmoji(feedback.status);
    const emailData: EmailNotification = {
      to: [userEmail],
      subject: `${statusEmoji} Update on your feedback: ${feedback.title}`,
      templateId: 'status-update',
      templateData: {
        feedback,
        previousStatus,
        statusEmoji,
        trackingUrl: this.getTrackingUrl(feedback.id),
      },
      priority: 'normal',
      tags: ['status-update', 'user-notification'],
    };

    await this.sendEmail(emailData);
    this.logger.info('Status update sent to user', {
      feedbackId: feedback.id,
      userEmail,
      status: feedback.status,
    });
  }

  /**
   * Send bulk notification to team
   */
  async sendTeamNotification(
    subject: string,
    templateId: string,
    templateData: Record<string, unknown>,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<void> {
    if (
      !this.config.email?.enabled ||
      !this.config.email.teamRecipients?.length
    ) {
      return;
    }

    const emailData: EmailNotification = {
      to: this.config.email.teamRecipients,
      subject,
      templateId,
      templateData,
      priority,
      tags: ['team', 'notification'],
    };

    await this.sendEmail(emailData);
    this.logger.info('Team notification sent', { templateId, subject });
  }

  /**
   * Send test email
   */
  async sendTestEmail(recipient: string): Promise<void> {
    const emailData: EmailNotification = {
      to: [recipient],
      subject: '✅ MADFAM Feedback Email Service Test',
      templateId: 'test-email',
      templateData: {
        timestamp: new Date().toISOString(),
        recipient,
      },
      priority: 'normal',
      tags: ['test'],
    };

    await this.sendEmail(emailData);
    this.logger.info('Test email sent', { recipient });
  }

  /**
   * Send email using configured provider
   */
  private async sendEmail(notification: EmailNotification): Promise<void> {
    try {
      // Rate limiting
      if (this.config.email?.rateLimit) {
        this.checkRateLimit();
      }

      // Template processing
      const processedNotification = await this.processTemplate(notification);

      // Send via provider
      await this.provider.send(processedNotification);

      // Track sending
      if (this.config.email?.trackDelivery) {
        this.trackEmailSent(notification);
      }
    } catch (error) {
      this.logger.error('Failed to send email', error as Error, {
        subject: notification.subject,
        recipientCount: notification.to.length,
      });
      throw error;
    }
  }

  /**
   * Initialize email provider
   */
  private initializeProvider(): EmailProvider {
    const providerType = this.config.email?.provider || 'sendgrid';

    switch (providerType) {
      case 'sendgrid':
        return new SendGridProvider(this.config.email?.credentials);
      case 'ses':
        return new SESProvider(this.config.email?.credentials);
      case 'smtp':
        return new SMTPProvider(this.config.email?.credentials);
      case 'resend':
        return new ResendProvider(this.config.email?.credentials);
      default:
        throw new Error(`Unsupported email provider: ${providerType}`);
    }
  }

  /**
   * Process email template
   */
  private processTemplate(notification: EmailNotification): EmailNotification {
    const template = this.loadTemplate(notification.templateId);

    return {
      ...notification,
      html: this.renderTemplate(template.html, notification.templateData),
      text: this.renderTemplate(template.text, notification.templateData),
    };
  }

  /**
   * Load email template
   */
  private loadTemplate(templateId: string): EmailTemplate {
    // In a real implementation, this would load from a template store
    const templates: Record<string, EmailTemplate> = {
      'critical-bug': {
        html: this.getCriticalBugTemplate(),
        text: this.getCriticalBugTextTemplate(),
        subject: '🚨 Critical Bug Reported: {{feedback.title}}',
      },
      'new-feedback': {
        html: this.getNewFeedbackTemplate(),
        text: this.getNewFeedbackTextTemplate(),
        subject: 'New {{feedback.type}} feedback: {{feedback.title}}',
      },
      'nps-survey': {
        html: this.getNPSSurveyTemplate(),
        text: this.getNPSSurveyTextTemplate(),
        subject:
          'Survey response received (NPS: {{survey.likelihoodToRecommend}})',
      },
      'weekly-digest': {
        html: this.getWeeklyDigestTemplate(),
        text: this.getWeeklyDigestTextTemplate(),
        subject: '📊 Weekly Feedback Digest - {{weekEnd}}',
      },
      'status-update': {
        html: this.getStatusUpdateTemplate(),
        text: this.getStatusUpdateTextTemplate(),
        subject: '{{statusEmoji}} Update on your feedback: {{feedback.title}}',
      },
      'test-email': {
        html: this.getTestEmailTemplate(),
        text: this.getTestEmailTextTemplate(),
        subject: '✅ MADFAM Feedback Email Service Test',
      },
    };

    const template = templates[templateId];
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    return template;
  }

  /**
   * Render template with data
   */
  private renderTemplate(
    template: string,
    data: Record<string, unknown>
  ): string {
    let rendered = template;

    // Simple template rendering (in production, use a proper template engine)
    const replacePlaceholders = (
      str: string,
      obj: any,
      prefix = ''
    ): string => {
      for (const [key, value] of Object.entries(obj)) {
        const placeholder = prefix ? `${prefix}.${key}` : key;
        const regex = new RegExp(`{{${placeholder}}}`, 'g');

        if (typeof value === 'object' && value !== null) {
          str = replacePlaceholders(str, value, placeholder);
        } else {
          str = str.replace(regex, String(value || ''));
        }
      }
      return str;
    };

    return replacePlaceholders(rendered, data);
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(): void {
    // Simple in-memory rate limiting
    // In production, use Redis or a proper rate limiting service
    const _now = Date.now();
    const _windowMs = 60000; // 1 minute
    const _maxEmails = this.config.email?.rateLimit?.maxPerMinute || 10;

    // Implementation would track email sending rates
  }

  /**
   * Track email sent
   */
  private async trackEmailSent(
    _notification: EmailNotification
  ): Promise<void> {
    // Track email delivery for analytics
    // Implementation would store delivery metrics
  }

  /**
   * Helper methods for URLs
   */
  private getDashboardUrl(feedbackId?: string): string {
    const baseUrl = this.config.email?.dashboardUrl || 'https://app.madfam.io';
    return feedbackId
      ? `${baseUrl}/feedback/${feedbackId}`
      : `${baseUrl}/feedback`;
  }

  private getResolveUrl(feedbackId: string): string {
    const baseUrl = this.config.email?.dashboardUrl || 'https://app.madfam.io';
    return `${baseUrl}/feedback/${feedbackId}/resolve`;
  }

  private getTrackingUrl(feedbackId: string): string {
    const baseUrl = this.config.email?.dashboardUrl || 'https://app.madfam.io';
    return `${baseUrl}/track/${feedbackId}`;
  }

  private getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek;
    return new Date(now.setDate(diff));
  }

  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      open: '🔔',
      in_progress: '🔄',
      resolved: '✅',
      closed: '📋',
    };
    return emojis[status] || '📝';
  }

  /**
   * Template content methods
   */
  private getCriticalBugTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Critical Bug Report</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="background-color: #dc3545; color: white; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">🚨 Critical Bug Reported</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 10px;">{{feedback.title}}</h2>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <p><strong>Severity:</strong> <span style="color: #dc3545; font-weight: bold;">{{feedback.severity}}</span></p>
              <p><strong>Category:</strong> {{feedback.category}}</p>
              <p><strong>User:</strong> {{feedback.userId}}</p>
              <p><strong>URL:</strong> {{feedback.url}}</p>
              <p><strong>Reported:</strong> {{feedback.timestamp}}</p>
            </div>
            
            <h3 style="color: #333;">Description</h3>
            <p style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">{{feedback.description}}</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="{{dashboardUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-right: 10px;">View in Dashboard</a>
              <a href="{{resolveUrl}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Mark as Resolved</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getCriticalBugTextTemplate(): string {
    return `
      🚨 CRITICAL BUG REPORTED
      
      Title: {{feedback.title}}
      Severity: {{feedback.severity}}
      Category: {{feedback.category}}
      User: {{feedback.userId}}
      URL: {{feedback.url}}
      Reported: {{feedback.timestamp}}
      
      Description:
      {{feedback.description}}
      
      View in dashboard: {{dashboardUrl}}
      Mark as resolved: {{resolveUrl}}
    `;
  }

  private getNewFeedbackTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>New Feedback</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px;">📝 New Feedback Received</h1>
            
            <h2 style="color: #333; margin-bottom: 10px;">{{feedback.title}}</h2>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <p><strong>Type:</strong> {{feedback.type}}</p>
              <p><strong>Severity:</strong> {{feedback.severity}}</p>
              <p><strong>Category:</strong> {{feedback.category}}</p>
              <p><strong>User:</strong> {{feedback.userId}}</p>
            </div>
            
            <p style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">{{feedback.description}}</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="{{dashboardUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View in Dashboard</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getNewFeedbackTextTemplate(): string {
    return `
      📝 NEW FEEDBACK RECEIVED
      
      Title: {{feedback.title}}
      Type: {{feedback.type}}
      Severity: {{feedback.severity}}
      Category: {{feedback.category}}
      User: {{feedback.userId}}
      
      Description:
      {{feedback.description}}
      
      View in dashboard: {{dashboardUrl}}
    `;
  }

  private getNPSSurveyTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Survey Response</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px;">📊 Survey Response Received</h1>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <p><strong>Overall Satisfaction:</strong> {{survey.overallSatisfaction}}/10</p>
              <p><strong>NPS Score:</strong> {{survey.likelihoodToRecommend}}/10 ({{survey.npsCategory}})</p>
              <p><strong>User:</strong> {{survey.userId}}</p>
              <p><strong>Completed:</strong> {{survey.timestamp}}</p>
            </div>
            
            <h3 style="color: #333;">Comments</h3>
            <p style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">{{survey.additionalComments}}</p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="{{dashboardUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Full Response</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getNPSSurveyTextTemplate(): string {
    return `
      📊 SURVEY RESPONSE RECEIVED
      
      Overall Satisfaction: {{survey.overallSatisfaction}}/10
      NPS Score: {{survey.likelihoodToRecommend}}/10 ({{survey.npsCategory}})
      User: {{survey.userId}}
      Completed: {{survey.timestamp}}
      
      Comments:
      {{survey.additionalComments}}
      
      View full response: {{dashboardUrl}}
    `;
  }

  private getWeeklyDigestTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Weekly Feedback Digest</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px;">📊 Weekly Feedback Digest</h1>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <h3 style="margin: 0 0 10px 0;">Summary</h3>
              <p><strong>Total Feedback:</strong> {{report.summary.totalFeedback}}</p>
              <p><strong>Critical Issues:</strong> {{report.summary.criticalIssues}}</p>
              <p><strong>Average Rating:</strong> {{report.summary.averageRating}}/5</p>
              <p><strong>NPS Score:</strong> {{report.summary.npsScore}}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="{{dashboardUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">View Full Report</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getWeeklyDigestTextTemplate(): string {
    return `
      📊 WEEKLY FEEDBACK DIGEST
      
      Summary:
      - Total Feedback: {{report.summary.totalFeedback}}
      - Critical Issues: {{report.summary.criticalIssues}}
      - Average Rating: {{report.summary.averageRating}}/5
      - NPS Score: {{report.summary.npsScore}}
      
      View full report: {{dashboardUrl}}
    `;
  }

  private getStatusUpdateTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Feedback Status Update</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px;">{{statusEmoji}} Feedback Status Update</h1>
            
            <h2 style="color: #333; margin-bottom: 10px;">{{feedback.title}}</h2>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <p><strong>Status changed from:</strong> {{previousStatus}} → {{feedback.status}}</p>
              <p><strong>Feedback ID:</strong> {{feedback.id}}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="{{trackingUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Track Progress</a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getStatusUpdateTextTemplate(): string {
    return `
      {{statusEmoji}} FEEDBACK STATUS UPDATE
      
      {{feedback.title}}
      
      Status changed from: {{previousStatus}} → {{feedback.status}}
      Feedback ID: {{feedback.id}}
      
      Track progress: {{trackingUrl}}
    `;
  }

  private getTestEmailTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #28a745; margin-bottom: 20px;">✅ Email Service Test</h1>
            
            <p>This is a test email from the MADFAM Feedback email service.</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p><strong>Timestamp:</strong> {{timestamp}}</p>
              <p><strong>Recipient:</strong> {{recipient}}</p>
            </div>
            
            <p>If you received this email, the service is working correctly! 🎉</p>
          </div>
        </body>
      </html>
    `;
  }

  private getTestEmailTextTemplate(): string {
    return `
      ✅ EMAIL SERVICE TEST
      
      This is a test email from the MADFAM Feedback email service.
      
      Timestamp: {{timestamp}}
      Recipient: {{recipient}}
      
      If you received this email, the service is working correctly! 🎉
    `;
  }
}

// Email provider interfaces and implementations would be in separate files
interface EmailProvider {
  send(notification: EmailNotification): Promise<void>;
}

class SendGridProvider implements EmailProvider {
  constructor(private credentials: any) {}

  async send(_notification: EmailNotification): Promise<void> {
    // SendGrid implementation
  }
}

class SESProvider implements EmailProvider {
  constructor(private credentials: any) {}

  async send(_notification: EmailNotification): Promise<void> {
    // AWS SES implementation
  }
}

class SMTPProvider implements EmailProvider {
  constructor(private credentials: any) {}

  async send(_notification: EmailNotification): Promise<void> {
    // SMTP implementation
  }
}

class ResendProvider implements EmailProvider {
  constructor(private credentials: any) {}

  async send(_notification: EmailNotification): Promise<void> {
    // Resend implementation
  }
}

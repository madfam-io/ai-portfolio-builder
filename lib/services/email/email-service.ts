/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * Email Service for User Engagement and Retention
 * Handles transactional emails, marketing campaigns, and retention flows
 */

import { logger } from '@/lib/utils/logger';
import { gdprService } from '@/lib/services/gdpr/gdpr-service';
import { auditLogger } from '@/lib/services/audit/audit-logger';
import { redis, isRedisAvailable } from '@/lib/cache/redis-client';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: EmailCategory;
  tags: string[];
}

export type EmailCategory =
  | 'transactional'
  | 'onboarding'
  | 'retention'
  | 'marketing'
  | 'system'
  | 'support';

export interface EmailJob {
  id: string;
  to: string;
  template: string;
  variables: Record<string, any>;
  category: EmailCategory;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  scheduledAt?: Date;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';
  error?: string;
  sentAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
}

export interface RetentionCampaign {
  id: string;
  name: string;
  trigger: RetentionTrigger;
  delay: number; // hours
  template: string;
  enabled: boolean;
  targetSegment?: string;
  maxSends: number;
}

export type RetentionTrigger =
  | 'signup_incomplete'
  | 'portfolio_not_created'
  | 'portfolio_not_published'
  | 'ai_not_used'
  | 'inactive_7_days'
  | 'inactive_30_days'
  | 'subscription_expiring'
  | 'payment_failed'
  | 'feature_unused';

/**
 * Email Service Implementation
 */
class EmailService {
  private emailQueue: EmailJob[] = [];
  private isProcessing = false;
  private retentionCampaigns: Map<string, RetentionCampaign> = new Map();

  constructor() {
    this.initializeRetentionCampaigns();
    this.startQueueProcessor();
  }

  /**
   * Send transactional email
   */
  async sendTransactionalEmail(
    to: string,
    template: string,
    variables: Record<string, any> = {},
    options: {
      priority?: EmailJob['priority'];
      scheduledAt?: Date;
    } = {}
  ): Promise<string> {
    const emailJob: EmailJob = {
      id: this.generateJobId(),
      to,
      template,
      variables,
      category: 'transactional',
      priority: options.priority || 'normal',
      scheduledAt: options.scheduledAt,
      attempts: 0,
      maxAttempts: 3,
      status: 'pending',
    };

    // Check if user can receive emails
    const canEmail = await this.canSendEmail(to, 'transactional');
    if (!canEmail) {
      throw new Error('User has not consented to receive emails');
    }

    // Add to queue
    await this.enqueueEmail(emailJob);

    logger.info('Transactional email queued', {
      jobId: emailJob.id,
      to,
      template,
    });

    return emailJob.id;
  }

  /**
   * Send marketing email
   */
  async sendMarketingEmail(
    to: string,
    template: string,
    variables: Record<string, any> = {},
    options: {
      scheduledAt?: Date;
      segment?: string;
    } = {}
  ): Promise<string | null> {
    // Check marketing consent
    const canEmail = await this.canSendEmail(to, 'marketing');
    if (!canEmail) {
      logger.warn('Cannot send marketing email - no consent', { to });
      return null;
    }

    const emailJob: EmailJob = {
      id: this.generateJobId(),
      to,
      template,
      variables,
      category: 'marketing',
      priority: 'low',
      scheduledAt: options.scheduledAt,
      attempts: 0,
      maxAttempts: 2,
      status: 'pending',
    };

    await this.enqueueEmail(emailJob);

    logger.info('Marketing email queued', {
      jobId: emailJob.id,
      to,
      template,
    });

    return emailJob.id;
  }

  /**
   * Trigger retention campaign
   */
  async triggerRetentionCampaign(
    userId: string,
    userEmail: string,
    trigger: RetentionTrigger,
    userProperties: Record<string, any> = {}
  ): Promise<void> {
    try {
      // Find matching campaigns
      const campaigns = Array.from(this.retentionCampaigns.values()).filter(
        campaign => campaign.trigger === trigger && campaign.enabled
      );

      if (campaigns.length === 0) {
        logger.debug('No active campaigns for trigger', { trigger });
        return;
      }

      for (const campaign of campaigns) {
        // Check if user has already received this campaign recently
        const shouldSkip = await this.shouldSkipCampaign(userId, campaign);
        if (shouldSkip) {
          continue;
        }

        // Check send count limit
        const sendCount = await this.getCampaignSendCount(userId, campaign.id);
        if (sendCount >= campaign.maxSends) {
          logger.debug('User reached max sends for campaign', {
            userId,
            campaignId: campaign.id,
            sendCount,
          });
          continue;
        }

        // Schedule email
        const scheduledAt = new Date(
          Date.now() + campaign.delay * 60 * 60 * 1000
        );

        await this.sendTransactionalEmail(
          userEmail,
          campaign.template,
          {
            ...userProperties,
            userId,
            campaignId: campaign.id,
            trigger,
          },
          {
            priority: 'normal',
            scheduledAt,
          }
        );

        // Mark as sent
        if (isRedisAvailable()) {
          const cacheKey = `retention:${userId}:${campaign.id}`;
          await redis.setex(cacheKey, 30 * 24 * 60 * 60, Date.now().toString()); // 30 days
        }

        await this.incrementCampaignSendCount(userId, campaign.id);

        logger.info('Retention campaign triggered', {
          userId,
          campaignId: campaign.id,
          trigger,
          scheduledAt,
        });
      }
    } catch (error) {
      logger.error('Failed to trigger retention campaign', {
        error,
        userId,
        trigger,
      });
    }
  }

  /**
   * Check if user can receive specific email type
   */
  async canSendEmail(email: string, category: EmailCategory): Promise<boolean> {
    try {
      // For transactional emails, check if user opted out completely
      if (category === 'transactional') {
        // Check unsubscribe list
        if (isRedisAvailable()) {
          const unsubscribed = await redis.sismember(
            'email:unsubscribed',
            email
          );
          return !unsubscribed;
        }
        return true; // Allow transactional by default
      }

      // For marketing emails, check GDPR consent
      if (category === 'marketing') {
        // Get user ID from email (you'd implement this lookup)
        const userId = this.getUserIdFromEmail(email);
        if (!userId) return false;

        return await gdprService.canContactForMarketing(userId);
      }

      return true;
    } catch (error) {
      logger.error('Failed to check email permission', {
        error,
        email,
        category,
      });
      return false;
    }
  }

  /**
   * Unsubscribe user from emails
   */
  async unsubscribeUser(
    email: string,
    type: 'all' | 'marketing' = 'all'
  ): Promise<void> {
    try {
      if (type === 'all') {
        // Add to global unsubscribe list
        if (isRedisAvailable()) {
          await redis.sadd('email:unsubscribed', email);
        }
      } else if (type === 'marketing') {
        // Update marketing consent
        const userId = this.getUserIdFromEmail(email);
        if (userId) {
          await gdprService.recordConsent({
            userId,
            consentType: 'marketing',
            granted: false,
            ipAddress: 'system',
            purpose: 'Marketing email unsubscribe',
            legalBasis: 'consent',
          });
        }
      }

      await auditLogger.logDataAccess('data.update', {
        userId: this.getUserIdFromEmail(email) || 'unknown',
        userIp: 'system',
        resource: 'user',
        outcome: 'success',
        details: {
          action: 'email_unsubscribe',
          email,
          type,
        },
      });

      logger.info('User unsubscribed from emails', { email, type });
    } catch (error) {
      logger.error('Failed to unsubscribe user', { error, email, type });
      throw error;
    }
  }

  /**
   * Track email engagement
   */
  trackEmailEngagement(
    jobId: string,
    event: 'opened' | 'clicked' | 'bounced' | 'complained',
    metadata: Record<string, any> = {}
  ): void {
    try {
      // Update job status
      const job = this.getEmailJob(jobId);
      if (!job) {
        logger.warn('Email job not found for tracking', { jobId, event });
        return;
      }

      const now = new Date();
      if (event === 'opened' && !job.openedAt) {
        job.openedAt = now;
      } else if (event === 'clicked' && !job.clickedAt) {
        job.clickedAt = now;
      }

      this.updateEmailJob(job);

      // Log engagement analytics
      logger.info('Email engagement tracked', {
        jobId,
        event,
        to: job.to,
        template: job.template,
        metadata,
      });
    } catch (error) {
      logger.error('Failed to track email engagement', { error, jobId, event });
    }
  }

  /**
   * Get email performance metrics
   */
  getEmailMetrics(
    _startDate: Date,
    _endDate: Date,
    _template?: string
  ): {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    openRate: number;
    clickRate: number;
  } {
    try {
      // In a real implementation, this would query your email database
      // For now, return mock data
      return {
        sent: 1000,
        delivered: 980,
        opened: 245,
        clicked: 49,
        unsubscribed: 5,
        openRate: 0.25,
        clickRate: 0.05,
      };
    } catch (error) {
      logger.error('Failed to get email metrics', { error });
      return {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        unsubscribed: 0,
        openRate: 0,
        clickRate: 0,
      };
    }
  }

  /**
   * Initialize retention campaigns
   */
  private initializeRetentionCampaigns(): void {
    const campaigns: RetentionCampaign[] = [
      {
        id: 'welcome_series_1',
        name: 'Welcome - Complete Profile',
        trigger: 'signup_incomplete',
        delay: 2, // 2 hours
        template: 'welcome_complete_profile',
        enabled: true,
        maxSends: 1,
      },
      {
        id: 'portfolio_creation_reminder',
        name: 'Create Your First Portfolio',
        trigger: 'portfolio_not_created',
        delay: 24, // 24 hours
        template: 'create_portfolio_reminder',
        enabled: true,
        maxSends: 2,
      },
      {
        id: 'publish_portfolio_reminder',
        name: 'Publish Your Portfolio',
        trigger: 'portfolio_not_published',
        delay: 48, // 48 hours
        template: 'publish_portfolio_reminder',
        enabled: true,
        maxSends: 1,
      },
      {
        id: 'ai_enhancement_intro',
        name: 'Try AI Enhancement',
        trigger: 'ai_not_used',
        delay: 72, // 3 days
        template: 'ai_enhancement_intro',
        enabled: true,
        maxSends: 1,
      },
      {
        id: 'weekly_engagement',
        name: 'Weekly Check-in',
        trigger: 'inactive_7_days',
        delay: 168, // 7 days
        template: 'weekly_engagement',
        enabled: true,
        maxSends: 4,
      },
      {
        id: 'win_back_campaign',
        name: 'We Miss You!',
        trigger: 'inactive_30_days',
        delay: 720, // 30 days
        template: 'win_back_campaign',
        enabled: true,
        maxSends: 2,
      },
      {
        id: 'subscription_expiring',
        name: 'Subscription Expiring Soon',
        trigger: 'subscription_expiring',
        delay: 72, // 3 days before expiry
        template: 'subscription_expiring',
        enabled: true,
        maxSends: 2,
      },
      {
        id: 'payment_failed_retry',
        name: 'Payment Failed - Please Update',
        trigger: 'payment_failed',
        delay: 1, // 1 hour
        template: 'payment_failed_retry',
        enabled: true,
        maxSends: 3,
      },
    ];

    campaigns.forEach(campaign => {
      this.retentionCampaigns.set(campaign.id, campaign);
    });

    logger.info('Retention campaigns initialized', {
      count: campaigns.length,
    });
  }

  /**
   * Start email queue processor
   */
  private startQueueProcessor(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.emailQueue.length > 0) {
        await this.processEmailQueue();
      }
    }, 10000); // Process every 10 seconds
  }

  /**
   * Process email queue
   */
  private async processEmailQueue(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      const now = new Date();
      const jobsToProcess = this.emailQueue.filter(
        job =>
          job.status === 'pending' &&
          (!job.scheduledAt || job.scheduledAt <= now)
      );

      if (jobsToProcess.length === 0) {
        return;
      }

      logger.info('Processing email queue', { count: jobsToProcess.length });

      for (const job of jobsToProcess) {
        await this.processEmailJob(job);
      }

      // Remove completed jobs from queue
      this.emailQueue = this.emailQueue.filter(
        job => job.status === 'pending' || job.status === 'processing'
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Send individual email
   */
  private async sendEmail(job: EmailJob): Promise<void> {
    // In production, integrate with email service provider (SendGrid, AWS SES, etc.)
    // For now, just log the email
    logger.info('Email would be sent', {
      to: job.to,
      template: job.template,
      variables: job.variables,
      category: job.category,
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Helper methods
  private generateJobId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  private async enqueueEmail(job: EmailJob): Promise<void> {
    this.emailQueue.push(job);

    // Also store in Redis for persistence (in production)
    if (isRedisAvailable()) {
      await redis.lpush('email:queue', JSON.stringify(job));
    }
  }

  private getEmailJob(jobId: string): EmailJob | null {
    return this.emailQueue.find(job => job.id === jobId) || null;
  }

  private updateEmailJob(job: EmailJob): void {
    const index = this.emailQueue.findIndex(j => j.id === job.id);
    if (index !== -1) {
      this.emailQueue[index] = job;
    }
  }

  private getUserIdFromEmail(_email: string): string | null {
    // In production, implement email -> userId lookup
    return null;
  }

  private async getCampaignSendCount(
    userId: string,
    campaignId: string
  ): Promise<number> {
    if (!isRedisAvailable()) return 0;

    const count = await redis.get(`retention:count:${userId}:${campaignId}`);
    return count ? parseInt(count, 10) : 0;
  }

  private async shouldSkipCampaign(
    userId: string,
    campaign: RetentionCampaign
  ): Promise<boolean> {
    const cacheKey = `retention:${userId}:${campaign.id}`;

    if (!isRedisAvailable()) {
      return false;
    }

    const lastSent = await redis.get(cacheKey);
    if (lastSent) {
      logger.debug('User already received this campaign', {
        userId,
        campaignId: campaign.id,
      });
      return true;
    }

    return false;
  }

  private async processEmailJob(job: EmailJob): Promise<void> {
    try {
      job.status = 'processing';
      job.attempts++;

      await this.sendEmail(job);

      job.status = 'sent';
      job.sentAt = new Date();

      logger.info('Email sent successfully', {
        jobId: job.id,
        to: job.to,
        template: job.template,
      });
    } catch (error) {
      logger.error('Failed to send email', {
        error,
        jobId: job.id,
        to: job.to,
        template: job.template,
      });

      job.error = error instanceof Error ? error.message : 'Unknown error';

      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed';
      } else {
        job.status = 'pending';
        // Exponential backoff
        job.scheduledAt = new Date(
          Date.now() + Math.pow(2, job.attempts) * 60000
        );
      }
    }
  }

  private async incrementCampaignSendCount(
    userId: string,
    campaignId: string
  ): Promise<void> {
    if (!isRedisAvailable()) return;

    await redis.incr(`retention:count:${userId}:${campaignId}`);
    await redis.expire(
      `retention:count:${userId}:${campaignId}`,
      90 * 24 * 60 * 60
    ); // 90 days
  }
}

/**
 * Singleton instance
 */
export const emailService = new EmailService();

/**
 * Email template definitions
 */
export const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  welcome_complete_profile: {
    id: 'welcome_complete_profile',
    name: 'Welcome - Complete Your Profile',
    subject: 'Complete your AI Portfolio Builder profile',
    htmlContent: `
      <h1>Welcome to AI Portfolio Builder!</h1>
      <p>Hi {{name}},</p>
      <p>Thanks for signing up! Let's complete your profile to get the most out of our AI-powered portfolio creation.</p>
      <a href="{{profile_url}}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Complete Profile</a>
    `,
    textContent:
      'Welcome to AI Portfolio Builder! Complete your profile at {{profile_url}}',
    variables: ['name', 'profile_url'],
    category: 'onboarding',
    tags: ['welcome', 'onboarding'],
  },

  create_portfolio_reminder: {
    id: 'create_portfolio_reminder',
    name: 'Create Your First Portfolio',
    subject: 'Ready to create your stunning portfolio?',
    htmlContent: `
      <h1>Your portfolio awaits!</h1>
      <p>Hi {{name}},</p>
      <p>You're just one click away from creating a professional portfolio that stands out. Our AI will help you craft compelling content in under 30 minutes.</p>
      <a href="{{create_url}}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Create Portfolio Now</a>
    `,
    textContent: 'Create your portfolio now at {{create_url}}',
    variables: ['name', 'create_url'],
    category: 'retention',
    tags: ['reminder', 'portfolio'],
  },

  // Add more templates as needed...
};

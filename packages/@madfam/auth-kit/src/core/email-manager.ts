/**
 * @madfam/auth-kit
 *
 * Email management module
 */

import type { EmailConfig } from './types';
import { Logger } from '../utils/logger';

export class EmailManager {
  private config: EmailConfig;
  private logger: Logger;

  constructor(config: EmailConfig) {
    this.config = config;
    this.logger = new Logger('EmailManager');
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = this.buildVerificationUrl(token);

    await this.sendEmail({
      to: email,
      subject: 'Verify your email address',
      template: this.config.templates?.verification,
      data: {
        verificationUrl,
        email,
      },
    });

    this.logger.info('Verification email sent', { email });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = this.buildPasswordResetUrl(token);

    await this.sendEmail({
      to: email,
      subject: 'Reset your password',
      template: this.config.templates?.passwordReset,
      data: {
        resetUrl,
        email,
      },
    });

    this.logger.info('Password reset email sent', { email });
  }

  /**
   * Send MFA challenge email
   */
  async sendMFAChallengeEmail(email: string, code: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Your authentication code',
      template: this.config.templates?.mfaChallenge,
      data: {
        code,
        email,
      },
    });

    this.logger.info('MFA challenge email sent', { email });
  }

  /**
   * Send account locked email
   */
  async sendAccountLockedEmail(email: string, reason: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Your account has been locked',
      template: this.config.templates?.accountLocked,
      data: {
        reason,
        email,
        supportUrl: this.getSupportUrl(),
      },
    });

    this.logger.info('Account locked email sent', { email });
  }

  /**
   * Send security alert email
   */
  async sendSecurityAlertEmail(
    email: string,
    alert: { type: string; description: string; ipAddress?: string }
  ): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Security alert for your account',
      template: this.config.templates?.securityAlert,
      data: {
        alert,
        email,
        timestamp: new Date().toISOString(),
      },
    });

    this.logger.info('Security alert email sent', {
      email,
      alertType: alert.type,
    });
  }

  /**
   * Send email using configured provider
   */
  private async sendEmail(params: {
    to: string;
    subject: string;
    template?: string;
    data?: Record<string, any>;
  }): Promise<void> {
    const { to, subject, template, data } = params;

    switch (this.config.provider) {
      case 'sendgrid':
        await this.sendWithSendGrid(to, subject, template, data);
        break;
      case 'ses':
        await this.sendWithSES(to, subject, template, data);
        break;
      case 'smtp':
        await this.sendWithSMTP(to, subject, template, data);
        break;
      case 'resend':
        await this.sendWithResend(to, subject, template, data);
        break;
      default:
        this.logger.warn('No email provider configured, email not sent', {
          to,
          subject,
        });
    }
  }

  /**
   * Send email with SendGrid
   */
  private sendWithSendGrid(
    _to: string,
    _subject: string,
    _templateId?: string,
    _data?: Record<string, any>
  ): Promise<void> {
    // In a real implementation, this would use the SendGrid API
    this.logger.debug('SendGrid email would be sent', {
      to,
      subject,
      templateId,
    });
  }

  /**
   * Send email with AWS SES
   */
  private sendWithSES(
    _to: string,
    _subject: string,
    _templateId?: string,
    _data?: Record<string, any>
  ): Promise<void> {
    // In a real implementation, this would use the AWS SES API
    this.logger.debug('SES email would be sent', { to, subject, templateId });
  }

  /**
   * Send email with SMTP
   */
  private sendWithSMTP(
    _to: string,
    _subject: string,
    _templateId?: string,
    _data?: Record<string, any>
  ): Promise<void> {
    // In a real implementation, this would use nodemailer with SMTP
    this.logger.debug('SMTP email would be sent', { to, subject });
  }

  /**
   * Send email with Resend
   */
  private sendWithResend(
    _to: string,
    _subject: string,
    _templateId?: string,
    _data?: Record<string, any>
  ): Promise<void> {
    // In a real implementation, this would use the Resend API
    this.logger.debug('Resend email would be sent', {
      to,
      subject,
      templateId,
    });
  }

  /**
   * Build verification URL
   */
  private buildVerificationUrl(token: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/auth/verify?token=${token}`;
  }

  /**
   * Build password reset URL
   */
  private buildPasswordResetUrl(token: string): string {
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/auth/reset-password?token=${token}`;
  }

  /**
   * Get base URL
   */
  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  /**
   * Get support URL
   */
  private getSupportUrl(): string {
    return `${this.getBaseUrl()}/support`;
  }
}

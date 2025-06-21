/**
 * Multi-Factor Authentication Service
 * Provides TOTP-based MFA functionality with QR code generation
 */

import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';
import { AppError } from '@/types/errors';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

export interface MFASetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAStatus {
  enabled: boolean;
  factorId?: string;
  backupCodesGenerated: boolean;
  lastUsed?: Date;
}

/**
 * MFA Service for TOTP authentication
 */
export class MFAService {
  private supabase = createClient();

  /**
   * Check if MFA is enabled for the current user
   */
  async getMFAStatus(): Promise<MFAStatus> {
    try {
      if (!this.supabase) {
        throw new AppError(
          'MFA_NOT_AVAILABLE',
          'MFA service not available',
          503
        );
      }

      const { data: factors, error } =
        await this.supabase.auth.mfa.listFactors();

      if (error) {
        logger.error('Failed to get MFA factors', { error });
        throw new AppError(
          'MFA_CHECK_FAILED',
          'Failed to check MFA status',
          500
        );
      }

      const totpFactor = factors.totp.find(
        factor => factor.status === 'verified'
      );

      return {
        enabled: !!totpFactor,
        factorId: totpFactor?.id,
        backupCodesGenerated: factors.totp.length > 0,
        lastUsed: totpFactor ? new Date(totpFactor.updated_at) : undefined,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('MFA status check failed', { error });
      throw new AppError('MFA_STATUS_FAILED', 'Failed to get MFA status', 500);
    }
  }

  /**
   * Set up MFA for the current user
   */
  async setupMFA(): Promise<MFASetupResponse> {
    try {
      if (!this.supabase) {
        throw new AppError(
          'MFA_NOT_AVAILABLE',
          'MFA service not available',
          503
        );
      }

      // Get current user
      const { data: userData, error: userError } =
        await this.supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new AppError('USER_NOT_FOUND', 'User not authenticated', 401);
      }

      // Enroll TOTP factor
      const { data: enrollData, error: enrollError } =
        await this.supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: 'AI Portfolio Builder',
        });

      if (enrollError || !enrollData) {
        logger.error('Failed to enroll MFA factor', { error: enrollError });
        throw new AppError('MFA_ENROLL_FAILED', 'Failed to set up MFA', 500);
      }

      // Generate QR code
      const totp = new OTPAuth.TOTP({
        issuer: 'AI Portfolio Builder',
        label: userData.user.email || 'user',
        secret: enrollData.totp.secret,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
      });

      const qrCodeUrl = await QRCode.toDataURL(totp.toString());

      // Generate backup codes (simulated - in production, generate securely)
      const backupCodes = this.generateBackupCodes();

      logger.info('MFA setup initiated', {
        userId: userData.user.id,
        factorId: enrollData.id,
      });

      return {
        secret: enrollData.totp.secret,
        qrCodeUrl,
        backupCodes,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('MFA setup failed', { error });
      throw new AppError('MFA_SETUP_FAILED', 'Failed to set up MFA', 500);
    }
  }

  /**
   * Verify MFA setup with TOTP code
   */
  async verifyMFASetup(code: string, factorId: string): Promise<boolean> {
    try {
      if (!this.supabase) {
        throw new AppError(
          'MFA_NOT_AVAILABLE',
          'MFA service not available',
          503
        );
      }

      const { error } = await this.supabase.auth.mfa.verify({
        factorId,
        challengeId: '', // Will be provided by the challenge
        code,
      });

      if (error) {
        logger.error('MFA verification failed', { error, factorId });
        return false;
      }

      logger.info('MFA setup verified successfully', { factorId });
      return true;
    } catch (error) {
      logger.error('MFA verification error', { error });
      return false;
    }
  }

  /**
   * Challenge MFA (request verification)
   */
  async challengeMFA(factorId: string): Promise<string> {
    try {
      if (!this.supabase) {
        throw new AppError(
          'MFA_NOT_AVAILABLE',
          'MFA service not available',
          503
        );
      }

      const { data, error } = await this.supabase.auth.mfa.challenge({
        factorId,
      });

      if (error || !data) {
        logger.error('MFA challenge failed', { error, factorId });
        throw new AppError(
          'MFA_CHALLENGE_FAILED',
          'Failed to challenge MFA',
          500
        );
      }

      return data.id;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('MFA challenge error', { error });
      throw new AppError(
        'MFA_CHALLENGE_FAILED',
        'Failed to challenge MFA',
        500
      );
    }
  }

  /**
   * Verify MFA code during login
   */
  async verifyMFA(challengeId: string, code: string): Promise<boolean> {
    try {
      if (!this.supabase) {
        throw new AppError(
          'MFA_NOT_AVAILABLE',
          'MFA service not available',
          503
        );
      }

      const { error } = await this.supabase.auth.mfa.verify({
        factorId: '', // Will be determined by challenge
        challengeId,
        code,
      });

      if (error) {
        logger.error('MFA verification failed', { error, challengeId });
        return false;
      }

      logger.info('MFA verified successfully', { challengeId });
      return true;
    } catch (error) {
      logger.error('MFA verification error', { error });
      return false;
    }
  }

  /**
   * Disable MFA for the current user
   */
  async disableMFA(factorId: string): Promise<void> {
    try {
      if (!this.supabase) {
        throw new AppError(
          'MFA_NOT_AVAILABLE',
          'MFA service not available',
          503
        );
      }

      const { error } = await this.supabase.auth.mfa.unenroll({
        factorId,
      });

      if (error) {
        logger.error('Failed to disable MFA', { error, factorId });
        throw new AppError('MFA_DISABLE_FAILED', 'Failed to disable MFA', 500);
      }

      logger.info('MFA disabled successfully', { factorId });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('MFA disable error', { error });
      throw new AppError('MFA_DISABLE_FAILED', 'Failed to disable MFA', 500);
    }
  }

  /**
   * Generate backup codes (in production, use cryptographically secure generation)
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Validate TOTP code format
   */
  isValidTOTPCode(code: string): boolean {
    return /^\d{6}$/.test(code);
  }

  /**
   * Validate backup code format
   */
  isValidBackupCode(code: string): boolean {
    return /^[A-Z0-9]{8}$/.test(code);
  }
}

/**
 * Singleton instance
 */
export const mfaService = new MFAService();

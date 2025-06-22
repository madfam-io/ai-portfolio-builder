/**
 * @madfam/auth-kit
 *
 * Multi-Factor Authentication management module
 */

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import type {
  MFAConfig,
  MFAMethod,
  MFASetupResult,
  MFAChallenge,
  AuthAdapter,
  TOTPConfig,
} from './types';
import { generateId } from '../utils/id-generator';
import { generateBackupCodes } from '../utils/backup-codes';
import { Logger } from '../utils/logger';

export class MFAManager {
  private config?: MFAConfig;
  private adapter?: AuthAdapter;
  private logger: Logger;
  private challenges: Map<string, MFAChallenge> = new Map();

  constructor(config?: MFAConfig, adapter?: AuthAdapter) {
    this.config = config;
    this.adapter = adapter;
    this.logger = new Logger('MFAManager');
  }

  /**
   * Setup MFA for a user
   */
  async setupMFA(userId: string, method: MFAMethod): Promise<MFASetupResult> {
    if (!this.config?.enabled) {
      throw new Error('MFA is not enabled');
    }

    const methodConfig = this.config.methods[method];
    if (!methodConfig?.enabled) {
      throw new Error(`MFA method ${method} is not enabled`);
    }

    switch (method) {
      case 'totp':
        return this.setupTOTP(userId);
      case 'sms':
        return this.setupSMS(userId);
      case 'backup':
        return this.setupBackupCodes(userId);
      default:
        throw new Error(`Unsupported MFA method: ${method}`);
    }
  }

  /**
   * Setup TOTP authentication
   */
  private async setupTOTP(userId: string): Promise<MFASetupResult> {
    const totpConfig = this.config?.methods.totp as TOTPConfig;

    // Generate secret
    const secret = new OTPAuth.Secret({ size: 32 });

    // Create TOTP instance
    const totp = new OTPAuth.TOTP({
      issuer: totpConfig.issuer || 'AuthKit',
      label: userId,
      algorithm: totpConfig.algorithm || 'SHA256',
      digits: totpConfig.digits || 6,
      period: totpConfig.period || 30,
      secret,
    });

    // Generate QR code
    const uri = totp.toString();
    const qrCode = await QRCode.toDataURL(uri);

    // Save secret
    if (this.adapter) {
      await this.adapter.saveMFASecret(userId, 'totp', secret.base32);
    }

    this.logger.info('TOTP setup completed', { userId });

    return {
      method: 'totp',
      secret: secret.base32,
      qrCode,
    };
  }

  /**
   * Setup SMS authentication
   */
  private async setupSMS(userId: string): Promise<MFASetupResult> {
    // SMS setup would involve verifying phone number
    // For now, this is a placeholder
    this.logger.info('SMS setup completed', { userId });

    return {
      method: 'sms',
    };
  }

  /**
   * Setup backup codes
   */
  private async setupBackupCodes(userId: string): Promise<MFASetupResult> {
    const codes = generateBackupCodes(10, 8);

    if (this.adapter) {
      await this.adapter.saveBackupCodes(userId, codes);
    }

    this.logger.info('Backup codes generated', { userId });

    return {
      method: 'backup',
      backupCodes: codes,
    };
  }

  /**
   * Create MFA challenge
   */
  async createChallenge(
    userId: string,
    method: MFAMethod
  ): Promise<MFAChallenge> {
    const challengeId = generateId();

    const challenge: MFAChallenge = {
      id: challengeId,
      userId,
      method,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      attempts: 0,
      maxAttempts: 3,
    };

    this.challenges.set(challengeId, challenge);

    // Clean up expired challenges
    this.cleanupExpiredChallenges();

    this.logger.debug('MFA challenge created', { challengeId, userId, method });

    return challenge;
  }

  /**
   * Get challenge by ID
   */
  async getChallenge(challengeId: string): Promise<MFAChallenge | null> {
    const challenge = this.challenges.get(challengeId);

    if (!challenge) {
      return null;
    }

    if (new Date() > challenge.expiresAt) {
      this.challenges.delete(challengeId);
      return null;
    }

    return challenge;
  }

  /**
   * Verify MFA token
   */
  async verifyToken(challengeId: string, token: string): Promise<boolean> {
    const challenge = await this.getChallenge(challengeId);
    if (!challenge) {
      return false;
    }

    // Increment attempts
    challenge.attempts++;

    if (challenge.attempts > challenge.maxAttempts) {
      this.challenges.delete(challengeId);
      this.logger.warn('MFA challenge exceeded max attempts', { challengeId });
      return false;
    }

    let isValid = false;

    switch (challenge.method) {
      case 'totp':
        isValid = await this.verifyTOTP(challenge.userId, token);
        break;
      case 'sms':
        // SMS verification would check against sent code
        isValid = false; // Placeholder
        break;
      case 'backup':
        isValid = await this.verifyBackupCode(challenge.userId, token);
        break;
    }

    if (isValid) {
      this.challenges.delete(challengeId);
      this.logger.info('MFA token verified', { challengeId });
    } else {
      this.logger.warn('Invalid MFA token', {
        challengeId,
        attempts: challenge.attempts,
      });
    }

    return isValid;
  }

  /**
   * Verify TOTP code
   */
  private async verifyTOTP(userId: string, token: string): Promise<boolean> {
    if (!this.adapter) {
      return false;
    }

    const secret = await this.adapter.getMFASecret(userId, 'totp');
    if (!secret) {
      return false;
    }

    const totpConfig = this.config?.methods.totp as TOTPConfig;

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(secret),
      algorithm: totpConfig?.algorithm || 'SHA256',
      digits: totpConfig?.digits || 6,
      period: totpConfig?.period || 30,
    });

    // Validate with time window
    const delta = totp.validate({
      token,
      window: totpConfig?.window || 1,
    });

    return delta !== null;
  }

  /**
   * Verify backup code
   */
  private async verifyBackupCode(
    userId: string,
    code: string
  ): Promise<boolean> {
    if (!this.adapter) {
      return false;
    }

    return this.adapter.verifyBackupCode(userId, code);
  }

  /**
   * Disable MFA
   */
  async disableMFA(userId: string, method?: MFAMethod): Promise<void> {
    if (!this.adapter) {
      return;
    }

    if (method) {
      // Disable specific method
      await this.adapter.saveMFASecret(userId, method, '');
    } else {
      // Disable all methods
      await this.adapter.updateUser(userId, {
        mfa: {
          enabled: false,
          methods: [],
          backupCodesGenerated: false,
        },
      });
    }

    this.logger.info('MFA disabled', { userId, method });
  }

  /**
   * Clean up expired challenges
   */
  private cleanupExpiredChallenges(): void {
    const now = new Date();
    const expiredIds: string[] = [];

    for (const [id, challenge] of this.challenges) {
      if (now > challenge.expiresAt) {
        expiredIds.push(id);
      }
    }

    for (const id of expiredIds) {
      this.challenges.delete(id);
    }

    if (expiredIds.length > 0) {
      this.logger.debug('Cleaned up expired challenges', {
        count: expiredIds.length,
      });
    }
  }
}

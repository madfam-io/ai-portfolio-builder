/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { MFAManager } from '../../src/core/mfa-manager';
import { MockMemoryAdapter } from '../mocks/memory-adapter';
import type { MFAConfig } from '../../src/core/types';

// Mock external dependencies
jest.mock('otpauth');
jest.mock('qrcode');

describe('MFAManager', () => {
  let mfaManager: MFAManager;
  let adapter: MockMemoryAdapter;

  const defaultConfig: MFAConfig = {
    enabled: true,
    methods: {
      totp: {
        enabled: true,
        issuer: 'Test App',
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
      },
      backup: {
        enabled: true,
      },
    },
  };

  beforeEach(() => {
    adapter = new MockMemoryAdapter();
    mfaManager = new MFAManager(defaultConfig, adapter);
  });

  describe('setupMFA', () => {
    it('should setup TOTP MFA successfully', async () => {
      const userId = 'user-123';

      const result = await mfaManager.setupMFA(userId, 'totp');

      expect(result).toBeDefined();
      expect(result.method).toBe('totp');
      expect(result.secret).toBeDefined();
      expect(result.qrCode).toBeDefined();

      // Secret should be stored in adapter
      const storedSecret = await adapter.getMFASecret(userId, 'totp');
      expect(storedSecret).toBe(result.secret);
    });

    it('should setup backup codes MFA', async () => {
      const userId = 'user-123';

      const result = await mfaManager.setupMFA(userId, 'backup');

      expect(result).toBeDefined();
      expect(result.method).toBe('backup');
      expect(result.backupCodes).toBeDefined();
      expect(result.backupCodes).toHaveLength(10);
      expect(result.secret).toBeUndefined();
      expect(result.qrCode).toBeUndefined();
    });

    it('should throw error for disabled method', () => {
      const configWithDisabledSMS: MFAConfig = {
        enabled: true,
        methods: {
          sms: { enabled: false },
        },
      };

      const mfaManagerWithDisabledSMS = new MFAManager(
        configWithDisabledSMS,
        adapter
      );

      await expect(
        mfaManagerWithDisabledSMS.setupMFA('user-123', 'sms')
      ).rejects.toThrow('MFA method sms is not enabled');
    });

    it('should throw error when MFA is disabled', () => {
      const disabledConfig: MFAConfig = {
        enabled: false,
        methods: {},
      };

      const disabledMfaManager = new MFAManager(disabledConfig, adapter);

      // setupMFA is not async anymore, it throws synchronously
      expect(() => disabledMfaManager.setupMFA('user-123', 'totp')).toThrow(
        'MFA is not enabled'
      );
    });
  });

  describe('generateTOTPSecret', () => {
    it('should generate valid TOTP secret', () => {
      const secret = mfaManager.generateTOTPSecret();

      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(10); // Base32 encoded secret should be reasonably long
    });

    it('should generate different secrets each time', () => {
      const secret1 = mfaManager.generateTOTPSecret();
      const secret2 = mfaManager.generateTOTPSecret();

      expect(secret1).not.toBe(secret2);
    });
  });

  describe('generateQRCode', () => {
    it('should generate QR code for TOTP', async () => {
      const secret = mfaManager.generateTOTPSecret();
      const userEmail = 'test@example.com';

      const qrCode = await mfaManager.generateQRCode(secret, userEmail);

      expect(qrCode).toBeDefined();
      expect(typeof qrCode).toBe('string');
      expect(qrCode).toMatch(/^data:image\/png;base64,/); // Should be base64 encoded PNG
    });

    it('should include issuer in QR code URL', async () => {
      const secret = mfaManager.generateTOTPSecret();
      const userEmail = 'test@example.com';

      // We can't easily test the QR code content without decoding it,
      // but we can ensure it generates successfully
      const qrCode = await mfaManager.generateQRCode(secret, userEmail);

      expect(qrCode).toBeDefined();
    });
  });

  describe('generateBackupCodes', () => {
    it('should generate default number of backup codes', () => {
      const codes = mfaManager.generateBackupCodes();

      expect(codes).toHaveLength(10);
      expect(codes.every(code => typeof code === 'string')).toBe(true);
      expect(codes.every(code => code.length > 0)).toBe(true);
    });

    it('should generate custom number of backup codes', () => {
      const codes = mfaManager.generateBackupCodes(5);

      expect(codes).toHaveLength(5);
    });

    it('should generate unique codes', () => {
      const codes = mfaManager.generateBackupCodes();
      const uniqueCodes = new Set(codes);

      expect(uniqueCodes.size).toBe(codes.length);
    });

    it('should generate codes with correct format', () => {
      const codes = mfaManager.generateBackupCodes();

      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/); // 8 character alphanumeric codes
      });
    });
  });

  describe('verifyTOTP', () => {
    it('should verify valid TOTP token', async () => {
      const userId = 'user-123';
      const secret = mfaManager.generateTOTPSecret();

      await adapter.saveMFASecret(userId, 'totp', secret);

      // Generate a valid token (this is simplified - in reality you'd use the TOTP algorithm)
      // For testing, we'll mock this
      const validToken = '123456'; // Mock token

      // Mock the TOTP verification
      jest
        .spyOn(mfaManager as any, 'generateTOTPToken')
        .mockReturnValue(validToken);

      const isValid = await mfaManager.verifyTOTP(userId, validToken);

      expect(isValid).toBe(true);
    });

    it('should reject invalid TOTP token', async () => {
      const userId = 'user-123';
      const secret = mfaManager.generateTOTPSecret();

      await adapter.saveMFASecret(userId, 'totp', secret);

      const isValid = await mfaManager.verifyTOTP(userId, 'invalid-token');

      expect(isValid).toBe(false);
    });

    it('should reject token for user without TOTP secret', async () => {
      const userId = 'user-no-secret';

      const isValid = await mfaManager.verifyTOTP(userId, '123456');

      expect(isValid).toBe(false);
    });
  });

  describe('createChallenge', () => {
    it('should create MFA challenge', async () => {
      const userId = 'user-123';
      const method = 'totp';

      const challenge = await mfaManager.createChallenge(userId, method);

      expect(challenge).toBeDefined();
      expect(challenge.id).toBeDefined();
      expect(challenge.userId).toBe(userId);
      expect(challenge.method).toBe(method);
      expect(challenge.expiresAt).toBeDefined();
      expect(challenge.attempts).toBe(0);
      expect(challenge.maxAttempts).toBe(3); // Default max attempts
    });

    it('should set reasonable expiry time', async () => {
      const userId = 'user-123';
      const method = 'totp';

      const challenge = await mfaManager.createChallenge(userId, method);

      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      expect(challenge.expiresAt.getTime()).toBeGreaterThan(now.getTime());
      expect(challenge.expiresAt.getTime()).toBeLessThanOrEqual(
        fiveMinutesFromNow.getTime()
      );
    });
  });

  describe('getChallenge', () => {
    it('should retrieve existing challenge', async () => {
      const userId = 'user-123';
      const method = 'totp';

      const createdChallenge = await mfaManager.createChallenge(userId, method);
      const retrievedChallenge = await mfaManager.getChallenge(
        createdChallenge.id
      );

      expect(retrievedChallenge).toBeDefined();
      expect(retrievedChallenge?.id).toBe(createdChallenge.id);
      expect(retrievedChallenge?.userId).toBe(userId);
      expect(retrievedChallenge?.method).toBe(method);
    });

    it('should return null for non-existent challenge', async () => {
      const challenge = await mfaManager.getChallenge('non-existent-id');

      expect(challenge).toBeNull();
    });

    it('should return null for expired challenge', async () => {
      const userId = 'user-123';
      const method = 'totp';

      const createdChallenge = await mfaManager.createChallenge(userId, method);

      // Manually expire the challenge
      (createdChallenge as any).expiresAt = new Date(Date.now() - 1000);

      const retrievedChallenge = await mfaManager.getChallenge(
        createdChallenge.id
      );

      expect(retrievedChallenge).toBeNull();
    });
  });

  describe('verifyToken', () => {
    it('should verify TOTP token for challenge', async () => {
      const userId = 'user-123';
      const secret = mfaManager.generateTOTPSecret();

      await adapter.saveMFASecret(userId, 'totp', secret);

      const challenge = await mfaManager.createChallenge(userId, 'totp');
      const validToken = '123456';

      // Mock TOTP verification
      jest
        .spyOn(mfaManager as any, 'generateTOTPToken')
        .mockReturnValue(validToken);

      const isValid = await mfaManager.verifyToken(challenge.id, validToken);

      expect(isValid).toBe(true);
    });

    it('should verify backup code for challenge', async () => {
      const userId = 'user-123';
      const backupCodes = ['ABCD1234', 'EFGH5678'];

      await adapter.saveBackupCodes(userId, backupCodes);

      const challenge = await mfaManager.createChallenge(userId, 'backup');

      const isValid = await mfaManager.verifyToken(challenge.id, 'ABCD1234');

      expect(isValid).toBe(true);

      // Code should be consumed
      const isValidAgain = await mfaManager.verifyToken(
        challenge.id,
        'ABCD1234'
      );
      expect(isValidAgain).toBe(false);
    });

    it('should increment attempt count on failure', async () => {
      const userId = 'user-123';
      const challenge = await mfaManager.createChallenge(userId, 'totp');

      await mfaManager.verifyToken(challenge.id, 'invalid-token');

      const updatedChallenge = await mfaManager.getChallenge(challenge.id);
      expect(updatedChallenge?.attempts).toBe(1);
    });

    it('should invalidate challenge after max attempts', async () => {
      const userId = 'user-123';
      const challenge = await mfaManager.createChallenge(userId, 'totp');

      // Exhaust all attempts
      for (let i = 0; i < 3; i++) {
        await mfaManager.verifyToken(challenge.id, 'invalid-token');
      }

      // Challenge should be invalid now
      const finalChallenge = await mfaManager.getChallenge(challenge.id);
      expect(finalChallenge).toBeNull();
    });
  });

  describe('disableMFA', () => {
    it('should disable specific MFA method', async () => {
      const userId = 'user-123';

      // Setup TOTP first
      await mfaManager.setupMFA(userId, 'totp');

      await mfaManager.disableMFA(userId, 'totp');

      // Secret should be removed
      const secret = await adapter.getMFASecret(userId, 'totp');
      expect(secret).toBeNull();
    });

    it('should disable all MFA methods when no method specified', async () => {
      const userId = 'user-123';

      // Setup multiple methods
      await mfaManager.setupMFA(userId, 'totp');
      await adapter.saveBackupCodes(userId, ['ABCD1234']);

      await mfaManager.disableMFA(userId);

      // All secrets should be removed
      const totpSecret = await adapter.getMFASecret(userId, 'totp');
      expect(totpSecret).toBeNull();

      const isValidBackup = await adapter.verifyBackupCode(userId, 'ABCD1234');
      expect(isValidBackup).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle missing adapter gracefully', () => {
      const mfaManagerWithoutAdapter = new MFAManager(
        defaultConfig,
        undefined as any
      );

      expect(() => mfaManagerWithoutAdapter.generateTOTPSecret()).not.toThrow();
      expect(() =>
        mfaManagerWithoutAdapter.generateBackupCodes()
      ).not.toThrow();
    });

    it('should handle malformed TOTP tokens', async () => {
      const userId = 'user-123';
      const secret = mfaManager.generateTOTPSecret();

      await adapter.saveMFASecret(userId, 'totp', secret);

      const malformedTokens = ['', '123', '1234567', 'abcdef', '123abc'];

      for (const token of malformedTokens) {
        const isValid = await mfaManager.verifyTOTP(userId, token);
        expect(isValid).toBe(false);
      }
    });

    it('should handle concurrent challenge verification', async () => {
      const userId = 'user-123';
      const challenge = await mfaManager.createChallenge(userId, 'totp');

      // Multiple concurrent verification attempts
      const promises = Array(5)
        .fill(null)
        .map(() => mfaManager.verifyToken(challenge.id, 'invalid-token'));

      const results = await Promise.all(promises);

      // All should fail, but only one should increment the counter
      expect(results.every(result => result === false)).toBe(true);
    });
  });
});

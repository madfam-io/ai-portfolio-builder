/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import {
  generateBackupCodes,
  validateBackupCode,
  generateTOTPSecret,
  generateQRCode,
  verifyTOTP,
  enableMFA,
  disableMFA,
  checkMFAStatus,
  regenerateBackupCodes,
} from '@/lib/auth/mfa-service';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { createSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('otplib');
jest.mock('qrcode');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/utils/logger');

const mockAuthenticator = jest.mocked(authenticator);
const mockQRCode = jest.mocked(QRCode);
const mockCreateSupabaseClient = jest.mocked(createSupabaseClient);
const mockLogger = jest.mocked(logger);

describe('MFA Service', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase mock
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        mfa: {
          enroll: jest.fn(),
          verify: jest.fn(),
          unenroll: jest.fn(),
          listFactors: jest.fn(),
        },
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    mockCreateSupabaseClient.mockResolvedValue(mockSupabase);

    // Mock logger
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.warn = jest.fn();
  });

  describe('generateBackupCodes', () => {
    it('should generate 10 unique backup codes', () => {
      const codes = generateBackupCodes();

      expect(codes).toHaveLength(10);
      expect(new Set(codes).size).toBe(10); // All unique

      // Check format (8 characters, alphanumeric)
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });
    });

    it('should generate cryptographically secure codes', () => {
      const mockRandomValues = new Uint8Array(10);
      mockRandomValues.fill(255);

      // Mock crypto.getRandomValues
      global.crypto = {
        getRandomValues: jest.fn().mockImplementation(arr => {
          arr.set(mockRandomValues);
          return arr;
        }),
      } as any;

      const codes = generateBackupCodes();

      expect(global.crypto.getRandomValues).toHaveBeenCalled();
      expect(codes).toHaveLength(10);
    });
  });

  describe('validateBackupCode', () => {
    const userId = 'user_123';
    const validCode = 'ABCD1234';
    const hashedCode = 'hashed_code';

    it('should validate correct backup code', async () => {
      // Mock bcrypt comparison
      jest.doMock('bcryptjs', () => ({
        compare: jest.fn().mockResolvedValue(true),
      }));

      mockSupabase.single.mockResolvedValueOnce({
        data: [
          { code: hashedCode, used: false },
          { code: 'other_hash', used: false },
        ],
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'code_123' },
        error: null,
      });

      const result = await validateBackupCode(userId, validCode);

      expect(result).toEqual({
        valid: true,
        error: null,
      });

      // Should mark code as used
      expect(mockSupabase.update).toHaveBeenCalledWith({
        used: true,
        used_at: expect.any(Date),
      });

      expect(mockLogger.info).toHaveBeenCalledWith('Backup code used', {
        userId,
        codeId: expect.any(String),
      });
    });

    it('should reject already used code', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: [{ code: hashedCode, used: true }],
        error: null,
      });

      const result = await validateBackupCode(userId, validCode);

      expect(result).toEqual({
        valid: false,
        error: 'Code already used',
      });

      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it('should reject invalid code', async () => {
      jest.doMock('bcryptjs', () => ({
        compare: jest.fn().mockResolvedValue(false),
      }));

      mockSupabase.single.mockResolvedValueOnce({
        data: [{ code: 'different_hash', used: false }],
        error: null,
      });

      const result = await validateBackupCode(userId, 'WRONG123');

      expect(result).toEqual({
        valid: false,
        error: 'Invalid backup code',
      });
    });
  });

  describe('TOTP Operations', () => {
    describe('generateTOTPSecret', () => {
      it('should generate TOTP secret and metadata', () => {
        const mockSecret = 'JBSWY3DPEHPK3PXP';
        mockAuthenticator.generateSecret.mockReturnValue(mockSecret);

        const result = generateTOTPSecret('test@example.com');

        expect(mockAuthenticator.generateSecret).toHaveBeenCalled();
        expect(result).toEqual({
          secret: mockSecret,
          uri: expect.stringContaining('otpauth://totp/'),
          issuer: 'PRISMA Portfolio',
        });

        // Check URI format
        expect(result.uri).toContain('PRISMA%20Portfolio');
        expect(result.uri).toContain('test%40example.com');
        expect(result.uri).toContain(`secret=${mockSecret}`);
      });
    });

    describe('generateQRCode', () => {
      it('should generate QR code data URL', async () => {
        const mockDataURL = 'data:image/png;base64,qrcode';
        const uri = 'otpauth://totp/PRISMA:test@example.com';

        mockQRCode.toDataURL.mockResolvedValue(mockDataURL);

        const result = await generateQRCode(uri);

        expect(mockQRCode.toDataURL).toHaveBeenCalledWith(uri, {
          width: 256,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        expect(result).toBe(mockDataURL);
      });

      it('should handle QR code generation errors', async () => {
        mockQRCode.toDataURL.mockRejectedValue(
          new Error('QR generation failed')
        );

        await expect(generateQRCode('invalid')).rejects.toThrow(
          'QR generation failed'
        );
      });
    });

    describe('verifyTOTP', () => {
      it('should verify valid TOTP code', () => {
        const secret = 'JBSWY3DPEHPK3PXP';
        const code = '123456';

        mockAuthenticator.verify.mockReturnValue(true);

        const result = verifyTOTP(secret, code);

        expect(mockAuthenticator.verify).toHaveBeenCalledWith({
          token: code,
          secret: secret,
          window: 1, // Allow 1 step before/after
        });

        expect(result).toBe(true);
      });

      it('should reject invalid TOTP code', () => {
        mockAuthenticator.verify.mockReturnValue(false);

        const result = verifyTOTP('secret', '000000');

        expect(result).toBe(false);
      });

      it('should handle time window for codes', () => {
        const secret = 'JBSWY3DPEHPK3PXP';
        const code = '123456';

        verifyTOTP(secret, code);

        expect(mockAuthenticator.verify).toHaveBeenCalledWith({
          token: code,
          secret: secret,
          window: 1,
        });
      });
    });
  });

  describe('MFA Management', () => {
    const userId = 'user_123';

    describe('enableMFA', () => {
      it('should enable MFA with TOTP and backup codes', async () => {
        const secret = 'JBSWY3DPEHPK3PXP';
        const verificationCode = '123456';
        const backupCodes = ['CODE1234', 'CODE5678'];

        mockAuthenticator.verify.mockReturnValue(true);

        // Mock generating backup codes
        jest.spyOn(global, 'crypto', 'get').mockReturnValue({
          getRandomValues: jest.fn().mockImplementation(arr => arr),
        } as any);

        mockSupabase.single.mockResolvedValueOnce({
          data: { id: userId },
          error: null,
        });

        // Mock storing backup codes
        mockSupabase.single.mockResolvedValueOnce({
          data: backupCodes.map(code => ({ id: code })),
          error: null,
        });

        const result = await enableMFA(userId, secret, verificationCode);

        expect(result.success).toBe(true);
        expect(result.backupCodes).toHaveLength(10);

        // Verify MFA was enabled
        expect(mockSupabase.update).toHaveBeenCalledWith({
          mfa_enabled: true,
          mfa_secret: expect.any(String), // Should be encrypted
        });

        // Verify backup codes were stored
        expect(mockSupabase.insert).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              user_id: userId,
              code: expect.any(String), // Hashed
              used: false,
            }),
          ])
        );

        expect(mockLogger.info).toHaveBeenCalledWith('MFA enabled', { userId });
      });

      it('should fail if verification code is invalid', async () => {
        mockAuthenticator.verify.mockReturnValue(false);

        const result = await enableMFA(userId, 'secret', '000000');

        expect(result).toEqual({
          success: false,
          error: 'Invalid verification code',
        });

        expect(mockSupabase.update).not.toHaveBeenCalled();
      });

      it('should fail if MFA is already enabled', async () => {
        mockAuthenticator.verify.mockReturnValue(true);

        mockSupabase.single.mockResolvedValueOnce({
          data: { id: userId, mfa_enabled: true },
          error: null,
        });

        const result = await enableMFA(userId, 'secret', '123456');

        expect(result).toEqual({
          success: false,
          error: 'MFA is already enabled',
        });
      });
    });

    describe('disableMFA', () => {
      it('should disable MFA and remove backup codes', async () => {
        const verificationCode = '123456';

        mockSupabase.single.mockResolvedValueOnce({
          data: { id: userId, mfa_secret: 'encrypted_secret' },
          error: null,
        });

        // Mock decryption
        jest.doMock('@/lib/utils/encryption', () => ({
          decrypt: jest.fn().mockReturnValue('JBSWY3DPEHPK3PXP'),
        }));

        mockAuthenticator.verify.mockReturnValue(true);

        mockSupabase.single.mockResolvedValueOnce({
          data: { id: userId },
          error: null,
        });

        const result = await disableMFA(userId, verificationCode);

        expect(result).toEqual({
          success: true,
          error: null,
        });

        // Verify MFA was disabled
        expect(mockSupabase.update).toHaveBeenCalledWith({
          mfa_enabled: false,
          mfa_secret: null,
        });

        // Verify backup codes were deleted
        expect(mockSupabase.delete).toHaveBeenCalled();

        expect(mockLogger.info).toHaveBeenCalledWith('MFA disabled', {
          userId,
        });
      });

      it('should fail with invalid verification code', async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: { id: userId, mfa_secret: 'encrypted_secret' },
          error: null,
        });

        mockAuthenticator.verify.mockReturnValue(false);

        const result = await disableMFA(userId, '000000');

        expect(result).toEqual({
          success: false,
          error: 'Invalid verification code',
        });

        expect(mockSupabase.update).not.toHaveBeenCalled();
      });
    });

    describe('checkMFAStatus', () => {
      it('should return enabled status with factor details', async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: {
            id: userId,
            mfa_enabled: true,
            mfa_secret: 'encrypted_secret',
          },
          error: null,
        });

        mockSupabase.auth.mfa.listFactors.mockResolvedValue({
          data: {
            totp: [
              {
                id: 'factor_123',
                status: 'verified',
                created_at: '2024-01-01T00:00:00Z',
              },
            ],
          },
          error: null,
        });

        const result = await checkMFAStatus(userId);

        expect(result).toEqual({
          enabled: true,
          factors: {
            totp: true,
            backupCodes: true,
          },
          error: null,
        });
      });

      it('should return disabled status', async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: {
            id: userId,
            mfa_enabled: false,
          },
          error: null,
        });

        const result = await checkMFAStatus(userId);

        expect(result).toEqual({
          enabled: false,
          factors: {
            totp: false,
            backupCodes: false,
          },
          error: null,
        });
      });
    });

    describe('regenerateBackupCodes', () => {
      it('should regenerate backup codes', async () => {
        const verificationCode = '123456';

        mockSupabase.single.mockResolvedValueOnce({
          data: {
            id: userId,
            mfa_enabled: true,
            mfa_secret: 'encrypted_secret',
          },
          error: null,
        });

        mockAuthenticator.verify.mockReturnValue(true);

        // Mock deletion of old codes
        mockSupabase.single.mockResolvedValueOnce({
          data: { count: 5 },
          error: null,
        });

        // Mock insertion of new codes
        mockSupabase.single.mockResolvedValueOnce({
          data: Array(10).fill({ id: 'code_new' }),
          error: null,
        });

        const result = await regenerateBackupCodes(userId, verificationCode);

        expect(result.success).toBe(true);
        expect(result.backupCodes).toHaveLength(10);

        // Verify old codes were deleted
        expect(mockSupabase.delete).toHaveBeenCalled();

        // Verify new codes were created
        expect(mockSupabase.insert).toHaveBeenCalled();

        expect(mockLogger.info).toHaveBeenCalledWith(
          'Backup codes regenerated',
          {
            userId,
          }
        );
      });

      it('should require MFA to be enabled', async () => {
        mockSupabase.single.mockResolvedValueOnce({
          data: { id: userId, mfa_enabled: false },
          error: null,
        });

        const result = await regenerateBackupCodes(userId, '123456');

        expect(result).toEqual({
          success: false,
          error: 'MFA is not enabled',
        });
      });
    });
  });

  describe('Security Considerations', () => {
    it('should encrypt TOTP secrets before storage', async () => {
      const plainSecret = 'JBSWY3DPEHPK3PXP';
      const encryptedSecret = 'encrypted_secret';

      jest.doMock('@/lib/utils/encryption', () => ({
        encrypt: jest.fn().mockReturnValue(encryptedSecret),
      }));

      mockAuthenticator.verify.mockReturnValue(true);
      mockSupabase.single.mockResolvedValue({
        data: { id: 'user_123' },
        error: null,
      });

      await enableMFA('user_123', plainSecret, '123456');

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          mfa_secret: encryptedSecret,
        })
      );
    });

    it('should hash backup codes before storage', async () => {
      jest.doMock('bcryptjs', () => ({
        hash: jest.fn().mockResolvedValue('hashed_code'),
      }));

      mockAuthenticator.verify.mockReturnValue(true);
      mockSupabase.single.mockResolvedValue({
        data: { id: 'user_123' },
        error: null,
      });

      await enableMFA('user_123', 'secret', '123456');

      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'hashed_code',
          }),
        ])
      );
    });

    it('should log security events', async () => {
      // MFA enabled
      mockAuthenticator.verify.mockReturnValue(true);
      mockSupabase.single.mockResolvedValue({
        data: { id: 'user_123' },
        error: null,
      });
      await enableMFA('user_123', 'secret', '123456');
      expect(mockLogger.info).toHaveBeenCalledWith('MFA enabled', {
        userId: 'user_123',
      });

      // Failed verification
      mockSupabase.single.mockResolvedValue({
        data: { id: 'user_123', mfa_enabled: true },
        error: null,
      });
      mockAuthenticator.verify.mockReturnValue(false);
      await disableMFA('user_123', '000000');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Invalid MFA verification attempt',
        {
          userId: 'user_123',
        }
      );
    });
  });
});

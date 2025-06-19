/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import {
  signUpWithEmail,
  signInWithEmail,
  signInWithProvider,
  signOut,
  resetPassword,
  updatePassword,
  verifyOTP,
  setupMFA,
  validateSession,
  refreshSession,
} from '@/lib/auth/auth-service';
import { createSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { cookies } from 'next/headers';


// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/utils/logger');
jest.mock('next/headers');

const mockCreateSupabaseClient = jest.mocked(createSupabaseClient);
const mockLogger = jest.mocked(logger);
const mockCookies = jest.mocked(cookies);

describe('Auth Service', () => {
  let mockSupabase: any;
  let mockAuth: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup auth mock
    mockAuth = {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      verifyOtp: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
      getUser: jest.fn(),
    };

    // Setup Supabase mock
    mockSupabase = {
      auth: mockAuth,
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    mockCreateSupabaseClient.mockResolvedValue(mockSupabase);

    // Mock logger
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.warn = jest.fn();

    // Mock cookies
    mockCookies.mockReturnValue({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    });
  });

  describe('signUpWithEmail', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'SecurePassword123!';

    it('should create a new user account', async () => {
      const mockUser = {
        id: 'user_123',
        email: mockEmail,
        app_metadata: {},
        user_metadata: {},
      };

      mockAuth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'user_123' },
        error: null,
      });

      const result = await signUpWithEmail(mockEmail, mockPassword);

      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: mockEmail,
        password: mockPassword,
        options: {
          emailRedirectTo: expect.stringContaining('/auth/callback'),
        },
      });

      expect(result).toEqual({
        user: mockUser,
        session: null,
        error: null,
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith(
      {
        id: 'user_123',
        email: mockEmail,
        subscription_plan: 'free',
        ai_credits: 3,
    );
  });

      expect(mockLogger.info).toHaveBeenCalledWith(
      'User signed up', {
        userId: 'user_123',
        email: mockEmail,
    );
  });
    });

    it('should handle email already in use', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'User already registered',
          status: 400,
        },
      });

      const result = await signUpWithEmail(mockEmail, mockPassword);

      expect(result.error).toEqual({
        message: 'User already registered',
        status: 400,
      });

      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    it('should validate password strength', async () => {
      const weakPassword = '123456';

      await expect(signUpWithEmail(mockEmail, weakPassword)).rejects.toThrow(
        'Password must be at least 12 characters'

      expect(mockAuth.signUp).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const invalidEmail = 'not-an-email';

      await expect(signUpWithEmail(invalidEmail, mockPassword)).rejects.toThrow(
        'Invalid email format'

      expect(mockAuth.signUp).not.toHaveBeenCalled();
    });
  });

  describe('signInWithEmail', () => {
    const mockEmail = 'test@example.com';
    const mockPassword = 'SecurePassword123!';

    it('should sign in existing user', async () => {
      const mockSession = {
        access_token: 'access_token_123',
        refresh_token: 'refresh_token_123',
        user: {
          id: 'user_123',
          email: mockEmail,
        },
      };

      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      });

      const result = await signInWithEmail(mockEmail, mockPassword);

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith(
      {
        email: mockEmail,
        password: mockPassword,
    );
  });

      expect(result).toEqual({
        user: mockSession.user,
        session: mockSession,
        error: null,
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
      'User signed in', {
        userId: 'user_123',
        email: mockEmail,
    );
  });
    });

    it('should handle invalid credentials', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid login credentials',
          status: 400,
        },
      });

      const result = await signInWithEmail(mockEmail, 'wrongpassword');

      expect(result.error).toEqual({
        message: 'Invalid login credentials',
        status: 400,
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
      'Failed sign in attempt', {
        email: mockEmail,
        error: 'Invalid login credentials',
    );
  });
    });

    it('should handle MFA requirement', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'MFA verification required',
          status: 400,
          code: 'mfa_required',
        },
      });

      const result = await signInWithEmail(mockEmail, mockPassword);

      expect(result.error.code).toBe('mfa_required');
    });
  });

  describe('signInWithProvider', () => {
    it('should initiate OAuth flow for GitHub', async () => {
      const mockRedirectUrl = 'https://github.com/login/oauth/authorize';

      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { url: mockRedirectUrl, provider: 'github' },
        error: null,
      });

      const result = await signInWithProvider('github');

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          scopes: 'read:user user:email',
        },
      });

      expect(result).toEqual({
        url: mockRedirectUrl,
        provider: 'github',
        error: null,
      });
    });

    it('should initiate OAuth flow for LinkedIn', async () => {
      const mockRedirectUrl = 'https://linkedin.com/oauth/authorize';

      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { url: mockRedirectUrl, provider: 'linkedin' },
        error: null,
      });

      const result = await signInWithProvider('linkedin');

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'linkedin',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
          scopes: 'r_emailaddress r_liteprofile',
        },
      });

      expect(result).toEqual({
        url: mockRedirectUrl,
        provider: 'linkedin',
        error: null,
      });
    });

    it('should handle OAuth errors', async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: {
          message: 'OAuth provider error',
          status: 500,
        },
      });

      const result = await signInWithProvider('github');

      expect(result.error).toEqual({
        message: 'OAuth provider error',
        status: 500,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
      'OAuth sign in error', {
        provider: 'github',
        error: 'OAuth provider error',
    );
  });
    });
  });

  describe('signOut', () => {
    it('should sign out user and clear session', async () => {
      mockAuth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await signOut();

      expect(mockAuth.signOut).toHaveBeenCalled();
      expect(result.error).toBeNull();

      expect(mockLogger.info).toHaveBeenCalledWith('User signed out');
    });

    it('should handle sign out errors', async () => {
      mockAuth.signOut.mockResolvedValue({
        error: {
          message: 'Failed to sign out',
          status: 500,
        },
      });

      const result = await signOut();

      expect(result.error).toEqual({
        message: 'Failed to sign out',
        status: 500,
      });
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      const mockEmail = 'test@example.com';

      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await resetPassword(mockEmail);

      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(mockEmail, {
        redirectTo: expect.stringContaining('/auth/reset-password'),
      });

      expect(result.error).toBeNull();

      expect(mockLogger.info).toHaveBeenCalledWith(
      'Password reset requested', {
        email: mockEmail,
    );
  });
    });

    it('should handle non-existent email gracefully', async () => {
      const mockEmail = 'nonexistent@example.com';

      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null, // Supabase returns success even for non-existent emails
      });

      const result = await resetPassword(mockEmail);

      // Should still return success to prevent email enumeration
      expect(result.error).toBeNull();
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const newPassword = 'NewSecurePassword123!';

      mockAuth.updateUser.mockResolvedValue({
        data: { user: { id: 'user_123' } },
        error: null,
      });

      const result = await updatePassword(newPassword);

      expect(mockAuth.updateUser).toHaveBeenCalledWith(
      {
        password: newPassword,
    );
  });

      expect(result.error).toBeNull();

      expect(mockLogger.info).toHaveBeenCalledWith(
      'Password updated', {
        userId: 'user_123',
    );
  });
    });

    it('should validate new password strength', async () => {
      const weakPassword = 'weak';

      await expect(updatePassword(weakPassword)).rejects.toThrow(
        'Password must be at least 12 characters'

      expect(mockAuth.updateUser).not.toHaveBeenCalled();
    });

    it('should require authenticated session', async () => {
      mockAuth.updateUser.mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Not authenticated',
          status: 401,
        },
      });

      const result = await updatePassword('NewSecurePassword123!');

      expect(result.error.status).toBe(401);
    });
  });

  describe('MFA Operations', () => {
    describe('setupMFA', () => {
      it('should generate MFA setup data', async () => {
        const mockUser = { id: 'user_123', email: 'test@example.com' };
        const mockFactorId = 'factor_123';
        const mockQRCode = 'data:image/png;base64,qrcode';
        const mockSecret = 'JBSWY3DPEHPK3PXP';

        mockAuth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        // Mock MFA enrollment
        mockAuth.mfa = {
          enroll: jest.fn().mockResolvedValue({
            data: {
              id: mockFactorId,
              type: 'totp',
              totp: {
                qr_code: mockQRCode,
                secret: mockSecret,
                uri: 'otpauth://totp/PRISMA:test@example.com',
              },
            },
            error: null,
          }),
        };

        const result = await setupMFA();

        expect(mockAuth.mfa.enroll).toHaveBeenCalledWith(
      {
          factorType: 'totp',
    );
  });

        expect(result).toEqual({
          factorId: mockFactorId,
          qrCode: mockQRCode,
          secret: mockSecret,
          error: null,
        });

        expect(mockLogger.info).toHaveBeenCalledWith(
      'MFA setup initiated', {
          userId: 'user_123',
    );
  });
      });

      it('should handle MFA already enabled', async () => {
        mockAuth.getUser.mockResolvedValue({
          data: { user: { id: 'user_123' } },
          error: null,
        });

        mockAuth.mfa = {
          enroll: jest.fn().mockResolvedValue({
            data: null,
            error: {
              message: 'MFA already enabled',
              status: 400,
            },
          }),
        };

        const result = await setupMFA();

        expect(result.error.message).toBe('MFA already enabled');
      });
    });

    describe('verifyOTP', () => {
      it('should verify TOTP code', async () => {
        const mockFactorId = 'factor_123';
        const mockCode = '123456';

        mockAuth.mfa = {
          verify: jest.fn().mockResolvedValue({
            data: { verified: true },
            error: null,
          }),
        };

        const result = await verifyOTP(mockFactorId, mockCode);

        expect(mockAuth.mfa.verify).toHaveBeenCalledWith(
      {
          factorId: mockFactorId,
          code: mockCode,
    );
  });

        expect(result).toEqual({
          verified: true,
          error: null,
        });
      });

      it('should handle invalid OTP code', async () => {
        mockAuth.mfa = {
          verify: jest.fn().mockResolvedValue({
            data: { verified: false },
            error: {
              message: 'Invalid verification code',
              status: 400,
            },
          }),
        };

        const result = await verifyOTP('factor_123', '000000');

        expect(result.verified).toBe(false);
        expect(result.error.message).toBe('Invalid verification code');
      });
    });
  });

  describe('Session Management', () => {
    describe('validateSession', () => {
      it('should validate active session', async () => {
        const mockSession = {
          user: { id: 'user_123', email: 'test@example.com' },
          access_token: 'valid_token',
          expires_at: Date.now() + 3600000, // 1 hour from now
        };

        mockAuth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await validateSession();

        expect(result).toEqual({
          valid: true,
          session: mockSession,
          error: null,
        });
      });

      it('should detect expired session', async () => {
        const mockSession = {
          user: { id: 'user_123' },
          access_token: 'expired_token',
          expires_at: Date.now() - 3600000, // 1 hour ago
        };

        mockAuth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await validateSession();

        expect(result.valid).toBe(false);
        expect(result.error).toBe('Session expired');
      });

      it('should handle no session', async () => {
        mockAuth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const result = await validateSession();

        expect(result).toEqual({
          valid: false,
          session: null,
          error: 'No active session',
        });
      });
    });

    describe('refreshSession', () => {
      it('should refresh valid session', async () => {
        const mockNewSession = {
          user: { id: 'user_123' },
          access_token: 'new_token',
          refresh_token: 'new_refresh',
          expires_at: Date.now() + 7200000, // 2 hours
        };

        mockAuth.refreshSession.mockResolvedValue({
          data: { session: mockNewSession },
          error: null,
        });

        const result = await refreshSession();

        expect(mockAuth.refreshSession).toHaveBeenCalled();
        expect(result).toEqual({
          session: mockNewSession,
          error: null,
        });

        expect(mockLogger.info).toHaveBeenCalledWith(
      'Session refreshed', {
          userId: 'user_123',
    );
  });
      });

      it('should handle refresh token expiry', async () => {
        mockAuth.refreshSession.mockResolvedValue({
          data: { session: null },
          error: {
            message: 'Refresh token expired',
            status: 401,
          },
        });

        const result = await refreshSession();

        expect(result.error.message).toBe('Refresh token expired');
        expect(mockLogger.warn).toHaveBeenCalledWith(
      'Session refresh failed', {
          error: 'Refresh token expired',
    );
  });
      });
    });
  });

  describe('Security Features', () => {
    it('should rate limit sign in attempts', async () => {
      // Simulate multiple failed attempts
      const attempts = Array(6).fill(null);
      const email = 'test@example.com';

      for (let i = 0; i < attempts.length; i++) {
        mockAuth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: null },
          error: {
            message: i < 5 ? 'Invalid credentials' : 'Too many attempts',
            status: i < 5 ? 400 : 429,
          },
        });

        const result = await signInWithEmail(email, 'wrongpassword');

        if (i === 5) {
          expect(result.error.status).toBe(429);
          expect(result.error.message).toBe('Too many attempts');
        }
      }
    });

    it('should log security events', async () => {
      // Password reset
      await resetPassword('test@example.com');
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Password reset requested',
        expect.any(Object)

      // Failed login
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });
      await signInWithEmail('test@example.com', 'wrong');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed sign in attempt',
        expect.any(Object)

    });
  });
});

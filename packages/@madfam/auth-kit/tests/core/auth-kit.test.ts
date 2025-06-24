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
import { AuthKit } from '../../src/core/auth-kit';
import { MockMemoryAdapter } from '../mocks/memory-adapter';
import type {
  AuthKitConfig,
  SignUpData,
  SignInData,
} from '../../src/core/types';

describe('AuthKit', () => {
  let authKit: AuthKit;
  let adapter: MockMemoryAdapter;

  const defaultConfig: AuthKitConfig = {
    providers: {
      email: {
        enabled: true,
        verification: 'optional',
        passwordRequirements: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
        },
      },
      google: {
        enabled: true,
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        redirectUri: 'http://localhost:3000/auth/callback',
      },
    },
    session: {
      type: 'jwt',
      secret: 'test-secret',
      expiresIn: '1h',
    },
    mfa: {
      enabled: true,
      methods: {
        totp: {
          enabled: true,
          issuer: 'Test App',
        },
      },
    },
    security: {
      rateLimit: {
        enabled: false,
        windowMs: 60000,
        maxAttempts: 5,
      },
    },
  };

  beforeEach(() => {
    adapter = new MockMemoryAdapter();
    authKit = new AuthKit({
      ...defaultConfig,
      adapter,
    });
  });

  describe('signUp', () => {
    it('should create a new user successfully', async () => {
      const signUpData: SignUpData = {
        email: 'test@example.com',
        password: 'Password123!',
        metadata: { fullName: 'Test User' },
      };

      const result = await authKit.signUp(signUpData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.emailVerified).toBe(false);
      expect(result.user.metadata?.fullName).toBe('Test User');
      expect(result.session).toBeDefined();
      expect(result.session.userId).toBe(result.user.id);
    });

    it('should reject weak passwords', async () => {
      const signUpData: SignUpData = {
        email: 'test@example.com',
        password: 'weak',
      };

      await expect(authKit.signUp(signUpData)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: expect.stringContaining('Password must be at least'),
      });
    });

    it('should reject duplicate email addresses', async () => {
      const signUpData: SignUpData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      await authKit.signUp(signUpData);

      await expect(authKit.signUp(signUpData)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'User already exists',
      });
    });

    it('should handle sign up hooks', async () => {
      const beforeHook = jest.fn().mockImplementation(data => ({
        ...data,
        metadata: { ...data.metadata, processed: true },
      }));
      const afterHook = jest.fn();

      const authKitWithHooks = new AuthKit({
        ...defaultConfig,
        adapter,
        hooks: {
          beforeSignUp: beforeHook,
          afterSignUp: afterHook,
        },
      });

      const signUpData: SignUpData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = await authKitWithHooks.signUp(signUpData);

      expect(beforeHook).toHaveBeenCalledWith(signUpData);
      expect(afterHook).toHaveBeenCalledWith(result.user);
      expect(result.user.metadata?.processed).toBe(true);
    });
  });

  describe('signIn', () => {
    beforeEach(async () => {
      // Create a test user
      await authKit.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    it('should sign in with correct credentials', async () => {
      const signInData: SignInData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = await authKit.signIn(signInData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.session).toBeDefined();
      expect(result.requiresMFA).toBeFalsy();
    });

    it('should reject invalid credentials', async () => {
      const signInData: SignInData = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      await expect(authKit.signIn(signInData)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    });

    it('should reject non-existent user', async () => {
      const signInData: SignInData = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      await expect(authKit.signIn(signInData)).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    });

    it('should require MFA when enabled', async () => {
      // Enable MFA for the user
      const user = await adapter.findUserByEmail('test@example.com');
      if (user) {
        await adapter.updateUser(user.id, {
          mfa: {
            enabled: true,
            methods: ['totp'],
            preferredMethod: 'totp',
            backupCodesGenerated: false,
          },
        });
      }

      const signInData: SignInData = {
        email: 'test@example.com',
        password: 'Password123!',
      };

      const result = await authKit.signIn(signInData);

      expect(result.requiresMFA).toBe(true);
      expect(result.mfaChallengeId).toBeDefined();
    });

    it('should handle remember me option', async () => {
      const signInData: SignInData = {
        email: 'test@example.com',
        password: 'Password123!',
        rememberMe: true,
      };

      const result = await authKit.signIn(signInData);

      expect(result.session).toBeDefined();
      // The session should have extended expiry when rememberMe is true
      // This would be tested more specifically in SessionManager tests
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const signUpResult = await authKit.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      await authKit.signOut(signUpResult.session.token);

      // Session should be revoked
      const session = await adapter.findSessionByToken(
        signUpResult.session.token
      );
      expect(session).toBeNull();
    });

    it('should handle invalid session token', async () => {
      await expect(authKit.signOut('invalid-token')).rejects.toMatchObject({
        code: 'SESSION_EXPIRED',
        message: 'Invalid or expired session',
      });
    });
  });

  describe('password reset', () => {
    beforeEach(async () => {
      await authKit.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    it('should send password reset email', async () => {
      await authKit.sendPasswordResetEmail('test@example.com');

      const user = await adapter.findUserByEmail('test@example.com');
      expect(user?.metadata?.passwordResetToken).toBeDefined();
      expect(user?.metadata?.passwordResetExpiry).toBeDefined();
    });

    it('should not reveal if user exists', async () => {
      // Should not throw for non-existent user
      await expect(
        authKit.sendPasswordResetEmail('nonexistent@example.com')
      ).resolves.toBeUndefined();
    });

    it('should reset password with valid token', async () => {
      await authKit.sendPasswordResetEmail('test@example.com');

      const user = await adapter.findUserByEmail('test@example.com');
      const resetToken = user?.metadata?.passwordResetToken as string;

      await authKit.resetPassword(resetToken, 'NewPassword123!');

      // Should be able to sign in with new password
      const result = await authKit.signIn({
        email: 'test@example.com',
        password: 'NewPassword123!',
      });

      expect(result.user).toBeDefined();

      // Old password should not work
      await expect(
        authKit.signIn({
          email: 'test@example.com',
          password: 'Password123!',
        })
      ).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
      });
    });

    it('should reject invalid reset token', async () => {
      await expect(
        authKit.resetPassword('invalid-token', 'NewPassword123!')
      ).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token',
      });
    });

    it('should reject expired reset token', async () => {
      await authKit.sendPasswordResetEmail('test@example.com');

      const user = await adapter.findUserByEmail('test@example.com');
      const resetToken = user?.metadata?.passwordResetToken as string;

      // Manually expire the token
      await adapter.updateUser(user!.id, {
        metadata: {
          ...user?.metadata,
          passwordResetExpiry: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      });

      await expect(
        authKit.resetPassword(resetToken, 'NewPassword123!')
      ).rejects.toMatchObject({
        code: 'EXPIRED_TOKEN',
        message: 'Reset token has expired',
      });
    });
  });

  describe('session management', () => {
    it('should get valid session', async () => {
      const signUpResult = await authKit.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const session = await authKit.getSession(signUpResult.session.token);

      expect(session).toBeDefined();
      expect(session?.id).toBe(signUpResult.session.id);
    });

    it('should return null for invalid session', async () => {
      const session = await authKit.getSession('invalid-token');

      expect(session).toBeNull();
    });
  });

  describe('OAuth', () => {
    it('should generate OAuth URL', async () => {
      const result = await authKit.signInWithOAuth('google');

      expect(result.url).toBeDefined();
      expect(typeof result.url).toBe('string');
    });

    it('should handle OAuth callback', async () => {
      const mockProviderUser = {
        id: 'google-123',
        email: 'oauth@example.com',
        name: 'OAuth User',
        avatar: 'https://example.com/avatar.jpg',
      };

      // Mock the provider manager's handleOAuthCallback method
      jest
        .spyOn(authKit['providerManager'], 'handleOAuthCallback')
        .mockResolvedValue(mockProviderUser);

      const result = await authKit.handleOAuthCallback('google', 'auth-code');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('oauth@example.com');
      expect(result.user.emailVerified).toBe(true);
      expect(result.session).toBeDefined();
    });
  });

  describe('password validation', () => {
    it('should validate strong password', async () => {
      const result = await authKit.validatePassword('StrongPassword123!');

      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThan(0);
    });

    it('should reject weak password', async () => {
      const result = await authKit.validatePassword('weak');

      expect(result.valid).toBe(false);
      expect(result.feedback).toBeDefined();
      expect(result.feedback!.length).toBeGreaterThan(0);
    });
  });

  describe('event emission', () => {
    it('should emit user.created event on sign up', async () => {
      const eventListener = jest.fn();
      authKit.on('user.created', eventListener);

      await authKit.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(eventListener).toHaveBeenCalledTimes(1);
    });

    it('should emit user.signed_in event on sign in', async () => {
      await authKit.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      const eventListener = jest.fn();
      authKit.on('user.signed_in', eventListener);

      await authKit.signIn({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(eventListener).toHaveBeenCalledTimes(1);
    });
  });
});

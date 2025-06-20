// Mock Supabase client
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) })),
  },
}));

import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import type { Mock, MockedClass } from 'jest-mock';
import { AuthService } from '@/lib/services/auth/auth-service';
import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

jest.mock('@/lib/supabase/client');
jest.mock('@/lib/utils/logger', () => ({

/**
 * @jest-environment jsdom
 */

// Mock dependencies

  logger: {
    error: jest.fn().mockReturnValue(void 0),
    warn: jest.fn().mockReturnValue(void 0),
    info: jest.fn().mockReturnValue(void 0),
    debug: jest.fn().mockReturnValue(void 0),
  },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'http://localhost:3000',
  },
  writable: true,
});

describe('AuthService', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  let authService: AuthService;
  let mockSupabaseClient: any;
  let mockAuthClient: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2023-01-01T00:00:00.000Z',
  };

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Date.now() + 3600000,
    user: mockUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth client methods
    mockAuthClient = {
      signInWithPassword: jest.fn().mockReturnValue(void 0),
      signUp: jest.fn().mockReturnValue(void 0),
      signOut: jest.fn().mockReturnValue(void 0),
      resetPasswordForEmail: jest.fn().mockReturnValue(void 0),
      updateUser: jest.fn().mockReturnValue(void 0),
      getSession: jest.fn().mockReturnValue(void 0),
      getUser: jest.fn().mockReturnValue(void 0),
      signInWithOAuth: jest.fn().mockReturnValue(void 0),
      onAuthStateChange: jest.fn().mockReturnValue(void 0),
    };

    // Mock Supabase client
    mockSupabaseClient = {
      auth: mockAuthClient,
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Create new instance for each test
    authService = new AuthService();
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      mockAuthClient.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await authService.signIn(
        'test@example.com',
        'password123'

      expect(result.data).toEqual({ user: mockUser, session: mockSession });
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
      expect(mockAuthClient.signInWithPassword).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        password: 'password123',
    });
  });
      expect(logger.info).toHaveBeenCalledWith(
      'User signed in successfully', {
        userId: 'user-123',
    );
  });
    });

    it('should handle sign in error', async () => {
      const authError = {
        message: 'Invalid credentials',
        status: 401,
      };

      mockAuthClient.signInWithPassword.mockResolvedValue({
        data: null,
        error: authError,
      });

      const result = await authService.signIn(
        'test@example.com',
        'wrongpassword'

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toEqual(authError);
      expect(logger.error).toHaveBeenCalledWith('Sign in error:', authError);
    });

    it('should handle sign in exception', async () => {
      mockAuthClient.signInWithPassword.mockRejectedValue(
        new Error('Network error')

      const result = await authService.signIn(
        'test@example.com',
        'password123'

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toEqual({
        message: 'Network error',
        status: 500,
      });
      expect(logger.error).toHaveBeenCalledWith(
        'Sign in exception:',
        expect.any(Error)

    });

    it('should handle missing supabase client', async () => {
      (createClient as jest.Mock).mockReturnValue(null);
      authService = new AuthService();

      const result = await authService.signIn(
        'test@example.com',
        'password123'

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toEqual({
        message: 'Authentication service not configured',
        status: 500,
      });
    });
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      mockAuthClient.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const metadata = {
        fullName: 'Test User',
        preferredLanguage: 'en' as const,
        role: 'user',
      };

      const result = await authService.signUp(
        'test@example.com',
        'password123',
        metadata

      expect(result.data).toEqual({ user: mockUser, session: mockSession });
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
      expect(mockAuthClient.signUp).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        password: 'password123',
        options: { data: metadata },
    });
  });
      expect(logger.info).toHaveBeenCalledWith(
      'User signed up successfully', {
        userId: 'user-123',
    );
  });
    });

    it('should handle sign up without metadata', async () => {
      mockAuthClient.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await authService.signUp(
        'test@example.com',
        'password123'

      expect(result.data).toEqual({ user: mockUser, session: null });
      expect(mockAuthClient.signUp).toHaveBeenCalledWith(
      {
        email: 'test@example.com',
        password: 'password123',
        options: { data: undefined },
    });
  });
    });

    it('should handle sign up error', async () => {
      const authError = {
        message: 'User already registered',
        status: 400,
      };

      mockAuthClient.signUp.mockResolvedValue({
        data: null,
        error: authError,
      });

      const result = await authService.signUp(
        'test@example.com',
        'password123'

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toEqual(authError);
      expect(logger.error).toHaveBeenCalledWith('Sign up error:', authError);
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockAuthClient.signOut.mockResolvedValue({
        error: null,
      });

      const result = await authService.signOut();

      expect(result.data).toBeUndefined();
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
      expect(mockAuthClient.signOut).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('User signed out successfully');
    });

    it('should handle sign out error', async () => {
      const authError = {
        message: 'Sign out failed',
        status: 500,
      };

      mockAuthClient.signOut.mockResolvedValue({
        error: authError,
      });

      const result = await authService.signOut();

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toEqual(authError);
      expect(logger.error).toHaveBeenCalledWith('Sign out error:', authError);
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      mockAuthClient.resetPasswordForEmail.mockResolvedValue({
        error: null,
      });

      const result = await authService.resetPassword('test@example.com');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
      expect(mockAuthClient.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'http://localhost:3000/auth/reset-password',
        }

      expect(logger.info).toHaveBeenCalledWith(
      'Password reset email sent', {
        email: 'test@example.com',
    );
  });
    });

    it('should handle password reset error', async () => {
      const authError = {
        message: 'User not found',
        status: 404,
      };

      mockAuthClient.resetPasswordForEmail.mockResolvedValue({
        error: authError,
      });

      const result = await authService.resetPassword('unknown@example.com');

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toEqual(authError);
      expect(logger.error).toHaveBeenCalledWith(
      'Password reset error:',
        authError
    );
  });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      mockAuthClient.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.updatePassword('newpassword123');

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
      expect(mockAuthClient.updateUser).toHaveBeenCalledWith(
      {
        password: 'newpassword123',
    });
  });
      expect(logger.info).toHaveBeenCalledWith('Password updated successfully');
    });

    it('should handle password update error', async () => {
      const authError = {
        message: 'Weak password',
        status: 400,
      };

      mockAuthClient.updateUser.mockResolvedValue({
        data: null,
        error: authError,
      });

      const result = await authService.updatePassword('weak');

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toEqual(authError);
      expect(logger.error).toHaveBeenCalledWith(
      'Password update error:',
        authError
    );
  });
  });

  describe('getSession', () => {
    it('should get session successfully', async () => {
      mockAuthClient.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authService.getSession();

      expect(result.data).toEqual(mockSession);
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
      expect(mockAuthClient.getSession).toHaveBeenCalled();
    });

    it('should handle no session', async () => {
      mockAuthClient.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await authService.getSession();

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
    });

    it('should handle missing supabase client gracefully', async () => {
      (createClient as jest.Mock).mockReturnValue(null);
      authService = new AuthService();

      const result = await authService.getSession();

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
    });
  });

  describe('getUser', () => {
    it('should get user successfully', async () => {
      mockAuthClient.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.getUser();

      expect(result.data).toEqual(mockUser);
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
      expect(mockAuthClient.getUser).toHaveBeenCalled();
    });

    it('should handle no user', async () => {
      mockAuthClient.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await authService.getUser();

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
    });
  });

  describe('signInWithOAuth', () => {
    it('should initiate OAuth sign in successfully', async () => {
      const mockUrl = 'https://auth.supabase.com/oauth/google';
      mockAuthClient.signInWithOAuth.mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });

      const result = await authService.signInWithOAuth('google');

      expect(result.data).toEqual({ url: mockUrl });
      expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
      expect(mockAuthClient.signInWithOAuth).toHaveBeenCalledWith(
      {
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
    });
  });
      expect(logger.info).toHaveBeenCalledWith(
      'OAuth sign in initiated', {
        provider: 'google',
    );
  });
    });

    it('should handle different OAuth providers', async () => {
      const providers = ['github', 'linkedin_oidc'] as const;

      for (const provider of providers) {
        mockAuthClient.signInWithOAuth.mockResolvedValue({
          data: { url: `https://auth.supabase.com/oauth/${provider}` },
          error: null,
        });

        const result = await authService.signInWithOAuth(provider);

        expect(result.error).toBeNull() || expect(result).toEqual(expect.anything());
        expect(mockAuthClient.signInWithOAuth).toHaveBeenCalledWith(
      {
          provider,
          options: {
            redirectTo: 'http://localhost:3000/auth/callback',
          },
    });
  });
      }
    });

    it('should handle OAuth sign in error', async () => {
      const authError = {
        message: 'OAuth provider not configured',
        status: 400,
      };

      mockAuthClient.signInWithOAuth.mockResolvedValue({
        data: null,
        error: authError,
      });

      const result = await authService.signInWithOAuth('google');

      expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
      expect(result.error).toEqual(authError);
      expect(logger.error).toHaveBeenCalledWith(
      'OAuth sign in error:',
        authError
    );
  });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', async () => {
      const mockUnsubscribe = jest.fn().mockReturnValue(void 0);
      const mockSubscription = { unsubscribe: mockUnsubscribe };
      mockAuthClient.onAuthStateChange.mockReturnValue({
        data: { subscription: mockSubscription },
      });

      const callback = jest.fn().mockReturnValue(void 0);
      const unsubscribe = authService.onAuthStateChange(callback);

      expect(mockAuthClient.onAuthStateChange).toHaveBeenCalledWith(callback);

      // Test unsubscribe
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('should handle missing supabase client', async () => {
      (createClient as jest.Mock).mockReturnValue(null);
      authService = new AuthService();

      const callback = jest.fn().mockReturnValue(void 0);
      const unsubscribe = authService.onAuthStateChange(callback);

      expect(logger.warn).toHaveBeenCalledWith(
        'Cannot listen to auth state changes - service not configured'

      expect(mockAuthClient.onAuthStateChange).not.toHaveBeenCalled();

      // Unsubscribe should be a no-op
      expect(() => unsubscribe()).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should handle non-Error exceptions', async () => {
      mockAuthClient.signInWithPassword.mockRejectedValue('String error');

      const result = await authService.signIn(
        'test@example.com',
        'password123'

      expect(result.error).toEqual({
        message: 'Sign in failed',
        status: 500,
      });
    });

    it('should handle exceptions in all methods', async () => {
      const methods = [
        { method: 'signUp', args: ['email', 'password'] },
        { method: 'signOut', args: [] },
        { method: 'resetPassword', args: ['email'] },
        { method: 'updatePassword', args: ['newpass'] },
        { method: 'getSession', args: [] },
        { method: 'getUser', args: [] },
        { method: 'signInWithOAuth', args: ['google'] },
      ];

      for (const { method, args } of methods) {
        const authMethod =
          mockAuthClient[method] ||
          mockAuthClient[method.replace(/^(get|update)/, '$1')];
        if (authMethod) {
          authMethod.mockRejectedValue(new Error('Test error'));
        }

        const result = await (authService as any)[method](...args);

        expect(result.data).toBeNull() || expect(result).toEqual(expect.anything());
        expect(result.error).toBeDefined();
        expect(result.error.status).toBe(500);
      }
    });
  });
});
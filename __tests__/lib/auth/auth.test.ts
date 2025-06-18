import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { createClient } from '@supabase/supabase-js';
import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  updatePassword,
  updateEmail,
  verifyOtp,
  resendOtp,
  getUser,
  getSession,
  refreshSession,
  onAuthStateChange,
  exchangeCodeForSession,
  signInWithProvider,
} from '@/lib/auth/auth';

// Mock Supabase
jest.mock('@supabase/supabase-js');

// Mock environment variables
const mockEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
};

describe('Auth Service', () => {
  let mockSupabaseClient: any;
  let mockAuth: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset environment variables
    process.env = { ...mockEnv };

    // Setup mock auth methods
    mockAuth = {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      verifyOtp: jest.fn(),
      resend: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
      onAuthStateChange: jest.fn(),
      exchangeCodeForSession: jest.fn(),
      signInWithOAuth: jest.fn(),
    };

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: mockAuth,
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('initialization', () => {
    it('should create Supabase client with environment variables', () => {
      signIn('test@example.com', 'password');

      expect(createClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'

    });

    it('should throw error when environment variables are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      await expect(signIn('test@example.com', 'password')).rejects.toThrow(
        'Authentication service not configured'

    });
  });

  describe('signIn', () => {
    it('should sign in with email and password', async () => {
      const mockResponse = {
        data: {
          user: { id: 'user-123', email: 'test@example.com' },
          session: { access_token: 'token-123' },
        },
        error: null,
      };

      mockAuth.signInWithPassword.mockResolvedValue(mockResponse);

      const result = await signIn('test@example.com', 'password123');

      expect(result).toEqual(mockResponse);
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle sign in errors', async () => {
      const mockError = {
        data: { user: null, session: null },
        error: { message: 'Invalid credentials', status: 400 },
      };

      mockAuth.signInWithPassword.mockResolvedValue(mockError);

      const result = await signIn('test@example.com', 'wrong-password');

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Invalid credentials');
    });
  });

  describe('signUp', () => {
    it('should sign up new user', async () => {
      const mockResponse = {
        data: {
          user: { id: 'user-123', email: 'new@example.com' },
          session: null, // Email confirmation required
        },
        error: null,
      };

      mockAuth.signUp.mockResolvedValue(mockResponse);

      const result = await signUp('new@example.com', 'password123', {
        name: 'Test User',
      });

      expect(result).toEqual(mockResponse);
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: { name: 'Test User' },
        },
      });
    });

    it('should handle email already registered', async () => {
      const mockError = {
        data: { user: null, session: null },
        error: { message: 'User already registered', status: 400 },
      };

      mockAuth.signUp.mockResolvedValue(mockError);

      const result = await signUp('existing@example.com', 'password123');

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('already registered');
    });
  });

  describe('signOut', () => {
    it('should sign out user', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const result = await signOut();

      expect(result).toEqual({ error: null });
      expect(mockAuth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      const mockError = { error: { message: 'Network error' } };
      mockAuth.signOut.mockResolvedValue(mockError);

      const result = await signOut();

      expect(result.error).toBeDefined();
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await resetPassword('test@example.com');

      expect(result.error).toBeNull();
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }

    });

    it('should handle invalid email', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'Invalid email' },
      });

      const result = await resetPassword('invalid-email');

      expect(result.error).toBeDefined();
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      mockAuth.updateUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const result = await updatePassword('newPassword123');

      expect(result.error).toBeNull();
      expect(mockAuth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123',
      });
    });

    it('should handle weak password', async () => {
      mockAuth.updateUser.mockResolvedValue({
        data: null,
        error: { message: 'Password should be at least 6 characters' },
      });

      const result = await updatePassword('weak');

      expect(result.error?.message).toContain('at least 6 characters');
    });
  });

  describe('updateEmail', () => {
    it('should update user email', async () => {
      mockAuth.updateUser.mockResolvedValue({
        data: { user: { email: 'new@example.com' } },
        error: null,
      });

      const result = await updateEmail('new@example.com');

      expect(result.error).toBeNull();
      expect(mockAuth.updateUser).toHaveBeenCalledWith({
        email: 'new@example.com',
      });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP for email', async () => {
      mockAuth.verifyOtp.mockResolvedValue({
        data: { user: { id: 'user-123' }, session: {} },
        error: null,
      });

      const result = await verifyOtp({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      });

      expect(result.error).toBeNull();
      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        email: 'test@example.com',
        token: '123456',
        type: 'email',
      });
    });

    it('should verify OTP for phone', async () => {
      mockAuth.verifyOtp.mockResolvedValue({
        data: { user: { id: 'user-123' }, session: {} },
        error: null,
      });

      const result = await verifyOtp({
        phone: '+1234567890',
        token: '123456',
        type: 'sms',
      });

      expect(result.error).toBeNull();
      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        phone: '+1234567890',
        token: '123456',
        type: 'sms',
      });
    });
  });

  describe('resendOtp', () => {
    it('should resend OTP', async () => {
      mockAuth.resend.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await resendOtp({
        type: 'signup',
        email: 'test@example.com',
      });

      expect(result.error).toBeNull();
      expect(mockAuth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com',
      });
    });
  });

  describe('getUser', () => {
    it('should get current user', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockAuth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getUser();

      expect(result).toEqual(mockUser);
      expect(mockAuth.getUser).toHaveBeenCalled();
    });

    it('should return null when not authenticated', async () => {
      mockAuth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUser();

      expect(result).toBeNull();
    });
  });

  describe('getSession', () => {
    it('should get current session', async () => {
      const mockSession = { access_token: 'token-123' };
      mockAuth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getSession();

      expect(result).toEqual(mockSession);
    });
  });

  describe('refreshSession', () => {
    it('should refresh session', async () => {
      const mockSession = { access_token: 'new-token-123' };
      mockAuth.refreshSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await refreshSession();

      expect(result).toEqual({
        data: { session: mockSession },
        error: null,
      });
    });
  });

  describe('onAuthStateChange', () => {
    it('should subscribe to auth state changes', () => {
      const mockUnsubscribe = jest.fn();
      const mockCallback = jest.fn();

      mockAuth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: mockUnsubscribe } },
      });

      const { data } = onAuthStateChange(mockCallback);

      expect(mockAuth.onAuthStateChange).toHaveBeenCalledWith(mockCallback);
      expect(data?.subscription.unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('exchangeCodeForSession', () => {
    it('should exchange code for session', async () => {
      const mockSession = { access_token: 'token-123' };
      mockAuth.exchangeCodeForSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await exchangeCodeForSession('auth-code-123');

      expect(result).toEqual({
        data: { session: mockSession },
        error: null,
      });
      expect(mockAuth.exchangeCodeForSession).toHaveBeenCalledWith(
        'auth-code-123'

    });
  });

  describe('signInWithProvider', () => {
    it('should sign in with OAuth provider', async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://github.com/oauth/authorize' },
        error: null,
      });

      const result = await signInWithProvider('github', {
        redirectTo: 'http://localhost:3000/auth/callback',
      });

      expect(result.error).toBeNull();
      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
    });

    it('should handle provider errors', async () => {
      mockAuth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'Provider not configured' },
      });

      const result = await signInWithProvider('invalid-provider');

      expect(result.error).toBeDefined();
    });
  });
});

/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '@/app/auth/callback/route';
import { createSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/utils/logger');

const mockCreateSupabaseClient = jest.mocked(createSupabaseClient);
const mockLogger = jest.mocked(logger);

describe('Auth Callback Route', () => {
  let mockSupabase: any;
  let mockAuth: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup auth mock
    mockAuth = {
      exchangeCodeForSession: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
    };

    // Setup Supabase mock
    mockSupabase = {
      auth: mockAuth,
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      upsert: jest.fn().mockReturnThis(),
    };

    mockCreateSupabaseClient.mockResolvedValue(mockSupabase);

    // Mock logger
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.warn = jest.fn();
  });

  const createMockRequest = (url: string) => {
    return new NextRequest(url);
  };

  describe('OAuth Callback Handling', () => {
    it('should handle successful OAuth callback with code', async () => {
      const code = 'oauth_code_123';
      const request = createMockRequest(
        `https://example.com/auth/callback?code=${code}`
      );

      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        app_metadata: { provider: 'github' },
        user_metadata: {
          full_name: 'Test User',
          avatar_url: 'https://github.com/avatar.png',
        },
      };

      const mockSession = {
        user: mockUser,
        access_token: 'access_123',
        refresh_token: 'refresh_123',
      };

      mockAuth.exchangeCodeForSession.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock user profile check
      mockSupabase.single.mockResolvedValueOnce({
        data: null, // New user
        error: { code: 'PGRST116' }, // Not found
      });

      // Mock user profile creation
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123' },
        error: null,
      });

      const response = await GET(request);

      expect(mockAuth.exchangeCodeForSession).toHaveBeenCalledWith(code);

      // Should create user profile for new OAuth user
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        id: 'user_123',
        email: 'test@example.com',
        full_name: 'Test User',
        avatar_url: 'https://github.com/avatar.png',
        subscription_plan: 'free',
        ai_credits: 3,
      });

      expect(response.status).toBe(302); // Redirect
      expect(response.headers.get('Location')).toBe('/dashboard');

      expect(mockLogger.info).toHaveBeenCalledWith(
        'OAuth callback successful',
        {
          userId: 'user_123',
          provider: 'github',
        }
      );
    });

    it('should handle OAuth callback for existing user', async () => {
      const code = 'oauth_code_123';
      const request = createMockRequest(
        `https://example.com/auth/callback?code=${code}`
      );

      const mockUser = {
        id: 'user_123',
        email: 'existing@example.com',
        app_metadata: { provider: 'linkedin' },
      };

      mockAuth.exchangeCodeForSession.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      // Mock existing user profile
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'user_123',
          email: 'existing@example.com',
          last_sign_in_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

      // Mock profile update
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123' },
        error: null,
      });

      const response = await GET(request);

      // Should update last sign in
      expect(mockSupabase.update).toHaveBeenCalledWith({
        last_sign_in_at: expect.any(String),
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/dashboard');
    });

    it('should handle OAuth error callback', async () => {
      const request = createMockRequest(
        'https://example.com/auth/callback?error=access_denied&error_description=User+denied+access'
      );

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        '/login?error=access_denied&message=User+denied+access'
      );

      expect(mockLogger.error).toHaveBeenCalledWith('OAuth callback error', {
        error: 'access_denied',
        description: 'User denied access',
      });
    });

    it('should handle missing code parameter', async () => {
      const request = createMockRequest('https://example.com/auth/callback');

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        '/login?error=invalid_request&message=No+authorization+code+provided'
      );

      expect(mockLogger.error).toHaveBeenCalledWith('OAuth callback error', {
        error: 'missing_code',
      });
    });

    it('should handle code exchange failure', async () => {
      const code = 'invalid_code';
      const request = createMockRequest(
        `https://example.com/auth/callback?code=${code}`
      );

      mockAuth.exchangeCodeForSession.mockResolvedValue({
        data: { user: null, session: null },
        error: {
          message: 'Invalid authorization code',
          status: 400,
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        '/login?error=auth_failed&message=Invalid+authorization+code'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to exchange code for session',
        {
          error: 'Invalid authorization code',
        }
      );
    });
  });

  describe('Email Confirmation Callback', () => {
    it('should handle email confirmation token', async () => {
      const token = 'email_token_123';
      const type = 'signup';
      const request = createMockRequest(
        `https://example.com/auth/callback?token_hash=${token}&type=${type}`
      );

      const mockUser = {
        id: 'user_123',
        email: 'verified@example.com',
        email_confirmed_at: '2024-01-01T00:00:00Z',
      };

      mockAuth.verifyOtp = jest.fn().mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      // Mock user profile check
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123' },
        error: null,
      });

      // Mock email verification update
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'user_123' },
        error: null,
      });

      const response = await GET(request);

      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        token_hash: token,
        type: 'signup',
      });

      expect(mockSupabase.update).toHaveBeenCalledWith({
        email_verified: true,
        email_verified_at: expect.any(String),
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/dashboard?verified=true');

      expect(mockLogger.info).toHaveBeenCalledWith('Email verified', {
        userId: 'user_123',
      });
    });

    it('should handle invalid email confirmation token', async () => {
      const token = 'invalid_token';
      const type = 'signup';
      const request = createMockRequest(
        `https://example.com/auth/callback?token_hash=${token}&type=${type}`
      );

      mockAuth.verifyOtp = jest.fn().mockResolvedValue({
        data: { user: null },
        error: {
          message: 'Invalid or expired token',
          status: 400,
        },
      });

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        '/login?error=invalid_token&message=Invalid+or+expired+token'
      );
    });
  });

  describe('Password Reset Callback', () => {
    it('should handle password reset token', async () => {
      const token = 'reset_token_123';
      const type = 'recovery';
      const request = createMockRequest(
        `https://example.com/auth/callback?token_hash=${token}&type=${type}`
      );

      const mockUser = {
        id: 'user_123',
        email: 'reset@example.com',
      };

      mockAuth.verifyOtp = jest.fn().mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null,
      });

      const response = await GET(request);

      expect(mockAuth.verifyOtp).toHaveBeenCalledWith({
        token_hash: token,
        type: 'recovery',
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        '/auth/reset-password?token=valid'
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Password reset token verified',
        {
          userId: 'user_123',
        }
      );
    });
  });

  describe('Redirect Handling', () => {
    it('should respect next parameter for redirect', async () => {
      const code = 'oauth_code_123';
      const next = '/portfolio/edit';
      const request = createMockRequest(
        `https://example.com/auth/callback?code=${code}&next=${encodeURIComponent(
          next
        )}`
      );

      mockAuth.exchangeCodeForSession.mockResolvedValue({
        data: { user: { id: 'user_123' }, session: {} },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'user_123' },
        error: null,
      });

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(next);
    });

    it('should sanitize redirect URLs', async () => {
      const code = 'oauth_code_123';
      const maliciousNext = 'https://evil.com/phishing';
      const request = createMockRequest(
        `https://example.com/auth/callback?code=${code}&next=${encodeURIComponent(
          maliciousNext
        )}`
      );

      mockAuth.exchangeCodeForSession.mockResolvedValue({
        data: { user: { id: 'user_123' }, session: {} },
        error: null,
      });

      mockSupabase.single.mockResolvedValue({
        data: { id: 'user_123' },
        error: null,
      });

      const response = await GET(request);

      // Should redirect to default dashboard, not external URL
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/dashboard');

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Blocked external redirect attempt',
        {
          attemptedUrl: maliciousNext,
        }
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors during profile creation', async () => {
      const code = 'oauth_code_123';
      const request = createMockRequest(
        `https://example.com/auth/callback?code=${code}`
      );

      mockAuth.exchangeCodeForSession.mockResolvedValue({
        data: { user: { id: 'user_123' }, session: {} },
        error: null,
      });

      // Mock profile creation failure
      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: { code: 'PGRST116' },
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: null,
        error: {
          code: '23505',
          message: 'Duplicate key violation',
        },
      });

      const response = await GET(request);

      // Should still redirect to dashboard despite profile creation error
      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe('/dashboard');

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create user profile',
        expect.any(Object)
      );
    });

    it('should handle unexpected errors gracefully', async () => {
      const request = createMockRequest(
        'https://example.com/auth/callback?code=test'
      );

      mockAuth.exchangeCodeForSession.mockRejectedValue(
        new Error('Unexpected error')
      );

      const response = await GET(request);

      expect(response.status).toBe(302);
      expect(response.headers.get('Location')).toBe(
        '/login?error=server_error&message=An+unexpected+error+occurred'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Unexpected error in auth callback',
        expect.any(Error)
      );
    });
  });

  // describe('Session Management', () => {
  //   it('should set secure session cookies', async () => {
  //     const code = 'oauth_code_123';
  //     const request = createMockRequest(
  //       `https://example.com/auth/callback?code=${code}`
  //     );

  //     const mockSession = {
  //       access_token: 'access_123',
  //       refresh_token: 'refresh_123',
  //       expires_in: 3600,
  //       user: { id: 'user_123' },
  //     };

  //     mockAuth.exchangeCodeForSession.mockResolvedValue({
  //       data: { user: { id: 'user_123' }, session: mockSession },
  //       error: null,
  //     });

  //     mockSupabase.single.mockResolvedValue({
  //       data: { id: 'user_123' },
  //       error: null,
  //     });

  //     // Mock cookie setting
  //     const mockCookieStore = {
  //       set: jest.fn(),
  //     };
  //     jest.mocked(cookies).mockReturnValue(mockCookieStore as any);

  //     await GET(request);

  //     // Verify secure cookie settings
  //     expect(mockCookieStore.set).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         name: expect.stringContaining('auth-token'),
  //         value: expect.any(String),
  //         httpOnly: true,
  //         secure: true,
  //         sameSite: 'lax',
  //         path: '/',
  //       })
  //     );
  //   });
  // });
});

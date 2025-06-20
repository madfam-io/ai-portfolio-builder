import { AuthService } from '@/lib/services/auth/auth-service';
import { createClient } from '@/lib/supabase/client';
import { AppError } from '@/types/errors';
import { User, Session } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@/lib/supabase/client');
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/services/encryption-service', () => ({
  encryptUserData: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  decryptUserData: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  findUserByEmail: jest.fn().mockResolvedValue(null),
}));

describe('AuthService - Comprehensive Tests', () => {
  let authService: AuthService;
  let mockSupabase: any;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {
      full_name: 'John Doe',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    aud: 'authenticated',
    created_at: '2024-01-01T00:00:00.000Z',
  } as User;

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: mockUser,
  } as Session;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn(),
        getSession: jest.fn(),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        signInWithOAuth: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
        exchangeCodeForSession: jest.fn(),
        refreshSession: jest.fn(),
        onAuthStateChange: jest.fn(),
        setSession: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      })),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    authService = new AuthService();
  });

  describe('User Authentication', () => {
    describe('signIn', () => {
      it('should sign in user with valid credentials', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        const result = await authService.signIn('test@example.com', 'password123');

        expect(result).toEqual({
          data: { user: mockUser, session: mockSession },
          error: null,
        });
        expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      it('should handle invalid credentials', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', status: 400 },
        });

        const result = await authService.signIn('test@example.com', 'wrongpassword');

        expect(result.error).toEqual({
          message: 'Invalid login credentials',
          status: 400,
        });
        expect(result.data).toBeNull();
      });

      it('should handle rate limiting', async () => {
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Too many requests', status: 429 },
        });

        const result = await authService.signIn('test@example.com', 'password123');

        expect(result.error?.status).toBe(429);
      });

      it('should validate email format', async () => {
        const result = await authService.signIn('invalid-email', 'password123');

        expect(result.error?.message).toContain('email');
        expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
      });

      it('should validate password requirements', async () => {
        const result = await authService.signIn('test@example.com', 'short');

        expect(result.error?.message).toContain('password');
        expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
      });
    });

    describe('signUp', () => {
      it('should create new user account', async () => {
        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        const metadata = {
          full_name: 'John Doe',
          phone: '+1234567890',
          language: 'en',
        };

        const result = await authService.signUp('test@example.com', 'StrongPass123!', metadata);

        expect(result).toEqual({
          data: { user: mockUser, session: mockSession },
          error: null,
        });
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'StrongPass123!',
          options: {
            data: metadata,
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
          },
        });
      });

      it('should handle duplicate email', async () => {
        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'User already registered', status: 400 },
        });

        const result = await authService.signUp('existing@example.com', 'StrongPass123!');

        expect(result.error?.message).toContain('already registered');
      });

      it('should validate password strength', async () => {
        const weakPasswords = [
          'password',     // Too common
          'abcdefgh',     // No numbers or special chars
          '12345678',     // No letters
          'Pass123',      // Too short
          'password123',  // No special chars
        ];

        for (const password of weakPasswords) {
          const result = await authService.signUp('test@example.com', password);
          expect(result.error?.message).toContain('password');
          expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
        }
      });

      it('should create user profile after signup', async () => {
        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        const fromMock = jest.fn(() => ({
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: {}, error: null }),
        }));
        mockSupabase.from = fromMock;

        await authService.signUp('test@example.com', 'StrongPass123!', {
          full_name: 'John Doe',
        });

        expect(fromMock).toHaveBeenCalledWith('users');
      });
    });

    describe('signOut', () => {
      it('should sign out user successfully', async () => {
        mockSupabase.auth.signOut.mockResolvedValue({ error: null });

        const result = await authService.signOut();

        expect(result).toEqual({ error: null });
        expect(mockSupabase.auth.signOut).toHaveBeenCalled();
      });

      it('should handle sign out errors', async () => {
        mockSupabase.auth.signOut.mockResolvedValue({
          error: { message: 'Failed to sign out', status: 500 },
        });

        const result = await authService.signOut();

        expect(result.error?.message).toContain('Failed to sign out');
      });
    });
  });

  describe('OAuth Authentication', () => {
    describe('signInWithOAuth', () => {
      it('should initiate OAuth flow for supported providers', async () => {
        const providers = ['google', 'github', 'linkedin_oidc'] as const;

        for (const provider of providers) {
          mockSupabase.auth.signInWithOAuth.mockResolvedValue({
            data: { url: `https://auth.provider.com/${provider}`, provider },
            error: null,
          });

          const result = await authService.signInWithOAuth(provider);

          expect(result.data?.provider).toBe(provider);
          expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
            provider,
            options: {
              redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
              scopes: expect.any(String),
            },
          });
        }
      });

      it('should include appropriate scopes for each provider', async () => {
        await authService.signInWithOAuth('github');
        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            options: expect.objectContaining({
              scopes: 'read:user user:email',
            }),
          })
        );

        await authService.signInWithOAuth('linkedin_oidc');
        expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith(
          expect.objectContaining({
            options: expect.objectContaining({
              scopes: 'profile email openid',
            }),
          })
        );
      });

      it('should handle OAuth errors', async () => {
        mockSupabase.auth.signInWithOAuth.mockResolvedValue({
          data: null,
          error: { message: 'OAuth provider error', status: 400 },
        });

        const result = await authService.signInWithOAuth('google');

        expect(result.error?.message).toContain('OAuth provider error');
      });
    });

    describe('exchangeCodeForSession', () => {
      it('should exchange OAuth code for session', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
          data: { user: mockUser, session: mockSession },
          error: null,
        });

        const result = await authService.exchangeCodeForSession('oauth-code-123');

        expect(result).toEqual({
          data: { user: mockUser, session: mockSession },
          error: null,
        });
      });

      it('should handle invalid OAuth codes', async () => {
        mockSupabase.auth.exchangeCodeForSession.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Invalid authorization code', status: 400 },
        });

        const result = await authService.exchangeCodeForSession('invalid-code');

        expect(result.error?.message).toContain('Invalid authorization code');
      });
    });
  });

  describe('Session Management', () => {
    describe('getSession', () => {
      it('should get current session', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await authService.getSession();

        expect(result).toEqual({
          data: { session: mockSession },
          error: null,
        });
      });

      it('should handle no active session', async () => {
        mockSupabase.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const result = await authService.getSession();

        expect(result.data.session).toBeNull();
      });
    });

    describe('refreshSession', () => {
      it('should refresh expired session', async () => {
        const newSession = { ...mockSession, access_token: 'new-token' };
        mockSupabase.auth.refreshSession.mockResolvedValue({
          data: { user: mockUser, session: newSession },
          error: null,
        });

        const result = await authService.refreshSession();

        expect(result.data?.session).toEqual(newSession);
      });

      it('should handle refresh token expiry', async () => {
        mockSupabase.auth.refreshSession.mockResolvedValue({
          data: { user: null, session: null },
          error: { message: 'Refresh token expired', status: 401 },
        });

        const result = await authService.refreshSession();

        expect(result.error?.status).toBe(401);
      });
    });
  });

  describe('User Management', () => {
    describe('getUser', () => {
      it('should get current user', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const result = await authService.getUser();

        expect(result).toEqual({
          data: { user: mockUser },
          error: null,
        });
      });

      it('should handle unauthenticated state', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: { message: 'User not authenticated', status: 401 },
        });

        const result = await authService.getUser();

        expect(result.error?.status).toBe(401);
      });
    });

    describe('updateUser', () => {
      it('should update user metadata', async () => {
        const updates = {
          data: {
            full_name: 'Jane Doe',
            avatar_url: 'https://example.com/new-avatar.jpg',
          },
        };

        mockSupabase.auth.updateUser.mockResolvedValue({
          data: { user: { ...mockUser, user_metadata: updates.data } },
          error: null,
        });

        const result = await authService.updateUser(updates);

        expect(result.data?.user?.user_metadata).toMatchObject(updates.data);
      });

      it('should update password', async () => {
        mockSupabase.auth.updateUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const result = await authService.updateUser({ password: 'NewStrongPass123!' });

        expect(result.error).toBeNull();
        expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
          password: 'NewStrongPass123!',
        });
      });

      it('should validate new password strength', async () => {
        const result = await authService.updateUser({ password: 'weak' });

        expect(result.error?.message).toContain('password');
        expect(mockSupabase.auth.updateUser).not.toHaveBeenCalled();
      });
    });

    describe('resetPasswordForEmail', () => {
      it('should send password reset email', async () => {
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
          data: {},
          error: null,
        });

        const result = await authService.resetPasswordForEmail('test@example.com');

        expect(result.error).toBeNull();
        expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
          'test@example.com',
          {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
          }
        );
      });

      it('should handle invalid email', async () => {
        const result = await authService.resetPasswordForEmail('invalid-email');

        expect(result.error?.message).toContain('email');
        expect(mockSupabase.auth.resetPasswordForEmail).not.toHaveBeenCalled();
      });

      it('should handle non-existent user', async () => {
        mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
          data: {},
          error: null, // Supabase returns success even for non-existent emails for security
        });

        const result = await authService.resetPasswordForEmail('nonexistent@example.com');

        expect(result.error).toBeNull(); // Should not reveal if email exists
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Network error'));

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.error?.message).toContain('Network error');
    });

    it('should handle unexpected errors gracefully', async () => {
      mockSupabase.auth.getUser.mockRejectedValue(new Error('Unexpected error'));

      const result = await authService.getUser();

      expect(result.error).toBeDefined();
      expect(result.data).toEqual({ user: null });
    });
  });

  describe('Validation', () => {
    describe('validateEmail', () => {
      it('should validate email formats', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'first+last@company.io',
        ];

        const invalidEmails = [
          'invalid',
          '@example.com',
          'test@',
          'test@.com',
          'test..name@example.com',
        ];

        validEmails.forEach(email => {
          expect(authService.validateEmail(email)).toBe(true);
        });

        invalidEmails.forEach(email => {
          expect(authService.validateEmail(email)).toBe(false);
        });
      });
    });

    describe('validatePassword', () => {
      it('should validate password strength', () => {
        const validPasswords = [
          'StrongPass123!',
          'MyP@ssw0rd2024',
          'Secure#Pass99',
        ];

        const invalidPasswords = [
          'weak',           // Too short
          'password123',    // No special chars
          'PASSWORD123!',   // No lowercase
          'password!@#',    // No numbers
          'Pass123',        // Too short, no special
        ];

        validPasswords.forEach(password => {
          expect(authService.validatePassword(password)).toBe(true);
        });

        invalidPasswords.forEach(password => {
          expect(authService.validatePassword(password)).toBe(false);
        });
      });
    });
  });
});
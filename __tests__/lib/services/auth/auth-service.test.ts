import { AuthService } from '@/lib/services/auth/auth-service';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: {
        signUp: jest.fn(),
        signInWithPassword: jest.fn(),
        signInWithOAuth: jest.fn(),
        signOut: jest.fn(),
        getUser: jest.fn(),
        getSession: jest.fn(),
        resetPasswordForEmail: jest.fn(),
        updateUser: jest.fn(),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
      },
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    authService = new AuthService();
  });

  describe('Sign Up', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: null },
        error: null,
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        name: 'Test User',
      });

      expect(result.success).toBe(true);
      expect(result.data?.user).toEqual(mockUser);
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'SecurePassword123!',
        options: {
          data: { name: 'Test User' },
        },
      });
    });

    it('should handle sign up errors', async () => {
      mockSupabaseClient.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already exists', code: 'user_exists' },
      });

      const result = await authService.signUp({
        email: 'existing@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('User already exists');
    });

    it('should validate email format', async () => {
      const result = await authService.signUp({
        email: 'invalid-email',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email');
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it('should validate password strength', async () => {
      const result = await authService.signUp({
        email: 'test@example.com',
        password: '123', // Too weak
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Password must be');
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });
  });

  describe('Sign In', () => {
    it('should successfully sign in a user', async () => {
      const mockSession = {
        user: { id: 'user-123', email: 'test@example.com' },
        access_token: 'token-123',
        refresh_token: 'refresh-123',
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockSession.user, session: mockSession },
        error: null,
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(true);
      expect(result.data?.session).toEqual(mockSession);
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
    });

    it('should handle invalid credentials', async () => {
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials', code: 'invalid_credentials' },
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'WrongPassword',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid login credentials');
    });
  });

  describe('OAuth Sign In', () => {
    it('should initiate OAuth sign in with GitHub', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://github.com/oauth/authorize?...' },
        error: null,
      });

      const result = await authService.signInWithOAuth('github', {
        redirectTo: 'http://localhost:3000/auth/callback',
      });

      expect(result.success).toBe(true);
      expect(result.data?.url).toContain('github.com');
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'github',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
    });

    it('should initiate OAuth sign in with LinkedIn', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'https://linkedin.com/oauth/authorize?...' },
        error: null,
      });

      const result = await authService.signInWithOAuth('linkedin_oidc');

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'linkedin_oidc',
        options: {},
      });
    });

    it('should handle OAuth errors', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth provider not configured' },
      });

      const result = await authService.signInWithOAuth('google');

      expect(result.success).toBe(false);
      expect(result.error).toContain('OAuth provider not configured');
    });
  });

  describe('Sign Out', () => {
    it('should successfully sign out user', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      });

      const result = await authService.signOut();

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: 'Failed to sign out' },
      });

      const result = await authService.signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to sign out');
    });
  });

  describe('Get Current User', () => {
    it('should return current authenticated user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
    });

    it('should return null when no user is authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const result = await authService.resetPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/auth/reset-password'),
        })
      );
    });

    it('should handle reset password errors', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      });

      const result = await authService.resetPassword('nonexistent@example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
    });
  });

  describe('Update User', () => {
    it('should update user profile', async () => {
      const updatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Updated Name', bio: 'New bio' },
      };

      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: updatedUser },
        error: null,
      });

      const result = await authService.updateUser({
        name: 'Updated Name',
        bio: 'New bio',
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedUser);
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        data: { name: 'Updated Name', bio: 'New bio' },
      });
    });

    it('should update user email', async () => {
      mockSupabaseClient.auth.updateUser.mockResolvedValue({
        data: { user: { email: 'newemail@example.com' } },
        error: null,
      });

      const result = await authService.updateUser({
        email: 'newemail@example.com',
      });

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.auth.updateUser).toHaveBeenCalledWith({
        email: 'newemail@example.com',
      });
    });
  });

  describe('Session Management', () => {
    it('should get current session', async () => {
      const mockSession = {
        access_token: 'token-123',
        refresh_token: 'refresh-123',
        user: { id: 'user-123', email: 'test@example.com' },
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authService.getSession();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSession);
    });

    it('should handle auth state changes', () => {
      const callback = jest.fn();
      const unsubscribe = jest.fn();

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe } },
      });

      const result = authService.onAuthStateChange(callback);

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
      expect(result.unsubscribe).toBe(unsubscribe);
    });
  });

  describe('Validation', () => {
    it('should validate email addresses', () => {
      expect(authService.isValidEmail('test@example.com')).toBe(true);
      expect(authService.isValidEmail('user.name+tag@example.co.uk')).toBe(true);
      expect(authService.isValidEmail('invalid.email')).toBe(false);
      expect(authService.isValidEmail('@example.com')).toBe(false);
      expect(authService.isValidEmail('test@')).toBe(false);
    });

    it('should validate password strength', () => {
      expect(authService.isValidPassword('StrongP@ss123')).toBe(true);
      expect(authService.isValidPassword('weak')).toBe(false);
      expect(authService.isValidPassword('12345678')).toBe(false);
      expect(authService.isValidPassword('NoNumbers!')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockSupabaseClient.auth.signIn.mockRejectedValue(
        new Error('Network error')
      );

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Network error');
    });

    it('should log errors appropriately', async () => {
      const { logger } = require('@/lib/utils/logger');
      
      mockSupabaseClient.auth.signUp.mockRejectedValue(
        new Error('Unexpected error')
      );

      await authService.signUp({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Sign up error'),
        expect.any(Error)
      );
    });
  });
});
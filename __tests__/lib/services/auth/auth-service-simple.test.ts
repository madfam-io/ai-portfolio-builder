import { AuthService } from '@/lib/services/auth/auth-service';
import { createClient } from '@/lib/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/services/encryption-service', () => ({
  encryptUserData: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  decryptUserData: jest.fn().mockImplementation((data) => Promise.resolve(data)),
  findUserByEmail: jest.fn().mockResolvedValue(null),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockSupabase: any;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {
      full_name: 'John Doe',
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
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    authService = new AuthService();
  });

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
  });

  describe('signUp', () => {
    it('should create new user account', async () => {
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const metadata = {
        fullName: 'John Doe',
        preferredLanguage: 'en' as const,
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
        },
      });
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const result = await authService.signOut();

      expect(result).toEqual({ error: null });
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it('should get current session', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await authService.getSession();

      expect(result).toEqual({
        data: mockSession,
        error: null,
      });
    });
  });

  describe('getUser', () => {
    it('should get current user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.getUser();

      expect(result).toEqual({
        data: mockUser,
        error: null,
      });
    });
  });

  describe('signInWithOAuth', () => {
    it('should initiate OAuth flow', async () => {
      const mockUrl = 'https://auth.provider.com/oauth';
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { url: mockUrl },
        error: null,
      });

      const result = await authService.signInWithOAuth('google');

      expect(result.data?.url).toBe(mockUrl);
      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'http://localhost:3000/auth/callback',
        },
      });
    });
  });
});
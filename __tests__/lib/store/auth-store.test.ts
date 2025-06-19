import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/lib/store/auth-store';
import { authService } from '@/lib/services/auth/auth-service';
import { logger } from '@/lib/utils/logger';


// Mock supabase client first
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(),
      getUser: jest.fn(),
    },
  })),
}));

// Mock dependencies
jest.mock('@/lib/services/auth/auth-service');
jest.mock('@/lib/utils/logger');

describe('useAuthStore', () => {
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
    // Reset the store state
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: true,
      isAuthenticated: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user and update isAuthenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to false when user is null', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(null);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setSession', () => {
    it('should set session', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setSession(mockSession);
      });

      expect(result.current.session).toEqual(mockSession);
    });
  });

  describe('setLoading', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');
    });
  });

  describe('signIn', () => {
    it('should sign in user successfully', async () => {
      (authService.signIn as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signIn('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
      'User signed in', {
        userId: 'user-123',
    );
  });
    });

    it('should handle sign in error', async () => {
      const errorMessage = 'Invalid credentials';
      (authService.signIn as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      const { result } = renderHook(() => useAuthStore());

      await expect(
        act(async () => {
          await result.current.signIn('test@example.com', 'wrong-password');
        })
      ).rejects.toThrow(errorMessage);

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(logger.error).toHaveBeenCalledWith(
      'Sign in failed', {
        error: errorMessage,
    );
  });
    });

    it('should handle missing data in response', async () => {
      (authService.signIn as jest.Mock).mockResolvedValue({
        data: null,
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await expect(
        act(async () => {
          await result.current.signIn('test@example.com', 'password123');
        })
      ).rejects.toThrow('Sign in failed');
    });
  });

  describe('signUp', () => {
    it('should sign up user successfully', async () => {
      (authService.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signUp('new@example.com', 'password123', {
          name: 'Test User',
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(logger.info).toHaveBeenCalledWith(
      'User signed up', {
        userId: 'user-123',
    );
  });
    });

    it('should handle sign up error', async () => {
      const errorMessage = 'Email already registered';
      (authService.signUp as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: errorMessage },
      });

      const { result } = renderHook(() => useAuthStore());

      await expect(
        act(async () => {
          await result.current.signUp('existing@example.com', 'password123');
        })
      ).rejects.toThrow(errorMessage);

      expect(result.current.error).toBe(errorMessage);
      expect(logger.error).toHaveBeenCalledWith(
      'Sign up failed', {
        error: errorMessage,
    );
  });
    });

    it('should handle email verification pending', async () => {
      (authService.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: null }, // No session means email verification required
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signUp('new@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(true); // User exists
    });
  });

  describe('signOut', () => {
    it('should sign out user successfully', async () => {
      (authService.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        result.current.setUser(mockUser);
        result.current.setSession(mockSession);
      });

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true); // Reset to initial state
      expect(result.current.error).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('User signed out');
    });

    it('should handle sign out error', async () => {
      const errorMessage = 'Network error';
      (authService.signOut as jest.Mock).mockResolvedValue({
        error: { message: errorMessage },
      });

      const { result } = renderHook(() => useAuthStore());

      await expect(
        act(async () => {
          await result.current.signOut();
        })
      ).rejects.toThrow(errorMessage);

      expect(result.current.error).toBe(errorMessage);
      expect(logger.error).toHaveBeenCalledWith(
      'Sign out failed', {
        error: errorMessage,
    );
  });
    });
  });

  describe('resetAuth', () => {
    it('should reset all auth state to initial values', () => {
      const { result } = renderHook(() => useAuthStore());

      // Set some state
      act(() => {
        result.current.setUser(mockUser);
        result.current.setSession(mockSession);
        result.current.setError('Some error');
        result.current.setLoading(false);
      });

      // Reset
      act(() => {
        result.current.resetAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('initializeAuth', () => {
    it('should initialize auth from existing session', async () => {
      (authService.getSession as jest.Mock).mockResolvedValue({
        data: mockSession,
      });
      (authService.getUser as jest.Mock).mockResolvedValue({
        data: mockUser,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(logger.info).toHaveBeenCalledWith(
      'Auth initialized', {
        userId: 'user-123',
    );
  });
    });

    it('should handle no existing session', async () => {
      (authService.getSession as jest.Mock).mockResolvedValue({
        data: null,
      });
      (authService.getUser as jest.Mock).mockResolvedValue({
        data: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.session).toBeNull();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle initialization error', async () => {
      const error = new Error('Failed to get session');
      (authService.getSession as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.isLoading).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
      'Failed to initialize auth',
        error
    );
  });
  });

  describe('selectors', () => {
    it('should select user', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
    });

    it('should select isAuthenticated', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser(mockUser);
      });

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
    });

    it('should select isLoading', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setLoading(false);
      });

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should select error', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Test error');
      });

      const state = useAuthStore.getState();
      expect(state.error).toBe('Test error');
    });
  });
});

/**
 * Tests for Auth Store
 * Testing Zustand state management for authentication
 */

import { renderHook, act } from '@testing-library/react';

import { useAuthStore } from '@/lib/store/auth-store';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(callback => {
      // Return unsubscribe function
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    }),
  },
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.signOut();
    });

    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Login', () => {
    it('should login successfully', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockSession = { access_token: 'token-123', user: mockUser };

      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should handle login error', async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'wrongpassword');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should set loading state during login', async () => {
      mockSupabase.auth.signInWithPassword.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  data: { user: null, session: null },
                  error: null,
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => useAuthStore());

      expect(result.current.isLoading).toBe(false);

      const loginPromise = act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.isLoading).toBe(true);

      await loginPromise;

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Signup', () => {
    it('should signup successfully', async () => {
      const mockUser = { id: 'user-123', email: 'new@example.com' };
      const mockSession = { access_token: 'token-123', user: mockUser };

      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signup('new@example.com', 'password123', {
          full_name: 'New User',
        });
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: { full_name: 'New User' },
        },
      });
    });

    it('should handle signup error', async () => {
      mockSupabase.auth.signUp.mockResolvedValueOnce({
        data: { user: null, session: null },
        error: { message: 'Email already exists' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.signup('existing@example.com', 'password123');
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('Logout', () => {
    it('should signOut successfully', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'test@example.com',
        } as any);
        result.current.setSession({ access_token: 'token' } as any);
      });

      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle signOut error gracefully', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({
        error: { message: 'Logout failed' },
      });

      const { result } = renderHook(() => useAuthStore());

      // Set initial authenticated state
      act(() => {
        result.current.setUser({
          id: 'user-123',
          email: 'test@example.com',
        } as any);
      });

      await act(async () => {
        await result.current.signOut();
      });

      // Should still clear local state even if API call fails
      expect(result.current.user).toBeNull();
      expect(result.current.session).toBeNull();
    });
  });

  describe('Initialize Auth', () => {
    it('should initialize auth state from existing session', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: mockUser },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.user).toEqual(mockUser);
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    });

    it('should handle initialization error', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: { message: 'Session expired' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.error).toBe('Session expired');
    });
  });

  describe('Error Handling', () => {
    it('should clear error', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setError('Some error');
      });

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading State', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Auth State Persistence', () => {
    it('should persist user preferences', () => {
      const { result } = renderHook(() => useAuthStore());

      const preferences = {
        theme: 'dark',
        language: 'es',
        emailNotifications: true,
      };

      act(() => {
        result.current.updatePreferences(preferences);
      });

      expect(result.current.preferences).toEqual(preferences);
    });

    it('should reset preferences on signOut', async () => {
      mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.updatePreferences({ theme: 'dark' });
      });

      expect(result.current.preferences.theme).toBe('dark');

      await act(async () => {
        await result.current.signOut();
      });

      expect(result.current.preferences).toEqual({});
    });
  });
});

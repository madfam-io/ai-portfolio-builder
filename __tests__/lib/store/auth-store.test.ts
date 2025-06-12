import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/store/auth-store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Authentication', () => {
    it('should set user', () => {
      const { result } = renderHook(() => useAuthStore());
      
      const user = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User'
      };
      
      act(() => {
        result.current.setUser(user);
      });
      
      expect(result.current.user).toEqual(user);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should sign out', () => {
      const { result } = renderHook(() => useAuthStore());
      
      act(() => {
        result.current.setUser({ id: '1', email: 'test@test.com' });
      });
      
      act(() => {
        result.current.signOut();
      });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
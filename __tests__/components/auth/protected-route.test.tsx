import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuthStore } from '@/lib/store/auth-store';

import { // Mock global fetch

jest.mock('zustand', () => ({
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

jest.mock('next/navigation', () => ({
jest.mock('@/lib/store/auth-store');
jest.mock('lucide-react', () => ({

create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock next/navigation

  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock next/navigation

  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
    pathname: '/',
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

global.fetch = jest.fn();
 render, screen, waitFor  } from '@testing-library/react';

// Mock next/navigation

  useRouter: jest.fn().mockReturnValue(void 0),
}));

// Mock auth store

// Mock lucide-react icons

  Loader2: ({ className, 'data-testid': dataTestId }: any) => (
    <div className={className} data-testid={dataTestId}>
      Loading...
    </div>
  ),
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const mockPush = jest.fn().mockReturnValue(void 0);
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<
    typeof useAuthStore
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('should render children when authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as ReturnType<typeof useUIStore>);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should show loading state while checking auth', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    } as ReturnType<typeof useUIStore>);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    // Should show loading spinner
    const loadingContainer = screen.getByTestId('loading-container');
    expect(loadingContainer).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should redirect to signin when not authenticated', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    } as ReturnType<typeof useUIStore>);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect to custom path when provided', async () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    } as ReturnType<typeof useUIStore>);

    render(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Protected Content</div>
      </ProtectedRoute>

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });
  });

  it('should not redirect if auth state changes to authenticated', async () => {
    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    // Start with loading
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    } as ReturnType<typeof useUIStore>);

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    // Change to authenticated
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as ReturnType<typeof useUIStore>);

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should handle auth loading to unauthenticated transition', async () => {
    // Start with loading
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    } as ReturnType<typeof useUIStore>);

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    expect(screen.getByTestId('loading-container')).toBeInTheDocument();

    // Change to not authenticated
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    } as ReturnType<typeof useUIStore>);

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });
  });
});
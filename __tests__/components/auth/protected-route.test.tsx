import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuthStore } from '@/lib/store/auth-store';


// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock auth store
jest.mock('@/lib/store/auth-store');

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader2: ({ className, 'data-testid': dataTestId }: any) => (
    <div className={className} data-testid={dataTestId}>
      Loading...
    </div>
  ),
}));

describe('ProtectedRoute', () => {
  const mockPush = jest.fn();
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<
    typeof useAuthStore
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('should render children when authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as any);

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should show loading state while checking auth', () => {
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    } as any);

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
    } as any);

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
    } as any);

    render(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Protected Content</div>
      </ProtectedRoute>

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/custom-login');
    });
  });

  it('should not redirect if auth state changes to authenticated', () => {
    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    // Start with loading
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    } as any);

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    // Change to authenticated
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as any);

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
    } as any);

    const { rerender } = render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    expect(screen.getByTestId('loading-container')).toBeInTheDocument();

    // Change to not authenticated
    mockUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    } as any);

    rerender(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/signin');
    });
  });
});

import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { authService } from '@/lib/services/auth/auth-service';
import { useAuthStore } from '@/lib/store/auth-store';


// Mock dependencies

// Mock useLanguage hook
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: {
      welcomeMessage: 'Welcome',
      heroTitle: 'Create Your Portfolio',
      getStarted: 'Get Started',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      enhanceWithAI: 'Enhance with AI',
      publish: 'Publish',
      preview: 'Preview',
      // Add more translations as needed
    },
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/navigation');
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
jest.mock('@/lib/services/auth/auth-service');
jest.mock('@/lib/utils/logger');

// Simple sign in component for testing
function SignInForm() {
  const { signIn, isLoading, error } = useAuthStore();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (error) {
      // Error is handled in store
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <div role="alert">{error}</div>}
    </form>

}

// Dashboard component that requires auth
function Dashboard() {
  const { user, signOut } = useAuthStore();

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>

}

describe('Authentication Flow Integration', () => {
  const mockPush = jest.fn();
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
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    // Reset auth store
    useAuthStore.setState({
      user: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  });

  describe('Sign In Flow', () => {
    it('should complete sign in flow successfully', async () => {
      const user = userEvent.setup();
      (authService.signIn as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      render(<SignInForm />);

      // Fill in form
      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check loading state
      expect(
        screen.getByRole('button', { name: 'Signing in...' })
      ).toBeDisabled();

      // Wait for sign in to complete
      await waitFor(() => {
        expect(authService.signIn).toHaveBeenCalledWith(
      'test@example.com',
          'password123'
    );
  });

      // Verify auth state is updated
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle sign in errors', async () => {
      const user = userEvent.setup();
      (authService.signIn as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      render(<SignInForm />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrong-password');
      await user.click(submitButton);

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(
          'Invalid credentials'

      });

      // Verify auth state
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('should disable form during sign in', async () => {
      const user = userEvent.setup();
      let resolveSignIn: (value: any) => void;
      const signInPromise = new Promise(resolve => {
        resolveSignIn = resolve;
      });

      (authService.signIn as jest.Mock).mockReturnValue(signInPromise);

      render(<SignInForm />);

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      // Check that form is disabled
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Signing in...');

      // Resolve sign in
      resolveSignIn!({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      await waitFor(() => {
        expect(emailInput).not.toBeDisabled();
        expect(passwordInput).not.toBeDisabled();
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Sign Out Flow', () => {
    it('should complete sign out flow successfully', async () => {
      const user = userEvent.setup();
      (authService.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      render(<Dashboard />);

      expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument();

      const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(authService.signOut).toHaveBeenCalled();
      });

      // Verify auth state is reset
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should handle sign out errors', async () => {
      const user = userEvent.setup();
      (authService.signOut as jest.Mock).mockResolvedValue({
        error: { message: 'Network error' },
      });

      // Set initial authenticated state
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      render(<Dashboard />);

      const signOutButton = screen.getByRole('button', { name: 'Sign Out' });
      await user.click(signOutButton);

      await waitFor(() => {
        expect(authService.signOut).toHaveBeenCalled();
      });

      // Verify error is set but user might still be in store
      const state = useAuthStore.getState();
      expect(state.error).toBe('Network error');
    });
  });

  describe('Session Persistence', () => {
    it('should initialize auth from existing session on mount', async () => {
      (authService.getSession as jest.Mock).mockResolvedValue({
        data: mockSession,
      });
      (authService.getUser as jest.Mock).mockResolvedValue({
        data: mockUser,
      });

      // Component that initializes auth on mount
      function App() {
        const { initializeAuth, isLoading, isAuthenticated } = useAuthStore();

        React.useEffect(() => {
          initializeAuth();
        }, [initializeAuth]);

        if (isLoading) {
          return <div>Loading...</div>;
        }

        return isAuthenticated ? <Dashboard /> : <SignInForm />;
      }

      render(<App />);

      // Should show loading initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for auth to initialize
      await waitFor(() => {
        expect(
          screen.getByText('Welcome, test@example.com')
        ).toBeInTheDocument();
      });

      // Verify auth state
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should show sign in form when no session exists', async () => {
      (authService.getSession as jest.Mock).mockResolvedValue({
        data: null,
      });
      (authService.getUser as jest.Mock).mockResolvedValue({
        data: null,
      });

      function App() {
        const { initializeAuth, isLoading, isAuthenticated } = useAuthStore();

        React.useEffect(() => {
          initializeAuth();
        }, [initializeAuth]);

        if (isLoading) {
          return <div>Loading...</div>;
        }

        return isAuthenticated ? <Dashboard /> : <SignInForm />;
      }

      render(<App />);

      // Wait for auth check to complete
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      });

      // Should show sign in form
      expect(
        screen.getByRole('button', { name: 'Sign In' })
      ).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  describe('Protected Route Integration', () => {
    it('should protect routes and redirect when not authenticated', async () => {
      // Import actual ProtectedRoute component
      const { ProtectedRoute } = require('@/components/auth/protected-route');

      render(
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin');
      });

      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('should allow access to protected routes when authenticated', () => {
      const { ProtectedRoute } = require('@/components/auth/protected-route');

      // Set authenticated state
      useAuthStore.setState({
        user: mockUser,
        session: mockSession,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      render(
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});

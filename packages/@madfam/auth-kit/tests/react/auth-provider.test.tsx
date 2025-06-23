/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import {
  AuthProvider,
  useAuth,
  LoginForm,
  SignUpForm,
  ProtectedRoute,
} from '../../src/react';
import { AuthKit } from '../../src/core/auth-kit';
import { MockMemoryAdapter } from '../mocks/memory-adapter';
import type { AuthKitConfig } from '../../src/core/types';

// Mock React
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createContext: jest.fn().mockImplementation(jest.requireActual('react').createContext),
  useContext: jest.fn().mockImplementation(jest.requireActual('react').useContext),
  useState: jest.fn().mockImplementation(jest.requireActual('react').useState),
  useEffect: jest.fn().mockImplementation(jest.requireActual('react').useEffect),
  useCallback: jest.fn().mockImplementation(jest.requireActual('react').useCallback),
}));

const defaultConfig: AuthKitConfig = {
  providers: {
    email: {
      enabled: true,
      verification: 'optional',
    },
  },
  session: {
    type: 'jwt',
    secret: 'test-secret',
    expiresIn: '1h',
  },
};

describe('AuthProvider', () => {
  let authKit: AuthKit;
  let adapter: MockMemoryAdapter;

  beforeEach(() => {
    adapter = new MockMemoryAdapter();
    authKit = new AuthKit({
      ...defaultConfig,
      adapter,
    });
    
    // Clear localStorage mocks
    jest.clearAllMocks();
  });

  const TestComponent = () => {
    const auth = useAuth();
    return (
      <div>
        <div data-testid="loading">{auth.isLoading ? 'loading' : 'loaded'}</div>
        <div data-testid="authenticated">{auth.isAuthenticated ? 'true' : 'false'}</div>
        <div data-testid="user-email">{auth.user?.email || 'no-user'}</div>
        <button onClick={() => auth.signUp({ email: 'test@example.com', password: 'Password123!' })}>
          Sign Up
        </button>
        <button onClick={() => auth.signIn({ email: 'test@example.com', password: 'Password123!' })}>
          Sign In
        </button>
        <button onClick={() => auth.signOut()}>Sign Out</button>
      </div>
    );
  };

  it('should provide auth context to children', async () => {
    render(
      <AuthProvider authKit={authKit}>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
  });

  it('should handle sign up flow', async () => {
    render(
      <AuthProvider authKit={authKit}>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('should handle sign in flow', async () => {
    // First create a user
    await authKit.signUp({
      email: 'test@example.com',
      password: 'Password123!',
    });

    render(
      <AuthProvider authKit={authKit}>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });
  });

  it('should handle sign out flow', async () => {
    // First create and sign in a user
    await authKit.signUp({
      email: 'test@example.com',
      password: 'Password123!',
    });

    render(
      <AuthProvider authKit={authKit}>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    fireEvent.click(screen.getByText('Sign Out'));

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
    });
  });

  it('should persist session in localStorage', async () => {
    const mockSetItem = jest.fn();
    const mockGetItem = jest.fn().mockReturnValue(null);
    
    Object.defineProperty(global, 'localStorage', {
      value: {
        setItem: mockSetItem,
        getItem: mockGetItem,
        removeItem: jest.fn(),
      },
    });

    render(
      <AuthProvider authKit={authKit} persistSession={true}>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('loaded');
    });

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(mockSetItem).toHaveBeenCalledWith('authkit_session', expect.any(String));
    });
  });
});

describe('LoginForm', () => {
  let authKit: AuthKit;
  let adapter: MockMemoryAdapter;

  beforeEach(() => {
    adapter = new MockMemoryAdapter();
    authKit = new AuthKit({
      ...defaultConfig,
      adapter,
    });
  });

  it('should render login form', () => {
    render(
      <AuthProvider authKit={authKit}>
        <LoginForm />
      </AuthProvider>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    // Create a user first
    await authKit.signUp({
      email: 'test@example.com',
      password: 'Password123!',
    });

    const onSubmit = jest.fn();
    
    render(
      <AuthProvider authKit={authKit}>
        <LoginForm onSubmit={onSubmit} />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it('should handle OAuth providers', () => {
    render(
      <AuthProvider authKit={authKit}>
        <LoginForm enableOAuth={['google', 'github']} />
      </AuthProvider>
    );

    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Github')).toBeInTheDocument();
  });
});

describe('SignUpForm', () => {
  let authKit: AuthKit;
  let adapter: MockMemoryAdapter;

  beforeEach(() => {
    adapter = new MockMemoryAdapter();
    authKit = new AuthKit({
      ...defaultConfig,
      adapter,
    });
  });

  it('should render signup form', () => {
    render(
      <AuthProvider authKit={authKit}>
        <SignUpForm />
      </AuthProvider>
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('should validate password confirmation', async () => {
    const onError = jest.fn();
    
    render(
      <AuthProvider authKit={authKit}>
        <SignUpForm onError={onError} />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Password123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: { value: 'DifferentPassword!' },
    });

    fireEvent.click(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith({
        code: 'INVALID_CREDENTIALS',
        message: 'Passwords do not match',
      });
    });
  });

  it('should handle terms acceptance', () => {
    render(
      <AuthProvider authKit={authKit}>
        <SignUpForm requireTerms={true} />
      </AuthProvider>
    );

    expect(screen.getByText(/Terms and Conditions/)).toBeInTheDocument();
  });
});

describe('ProtectedRoute', () => {
  let authKit: AuthKit;
  let adapter: MockMemoryAdapter;

  beforeEach(() => {
    adapter = new MockMemoryAdapter();
    authKit = new AuthKit({
      ...defaultConfig,
      adapter,
    });
  });

  it('should render children when authenticated', async () => {
    // Create and sign in a user
    await authKit.signUp({
      email: 'test@example.com',
      password: 'Password123!',
    });

    const TestContent = () => <div>Protected Content</div>;

    const TestWrapper = () => {
      const auth = useAuth();
      
      React.useEffect(() => {
        auth.signIn({ email: 'test@example.com', password: 'Password123!' });
      }, []);

      return (
        <ProtectedRoute>
          <TestContent />
        </ProtectedRoute>
      );
    };

    render(
      <AuthProvider authKit={authKit}>
        <TestWrapper />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should render fallback when not authenticated', async () => {
    render(
      <AuthProvider authKit={authKit}>
        <ProtectedRoute fallback={<div>Please sign in</div>}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Please sign in')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  it('should handle role-based access', async () => {
    // Create a user with specific roles
    const signUpResult = await authKit.signUp({
      email: 'test@example.com',
      password: 'Password123!',
    });

    await adapter.updateUser(signUpResult.user.id, {
      roles: ['admin'],
    });

    const TestWrapper = () => {
      const auth = useAuth();
      
      React.useEffect(() => {
        auth.signIn({ email: 'test@example.com', password: 'Password123!' });
      }, []);

      return (
        <ProtectedRoute requiredRoles={['admin']}>
          <div>Admin Content</div>
        </ProtectedRoute>
      );
    };

    render(
      <AuthProvider authKit={authKit}>
        <TestWrapper />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });
  });
});
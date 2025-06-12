/**
 * Sign In page test suite
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import SignInPage from '@/app/auth/signin/page';

import { renderWithLanguage } from '../../../utils/i18n-test-utils';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock Supabase auth
jest.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

// Mock BaseLayout to avoid AppContext requirement
jest.mock('@/components/layouts/BaseLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock auth functions
jest.mock('@/lib/auth/auth', () => ({
  signIn: jest.fn(),
  signInWithOAuth: jest.fn(),
}));

describe('Sign In Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Content Rendering', () => {
    test('renders sign in form', () => {
      renderWithLanguage(<SignInPage />);

      // Check for form elements
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in|iniciar sesión/i })
      ).toBeInTheDocument();
    });

    test('renders social login options', () => {
      renderWithLanguage(<SignInPage />);

      // Check for OAuth buttons
      const buttons = screen.getAllByRole('button');
      const socialButtons = buttons.filter(
        btn =>
          btn.textContent?.toLowerCase().includes('google') ||
          btn.textContent?.toLowerCase().includes('github')
      );
      expect(socialButtons.length).toBeGreaterThan(0);
    });

    test('renders links to sign up and forgot password', () => {
      renderWithLanguage(<SignInPage />);

      const links = screen.getAllByRole('link');
      const signUpLink = links.find(link =>
        link.getAttribute('href')?.includes('/signup')
      );
      const forgotPasswordLink = links.find(link =>
        link.getAttribute('href')?.includes('/reset-password')
      );

      expect(signUpLink).toBeInTheDocument();
      expect(forgotPasswordLink).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    test('validates required fields', async () => {
      const user = userEvent.setup();
      renderWithLanguage(<SignInPage />);

      // Try to submit empty form
      const submitButton = screen.getByRole('button', {
        name: /sign in|iniciar sesión/i,
      });
      await user.click(submitButton);

      // Should show validation errors
      // Note: Actual validation implementation may vary
      expect(screen.getByLabelText(/email/i)).toBeRequired();
      expect(screen.getByLabelText(/password/i)).toBeRequired();
    });

    test('accepts valid input', async () => {
      const user = userEvent.setup();
      renderWithLanguage(<SignInPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      renderWithLanguage(<SignInPage />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('has proper page heading', () => {
      renderWithLanguage(<SignInPage />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders without errors on mobile viewport', () => {
      global.innerWidth = 375;
      global.innerHeight = 667;

      expect(() => {
        renderWithLanguage(<SignInPage />);
      }).not.toThrow();
    });
  });
});

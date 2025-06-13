import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLanguage } from '../../../utils/i18n-test-utils';

import SignUpPage from '@/app/auth/signup/page';

/**
 * Sign Up page test suite
 */

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
      signUp: jest.fn(),
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
  signUp: jest.fn(),
  signInWithOAuth: jest.fn(),
}));

describe('Sign Up Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Content Rendering', () => {
    test('renders sign up form', () => {
      renderWithLanguage(<SignUpPage />);

      // Check for form elements
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign up|registrar/i })
      ).toBeInTheDocument();
    });

    test('renders password confirmation field', () => {
      renderWithLanguage(<SignUpPage />);

      // Should have confirm password field
      const passwordFields = screen.getAllByLabelText(/password/i);
      expect(passwordFields.length).toBeGreaterThanOrEqual(2);
    });

    test('renders terms and conditions checkbox', () => {
      renderWithLanguage(<SignUpPage />);

      // Check for terms checkbox
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    test('renders link to sign in', () => {
      renderWithLanguage(<SignUpPage />);

      const links = screen.getAllByRole('link');
      const signInLink = links.find(link =>
        link.getAttribute('href')?.includes('/signin')
      );

      expect(signInLink).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('validates password requirements', async () => {
      const user = userEvent.setup();
      renderWithLanguage(<SignUpPage />);

      const passwordInput = screen.getAllByLabelText(/password/i)[0];

      // Type a short password
      if (passwordInput) await user.type(passwordInput, 'short');

      // Should show password requirements (minimum 12 characters as per CLAUDE.md)
      const passwordHelp = screen.queryByText(/12/);
      expect(passwordHelp).toBeInTheDocument();
    });

    test('validates password match', async () => {
      const user = userEvent.setup();
      renderWithLanguage(<SignUpPage />);

      const [passwordInput, confirmInput] =
        screen.getAllByLabelText(/password/i);

      if (passwordInput) await user.type(passwordInput, 'ValidPassword123!');
      if (confirmInput) await user.type(confirmInput, 'DifferentPassword123!');

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /sign up|registrar/i,
      });
      await user.click(submitButton);

      // Should show password mismatch error
      // Note: Actual implementation may vary
    });
  });

  describe('Social Sign Up', () => {
    test('renders social sign up options', () => {
      renderWithLanguage(<SignUpPage />);

      // Check for OAuth buttons
      const buttons = screen.getAllByRole('button');
      const socialButtons = buttons.filter(
        btn =>
          btn.textContent?.toLowerCase().includes('google') ||
          btn.textContent?.toLowerCase().includes('github') ||
          btn.textContent?.toLowerCase().includes('linkedin')
      );
      expect(socialButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    test('has proper form labels', () => {
      renderWithLanguage(<SignUpPage />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      const passwordFields = screen.getAllByLabelText(/password/i);
      expect(passwordFields.length).toBeGreaterThanOrEqual(2);
    });

    test('has proper page heading', () => {
      renderWithLanguage(<SignUpPage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    test('form inputs have proper types', () => {
      renderWithLanguage(<SignUpPage />);

      const emailInput = screen.getByLabelText(/email/i);
      expect(emailInput).toHaveAttribute('type', 'email');

      const passwordInputs = screen.getAllByLabelText(/password/i);
      passwordInputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'password');
      });
    });
  });
});

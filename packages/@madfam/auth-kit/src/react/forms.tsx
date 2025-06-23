/**
 * @madfam/auth-kit
 * 
 * Enterprise-grade authentication system for the MADFAM platform
 * 
 * @version 1.0.0
 * @license MCAL-1.0
 * @copyright 2025 MADFAM LLC
 * 
 * This software is licensed under the MADFAM Code Available License (MCAL) v1.0.
 * You may use this software for personal, educational, and internal business purposes.
 * Commercial use, redistribution, and modification require explicit permission.
 * 
 * For commercial licensing inquiries: licensing@madfam.io
 * For the full license text: https://madfam.com/licenses/mcal-1.0
 */

import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useSignIn, useSignUp, usePasswordReset, useMFA } from './hooks';
import type { SignInOptions, SignUpOptions } from '../core/types';

export interface FormStyles {
  form?: string;
  fieldGroup?: string;
  label?: string;
  input?: string;
  button?: string;
  error?: string;
  success?: string;
  link?: string;
  socialButton?: string;
  divider?: string;
}

const defaultStyles: FormStyles = {
  form: 'space-y-4',
  fieldGroup: 'space-y-2',
  label: 'block text-sm font-medium',
  input: 'w-full px-3 py-2 border rounded-md',
  button: 'w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700',
  error: 'text-sm text-red-600',
  success: 'text-sm text-green-600',
  link: 'text-sm text-blue-600 hover:underline',
  socialButton: 'w-full px-4 py-2 border rounded-md hover:bg-gray-50',
  divider: 'text-center text-sm text-gray-500 my-4',
};

export interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showSocial?: boolean;
  socialProviders?: string[];
  styles?: FormStyles;
  redirectTo?: string;
}

export function SignInForm({
  onSuccess,
  onError,
  showSocial = true,
  socialProviders = ['google', 'github'],
  styles = {},
  redirectTo,
}: SignInFormProps) {
  const { signIn, isLoading, error } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const formStyles = { ...defaultStyles, ...styles };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const options: SignInOptions = redirectTo ? { redirectTo } : undefined;
      await signIn(email, password, options);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formStyles.form}>
      {showSocial && (
        <>
          <div className="space-y-2">
            {socialProviders.map((provider) => (
              <button
                key={provider}
                type="button"
                className={formStyles.socialButton}
                onClick={() => window.location.href = `/api/auth/${provider}`}
              >
                Continue with {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>
          <div className={formStyles.divider}>or</div>
        </>
      )}

      <div className={formStyles.fieldGroup}>
        <label htmlFor="email" className={formStyles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className={formStyles.input}
          required
          disabled={isLoading}
        />
      </div>

      <div className={formStyles.fieldGroup}>
        <label htmlFor="password" className={formStyles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          className={formStyles.input}
          required
          disabled={isLoading}
        />
      </div>

      {error && <div className={formStyles.error}>{error.message}</div>}

      <button type="submit" className={formStyles.button} disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      <div className="text-center">
        <a href="/auth/forgot-password" className={formStyles.link}>
          Forgot password?
        </a>
      </div>
    </form>
  );
}

export interface SignUpFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  requireEmailVerification?: boolean;
  styles?: FormStyles;
  metadata?: Record<string, unknown>;
}

export function SignUpForm({
  onSuccess,
  onError,
  requireEmailVerification = true,
  styles = {},
  metadata,
}: SignUpFormProps) {
  const { signUp, isLoading, error } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const formStyles = { ...defaultStyles, ...styles };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    try {
      const options: SignUpOptions = {
        emailRedirectTo: window.location.origin + '/auth/verify',
        metadata,
      };
      await signUp(email, password, options);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formStyles.form}>
      <div className={formStyles.fieldGroup}>
        <label htmlFor="email" className={formStyles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className={formStyles.input}
          required
          disabled={isLoading}
        />
      </div>

      <div className={formStyles.fieldGroup}>
        <label htmlFor="password" className={formStyles.label}>
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          className={formStyles.input}
          required
          disabled={isLoading}
          minLength={8}
        />
      </div>

      <div className={formStyles.fieldGroup}>
        <label htmlFor="confirmPassword" className={formStyles.label}>
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
          className={formStyles.input}
          required
          disabled={isLoading}
        />
      </div>

      {(error || validationError) && (
        <div className={formStyles.error}>{error?.message || validationError}</div>
      )}

      <button type="submit" className={formStyles.button} disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </button>

      {requireEmailVerification && (
        <p className="text-sm text-center text-gray-600">
          We'll send you an email to verify your account.
        </p>
      )}
    </form>
  );
}

export interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  styles?: FormStyles;
}

export function ForgotPasswordForm({
  onSuccess,
  onError,
  styles = {},
}: ForgotPasswordFormProps) {
  const { request, isLoading, error, success } = usePasswordReset();
  const [email, setEmail] = useState('');

  const formStyles = { ...defaultStyles, ...styles };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await request(email);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  if (success) {
    return (
      <div className={formStyles.success}>
        Check your email for a password reset link.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={formStyles.form}>
      <div className={formStyles.fieldGroup}>
        <label htmlFor="email" className={formStyles.label}>
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          className={formStyles.input}
          required
          disabled={isLoading}
        />
      </div>

      {error && <div className={formStyles.error}>{error.message}</div>}

      <button type="submit" className={formStyles.button} disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <div className="text-center">
        <a href="/auth/signin" className={formStyles.link}>
          Back to sign in
        </a>
      </div>
    </form>
  );
}

export interface MFAFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  styles?: FormStyles;
}

export function MFAForm({
  onSuccess,
  onError,
  styles = {},
}: MFAFormProps) {
  const { verify, isRequired, challengeId, isLoading, error } = useMFA();
  const [code, setCode] = useState('');

  const formStyles = { ...defaultStyles, ...styles };

  if (!isRequired || !challengeId) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await verify(code);
      onSuccess?.();
    } catch (err) {
      onError?.(err as Error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={formStyles.form}>
      <div className={formStyles.fieldGroup}>
        <label htmlFor="code" className={formStyles.label}>
          Enter your 6-digit code
        </label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
          className={formStyles.input}
          required
          disabled={isLoading}
          maxLength={6}
          pattern="[0-9]{6}"
          placeholder="000000"
        />
      </div>

      {error && <div className={formStyles.error}>{error.message}</div>}

      <button type="submit" className={formStyles.button} disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify'}
      </button>

      <p className="text-sm text-center text-gray-600">
        Open your authenticator app and enter the code
      </p>
    </form>
  );
}
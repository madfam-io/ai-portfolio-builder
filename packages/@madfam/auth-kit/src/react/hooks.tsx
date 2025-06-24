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

import { useContext, useCallback, useState, useEffect } from 'react';
import { AuthContext } from './provider';
import type {
  SignInOptions,
  SignUpOptions,
  User,
  Session,
  AuthError,
  MFAVerifyOptions,
  AuthChangeEvent,
  PasswordResetOptions,
} from '../core/types';

/**
 * Main authentication hook
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Convenience hook for checking authentication status
 */
export function useAuthStatus() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}

/**
 * Hook for managing sign-in flow
 */
export function useSignIn() {
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleSignIn = useCallback(
    async (email: string, password: string, options?: SignInOptions) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await signIn(email, password, options);
        return result;
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [signIn]
  );

  return {
    signIn: handleSignIn,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for managing sign-up flow
 */
export function useSignUp() {
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const handleSignUp = useCallback(
    async (email: string, password: string, options?: SignUpOptions) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await signUp(email, password, options);
        return result;
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [signUp]
  );

  return {
    signUp: handleSignUp,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for managing sign-out
 */
export function useSignOut() {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut();
    } finally {
      setIsLoading(false);
    }
  }, [signOut]);

  return {
    signOut: handleSignOut,
    isLoading,
  };
}

/**
 * Hook for password reset flow
 */
export function usePasswordReset() {
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);
  const [success, setSuccess] = useState(false);

  const request = useCallback(
    async (email: string, options?: PasswordResetOptions) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      try {
        await requestPasswordReset(email, options);
        setSuccess(true);
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [requestPasswordReset]
  );

  const confirm = useCallback(
    async (token: string, newPassword: string) => {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      try {
        await confirmPasswordReset(token, newPassword);
        setSuccess(true);
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [confirmPasswordReset]
  );

  return {
    request,
    confirm,
    isLoading,
    error,
    success,
    clearError: () => setError(null),
  };
}

/**
 * Hook for MFA verification
 */
export function useMFA() {
  const { verifyMFA, mfaRequired, mfaChallengeId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const verify = useCallback(
    async (code: string, options?: MFAVerifyOptions) => {
      if (!mfaChallengeId) {
        throw new Error('No MFA challenge ID available');
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await verifyMFA(mfaChallengeId, code, options);
        return result;
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [verifyMFA, mfaChallengeId]
  );

  return {
    verify,
    isRequired: mfaRequired,
    challengeId: mfaChallengeId,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for OAuth authentication
 */
export function useOAuth() {
  const { signInWithOAuth, linkOAuthAccount } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const signIn = useCallback(
    async (provider: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await signInWithOAuth(provider);
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [signInWithOAuth]
  );

  const link = useCallback(
    async (provider: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await linkOAuthAccount(provider);
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [linkOAuthAccount]
  );

  return {
    signIn,
    link,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for session management
 */
export function useSession() {
  const { session, refreshSession } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshSession]);

  return {
    session,
    refresh,
    isRefreshing,
  };
}

/**
 * Hook for user profile management
 */
export function useUser() {
  const { user, updateUser } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const update = useCallback(
    async (updates: Partial<User>) => {
      setIsUpdating(true);
      setError(null);
      try {
        const result = await updateUser(updates);
        return result;
      } catch (err) {
        setError(err as AuthError);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [updateUser]
  );

  return {
    user,
    update,
    isUpdating,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for auth state changes
 */
export function useAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { session } = useAuth();

  useEffect(() => {
    // This would integrate with the AuthKit's event system
    // For now, we'll just monitor session changes
    if (session) {
      callback('SIGNED_IN', session);
    } else {
      callback('SIGNED_OUT', null);
    }
  }, [session, callback]);
}

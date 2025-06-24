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

import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import type { AuthKit } from '../core/auth-kit';
import type {
  User,
  Session,
  AuthError,
  SignInOptions,
  SignUpOptions,
  MFAVerifyOptions,
  PasswordResetOptions,
} from '../core/types';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  mfaRequired: boolean;
  mfaChallengeId: string | null;
}

export interface AuthContextValue extends AuthState {
  signIn: (
    email: string,
    password: string,
    options?: SignInOptions
  ) => Promise<{ user: User; session: Session }>;
  signUp: (
    email: string,
    password: string,
    options?: SignUpOptions
  ) => Promise<{ user: User; session: Session }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
  linkOAuthAccount: (provider: string) => Promise<void>;
  verifyMFA: (
    challengeId: string,
    code: string,
    options?: MFAVerifyOptions
  ) => Promise<{ user: User; session: Session }>;
  updateUser: (updates: Partial<User>) => Promise<User>;
  refreshSession: () => Promise<Session>;
  requestPasswordReset: (
    email: string,
    options?: PasswordResetOptions
  ) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export interface AuthProviderProps {
  children: ReactNode;
  authKit: AuthKit;
  persistSession?: boolean;
  sessionKey?: string;
}

export function AuthProvider({
  children,
  authKit,
  persistSession = true,
  sessionKey = 'authkit_session',
}: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
    mfaRequired: false,
    mfaChallengeId: null,
  });

  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Initialize session on mount
  useEffect(() => {
    const loadPersistedSession = () => {
      if (!persistSession) {
        return null;
      }

      const token = localStorage.getItem(sessionKey);
      if (!token) {
        return null;
      }

      return authKit.getSession(token);
    };

    const initializeAuth = async () => {
      try {
        const session = await loadPersistedSession();

        if (session) {
          updateState({
            session,
            user: null, // Would need to fetch user from session
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          updateState({ isLoading: false });
        }
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, [authKit, persistSession, sessionKey, updateState]);

  // Persist session when it changes
  useEffect(() => {
    if (persistSession && state.session) {
      localStorage.setItem(sessionKey, state.session.token);
    } else if (persistSession && !state.session) {
      localStorage.removeItem(sessionKey);
    }
  }, [persistSession, sessionKey, state.session]);

  const signIn = useCallback(
    async (email: string, password: string, options?: SignInOptions) => {
      updateState({ isLoading: true, error: null });
      try {
        const result = await authKit.signIn({ email, password, ...options });

        if ('mfaChallengeId' in result) {
          updateState({
            mfaRequired: true,
            mfaChallengeId: result.mfaChallengeId,
            isLoading: false,
          });
          throw new Error('MFA required');
        }

        updateState({
          user: result.user,
          session: result.session,
          isAuthenticated: true,
          isLoading: false,
        });

        return result;
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, updateState]
  );

  const signUp = useCallback(
    async (email: string, password: string, options?: SignUpOptions) => {
      updateState({ isLoading: true, error: null });
      try {
        const result = await authKit.signUp({ email, password, ...options });
        updateState({
          user: result.user,
          session: result.session,
          isAuthenticated: true,
          isLoading: false,
        });
        return result;
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, updateState]
  );

  const signOut = useCallback(async () => {
    updateState({ isLoading: true, error: null });
    try {
      if (!state.session) {
        throw new Error('No active session');
      }
      await authKit.signOut(state.session.token);
      updateState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        mfaRequired: false,
        mfaChallengeId: null,
      });
    } catch (error) {
      updateState({
        error: error as AuthError,
        isLoading: false,
      });
      throw error;
    }
  }, [authKit, state.session, updateState]);

  const signInWithOAuth = useCallback(
    async (provider: string) => {
      updateState({ isLoading: true, error: null });
      try {
        const { url } = await authKit.signInWithOAuth(provider);
        window.location.href = url;
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, updateState]
  );

  const linkOAuthAccount = useCallback(
    async (provider: string) => {
      if (!state.user) {
        throw new Error('Must be authenticated to link account');
      }
      updateState({ isLoading: true, error: null });
      try {
        const { url } = await authKit.linkOAuthAccount(state.user.id, provider);
        window.location.href = url;
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, state.user, updateState]
  );

  const verifyMFA = useCallback(
    async (challengeId: string, code: string, options?: MFAVerifyOptions) => {
      updateState({ isLoading: true, error: null });
      try {
        const result = await authKit.verifyMFA(challengeId, code, options);
        updateState({
          user: result.user,
          session: result.session,
          isAuthenticated: true,
          isLoading: false,
          mfaRequired: false,
          mfaChallengeId: null,
        });
        return result;
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, updateState]
  );

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!state.user) {
        throw new Error('Must be authenticated to update user');
      }
      updateState({ isLoading: true, error: null });
      try {
        const updatedUser = await authKit.updateUser(state.user.id, updates);
        updateState({
          user: updatedUser,
          isLoading: false,
        });
        return updatedUser;
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, state.user, updateState]
  );

  const refreshSession = useCallback(async () => {
    if (!state.session) {
      throw new Error('No session to refresh');
    }
    updateState({ isLoading: true, error: null });
    try {
      const newSession = await authKit.refreshSession(state.session.token);
      updateState({
        session: newSession,
        isLoading: false,
      });
      return newSession;
    } catch (error) {
      updateState({
        error: error as AuthError,
        isLoading: false,
      });
      throw error;
    }
  }, [authKit, state.session, updateState]);

  const requestPasswordReset = useCallback(
    async (email: string, options?: PasswordResetOptions) => {
      updateState({ isLoading: true, error: null });
      try {
        await authKit.requestPasswordReset(email, options);
        updateState({ isLoading: false });
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, updateState]
  );

  const confirmPasswordReset = useCallback(
    async (token: string, newPassword: string) => {
      updateState({ isLoading: true, error: null });
      try {
        await authKit.confirmPasswordReset(token, newPassword);
        updateState({ isLoading: false });
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, updateState]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      linkOAuthAccount,
      verifyMFA,
      updateUser,
      refreshSession,
      requestPasswordReset,
      confirmPasswordReset,
      clearError,
    }),
    [
      state,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      linkOAuthAccount,
      verifyMFA,
      updateUser,
      refreshSession,
      requestPasswordReset,
      confirmPasswordReset,
      clearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

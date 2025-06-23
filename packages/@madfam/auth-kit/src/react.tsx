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

/**
 * @madfam/auth-kit
 *
 * React components and hooks for authentication
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  FormEvent,
} from 'react';
import { AuthKit } from './core/auth-kit';
import type {
  User,
  Session,
  SignUpData,
  SignInData,
  AuthResult,
  AuthError,
  MFAMethod,
  AuthProvider as AuthProviderType,
} from './core/types';

// Context Types
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
  mfaRequired: boolean;
  mfaChallengeId: string | null;
}

interface AuthActions {
  signUp: (data: SignUpData) => Promise<AuthResult>;
  signIn: (data: SignInData) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: AuthProviderType) => Promise<{ url: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  verifyMFA: (challengeId: string, token: string) => Promise<AuthResult>;
  clearError: () => void;
}

interface AuthContextValue extends AuthState, AuthActions {}

// Context
const AuthContext = createContext<AuthContextValue | null>(null);

// Provider Props
interface AuthProviderProps {
  children: ReactNode;
  authKit: AuthKit;
  persistSession?: boolean;
  sessionKey?: string;
}

// Auth Provider Component
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
    const initializeAuth = async () => {
      try {
        if (persistSession) {
          const token = localStorage.getItem(sessionKey);
          if (token) {
            const session = await authKit.getSession(token);
            if (session) {
              updateState({
                session,
                user: null, // Would need to fetch user from session
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          }
        }
        updateState({ isLoading: false });
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, [authKit, persistSession, sessionKey, updateState]);

  // Actions
  const signUp = useCallback(
    async (data: SignUpData): Promise<AuthResult> => {
      try {
        updateState({ isLoading: true, error: null });
        const result = await authKit.signUp(data);

        if (result.requiresMFA) {
          updateState({
            mfaRequired: true,
            mfaChallengeId: result.mfaChallengeId || null,
            isLoading: false,
          });
        } else {
          updateState({
            user: result.user,
            session: result.session,
            isAuthenticated: true,
            isLoading: false,
          });

          if (persistSession && result.session.token) {
            localStorage.setItem(sessionKey, result.session.token);
          }
        }

        return result;
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, persistSession, sessionKey, updateState]
  );

  const signIn = useCallback(
    async (data: SignInData): Promise<AuthResult> => {
      try {
        updateState({ isLoading: true, error: null });
        const result = await authKit.signIn(data);

        if (result.requiresMFA) {
          updateState({
            mfaRequired: true,
            mfaChallengeId: result.mfaChallengeId || null,
            isLoading: false,
          });
        } else {
          updateState({
            user: result.user,
            session: result.session,
            isAuthenticated: true,
            isLoading: false,
          });

          if (persistSession && result.session.token) {
            localStorage.setItem(sessionKey, result.session.token);
          }
        }

        return result;
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, persistSession, sessionKey, updateState]
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      updateState({ isLoading: true, error: null });

      if (state.session?.token) {
        await authKit.signOut(state.session.token);
      }

      updateState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        mfaRequired: false,
        mfaChallengeId: null,
      });

      if (persistSession) {
        localStorage.removeItem(sessionKey);
      }
    } catch (error) {
      updateState({
        error: error as AuthError,
        isLoading: false,
      });
      throw error;
    }
  }, [authKit, state.session?.token, persistSession, sessionKey, updateState]);

  const signInWithOAuth = useCallback(
    async (provider: AuthProviderType): Promise<{ url: string }> => {
      try {
        updateState({ isLoading: true, error: null });
        const result = await authKit.signInWithOAuth(provider);
        updateState({ isLoading: false });
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

  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      try {
        updateState({ isLoading: true, error: null });
        await authKit.resetPassword(token, newPassword);
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

  const sendPasswordResetEmail = useCallback(
    async (email: string): Promise<void> => {
      try {
        updateState({ isLoading: true, error: null });
        await authKit.sendPasswordResetEmail(email);
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

  const refreshSession = useCallback(async (): Promise<void> => {
    try {
      if (!state.session?.refreshToken) {
        throw new Error('No refresh token available');
      }

      updateState({ isLoading: true, error: null });
      const newSession = await authKit.refreshSession(
        state.session.refreshToken
      );

      updateState({
        session: newSession,
        isLoading: false,
      });

      if (persistSession) {
        localStorage.setItem(sessionKey, newSession.token);
      }
    } catch (error) {
      updateState({
        error: error as AuthError,
        isLoading: false,
      });
      throw error;
    }
  }, [
    authKit,
    state.session?.refreshToken,
    persistSession,
    sessionKey,
    updateState,
  ]);

  const verifyMFA = useCallback(
    async (challengeId: string, token: string): Promise<AuthResult> => {
      try {
        updateState({ isLoading: true, error: null });
        const result = await authKit.mfa.challenge(challengeId, token);

        updateState({
          user: result.user,
          session: result.session,
          isAuthenticated: true,
          mfaRequired: false,
          mfaChallengeId: null,
          isLoading: false,
        });

        if (persistSession && result.session.token) {
          localStorage.setItem(sessionKey, result.session.token);
        }

        return result;
      } catch (error) {
        updateState({
          error: error as AuthError,
          isLoading: false,
        });
        throw error;
      }
    },
    [authKit, persistSession, sessionKey, updateState]
  );

  const contextValue: AuthContextValue = {
    ...state,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    resetPassword,
    sendPasswordResetEmail,
    refreshSession,
    verifyMFA,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Hooks
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthActions() {
  const {
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    resetPassword,
    sendPasswordResetEmail,
    refreshSession,
    verifyMFA,
    clearError,
  } = useAuth();

  return {
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    resetPassword,
    sendPasswordResetEmail,
    refreshSession,
    verifyMFA,
    clearError,
  };
}

export function useSession() {
  const { session, isAuthenticated, refreshSession } = useAuth();
  return { session, isAuthenticated, refreshSession };
}

export function useMFA() {
  const { mfaRequired, mfaChallengeId, verifyMFA } = useAuth();
  return { mfaRequired, mfaChallengeId, verifyMFA };
}

export function usePermissions() {
  const { user } = useAuth();

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.roles?.includes(role) || false;
    },
    [user?.roles]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return user?.permissions?.includes(permission) || false;
    },
    [user?.permissions]
  );

  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      return roles.some(role => hasRole(role));
    },
    [hasRole]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some(permission => hasPermission(permission));
    },
    [hasPermission]
  );

  return {
    roles: user?.roles || [],
    permissions: user?.permissions || [],
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAnyPermission,
  };
}

// Form Component Props
interface FormProps {
  onSubmit?: (data: any) => void;
  onError?: (error: AuthError) => void;
  className?: string;
  children?: ReactNode;
}

interface LoginFormProps extends FormProps {
  showForgotPassword?: boolean;
  enableOAuth?: AuthProviderType[];
}

interface SignUpFormProps extends FormProps {
  showLogin?: boolean;
  requireTerms?: boolean;
}

interface ForgotPasswordFormProps extends FormProps {
  showLogin?: boolean;
}

interface ResetPasswordFormProps extends FormProps {
  token: string;
}

interface MFAChallengeProps extends FormProps {
  challengeId: string;
  methods?: MFAMethod[];
}

// Form Components
export function LoginForm({
  onSubmit,
  onError,
  className = '',
  showForgotPassword = true,
  enableOAuth = [],
}: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { signIn, signInWithOAuth, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn({ email, password, rememberMe });
      onSubmit?.(result);
    } catch (err) {
      onError?.(err as AuthError);
    }
  };

  const handleOAuthSignIn = async (provider: AuthProviderType) => {
    try {
      const result = await signInWithOAuth(provider);
      window.location.href = result.url;
    } catch (err) {
      onError?.(err as AuthError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`auth-form login-form ${className}`}
    >
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          Remember me
        </label>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error.message}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>

      {showForgotPassword && (
        <div className="forgot-password">
          <a href="/forgot-password">Forgot your password?</a>
        </div>
      )}

      {enableOAuth.length > 0 && (
        <div className="oauth-section">
          <div className="divider">Or continue with</div>
          <div className="oauth-buttons">
            {enableOAuth.map(provider => (
              <button
                key={provider}
                type="button"
                onClick={() => handleOAuthSignIn(provider)}
                disabled={isLoading}
                className={`oauth-button oauth-${provider}`}
              >
                {provider.charAt(0).toUpperCase() + provider.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}

export function SignUpForm({
  onSubmit,
  onError,
  className = '',
  showLogin = true,
  requireTerms = true,
}: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { signUp, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      onError?.({
        code: 'INVALID_CREDENTIALS',
        message: 'Passwords do not match',
      });
      return;
    }

    if (requireTerms && !acceptedTerms) {
      onError?.({
        code: 'INVALID_CREDENTIALS',
        message: 'Please accept the terms and conditions',
      });
      return;
    }

    try {
      const result = await signUp({ email, password });
      onSubmit?.(result);
    } catch (err) {
      onError?.(err as AuthError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`auth-form signup-form ${className}`}
    >
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {requireTerms && (
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              disabled={isLoading}
              required
            />
            I accept the{' '}
            <a href="/terms" target="_blank">
              Terms and Conditions
            </a>
          </label>
        </div>
      )}

      {error && (
        <div className="error-message" role="alert">
          {error.message}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </button>

      {showLogin && (
        <div className="login-link">
          Already have an account? <a href="/login">Sign in</a>
        </div>
      )}
    </form>
  );
}

export function ForgotPasswordForm({
  onSubmit,
  onError,
  className = '',
  showLogin = true,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { sendPasswordResetEmail, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(email);
      setSent(true);
      onSubmit?.({ email });
    } catch (err) {
      onError?.(err as AuthError);
    }
  };

  if (sent) {
    return (
      <div className={`auth-form forgot-password-form ${className}`}>
        <div className="success-message">
          Check your email for password reset instructions.
        </div>
        {showLogin && (
          <div className="login-link">
            <a href="/login">Back to Sign In</a>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`auth-form forgot-password-form ${className}`}
    >
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isLoading}
          placeholder="Enter your email address"
        />
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error.message}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Sending...' : 'Send Reset Email'}
      </button>

      {showLogin && (
        <div className="login-link">
          Remember your password? <a href="/login">Sign in</a>
        </div>
      )}
    </form>
  );
}

export function ResetPasswordForm({
  token,
  onSubmit,
  onError,
  className = '',
}: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      onError?.({
        code: 'INVALID_CREDENTIALS',
        message: 'Passwords do not match',
      });
      return;
    }

    try {
      await resetPassword(token, password);
      setSuccess(true);
      onSubmit?.({ token, password });
    } catch (err) {
      onError?.(err as AuthError);
    }
  };

  if (success) {
    return (
      <div className={`auth-form reset-password-form ${className}`}>
        <div className="success-message">
          Your password has been reset successfully.
        </div>
        <div className="login-link">
          <a href="/login">Sign in with your new password</a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`auth-form reset-password-form ${className}`}
    >
      <div className="form-group">
        <label htmlFor="password">New Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm New Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error.message}
        </div>
      )}

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export function MFAChallenge({
  challengeId,
  onSubmit,
  onError,
  className = '',
  methods = ['totp'],
}: MFAChallengeProps) {
  const [token, setToken] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod>(
    methods[0] || 'totp'
  );
  const { verifyMFA, isLoading, error } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const result = await verifyMFA(challengeId, token);
      onSubmit?.(result);
    } catch (err) {
      onError?.(err as AuthError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`auth-form mfa-challenge-form ${className}`}
    >
      <div className="mfa-intro">
        <h3>Multi-Factor Authentication Required</h3>
        <p>Please enter your verification code to continue.</p>
      </div>

      {methods.length > 1 && (
        <div className="form-group">
          <label>Verification Method</label>
          <select
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value as MFAMethod)}
            disabled={isLoading}
          >
            {methods.map(method => (
              <option key={method} value={method}>
                {method === 'totp'
                  ? 'Authenticator App'
                  : method === 'sms'
                    ? 'SMS'
                    : method === 'email'
                      ? 'Email'
                      : method === 'backup'
                        ? 'Backup Code'
                        : method}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="token">
          {selectedMethod === 'totp'
            ? 'Enter code from authenticator app'
            : selectedMethod === 'sms'
              ? 'Enter SMS code'
              : selectedMethod === 'email'
                ? 'Enter email code'
                : selectedMethod === 'backup'
                  ? 'Enter backup code'
                  : 'Verification Code'}
        </label>
        <input
          id="token"
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          required
          disabled={isLoading}
          placeholder={selectedMethod === 'totp' ? '123456' : 'Enter code'}
          autoComplete="one-time-code"
        />
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !token}
        className="submit-button"
      >
        {isLoading ? 'Verifying...' : 'Verify'}
      </button>

      <div className="mfa-help">
        <p>
          {selectedMethod === 'totp' &&
            'Open your authenticator app and enter the 6-digit code.'}
          {selectedMethod === 'sms' &&
            'Check your phone for the verification code.'}
          {selectedMethod === 'email' &&
            'Check your email for the verification code.'}
          {selectedMethod === 'backup' && 'Enter one of your backup codes.'}
        </p>
      </div>
    </form>
  );
}

// Higher-order component for protecting routes
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requiresAuthentication?: boolean;
}

export function ProtectedRoute({
  children,
  fallback = <div>Access denied</div>,
  requiredRoles = [],
  requiredPermissions = [],
  requiresAuthentication = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyRole, hasAnyPermission } = usePermissions();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (requiresAuthentication && !isAuthenticated) {
    return fallback;
  }

  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return fallback;
  }

  if (
    requiredPermissions.length > 0 &&
    !hasAnyPermission(requiredPermissions)
  ) {
    return fallback;
  }

  return <>{children}</>;
}

// Export additional utility components
export const MFASetup = () => null; // Placeholder for future implementation
export const AccountRecovery = () => null; // Placeholder for future implementation
export const UserProfile = () => null; // Placeholder for future implementation
export const SessionManager = () => null; // Placeholder for future implementation

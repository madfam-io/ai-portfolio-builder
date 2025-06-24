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

// Provider
export { AuthProvider, AuthContext } from './provider';
export type {
  AuthProviderProps,
  AuthState,
  AuthContextValue,
} from './provider';

// Hooks
export {
  useAuth,
  useAuthStatus,
  useSignIn,
  useSignUp,
  useSignOut,
  usePasswordReset,
  useMFA,
  useOAuth,
  useSession,
  useUser,
  useAuthStateChange,
} from './hooks';

// Form Components
export { SignInForm, SignUpForm, ForgotPasswordForm, MFAForm } from './forms';
export type {
  SignInFormProps,
  SignUpFormProps,
  ForgotPasswordFormProps,
  MFAFormProps,
  FormStyles,
} from './forms';

// Protected Route Component
export { ProtectedRoute } from './protected-route';
export type { ProtectedRouteProps } from './protected-route';

// Export LoginForm as an alias for SignInForm for backward compatibility
export { SignInForm as LoginForm } from './forms';

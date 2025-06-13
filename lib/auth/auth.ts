import { createClient } from '@supabase/supabase-js';

import type {
  AuthResponse,
  User,
  Session,
  SupabaseClient,
  AuthError,
} from '@supabase/supabase-js';

// Create Supabase client factory function for better testability
function createSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      'Supabase environment variables not configured. Authentication disabled.'
    );
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

// Default client instance
let supabaseInstance: SupabaseClient | null = null;
let supabaseInitialized = false;

function getSupabaseClient(): SupabaseClient | null {
  if (!supabaseInitialized) {
    supabaseInstance = createSupabaseClient();
    supabaseInitialized = true;
  }
  return supabaseInstance;
}

// Helper function to ensure Supabase is configured
function requireSupabaseClient(): SupabaseClient {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Authentication service not configured. Please set up Supabase environment variables.'
    );
  }
  return client;
}

// For testing: allow setting a mock client
export function setSupabaseClient(client: SupabaseClient): void {
  supabaseInstance = client;
  supabaseInitialized = true;
}

// For testing: reset to default client
export function resetSupabaseClient(): void {
  supabaseInstance = null;
  supabaseInitialized = false;
}

// Types for authentication
export interface SignUpCredentials {
  email: string;
  password: string;
  fullName?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export type OAuthProvider = 'google' | 'github' | 'linkedin_oidc';

// Validation helpers
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPassword(password: string): boolean {
  // Minimum 12 characters for strong security
  if (password.length < 12) return false;

  // Require at least one of each character type
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  // Check for common weak patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /(.)\1{2,}/, // Repeated characters (3+ times)
  ];

  const hasWeakPattern = commonPatterns.some(pattern => pattern.test(password));

  return (
    hasUppercase &&
    hasLowercase &&
    hasNumbers &&
    hasSpecialChar &&
    !hasWeakPattern
  );
}

/**
 * Get password strength rating
 */
export function getPasswordStrength(
  password: string
): 'weak' | 'medium' | 'strong' {
  if (password.length < 8) return 'weak';
  if (password.length < 12) return 'medium';
  if (!isValidPassword(password)) return 'medium';
  return 'strong';
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse> {
  const supabase = requireSupabaseClient();

  // Client-side validation
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (!isValidPassword(password)) {
    throw new Error(
      'Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters'
    );
  }

  const signUpData: {
    email: string;
    password: string;
    options?: {
      data: {
        full_name: string;
      };
    };
  } = {
    email,
    password,
  };

  if (fullName) {
    signUpData.options = {
      data: {
        full_name: fullName,
      },
    };
  }

  const response = await supabase.auth.signUp(signUpData);
  return response;
}

/**
 * Sign in an existing user
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResponse> {
  const supabase = requireSupabaseClient();
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return response;
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectTo?: string
): Promise<{ data: { url: string | null } | null; error: AuthError | null }> {
  const supabase = requireSupabaseClient();

  const defaultRedirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`;
  const response = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo || defaultRedirectTo,
    },
  });

  return response;
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = requireSupabaseClient();
  const response = await supabase.auth.signOut();
  return response;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<{
  data: { user: User | null };
  error: AuthError | null;
}> {
  const supabase = requireSupabaseClient();
  const response = await supabase.auth.getUser();
  return response;
}

/**
 * Get the current session
 */
export async function getCurrentSession(): Promise<{
  data: { session: Session | null };
  error: AuthError | null;
}> {
  const supabase = requireSupabaseClient();
  const response = await supabase.auth.getSession();
  return response;
}

/**
 * Listen to authentication state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const supabase = requireSupabaseClient();
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<AuthResponse> {
  const supabase = requireSupabaseClient();
  const response = await supabase.auth.refreshSession();
  return response;
}

/**
 * Send a password reset email
 */
export async function resetPassword(
  email: string
): Promise<{ error: AuthError | null }> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const defaultRedirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/reset-password`
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`;

  const supabase = requireSupabaseClient();
  const response = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: defaultRedirectTo,
  });

  return response;
}

/**
 * Update user password
 */
export async function updatePassword(
  password: string
): Promise<{ error: AuthError | null }> {
  if (!isValidPassword(password)) {
    throw new Error(
      'Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters'
    );
  }

  const supabase = requireSupabaseClient();
  const response = await supabase.auth.updateUser({ password });
  return response;
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(
  metadata: Record<string, any>
): Promise<{ error: AuthError | null }> {
  const supabase = requireSupabaseClient();
  const response = await supabase.auth.updateUser({ data: metadata });
  return response;
}

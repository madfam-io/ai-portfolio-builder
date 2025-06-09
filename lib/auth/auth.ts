import { createClient } from '@supabase/supabase-js';
import type {
  AuthResponse,
  User,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';

// Create Supabase client factory function for better testability
function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Default client instance
let supabaseInstance: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

// For testing: allow setting a mock client
export function setSupabaseClient(client: SupabaseClient): void {
  supabaseInstance = client;
}

// For testing: reset to default client
export function resetSupabaseClient(): void {
  supabaseInstance = null;
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
  return password.length >= 8;
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  fullName?: string
): Promise<AuthResponse> {
  // Client-side validation
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (!isValidPassword(password)) {
    throw new Error('Password must be at least 8 characters');
  }

  const signUpData: any = {
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

  const supabase = getSupabaseClient();
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
  const supabase = getSupabaseClient();
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
): Promise<{ data: { url: string | null } | null; error: any }> {
  const defaultRedirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback';

  const supabase = getSupabaseClient();
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
export async function signOut(): Promise<{ error: any }> {
  const supabase = getSupabaseClient();
  const response = await supabase.auth.signOut();
  return response;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<{
  data: { user: User | null };
  error: any;
}> {
  const supabase = getSupabaseClient();
  const response = await supabase.auth.getUser();
  return response;
}

/**
 * Get the current session
 */
export async function getCurrentSession(): Promise<{
  data: { session: Session | null };
  error: any;
}> {
  const supabase = getSupabaseClient();
  const response = await supabase.auth.getSession();
  return response;
}

/**
 * Listen to authentication state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  const supabase = getSupabaseClient();
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<AuthResponse> {
  const supabase = getSupabaseClient();
  const response = await supabase.auth.refreshSession();
  return response;
}

/**
 * Send a password reset email
 */
export async function resetPassword(email: string): Promise<{ error: any }> {
  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const defaultRedirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth/reset-password`
      : 'http://localhost:3000/auth/reset-password';

  const supabase = getSupabaseClient();
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
): Promise<{ error: any }> {
  if (!isValidPassword(password)) {
    throw new Error('Password must be at least 8 characters');
  }

  const supabase = getSupabaseClient();
  const response = await supabase.auth.updateUser({ password });
  return response;
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(
  metadata: Record<string, any>
): Promise<{ error: any }> {
  const supabase = getSupabaseClient();
  const response = await supabase.auth.updateUser({ data: metadata });
  return response;
}

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

import { signIn, signOut } from 'next-auth/react';
import { hash, compare } from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';

// NextAuth compatible types
export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

export interface Session {
  user: User;
  expires: string;
}

export interface AuthError extends Error {
  message: string;
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
): Promise<AuthResponse<{ user: User; requiresEmailVerification: boolean }>> {
  try {
    // Client-side validation
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!isValidPassword(password)) {
      throw new Error(
        'Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters'
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: fullName,
        emailVerified: null, // Will be verified later
      },
    });

    const userData: User = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      image: user.image || undefined,
    };

    logger.info('User signed up successfully', { userId: user.id });

    return {
      data: {
        user: userData,
        requiresEmailVerification: true,
      },
      error: null,
    };
  } catch (error) {
    logger.error('Sign up error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Sign up failed'),
    };
  }
}

/**
 * Sign in an existing user using NextAuth
 */
export async function signInWithCredentials(
  email: string,
  password: string
): Promise<AuthResponse<any>> {
  try {
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    logger.error('Sign in error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Sign in failed'),
    };
  }
}

/**
 * Sign in with OAuth provider
 */
export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectTo?: string
): Promise<AuthResponse<any>> {
  try {
    const result = await signIn(provider, {
      callbackUrl: redirectTo || '/dashboard',
      redirect: false,
    });

    return {
      data: result,
      error: null,
    };
  } catch (error) {
    logger.error('OAuth sign in error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('OAuth sign in failed'),
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<AuthResponse<void>> {
  try {
    await signOut({ redirect: false });
    return { data: undefined, error: null };
  } catch (error) {
    logger.error('Sign out error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Sign out failed'),
    };
  }
}

/**
 * Get the current authenticated user from database
 */
export async function getCurrentUser(): Promise<AuthResponse<User>> {
  try {
    // This function would typically be called server-side
    // where we have access to the session
    throw new Error('getCurrentUser should be called server-side');
  } catch (error) {
    logger.error('Get current user error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Get current user failed'),
    };
  }
}

/**
 * Get the current session - placeholder for client-side use
 */
export async function getCurrentSession(): Promise<AuthResponse<Session>> {
  try {
    // This should be handled by NextAuth's useSession hook on client
    throw new Error('getCurrentSession should use NextAuth hooks on client');
  } catch (error) {
    logger.error('Get current session error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Get current session failed'),
    };
  }
}

/**
 * Listen to authentication state changes - placeholder for NextAuth compatibility
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  // NextAuth handles session changes through React context
  // This is a placeholder for Supabase compatibility
  logger.info('Auth state change listener registered (NextAuth compatibility mode)');
  
  // Return unsubscribe function
  return () => {
    logger.info('Auth state change listener unsubscribed');
  };
}

/**
 * Refresh the current session - handled by NextAuth
 */
export async function refreshSession(): Promise<AuthResponse<Session>> {
  try {
    // NextAuth handles session refresh automatically
    logger.info('Session refresh requested - handled by NextAuth');
    return {
      data: null,
      error: null,
    };
  } catch (error) {
    logger.error('Session refresh error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Session refresh failed'),
    };
  }
}

/**
 * Send a password reset email
 */
export async function resetPassword(
  email: string
): Promise<AuthResponse<void>> {
  try {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      logger.info('Password reset requested for non-existent email', { email });
      return { data: undefined, error: null };
    }

    // Generate reset token
    const resetToken = crypto.randomUUID();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Store reset token
    // NOTE: resetToken and resetTokenExpiry fields don't exist in current User model
    // This would need to be added to the schema if password reset is needed
    // await prisma.user.update({
    //   where: { email },
    //   data: {
    //     resetToken,
    //     resetTokenExpiry,
    //   },
    // });

    // TODO: Send email with reset token
    logger.info('Password reset token generated', { email });

    return { data: undefined, error: null };
  } catch (error) {
    logger.error('Password reset error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Password reset failed'),
    };
  }
}

/**
 * Update user password
 */
export async function updatePassword(
  userId: string,
  password: string
): Promise<AuthResponse<void>> {
  try {
    if (!isValidPassword(password)) {
      throw new Error(
        'Password must be at least 12 characters with uppercase, lowercase, numbers, and special characters'
      );
    }

    const hashedPassword = await hash(password, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        // resetToken and resetTokenExpiry fields don't exist in current schema
      },
    });

    logger.info('Password updated successfully', { userId });
    return { data: undefined, error: null };
  } catch (error) {
    logger.error('Password update error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Password update failed'),
    };
  }
}

/**
 * Update user metadata
 */
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, unknown>
): Promise<AuthResponse<void>> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...metadata,
        updatedAt: new Date(),
      },
    });

    logger.info('User metadata updated successfully', { userId });
    return { data: undefined, error: null };
  } catch (error) {
    logger.error('User metadata update error:', error as Error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error('User metadata update failed'),
    };
  }
}
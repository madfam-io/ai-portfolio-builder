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

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
  getServerSession,
} from 'next-auth';
import { getSession } from 'next-auth/react';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/utils/logger';
import { hash, compare } from 'bcryptjs';

export interface AuthResponse<T = any> {
  data: T | null;
  error: Error | null;
}

export interface SignUpMetadata {
  fullName?: string;
  preferredLanguage?: 'es' | 'en';
  role?: string;
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

/**
 * Authentication Service
 * Handles all authentication operations using NextAuth and Prisma
 */
export class AuthService {
  /**
   * Sign in with email and password
   */
  async signIn(
    email: string,
    password: string
  ): Promise<AuthResponse<{ user: User; session: Session }>> {
    try {
      // Find user in database
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return {
          data: null,
          error: new Error('Invalid credentials'),
        };
      }

      // Verify password
      const isValidPassword = await compare(password, user.password);
      if (!isValidPassword) {
        return {
          data: null,
          error: new Error('Invalid credentials'),
        };
      }

      // Create session data
      const userData: User = {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        image: user.image || undefined,
      };

      const sessionData: Session = {
        user: userData,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      logger.info('User signed in successfully', { userId: user.id });
      return { data: { user: userData, session: sessionData }, error: null };
    } catch (error) {
      logger.error('Sign in exception:', error as Error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Sign in failed'),
      };
    }
  }

  /**
   * Sign up with email and password
   */
  async signUp(
    email: string,
    password: string,
    metadata?: SignUpMetadata
  ): Promise<AuthResponse<{ user: User; session: Session | null }>> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return {
          data: null,
          error: new Error('User already exists'),
        };
      }

      // Hash password
      const hashedPassword = await hash(password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: metadata?.fullName,
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
        data: { user: userData, session: null },
        error: null,
      };
    } catch (error) {
      logger.error('Sign up exception:', error as Error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Sign up failed'),
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse<void>> {
    try {
      await nextAuthSignOut();
      logger.info('User signed out successfully');
      return { data: undefined, error: null };
    } catch (error) {
      logger.error('Sign out exception:', error as Error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Sign out failed'),
      };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<AuthResponse<void>> {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return {
          data: null,
          error: new Error('User not found'),
        };
      }

      // Generate reset token
      const resetToken =
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Store reset token (you'll need to add these fields to your user model)
      await prisma.user.update({
        where: { email },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Here you would send an email with the reset token
      // For now, just log it
      logger.info('Password reset token generated', { email, resetToken });

      return { data: undefined, error: null };
    } catch (error) {
      logger.error('Password reset exception:', error as Error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error('Password reset failed'),
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(
    userId: string,
    newPassword: string
  ): Promise<AuthResponse<User>> {
    try {
      // Hash new password
      const hashedPassword = await hash(newPassword, 12);

      // Update user password
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      const userData: User = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name || undefined,
        image: updatedUser.image || undefined,
      };

      logger.info('Password updated successfully');
      return { data: userData, error: null };
    } catch (error) {
      logger.error('Password update exception:', error as Error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error('Password update failed'),
      };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<AuthResponse<Session>> {
    try {
      const session = await getSession();
      return { data: session as Session | null, error: null };
    } catch (error) {
      logger.error('Get session exception:', error as Error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Get session failed'),
      };
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<AuthResponse<User>> {
    try {
      const session = await getSession();
      return { data: session?.user as User | null, error: null };
    } catch (error) {
      logger.error('Get user exception:', error as Error);
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Get user failed'),
      };
    }
  }

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(
    provider: 'google' | 'github' | 'linkedin_oidc'
  ): Promise<AuthResponse<{ url: string }>> {
    try {
      // NextAuth OAuth is handled through the API routes
      // This method would redirect to the OAuth provider
      const callbackUrl = `${window.location.origin}/auth/callback`;
      const authUrl = `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`;

      logger.info('OAuth sign in initiated', { provider });
      return { data: { url: authUrl }, error: null };
    } catch (error) {
      logger.error('OAuth sign in exception:', error as Error);
      return {
        data: null,
        error:
          error instanceof Error ? error : new Error('OAuth sign in failed'),
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    // NextAuth handles session changes through React context
    // This is a placeholder for compatibility
    logger.info('Auth state change listener registered');
    return () => {
      logger.info('Auth state change listener unsubscribed');
    };
  }
}

// Export singleton instance
export const authService = new AuthService();

/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResponse<T = any> {
  data: T | null;
  error: AuthError | null;
}

export interface SignUpMetadata {
  fullName?: string;
  preferredLanguage?: 'es' | 'en';
  role?: string;
}

/**
 * Authentication Service
 * Handles all authentication operations using Supabase
 */
export class AuthService {
  private supabase = createClient();

  /**
   * Sign in with email and password
   */
  async signIn(
    email: string,
    password: string
  ): Promise<AuthResponse<{ user: User; session: Session }>> {
    try {
      if (!this.supabase) {
        throw new Error('Authentication service not configured');
      }

      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.error('Sign in error:', error);
        return { data: null, error };
      }

      logger.info('User signed in successfully', { userId: data.user?.id });
      return { data, error: null };
    } catch (error) {
      logger.error('Sign in exception:', error as Error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Sign in failed',
          status: 500,
        } as AuthError,
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
      if (!this.supabase) {
        throw new Error('Authentication service not configured');
      }

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        logger.error('Sign up error:', error);
        return { data: null, error };
      }

      logger.info('User signed up successfully', { userId: data.user?.id });
      return {
        data: data as { user: User; session: Session | null },
        error: null,
      };
    } catch (error) {
      logger.error('Sign up exception:', error as Error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Sign up failed',
          status: 500,
        } as AuthError,
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResponse<void>> {
    try {
      if (!this.supabase) {
        throw new Error('Authentication service not configured');
      }

      const { error } = await this.supabase.auth.signOut();

      if (error) {
        logger.error('Sign out error:', error);
        return { data: null, error };
      }

      logger.info('User signed out successfully');
      return { data: undefined, error: null };
    } catch (error) {
      logger.error('Sign out exception:', error as Error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Sign out failed',
          status: 500,
        } as AuthError,
      };
    }
  }

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<AuthResponse<void>> {
    try {
      if (!this.supabase) {
        throw new Error('Authentication service not configured');
      }

      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        logger.error('Password reset error:', error);
        return { data: null, error };
      }

      logger.info('Password reset email sent', { email });
      return { data: undefined, error: null };
    } catch (error) {
      logger.error('Password reset exception:', error as Error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Password reset failed',
          status: 500,
        } as AuthError,
      };
    }
  }

  /**
   * Update user password
   */
  async updatePassword(newPassword: string): Promise<AuthResponse<User>> {
    try {
      if (!this.supabase) {
        throw new Error('Authentication service not configured');
      }

      const { data, error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        logger.error('Password update error:', error);
        return { data: null, error };
      }

      logger.info('Password updated successfully');
      return { data: data.user, error: null };
    } catch (error) {
      logger.error('Password update exception:', error as Error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Password update failed',
          status: 500,
        } as AuthError,
      };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<AuthResponse<Session>> {
    try {
      if (!this.supabase) {
        return { data: null, error: null };
      }

      const { data, error } = await this.supabase.auth.getSession();

      if (error) {
        logger.error('Get session error:', error);
        return { data: null, error };
      }

      return { data: data.session, error: null };
    } catch (error) {
      logger.error('Get session exception:', error as Error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'Get session failed',
          status: 500,
        } as AuthError,
      };
    }
  }

  /**
   * Get current user
   */
  async getUser(): Promise<AuthResponse<User>> {
    try {
      if (!this.supabase) {
        return { data: null, error: null };
      }

      const { data, error } = await this.supabase.auth.getUser();

      if (error) {
        logger.error('Get user error:', error);
        return { data: null, error };
      }

      return { data: data.user, error: null };
    } catch (error) {
      logger.error('Get user exception:', error as Error);
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Get user failed',
          status: 500,
        } as AuthError,
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
      if (!this.supabase) {
        throw new Error('Authentication service not configured');
      }

      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        logger.error('OAuth sign in error:', error);
        return { data: null, error };
      }

      logger.info('OAuth sign in initiated', { provider });
      return { data, error: null };
    } catch (error) {
      logger.error('OAuth sign in exception:', error as Error);
      return {
        data: null,
        error: {
          message:
            error instanceof Error ? error.message : 'OAuth sign in failed',
          status: 500,
        } as AuthError,
      };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ) {
    if (!this.supabase) {
      logger.warn(
        'Cannot listen to auth state changes - service not configured'
      );
      return () => {};
    }

    const { data } = this.supabase.auth.onAuthStateChange(callback);
    return () => data.subscription.unsubscribe();
  }
}

// Export singleton instance
export const authService = new AuthService();

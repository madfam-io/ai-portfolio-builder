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

import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import {
  authService,
  type SignUpMetadata,
} from '@/lib/services/auth/auth-service';
import { logger } from '@/lib/utils/logger';

import { AuthState, AuthActions } from './types';

/**
 * Auth Store
 * Manages authentication state, user sessions, and auth operations
 */

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          ...initialState,

          // Basic setters
          setUser: user =>
            set(state => {
              state.user = user;
              state.isAuthenticated = !!user;
            }),

          setSession: session =>
            set(state => {
              state.session = session;
            }),

          setLoading: isLoading =>
            set(state => {
              state.isLoading = isLoading;
            }),

          setError: error =>
            set(state => {
              state.error = error;
            }),

          // Auth operations
          signIn: async (email, password) => {
            set(state => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const { data, error } = await authService.signIn(email, password);

              if (error) {
                throw new Error(error.message);
              }

              if (!data) {
                throw new Error('Sign in failed');
              }

              set(state => {
                state.user = data.user;
                state.session = data.session;
                state.isAuthenticated = true;
                state.isLoading = false;
                state.error = null;
              });

              logger.info('User signed in', { userId: data.user.id });
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error ? error.message : 'Sign in failed';
              set(state => {
                state.error = errorMessage;
                state.isLoading = false;
              });
              logger.error('Sign in failed', { error: errorMessage });
              throw error;
            }
          },

          signUp: async (email, password, metadata = {}) => {
            set(state => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const { data, error } = await authService.signUp(
                email,
                password,
                metadata as SignUpMetadata
              );

              if (error) {
                throw new Error(error.message);
              }

              if (!data) {
                throw new Error('Sign up failed');
              }

              set(state => {
                state.user = data.user;
                state.session = data.session;
                state.isAuthenticated = !!data.user;
                state.isLoading = false;
                state.error = null;
              });

              logger.info('User signed up', { userId: data.user?.id });
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error ? error.message : 'Sign up failed';
              set(state => {
                state.error = errorMessage;
                state.isLoading = false;
              });
              logger.error('Sign up failed', { error: errorMessage });
              throw error;
            }
          },

          signOut: async () => {
            set(state => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const { error } = await authService.signOut();

              if (error) {
                throw new Error(error.message);
              }

              // Reset all auth state
              get().resetAuth();
              logger.info('User signed out');
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error ? error.message : 'Sign out failed';
              set(state => {
                state.error = errorMessage;
                state.isLoading = false;
              });
              logger.error('Sign out failed', { error: errorMessage });
              throw error;
            }
          },

          signInWithOAuth: async provider => {
            set(state => {
              state.isLoading = true;
              state.error = null;
            });

            try {
              const { data, error } =
                await authService.signInWithOAuth(provider);

              if (error) {
                throw new Error(error.message);
              }

              if (!data?.url) {
                throw new Error('OAuth sign in failed - no redirect URL');
              }

              // Redirect to OAuth provider
              window.location.href = data.url;
            } catch (error: unknown) {
              const errorMessage =
                error instanceof Error ? error.message : 'OAuth sign in failed';
              set(state => {
                state.error = errorMessage;
                state.isLoading = false;
              });
              logger.error('OAuth sign in failed', { error: errorMessage });
              throw error;
            }
          },

          resetAuth: () => set(() => initialState),

          // Initialize auth state from session
          initializeAuth: async () => {
            set(state => {
              state.isLoading = true;
            });

            try {
              const { data: sessionData } = await authService.getSession();
              const { data: userData } = await authService.getUser();

              set(state => {
                state.session = sessionData;
                state.user = userData;
                state.isAuthenticated = !!userData;
                state.isLoading = false;
              });

              if (userData) {
                logger.info('Auth initialized', { userId: userData.id });
              }
            } catch (error) {
              logger.error('Failed to initialize auth', error as Error);
              set(state => {
                state.isLoading = false;
              });
            }
          },
        }))
      ),
      {
        name: 'auth-store',
        partialize: state => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

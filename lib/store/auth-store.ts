import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { createClient } from '@/lib/supabase/client';
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
            const supabase = createClient();
            if (!supabase) throw new Error('Supabase client not initialized');
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });

            if (error) throw error;

            set(state => {
              state.user = data.user;
              state.session = data.session;
              state.isAuthenticated = true;
              state.isLoading = false;
            });
          } catch (error: unknown) {
            set(state => {
              state.error = error.message || 'Sign in failed';
              state.isLoading = false;
            });
            throw error;
          }
        },

        signUp: async (email, password, metadata = {}) => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const supabase = createClient();
            if (!supabase) throw new Error('Supabase client not initialized');
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: metadata,
              },
            });

            if (error) throw error;

            set(state => {
              state.user = data.user;
              state.session = data.session;
              state.isAuthenticated = !!data.user;
              state.isLoading = false;
            });
          } catch (error: unknown) {
            set(state => {
              state.error = error.message || 'Sign up failed';
              state.isLoading = false;
            });
            throw error;
          }
        },

        signOut: async () => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const supabase = createClient();
            if (!supabase) throw new Error('Supabase client not initialized');
            const { error } = await supabase.auth.signOut();

            if (error) throw error;

            // Reset all auth state
            get().resetAuth();
          } catch (error: unknown) {
            set(state => {
              state.error = error.message || 'Sign out failed';
              state.isLoading = false;
            });
            throw error;
          }
        },

        resetAuth: () => set(() => initialState),
      }))
    ),
    {
      name: 'auth-store',
    }
  )
);

// Selectors
export const selectUser = (state: AuthState & AuthActions) => state.user;
export const selectIsAuthenticated = (state: AuthState & AuthActions) =>
  state.isAuthenticated;
export const selectAuthLoading = (state: AuthState & AuthActions) =>
  state.isLoading;
export const selectAuthError = (state: AuthState & AuthActions) => state.error;

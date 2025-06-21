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

import { create } from 'zustand';
import { devtools, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { UIState, UIActions, Toast } from './types';

/**
 * UI Store
 * Manages UI state including theme, modals, toasts, and loading states
 */

const initialState: UIState = {
  theme: 'system',
  sidebarOpen: true,
  modals: [],
  toasts: [],
  globalLoading: false,
  loadingMessage: null,
};

export const useUIStore = create<UIState & UIActions>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          ...initialState,

          // Theme management
          setTheme: theme =>
            set(state => {
              state.theme = theme;
              // Apply theme to document
              if (typeof window !== 'undefined') {
                const root = document.documentElement;
                root.classList.remove('light', 'dark');

                if (theme === 'system') {
                  const systemTheme = window.matchMedia(
                    '(prefers-color-scheme: dark)'
                  ).matches
                    ? 'dark'
                    : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              }
            }),

          // Sidebar management
          toggleSidebar: () =>
            set(state => {
              state.sidebarOpen = !state.sidebarOpen;
            }),

          setSidebarOpen: open =>
            set(state => {
              state.sidebarOpen = open;
            }),

          // Modal management
          openModal: modal =>
            set(state => {
              // Check if modal already exists
              const exists = state.modals.some(m => m.id === modal.id);
              if (!exists) {
                state.modals.push(modal);
              }
            }),

          closeModal: id =>
            set(state => {
              state.modals = state.modals.filter(m => m.id !== id);
            }),

          closeAllModals: () =>
            set(state => {
              state.modals = [];
            }),

          // Toast management
          showToast: toast =>
            set(state => {
              const id = `toast-${Date.now()}-${Math.random()}`;
              const newToast: Toast = {
                id,
                duration: 5000,
                ...toast,
              };
              state.toasts.push(newToast);

              // Auto-remove toast after duration
              if (newToast.duration) {
                setTimeout(() => {
                  get().removeToast(id);
                }, newToast.duration);
              }
            }),

          removeToast: id =>
            set(state => {
              state.toasts = state.toasts.filter(t => t.id !== id);
            }),

          clearToasts: () =>
            set(state => {
              state.toasts = [];
            }),

          // Loading state management
          setGlobalLoading: (loading, message = null) =>
            set(state => {
              state.globalLoading = loading;
              state.loadingMessage = message;
            }),
        })),
        {
          name: 'ui-store',
          // Only persist theme preference
          partialize: state => ({ theme: state.theme }),
        }
      )
    ),
    {
      name: 'ui-store',
    }
  )
);

// Utility functions for common toast patterns
export const showSuccessToast = (title: string, description?: string) => {
  useUIStore.getState().showToast({
    title,
    description,
    type: 'success',
  });
};

export const showErrorToast = (title: string, description?: string) => {
  useUIStore.getState().showToast({
    title,
    description,
    type: 'error',
  });
};

export const showWarningToast = (title: string, description?: string) => {
  useUIStore.getState().showToast({
    title,
    description,
    type: 'warning',
  });
};

export const showInfoToast = (title: string, description?: string) => {
  useUIStore.getState().showToast({
    title,
    description,
    type: 'info',
  });
};

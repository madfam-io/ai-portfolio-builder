import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { logger } from '@/lib/utils/logger';

import { useAIStore } from './ai-store';
import { useAuthStore } from './auth-store';
import { usePortfolioStore } from './portfolio-store';
import { RootState } from './types';
import { useUIStore } from './ui-store';

/**
 * Root Store
 * Combines all individual stores into a single root store
 */

/**
 * Root store that combines all individual stores
 * This allows for cross-store communication and a unified state interface
 */
export const useRootStore = create<RootState>()(
  devtools(
    (_set, _get) => ({
      // Auth store
      auth: {
        ...useAuthStore.getState(),
        // Override methods that need access to other stores
        signOut: async () => {
          try {
            await useAuthStore.getState().signOut();
            // Reset other stores on sign out
            usePortfolioStore.getState().resetPortfolios();
            useAIStore.getState().clearHistory();
            useUIStore.getState().clearToasts();
            useUIStore.getState().closeAllModals();
          } catch (error) {
            logger.error('Sign out error:', error as Error);
            throw error;
          }
        },
      },

      // Portfolio store
      portfolio: usePortfolioStore.getState(),

      // UI store
      ui: useUIStore.getState(),

      // AI store
      ai: useAIStore.getState(),
    }),
    {
      name: 'root-store',
    }
  )
);

// Subscribe to individual store changes and update root store
useAuthStore.subscribe(state => {
  useRootStore.setState(rootState => ({
    ...rootState,
    auth: {
      ...state,
      // Keep overridden methods
      signOut: rootState.auth.signOut,
    },
  }));
});

usePortfolioStore.subscribe(state => {
  useRootStore.setState(rootState => ({
    ...rootState,
    portfolio: state,
  }));
});

useUIStore.subscribe(state => {
  useRootStore.setState(rootState => ({
    ...rootState,
    ui: state,
  }));
});

useAIStore.subscribe(state => {
  useRootStore.setState(rootState => ({
    ...rootState,
    ai: state,
  }));
});

// Export convenience methods for accessing root store slices
const useAuth = () => useRootStore(state => state.auth);
const usePortfolio = () => useRootStore(state => state.portfolio);
const useUI = () => useRootStore(state => state.ui);
const useAI = () => useRootStore(state => state.ai);

// Export for direct access outside of React components
export const getRootStore = () => useRootStore.getState();
const getAuthStore = () => useRootStore.getState().auth;
const getPortfolioStore = () => useRootStore.getState().portfolio;
const getUIStore = () => useRootStore.getState().ui;
const getAIStore = () => useRootStore.getState().ai;

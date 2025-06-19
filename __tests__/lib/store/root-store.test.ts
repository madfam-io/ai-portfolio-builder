import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { act } from '@testing-library/react';
import {
  useRootStore,
  useAuth,
  usePortfolio,
  useUI,
  useAI,
  getRootStore,
  getAuthStore,
  getPortfolioStore,
  getUIStore,
  getAIStore,
} from '@/lib/store/root-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useUIStore } from '@/lib/store/ui-store';
import { useAIStore } from '@/lib/store/ai-store';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/store/auth-store');
jest.mock('@/lib/store/portfolio-store');
jest.mock('@/lib/store/ui-store');
jest.mock('@/lib/store/ai-store');

describe('Root Store', () => {
  const mockAuthState = {
    user: null,
    session: null,
    isLoading: false,
    error: null,
    signOut: jest.fn(),
  };

  const mockPortfolioState = {
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    resetPortfolios: jest.fn(),
  };

  const mockUIState = {
    theme: 'light',
    sidebarOpen: true,
    modals: [],
    toasts: [],
    globalLoading: false,
    clearToasts: jest.fn(),
    closeAllModals: jest.fn(),
  };

  const mockAIState = {
    selectedModels: {
      bio: 'model-1',
      project: 'model-2',
      template: 'model-3',
    },
    availableModels: [],
    enhancementHistory: [],
    quotaUsed: 0,
    quotaLimit: 100,
    isProcessing: false,
    error: null,
    clearHistory: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (logger.error as jest.Mock).mockImplementation(() => {});

    // Setup mock store implementations
    (useAuthStore.getState as jest.Mock).mockReturnValue(mockAuthState);
    (useAuthStore.subscribe as jest.Mock).mockImplementation(() => jest.fn());

    (usePortfolioStore.getState as jest.Mock).mockReturnValue(
      mockPortfolioState
    );

    (usePortfolioStore.subscribe as jest.Mock).mockImplementation(() =>
      jest.fn()
    );

    (useUIStore.getState as jest.Mock).mockReturnValue(mockUIState);
    (useUIStore.subscribe as jest.Mock).mockImplementation(() => jest.fn());

    (useAIStore.getState as jest.Mock).mockReturnValue(mockAIState);
    (useAIStore.subscribe as jest.Mock).mockImplementation(() => jest.fn());
  });

  describe('Initial State', () => {
    it('should initialize with all store states', () => {
      const rootState = useRootStore.getState();

      expect(rootState.auth).toBeDefined();
      expect(rootState.portfolio).toBeDefined();
      expect(rootState.ui).toBeDefined();
      expect(rootState.ai).toBeDefined();
    });

    it('should have overridden signOut method', () => {
      const rootState = useRootStore.getState();
      expect(rootState.auth.signOut).toBeDefined();
      expect(typeof rootState.auth.signOut).toBe('function');
    });
  });

  describe('Cross-Store Operations', () => {
    it('should reset all stores on sign out', async () => {
      const mockSignOut = jest.fn().mockResolvedValue(undefined);
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        ...mockAuthState,
        signOut: mockSignOut,
      });

      const rootState = useRootStore.getState();

      await act(async () => {
        await rootState.auth.signOut();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPortfolioState.resetPortfolios).toHaveBeenCalled();
      expect(mockAIState.clearHistory).toHaveBeenCalled();
      expect(mockUIState.clearToasts).toHaveBeenCalled();
      expect(mockUIState.closeAllModals).toHaveBeenCalled();
    });

    it('should handle sign out error', async () => {
      const mockError = new Error('Sign out failed');
      const mockSignOut = jest.fn().mockRejectedValue(mockError);
      (useAuthStore.getState as jest.Mock).mockReturnValue({
        ...mockAuthState,
        signOut: mockSignOut,
      });

      const rootState = useRootStore.getState();

      await expect(
        act(async () => {
          await rootState.auth.signOut();
        })
      ).rejects.toThrow('Sign out failed');

      expect(logger.error).toHaveBeenCalledWith('Sign out error:', mockError);
      // Other stores should not be reset on error
      expect(mockPortfolioState.resetPortfolios).not.toHaveBeenCalled();
      expect(mockAIState.clearHistory).not.toHaveBeenCalled();
    });
  });

  describe('Store Subscriptions', () => {
    it('should subscribe to auth store changes', () => {
      expect(useAuthStore.subscribe).toHaveBeenCalled();
    });

    it('should subscribe to portfolio store changes', () => {
      expect(usePortfolioStore.subscribe).toHaveBeenCalled();
    });

    it('should subscribe to UI store changes', () => {
      expect(useUIStore.subscribe).toHaveBeenCalled();
    });

    it('should subscribe to AI store changes', () => {
      expect(useAIStore.subscribe).toHaveBeenCalled();
    });

    it('should update root store when auth store changes', () => {
      const authSubscriber = (useAuthStore.subscribe as jest.Mock).mock
        .calls[0][0];
      const newAuthState = {
        ...mockAuthState,
        user: { id: 'user-123', email: 'test@example.com' },
      };

      act(() => {
        authSubscriber(newAuthState);
      });

      const rootState = useRootStore.getState();
      expect(rootState.auth.user).toEqual(newAuthState.user);
      // Should preserve overridden signOut method
      expect(typeof rootState.auth.signOut).toBe('function');
    });

    it('should update root store when portfolio store changes', () => {
      const portfolioSubscriber = (usePortfolioStore.subscribe as jest.Mock)
        .mock.calls[0][0];
      const newPortfolioState = {
        ...mockPortfolioState,
        portfolios: [{ id: 'portfolio-1', title: 'My Portfolio' }],
      };

      act(() => {
        portfolioSubscriber(newPortfolioState);
      });

      const rootState = useRootStore.getState();
      expect(rootState.portfolio.portfolios).toEqual(
        newPortfolioState.portfolios
      );
    });

    it('should update root store when UI store changes', () => {
      const uiSubscriber = (useUIStore.subscribe as jest.Mock).mock.calls[0][0];
      const newUIState = {
        ...mockUIState,
        theme: 'dark',
        sidebarOpen: false,
      };

      act(() => {
        uiSubscriber(newUIState);
      });

      const rootState = useRootStore.getState();
      expect(rootState.ui.theme).toBe('dark');
      expect(rootState.ui.sidebarOpen).toBe(false);
    });

    it('should update root store when AI store changes', () => {
      const aiSubscriber = (useAIStore.subscribe as jest.Mock).mock.calls[0][0];
      const newAIState = {
        ...mockAIState,
        quotaUsed: 50,
        isProcessing: true,
      };

      act(() => {
        aiSubscriber(newAIState);
      });

      const rootState = useRootStore.getState();
      expect(rootState.ai.quotaUsed).toBe(50);
      expect(rootState.ai.isProcessing).toBe(true);
    });
  });

  describe('Convenience Hooks', () => {
    it('should provide useAuth hook', () => {
      const authState = useAuth();
      expect(authState).toBeDefined();
      expect(authState.signOut).toBeDefined();
    });

    it('should provide usePortfolio hook', () => {
      const portfolioState = usePortfolio();
      expect(portfolioState).toBeDefined();
      expect(portfolioState.resetPortfolios).toBeDefined();
    });

    it('should provide useUI hook', () => {
      const uiState = useUI();
      expect(uiState).toBeDefined();
      expect(uiState.clearToasts).toBeDefined();
    });

    it('should provide useAI hook', () => {
      const aiState = useAI();
      expect(aiState).toBeDefined();
      expect(aiState.clearHistory).toBeDefined();
    });
  });

  describe('Direct Access Functions', () => {
    it('should provide getRootStore function', () => {
      const rootStore = getRootStore();
      expect(rootStore).toBeDefined();
      expect(rootStore.auth).toBeDefined();
      expect(rootStore.portfolio).toBeDefined();
      expect(rootStore.ui).toBeDefined();
      expect(rootStore.ai).toBeDefined();
    });

    it('should provide getAuthStore function', () => {
      const authStore = getAuthStore();
      expect(authStore).toBeDefined();
      expect(authStore.signOut).toBeDefined();
    });

    it('should provide getPortfolioStore function', () => {
      const portfolioStore = getPortfolioStore();
      expect(portfolioStore).toBeDefined();
      expect(portfolioStore.resetPortfolios).toBeDefined();
    });

    it('should provide getUIStore function', () => {
      const uiStore = getUIStore();
      expect(uiStore).toBeDefined();
      expect(uiStore.clearToasts).toBeDefined();
    });

    it('should provide getAIStore function', () => {
      const aiStore = getAIStore();
      expect(aiStore).toBeDefined();
      expect(aiStore.clearHistory).toBeDefined();
    });
  });
});

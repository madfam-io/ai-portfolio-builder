import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

// Mock zustand stores
const mockPortfolioStore = {
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,
  fetchPortfolios: jest.fn(),
  createPortfolio: jest.fn(),
  updatePortfolio: jest.fn(),
  deletePortfolio: jest.fn(),
  setCurrentPortfolio: jest.fn(),
};

jest.mock('@/lib/store/portfolio-store', () => ({ 
  usePortfolioStore: jest.fn(() => mockPortfolioStore),
 }));

jest.mock('zustand', () => ({
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock zustand

  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock zustand

  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));
// Mock zustand

// Mock zustand create function

  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));
  describe('Initial State', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

    it('should initialize with all store states', async () => {
      const rootState = useRootStore.getState();

      expect(rootState.auth).toBeDefined();
      expect(rootState.portfolio).toBeDefined();
      expect(rootState.ui).toBeDefined();
      expect(rootState.ai).toBeDefined();
    });

    it('should have overridden signOut method', async () => {
      const rootState = useRootStore.getState();
      expect(rootState.auth.signOut).toBeDefined();
      expect(typeof rootState.auth.signOut).toBe('function');
    });
  });

  describe('Cross-Store Operations', () => {
    it('should reset all stores on sign out', async () => {
      const mockSignOut = jest.fn().mockResolvedValue(void 0);
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
    it('should subscribe to auth store changes', async () => {
      expect(useAuthStore.subscribe).toHaveBeenCalled();
    });

    it('should subscribe to portfolio store changes', async () => {
      expect(usePortfolioStore.subscribe).toHaveBeenCalled();
    });

    it('should subscribe to UI store changes', async () => {
      expect(useUIStore.subscribe).toHaveBeenCalled();
    });

    it('should subscribe to AI store changes', async () => {
      expect(useAIStore.subscribe).toHaveBeenCalled();
    });

    it('should update root store when auth store changes', async () => {
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

    it('should update root store when portfolio store changes', async () => {
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

    it('should update root store when UI store changes', async () => {
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

    it('should update root store when AI store changes', async () => {
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
    it('should provide useAuth hook', async () => {
      const authState = useAuth();
      expect(authState).toBeDefined();
      expect(authState.signOut).toBeDefined();
    });

    it('should provide usePortfolio hook', async () => {
      const portfolioState = usePortfolio();
      expect(portfolioState).toBeDefined();
      expect(portfolioState.resetPortfolios).toBeDefined();
    });

    it('should provide useUI hook', async () => {
      const uiState = useUI();
      expect(uiState).toBeDefined();
      expect(uiState.clearToasts).toBeDefined();
    });

    it('should provide useAI hook', async () => {
      const aiState = useAI();
      expect(aiState).toBeDefined();
      expect(aiState.clearHistory).toBeDefined();
    });
  });

  describe('Direct Access Functions', () => {
    it('should provide getRootStore function', async () => {
      const rootStore = getRootStore();
      expect(rootStore).toBeDefined();
      expect(rootStore.auth).toBeDefined();
      expect(rootStore.portfolio).toBeDefined();
      expect(rootStore.ui).toBeDefined();
      expect(rootStore.ai).toBeDefined();
    });

    it('should provide getAuthStore function', async () => {
      const authStore = getAuthStore();
      expect(authStore).toBeDefined();
      expect(authStore.signOut).toBeDefined();
    });

    it('should provide getPortfolioStore function', async () => {
      const portfolioStore = getPortfolioStore();
      expect(portfolioStore).toBeDefined();
      expect(portfolioStore.resetPortfolios).toBeDefined();
    });

    it('should provide getUIStore function', async () => {
      const uiStore = getUIStore();
      expect(uiStore).toBeDefined();
      expect(uiStore.clearToasts).toBeDefined();
    });

    it('should provide getAIStore function', async () => {
      const aiStore = getAIStore();
      expect(aiStore).toBeDefined();
      expect(aiStore.clearHistory).toBeDefined();
    });
  });
});
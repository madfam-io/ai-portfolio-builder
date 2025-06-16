import { useCallback, useEffect, useMemo } from 'react';
import { shallow } from 'zustand/shallow';

import { useAIStore } from './ai-store';
import { useAuthStore } from './auth-store';
import { usePortfolioStore } from './portfolio-store';
import { useUIStore } from './ui-store';

/**
 * Store Hooks
 * Custom hooks for accessing and manipulating store state
 */

/**
 * Hook for authenticated user data with loading state
 */
export function useUser() {
  const { user, isLoading, isAuthenticated } = useAuthStore(
    state => ({
      user: state.user,
      isLoading: state.isLoading,
      isAuthenticated: state.isAuthenticated,
    }),
    shallow
  );

  return {
    user,
    isLoading,
    isAuthenticated,
    isGuest: !isAuthenticated,
  };
}

/**
 * Hook for current portfolio with auto-save
 */
export function useCurrentPortfolio() {
  const {
    currentPortfolio,
    isEditing,
    isSaving,
    updatePortfolio,
    setCurrentPortfolio,
  } = usePortfolioStore(
    state => ({
      currentPortfolio: state.currentPortfolio,
      isEditing: state.isEditing,
      isSaving: state.isSaving,
      updatePortfolio: state.updatePortfolio,
      setCurrentPortfolio: state.setCurrentPortfolio,
    }),
    shallow
  );

  const updateField = useCallback(
    (field: string, value: unknown) => {
      if (!currentPortfolio) return;

      setCurrentPortfolio({
        ...currentPortfolio,
        [field]: value,
      });
    },
    [currentPortfolio, setCurrentPortfolio]
  );

  const updateNestedField = useCallback(
    (path: string, value: unknown) => {
      if (!currentPortfolio) return;

      const keys = path.split('.');
      const updated = { ...currentPortfolio };
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!key) continue;
        current[key] = { ...current[key] };
        current = current[key];
      }

      const lastKey = keys[keys.length - 1];
      if (lastKey) {
        current[lastKey] = value;
      }
      setCurrentPortfolio(updated);
    },
    [currentPortfolio, setCurrentPortfolio]
  );

  return {
    portfolio: currentPortfolio,
    isEditing,
    isSaving,
    updateField,
    updateNestedField,
    save: () =>
      currentPortfolio &&
      updatePortfolio(currentPortfolio.id, currentPortfolio),
  };
}

/**
 * Hook for theme management with system detection
 */
export function useTheme() {
  const { theme, setTheme } = useUIStore(
    state => ({
      theme: state.theme,
      setTheme: state.setTheme,
    }),
    shallow
  );

  // Apply theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const resolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme: () => setTheme(theme === 'light' ? 'dark' : 'light'),
  };
}

/**
 * Hook for AI model selection with quota tracking
 */
export function useAIModels() {
  const {
    selectedModels,
    availableModels,
    quotaUsed,
    quotaLimit,
    setSelectedModel,
    loadModels,
  } = useAIStore(
    state => ({
      selectedModels: state.selectedModels,
      availableModels: state.availableModels,
      quotaUsed: state.quotaUsed,
      quotaLimit: state.quotaLimit,
      setSelectedModel: state.setSelectedModel,
      loadModels: state.loadModels,
    }),
    shallow
  );

  // Load models on mount
  useEffect(() => {
    if (availableModels.length === 0) {
      loadModels().catch(() => {
        // Error is handled by the store
      });
    }
  }, [availableModels.length, loadModels]);

  const quotaRemaining = quotaLimit - quotaUsed;
  const quotaPercentage = (quotaUsed / quotaLimit) * 100;
  const isQuotaExceeded = quotaUsed >= quotaLimit;

  return {
    selectedModels,
    availableModels,
    quota: {
      used: quotaUsed,
      limit: quotaLimit,
      remaining: quotaRemaining,
      percentage: quotaPercentage,
      isExceeded: isQuotaExceeded,
    },
    selectModel: setSelectedModel,
  };
}

/**
 * Hook for modal management
 */
export function useModal(modalId: string) {
  const { modals, openModal, closeModal } = useUIStore(
    state => ({
      modals: state.modals,
      openModal: state.openModal,
      closeModal: state.closeModal,
    }),
    shallow
  );

  const isOpen = modals.some(m => m.id === modalId);

  const open = useCallback(
    (component: React.ComponentType<any>, props?: unknown) => {
      openModal({ id: modalId, component, props });
    },
    [modalId, openModal]
  );

  const close = useCallback(() => {
    closeModal(modalId);
  }, [modalId, closeModal]);

  return {
    isOpen,
    open,
    close,
  };
}

/**
 * Hook for toast notifications
 */
export function useToasts() {
  const { toasts, showToast, removeToast, clearToasts } = useUIStore(
    state => ({
      toasts: state.toasts,
      showToast: state.showToast,
      removeToast: state.removeToast,
      clearToasts: state.clearToasts,
    }),
    shallow
  );

  return {
    toasts,
    show: showToast,
    remove: removeToast,
    clear: clearToasts,
    success: (title: string, description?: string) =>
      showToast({ title, description, type: 'success' }),
    error: (title: string, description?: string) =>
      showToast({ title, description, type: 'error' }),
    warning: (title: string, description?: string) =>
      showToast({ title, description, type: 'warning' }),
    info: (title: string, description?: string) =>
      showToast({ title, description, type: 'info' }),
  };
}

/**
 * Hook for global loading state
 */
export function useGlobalLoading() {
  const { globalLoading, loadingMessage, setGlobalLoading } = useUIStore(
    state => ({
      globalLoading: state.globalLoading,
      loadingMessage: state.loadingMessage,
      setGlobalLoading: state.setGlobalLoading,
    }),
    shallow
  );

  const withLoading = useCallback(
    async <T>(action: () => Promise<T>, message?: string): Promise<T> => {
      setGlobalLoading(true, message);
      try {
        return await action();
      } finally {
        setGlobalLoading(false);
      }
    },
    [setGlobalLoading]
  );

  return {
    isLoading: globalLoading,
    message: loadingMessage,
    setLoading: setGlobalLoading,
    withLoading,
  };
}

/**
 * Hook for portfolio list with filtering and sorting
 */
export function usePortfolios(options?: {
  filter?: (portfolio: unknown) => boolean;
  sort?: (a: unknown, b: unknown) => number;
}) {
  const { portfolios, isLoading, loadPortfolios } = usePortfolioStore(
    state => ({
      portfolios: state.portfolios,
      isLoading: state.isLoading,
      loadPortfolios: state.loadPortfolios,
    }),
    shallow
  );

  const { user } = useAuthStore(state => ({ user: state.user }), shallow);

  // Load portfolios on mount
  useEffect(() => {
    if (portfolios.length === 0 && !isLoading && user?.id) {
      loadPortfolios().catch(() => {
        // Error is handled by the store
      });
    }
  }, [portfolios.length, isLoading, loadPortfolios, user?.id]);

  const filteredAndSorted = useMemo(() => {
    let result = [...portfolios];

    if (options?.filter) {
      result = result.filter(options.filter);
    }

    if (options?.sort) {
      result.sort(options.sort);
    }

    return result;
  }, [portfolios, options?.filter, options?.sort]);

  return {
    portfolios: filteredAndSorted,
    isLoading,
    reload: loadPortfolios,
    count: filteredAndSorted.length,
    isEmpty: filteredAndSorted.length === 0,
  };
}

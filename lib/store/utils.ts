/**
 * Store Utilities
 * Common patterns and helper functions for Zustand stores
 */

import { StateCreator, StoreApi } from 'zustand';

import { showErrorToast, showSuccessToast } from './ui-store';

/**
 * Async action wrapper with loading and error handling
 */
export function createAsyncAction<T extends any[], R>(
  action: (...args: T) => Promise<R>,
  options?: {
    loadingMessage?: string;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (result: R) => void;
    onError?: (error: Error) => void;
  }
) {
  return async (...args: T): Promise<R> => {
    const { ui } = await import('./root-store').then(m => m.getRootStore());

    if (options?.loadingMessage) {
      ui.setGlobalLoading(true, options.loadingMessage);
    }

    try {
      const result = await action(...args);

      if (options?.successMessage) {
        showSuccessToast(options.successMessage);
      }

      options?.onSuccess?.(result);
      return result;
    } catch (error: any) {
      const errorMessage =
        options?.errorMessage || error.message || 'Operation failed';
      showErrorToast('Error', errorMessage);

      options?.onError?.(error);
      throw error;
    } finally {
      if (options?.loadingMessage) {
        ui.setGlobalLoading(false);
      }
    }
  };
}

/**
 * Loading state manager for async operations
 */
export interface LoadingState {
  isLoading: boolean;
  loadingKey: string | null;
  loadingKeys: Set<string>;
}

export interface LoadingActions {
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
  isLoadingKey: (key: string) => boolean;
  resetLoading: () => void;
}

export const createLoadingSlice = <T extends object>(
  initialState?: Partial<LoadingState>
): StateCreator<
  T & LoadingState & LoadingActions,
  [],
  [],
  LoadingState & LoadingActions
> => {
  return (set, get) => ({
    isLoading: false,
    loadingKey: null,
    loadingKeys: new Set(),
    ...initialState,

    startLoading: key =>
      set((state: any) => ({
        ...state,
        isLoading: true,
        loadingKey: key || state.loadingKey,
        loadingKeys: key
          ? new Set([...state.loadingKeys, key])
          : state.loadingKeys,
      })),

    stopLoading: key =>
      set((state: any) => {
        const newLoadingKeys = new Set(state.loadingKeys);
        if (key) {
          newLoadingKeys.delete(key);
        }
        return {
          ...state,
          loadingKeys: newLoadingKeys,
          loadingKey: state.loadingKey === key ? null : state.loadingKey,
          isLoading: newLoadingKeys.size > 0,
        };
      }),

    isLoadingKey: key => {
      const state = get() as any;
      return state.loadingKeys.has(key);
    },

    resetLoading: () =>
      set((state: any) => ({
        ...state,
        isLoading: false,
        loadingKey: null,
        loadingKeys: new Set(),
      })),
  });
};

/**
 * Error state manager
 */
export interface ErrorState {
  error: string | null;
  errors: Map<string, string>;
}

export interface ErrorActions {
  setError: (error: string | null, key?: string) => void;
  clearError: (key?: string) => void;
  clearAllErrors: () => void;
  hasError: (key?: string) => boolean;
}

export const createErrorSlice = <T extends object>(
  initialState?: Partial<ErrorState>
): StateCreator<
  T & ErrorState & ErrorActions,
  [],
  [],
  ErrorState & ErrorActions
> => {
  return (set, get) => ({
    error: null,
    errors: new Map(),
    ...initialState,

    setError: (error, key) =>
      set((state: any) => {
        const newErrors = new Map(state.errors);
        if (key) {
          newErrors.set(key, error || '');
        }
        return {
          ...state,
          error: key ? state.error : error,
          errors: newErrors,
        };
      }),

    clearError: key =>
      set((state: any) => {
        const newErrors = new Map(state.errors);
        if (key) {
          newErrors.delete(key);
        }
        return {
          ...state,
          error: key ? state.error : null,
          errors: newErrors,
        };
      }),

    clearAllErrors: () =>
      set((state: any) => ({
        ...state,
        error: null,
        errors: new Map(),
      })),

    hasError: key => {
      const state = get() as any;
      if (key) {
        return state.errors.has(key);
      }
      return !!state.error || state.errors.size > 0;
    },
  });
};

/**
 * Optimistic update helper
 */
export function createOptimisticUpdate<T, R>(
  optimisticUpdate: (state: T) => void,
  actualUpdate: () => Promise<R>,
  rollback: (state: T, error: Error) => void
) {
  return async (
    set: StoreApi<T>['setState'],
    _get: StoreApi<T>['getState']
  ): Promise<R> => {
    // Apply optimistic update
    set(state => {
      optimisticUpdate(state);
      return state;
    });

    try {
      // Perform actual update
      const result = await actualUpdate();
      return result;
    } catch (error: any) {
      // Rollback on error
      set(state => {
        rollback(state, error);
        return state;
      });
      throw error;
    }
  };
}

/**
 * Debounced action creator
 */
export function createDebouncedAction<T extends any[], R>(
  action: (...args: T) => R | Promise<R>,
  delay: number = 300
) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: T): Promise<R> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(async () => {
        try {
          const result = await action(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
}

/**
 * Store reset helper
 */
export function createResetAction<T extends object>(
  initialState: T
): StateCreator<T & { reset: () => void }, [], [], { reset: () => void }> {
  return set => ({
    reset: () => set(() => initialState),
  });
}

/**
 * Persist helper with migration support
 */
export interface PersistOptions<T> {
  name: string;
  version?: number;
  migrate?: (persistedState: any, version: number) => T;
  partialize?: (state: T) => Partial<T>;
}

export function createPersistConfig<T>(options: PersistOptions<T>) {
  return {
    name: options.name,
    version: options.version || 1,
    migrate: options.migrate,
    partialize: options.partialize,
  };
}

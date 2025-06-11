/**
 * Store Module Exports
 * Central export point for all store-related functionality
 */

// Export individual stores
export { useAuthStore } from './auth-store';
export { usePortfolioStore } from './portfolio-store';
export { useUIStore, showSuccessToast, showErrorToast, showWarningToast, showInfoToast } from './ui-store';
export { useAIStore } from './ai-store';

// Export root store and slice hooks
export {
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
} from './root-store';

// Export custom hooks
export {
  useUser,
  useCurrentPortfolio,
  useTheme,
  useAIModels,
  useModal,
  useToasts,
  useGlobalLoading,
  usePortfolios,
} from './hooks';

// Export utilities
export {
  createAsyncAction,
  createLoadingSlice,
  createErrorSlice,
  createOptimisticUpdate,
  createDebouncedAction,
  createResetAction,
  createPersistConfig,
  type LoadingState,
  type LoadingActions,
  type ErrorState,
  type ErrorActions,
  type PersistOptions,
} from './utils';

// Export types
export type {
  AuthState,
  AuthActions,
  PortfolioState,
  PortfolioActions,
  UIState,
  UIActions,
  Toast,
  Modal,
  AIState,
  AIActions,
  AIModel,
  AIEnhancement,
  RootState,
} from './types';
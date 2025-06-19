
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================

import React, { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import type { StoreApi } from 'zustand';

/**
 * Zustand store testing utilities
 */

// Create a test store wrapper
export function createStoreWrapper<T>(useStore: () => T) {
  const StoreWrapper = ({ children }: { children: ReactNode }) => {
    return <>{children}</>;
  };

  return StoreWrapper;
}

// Test a Zustand store hook
export function renderStore<T>(useStore: () => T) {
  const wrapper = createStoreWrapper(useStore);
  return renderHook(() => useStore(), { wrapper });
}

// Mock store state
export function mockStoreState<T extends object>(
  store: StoreApi<T>,
  state: Partial<T>
) {
  act(() => {
    store.setState(state as T);
  });
}

// Create a mock store for testing
export function createMockStore<T extends object>(
  initialState: T,
  actions?: Partial<T>
): StoreApi<T> {
  let state = { ...initialState, ...actions };
  const listeners = new Set<(state: T, prevState: T) => void>();

  const api: StoreApi<T> = {
    getState: () => state,
    setState: (partial, replace) => {
      const nextState =
        typeof partial === 'function'
          ? (partial as (state: T) => T)(state)
          : partial;

      const prevState = state;
      state = replace ? (nextState as T) : { ...state, ...nextState };

      listeners.forEach(listener => listener(state, prevState));
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => {
      listeners.clear();
    },
  };

  return api;
}

// Test store actions
export async function testStoreAction<T>(
  result: { current: T },
  action: (store: T) => void | Promise<void>,
  expectations: (store: T) => void
) {
  await act(async () => {
    await action(result.current);
  });

  expectations(result.current);
}

// Mock localStorage for persistent stores
export function mockLocalStorage() {
  const storage: Record<string, string> = {};

  const localStorageMock = {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(storage).length;
    },
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return {
    ...localStorageMock,
    getStorage: () => storage,
  };
}

// Mock sessionStorage
export function mockSessionStorage() {
  const storage: Record<string, string> = {};

  const sessionStorageMock = {
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    clear: jest.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    }),
    get length() {
      return Object.keys(storage).length;
    },
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  return {
    ...sessionStorageMock,
    getStorage: () => storage,
  };
}

// Test helpers for specific stores

// Auth store test helper
export const createMockAuthStore = (overrides = {}) => ({
  user: null,
  session: null,
  loading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  updateUser: jest.fn(),
  clearError: jest.fn(),
  checkAuth: jest.fn(),
  ...overrides,
});

// Portfolio store test helper
export const createMockPortfolioStore = (overrides = {}) => ({
  portfolios: [],
  currentPortfolio: null,
  loading: false,
  error: null,
  fetchPortfolios: jest.fn(),
  fetchPortfolio: jest.fn(),
  createPortfolio: jest.fn(),
  updatePortfolio: jest.fn(),
  deletePortfolio: jest.fn(),
  publishPortfolio: jest.fn(),
  unpublishPortfolio: jest.fn(),
  setCurrentPortfolio: jest.fn(),
  clearError: jest.fn(),
  ...overrides,
});

// UI store test helper
export const createMockUIStore = (overrides = {}) => ({
  theme: 'light',
  sidebarOpen: true,
  mobileMenuOpen: false,
  modalOpen: false,
  notifications: [],
  setTheme: jest.fn(),
  toggleSidebar: jest.fn(),
  toggleMobileMenu: jest.fn(),
  openModal: jest.fn(),
  closeModal: jest.fn(),
  addNotification: jest.fn(),
  removeNotification: jest.fn(),
  clearNotifications: jest.fn(),
  ...overrides,
});

// AI store test helper
export const createMockAIStore = (overrides = {}) => ({
  selectedModel: 'llama3-8b-8192',
  enhancedContent: {},
  loading: false,
  error: null,
  setModel: jest.fn(),
  enhanceBio: jest.fn(),
  enhanceProject: jest.fn(),
  recommendTemplate: jest.fn(),
  clearEnhancedContent: jest.fn(),
  clearError: jest.fn(),
  ...overrides,
});

// Wait for store updates
export async function waitForStoreUpdate() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

// Test store middleware
export function createStoreMiddleware<T extends object>(
  middleware: (config: any) => any
) {
  const logs: any[] = [];

  const testMiddleware = (config: any) => (set: any, get: any, api: any) => {
    const wrappedSet = (...args: any[]) => {
      logs.push({ type: 'set', args, state: get() });
      return set(...args);
    };

    return middleware(config)(wrappedSet, get, api);
  };

  return {
    middleware: testMiddleware,
    getLogs: () => logs,
    clearLogs: () => (logs.length = 0),
  };
}

// Store snapshot testing
export function createStoreSnapshot<T extends object>(store: StoreApi<T>) {
  const snapshots: T[] = [];

  const unsubscribe = store.subscribe(state => {
    snapshots.push({ ...state });
  });

  return {
    getSnapshots: () => snapshots,
    getLatestSnapshot: () => snapshots[snapshots.length - 1],
    clearSnapshots: () => (snapshots.length = 0),
    unsubscribe,
  };
}

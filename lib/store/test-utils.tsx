import React from 'react';
import { act } from '@testing-library/react';
import { StoreApi } from 'zustand';

/**
 * Store Test Utilities
 * Helper functions and mocks for testing Zustand stores
 */

/**
 * Create a mock store for testing
 */
export function createMockStore<T>(initialState: T): StoreApi<T> {
  let state = initialState;
  const listeners = new Set<(state: T, prevState: T) => void>();

  return {
    getState: () => state,
    setState: (partial: unknown, replace?: unknown) => {
      const nextState =
        typeof partial === 'function' ? partial(state) : partial;

      const prevState = state;
      state = replace ? (nextState as T) : Object.assign({}, state, nextState);

      listeners.forEach(listener => listener(state, prevState));
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    destroy: () => {
      listeners.clear();
    },
    getInitialState: () => initialState,
  };
}

/**
 * Wait for async store actions to complete
 */
export async function waitForStoreUpdate<T>(
  store: StoreApi<T>,
  predicate: (state: T) => boolean,
  timeout = 5000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkState = (): void => {
      const state = store.getState();
      if (predicate(state)) {
        resolve(state);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('Store update timeout'));
        return;
      }

      setTimeout(checkState, 10);
    };

    checkState();
  });
}

/**
 * Test helper for store actions
 */
export async function testStoreAction<T, R>(
  store: StoreApi<T>,
  action: (state: T) => R | Promise<R>,
  expectedChanges?: Partial<T>
): Promise<R> {
  const result = await act(async () => {
    const state = store.getState();
    return await action(state);
  });

  if (expectedChanges) {
    const newState = store.getState();
    expect(newState).toMatchObject(expectedChanges);
  }

  return result;
}

/**
 * Create a test wrapper for stores with providers
 */
export function createStoreWrapper(stores: Record<string, any>) {
  return function StoreWrapper({ children }: { children: React.ReactNode }) {
    // Initialize stores if needed
    Object.values(stores).forEach(store => {
      if (typeof store.getState === 'function') {
        // Store is already initialized
      }
    });

    return <>{children}</>;
  };
}

/**
 * Reset all stores to initial state
 */
export function resetStores(...stores: Array<{ getState: () => any }>) {
  stores.forEach(store => {
    const state = store.getState();
    if (typeof state.reset === 'function') {
      state.reset();
    } else if (typeof state.resetAuth === 'function') {
      state.resetAuth();
    } else if (typeof state.resetPortfolios === 'function') {
      state.resetPortfolios();
    }
  });
}

/**
 * Mock Supabase client for auth testing
 */
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
  },
};

/**
 * Mock portfolio service
 */
export const mockPortfolioService = {
  getAllPortfolios: jest.fn().mockResolvedValue([]),
  getPortfolioById: jest.fn(),
  createPortfolio: jest.fn(),
  updatePortfolio: jest.fn(),
  deletePortfolio: jest.fn(),
};

/**
 * Mock AI service responses
 */
export const mockAIResponses = {
  enhanceBio: {
    enhancedBio: 'Enhanced professional bio text',
    qualityScore: 0.85,
    suggestions: ['Add metrics', 'Include achievements'],
  },
  optimizeProject: {
    optimizedDescription: 'Optimized project description',
    qualityScore: 0.82,
    improvements: ['Added outcomes', 'Highlighted technologies'],
  },
  recommendTemplate: {
    recommendedTemplate: 'developer',
    confidence: 0.9,
    alternatives: ['designer', 'consultant'],
  },
};

/**
 * Test data generators
 */
export const generateTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
  created_at: new Date().toISOString(),
  ...overrides,
});

export const generateTestPortfolio = (overrides = {}) => ({
  id: 'test-portfolio-id',
  userId: 'test-user-id',
  title: 'Test Portfolio',
  template: 'developer',
  personalInfo: {
    name: 'Test User',
    title: 'Software Developer',
    bio: 'Test bio',
    email: 'test@example.com',
    phone: '+1234567890',
    location: 'Test City',
  },
  sections: {
    projects: [],
    skills: [],
    experience: [],
    education: [],
  },
  theme: {
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    fontFamily: 'Arial',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

/**
 * Store testing example
 * @example
 * describe('ExampleStore', () => {
 *   beforeEach(() => {
 *     // Reset store before each test
 *     const { reset } = useExampleStore.getState();
 *     reset();
 *   });
 *
 *   it('should update state correctly', async () => {
 *     const { result } = renderHook(() => useExampleStore());
 *
 *     act(() => {
 *       result.current.updateField('value');
 *     });
 *
 *     expect(result.current.field).toBe('value');
 *   });
 * });
 */

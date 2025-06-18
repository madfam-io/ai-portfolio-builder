/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';


// Mock portfolio store for testing
const createPortfolioStore = () => {
  let state = {
    currentPortfolio: null,
    isLoading: false,
    isDirty: false,
    lastSaved: null,
    error: null,
  };

  return {
    getState: () => state,
    setState: (newState: any) => {
      state = { ...state, ...newState };
    },
    reset: () => {
      state = {
        currentPortfolio: null,
        isLoading: false,
        isDirty: false,
        lastSaved: null,
        error: null,
      };
    },
  };
};

describe('Portfolio Store Simple Tests', () => {
  let store: ReturnType<typeof createPortfolioStore>;

  beforeEach(() => {
    store = createPortfolioStore();
  });

  it('should initialize with default state', () => {
    const state = store.getState();

    expect(state.currentPortfolio).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isDirty).toBe(false);
    expect(state.lastSaved).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should update state correctly', () => {
    const mockPortfolio = {
      id: 'test',
      name: 'John Doe',
      title: 'Developer',
    };

    store.setState({
      currentPortfolio: mockPortfolio,
      isDirty: true,
    });

    const state = store.getState();
    expect(state.currentPortfolio).toEqual(mockPortfolio);
    expect(state.isDirty).toBe(true);
  });

  it('should reset state correctly', () => {
    store.setState({
      currentPortfolio: { id: 'test', name: 'John' },
      isDirty: true,
      error: 'Some error',
    });

    store.reset();

    const state = store.getState();
    expect(state.currentPortfolio).toBeNull();
    expect(state.isDirty).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle loading states', () => {
    store.setState({ isLoading: true });
    expect(store.getState().isLoading).toBe(true);

    store.setState({ isLoading: false });
    expect(store.getState().isLoading).toBe(false);
  });

  it('should handle error states', () => {
    const errorMessage = 'Failed to save portfolio';

    store.setState({ error: errorMessage });
    expect(store.getState().error).toBe(errorMessage);

    store.setState({ error: null });
    expect(store.getState().error).toBeNull();
  });
});

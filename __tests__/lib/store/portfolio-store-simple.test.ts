import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { render, actHook, act } from '@testing-library/react';
/**
 * @jest-environment jsdom
 */

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
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    store = createPortfolioStore();
  });

  it('should initialize with default state', async () => {
    const state = store.getState();

    expect(state.currentPortfolio).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isDirty).toBe(false);
    expect(state.lastSaved).toBeNull();
    expect(state.error).toBeNull();
  });

  it('should update state correctly', async () => {
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

  it('should reset state correctly', async () => {
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

  it('should handle loading states', async () => {
    store.setState({ isLoading: true });
    expect(store.getState().isLoading).toBe(true);

    store.setState({ isLoading: false });
    expect(store.getState().isLoading).toBe(false);
  });

  it('should handle error states', async () => {
    const errorMessage = 'Failed to save portfolio';

    store.setState({ error: errorMessage });
    expect(store.getState().error).toBe(errorMessage);

    store.setState({ error: null });
    expect(store.getState().error).toBeNull();
  });
});

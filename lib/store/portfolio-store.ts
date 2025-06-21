/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { logger } from '@/lib/utils/logger';
import { Portfolio } from '@/types/portfolio';

import { PortfolioState, PortfolioActions } from './types';

/**
 * Portfolio Store
 * Manages portfolio data, editing state, and portfolio operations
 */

const initialState: PortfolioState = {
  portfolios: [],
  currentPortfolio: null,
  currentPortfolioId: null,
  isEditing: false,
  isSaving: false,
  isLoading: false,
  error: null,
  lastSaved: null,
  history: [],
  historyIndex: -1,
  hasUnsavedChanges: false,
};

// Helper function to make API calls
async function apiCall<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API call failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || data;
}

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,

        // Basic setters
        setPortfolios: portfolios =>
          set(state => {
            state.portfolios = portfolios;
          }),

        setCurrentPortfolio: portfolio =>
          set(state => {
            state.currentPortfolio = portfolio;
            state.currentPortfolioId = portfolio?.id || null;
            state.hasUnsavedChanges = false;
          }),

        setEditing: isEditing =>
          set(state => {
            state.isEditing = isEditing;
          }),

        setSaving: isSaving =>
          set(state => {
            state.isSaving = isSaving;
          }),

        setLoading: isLoading =>
          set(state => {
            state.isLoading = isLoading;
          }),

        setError: error =>
          set(state => {
            state.error = error;
          }),

        // Portfolio operations
        loadPortfolios: async () => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const { portfolios } = await apiCall<{ portfolios: Portfolio[] }>(
              '/api/v1/portfolios'
            );

            set(state => {
              state.portfolios = portfolios;
              state.isLoading = false;
            });

            return portfolios;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to load portfolios';
            logger.error('Failed to load portfolios:', error as Error);

            set(state => {
              state.error = errorMessage;
              state.isLoading = false;
            });

            throw error;
          }
        },

        loadPortfolio: async (id: string) => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const { portfolio } = await apiCall<{ portfolio: Portfolio }>(
              `/api/v1/portfolios/${id}`
            );

            set(state => {
              state.currentPortfolio = portfolio;
              state.currentPortfolioId = id;
              state.isLoading = false;
              state.hasUnsavedChanges = false;

              // Reset history when loading a new portfolio
              state.history = [];
              state.historyIndex = -1;
            });

            return portfolio;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to load portfolio';
            logger.error('Failed to load portfolio:', error as Error);

            set(state => {
              state.error = errorMessage;
              state.isLoading = false;
            });

            throw error;
          }
        },

        createPortfolio: async data => {
          set(state => {
            state.isSaving = true;
            state.error = null;
          });

          try {
            const { portfolio } = await apiCall<{ portfolio: Portfolio }>(
              '/api/v1/portfolios',
              {
                method: 'POST',
                body: JSON.stringify(data),
              }
            );

            set(state => {
              state.portfolios.push(portfolio);
              state.currentPortfolio = portfolio;
              state.currentPortfolioId = portfolio.id;
              state.isSaving = false;
              state.hasUnsavedChanges = false;
            });

            return portfolio;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to create portfolio';
            logger.error('Failed to create portfolio:', error as Error);

            set(state => {
              state.error = errorMessage;
              state.isSaving = false;
            });

            throw error;
          }
        },

        updatePortfolio: async (id, data) => {
          set(state => {
            state.isSaving = true;
            state.error = null;
          });

          try {
            const { portfolio } = await apiCall<{ portfolio: Portfolio }>(
              `/api/v1/portfolios/${id}`,
              {
                method: 'PUT',
                body: JSON.stringify(data),
              }
            );

            set(state => {
              const index = state.portfolios.findIndex(p => p.id === id);
              if (index !== -1) {
                state.portfolios[index] = portfolio;
              }
              if (state.currentPortfolio?.id === id) {
                state.currentPortfolio = portfolio;
              }
              state.isSaving = false;
              state.hasUnsavedChanges = false;
              state.lastSaved = new Date();
            });

            return portfolio;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to update portfolio';
            logger.error('Failed to update portfolio:', error as Error);

            set(state => {
              state.error = errorMessage;
              state.isSaving = false;
            });

            throw error;
          }
        },

        deletePortfolio: async id => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            await apiCall(`/api/v1/portfolios/${id}`, {
              method: 'DELETE',
            });

            set(state => {
              state.portfolios = state.portfolios.filter(p => p.id !== id);
              if (state.currentPortfolio?.id === id) {
                state.currentPortfolio = null;
                state.currentPortfolioId = null;
              }
              state.isLoading = false;
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to delete portfolio';
            logger.error('Failed to delete portfolio:', error as Error);

            set(state => {
              state.error = errorMessage;
              state.isLoading = false;
            });

            throw error;
          }
        },

        savePortfolio: async () => {
          const { currentPortfolio } = get();
          if (!currentPortfolio || !get().hasUnsavedChanges) return;

          try {
            await get().updatePortfolio(currentPortfolio.id, currentPortfolio);
          } catch (error) {
            // Error already handled in updatePortfolio
            throw error;
          }
        },

        updatePortfolioData: (field, value) => {
          set(state => {
            if (!state.currentPortfolio) return;

            // Save current state to history before updating
            if (state.hasUnsavedChanges === false) {
              const currentState = JSON.parse(
                JSON.stringify(state.currentPortfolio)
              );
              state.history = [
                ...state.history.slice(0, state.historyIndex + 1),
                currentState,
              ];
              state.historyIndex = state.history.length - 1;
            }

            // Handle nested data fields
            if (field.includes('.')) {
              const parts = field.split('.');
              let target: Record<string, unknown> =
                state.currentPortfolio as Record<string, unknown>;

              // Navigate to the parent of the field to update
              for (let i = 0; i < parts.length - 1; i++) {
                const part = parts[i];
                if (!part) continue;
                if (!target[part]) {
                  target[part] = {};
                }
                target = target[part] as Record<string, unknown>;
              }

              // Update the final field
              const lastPart = parts[parts.length - 1];
              if (lastPart) {
                target[lastPart] = value;
              }
            } else {
              (state.currentPortfolio as Record<string, unknown>)[field] =
                value;
            }

            state.isEditing = true;
            state.hasUnsavedChanges = true;
          });
        },

        undo: () => {
          set(state => {
            if (state.historyIndex > 0 && state.currentPortfolio) {
              state.historyIndex--;
              const previousState = state.history[state.historyIndex];
              state.currentPortfolio = JSON.parse(
                JSON.stringify(previousState)
              );
              state.hasUnsavedChanges = true;
            }
          });
        },

        redo: () => {
          set(state => {
            if (
              state.historyIndex < state.history.length - 1 &&
              state.currentPortfolio
            ) {
              state.historyIndex++;
              const nextState = state.history[state.historyIndex];
              state.currentPortfolio = JSON.parse(JSON.stringify(nextState));
              state.hasUnsavedChanges = true;
            }
          });
        },

        get canUndo() {
          const state = get();
          return state.historyIndex > 0;
        },

        get canRedo() {
          const state = get();
          return state.historyIndex < state.history.length - 1;
        },

        resetPortfolios: () => set(() => initialState),
      }))
    ),
    {
      name: 'portfolio-store',
    }
  )
);

// Persist selected state can be enabled by wrapping the store creation
// Example: const usePortfolioStore = create<PortfolioState & PortfolioActions>()(persist(...))
// Currently disabled to avoid localStorage conflicts

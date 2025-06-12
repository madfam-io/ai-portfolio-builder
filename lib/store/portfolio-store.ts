/**
 * Portfolio Store
 * Manages portfolio data, editing state, and portfolio operations
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { portfolioService } from '@/lib/services/portfolioService';

import { PortfolioState, PortfolioActions } from './types';

const initialState: PortfolioState = {
  portfolios: [],
  currentPortfolio: null,
  isEditing: false,
  isSaving: false,
  isLoading: false,
  error: null,
  lastSaved: null,
};

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
        loadPortfolios: async (userId: string) => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const portfolios = await portfolioService.getUserPortfolios(userId);
            set(state => {
              state.portfolios = portfolios;
              state.isLoading = false;
            });
          } catch (error: any) {
            set(state => {
              state.error = error.message || 'Failed to load portfolios';
              state.isLoading = false;
            });
            throw error;
          }
        },

        loadPortfolio: async id => {
          set(state => {
            state.isLoading = true;
            state.error = null;
          });

          try {
            const portfolio = await portfolioService.getPortfolio(id);
            set(state => {
              state.currentPortfolio = portfolio;
              state.isLoading = false;
            });
          } catch (error: any) {
            set(state => {
              state.error = error.message || 'Failed to load portfolio';
              state.isLoading = false;
            });
            throw error;
          }
        },

        createPortfolio: async (data, userId) => {
          set(state => {
            state.isSaving = true;
            state.error = null;
          });

          try {
            const createData = {
              name: data.name || 'Untitled Portfolio',
              title: data.title || '',
              bio: data.bio || '',
              template: data.template || 'developer',
              userId,
            };
            const portfolio =
              await portfolioService.createPortfolio(createData);
            set(state => {
              state.portfolios.push(portfolio);
              state.currentPortfolio = portfolio;
              state.isSaving = false;
              state.lastSaved = new Date();
            });
            return portfolio;
          } catch (error: any) {
            set(state => {
              state.error = error.message || 'Failed to create portfolio';
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
            const updated = await portfolioService.updatePortfolio(id, data);
            if (updated) {
              set(state => {
                const index = state.portfolios.findIndex(p => p.id === id);
                if (index !== -1) {
                  state.portfolios[index] = updated;
                }
                if (state.currentPortfolio?.id === id) {
                  state.currentPortfolio = updated;
                }
                state.isSaving = false;
                state.lastSaved = new Date();
              });
            }
          } catch (error: any) {
            set(state => {
              state.error = error.message || 'Failed to update portfolio';
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
            await portfolioService.deletePortfolio(id);
            set(state => {
              state.portfolios = state.portfolios.filter(p => p.id !== id);
              if (state.currentPortfolio?.id === id) {
                state.currentPortfolio = null;
              }
              state.isLoading = false;
            });
          } catch (error: any) {
            set(state => {
              state.error = error.message || 'Failed to delete portfolio';
              state.isLoading = false;
            });
            throw error;
          }
        },

        savePortfolio: async () => {
          const { currentPortfolio } = get();
          if (!currentPortfolio) {
            throw new Error('No portfolio to save');
          }

          await get().updatePortfolio(currentPortfolio.id, currentPortfolio);
        },

        resetPortfolios: () => set(() => initialState),
      }))
    ),
    {
      name: 'portfolio-store',
    }
  )
);

// Selectors
export const selectPortfolios = (state: PortfolioState & PortfolioActions) =>
  state.portfolios;
export const selectCurrentPortfolio = (
  state: PortfolioState & PortfolioActions
) => state.currentPortfolio;
export const selectIsEditing = (state: PortfolioState & PortfolioActions) =>
  state.isEditing;
export const selectIsSaving = (state: PortfolioState & PortfolioActions) =>
  state.isSaving;

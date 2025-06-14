import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { portfolioServiceClient } from '@/lib/services/portfolio/portfolio-service-client';
import { Portfolio } from '@/types/portfolio';

import { PortfolioState, PortfolioActions } from './types';

/**
 * Portfolio Store
 * Manages portfolio data, editing state, and portfolio operations
 */

// Mock portfolio for development
const mockPortfolio: Portfolio = {
  id: 'mock-portfolio-1',
  userId: 'mock-user-1',
  name: 'John Doe Portfolio',
  title: 'Senior Software Engineer',
  bio: 'Passionate developer with expertise in web technologies',
  template: 'developer',
  status: 'draft',
  contact: {
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'San Francisco, CA',
  },
  social: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
  },
  experience: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  customization: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  data: {
    headline: 'Building the future of web applications',
    tagline: 'Full-stack developer passionate about clean code',
    about: 'I am a senior software engineer with over 8 years of experience...',
  },
};

const initialState: PortfolioState = {
  portfolios: [],
  currentPortfolio: process.env.NODE_ENV === 'development' ? mockPortfolio : null,
  isEditing: false,
  isSaving: false,
  isLoading: false,
  error: null,
  lastSaved: null,
  history: [],
  historyIndex: -1,
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
            const portfolios = await portfolioServiceClient.getUserPortfolios(userId);
            set(state => {
              state.portfolios = portfolios;
              state.isLoading = false;
            });
          } catch (error: unknown) {
            set(state => {
              state.error =
                error instanceof Error
                  ? error.message
                  : 'Failed to load portfolios';
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
            const portfolio = await portfolioServiceClient.getPortfolio(id);
            set(state => {
              state.currentPortfolio = portfolio;
              state.isLoading = false;
            });
          } catch (error: unknown) {
            set(state => {
              state.error =
                error instanceof Error
                  ? error.message
                  : 'Failed to load portfolio';
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
              await portfolioServiceClient.createPortfolio(createData);
            set(state => {
              state.portfolios.push(portfolio);
              state.currentPortfolio = portfolio;
              state.isSaving = false;
              state.lastSaved = new Date();
            });
            return portfolio;
          } catch (error: unknown) {
            set(state => {
              state.error =
                error instanceof Error
                  ? error.message
                  : 'Failed to create portfolio';
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
            const updated = await portfolioServiceClient.updatePortfolio(id, data);
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
          } catch (error: unknown) {
            set(state => {
              state.error =
                error instanceof Error
                  ? error.message
                  : 'Failed to update portfolio';
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
            await portfolioServiceClient.deletePortfolio(id);
            set(state => {
              state.portfolios = state.portfolios.filter(p => p.id !== id);
              if (state.currentPortfolio?.id === id) {
                state.currentPortfolio = null;
              }
              state.isLoading = false;
            });
          } catch (error: unknown) {
            set(state => {
              state.error =
                error instanceof Error
                  ? error.message
                  : 'Failed to delete portfolio';
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

        updatePortfolioData: (data) => {
          set(state => {
            if (!state.currentPortfolio) return;
            
            // Save current state to history before updating
            const currentData = { ...state.currentPortfolio.data };
            state.history = [...state.history.slice(0, state.historyIndex + 1), currentData];
            state.historyIndex = state.history.length;
            
            // Update the data
            state.currentPortfolio.data = {
              ...state.currentPortfolio.data,
              ...data,
            };
            state.currentPortfolio.hasUnsavedChanges = true;
          });
        },

        undo: () => {
          set(state => {
            if (state.historyIndex > 0 && state.currentPortfolio) {
              state.historyIndex--;
              state.currentPortfolio.data = { ...state.history[state.historyIndex] };
            }
          });
        },

        redo: () => {
          set(state => {
            if (state.historyIndex < state.history.length - 1 && state.currentPortfolio) {
              state.historyIndex++;
              state.currentPortfolio.data = { ...state.history[state.historyIndex] };
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

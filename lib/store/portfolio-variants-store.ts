import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logger } from '@/lib/utils/logger';
import type {
  PortfolioVariant,
  AudienceProfile,
  CreateVariantInput,
  ContentOptimizationSuggestion,
  VariantAnalytics,
} from '@/types/portfolio-variants';

interface PortfolioVariantsState {
  // Current state
  variants: PortfolioVariant[];
  currentVariantId: string | null;
  audienceProfiles: AudienceProfile[];

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isSwitching: boolean;

  // Optimization suggestions
  suggestions: ContentOptimizationSuggestion[];

  // Actions
  loadVariants: (portfolioId: string) => Promise<void>;
  loadAudienceProfiles: () => Promise<void>;
  createVariant: (input: CreateVariantInput) => Promise<PortfolioVariant>;
  updateVariant: (
    variantId: string,
    updates: Partial<PortfolioVariant>
  ) => Promise<void>;
  deleteVariant: (variantId: string) => Promise<void>;
  switchVariant: (variantId: string) => Promise<void>;

  // Content overrides
  updateContentOverride: (
    variantId: string,
    path: string,
    value: any
  ) => Promise<void>;
  removeContentOverride: (variantId: string, path: string) => Promise<void>;

  // Analytics
  trackView: (variantId: string, visitorInfo?: any) => Promise<void>;
  getAnalytics: (
    variantId: string,
    period?: string
  ) => Promise<VariantAnalytics>;

  // AI optimization
  generateOptimizationSuggestions: (
    variantId: string
  ) => Promise<ContentOptimizationSuggestion[]>;
  applySuggestion: (suggestionId: string) => Promise<void>;

  // Comparison
  startComparison: (variantAId: string, variantBId: string) => Promise<void>;
  stopComparison: (comparisonId: string) => Promise<void>;

  // Utilities
  getCurrentVariant: () => PortfolioVariant | null;
  getVariantBySlug: (slug: string) => PortfolioVariant | null;
  reset: () => void;
}

export const usePortfolioVariantsStore = create<PortfolioVariantsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        variants: [],
        currentVariantId: null,
        audienceProfiles: [],
        isLoading: false,
        isCreating: false,
        isSwitching: false,
        suggestions: [],

        // Load variants for a portfolio
        loadVariants: async (portfolioId: string) => {
          set({ isLoading: true });
          try {
            const response = await fetch(
              `/api/v1/portfolios/${portfolioId}/variants`
            );
            if (!response.ok) throw new Error('Failed to load variants');

            const data = await response.json();
            const variants = data.data.variants || [];

            // Set current variant to default if not set
            const defaultVariant = variants.find(
              (v: PortfolioVariant) => v.isDefault
            );

            set({
              variants,
              currentVariantId:
                get().currentVariantId || defaultVariant?.id || variants[0]?.id,
              isLoading: false,
            });
          } catch (error) {
            logger.error(
              'Failed to load variants:',
              error instanceof Error ? error : new Error(String(error))
            );
            set({ isLoading: false });
          }
        },

        // Load user's audience profiles
        loadAudienceProfiles: async () => {
          try {
            const response = await fetch('/api/v1/audience-profiles');
            if (!response.ok)
              throw new Error('Failed to load audience profiles');

            const data = await response.json();
            set({ audienceProfiles: data.data.profiles || [] });
          } catch (error) {
            logger.error(
              'Failed to load audience profiles:',
              error instanceof Error ? error : new Error(String(error))
            );
          }
        },

        // Create a new variant
        createVariant: async (input: CreateVariantInput) => {
          set({ isCreating: true });
          try {
            const response = await fetch(
              `/api/v1/portfolios/${input.portfolioId}/variants`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
              }
            );

            if (!response.ok) throw new Error('Failed to create variant');

            const data = await response.json();
            const newVariant = data.data.variant;

            set(state => ({
              variants: [...state.variants, newVariant],
              currentVariantId: newVariant.id,
              isCreating: false,
            }));

            return newVariant;
          } catch (error) {
            logger.error(
              'Failed to create variant:',
              error instanceof Error ? error : new Error(String(error))
            );
            set({ isCreating: false });
            throw error;
          }
        },

        // Update variant
        updateVariant: async (
          variantId: string,
          updates: Partial<PortfolioVariant>
        ) => {
          try {
            const response = await fetch(`/api/v1/variants/${variantId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error('Failed to update variant');

            set(state => ({
              variants: state.variants.map(v =>
                v.id === variantId ? { ...v, ...updates } : v
              ),
            }));
          } catch (error) {
            logger.error(
              'Failed to update variant:',
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }
        },

        // Delete variant
        deleteVariant: async (variantId: string) => {
          try {
            const response = await fetch(`/api/v1/variants/${variantId}`, {
              method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete variant');

            set(state => ({
              variants: state.variants.filter(v => v.id !== variantId),
              currentVariantId:
                state.currentVariantId === variantId
                  ? state.variants.find(v => v.isDefault)?.id ||
                    state.variants[0]?.id
                  : state.currentVariantId,
            }));
          } catch (error) {
            logger.error(
              'Failed to delete variant:',
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }
        },

        // Switch current variant
        switchVariant: async (variantId: string) => {
          set({ isSwitching: true });
          try {
            const variant = get().variants.find(v => v.id === variantId);
            if (!variant) throw new Error('Variant not found');

            set({ currentVariantId: variantId, isSwitching: false });
          } catch (error) {
            logger.error(
              'Failed to switch variant:',
              error instanceof Error ? error : new Error(String(error))
            );
            set({ isSwitching: false });
          }
        },

        // Update content override
        updateContentOverride: async (
          variantId: string,
          path: string,
          value: any
        ) => {
          try {
            const variant = get().variants.find(v => v.id === variantId);
            if (!variant) throw new Error('Variant not found');

            const updatedOverrides = {
              ...variant.contentOverrides,
              [path]: value,
            };

            await get().updateVariant(variantId, {
              contentOverrides: updatedOverrides,
            });
          } catch (error) {
            logger.error(
              'Failed to update content override:',
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }
        },

        // Remove content override
        removeContentOverride: async (variantId: string, path: string) => {
          try {
            const variant = get().variants.find(v => v.id === variantId);
            if (!variant) throw new Error('Variant not found');

            const updatedOverrides = { ...variant.contentOverrides } as any;
            delete updatedOverrides[path];

            await get().updateVariant(variantId, {
              contentOverrides: updatedOverrides,
            });
          } catch (error) {
            logger.error(
              'Failed to remove content override:',
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }
        },

        // Track view
        trackView: async (variantId: string, visitorInfo?: any) => {
          try {
            await fetch(`/api/v1/variants/${variantId}/track`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ visitorInfo }),
            });
          } catch (error) {
            logger.error(
              'Failed to track view:',
              error instanceof Error ? error : new Error(String(error))
            );
          }
        },

        // Get analytics
        getAnalytics: async (variantId: string, period = 'week') => {
          try {
            const response = await fetch(
              `/api/v1/variants/${variantId}/analytics?period=${period}`
            );

            if (!response.ok) throw new Error('Failed to get analytics');

            const data = await response.json();
            return data.data.analytics;
          } catch (error) {
            logger.error(
              'Failed to get analytics:',
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }
        },

        // Generate optimization suggestions
        generateOptimizationSuggestions: async (variantId: string) => {
          try {
            const response = await fetch(
              `/api/v1/variants/${variantId}/optimize`,
              {
                method: 'POST',
              }
            );

            if (!response.ok) throw new Error('Failed to generate suggestions');

            const data = await response.json();
            const suggestions = data.data.suggestions || [];

            set({ suggestions });
            return suggestions;
          } catch (error) {
            logger.error(
              'Failed to generate suggestions:',
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }
        },

        // Apply suggestion
        applySuggestion: async (suggestionId: string) => {
          try {
            const suggestion = get().suggestions.find(
              s => s.variantId === suggestionId
            );
            if (!suggestion) throw new Error('Suggestion not found');

            await get().updateContentOverride(
              suggestion.variantId,
              `${suggestion.section}.${suggestion.field}`,
              suggestion.suggestedContent
            );

            // Remove applied suggestion
            set(state => ({
              suggestions: state.suggestions.filter(
                s => s.variantId !== suggestionId
              ),
            }));
          } catch (error) {
            logger.error(
              'Failed to apply suggestion:',
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }
        },

        // Start comparison
        startComparison: async (variantAId: string, variantBId: string) => {
          try {
            const response = await fetch('/api/v1/comparisons', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ variantAId, variantBId }),
            });

            if (!response.ok) throw new Error('Failed to start comparison');
          } catch (error) {
            logger.error(
              'Failed to start comparison:',
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }
        },

        // Stop comparison
        stopComparison: async (comparisonId: string) => {
          try {
            const response = await fetch(
              `/api/v1/comparisons/${comparisonId}`,
              {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' }),
              }
            );

            if (!response.ok) throw new Error('Failed to stop comparison');
          } catch (error) {
            logger.error(
              'Failed to stop comparison:',
              error instanceof Error ? error : new Error(String(error))
            );
            throw error;
          }
        },

        // Get current variant
        getCurrentVariant: () => {
          const state = get();
          return (
            state.variants.find(v => v.id === state.currentVariantId) || null
          );
        },

        // Get variant by slug
        getVariantBySlug: (slug: string) => {
          return get().variants.find(v => v.slug === slug) || null;
        },

        // Reset store
        reset: () => {
          set({
            variants: [],
            currentVariantId: null,
            audienceProfiles: [],
            isLoading: false,
            isCreating: false,
            isSwitching: false,
            suggestions: [],
          });
        },
      }),
      {
        name: 'portfolio-variants-storage',
        partialize: state => ({
          currentVariantId: state.currentVariantId,
        }),
      }
    )
  )
);

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { act } from '@testing-library/react';

jest.mock('zustand', () => ({
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock zustand
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock zustand
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));
// Mock zustand

  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

// Mock zustand create function
  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));
// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  status: 200,
});

  describe('Loading Variants', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

    it('should load variants for a portfolio', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { variants: mockVariants } }),
      });

      const { loadVariants } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await loadVariants('portfolio-123');
      });

      const { variants, currentVariantId, isLoading } =
        usePortfolioVariantsStore.getState();

      expect(variants).toEqual(mockVariants);
      expect(currentVariantId).toBe('variant-1'); // Default variant
      expect(isLoading).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/portfolios/portfolio-123/variants'
    );
  });

    it('should handle empty variants', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { variants: [] } }),
      });

      const { loadVariants } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await loadVariants('portfolio-123');
      });

      const { variants, currentVariantId } =
        usePortfolioVariantsStore.getState();
      expect(variants).toEqual([]);
      expect(currentVariantId).toBeNull();
    });

    it('should handle load error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const { loadVariants } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await loadVariants('portfolio-123');
      });

      const { isLoading } = usePortfolioVariantsStore.getState();
      expect(isLoading).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to load variants:',
        expect.any(Error)

    });
  });

  describe('Audience Profiles', () => {
    it('should load audience profiles', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ data: { profiles: mockAudienceProfiles } }),
      });

      const { loadAudienceProfiles } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await loadAudienceProfiles();
      });

      const { audienceProfiles } = usePortfolioVariantsStore.getState();
      expect(audienceProfiles).toEqual(mockAudienceProfiles);
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/audience-profiles');
    });
  });

  describe('Creating Variants', () => {
    it('should create a new variant', async () => {
      const newVariant: PortfolioVariant = {
        id: 'variant-3',
        portfolioId: 'portfolio-123',
        name: 'Enterprise Clients',
        slug: 'enterprise-clients',
        isDefault: false,
        isPublished: false,
        contentOverrides: {},
        audienceProfile: {
          id: 'profile-3',
          type: 'client',
          name: 'Enterprise Clients',
        },
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { variant: newVariant } }),
      });

      // Pre-populate some variants
      usePortfolioVariantsStore.setState({ variants: mockVariants });

      const input: CreateVariantInput = {
        portfolioId: 'portfolio-123',
        name: 'Enterprise Clients',
        audienceType: 'client',
      };

      const { createVariant } = usePortfolioVariantsStore.getState();

      let result: PortfolioVariant;
      await act(async () => {
        result = await createVariant(input);
      });

      const { variants, currentVariantId, isCreating } =
        usePortfolioVariantsStore.getState();

      expect(result!).toEqual(newVariant);
      expect(variants).toHaveLength(3);
      expect(variants[2]).toEqual(newVariant);
      expect(currentVariantId).toBe('variant-3');
      expect(isCreating).toBe(false);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/portfolio-123/variants',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
    });

    it('should handle create error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const input: CreateVariantInput = {
        portfolioId: 'portfolio-123',
        name: 'New Variant',
        audienceType: 'general',
      };

      const { createVariant } = usePortfolioVariantsStore.getState();

      await expect(
        act(async () => {
          await createVariant(input);
        })
      ).rejects.toThrow('Failed to create variant');

      const { isCreating } = usePortfolioVariantsStore.getState();
      expect(isCreating).toBe(false);
    });
  });

  describe('Updating Variants', () => {
    beforeEach(() => {
      usePortfolioVariantsStore.setState({ variants: mockVariants });
    });

    it('should update a variant', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const updates = { name: 'Updated Name', isPublished: true };
      const { updateVariant } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await updateVariant('variant-2', updates);
      });

      const { variants } = usePortfolioVariantsStore.getState();
      const updatedVariant = variants.find(v => v.id === 'variant-2');

      expect(updatedVariant?.name).toBe('Updated Name');
      expect(updatedVariant?.isPublished).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/variants/variant-2',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
    );
  });

    it('should update content override', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const { updateContentOverride } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await updateContentOverride('variant-2', 'skills', [
          'React',
          'TypeScript',
        ]);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/variants/variant-2',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            contentOverrides: {
              bio: 'Customized bio for tech recruiters',
              skills: ['React', 'TypeScript'],
            },
          }),
        })
    });

    it('should remove content override', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const { removeContentOverride } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await removeContentOverride('variant-2', 'bio');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/variants/variant-2',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            contentOverrides: {},
          }),
        })
    });
  });

  describe('Deleting Variants', () => {
    beforeEach(() => {
      usePortfolioVariantsStore.setState({
        variants: mockVariants,
        currentVariantId: 'variant-2',
      });
    });

    it('should delete a variant', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const { deleteVariant } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await deleteVariant('variant-2');
      });

      const { variants, currentVariantId } =
        usePortfolioVariantsStore.getState();

      expect(variants).toHaveLength(1);
      expect(variants.find(v => v.id === 'variant-2')).toBeUndefined();
      expect(currentVariantId).toBe('variant-1'); // Switched to default
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/variants/variant-2',
        expect.objectContaining({ method: 'DELETE' })
    );
  });

    it('should handle deletion of default variant', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      usePortfolioVariantsStore.setState({ currentVariantId: 'variant-1' });

      const { deleteVariant } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await deleteVariant('variant-1');
      });

      const { currentVariantId } = usePortfolioVariantsStore.getState();
      expect(currentVariantId).toBe('variant-2'); // Switched to first available
    });
  });

  describe('Switching Variants', () => {
    beforeEach(() => {
      usePortfolioVariantsStore.setState({
        variants: mockVariants,
        currentVariantId: 'variant-1',
      });
    });

    it('should switch current variant', async () => {
      const { switchVariant } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await switchVariant('variant-2');
      });

      const { currentVariantId, isSwitching } =
        usePortfolioVariantsStore.getState();
      expect(currentVariantId).toBe('variant-2');
      expect(isSwitching).toBe(false);
    });

    it('should handle switch to non-existent variant', async () => {
      const { switchVariant } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await switchVariant('non-existent');
      });

      const { currentVariantId } = usePortfolioVariantsStore.getState();
      expect(currentVariantId).toBe('variant-1'); // Should not change
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to switch variant:',
        expect.any(Error)

    });
  });

  describe('Analytics', () => {
    it('should track view', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const visitorInfo = { referrer: 'google.com', userAgent: 'Chrome' };
      const { trackView } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await trackView('variant-1', visitorInfo);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/variants/variant-1/track',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ visitorInfo }),
        })
    });

    it('should get analytics', async () => {
      const mockAnalytics: VariantAnalytics = {
        views: 100,
        uniqueVisitors: 75,
        avgTimeOnPage: 120,
        bounceRate: 0.25,
        conversionRate: 0.05,
        topReferrers: ['google.com', 'linkedin.com'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { analytics: mockAnalytics } }),
      });

      const { getAnalytics } = usePortfolioVariantsStore.getState();

      let result: VariantAnalytics;
      await act(async () => {
        result = await getAnalytics('variant-1', 'month');
      });

      expect(result!).toEqual(mockAnalytics);
      expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/variants/variant-1/analytics?period=month'
    );
  });
  });

  describe('AI Optimization', () => {
    it('should generate optimization suggestions', async () => {
      const mockSuggestions: ContentOptimizationSuggestion[] = [
        {
          id: 'suggestion-1',
          variantId: 'variant-1',
          section: 'bio',
          field: 'content',
          currentContent: 'Current bio',
          suggestedContent: 'Improved bio',
          reason: 'More engaging for target audience',
          confidence: 0.85,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { suggestions: mockSuggestions } }),
      });

      const { generateOptimizationSuggestions } =
        usePortfolioVariantsStore.getState();

      let result: ContentOptimizationSuggestion[];
      await act(async () => {
        result = await generateOptimizationSuggestions('variant-1');
      });

      const { suggestions } = usePortfolioVariantsStore.getState();
      expect(result!).toEqual(mockSuggestions);
      expect(suggestions).toEqual(mockSuggestions);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/variants/variant-1/optimize',
        expect.objectContaining({ method: 'POST' })
    );
  });

    it('should apply suggestion', async () => {
      const suggestion: ContentOptimizationSuggestion = {
        id: 'suggestion-1',
        variantId: 'variant-1',
        section: 'bio',
        field: 'content',
        currentContent: 'Current bio',
        suggestedContent: 'Improved bio',
        reason: 'More engaging',
        confidence: 0.85,
      };

      usePortfolioVariantsStore.setState({
        variants: mockVariants,
        suggestions: [suggestion],
      });

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const { applySuggestion } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await applySuggestion('variant-1');
      });

      const { suggestions } = usePortfolioVariantsStore.getState();
      expect(suggestions).toHaveLength(0);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/variants/variant-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            contentOverrides: {
              'bio.content': 'Improved bio',
            },
          }),
        })
    });
  });

  describe('Comparisons', () => {
    it('should start comparison', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const { startComparison } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await startComparison('variant-1', 'variant-2');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/comparisons',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            variantAId: 'variant-1',
            variantBId: 'variant-2',
          }),
        })
    });

    it('should stop comparison', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: {} }),
      });

      const { stopComparison } = usePortfolioVariantsStore.getState();

      await act(async () => {
        await stopComparison('comparison-123');
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/comparisons/comparison-123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        })
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      usePortfolioVariantsStore.setState({
        variants: mockVariants,
        currentVariantId: 'variant-1',
      });
    });

    it('should get current variant', async () => {
      const { getCurrentVariant } = usePortfolioVariantsStore.getState();
      const current = getCurrentVariant();

      expect(current).toEqual(mockVariants[0]);
    });

    it('should get variant by slug', async () => {
      const { getVariantBySlug } = usePortfolioVariantsStore.getState();
      const variant = getVariantBySlug('tech-recruiters');

      expect(variant).toEqual(mockVariants[1]);
    });

    it('should return null for non-existent slug', async () => {
      const { getVariantBySlug } = usePortfolioVariantsStore.getState();
      const variant = getVariantBySlug('non-existent');

      expect(variant).toBeNull();
    });

    it('should reset store', async () => {
      usePortfolioVariantsStore.setState({
        variants: mockVariants,
        currentVariantId: 'variant-1',
        audienceProfiles: mockAudienceProfiles,
        suggestions: [{ id: 'test' } as any],
      });

      const { reset } = usePortfolioVariantsStore.getState();
      reset();

      const state = usePortfolioVariantsStore.getState();
      expect(state.variants).toEqual([]);
      expect(state.currentVariantId).toBeNull();
      expect(state.audienceProfiles).toEqual([]);
      expect(state.suggestions).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isCreating).toBe(false);
      expect(state.isSwitching).toBe(false);
    });
  });

  describe('Persistence', () => {
    it('should persist only currentVariantId', async () => {
      usePortfolioVariantsStore.setState({
        variants: mockVariants,
        currentVariantId: 'variant-2',
        audienceProfiles: mockAudienceProfiles,
      });

      // Simulate what would be persisted
      const persistedState = {
        currentVariantId: usePortfolioVariantsStore.getState().currentVariantId,
      };

      expect(persistedState).toEqual({
        currentVariantId: 'variant-2',
      });

      // Other state should not be persisted
      expect(persistedState).not.toHaveProperty('variants');
      expect(persistedState).not.toHaveProperty('audienceProfiles');
    });
  });
});

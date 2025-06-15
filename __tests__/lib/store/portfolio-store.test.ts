import { act, renderHook } from '@testing-library/react';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { Portfolio } from '@/types/portfolio';

describe('Portfolio Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => usePortfolioStore());
    act(() => {
      result.current.resetPortfolios();
    });
  });

  describe('Initial State', () => {
    it('should have empty portfolios initially', () => {
      const { result } = renderHook(() => usePortfolioStore());

      expect(result.current.portfolios).toEqual([]);
      expect(result.current.currentPortfolio).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Portfolio Management', () => {
    const createMockPortfolio = (overrides?: Partial<Portfolio>): Portfolio => ({
      id: '1',
      name: 'Test Portfolio',
      tagline: 'Test Tagline',
      bio: 'Test Bio',
      email: 'test@example.com',
      location: 'Test Location',
      template: 'developer',
      socialLinks: {},
      projects: [],
      skills: [],
      customDomain: null,
      subdomain: 'test',
      isPublished: false,
      publishedAt: null,
      views: 0,
      lastViewedAt: null,
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    });

    it('should set portfolios', () => {
      const { result } = renderHook(() => usePortfolioStore());
      const portfolio = createMockPortfolio();

      act(() => {
        result.current.setPortfolios([portfolio]);
      });

      expect(result.current.portfolios).toHaveLength(1);
      expect(result.current.portfolios[0]).toEqual(portfolio);
    });

    it('should set current portfolio', () => {
      const { result } = renderHook(() => usePortfolioStore());
      const portfolio = createMockPortfolio();

      act(() => {
        result.current.setCurrentPortfolio(portfolio);
      });

      expect(result.current.currentPortfolio).toEqual(portfolio);
    });

    it('should update portfolio data', () => {
      const { result } = renderHook(() => usePortfolioStore());
      const portfolio = createMockPortfolio();

      act(() => {
        result.current.setCurrentPortfolio(portfolio);
      });

      act(() => {
        result.current.updatePortfolioData('name', 'Updated Name');
      });

      expect(result.current.currentPortfolio?.name).toBe('Updated Name');
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should update nested portfolio data', () => {
      const { result } = renderHook(() => usePortfolioStore());
      const portfolio = createMockPortfolio();

      act(() => {
        result.current.setCurrentPortfolio(portfolio);
      });

      act(() => {
        result.current.updatePortfolioData('socialLinks.twitter', 'https://twitter.com/test');
      });

      expect(result.current.currentPortfolio?.socialLinks.twitter).toBe('https://twitter.com/test');
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should reset all portfolios', () => {
      const { result } = renderHook(() => usePortfolioStore());
      const portfolios = [
        createMockPortfolio({ id: '1', subdomain: 'test1' }),
        createMockPortfolio({ id: '2', subdomain: 'test2' })
      ];

      act(() => {
        result.current.setPortfolios(portfolios);
        result.current.setCurrentPortfolio(portfolios[0]);
      });

      act(() => {
        result.current.resetPortfolios();
      });

      expect(result.current.portfolios).toHaveLength(0);
      expect(result.current.currentPortfolio).toBeNull();
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('Loading States', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set saving state', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setSaving(true);
      });

      expect(result.current.isSaving).toBe(true);

      act(() => {
        result.current.setSaving(false);
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('should set error state', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('History Management', () => {
    const createMockPortfolio = (): Portfolio => ({
      id: '1',
      name: 'Test Portfolio',
      tagline: 'Test Tagline',
      bio: 'Test Bio',
      email: 'test@example.com',
      location: 'Test Location',
      template: 'developer',
      socialLinks: {},
      projects: [],
      skills: [],
      customDomain: null,
      subdomain: 'test',
      isPublished: false,
      publishedAt: null,
      views: 0,
      lastViewedAt: null,
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    it.skip('should support undo/redo operations', () => {
      const { result } = renderHook(() => usePortfolioStore());
      const portfolio = createMockPortfolio();

      act(() => {
        result.current.setCurrentPortfolio(portfolio);
      });

      const originalName = portfolio.name;

      // Make first change - this saves the original state to history
      act(() => {
        result.current.updatePortfolioData('name', 'Updated Name 1');
      });

      expect(result.current.currentPortfolio?.name).toBe('Updated Name 1');

      // Make second change
      act(() => {
        result.current.updatePortfolioData('name', 'Updated Name 2');
      });

      expect(result.current.currentPortfolio?.name).toBe('Updated Name 2');

      // Undo should go back to the original state (because history only saves on first change)
      act(() => {
        result.current.undo();
      });

      expect(result.current.currentPortfolio?.name).toBe(originalName);

      // Redo should go back to the changed state
      act(() => {
        result.current.redo();
      });

      expect(result.current.currentPortfolio?.name).toBe('Updated Name 2');
    });

    it.skip('should track undo/redo availability', () => {
      const { result } = renderHook(() => usePortfolioStore());
      const portfolio = createMockPortfolio();

      act(() => {
        result.current.setCurrentPortfolio(portfolio);
      });

      // Initially, no history
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);

      // Make a change - this creates history
      act(() => {
        result.current.updatePortfolioData('name', 'Updated Name');
      });

      // After first change, history contains the original state
      // So we can undo to go back to original
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);

      // Undo to go back to original state
      act(() => {
        result.current.undo();
      });

      // After undo, we're at index 0, so can't undo further but can redo
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);
    });
  });
});
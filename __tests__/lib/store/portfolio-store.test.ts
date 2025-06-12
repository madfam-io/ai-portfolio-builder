/**
 * Tests for Portfolio Store
 * Testing Zustand state management for portfolios
 */

import { renderHook, act } from '@testing-library/react';

import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { Portfolio } from '@/types/portfolio';

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Portfolio Store', () => {
  const mockPortfolios: Portfolio[] = [
    {
      id: '1',
      userId: 'user-123',
      name: 'John Doe',
      title: 'Software Engineer',
      bio: 'Experienced developer',
      template: 'developer',
      status: 'published',
      subdomain: 'johndoe',
      views: 100,
      contact: { email: 'john@example.com' },
      social: {},
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      customization: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      userId: 'user-123',
      name: 'Jane Smith',
      title: 'UI/UX Designer',
      bio: 'Creative designer',
      template: 'designer',
      status: 'draft',
      subdomain: 'janesmith',
      views: 50,
      contact: { email: 'jane@example.com' },
      social: {},
      experience: [],
      education: [],
      projects: [],
      skills: [],
      certifications: [],
      customization: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    // Reset store state
    const { result } = renderHook(() => usePortfolioStore());
    act(() => {
      result.current.clearPortfolios();
      result.current.setSelectedPortfolio(null);
    });

    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => usePortfolioStore());

      expect(result.current.portfolios).toEqual([]);
      expect(result.current.selectedPortfolio).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('Fetch Portfolios', () => {
    it('should fetch portfolios successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPortfolios }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.fetchPortfolios();
      });

      expect(result.current.portfolios).toEqual(mockPortfolios);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/portfolios');
    });

    it('should handle fetch error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.fetchPortfolios();
      });

      expect(result.current.portfolios).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch portfolios');
    });

    it('should set loading state during fetch', async () => {
      mockFetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ data: [] }),
                }),
              100
            )
          )
      );

      const { result } = renderHook(() => usePortfolioStore());

      expect(result.current.isLoading).toBe(false);

      const fetchPromise = act(async () => {
        await result.current.fetchPortfolios();
      });

      expect(result.current.isLoading).toBe(true);

      await fetchPromise;

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Create Portfolio', () => {
    it('should create portfolio successfully', async () => {
      const newPortfolio = mockPortfolios[0];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: newPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      const portfolioData = {
        name: 'John Doe',
        title: 'Software Engineer',
        bio: 'Experienced developer',
        template: 'developer' as const,
      };

      await act(async () => {
        const created = await result.current.createPortfolio(portfolioData);
        expect(created).toEqual(newPortfolio);
      });

      expect(result.current.portfolios).toContainEqual(newPortfolio);
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(portfolioData),
      });
    });

    it('should handle create error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Validation failed' }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        const created = await result.current.createPortfolio({
          name: '',
          title: '',
          bio: '',
          template: 'developer',
        });
        expect(created).toBeNull();
      });

      expect(result.current.error).toBe('Failed to create portfolio');
    });
  });

  describe('Update Portfolio', () => {
    it('should update portfolio successfully', async () => {
      const updatedPortfolio = {
        ...mockPortfolios[0],
        title: 'Senior Engineer',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: updatedPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      // Set initial portfolios
      act(() => {
        result.current.setPortfolios(mockPortfolios);
      });

      await act(async () => {
        const updated = await result.current.updatePortfolio('1', {
          title: 'Senior Engineer',
        });
        expect(updated).toEqual(updatedPortfolio);
      });

      expect(result.current.portfolios[0].title).toBe('Senior Engineer');
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/portfolios/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Senior Engineer' }),
      });
    });

    it('should handle update error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        const updated = await result.current.updatePortfolio('999', {
          title: 'New Title',
        });
        expect(updated).toBeNull();
      });

      expect(result.current.error).toBe('Failed to update portfolio');
    });
  });

  describe('Delete Portfolio', () => {
    it('should delete portfolio successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      // Set initial portfolios
      act(() => {
        result.current.setPortfolios(mockPortfolios);
      });

      expect(result.current.portfolios).toHaveLength(2);

      await act(async () => {
        const deleted = await result.current.deletePortfolio('1');
        expect(deleted).toBe(true);
      });

      expect(result.current.portfolios).toHaveLength(1);
      expect(result.current.portfolios[0].id).toBe('2');
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/portfolios/1', {
        method: 'DELETE',
      });
    });

    it('should handle delete error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not found' }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setPortfolios(mockPortfolios);
      });

      await act(async () => {
        const deleted = await result.current.deletePortfolio('999');
        expect(deleted).toBe(false);
      });

      expect(result.current.portfolios).toHaveLength(2); // Should not remove any
      expect(result.current.error).toBe('Failed to delete portfolio');
    });
  });

  describe('Selected Portfolio', () => {
    it('should set and get selected portfolio', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setPortfolios(mockPortfolios);
        result.current.setSelectedPortfolio(mockPortfolios[0]);
      });

      expect(result.current.selectedPortfolio).toEqual(mockPortfolios[0]);
    });

    it('should get portfolio by id', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setPortfolios(mockPortfolios);
      });

      const portfolio = result.current.getPortfolioById('2');
      expect(portfolio).toEqual(mockPortfolios[1]);
    });

    it('should return undefined for non-existent portfolio', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setPortfolios(mockPortfolios);
      });

      const portfolio = result.current.getPortfolioById('999');
      expect(portfolio).toBeUndefined();
    });
  });

  describe('Change Tracking', () => {
    it('should track changes when portfolio is modified', () => {
      const { result } = renderHook(() => usePortfolioStore());

      expect(result.current.hasChanges).toBe(false);

      act(() => {
        result.current.setHasChanges(true);
      });

      expect(result.current.hasChanges).toBe(true);
    });

    it('should reset changes after save', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPortfolios[0] }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setHasChanges(true);
      });

      await act(async () => {
        await result.current.updatePortfolio('1', { title: 'Updated' });
      });

      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('Portfolio Filters', () => {
    it('should get published portfolios', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setPortfolios(mockPortfolios);
      });

      const published = result.current.getPublishedPortfolios();
      expect(published).toHaveLength(1);
      expect(published[0].status).toBe('published');
    });

    it('should get draft portfolios', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setPortfolios(mockPortfolios);
      });

      const drafts = result.current.getDraftPortfolios();
      expect(drafts).toHaveLength(1);
      expect(drafts[0].status).toBe('draft');
    });

    it('should get portfolio count', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setPortfolios(mockPortfolios);
      });

      expect(result.current.getPortfolioCount()).toBe(2);
    });
  });

  describe('Optimistic Updates', () => {
    it('should apply optimistic update immediately', async () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setPortfolios(mockPortfolios);
      });

      // Mock delayed response
      mockFetch.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    data: { ...mockPortfolios[0], title: 'Updated Title' },
                  }),
                }),
              100
            )
          )
      );

      const updatePromise = act(async () => {
        await result.current.updatePortfolio('1', { title: 'Updated Title' });
      });

      // Check immediate update (optimistic)
      expect(result.current.portfolios[0].title).toBe('Software Engineer');

      await updatePromise;

      // Check final update from server
      expect(result.current.portfolios[0].title).toBe('Updated Title');
    });
  });
});

import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { logger } from '@/lib/utils/logger';
import { Portfolio } from '@/types/portfolio';


// Mock dependencies
jest.mock('@/lib/utils/logger');

// Mock fetch
global.fetch = jest.fn();

describe('usePortfolioStore', () => {
  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'John Doe',
    title: 'Software Engineer',
    bio: 'Experienced developer',
    tagline: 'Building great software',
    avatarUrl: 'https://example.com/avatar.jpg',
    contact: {
      email: 'john@example.com',
      phone: '+1234567890',
      location: 'San Francisco, CA',
    },
    social: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'modern',
    customization: {},
    aiSettings: {},
    status: 'draft',
    subdomain: 'johndoe',
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();

    // Reset the store state
    usePortfolioStore.setState({
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
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const { result } = renderHook(() => usePortfolioStore());

      expect(result.current.portfolios).toEqual([]);
      expect(result.current.currentPortfolio).toBeNull();
      expect(result.current.currentPortfolioId).toBeNull();
      expect(result.current.isEditing).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.history).toEqual([]);
      expect(result.current.historyIndex).toBe(-1);
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('setters', () => {
    it('should set portfolios', () => {
      const { result } = renderHook(() => usePortfolioStore());
      const portfolios = [mockPortfolio];

      act(() => {
        result.current.setPortfolios(portfolios);
      });

      expect(result.current.portfolios).toEqual(portfolios);
    });

    it('should set current portfolio', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      expect(result.current.currentPortfolio).toEqual(mockPortfolio);
      expect(result.current.currentPortfolioId).toBe('portfolio-123');
      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should handle null current portfolio', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(null);
      });

      expect(result.current.currentPortfolio).toBeNull();
      expect(result.current.currentPortfolioId).toBeNull();
    });

    it('should set editing state', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setEditing(true);
      });

      expect(result.current.isEditing).toBe(true);
    });

    it('should set saving state', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setSaving(true);
      });

      expect(result.current.isSaving).toBe(true);
    });

    it('should set loading state', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set error', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');
    });
  });

  describe('loadPortfolios', () => {
    it('should load portfolios successfully', async () => {
      const mockPortfolios = [mockPortfolio];
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ portfolios: mockPortfolios }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.loadPortfolios();
      });

      expect(result.current.portfolios).toEqual(mockPortfolios);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('Portfolios loaded', {
        count: 1,
      });
    });

    it('should handle load portfolios error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Failed to load' }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.loadPortfolios();
      });

      expect(result.current.portfolios).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Failed to load');
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to load portfolios',
        expect.any(Error)

    });
  });

  describe('loadPortfolio', () => {
    it('should load single portfolio successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPortfolio,
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.loadPortfolio('portfolio-123');
      });

      expect(result.current.currentPortfolio).toEqual(mockPortfolio);
      expect(result.current.currentPortfolioId).toBe('portfolio-123');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('Portfolio loaded', {
        portfolioId: 'portfolio-123',
      });
    });

    it('should handle portfolio not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Portfolio not found' }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.loadPortfolio('non-existent');
      });

      expect(result.current.currentPortfolio).toBeNull();
      expect(result.current.error).toBe('Portfolio not found');
    });
  });

  describe('createPortfolio', () => {
    it('should create portfolio successfully', async () => {
      const newPortfolioData = {
        name: 'Jane Doe',
        title: 'Designer',
        bio: 'Creative designer',
        template: 'creative' as const,
      };

      const createdPortfolio = {
        ...mockPortfolio,
        id: 'new-portfolio-123',
        ...newPortfolioData,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: createdPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      let returnedPortfolio: Portfolio;
      await act(async () => {
        returnedPortfolio =
          await result.current.createPortfolio(newPortfolioData);
      });

      expect(returnedPortfolio!).toEqual(createdPortfolio);
      expect(result.current.currentPortfolio).toEqual(createdPortfolio);
      expect(result.current.portfolios).toContainEqual(createdPortfolio);
      expect(logger.info).toHaveBeenCalledWith('Portfolio created', {
        portfolioId: 'new-portfolio-123',
      });
    });

    it('should handle create portfolio error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Invalid data' }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await expect(
        act(async () => {
          await result.current.createPortfolio({
            name: '',
            title: '',
            bio: '',
            template: 'modern',
          });
        })
      ).rejects.toThrow('Invalid data');

      expect(result.current.error).toBe('Invalid data');
    });
  });

  describe('updatePortfolio', () => {
    it('should update portfolio successfully', async () => {
      const updates = { title: 'Senior Engineer' };
      const updatedPortfolio = { ...mockPortfolio, ...updates };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: updatedPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      // Set initial portfolio
      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      await act(async () => {
        await result.current.updatePortfolio('portfolio-123', updates);
      });

      expect(result.current.currentPortfolio).toEqual(updatedPortfolio);
      expect(result.current.lastSaved).toBeInstanceOf(Date);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(logger.info).toHaveBeenCalledWith('Portfolio updated', {
        portfolioId: 'portfolio-123',
      });
    });

    it('should handle update without current portfolio', async () => {
      const updates = { title: 'Senior Engineer' };
      const updatedPortfolio = { ...mockPortfolio, ...updates };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: updatedPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.updatePortfolio('portfolio-123', updates);
      });

      // Should still update successfully even without current portfolio
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/portfolio-123',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updates),
        })
    });

    it('should handle update error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
        json: async () => ({ error: 'Not authorized' }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      await act(async () => {
        await result.current.updatePortfolio('portfolio-123', { title: 'New' });
      });

      expect(result.current.error).toBe('Not authorized');
      expect(result.current.isSaving).toBe(false);
    });
  });

  describe('deletePortfolio', () => {
    it('should delete portfolio successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      // Set initial state
      act(() => {
        result.current.setPortfolios([mockPortfolio]);
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      await act(async () => {
        await result.current.deletePortfolio('portfolio-123');
      });

      expect(result.current.portfolios).toEqual([]);
      expect(result.current.currentPortfolio).toBeNull();
      expect(logger.info).toHaveBeenCalledWith('Portfolio deleted', {
        portfolioId: 'portfolio-123',
      });
    });

    it('should handle delete error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
        json: async () => ({ error: 'Portfolio not found' }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      await act(async () => {
        await result.current.deletePortfolio('non-existent');
      });

      expect(result.current.error).toBe('Portfolio not found');
    });
  });

  describe('publishPortfolio', () => {
    it('should publish portfolio successfully', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        status: 'published' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: publishedPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      await act(async () => {
        await result.current.publishPortfolio('portfolio-123');
      });

      expect(result.current.currentPortfolio?.status).toBe('published');
      expect(logger.info).toHaveBeenCalledWith('Portfolio published', {
        portfolioId: 'portfolio-123',
      });
    });
  });

  describe('unpublishPortfolio', () => {
    it('should unpublish portfolio successfully', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        status: 'published' as const,
      };
      const unpublishedPortfolio = {
        ...mockPortfolio,
        status: 'draft' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: unpublishedPortfolio }),
      });

      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(publishedPortfolio);
      });

      await act(async () => {
        await result.current.unpublishPortfolio('portfolio-123');
      });

      expect(result.current.currentPortfolio?.status).toBe('draft');
      expect(logger.info).toHaveBeenCalledWith('Portfolio unpublished', {
        portfolioId: 'portfolio-123',
      });
    });
  });

  describe('updatePortfolioField', () => {
    it('should update single field', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      act(() => {
        result.current.updatePortfolioField('title', 'New Title');
      });

      expect(result.current.currentPortfolio?.title).toBe('New Title');
      expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it('should not update without current portfolio', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.updatePortfolioField('title', 'New Title');
      });

      expect(result.current.currentPortfolio).toBeNull();
      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('history management', () => {
    it('should add to history when updating', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      act(() => {
        result.current.updatePortfolioField('title', 'Version 1');
      });

      act(() => {
        result.current.updatePortfolioField('title', 'Version 2');
      });

      expect(result.current.history).toHaveLength(3); // Initial + 2 updates
      expect(result.current.historyIndex).toBe(2);
    });

    it('should undo changes', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      const originalTitle = mockPortfolio.title;

      act(() => {
        result.current.updatePortfolioField('title', 'New Title');
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.currentPortfolio?.title).toBe(originalTitle);
      expect(result.current.historyIndex).toBe(0);
    });

    it('should redo changes', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      act(() => {
        result.current.updatePortfolioField('title', 'New Title');
      });

      act(() => {
        result.current.undo();
      });

      act(() => {
        result.current.redo();
      });

      expect(result.current.currentPortfolio?.title).toBe('New Title');
      expect(result.current.historyIndex).toBe(1);
    });

    it('should not undo when at beginning of history', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      const initialIndex = result.current.historyIndex;

      act(() => {
        result.current.undo();
      });

      expect(result.current.historyIndex).toBe(initialIndex);
    });

    it('should not redo when at end of history', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
      });

      act(() => {
        result.current.updatePortfolioField('title', 'New Title');
      });

      const currentIndex = result.current.historyIndex;

      act(() => {
        result.current.redo();
      });

      expect(result.current.historyIndex).toBe(currentIndex);
    });
  });

  describe('clearChanges', () => {
    it('should reset unsaved changes flag', () => {
      const { result } = renderHook(() => usePortfolioStore());

      act(() => {
        result.current.setCurrentPortfolio(mockPortfolio);
        result.current.updatePortfolioField('title', 'New Title');
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => {
        result.current.clearChanges();
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });
  });

  describe('resetPortfolioState', () => {
    it('should reset all portfolio-related state', () => {
      const { result } = renderHook(() => usePortfolioStore());

      // Set various states
      act(() => {
        result.current.setPortfolios([mockPortfolio]);
        result.current.setCurrentPortfolio(mockPortfolio);
        result.current.setEditing(true);
        result.current.setError('Some error');
        result.current.updatePortfolioField('title', 'New Title');
      });

      act(() => {
        result.current.resetPortfolioState();
      });

      expect(result.current.currentPortfolio).toBeNull();
      expect(result.current.currentPortfolioId).toBeNull();
      expect(result.current.isEditing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.history).toEqual([]);
      expect(result.current.historyIndex).toBe(-1);
      expect(result.current.hasUnsavedChanges).toBe(false);
      // Note: portfolios array is intentionally not reset
      expect(result.current.portfolios).toEqual([mockPortfolio]);
    });
  });
});

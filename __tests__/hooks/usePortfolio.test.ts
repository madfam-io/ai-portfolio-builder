import { renderHook, act, waitFor } from '@testing-library/react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { portfolioService } from '@/lib/services/portfolio/portfolio-service';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { toast } from '@/lib/utils/toast';

jest.mock('@/lib/services/portfolio/portfolio-service');
jest.mock('@/lib/store/portfolio-store');
jest.mock('@/lib/utils/toast');

describe('usePortfolio', () => {
  const mockPortfolio = {
    id: 'portfolio-123',
    name: 'Test Portfolio',
    title: 'Test Title',
    bio: 'Test bio',
    status: 'draft'
  };

  const mockSetPortfolio = jest.fn();
  const mockUpdatePortfolio = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePortfolioStore as unknown as jest.Mock).mockReturnValue({
      portfolio: mockPortfolio,
      setPortfolio: mockSetPortfolio,
      updatePortfolio: mockUpdatePortfolio,
      isLoading: false,
      error: null
    });
  });

  describe('loadPortfolio', () => {
    it('should load portfolio successfully', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        await result.current.loadPortfolio('portfolio-123');
      });

      expect(portfolioService.getPortfolio).toHaveBeenCalledWith('portfolio-123');
      expect(mockSetPortfolio).toHaveBeenCalledWith(mockPortfolio);
    });

    it('should handle load errors', async () => {
      const error = new Error('Failed to load');
      (portfolioService.getPortfolio as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        await expect(result.current.loadPortfolio('portfolio-123')).rejects.toThrow('Failed to load');
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to load portfolio');
    });

    it('should handle portfolio not found', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        await expect(result.current.loadPortfolio('invalid-id')).rejects.toThrow('Portfolio not found');
      });
    });
  });

  describe('savePortfolio', () => {
    it('should save portfolio changes', async () => {
      const updates = { title: 'Updated Title' };
      const updatedPortfolio = { ...mockPortfolio, ...updates };
      
      (portfolioService.updatePortfolio as jest.Mock).mockResolvedValue(updatedPortfolio);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        await result.current.savePortfolio(updates);
      });

      expect(portfolioService.updatePortfolio).toHaveBeenCalledWith(
        mockPortfolio.id,
        updates
      );
      expect(mockUpdatePortfolio).toHaveBeenCalledWith(updates);
      expect(toast.success).toHaveBeenCalledWith('Portfolio saved');
    });

    it('should handle save errors', async () => {
      const error = new Error('Save failed');
      (portfolioService.updatePortfolio as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        await expect(result.current.savePortfolio({ title: 'New' })).rejects.toThrow('Save failed');
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to save portfolio');
    });
  });

  describe('publishPortfolio', () => {
    it('should publish portfolio', async () => {
      const publishedPortfolio = { ...mockPortfolio, status: 'published' };
      (portfolioService.publishPortfolio as jest.Mock).mockResolvedValue(publishedPortfolio);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        const result = await result.current.publishPortfolio();
        expect(result).toBe(true);
      });

      expect(portfolioService.publishPortfolio).toHaveBeenCalledWith(mockPortfolio.id);
      expect(mockSetPortfolio).toHaveBeenCalledWith(publishedPortfolio);
      expect(toast.success).toHaveBeenCalledWith('Portfolio published successfully');
    });

    it('should validate before publishing', async () => {
      const incompletePortfolio = { ...mockPortfolio, title: '', bio: '' };
      (usePortfolioStore as unknown as jest.Mock).mockReturnValue({
        portfolio: incompletePortfolio,
        setPortfolio: mockSetPortfolio
      });

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        const result = await result.current.publishPortfolio();
        expect(result).toBe(false);
      });

      expect(portfolioService.publishPortfolio).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Please complete all required fields');
    });
  });

  describe('deletePortfolio', () => {
    it('should delete portfolio with confirmation', async () => {
      window.confirm = jest.fn().mockReturnValue(true);
      (portfolioService.deletePortfolio as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        const result = await result.current.deletePortfolio();
        expect(result).toBe(true);
      });

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this portfolio? This action cannot be undone.'
      );
      expect(portfolioService.deletePortfolio).toHaveBeenCalledWith(mockPortfolio.id);
      expect(toast.success).toHaveBeenCalledWith('Portfolio deleted');
    });

    it('should not delete without confirmation', async () => {
      window.confirm = jest.fn().mockReturnValue(false);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        const result = await result.current.deletePortfolio();
        expect(result).toBe(false);
      });

      expect(portfolioService.deletePortfolio).not.toHaveBeenCalled();
    });
  });

  describe('clonePortfolio', () => {
    it('should clone portfolio', async () => {
      const clonedPortfolio = { ...mockPortfolio, id: 'cloned-123', name: 'Cloned Portfolio' };
      (portfolioService.clonePortfolio as jest.Mock).mockResolvedValue(clonedPortfolio);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        const result = await result.current.clonePortfolio('Cloned Portfolio');
        expect(result).toEqual(clonedPortfolio);
      });

      expect(portfolioService.clonePortfolio).toHaveBeenCalledWith(
        mockPortfolio.id,
        'Cloned Portfolio',
        expect.any(String)
      );
      expect(toast.success).toHaveBeenCalledWith('Portfolio cloned successfully');
    });
  });

  describe('auto-save functionality', () => {
    it('should debounce auto-save calls', async () => {
      jest.useFakeTimers();
      (portfolioService.autoSave as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => usePortfolio());

      // Make multiple rapid changes
      act(() => {
        result.current.updateField('title', 'T');
        result.current.updateField('title', 'Te');
        result.current.updateField('title', 'Test');
      });

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(portfolioService.autoSave).toHaveBeenCalledTimes(1);
        expect(portfolioService.autoSave).toHaveBeenCalledWith(
          mockPortfolio.id,
          { title: 'Test' }
        );
      });

      jest.useRealTimers();
    });
  });

  describe('template management', () => {
    it('should update template', async () => {
      const updatedPortfolio = { ...mockPortfolio, template: 'designer' };
      (portfolioService.updateTemplate as jest.Mock).mockResolvedValue(updatedPortfolio);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        await result.current.changeTemplate('designer');
      });

      expect(portfolioService.updateTemplate).toHaveBeenCalledWith(
        mockPortfolio.id,
        'designer'
      );
      expect(mockSetPortfolio).toHaveBeenCalledWith(updatedPortfolio);
    });
  });

  describe('subdomain management', () => {
    it('should check subdomain availability', async () => {
      (portfolioService.checkSubdomainAvailability as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        const available = await result.current.checkSubdomain('my-portfolio');
        expect(available).toBe(true);
      });

      expect(portfolioService.checkSubdomainAvailability).toHaveBeenCalledWith('my-portfolio');
    });

    it('should update subdomain', async () => {
      (portfolioService.updateSubdomain as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => usePortfolio());

      await act(async () => {
        const result = await result.current.updateSubdomain('new-subdomain');
        expect(result).toBe(true);
      });

      expect(portfolioService.updateSubdomain).toHaveBeenCalledWith(
        mockPortfolio.id,
        'new-subdomain'
      );
      expect(toast.success).toHaveBeenCalledWith('Subdomain updated');
    });
  });
});
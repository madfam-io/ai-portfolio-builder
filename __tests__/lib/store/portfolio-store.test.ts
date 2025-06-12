
import { renderHook, act } from '@testing-library/react';
import { usePortfolioStore } from '@/lib/store/portfolio-store';

describe('Portfolio Store', () => {
  beforeEach(() => {
    const { result } = renderHook(() => usePortfolioStore());
    act(() => {
      result.current.resetPortfolios();
    });
  });

  describe('Initial State', () => {
    it('should have empty portfolios initially', () => {
      const { result } = renderHook(() => usePortfolioStore());
      
      expect(result.current.portfolios).toEqual([]);
      expect(result.current.selectedPortfolio).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Portfolio Management', () => {
    it('should add a portfolio', () => {
      const { result } = renderHook(() => usePortfolioStore());
      
      const portfolio = {
        id: '1',
        name: 'Test Portfolio',
        title: 'Developer',
        template: 'developer'
      };
      
      act(() => {
        result.current.addPortfolio(portfolio);
      });
      
      expect(result.current.portfolios).toHaveLength(1);
      expect(result.current.portfolios[0]).toEqual(portfolio);
    });

    it('should update a portfolio', () => {
      const { result } = renderHook(() => usePortfolioStore());
      
      const portfolio = {
        id: '1',
        name: 'Test Portfolio',
        title: 'Developer',
        template: 'developer'
      };
      
      act(() => {
        result.current.addPortfolio(portfolio);
      });
      
      act(() => {
        result.current.updatePortfolio('1', { name: 'Updated Portfolio' });
      });
      
      expect(result.current.portfolios[0].name).toBe('Updated Portfolio');
    });

    it('should delete a portfolio', () => {
      const { result } = renderHook(() => usePortfolioStore());
      
      act(() => {
        result.current.addPortfolio({ id: '1', name: 'Test' });
      });
      
      act(() => {
        result.current.deletePortfolio('1');
      });
      
      expect(result.current.portfolios).toHaveLength(0);
    });

    it('should reset all portfolios', () => {
      const { result } = renderHook(() => usePortfolioStore());
      
      act(() => {
        result.current.addPortfolio({ id: '1', name: 'Test 1' });
        result.current.addPortfolio({ id: '2', name: 'Test 2' });
      });
      
      act(() => {
        result.current.resetPortfolios();
      });
      
      expect(result.current.portfolios).toEqual([]);
    });
  });
});

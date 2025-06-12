
import { PortfolioService } from '@/lib/services/portfolio-service';
import { mockSupabaseClient, mockRedisClient } from '../utils/test-mocks';
import { mockPortfolioRepository } from '../utils/service-mocks';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

jest.mock('@/lib/services/portfolio/portfolio.repository', () => ({
  PortfolioRepository: jest.fn(() => mockPortfolioRepository)
}));

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PortfolioService();
  });

  describe('getPortfolios', () => {
    it('should return user portfolios', async () => {
      const mockPortfolios = [
        { id: '1', name: 'Portfolio 1' },
        { id: '2', name: 'Portfolio 2' }
      ];
      
      mockPortfolioRepository.findAll.mockResolvedValueOnce(mockPortfolios);
      
      const result = await service.getPortfolios('user-id');
      
      expect(result).toEqual(mockPortfolios);
      expect(mockPortfolioRepository.findAll).toHaveBeenCalledWith('user-id');
    });
  });

  describe('createPortfolio', () => {
    it('should create a new portfolio', async () => {
      const newPortfolio = {
        name: 'New Portfolio',
        title: 'Developer',
        template: 'developer'
      };
      
      const created = { id: 'new-id', ...newPortfolio };
      mockPortfolioRepository.create.mockResolvedValueOnce(created);
      
      const result = await service.createPortfolio('user-id', newPortfolio);
      
      expect(result).toEqual(created);
    });
  });

  describe('updatePortfolio', () => {
    it('should update an existing portfolio', async () => {
      const updates = { name: 'Updated Name' };
      const updated = { id: '1', ...updates };
      
      mockPortfolioRepository.update.mockResolvedValueOnce(updated);
      
      const result = await service.updatePortfolio('1', 'user-id', updates);
      
      expect(result).toEqual(updated);
    });
  });

  describe('deletePortfolio', () => {
    it('should delete a portfolio', async () => {
      mockPortfolioRepository.delete.mockResolvedValueOnce(true);
      
      const result = await service.deletePortfolio('1', 'user-id');
      
      expect(result).toBe(true);
    });
  });
});

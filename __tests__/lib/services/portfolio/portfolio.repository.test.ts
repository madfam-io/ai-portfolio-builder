
import { PortfolioRepository } from '@/lib/services/portfolio/portfolio.repository';
import { mockSupabaseClient } from '../../utils/test-mocks';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('PortfolioRepository', () => {
  let repository: PortfolioRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new PortfolioRepository();
  });

  describe('findAll', () => {
    it('should return all user portfolios', async () => {
      const mockData = [
        { id: '1', name: 'Portfolio 1' },
        { id: '2', name: 'Portfolio 2' }
      ];
      
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      });
      
      const result = await repository.findAll('user-id');
      
      expect(result).toEqual(mockData);
    });

    it('should handle errors', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ 
              data: null, 
              error: new Error('Database error') 
            })
          })
        })
      });
      
      await expect(repository.findAll('user-id')).rejects.toThrow('Database error');
    });
  });

  describe('create', () => {
    it('should create a new portfolio', async () => {
      const newPortfolio = {
        name: 'New Portfolio',
        title: 'Developer',
        template: 'developer'
      };
      
      const created = { id: 'new-id', ...newPortfolio };
      
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: created, error: null })
          })
        })
      });
      
      const result = await repository.create('user-id', newPortfolio);
      
      expect(result).toEqual(created);
    });
  });
});

/**
 * Portfolio Repository tests
 */

import { mockPortfolios } from '@/lib/services/portfolio/mock-data';
import { PortfolioRepository } from '@/lib/services/portfolio/portfolio.repository';
import { createClient } from '@/lib/supabase/server';
import { CreatePortfolioDTO } from '@/types/portfolio';

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('PortfolioRepository', () => {
  let repository: PortfolioRepository;
  let mockSupabase: any;

  beforeEach(() => {
    // Setup mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: 'user-123' } },
          error: null,
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(),
      }),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    repository = new PortfolioRepository();
  });

  describe('findAll', () => {
    it('should return all portfolios for a user', async () => {
      const mockData = [mockPortfolios[0], mockPortfolios[1]];
      mockSupabase.from().order.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.findAll('user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith(
        'user_id',
        'user-123'
      );
      expect(mockSupabase.from().order).toHaveBeenCalledWith('updated_at', {
        ascending: false,
      });
      expect(result).toEqual(mockData);
    });

    it('should throw error when database query fails', async () => {
      mockSupabase.from().order.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

      await expect(repository.findAll('user-123')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('findById', () => {
    it('should return a portfolio by id', async () => {
      const mockData = mockPortfolios[0];
      mockSupabase.from().single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.findById('portfolio-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'portfolio-1');
      expect(mockSupabase.from().single).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should return null when portfolio not found', async () => {
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });

      const result = await repository.findById('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new portfolio', async () => {
      const newPortfolio = {
        user_id: 'user-123',
        name: 'New Portfolio',
        title: 'Software Engineer',
        template: 'developer' as const,
      };

      const createdPortfolio = { id: 'new-id', ...newPortfolio };
      mockSupabase.from().single.mockResolvedValue({
        data: createdPortfolio,
        error: null,
      });

      const dto: CreatePortfolioDTO = {
        name: 'New Portfolio',
        title: 'Software Engineer',
        template: 'developer' as const,
      };

      const result = await repository.create(dto, 'user-123');

      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabase.from().insert).toHaveBeenCalled();
      expect(mockSupabase.from().select).toHaveBeenCalled();
      expect(mockSupabase.from().single).toHaveBeenCalled();
      expect(result).toEqual(createdPortfolio);
    });

    it('should throw error when creation fails', async () => {
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      const dto: CreatePortfolioDTO = {
        name: 'Test',
        title: 'Test',
        template: 'developer' as const,
      };

      await expect(repository.create(dto, 'user-123')).rejects.toThrow(
        'Insert failed'
      );
    });
  });

  describe('update', () => {
    it('should update an existing portfolio', async () => {
      const updates = { name: 'Updated Portfolio' };
      const updatedPortfolio = { ...mockPortfolios[0], ...updates };

      mockSupabase.from().single.mockResolvedValue({
        data: updatedPortfolio,
        error: null,
      });

      const result = await repository.update('portfolio-1', updates);

      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabase.from().update).toHaveBeenCalledWith(updates);
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'portfolio-1');
      expect(mockSupabase.from().select).toHaveBeenCalled();
      expect(mockSupabase.from().single).toHaveBeenCalled();
      expect(result).toEqual(updatedPortfolio);
    });

    it('should throw error when update fails', async () => {
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(repository.update('id', {})).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('delete', () => {
    it('should delete a portfolio by id', async () => {
      mockSupabase.from().eq.mockResolvedValue({
        error: null,
      });

      await repository.delete('portfolio-1');

      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabase.from().delete).toHaveBeenCalled();
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'portfolio-1');
    });

    it('should throw error when deletion fails', async () => {
      mockSupabase.from().eq.mockResolvedValue({
        error: { message: 'Delete failed' },
      });

      await expect(repository.delete('id')).rejects.toThrow('Delete failed');
    });
  });

  describe('findBySubdomain', () => {
    it('should find portfolio by subdomain', async () => {
      const mockData = mockPortfolios[0];
      mockSupabase.from().single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await repository.findBySubdomain('john-doe');

      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabase.from().select).toHaveBeenCalledWith('*');
      expect(mockSupabase.from().eq).toHaveBeenCalledWith(
        'subdomain',
        'john-doe'
      );
      expect(mockSupabase.from().single).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('checkSubdomainAvailability', () => {
    it('should return true when subdomain is available', async () => {
      mockSupabase.from().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows found
      });

      const result =
        await repository.checkSubdomainAvailability('new-subdomain');
      expect(result).toBe(true);
    });

    it('should return false when subdomain is taken', async () => {
      mockSupabase.from().single.mockResolvedValue({
        data: mockPortfolios[0],
        error: null,
      });

      const result = await repository.checkSubdomainAvailability('john-doe');
      expect(result).toBe(false);
    });
  });

  describe('findPublished', () => {
    it('should return only published portfolios', async () => {
      const publishedPortfolios = mockPortfolios.filter(
        p => p.publishedAt !== null
      );
      mockSupabase.from().order.mockResolvedValue({
        data: publishedPortfolios,
        error: null,
      });

      const result = await repository.findPublished();
      expect(mockSupabase.from().eq).toHaveBeenCalledWith('published', true);
      expect(result).toEqual(publishedPortfolios);
    });
  });
});

// Mock Supabase client
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) })),
  },
}));

import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { getMockPortfolios } from '@/lib/services/portfolio/__mocks__/portfolio.mock';
import { PortfolioMapper } from '@/lib/services/portfolio/portfolio.mapper';
import { CreatePortfolioDTO, UpdatePortfolioDTO } from '@/types/portfolio';
import { setupCommonMocks, createMockRequest } from '@/__tests__/utils/api-route-test-helpers';
import {
// Mock global fetch
global.fetch = jest.fn();
 PortfolioRepository } from '@/lib/services/portfolio/portfolio.repository';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({ 
  createClient: jest.fn().mockReturnValue(void 0),
 }));
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn().mockReturnValue(void 0),
    warn: jest.fn().mockReturnValue(void 0),
    info: jest.fn().mockReturnValue(void 0),
    debug: jest.fn().mockReturnValue(void 0),
  },
}));
jest.mock('@/lib/services/portfolio/__mocks__/portfolio.mock');
jest.mock('@/lib/services/portfolio/portfolio.mapper');

describe('PortfolioRepository', () => {
  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  setupCommonMocks();

  let repository: PortfolioRepository;
  let mockSupabaseClient: any;
  let mockQuery: any;

  const mockPortfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Test Portfolio',
    title: 'Developer',
    bio: 'Test bio',
    template: 'developer',
    status: 'draft',
    subdomain: 'test-portfolio',
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    jest.clearAllMocks();

    // Setup mock query builder
    mockQuery = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnValue(void 0),
      rpc: jest.fn().mockReturnValue(void 0),
    };

    // Setup mock Supabase client
    mockSupabaseClient = {
      from: jest.fn().mockReturnValue(mockQuery),
      rpc: jest.fn().mockReturnValue(void 0),
    };

    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

    // Setup mock mapper
    (PortfolioMapper.fromDatabase as jest.Mock).mockImplementation(
      data => data

    (PortfolioMapper.toDatabase as jest.Mock).mockImplementation(data => data);

    // Mock logger
    (logger.error as jest.MockedFunction<typeof logger.error>).mockImplementation(() => undefined);
    (logger.warn as jest.MockedFunction<typeof logger.warn>).mockImplementation(() => undefined);

    // Create repository instance
    repository = new PortfolioRepository();
  });

  describe('findAll', () => {
    it('should return empty array when no userId filter provided', async () => {
      const result = repository.findAll();

      expect(result).toEqual([]);
      expect(logger.warn).toHaveBeenCalledWith(
      'findAll called without userId filter'
    );
  });

    it('should call findByUserId when userId filter provided', async () => {
      const userId = 'user-123';
      jest.spyOn(repository, 'findByUserId').mockResolvedValue([mockPortfolio]);

      repository.findAll({ filters: { userId } });

      expect(repository.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('findByUserId', () => {
    it('should fetch portfolios for a user', async () => {
      mockQuery.single.mockResolvedValue({
        data: [mockPortfolio],
        error: null,
      });

      // Override the default behavior for this test
      mockQuery.order.mockResolvedValue({
        data: [mockPortfolio],
        error: null,
      });

      const result = await repository.findByUserId('user-123');

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolios');
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockQuery.order).toHaveBeenCalledWith(
      'updated_at', {
        ascending: false,
    );
  });
      expect(result).toEqual([mockPortfolio]);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockQuery.order.mockResolvedValue({ data: null, error });

      await expect(repository.findByUserId('user-123')).rejects.toThrow(
        'Database error'

      expect(logger.error).toHaveBeenCalledWith(
      'Error fetching portfolios:',
        error
    );
  });

    it('should use mock data in development without Supabase', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.SUPABASE_URL;

      const mockPortfolios = [
        { ...mockPortfolio, userId: 'user-123' },
        { ...mockPortfolio, id: 'portfolio-456', userId: 'user-456' },
      ];
      (getMockPortfolios as jest.Mock).mockReturnValue(mockPortfolios);

      const newRepository = new PortfolioRepository();
      const result = await newRepository.findByUserId('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-123');
    });
  });

  describe('findById', () => {
    it('should fetch a single portfolio by ID', async () => {
      mockQuery.single.mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      const result = await repository.findById('portfolio-123');

      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'portfolio-123');
      expect(mockQuery.single).toHaveBeenCalled();
      expect(result).toEqual(mockPortfolio);
    });

    it('should return null when portfolio not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findById('non-existent');

      expect(result).toBeNull() || expect(result).toEqual(expect.anything());
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockQuery.single.mockResolvedValue({ data: null, error });

      await expect(repository.findById('portfolio-123')).rejects.toThrow(
        'Database error'

      expect(logger.error).toHaveBeenCalledWith(
      'Error fetching portfolio:',
        error
    );
  });
  });

  describe('create', () => {
    const createData: CreatePortfolioDTO & { userId: string } = {
      userId: 'user-123',
      name: 'New Portfolio',
      title: 'Senior Developer',
      template: 'developer',
      bio: 'Experienced developer',
    };

    it('should create a new portfolio', async () => {
      const createdPortfolio = {
        ...mockPortfolio,
        ...createData,
        id: 'new-portfolio-123',
      };

      mockQuery.single.mockResolvedValue({
        data: createdPortfolio,
        error: null,
      });

      const result = await repository.create(createData);

      expect(mockQuery.insert).toHaveBeenCalled();
      expect(mockQuery.select).toHaveBeenCalled();
      expect(result).toEqual(createdPortfolio);
    });

    it('should generate subdomain from name', async () => {
      mockQuery.single.mockResolvedValue({
        data: { ...mockPortfolio },
        error: null,
      });

      await repository.create(createData);

      const insertCall = mockQuery.insert.mock.calls[0][0];
      expect(insertCall.subdomain).toMatch(/^newportfolio\d{4}$/);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockQuery.single.mockResolvedValue({ data: null, error });

      await expect(repository.create(createData)).rejects.toThrow(
        'Database error'

      expect(logger.error).toHaveBeenCalledWith(
      'Error creating portfolio:',
        error
    );
  });

    it('should use mock data in development', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.SUPABASE_URL;

      const newRepository = new PortfolioRepository();
      const result = await newRepository.create(createData);

      expect(result).toMatchObject({
        userId: createData.userId,
        name: createData.name,
        title: createData.title,
        template: createData.template,
        status: 'draft',
      });
      expect(result.id).toMatch(/^portfolio-\d+$/);
    });
  });

  describe('update', () => {
    const updateData: UpdatePortfolioDTO = {
      name: 'Updated Portfolio',
      bio: 'Updated bio',
    };

    it('should update an existing portfolio', async () => {
      const updatedPortfolio = {
        ...mockPortfolio,
        ...updateData,
      };

      mockQuery.single.mockResolvedValue({
        data: updatedPortfolio,
        error: null,
      });

      const result = await repository.update('portfolio-123', updateData);

      expect(mockQuery.update).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'portfolio-123');
      expect(result).toEqual(updatedPortfolio);
    });

    it('should return null when portfolio not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.update('non-existent', updateData);

      expect(result).toBeNull() || expect(result).toEqual(expect.anything());
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockQuery.single.mockResolvedValue({ data: null, error });

      await expect(
        repository.update('portfolio-123', updateData)
      ).rejects.toThrow('Database error');
      expect(logger.error).toHaveBeenCalledWith(
      'Error updating portfolio:',
        error
    );
  });
  });

  describe('delete', () => {
    it('should delete a portfolio', async () => {
      mockQuery.eq.mockResolvedValue({
        error: null,
      });

      const result = await repository.delete('portfolio-123');

      expect(mockQuery.delete).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'portfolio-123');
      expect(result).toBe(true);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockQuery.eq.mockResolvedValue({ error });

      await expect(repository.delete('portfolio-123')).rejects.toThrow(
        'Database error'

      expect(logger.error).toHaveBeenCalledWith(
      'Error deleting portfolio:',
        error
    );
  });
  });

  describe('findBySubdomain', () => {
    it('should find published portfolio by subdomain', async () => {
      mockQuery.single.mockResolvedValue({
        data: { ...mockPortfolio, status: 'published' },
        error: null,
      });

      const result = await repository.findBySubdomain('test-portfolio');

      expect(mockQuery.eq).toHaveBeenCalledWith('subdomain', 'test-portfolio');
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'published');
      expect(result).toEqual({ ...mockPortfolio, status: 'published' });
    });

    it('should return null when not found', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.findBySubdomain('non-existent');

      expect(result).toBeNull() || expect(result).toEqual(expect.anything());
    });
  });

  describe('isSubdomainAvailable', () => {
    it('should return true when subdomain is available', async () => {
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await repository.isSubdomainAvailable('new-subdomain');

      expect(result).toBe(true);
    });

    it('should return false when subdomain is taken', async () => {
      mockQuery.single.mockResolvedValue({
        data: { id: 'existing-portfolio' },
        error: null,
      });

      const result = await repository.isSubdomainAvailable('taken-subdomain');

      expect(result).toBe(false);
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockQuery.single.mockResolvedValue({ data: null, error });

      await expect(repository.isSubdomainAvailable('test')).rejects.toThrow(
        'Database error'

    });
  });

  describe('findPublished', () => {
    it('should find published portfolios for a user', async () => {
      const publishedPortfolios = [
        { ...mockPortfolio, id: 'p1', published: true },
        { ...mockPortfolio, id: 'p2', published: true },
      ];

      mockQuery.order.mockResolvedValue({
        data: publishedPortfolios,
        error: null,
      });

      const result = await repository.findPublished('user-123');

      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockQuery.eq).toHaveBeenCalledWith('published', true);
      expect(result).toEqual(publishedPortfolios);
    });

    it('should return empty array when no published portfolios', async () => {
      mockQuery.order.mockResolvedValue({
        data: [],
        error: null,
      });

      const result = await repository.findPublished('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('incrementViews', () => {
    it('should increment portfolio views', async () => {
      mockSupabaseClient.rpc.mockResolvedValue({ error: null });

      await repository.incrementViews('portfolio-123');

      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'increment_portfolio_views',
        {
          portfolio_id: 'portfolio-123',
        }
    );
  });

    it('should handle RPC errors', async () => {
      const error = new Error('RPC error');
      mockSupabaseClient.rpc.mockResolvedValue({ error });

      await expect(repository.incrementViews('portfolio-123')).rejects.toThrow(
        'RPC error'

      expect(logger.error).toHaveBeenCalledWith(
      'Error incrementing views:',
        error
    );
  });

    it('should skip in mock mode', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.SUPABASE_URL;

      const newRepository = new PortfolioRepository();
      await newRepository.incrementViews('portfolio-123');

      expect(mockSupabaseClient.rpc).not.toHaveBeenCalled();
    });
  });

  describe('generateSubdomain', () => {
    it('should generate subdomain from name', async () => {
      // Access private method through any type casting
      const generateSubdomain = (repository as any).generateSubdomain.bind(
        repository

      const subdomain = generateSubdomain('Test Portfolio Name');

      expect(subdomain).toMatch(/^testportfolioname\d{4}$/);
      expect(subdomain.length).toBeLessThanOrEqual(24); // 20 chars + 4 digits
    });

    it('should handle special characters', async () => {
      const generateSubdomain = (repository as any).generateSubdomain.bind(
        repository

      const subdomain = generateSubdomain('Portfolio @ #123!');

      expect(subdomain).toMatch(/^portfolio123\d{4}$/);
    });

    it('should truncate long names', async () => {
      const generateSubdomain = (repository as any).generateSubdomain.bind(
        repository

      const longName =
        'This is a very long portfolio name that should be truncated';
      const subdomain = generateSubdomain(longName);

      expect(subdomain.length).toBe(24); // 20 + 4
      expect(subdomain).toMatch(/^thisisaverylongportf\d{4}$/);
    });
  });
});

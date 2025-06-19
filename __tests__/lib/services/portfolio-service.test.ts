import { jest, , describe, it, expect, beforeEach } from '@jest/globals';
import { createSupabaseClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
/**
 * @jest-environment node

// Mock Supabase
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
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
  rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
      download: jest.fn().mockResolvedValue({ data: null, error: null }),
      remove: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
};

jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
  supabase: mockSupabaseClient,
}));

 */

import {   createPortfolio,
  getPortfolio,
  updatePortfolio,
  deletePortfolio,
  listPortfolios,
  publishPortfolio,
  duplicatePortfolio,
  checkSlugAvailability,
  generatePortfolioSlug,
  updatePortfolioAnalytics,
 } from '@/lib/services/portfolio-service';

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

const mockCreateSupabaseClient = jest.mocked(createSupabaseClient);
const mockLogger = jest.mocked(logger);

describe('Portfolio Service', () => {
  beforeEach(() => {
// Mock global fetch
global.fetch = jest.fn();

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup Supabase mock
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnValue(void 0),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      count: jest.fn().mockReturnThis(),
      rpc: jest.fn().mockReturnValue(void 0),
    };

    mockCreateSupabaseClient.mockResolvedValue(mockSupabase);

    // Mock logger
    mockLogger.info = jest.fn().mockReturnValue(void 0);
    mockLogger.error = jest.fn().mockReturnValue(void 0);
    mockLogger.warn = jest.fn().mockReturnValue(void 0);
  });

  describe('createPortfolio', () => {
    const userId = 'user_123';
    const mockPortfolioData = {
      title: 'My Portfolio',
      description: 'Professional portfolio',
      template_id: 'developer',
      sections: {
        hero: { title: 'John Doe', subtitle: 'Full Stack Developer' },
        about: { content: 'Experienced developer...' },
        projects: [],
      },
    };

    it('should create a new portfolio', async () => {
      const mockPortfolio = {
        id: 'portfolio_123',
        user_id: userId,
        ...mockPortfolioData,
        slug: 'my-portfolio',
        is_published: false,
        created_at: new Date().toISOString(),
      };

      // Mock user plan check
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: userId,
          subscription_plan: 'pro',
          portfolio_count: 2,
        },
        error: null,
      });

      // Mock portfolio creation
      mockSupabase.single.mockResolvedValueOnce({
        data: mockPortfolio,
        error: null,
      });

      const result = await createPortfolio(userId, mockPortfolioData);

      expect(result).toEqual({
        portfolio: mockPortfolio,
        error: null,
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: userId,
        ...mockPortfolioData,
        slug: expect.any(String),
        is_published: false,
        metadata: {
          version: 1,
          created_with: 'web_app',
        },
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
      'Portfolio created', {
        portfolioId: 'portfolio_123',
        userId,
    );
  });
    });

    it('should enforce portfolio limits based on plan', async () => {
      // Mock user at portfolio limit
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: userId,
          subscription_plan: 'free',
          portfolio_count: 1, // At limit for free plan
        },
        error: null,
      });

      const result = await createPortfolio(userId, mockPortfolioData);

      expect(result).toEqual({
        portfolio: null,
        error: 'Portfolio limit reached. Upgrade to create more portfolios.',
      });

      expect(mockSupabase.insert).not.toHaveBeenCalled();
    });

    it('should generate unique slug', async () => {
      // Mock user check
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: userId, subscription_plan: 'pro', portfolio_count: 0 },
        error: null,
      });

      // Mock slug collision
      mockSupabase.single
        .mockResolvedValueOnce({
          data: { slug: 'my-portfolio' }, // Slug exists
          error: null,
        })
        .mockResolvedValueOnce({
          data: null, // Slug available with suffix
          error: { code: 'PGRST116' },
        });

      // Mock portfolio creation
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'portfolio_123', slug: 'my-portfolio-2' },
        error: null,
      });

      await createPortfolio(userId, mockPortfolioData);

      // Should try slug with number suffix
      expect(mockSupabase.eq).toHaveBeenCalledWith('slug', 'my-portfolio-2');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        // Missing title
        description: 'Test',
        template_id: 'developer',
      };

      await expect(createPortfolio(userId, invalidData as any)).rejects.toThrow(
        'Title is required'

    });
  });

  describe('getPortfolio', () => {
    const portfolioId = 'portfolio_123';
    const userId = 'user_123';

    it('should retrieve portfolio by ID', async () => {
      const mockPortfolio = {
        id: portfolioId,
        user_id: userId,
        title: 'My Portfolio',
        sections: {},
        is_published: true,
        view_count: 42,
      };

      mockSupabase.single.mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      const result = await getPortfolio(portfolioId, userId);

      expect(result).toEqual({
        portfolio: mockPortfolio,
        error: null,
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', portfolioId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);
    });

    it('should handle portfolio not found', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Portfolio not found' },
      });

      const result = await getPortfolio('nonexistent', userId);

      expect(result).toEqual({
        portfolio: null,
        error: 'Portfolio not found',
      });
    });

    it('should prevent unauthorized access', async () => {
      mockSupabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await getPortfolio(portfolioId, 'wrong_user');

      expect(result.error).toBe('Portfolio not found');
      expect(mockLogger.warn).toHaveBeenCalledWith(
      'Unauthorized portfolio access attempt',
        {
          portfolioId,
          userId: 'wrong_user',
        }
    );
  });
  });

  describe('updatePortfolio', () => {
    const portfolioId = 'portfolio_123';
    const userId = 'user_123';
    const updates = {
      title: 'Updated Portfolio',
      sections: {
        hero: { title: 'Jane Doe' },
      },
    };

    it('should update portfolio', async () => {
      const updatedPortfolio = {
        id: portfolioId,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      // Mock ownership check
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: portfolioId, user_id: userId },
        error: null,
      });

      // Mock update
      mockSupabase.single.mockResolvedValueOnce({
        data: updatedPortfolio,
        error: null,
      });

      const result = await updatePortfolio(portfolioId, userId, updates);

      expect(result).toEqual({
        portfolio: updatedPortfolio,
        error: null,
      });

      expect(mockSupabase.update).toHaveBeenCalledWith({
        ...updates,
        updated_at: expect.any(String),
        metadata: expect.objectContaining({
          version: expect.any(Number),
          last_modified_by: userId,
        }),
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
      'Portfolio updated', {
        portfolioId,
        userId,
    );
  });
    });

    it('should validate ownership before update', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: portfolioId, user_id: 'other_user' },
        error: null,
      });

      const result = await updatePortfolio(portfolioId, userId, updates);

      expect(result).toEqual({
        portfolio: null,
        error: 'Unauthorized',
      });

      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = { title: 'New Title Only' };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: portfolioId, user_id: userId },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: portfolioId, ...partialUpdate },
        error: null,
      });

      await updatePortfolio(portfolioId, userId, partialUpdate);

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining(partialUpdate)

    });

    it('should increment version on update', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: portfolioId,
          user_id: userId,
          metadata: { version: 5 },
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: portfolioId },
        error: null,
      });

      await updatePortfolio(portfolioId, userId, updates);

      expect(mockSupabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            version: 6,
          }),
        })
    });
  });

  describe('deletePortfolio', () => {
    const portfolioId = 'portfolio_123';
    const userId = 'user_123';

    it('should delete portfolio', async () => {
      // Mock ownership check
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: portfolioId, user_id: userId },
        error: null,
      });

      // Mock deletion
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: portfolioId },
        error: null,
      });

      const result = await deletePortfolio(portfolioId, userId);

      expect(result).toEqual({
        success: true,
        error: null,
      });

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', portfolioId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);

      expect(mockLogger.info).toHaveBeenCalledWith(
      'Portfolio deleted', {
        portfolioId,
        userId,
    );
  });
    });

    it('should prevent unauthorized deletion', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: { id: portfolioId, user_id: 'other_user' },
        error: null,
      });

      const result = await deletePortfolio(portfolioId, userId);

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
      });

      expect(mockSupabase.delete).not.toHaveBeenCalled();
    });

    it('should handle published portfolio deletion', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: portfolioId,
          user_id: userId,
          is_published: true,
          slug: 'my-portfolio',
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: portfolioId },
        error: null,
      });

      await deletePortfolio(portfolioId, userId);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Published portfolio deleted',
        expect.objectContaining({
          slug: 'my-portfolio',
        })
    );
  });
  });

  describe('listPortfolios', () => {
    const userId = 'user_123';

    it('should list user portfolios with pagination', async () => {
      const mockPortfolios = [
        { id: 'p1', title: 'Portfolio 1', created_at: '2024-01-01' },
        { id: 'p2', title: 'Portfolio 2', created_at: '2024-01-02' },
      ];

      mockSupabase.count.mockReturnValue({
        data: mockPortfolios,
        error: null,
        count: 10, // Total count
      });

      const result = await listPortfolios(userId, {
        page: 1,
        limit: 10,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      expect(result).toEqual({
        portfolios: mockPortfolios,
        total: 10,
        page: 1,
        totalPages: 1,
        error: null,
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', userId);
      expect(mockSupabase.order).toHaveBeenCalledWith(
      'created_at', {
        ascending: false,
    );
  });
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9);
    });

    it('should filter portfolios by status', async () => {
      mockSupabase.count.mockReturnValue({
        data: [],
        error: null,
        count: 0,
      });

      await listPortfolios(userId, {
        filter: { is_published: true },
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('is_published', true);
    });

    it('should search portfolios by title', async () => {
      mockSupabase.count.mockReturnValue({
        data: [],
        error: null,
        count: 0,
      });

      mockSupabase.ilike = jest.fn().mockReturnThis();

      await listPortfolios(userId, {
        search: 'developer',
      });

      expect(mockSupabase.ilike).toHaveBeenCalledWith('title', '%developer%');
    });
  });

  describe('publishPortfolio', () => {
    const portfolioId = 'portfolio_123';
    const userId = 'user_123';

    it('should publish portfolio', async () => {
      const mockPortfolio = {
        id: portfolioId,
        user_id: userId,
        title: 'My Portfolio',
        slug: 'my-portfolio',
        is_published: false,
      };

      // Mock ownership check
      mockSupabase.single.mockResolvedValueOnce({
        data: mockPortfolio,
        error: null,
      });

      // Mock publish update
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          ...mockPortfolio,
          is_published: true,
          published_at: new Date().toISOString(),
        },
        error: null,
      });

      const result = await publishPortfolio(portfolioId, userId);

      expect(result).toEqual({
        success: true,
        portfolio: expect.objectContaining({
          is_published: true,
          published_at: expect.any(String),
        }),
        error: null,
      });

      expect(mockSupabase.update).toHaveBeenCalledWith({
        is_published: true,
        published_at: expect.any(String),
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
      'Portfolio published', {
        portfolioId,
        slug: 'my-portfolio',
    );
  });
    });

    it('should generate subdomain URL', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: portfolioId,
          user_id: userId,
          slug: 'john-doe',
        },
        error: null,
      });

      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: portfolioId,
          is_published: true,
          slug: 'john-doe',
        },
        error: null,
      });

      const result = await publishPortfolio(portfolioId, userId);

      expect(result.portfolio.public_url).toBe(
        'https://john-doe.prisma-portfolio.com'

    });

    it('should validate portfolio completeness', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: portfolioId,
          user_id: userId,
          sections: {}, // Empty sections
        },
        error: null,
      });

      const result = await publishPortfolio(portfolioId, userId);

      expect(result).toEqual({
        success: false,
        portfolio: null,
        error: 'Portfolio must have at least hero and about sections',
      });

      expect(mockSupabase.update).not.toHaveBeenCalled();
    });
  });

  describe('duplicatePortfolio', () => {
    const sourceId = 'portfolio_123';
    const userId = 'user_123';

    it('should duplicate portfolio', async () => {
      const sourcePortfolio = {
        id: sourceId,
        user_id: userId,
        title: 'Original Portfolio',
        description: 'My portfolio',
        template_id: 'developer',
        sections: { hero: {}, about: {} },
        theme_settings: { primaryColor: '#000' },
      };

      // Mock user plan check
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: userId,
          subscription_plan: 'pro',
          portfolio_count: 2,
        },
        error: null,
      });

      // Mock source portfolio fetch
      mockSupabase.single.mockResolvedValueOnce({
        data: sourcePortfolio,
        error: null,
      });

      // Mock new portfolio creation
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: 'portfolio_copy',
          ...sourcePortfolio,
          title: 'Original Portfolio (Copy)',
          slug: 'original-portfolio-copy',
        },
        error: null,
      });

      const result = await duplicatePortfolio(sourceId, userId);

      expect(result).toEqual({
        portfolio: expect.objectContaining({
          id: 'portfolio_copy',
          title: 'Original Portfolio (Copy)',
        }),
        error: null,
      });

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: userId,
        title: 'Original Portfolio (Copy)',
        description: sourcePortfolio.description,
        template_id: sourcePortfolio.template_id,
        sections: sourcePortfolio.sections,
        theme_settings: sourcePortfolio.theme_settings,
        is_published: false, // Always unpublished
        slug: expect.any(String),
        metadata: expect.objectContaining({
          duplicated_from: sourceId,
        }),
      });
    });

    it('should enforce portfolio limits on duplication', async () => {
      mockSupabase.single.mockResolvedValueOnce({
        data: {
          id: userId,
          subscription_plan: 'free',
          portfolio_count: 1, // At limit
        },
        error: null,
      });

      const result = await duplicatePortfolio(sourceId, userId);

      expect(result.error).toBe(
        'Portfolio limit reached. Upgrade to create more portfolios.'

    });
  });

  describe('Slug Operations', () => {
    describe('generatePortfolioSlug', () => {
      it('should generate valid slug from title', async () => {
        expect(generatePortfolioSlug('My Awesome Portfolio!')).toBe(
          'my-awesome-portfolio'

        expect(generatePortfolioSlug('John Doe - Developer')).toBe(
          'john-doe-developer'

        expect(generatePortfolioSlug('   Spaces   Everywhere   ')).toBe(
          'spaces-everywhere'

      });

      it('should handle special characters', async () => {
        expect(generatePortfolioSlug('Café & Co.')).toBe('cafe-co');
        expect(generatePortfolioSlug('100% Developer')).toBe('100-developer');
      });

      it('should generate random slug for empty title', async () => {
        const slug = generatePortfolioSlug('');
        expect(slug).toMatch(/^portfolio-[a-z0-9]{8}$/);
      });
    });

    describe('checkSlugAvailability', () => {
      it('should check if slug is available', async () => {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' }, // Not found = available
        });

        const result = await checkSlugAvailability('my-unique-slug');

        expect(result).toEqual({
          available: true,
          error: null,
        });

        expect(mockSupabase.eq).toHaveBeenCalledWith('slug', 'my-unique-slug');
      });

      it('should detect taken slugs', async () => {
        mockSupabase.single.mockResolvedValue({
          data: { id: 'portfolio_123', slug: 'taken-slug' },
          error: null,
        });

        const result = await checkSlugAvailability('taken-slug');

        expect(result).toEqual({
          available: false,
          error: null,
        });
      });

      it('should exclude own portfolio when checking', async () => {
        mockSupabase.single.mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        });

        await checkSlugAvailability('my-slug', 'portfolio_123');

        expect(mockSupabase.neq).toHaveBeenCalledWith('id', 'portfolio_123');
      });
    });
  });

  describe('Analytics', () => {
    describe('updatePortfolioAnalytics', () => {
      const portfolioId = 'portfolio_123';

      it('should increment view count', async () => {
        mockSupabase.rpc.mockResolvedValue({
          data: { view_count: 43 },
          error: null,
        });

        const result = await updatePortfolioAnalytics(portfolioId, {
          incrementViews: true,
        });

        expect(result).toEqual({
          success: true,
          data: { view_count: 43 },
          error: null,
        });

        expect(mockSupabase.rpc).toHaveBeenCalledWith(
      'increment_view_count', {
          portfolio_id: portfolioId,
    );
  });
      });

      it('should track visitor analytics', async () => {
        const visitorData = {
          ip: '192.168.1.1',
          userAgent: 'Mozilla/5.0...',
          referrer: 'https://google.com',
        };

        mockSupabase.single.mockResolvedValue({
          data: { id: 'analytics_123' },
          error: null,
        });

        await updatePortfolioAnalytics(portfolioId, {
          visitor: visitorData,
        });

        expect(mockSupabase.insert).toHaveBeenCalledWith({
          portfolio_id: portfolioId,
          ...visitorData,
          visited_at: expect.any(String),
        });
      });
    });
  });
});

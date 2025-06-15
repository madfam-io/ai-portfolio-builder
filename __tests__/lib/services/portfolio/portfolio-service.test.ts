import { PortfolioService } from '@/lib/services/portfolio/portfolio-service';
import { createClient } from '@supabase/supabase-js';
import { Portfolio } from '@/types/portfolio';
import { createPortfolio } from '@/__tests__/factories';

// Mock dependencies
jest.mock('@supabase/supabase-js');
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));
jest.mock('@/lib/cache/redis-cache', () => ({
  getRedisClient: jest.fn(() => ({
    get: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    keys: jest.fn(),
  })),
}));

describe('PortfolioService', () => {
  let portfolioService: PortfolioService;
  let mockSupabaseClient: any;
  let mockRedisClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock Supabase client
    mockSupabaseClient = {
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
      })),
      auth: {
        getUser: jest.fn(),
      },
      storage: {
        from: jest.fn(() => ({
          upload: jest.fn(),
          getPublicUrl: jest.fn(),
          remove: jest.fn(),
        })),
      },
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
    
    // Setup mock Redis client
    mockRedisClient = require('@/lib/cache/redis-cache').getRedisClient();
    
    portfolioService = new PortfolioService();
  });

  describe('Create Portfolio', () => {
    it('should create a new portfolio', async () => {
      const newPortfolio = createPortfolio({ id: 'new-portfolio-123' });
      const portfolioData = {
        title: 'My Portfolio',
        bio: 'Professional bio',
        template: 'developer',
      };

      mockSupabaseClient.from().insert().single.mockResolvedValue({
        data: newPortfolio,
        error: null,
      });

      const result = await portfolioService.create('user-123', portfolioData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(newPortfolio);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-123',
          ...portfolioData,
          status: 'draft',
        })
      );
    });

    it('should validate portfolio data before creation', async () => {
      const invalidData = {
        title: '', // Empty title
        bio: 'Bio',
        template: 'invalid-template',
      };

      const result = await portfolioService.create('user-123', invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Title is required');
      expect(mockSupabaseClient.from).not.toHaveBeenCalled();
    });

    it('should generate unique subdomain', async () => {
      const portfolioData = {
        title: 'John Doe Portfolio',
        bio: 'Professional bio',
        template: 'developer',
      };

      // Mock subdomain check
      mockSupabaseClient.from().eq().single.mockResolvedValueOnce({
        data: { id: 'existing' }, // Subdomain exists
        error: null,
      });
      mockSupabaseClient.from().eq().single.mockResolvedValueOnce({
        data: null, // Subdomain available
        error: { code: 'PGRST116' }, // No rows found
      });

      mockSupabaseClient.from().insert().single.mockResolvedValue({
        data: createPortfolio(),
        error: null,
      });

      const result = await portfolioService.create('user-123', portfolioData);

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledTimes(2);
    });
  });

  describe('Get Portfolio', () => {
    it('should retrieve portfolio by ID', async () => {
      const portfolio = createPortfolio();
      
      // Check cache first
      mockRedisClient.get.mockResolvedValue(null);
      
      // Get from database
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: portfolio,
        error: null,
      });

      const result = await portfolioService.getById('portfolio-123', 'user-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(portfolio);
      expect(mockRedisClient.get).toHaveBeenCalledWith('portfolio:portfolio-123');
      expect(mockRedisClient.setEx).toHaveBeenCalled(); // Cache the result
    });

    it('should return cached portfolio if available', async () => {
      const portfolio = createPortfolio();
      
      mockRedisClient.get.mockResolvedValue(JSON.stringify(portfolio));

      const result = await portfolioService.getById('portfolio-123', 'user-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(portfolio);
      expect(mockSupabaseClient.from).not.toHaveBeenCalled(); // Should not hit DB
    });

    it('should enforce user ownership', async () => {
      const portfolio = createPortfolio({ userId: 'other-user' });
      
      mockRedisClient.get.mockResolvedValue(null);
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: portfolio,
        error: null,
      });

      const result = await portfolioService.getById('portfolio-123', 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Update Portfolio', () => {
    it('should update portfolio successfully', async () => {
      const existingPortfolio = createPortfolio();
      const updates = {
        title: 'Updated Title',
        bio: 'Updated bio',
      };

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: existingPortfolio,
        error: null,
      });

      mockSupabaseClient.from().update().eq().single.mockResolvedValue({
        data: { ...existingPortfolio, ...updates },
        error: null,
      });

      const result = await portfolioService.update(
        'portfolio-123',
        'user-123',
        updates
      );

      expect(result.success).toBe(true);
      expect(result.data?.title).toBe('Updated Title');
      expect(mockRedisClient.del).toHaveBeenCalledWith('portfolio:portfolio-123');
    });

    it('should validate updates before applying', async () => {
      const updates = {
        title: 'a', // Too short
        template: 'invalid-template',
      };

      const result = await portfolioService.update(
        'portfolio-123',
        'user-123',
        updates
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Title must be');
    });

    it('should handle section updates', async () => {
      const existingPortfolio = createPortfolio();
      const sectionUpdate = {
        sections: {
          hero: {
            title: 'New Hero Title',
            subtitle: 'New Subtitle',
          },
        },
      };

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: existingPortfolio,
        error: null,
      });

      mockSupabaseClient.from().update().eq().single.mockResolvedValue({
        data: {
          ...existingPortfolio,
          sections: {
            ...existingPortfolio.sections,
            ...sectionUpdate.sections,
          },
        },
        error: null,
      });

      const result = await portfolioService.update(
        'portfolio-123',
        'user-123',
        sectionUpdate
      );

      expect(result.success).toBe(true);
      expect(result.data?.sections.hero.title).toBe('New Hero Title');
    });
  });

  describe('Delete Portfolio', () => {
    it('should delete portfolio successfully', async () => {
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: createPortfolio(),
        error: null,
      });

      mockSupabaseClient.from().delete().eq().mockResolvedValue({
        error: null,
      });

      const result = await portfolioService.delete('portfolio-123', 'user-123');

      expect(result.success).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith('portfolio:portfolio-123');
      expect(mockSupabaseClient.from().delete).toHaveBeenCalled();
    });

    it('should not delete published portfolios without unpublishing', async () => {
      const publishedPortfolio = createPortfolio({
        status: 'published',
        publishedAt: new Date().toISOString(),
      });

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: publishedPortfolio,
        error: null,
      });

      const result = await portfolioService.delete('portfolio-123', 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('unpublish');
      expect(mockSupabaseClient.from().delete).not.toHaveBeenCalled();
    });
  });

  describe('List Portfolios', () => {
    it('should list user portfolios', async () => {
      const portfolios = [
        createPortfolio({ id: 'portfolio-1' }),
        createPortfolio({ id: 'portfolio-2' }),
      ];

      mockSupabaseClient.from().select().eq().order().mockResolvedValue({
        data: portfolios,
        error: null,
      });

      const result = await portfolioService.listByUser('user-123');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(mockSupabaseClient.from().order).toHaveBeenCalledWith(
        'updatedAt',
        { ascending: false }
      );
    });

    it('should handle pagination', async () => {
      const portfolios = Array.from({ length: 5 }, (_, i) => 
        createPortfolio({ id: `portfolio-${i}` })
      );

      mockSupabaseClient.from().select().eq().order().limit.mockResolvedValue({
        data: portfolios.slice(0, 3),
        error: null,
      });

      const result = await portfolioService.listByUser('user-123', {
        limit: 3,
        offset: 0,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(mockSupabaseClient.from().limit).toHaveBeenCalledWith(3);
    });
  });

  describe('Publish/Unpublish', () => {
    it('should publish portfolio', async () => {
      const draftPortfolio = createPortfolio({ status: 'draft' });

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: draftPortfolio,
        error: null,
      });

      mockSupabaseClient.from().update().eq().single.mockResolvedValue({
        data: {
          ...draftPortfolio,
          status: 'published',
          publishedAt: new Date().toISOString(),
        },
        error: null,
      });

      const result = await portfolioService.publish('portfolio-123', 'user-123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('published');
      expect(result.data?.publishedAt).toBeDefined();
    });

    it('should validate portfolio before publishing', async () => {
      const incompletePortfolio = createPortfolio({
        status: 'draft',
        sections: {
          hero: { title: '', subtitle: '' }, // Missing required fields
        },
      });

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: incompletePortfolio,
        error: null,
      });

      const result = await portfolioService.publish('portfolio-123', 'user-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('complete all required');
    });

    it('should unpublish portfolio', async () => {
      const publishedPortfolio = createPortfolio({
        status: 'published',
        publishedAt: new Date().toISOString(),
      });

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: publishedPortfolio,
        error: null,
      });

      mockSupabaseClient.from().update().eq().single.mockResolvedValue({
        data: {
          ...publishedPortfolio,
          status: 'draft',
          publishedAt: null,
        },
        error: null,
      });

      const result = await portfolioService.unpublish('portfolio-123', 'user-123');

      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('draft');
      expect(result.data?.publishedAt).toBeNull();
    });
  });

  describe('Get by Subdomain', () => {
    it('should retrieve published portfolio by subdomain', async () => {
      const portfolio = createPortfolio({
        status: 'published',
        subdomain: 'johndoe',
      });

      mockRedisClient.get.mockResolvedValue(null);
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: portfolio,
        error: null,
      });

      const result = await portfolioService.getBySubdomain('johndoe');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(portfolio);
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('subdomain', 'johndoe');
      expect(mockSupabaseClient.from().eq).toHaveBeenCalledWith('status', 'published');
    });

    it('should not return draft portfolios by subdomain', async () => {
      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await portfolioService.getBySubdomain('draft-portfolio');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('Analytics', () => {
    it('should track portfolio view', async () => {
      const portfolio = createPortfolio({ status: 'published' });

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: portfolio,
        error: null,
      });

      mockSupabaseClient.from().insert.mockResolvedValue({
        error: null,
      });

      const result = await portfolioService.trackView('portfolio-123', {
        referrer: 'https://linkedin.com',
        userAgent: 'Mozilla/5.0...',
        ip: '192.168.1.1',
      });

      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolio_views');
    });

    it('should get portfolio analytics', async () => {
      const analyticsData = {
        views: 150,
        uniqueVisitors: 75,
        avgDuration: 120,
      };

      mockSupabaseClient.from().select().eq().single.mockResolvedValue({
        data: analyticsData,
        error: null,
      });

      const result = await portfolioService.getAnalytics('portfolio-123', 'user-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(analyticsData);
    });
  });

  describe('Image Upload', () => {
    it('should upload portfolio image', async () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const uploadPath = 'portfolios/portfolio-123/hero.jpg';

      mockSupabaseClient.storage.from().upload.mockResolvedValue({
        data: { path: uploadPath },
        error: null,
      });

      mockSupabaseClient.storage.from().getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://storage.example.com/hero.jpg' },
      });

      const result = await portfolioService.uploadImage(
        'portfolio-123',
        'user-123',
        file,
        'hero'
      );

      expect(result.success).toBe(true);
      expect(result.data?.url).toContain('hero.jpg');
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('portfolio-images');
    });

    it('should validate image file type', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      const result = await portfolioService.uploadImage(
        'portfolio-123',
        'user-123',
        file,
        'hero'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });
  });
});
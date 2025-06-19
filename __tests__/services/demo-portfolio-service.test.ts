import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import {
  DemoPortfolioService,
  DEMO_PORTFOLIOS,
} from '@/lib/services/demo-portfolio-service';

// Mock dependencies
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

jest.mock('@/lib/monitoring/unified/events', () => ({
  track: {
    portfolio: {
      create: jest.fn(),
    },
    user: {
      action: jest.fn(),
    },
  },
}));

const { createClient } = require('@/lib/supabase/client');
const { track } = require('@/lib/monitoring/unified/events');

describe('DemoPortfolioService', () => {
  const mockSupabaseClient = {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('getAvailableDemos', () => {
    it('should return all demos when no industry filter is provided', () => {
      const demos = DemoPortfolioService.getAvailableDemos();
      expect(demos).toHaveLength(DEMO_PORTFOLIOS.length);
      expect(demos).toEqual(expect.arrayContaining(DEMO_PORTFOLIOS));
    });

    it('should filter demos by industry', () => {
      const techDemos = DemoPortfolioService.getAvailableDemos('Technology');
      expect(techDemos.every(demo => demo.industry === 'Technology')).toBe(
        true

      expect(techDemos.length).toBeGreaterThan(0);
    });

    it('should sort demos by popularity', () => {
      const demos = DemoPortfolioService.getAvailableDemos();
      for (let i = 1; i < demos.length; i++) {
        expect(demos[i - 1].popularity).toBeGreaterThanOrEqual(
          demos[i].popularity

      }
    });
  });

  describe('getDemo', () => {
    it('should return a specific demo by id', () => {
      const demo = DemoPortfolioService.getDemo('dev-startup');
      expect(demo).toBeDefined();
      expect(demo?.id).toBe('dev-startup');
      expect(demo?.name).toBe('Startup Developer');
    });

    it('should return null for non-existent demo id', () => {
      const demo = DemoPortfolioService.getDemo('non-existent');
      expect(demo).toBeNull();
    });
  });

  describe('createFromDemo', () => {
    const mockPortfolio = {
      id: 'portfolio-123',
      name: 'Test Portfolio',
      content: {},
      settings: {},
    };

    it('should create a portfolio from demo for authenticated user', async () => {
      // Mock successful database insert
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockPortfolio,
              error: null,
            }),
          }),
        }),
      });

      const result = await DemoPortfolioService.createFromDemo({
        userId: 'user-123',
        demoId: 'dev-startup',
        aiEnhance: true,
      });

      expect(result.isTemporary).toBe(false);
      expect(result.portfolioId).toBe('portfolio-123');
      expect(result.portfolio).toEqual(mockPortfolio);
      expect(track.portfolio.create).toHaveBeenCalled();
    });

    it('should create temporary portfolio for non-authenticated user', async () => {
      const result = await DemoPortfolioService.createFromDemo({
        demoId: 'dev-startup',
      });

      expect(result.isTemporary).toBe(true);
      expect(result.portfolioId).toMatch(/^temp-/);
      expect(result.portfolio.is_demo).toBe(true);
    });

    it('should apply customizations to portfolio', async () => {
      const customizations = {
        name: 'Custom Name',
        title: 'Custom Title',
        colors: {
          primary: '#ff0000',
          secondary: '#00ff00',
        },
      };

      const result = await DemoPortfolioService.createFromDemo({
        demoId: 'dev-startup',
        customizations,
      });

      expect(result.portfolio.content.personal.name).toBe('Custom Name');
      expect(result.portfolio.content.personal.title).toBe('Custom Title');
      expect(result.portfolio.settings.theme.colors.primary).toBe('#ff0000');
      expect(result.portfolio.settings.theme.colors.secondary).toBe('#00ff00');
    });

    it('should throw error for non-existent demo', async () => {
      await expect(
        DemoPortfolioService.createFromDemo({
          demoId: 'non-existent',
        })
      ).rejects.toThrow('Demo portfolio not found');
    });
  });

  describe('getRecommendedDemos', () => {
    it('should return top 3 demos by default', () => {
      const recommendations = DemoPortfolioService.getRecommendedDemos();
      expect(recommendations).toHaveLength(3);
    });

    it('should filter by user industry', () => {
      const recommendations = DemoPortfolioService.getRecommendedDemos({
        industry: 'Technology',
      });

      // First recommendations should be from Technology or General
      recommendations.forEach(demo => {
        expect(['Technology', 'General']).toContain(demo.industry);
      });
    });

    it('should boost score for matching experience levels', () => {
      const seniorRecs = DemoPortfolioService.getRecommendedDemos({
        experience: 'senior',
      });

      const juniorRecs = DemoPortfolioService.getRecommendedDemos({
        experience: 'junior',
      });

      // Business template should rank higher for seniors
      const seniorBusinessIndex = seniorRecs.findIndex(
        d => d.template === 'business'

      const juniorBusinessIndex = juniorRecs.findIndex(
        d => d.template === 'business'

      // Minimal template should rank higher for juniors
      const seniorMinimalIndex = seniorRecs.findIndex(
        d => d.template === 'minimal'

      const juniorMinimalIndex = juniorRecs.findIndex(
        d => d.template === 'minimal'

      // These assertions might need adjustment based on actual scoring
      expect(seniorBusinessIndex).toBeLessThanOrEqual(juniorBusinessIndex);
      expect(juniorMinimalIndex).toBeLessThanOrEqual(seniorMinimalIndex);
    });
  });

  describe('cloneDemo', () => {
    it('should return existing portfolio if already cloned', async () => {
      const existingPortfolio = { id: 'existing-123' };

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: existingPortfolio,
                error: null,
              }),
            }),
          }),
        }),
      });

      const portfolioId = await DemoPortfolioService.cloneDemo(
        'dev-startup',
        'user-123'

      expect(portfolioId).toBe('existing-123');
    });

    it('should create new portfolio if not already cloned', async () => {
      // Mock no existing portfolio
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      });

      // Mock successful creation
      mockSupabaseClient.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'new-portfolio-123' },
              error: null,
            }),
          }),
        }),
      });

      const portfolioId = await DemoPortfolioService.cloneDemo(
        'dev-startup',
        'user-123',
        'My Custom Portfolio'

      expect(portfolioId).toBe('new-portfolio-123');
    });
  });

  describe('convertToPermanent', () => {
    const temporaryPortfolio = {
      id: 'temp-123',
      name: 'Test Portfolio',
      content: { personal: { name: 'Test' } },
      settings: {},
      demo_id: 'dev-startup',
    };

    beforeEach(() => {
      // Mock sessionStorage
      Object.defineProperty(window, 'sessionStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
        },
        writable: true,
      });
    });

    it('should convert temporary portfolio to permanent', async () => {
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(temporaryPortfolio)

      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'permanent-123' },
              error: null,
            }),
          }),
        }),
      });

      const portfolioId = await DemoPortfolioService.convertToPermanent(
        'temp-123',
        'user-123'

      expect(portfolioId).toBe('permanent-123');
      expect(window.sessionStorage.removeItem).toHaveBeenCalledWith(
        'demo-portfolio-temp-123'

      expect(track.user.action).toHaveBeenCalledWith(
        'demo_portfolio_converted',
        'user-123',
        expect.any(Function),
        expect.objectContaining({
          demo_id: 'dev-startup',
          temporary_id: 'temp-123',
          permanent_id: 'permanent-123',
        })
    );
  });

    it('should throw error if temporary portfolio not found', async () => {
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);

      await expect(
        DemoPortfolioService.convertToPermanent('temp-123', 'user-123')
      ).rejects.toThrow('Temporary portfolio not found');
    });
  });

  describe('getUserDemoPortfolios', () => {
    it('should fetch user demo portfolios', async () => {
      const mockPortfolios = [
        { id: '1', name: 'Demo 1' },
        { id: '2', name: 'Demo 2' },
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockPortfolios,
                error: null,
              }),
            }),
          }),
        }),
      });

      const portfolios =
        await DemoPortfolioService.getUserDemoPortfolios('user-123');

      expect(portfolios).toEqual(mockPortfolios);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolios');
    });

    it('should throw error on database error', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error'),
              }),
            }),
          }),
        }),
      });

      await expect(
        DemoPortfolioService.getUserDemoPortfolios('user-123')
      ).rejects.toThrow('Database error');
    });
  });
});

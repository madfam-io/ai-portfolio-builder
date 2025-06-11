/**
 * Portfolio Service test suite - final version
 */

import { portfolioService } from '@/lib/services/portfolioService';
import { CreatePortfolioDTO, UpdatePortfolioDTO } from '@/types/portfolio';

// Note: portfolioService is a mock implementation that doesn't use Supabase
// No mocking needed

describe('Portfolio Service', () => {
  describe('Portfolio CRUD Operations', () => {
    test('creates a new portfolio', async () => {
      const createData: CreatePortfolioDTO = {
        name: 'Test User',
        title: 'Software Developer',
        bio: 'Test bio',
        template: 'developer',
        importSource: 'manual',
      };

      const result = await portfolioService.createPortfolio(
        'user-123',
        createData
      );

      expect(result).toBeDefined();
      expect(result.name).toBe(createData.name);
      expect(result.title).toBe(createData.title);
      expect(result.userId).toBe('user-123');
      expect(result.template).toBe('developer');
    });

    test('retrieves user portfolios', async () => {
      const result = await portfolioService.getUserPortfolios('user-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    test('gets portfolio by ID', async () => {
      const result = await portfolioService.getPortfolio('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(result?.name).toBe('John Doe');
    });

    test('updates portfolio', async () => {
      const updates: UpdatePortfolioDTO = {
        name: 'Updated Name',
        title: 'Senior Developer',
        bio: 'Updated bio',
      };

      const result = await portfolioService.updatePortfolio('1', updates);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Updated Name');
      expect(result?.title).toBe('Senior Developer');
    });

    test('deletes portfolio', async () => {
      const result = await portfolioService.deletePortfolio('2');
      expect(result).toBe(true);
    });

    test('returns false when deleting non-existent portfolio', async () => {
      const result = await portfolioService.deletePortfolio('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('Publishing Operations', () => {
    test('publishes a portfolio', async () => {
      const result = await portfolioService.publishPortfolio('1');

      expect(result).toBeDefined();
      expect(result?.status).toBe('published');
    });

    test('unpublishes a portfolio', async () => {
      const result = await portfolioService.unpublishPortfolio('1');

      expect(result).toBeDefined();
      expect(result?.status).toBe('draft');
    });
  });

  describe('Project Management', () => {
    test('adds a project to portfolio', async () => {
      const newProject = {
        id: 'new-project-id',
        name: 'New Project',
        description: 'Project description',
        technologies: ['React', 'Node.js'],
        url: 'https://example.com',
        githubUrl: '',
        images: [],
        startDate: '2023-01',
        endDate: '2023-06',
        featured: false,
      };

      const result = await portfolioService.upsertProject('1', newProject);

      expect(result).toBeDefined();
      expect(result?.name).toBe('New Project');
    });

    test('deletes a project from portfolio', async () => {
      const result = await portfolioService.deleteProject('1', 'proj-1');
      expect(result).toBe(true);
    });
  });

  describe('Experience Management', () => {
    test('adds experience to portfolio', async () => {
      const newExperience = {
        id: 'new-exp-id',
        company: 'New Company',
        position: 'Senior Developer',
        startDate: '2023-01',
        current: true,
        description: 'Working on exciting projects',
        highlights: ['Built features', 'Led team'],
      };

      const result = await portfolioService.upsertExperience(
        '1',
        newExperience
      );

      expect(result).toBeDefined();
      expect(result?.company).toBe('New Company');
    });

    test('deletes experience from portfolio', async () => {
      const result = await portfolioService.deleteExperience('1', 'exp-1');
      expect(result).toBe(true);
    });
  });

  describe('Skills Management', () => {
    test('adds skill to portfolio', async () => {
      const newSkill = {
        name: 'TypeScript',
        category: 'Programming',
        level: 90,
      };

      const result = await portfolioService.upsertSkill('1', newSkill);

      expect(result).toBeDefined();
      expect(result?.name).toBe('TypeScript');
      expect(result?.level).toBe(90);
    });

    test('deletes skill from portfolio', async () => {
      const result = await portfolioService.deleteSkill('1', 'JavaScript');
      expect(result).toBe(true);
    });
  });

  describe('Search and Subdomain', () => {
    test('searches portfolios', async () => {
      const result = await portfolioService.searchPortfolios('John', 'user-1');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test('checks subdomain availability', async () => {
      const available =
        await portfolioService.checkSubdomainAvailability('new-subdomain');
      expect(available).toBe(true);

      const taken =
        await portfolioService.checkSubdomainAvailability('johndoe');
      expect(taken).toBe(false);
    });

    test('updates subdomain', async () => {
      const result = await portfolioService.updateSubdomain(
        '1',
        'new-subdomain'
      );
      expect(result).toBe(true);
    });

    test('gets portfolio by subdomain', async () => {
      const result = await portfolioService.getPortfolioBySubdomain('johndoe');

      expect(result).toBeDefined();
      expect(result?.subdomain).toBe('johndoe');
      expect(result?.status).toBe('published');
    });
  });

  describe('Analytics', () => {
    test('gets portfolio analytics', async () => {
      const result = await portfolioService.getPortfolioAnalytics('1');

      expect(result).toHaveProperty('views');
      expect(result).toHaveProperty('lastViewedAt');
      expect(result).toHaveProperty('totalProjects');
      expect(result).toHaveProperty('totalSkills');
    });
  });

  describe('Clone Operations', () => {
    test('clones a portfolio', async () => {
      const result = await portfolioService.clonePortfolio('1', 'user-123');

      expect(result).toBeDefined();
      expect(result?.name).toContain('(Copy)');
      expect(result?.userId).toBe('user-123');
      expect(result?.status).toBe('draft');
    });
  });

  describe('Error Handling', () => {
    test('returns null for non-existent portfolio', async () => {
      const result = await portfolioService.getPortfolio('non-existent');
      expect(result).toBeNull();
    });

    test('returns null when updating non-existent portfolio', async () => {
      const result = await portfolioService.updatePortfolio('non-existent', {
        name: 'Test',
      });
      expect(result).toBeNull();
    });
  });
});

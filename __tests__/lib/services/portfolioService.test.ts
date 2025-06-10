import { PortfolioService, portfolioService } from '@/lib/services/portfolioService';
import { Portfolio, CreatePortfolioDTO, UpdatePortfolioDTO } from '@/types/portfolio';

// Mock delay for testing
jest.mock('@/lib/services/portfolioService', () => {
  const actual = jest.requireActual('@/lib/services/portfolioService');
  return {
    ...actual,
    PortfolioService: class extends actual.PortfolioService {
      private delay(ms: number): Promise<void> {
        // Skip delay in tests
        return Promise.resolve();
      }
    },
  };
});

const mockCreatePortfolioData: CreatePortfolioDTO & { userId: string } = {
  userId: 'user-1',
  name: 'Test Portfolio',
  title: 'Software Developer',
  bio: 'Test bio',
  template: 'developer',
};

const mockUpdatePortfolioData: UpdatePortfolioDTO = {
  name: 'Updated Portfolio',
  title: 'Senior Developer',
  bio: 'Updated bio',
};

describe('PortfolioService', () => {
  let service: PortfolioService;

  beforeEach(() => {
    service = PortfolioService.getInstance();
    // Reset to clean state
    (service as any).portfolios = [];
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PortfolioService.getInstance();
      const instance2 = PortfolioService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('createPortfolio', () => {
    it('should create a new portfolio', async () => {
      const portfolio = await service.createPortfolio(mockCreatePortfolioData);

      expect(portfolio).toBeDefined();
      expect(portfolio.name).toBe(mockCreatePortfolioData.name);
      expect(portfolio.title).toBe(mockCreatePortfolioData.title);
      expect(portfolio.bio).toBe(mockCreatePortfolioData.bio);
      expect(portfolio.template).toBe(mockCreatePortfolioData.template);
      expect(portfolio.userId).toBe(mockCreatePortfolioData.userId);
      expect(portfolio.status).toBe('draft');
      expect(portfolio.subdomain).toBeDefined();
      expect(portfolio.id).toBeDefined();
    });

    it('should generate unique subdomain', async () => {
      const portfolio1 = await service.createPortfolio(mockCreatePortfolioData);
      const portfolio2 = await service.createPortfolio({
        ...mockCreatePortfolioData,
        name: 'Another Portfolio',
      });

      expect(portfolio1.subdomain).not.toBe(portfolio2.subdomain);
    });

    it('should set default values', async () => {
      const portfolio = await service.createPortfolio(mockCreatePortfolioData);

      expect(portfolio.experience).toEqual([]);
      expect(portfolio.education).toEqual([]);
      expect(portfolio.projects).toEqual([]);
      expect(portfolio.skills).toEqual([]);
      expect(portfolio.certifications).toEqual([]);
      expect(portfolio.customization).toBeDefined();
      expect(portfolio.aiSettings).toBeDefined();
      expect(portfolio.views).toBe(0);
    });
  });

  describe('getUserPortfolios', () => {
    it('should return portfolios for specific user', async () => {
      await service.createPortfolio(mockCreatePortfolioData);
      await service.createPortfolio({
        ...mockCreatePortfolioData,
        userId: 'user-2',
        name: 'Other User Portfolio',
      });

      const userPortfolios = await service.getUserPortfolios('user-1');
      expect(userPortfolios).toHaveLength(1);
      expect(userPortfolios[0].userId).toBe('user-1');
    });

    it('should return empty array for user with no portfolios', async () => {
      const userPortfolios = await service.getUserPortfolios('nonexistent-user');
      expect(userPortfolios).toEqual([]);
    });
  });

  describe('getPortfolio', () => {
    it('should return portfolio by ID', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      const retrieved = await service.getPortfolio(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe(created.name);
    });

    it('should return null for nonexistent portfolio', async () => {
      const portfolio = await service.getPortfolio('nonexistent-id');
      expect(portfolio).toBeNull();
    });
  });

  describe('updatePortfolio', () => {
    it('should update existing portfolio', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      const updated = await service.updatePortfolio(created.id, mockUpdatePortfolioData);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe(mockUpdatePortfolioData.name);
      expect(updated?.title).toBe(mockUpdatePortfolioData.title);
      expect(updated?.bio).toBe(mockUpdatePortfolioData.bio);
      expect(updated?.id).toBe(created.id);
    });

    it('should return null for nonexistent portfolio', async () => {
      const updated = await service.updatePortfolio('nonexistent-id', mockUpdatePortfolioData);
      expect(updated).toBeNull();
    });

    it('should preserve unmodified fields', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      const updated = await service.updatePortfolio(created.id, { name: 'New Name' });

      expect(updated?.name).toBe('New Name');
      expect(updated?.title).toBe(created.title);
      expect(updated?.bio).toBe(created.bio);
      expect(updated?.template).toBe(created.template);
    });
  });

  describe('deletePortfolio', () => {
    it('should delete existing portfolio', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      const deleted = await service.deletePortfolio(created.id);

      expect(deleted).toBe(true);

      const retrieved = await service.getPortfolio(created.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for nonexistent portfolio', async () => {
      const deleted = await service.deletePortfolio('nonexistent-id');
      expect(deleted).toBe(false);
    });
  });

  describe('publishPortfolio', () => {
    it('should publish a draft portfolio', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      const published = await service.publishPortfolio(created.id);

      expect(published).toBeDefined();
      expect(published?.status).toBe('published');
      expect(published?.publishedAt).toBeDefined();
    });

    it('should return null for nonexistent portfolio', async () => {
      const published = await service.publishPortfolio('nonexistent-id');
      expect(published).toBeNull();
    });
  });

  describe('unpublishPortfolio', () => {
    it('should unpublish a published portfolio', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      await service.publishPortfolio(created.id);
      const unpublished = await service.unpublishPortfolio(created.id);

      expect(unpublished).toBeDefined();
      expect(unpublished?.status).toBe('draft');
    });
  });

  describe('clonePortfolio', () => {
    it('should clone existing portfolio', async () => {
      const original = await service.createPortfolio(mockCreatePortfolioData);
      const cloned = await service.clonePortfolio(original.id, 'Cloned Portfolio', 'user-2');

      expect(cloned).toBeDefined();
      expect(cloned?.name).toBe('Cloned Portfolio');
      expect(cloned?.userId).toBe('user-2');
      expect(cloned?.id).not.toBe(original.id);
      expect(cloned?.subdomain).not.toBe(original.subdomain);
      expect(cloned?.status).toBe('draft');
      expect(cloned?.views).toBe(0);
    });

    it('should return null for nonexistent portfolio', async () => {
      const cloned = await service.clonePortfolio('nonexistent-id', 'Cloned Portfolio', 'user-1');
      expect(cloned).toBeNull();
    });
  });

  describe('searchPortfolios', () => {
    beforeEach(async () => {
      await service.createPortfolio({
        ...mockCreatePortfolioData,
        name: 'React Developer Portfolio',
        title: 'Frontend Developer',
      });
      await service.createPortfolio({
        ...mockCreatePortfolioData,
        name: 'Python Backend Portfolio',
        title: 'Backend Developer',
      });
      await service.createPortfolio({
        ...mockCreatePortfolioData,
        userId: 'user-2',
        name: 'Designer Portfolio',
        title: 'UI/UX Designer',
      });
    });

    it('should search by portfolio name', async () => {
      const results = await service.searchPortfolios('React', 'user-1');
      expect(results).toHaveLength(1);
      expect(results[0].name).toContain('React');
    });

    it('should search by portfolio title', async () => {
      const results = await service.searchPortfolios('Frontend', 'user-1');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('Frontend');
    });

    it('should return all portfolios for empty query', async () => {
      const results = await service.searchPortfolios('', 'user-1');
      expect(results).toHaveLength(2);
    });

    it('should only return portfolios for specified user', async () => {
      const results = await service.searchPortfolios('Portfolio', 'user-1');
      expect(results).toHaveLength(2);
      expect(results.every(p => p.userId === 'user-1')).toBe(true);
    });

    it('should be case insensitive', async () => {
      const results = await service.searchPortfolios('REACT', 'user-1');
      expect(results).toHaveLength(1);
    });

    it('should return empty array for no matches', async () => {
      const results = await service.searchPortfolios('NonexistentTerm', 'user-1');
      expect(results).toEqual([]);
    });
  });

  describe('checkSubdomainAvailability', () => {
    it('should return true for available subdomain', async () => {
      const available = await service.checkSubdomainAvailability('available-subdomain');
      expect(available).toBe(true);
    });

    it('should return false for taken subdomain', async () => {
      const portfolio = await service.createPortfolio(mockCreatePortfolioData);
      const available = await service.checkSubdomainAvailability(portfolio.subdomain!);
      expect(available).toBe(false);
    });
  });

  describe('updateSubdomain', () => {
    it('should update subdomain for existing portfolio', async () => {
      const portfolio = await service.createPortfolio(mockCreatePortfolioData);
      const success = await service.updateSubdomain(portfolio.id, 'new-subdomain');
      
      expect(success).toBe(true);
      
      const updated = await service.getPortfolio(portfolio.id);
      expect(updated?.subdomain).toBe('new-subdomain');
    });

    it('should return false if subdomain is taken', async () => {
      const portfolio1 = await service.createPortfolio(mockCreatePortfolioData);
      const portfolio2 = await service.createPortfolio({
        ...mockCreatePortfolioData,
        name: 'Another Portfolio',
      });

      const success = await service.updateSubdomain(portfolio2.id, portfolio1.subdomain!);
      expect(success).toBe(false);
    });

    it('should return false for nonexistent portfolio', async () => {
      const success = await service.updateSubdomain('nonexistent-id', 'new-subdomain');
      expect(success).toBe(false);
    });
  });

  describe('getPortfolioBySubdomain', () => {
    it('should return published portfolio by subdomain', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      await service.publishPortfolio(created.id);
      
      const retrieved = await service.getPortfolioBySubdomain(created.subdomain!);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should not return draft portfolio by subdomain', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      
      const retrieved = await service.getPortfolioBySubdomain(created.subdomain!);
      expect(retrieved).toBeNull();
    });

    it('should increment view count', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      await service.publishPortfolio(created.id);
      
      const retrieved1 = await service.getPortfolioBySubdomain(created.subdomain!);
      const retrieved2 = await service.getPortfolioBySubdomain(created.subdomain!);
      
      expect(retrieved2?.views).toBe((retrieved1?.views || 0) + 1);
    });
  });

  describe('autoSave', () => {
    it('should auto-save portfolio changes', async () => {
      const created = await service.createPortfolio(mockCreatePortfolioData);
      const success = await service.autoSave(created.id, { name: 'Auto-saved Name' });
      
      expect(success).toBe(true);
      
      const updated = await service.getPortfolio(created.id);
      expect(updated?.name).toBe('Auto-saved Name');
    });

    it('should return false for nonexistent portfolio', async () => {
      const success = await service.autoSave('nonexistent-id', { name: 'New Name' });
      expect(success).toBe(false);
    });
  });

  describe('Project Management', () => {
    let portfolioId: string;

    beforeEach(async () => {
      const portfolio = await service.createPortfolio(mockCreatePortfolioData);
      portfolioId = portfolio.id;
    });

    it('should add project to portfolio', async () => {
      const project = await service.upsertProject(portfolioId, {
        title: 'Test Project',
        description: 'Test Description',
        technologies: ['React', 'TypeScript'],
        highlights: ['Feature 1', 'Feature 2'],
        featured: true,
      });

      expect(project).toBeDefined();
      expect(project?.title).toBe('Test Project');
      expect(project?.id).toBeDefined();

      const portfolio = await service.getPortfolio(portfolioId);
      expect(portfolio?.projects).toHaveLength(1);
    });

    it('should update existing project', async () => {
      const created = await service.upsertProject(portfolioId, {
        title: 'Original Title',
        description: 'Original Description',
      });

      const updated = await service.upsertProject(portfolioId, {
        id: created?.id,
        title: 'Updated Title',
        description: 'Updated Description',
      });

      expect(updated?.title).toBe('Updated Title');
      expect(updated?.id).toBe(created?.id);

      const portfolio = await service.getPortfolio(portfolioId);
      expect(portfolio?.projects).toHaveLength(1);
    });

    it('should delete project', async () => {
      const project = await service.upsertProject(portfolioId, {
        title: 'Test Project',
        description: 'Test Description',
      });

      const deleted = await service.deleteProject(portfolioId, project?.id!);
      expect(deleted).toBe(true);

      const portfolio = await service.getPortfolio(portfolioId);
      expect(portfolio?.projects).toHaveLength(0);
    });
  });

  describe('Experience Management', () => {
    let portfolioId: string;

    beforeEach(async () => {
      const portfolio = await service.createPortfolio(mockCreatePortfolioData);
      portfolioId = portfolio.id;
    });

    it('should add experience to portfolio', async () => {
      const experience = await service.upsertExperience(portfolioId, {
        company: 'Test Company',
        position: 'Developer',
        startDate: '2023-01',
        current: true,
        description: 'Test role',
      });

      expect(experience).toBeDefined();
      expect(experience?.company).toBe('Test Company');

      const portfolio = await service.getPortfolio(portfolioId);
      expect(portfolio?.experience).toHaveLength(1);
    });

    it('should delete experience', async () => {
      const experience = await service.upsertExperience(portfolioId, {
        company: 'Test Company',
        position: 'Developer',
        startDate: '2023-01',
      });

      const deleted = await service.deleteExperience(portfolioId, experience?.id!);
      expect(deleted).toBe(true);

      const portfolio = await service.getPortfolio(portfolioId);
      expect(portfolio?.experience).toHaveLength(0);
    });
  });

  describe('Skill Management', () => {
    let portfolioId: string;

    beforeEach(async () => {
      const portfolio = await service.createPortfolio(mockCreatePortfolioData);
      portfolioId = portfolio.id;
    });

    it('should add skill to portfolio', async () => {
      const skill = await service.upsertSkill(portfolioId, {
        name: 'JavaScript',
        level: 'expert',
        category: 'Programming Languages',
      });

      expect(skill).toBeDefined();
      expect(skill?.name).toBe('JavaScript');

      const portfolio = await service.getPortfolio(portfolioId);
      expect(portfolio?.skills).toHaveLength(1);
    });

    it('should update existing skill', async () => {
      await service.upsertSkill(portfolioId, {
        name: 'JavaScript',
        level: 'intermediate',
      });

      const updated = await service.upsertSkill(portfolioId, {
        name: 'JavaScript',
        level: 'expert',
      });

      expect(updated?.level).toBe('expert');

      const portfolio = await service.getPortfolio(portfolioId);
      expect(portfolio?.skills).toHaveLength(1);
    });

    it('should delete skill', async () => {
      await service.upsertSkill(portfolioId, {
        name: 'JavaScript',
        level: 'expert',
      });

      const deleted = await service.deleteSkill(portfolioId, 'JavaScript');
      expect(deleted).toBe(true);

      const portfolio = await service.getPortfolio(portfolioId);
      expect(portfolio?.skills).toHaveLength(0);
    });
  });
});
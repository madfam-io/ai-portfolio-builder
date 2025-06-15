import { PortfolioService } from '@/lib/services/portfolio/portfolio-service';
import { PortfolioRepository } from '@/lib/services/portfolio/portfolio.repository';
import { cache } from '@/lib/cache/redis-cache.server';
import { logger } from '@/lib/utils/logger';

jest.mock('@/lib/services/portfolio/portfolio.repository');
jest.mock('@/lib/cache/redis-cache.server');
jest.mock('@/lib/utils/logger');

describe('PortfolioService', () => {
  let service: PortfolioService;
  let mockRepository: jest.Mocked<PortfolioRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PortfolioService();
    mockRepository = (service as any).repository;
  });

  describe('getUserPortfolios', () => {
    it('should fetch all portfolios for a user', async () => {
      const mockPortfolios = [
        { id: '1', name: 'Portfolio 1', userId: 'user-123' },
        { id: '2', name: 'Portfolio 2', userId: 'user-123' }
      ];
      
      mockRepository.findByUserId.mockResolvedValue(mockPortfolios);

      const result = await service.getUserPortfolios('user-123');

      expect(result).toEqual(mockPortfolios);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123');
      expect(logger.info).toHaveBeenCalledWith('Fetching user portfolios', { userId: 'user-123' });
    });

    it('should handle errors when fetching portfolios', async () => {
      const error = new Error('Database error');
      mockRepository.findByUserId.mockRejectedValue(error);

      await expect(service.getUserPortfolios('user-123')).rejects.toThrow('Database error');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getPortfolio', () => {
    it('should return cached portfolio if available', async () => {
      const mockPortfolio = { id: 'portfolio-123', name: 'Cached Portfolio' };
      (cache.get as jest.Mock).mockResolvedValue(mockPortfolio);

      const result = await service.getPortfolio('portfolio-123');

      expect(result).toEqual(mockPortfolio);
      expect(cache.get).toHaveBeenCalledWith('portfolio:portfolio-123');
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should fetch from database and cache if not cached', async () => {
      const mockPortfolio = { id: 'portfolio-123', name: 'Fresh Portfolio' };
      (cache.get as jest.Mock).mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(mockPortfolio);

      const result = await service.getPortfolio('portfolio-123');

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.findById).toHaveBeenCalledWith('portfolio-123');
      expect(cache.set).toHaveBeenCalledWith(
        'portfolio:portfolio-123',
        mockPortfolio,
        300
      );
    });

    it('should return null for non-existent portfolio', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.getPortfolio('non-existent');

      expect(result).toBeNull();
      expect(cache.set).not.toHaveBeenCalled();
    });
  });

  describe('createPortfolio', () => {
    it('should create a new portfolio', async () => {
      const createData = {
        userId: 'user-123',
        name: 'New Portfolio',
        title: 'My Title',
        bio: 'My bio',
        template: 'developer' as const
      };

      const createdPortfolio = { id: 'new-id', ...createData };
      mockRepository.create.mockResolvedValue(createdPortfolio);

      const result = await service.createPortfolio(createData);

      expect(result).toEqual(createdPortfolio);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
      expect(logger.info).toHaveBeenCalledWith(
        'Portfolio created successfully',
        { portfolioId: 'new-id' }
      );
    });

    it('should handle creation errors', async () => {
      const createData = {
        userId: 'user-123',
        name: 'Portfolio',
        title: 'Title',
        bio: 'Bio',
        template: 'developer' as const
      };

      const error = new Error('Creation failed');
      mockRepository.create.mockRejectedValue(error);

      await expect(service.createPortfolio(createData)).rejects.toThrow('Creation failed');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('updatePortfolio', () => {
    it('should update portfolio and invalidate cache', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedPortfolio = {
        id: 'portfolio-123',
        userId: 'user-123',
        title: 'Updated Title'
      };

      mockRepository.update.mockResolvedValue(updatedPortfolio);

      const result = await service.updatePortfolio('portfolio-123', updateData);

      expect(result).toEqual(updatedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith('portfolio-123', updateData);
      expect(cache.del).toHaveBeenCalledWith('portfolio:portfolio-123');
      expect(cache.clearPattern).toHaveBeenCalledWith('portfolio:user:user-123:*');
    });

    it('should return null if portfolio not found', async () => {
      mockRepository.update.mockResolvedValue(null);

      const result = await service.updatePortfolio('non-existent', { title: 'New' });

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalledWith(
        'Portfolio not found for update',
        { portfolioId: 'non-existent' }
      );
    });
  });

  describe('publishPortfolio', () => {
    it('should publish a portfolio', async () => {
      const publishedPortfolio = {
        id: 'portfolio-123',
        status: 'published',
        publishedAt: new Date()
      };

      mockRepository.update.mockResolvedValue(publishedPortfolio);

      const result = await service.publishPortfolio('portfolio-123');

      expect(result).toEqual(publishedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-123',
        expect.objectContaining({
          status: 'published',
          publishedAt: expect.any(Date)
        })
      );
    });
  });

  describe('clonePortfolio', () => {
    it('should clone a portfolio with all data', async () => {
      const originalPortfolio = {
        id: 'original-123',
        userId: 'user-123',
        name: 'Original',
        title: 'Original Title',
        bio: 'Original bio',
        template: 'developer',
        tagline: 'Tagline',
        social: { linkedin: 'profile' },
        projects: [{ id: '1', title: 'Project' }]
      };

      const clonedPortfolio = {
        id: 'cloned-123',
        userId: 'user-456',
        name: 'Cloned Portfolio',
        ...originalPortfolio
      };

      mockRepository.findById.mockResolvedValue(originalPortfolio);
      mockRepository.create.mockResolvedValue({ id: 'cloned-123' });
      mockRepository.update.mockResolvedValue(clonedPortfolio);

      const result = await service.clonePortfolio(
        'original-123',
        'Cloned Portfolio',
        'user-456'
      );

      expect(result).toEqual(clonedPortfolio);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-456',
          name: 'Cloned Portfolio',
          title: 'Original Title',
          bio: 'Original bio'
        })
      );
    });

    it('should return null if source portfolio not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await service.clonePortfolio(
        'non-existent',
        'Clone',
        'user-123'
      );

      expect(result).toBeNull();
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  describe('searchPortfolios', () => {
    it('should search portfolios by query', async () => {
      const portfolios = [
        { id: '1', name: 'Developer Portfolio', title: 'John Doe', bio: 'Software engineer' },
        { id: '2', name: 'Designer Portfolio', title: 'Jane Smith', bio: 'UX designer' }
      ];

      mockRepository.findByUserId.mockResolvedValue(portfolios);

      const result = await service.searchPortfolios('developer', 'user-123');

      expect(result).toHaveLength(1);
      expect(result[0].name).toContain('Developer');
    });

    it('should return all portfolios when query is empty', async () => {
      const portfolios = [
        { id: '1', name: 'Portfolio 1' },
        { id: '2', name: 'Portfolio 2' }
      ];

      mockRepository.findByUserId.mockResolvedValue(portfolios);

      const result = await service.searchPortfolios('  ', 'user-123');

      expect(result).toEqual(portfolios);
    });
  });

  describe('checkSubdomainAvailability', () => {
    it('should check subdomain availability', async () => {
      mockRepository.isSubdomainAvailable.mockResolvedValue(true);

      const result = await service.checkSubdomainAvailability('my-portfolio');

      expect(result).toBe(true);
      expect(mockRepository.isSubdomainAvailable).toHaveBeenCalledWith('my-portfolio');
    });
  });

  describe('updateSubdomain', () => {
    it('should update subdomain if available', async () => {
      mockRepository.isSubdomainAvailable.mockResolvedValue(true);
      mockRepository.update.mockResolvedValue({ id: 'portfolio-123', subdomain: 'new-subdomain' });

      const result = await service.updateSubdomain('portfolio-123', 'new-subdomain');

      expect(result).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-123',
        { subdomain: 'new-subdomain' }
      );
    });

    it('should return false if subdomain not available', async () => {
      mockRepository.isSubdomainAvailable.mockResolvedValue(false);

      const result = await service.updateSubdomain('portfolio-123', 'taken-subdomain');

      expect(result).toBe(false);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getPortfolioBySubdomain', () => {
    it('should get portfolio and increment views', async () => {
      const portfolio = { id: 'portfolio-123', subdomain: 'my-portfolio' };
      mockRepository.findBySubdomain.mockResolvedValue(portfolio);
      mockRepository.incrementViews.mockResolvedValue(undefined);

      const result = await service.getPortfolioBySubdomain('my-portfolio');

      expect(result).toEqual(portfolio);
      expect(mockRepository.incrementViews).toHaveBeenCalledWith('portfolio-123');
    });

    it('should handle view increment errors gracefully', async () => {
      const portfolio = { id: 'portfolio-123', subdomain: 'my-portfolio' };
      mockRepository.findBySubdomain.mockResolvedValue(portfolio);
      mockRepository.incrementViews.mockRejectedValue(new Error('View increment failed'));

      const result = await service.getPortfolioBySubdomain('my-portfolio');

      expect(result).toEqual(portfolio);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to increment views',
        expect.any(Error),
        { portfolioId: 'portfolio-123' }
      );
    });
  });

  describe('updateTemplate', () => {
    it('should update template with default theme', async () => {
      const updatedPortfolio = {
        id: 'portfolio-123',
        template: 'designer',
        customization: {
          primaryColor: '#ec4899',
          fontFamily: 'Poppins'
        }
      };

      mockRepository.update.mockResolvedValue(updatedPortfolio);

      const result = await service.updateTemplate('portfolio-123', 'designer');

      expect(result).toEqual(updatedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-123',
        expect.objectContaining({
          template: 'designer',
          customization: expect.objectContaining({
            primaryColor: '#ec4899'
          })
        })
      );
    });
  });

  describe('autoSave', () => {
    it('should auto-save changes successfully', async () => {
      mockRepository.update.mockResolvedValue({ id: 'portfolio-123' });

      const result = await service.autoSave('portfolio-123', { bio: 'Updated bio' });

      expect(result).toBe(true);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-123',
        { bio: 'Updated bio' }
      );
    });

    it('should return false on auto-save failure', async () => {
      mockRepository.update.mockRejectedValue(new Error('Save failed'));

      const result = await service.autoSave('portfolio-123', { bio: 'Updated' });

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
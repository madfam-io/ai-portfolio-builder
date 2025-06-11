/**
 * Portfolio Service test suite - updated for refactored service
 */

import { PortfolioService } from '@/lib/services/portfolio/portfolio-service';
import { PortfolioRepository } from '@/lib/services/portfolio/portfolio.repository';
import { Portfolio, CreatePortfolioDTO } from '@/types/portfolio';

// Mock the repository
jest.mock('@/lib/services/portfolio/portfolio.repository');

describe('PortfolioService', () => {
  let service: PortfolioService;
  let mockRepository: jest.Mocked<PortfolioRepository>;

  const mockPortfolio: Portfolio = {
    id: 'portfolio-1',
    userId: 'user-1',
    name: 'John Doe',
    title: 'Full Stack Developer',
    bio: 'Experienced developer',
    tagline: 'Building great software',
    avatarUrl: 'https://example.com/avatar.jpg',
    contact: {
      email: 'john@example.com',
      phone: '+1234567890',
      location: 'San Francisco, CA',
    },
    social: {
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'developer',
    customization: {
      primaryColor: '#1a73e8',
      secondaryColor: '#34a853',
      fontFamily: 'Inter',
      headerStyle: 'minimal',
      sectionOrder: [],
      hiddenSections: [],
    },
    status: 'draft',
    subdomain: 'johndoe',
    views: 0,
    aiSettings: {
      enhanceBio: true,
      enhanceProjectDescriptions: true,
      generateSkillsFromExperience: false,
      tone: 'professional',
      targetLength: 'concise',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PortfolioService();
    mockRepository = (service as any).repository;
  });

  describe('Portfolio CRUD Operations', () => {
    test('creates a new portfolio', async () => {
      const createData: CreatePortfolioDTO = {
        name: 'John Doe',
        title: 'Full Stack Developer',
        bio: 'Experienced developer',
        template: 'developer',
      };

      mockRepository.create.mockResolvedValueOnce(mockPortfolio);

      const result = await service.createPortfolio({
        ...createData,
        userId: 'user-1',
      });

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createData,
        userId: 'user-1',
      });
    });

    test('retrieves portfolio by ID', async () => {
      mockRepository.findById.mockResolvedValueOnce(mockPortfolio);

      const result = await service.getPortfolio('portfolio-1');

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.findById).toHaveBeenCalledWith('portfolio-1');
    });

    test('retrieves portfolios by user ID', async () => {
      mockRepository.findByUserId.mockResolvedValueOnce([mockPortfolio]);

      const result = await service.getUserPortfolios('user-1');

      expect(result).toEqual([mockPortfolio]);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    test('updates portfolio', async () => {
      const updates = { bio: 'Updated bio' };
      const updatedPortfolio = { ...mockPortfolio, ...updates };

      mockRepository.update.mockResolvedValueOnce(updatedPortfolio);

      const result = await service.updatePortfolio('portfolio-1', updates);

      expect(result).toEqual(updatedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-1',
        updates
      );
    });

    test('deletes portfolio', async () => {
      mockRepository.delete.mockResolvedValueOnce(true);

      const result = await service.deletePortfolio('portfolio-1');

      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith('portfolio-1');
    });
  });

  describe('Portfolio Publishing', () => {
    test('publishes portfolio', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        status: 'published' as const,
        publishedAt: new Date(),
      };

      mockRepository.update.mockResolvedValueOnce(publishedPortfolio);

      const result = await service.publishPortfolio('portfolio-1');

      expect(result).toEqual(publishedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith('portfolio-1', {
        status: 'published',
        publishedAt: expect.any(Date),
      });
    });

    test('unpublishes portfolio', async () => {
      const unpublishedPortfolio = {
        ...mockPortfolio,
        status: 'draft' as const,
        publishedAt: undefined,
      };

      mockRepository.update.mockResolvedValueOnce(unpublishedPortfolio);

      const result = await service.unpublishPortfolio('portfolio-1');

      expect(result).toEqual(unpublishedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith('portfolio-1', {
        status: 'draft',
        publishedAt: undefined,
      });
    });
  });

  describe('Subdomain Management', () => {
    test('checks subdomain availability', async () => {
      mockRepository.isSubdomainAvailable.mockResolvedValueOnce(true);

      const result = await service.checkSubdomainAvailability('newdomain');

      expect(result).toBe(true);
      expect(mockRepository.isSubdomainAvailable).toHaveBeenCalledWith(
        'newdomain'
      );
    });

    test('updates portfolio subdomain when available', async () => {
      mockRepository.isSubdomainAvailable.mockResolvedValueOnce(true);
      mockRepository.update.mockResolvedValueOnce({
        ...mockPortfolio,
        subdomain: 'newdomain',
      });

      const result = await service.updateSubdomain('portfolio-1', 'newdomain');

      expect(result).toBe(true);
      expect(mockRepository.isSubdomainAvailable).toHaveBeenCalledWith(
        'newdomain'
      );
      expect(mockRepository.update).toHaveBeenCalledWith('portfolio-1', {
        subdomain: 'newdomain',
      });
    });

    test('returns false when subdomain is not available', async () => {
      mockRepository.isSubdomainAvailable.mockResolvedValueOnce(false);

      const result = await service.updateSubdomain('portfolio-1', 'taken');

      expect(result).toBe(false);
      expect(mockRepository.isSubdomainAvailable).toHaveBeenCalledWith('taken');
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    test('retrieves portfolio by subdomain', async () => {
      mockRepository.findBySubdomain.mockResolvedValueOnce(mockPortfolio);

      const result = await service.getPortfolioBySubdomain('johndoe');

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.findBySubdomain).toHaveBeenCalledWith('johndoe');
      expect(mockRepository.incrementViews).toHaveBeenCalledWith('portfolio-1');
    });
  });

  describe('Template Management', () => {
    test('updates portfolio template', async () => {
      const updatedPortfolio = {
        ...mockPortfolio,
        template: 'designer' as const,
        customization: {
          primaryColor: '#ff6b6b',
          secondaryColor: '#4ecdc4',
          fontFamily: 'Playfair Display',
          headerStyle: 'creative' as const,
          sectionOrder: [],
          hiddenSections: [],
        },
      };

      mockRepository.update.mockResolvedValueOnce(updatedPortfolio);

      const result = await service.updateTemplate('portfolio-1', 'designer');

      expect(result).toEqual(updatedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith(
        'portfolio-1',
        expect.objectContaining({
          template: 'designer',
        })
      );
    });
  });

  describe('Search Functionality', () => {
    test('searches portfolios by query', async () => {
      mockRepository.findByUserId.mockResolvedValueOnce([mockPortfolio]);

      const result = await service.searchPortfolios('user-1', 'john');

      expect(result).toEqual([mockPortfolio]);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    test('returns empty array when no matches found', async () => {
      mockRepository.findByUserId.mockResolvedValueOnce([mockPortfolio]);

      const result = await service.searchPortfolios('user-1', 'nonexistent');

      expect(result).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    test('throws error when portfolio creation fails', async () => {
      const error = new Error('Database error');
      mockRepository.create.mockRejectedValueOnce(error);

      await expect(
        service.createPortfolio({
          userId: 'user-1',
          name: 'Test',
          title: 'Test',
          template: 'developer',
        })
      ).rejects.toThrow('Database error');
    });

    test('returns null when portfolio not found', async () => {
      mockRepository.findById.mockResolvedValueOnce(null);

      const result = await service.getPortfolio('nonexistent');

      expect(result).toBeNull();
    });
  });
});

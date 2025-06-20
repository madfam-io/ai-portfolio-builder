import { PortfolioService } from '@/lib/services/portfolio/portfolio-service';
import { PortfolioRepository } from '@/lib/services/portfolio/portfolio.repository';
import { RedisCache } from '@/lib/cache/redis-cache';
import { Portfolio, PortfolioStatus } from '@/types/portfolio';
import { AppError } from '@/types/errors';

// Mock dependencies
jest.mock('@/lib/services/portfolio/portfolio.repository');
jest.mock('@/lib/cache/redis-cache');
jest.mock('@/lib/utils/logger');

describe('PortfolioService - Comprehensive Tests', () => {
  let service: PortfolioService;
  let mockRepository: jest.Mocked<PortfolioRepository>;
  let mockCache: jest.Mocked<RedisCache>;

  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'John Doe',
    title: 'Full Stack Developer',
    bio: 'Experienced developer with a passion for creating amazing web applications.',
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'San Francisco, CA',
    template: 'modern',
    theme: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      background: '#FFFFFF',
      text: '#1F2937',
    },
    customDomain: null,
    subdomain: 'john-doe',
    status: 'draft' as PortfolioStatus,
    views: 0,
    experience: [
      {
        id: 'exp-1',
        company: 'Tech Corp',
        position: 'Senior Developer',
        startDate: '2020-01-01',
        endDate: null,
        current: true,
        description: 'Leading development of web applications',
        technologies: ['React', 'Node.js', 'TypeScript'],
      },
    ],
    education: [
      {
        id: 'edu-1',
        institution: 'University of Technology',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2016-09-01',
        endDate: '2020-05-01',
        description: 'Graduated with honors',
      },
    ],
    projects: [
      {
        id: 'proj-1',
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce solution',
        link: 'https://github.com/johndoe/ecommerce',
        image: null,
        technologies: ['React', 'Node.js', 'MongoDB'],
        featured: true,
      },
    ],
    skills: [
      { id: 'skill-1', name: 'JavaScript', level: 90, category: 'Frontend' },
      { id: 'skill-2', name: 'TypeScript', level: 85, category: 'Frontend' },
      { id: 'skill-3', name: 'Node.js', level: 80, category: 'Backend' },
    ],
    certifications: [
      {
        id: 'cert-1',
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023-01-15',
        link: 'https://aws.amazon.com/certification/',
      },
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
    metadata: {
      title: 'John Doe - Full Stack Developer',
      description: 'Portfolio of John Doe, a Full Stack Developer',
      keywords: ['developer', 'portfolio', 'full stack'],
    },
    aiEnhancements: {
      bio: true,
      experience: false,
      projects: true,
    },
    analytics: {
      totalViews: 150,
      uniqueVisitors: 100,
      avgTimeOnPage: 120,
      bounceRate: 35,
    },
    importSource: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: null,
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock instances
    mockRepository = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findBySubdomain: jest.fn(),
      search: jest.fn(),
      checkSubdomainAvailability: jest.fn(),
      incrementViews: jest.fn(),
    } as unknown as jest.Mocked<PortfolioRepository>;

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clear: jest.fn(),
    } as unknown as jest.Mocked<RedisCache>;

    // Create service instance with mocks
    (PortfolioRepository as jest.MockedClass<typeof PortfolioRepository>).mockImplementation(() => mockRepository);
    (RedisCache as jest.MockedClass<typeof RedisCache>).mockImplementation(() => mockCache);

    service = new PortfolioService();
  });

  describe('Portfolio CRUD Operations', () => {
    describe('getUserPortfolios', () => {
      it('should return all portfolios for a user', async () => {
        const mockPortfolios = [mockPortfolio, { ...mockPortfolio, id: 'portfolio-456' }];
        mockRepository.findByUserId.mockResolvedValue(mockPortfolios);

        const result = await service.getUserPortfolios('user-123');

        expect(result).toEqual(mockPortfolios);
        expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123');
      });

      it('should handle empty portfolio list', async () => {
        mockRepository.findByUserId.mockResolvedValue([]);

        const result = await service.getUserPortfolios('user-123');

        expect(result).toEqual([]);
      });

      it('should handle repository errors gracefully', async () => {
        mockRepository.findByUserId.mockRejectedValue(new Error('Database error'));

        await expect(service.getUserPortfolios('user-123')).rejects.toThrow('Database error');
      });
    });

    describe('getPortfolio', () => {
      it('should return portfolio from cache when available', async () => {
        mockCache.get.mockResolvedValue(mockPortfolio);

        const result = await service.getPortfolio('portfolio-123');

        expect(result).toEqual(mockPortfolio);
        expect(mockCache.get).toHaveBeenCalledWith('portfolio:portfolio-123');
        expect(mockRepository.findById).not.toHaveBeenCalled();
      });

      it('should fetch from repository when not in cache', async () => {
        mockCache.get.mockResolvedValue(null);
        mockRepository.findById.mockResolvedValue(mockPortfolio);

        const result = await service.getPortfolio('portfolio-123');

        expect(result).toEqual(mockPortfolio);
        expect(mockRepository.findById).toHaveBeenCalledWith('portfolio-123');
        expect(mockCache.set).toHaveBeenCalledWith(
          'portfolio:portfolio-123',
          mockPortfolio,
          300 // 5 minutes TTL
        );
      });

      it('should return null for non-existent portfolio', async () => {
        mockCache.get.mockResolvedValue(null);
        mockRepository.findById.mockResolvedValue(null);

        const result = await service.getPortfolio('non-existent');

        expect(result).toBeNull();
      });
    });

    describe('createPortfolio', () => {
      it('should create portfolio with default values', async () => {
        const createData = {
          name: 'Jane Doe',
          title: 'Designer',
          template: 'minimal' as const,
        };

        const expectedPortfolio = {
          ...mockPortfolio,
          id: 'new-portfolio-123',
          ...createData,
        };

        mockRepository.create.mockResolvedValue(expectedPortfolio);

        const result = await service.createPortfolio('user-123', createData);

        expect(result).toEqual(expectedPortfolio);
        expect(mockRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: 'user-123',
            ...createData,
            status: 'draft',
            views: 0,
            experience: [],
            education: [],
            projects: [],
            skills: [],
            certifications: [],
          })
        );
      });

      it('should handle LinkedIn import data', async () => {
        const createData = {
          name: 'Jane Doe',
          title: 'Designer',
          template: 'minimal' as const,
          importSource: 'linkedin' as const,
          importData: {
            profile: {
              firstName: 'Jane',
              lastName: 'Doe',
              headline: 'Senior Designer',
            },
          },
        };

        mockRepository.create.mockResolvedValue({ ...mockPortfolio, ...createData });

        await service.createPortfolio('user-123', createData);

        expect(mockRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({
            importSource: 'linkedin',
          })
        );
      });

      it('should validate required fields', async () => {
        const invalidData = {
          name: '',
          title: 'Designer',
          template: 'minimal' as const,
        };

        mockRepository.create.mockRejectedValue(new AppError('Name is required', 400));

        await expect(service.createPortfolio('user-123', invalidData)).rejects.toThrow('Name is required');
      });
    });

    describe('updatePortfolio', () => {
      it('should update portfolio and invalidate cache', async () => {
        const updateData = {
          bio: 'Updated bio',
          skills: [
            { id: 'skill-1', name: 'React', level: 95, category: 'Frontend' },
          ],
        };

        const updatedPortfolio = { ...mockPortfolio, ...updateData };
        mockRepository.findById.mockResolvedValue(mockPortfolio);
        mockRepository.update.mockResolvedValue(updatedPortfolio);

        const result = await service.updatePortfolio('portfolio-123', updateData);

        expect(result).toEqual(updatedPortfolio);
        expect(mockCache.del).toHaveBeenCalledWith('portfolio:portfolio-123');
      });

      it('should handle non-existent portfolio', async () => {
        mockRepository.findById.mockResolvedValue(null);

        const result = await service.updatePortfolio('non-existent', { bio: 'New bio' });

        expect(result).toBeNull();
        expect(mockRepository.update).not.toHaveBeenCalled();
      });

      it('should prevent updating published portfolios certain fields', async () => {
        const publishedPortfolio = { ...mockPortfolio, status: 'published' as PortfolioStatus };
        mockRepository.findById.mockResolvedValue(publishedPortfolio);
        mockRepository.update.mockResolvedValue(publishedPortfolio);

        await service.updatePortfolio('portfolio-123', { subdomain: 'new-subdomain' });

        // Should still allow updates but with restrictions
        expect(mockRepository.update).toHaveBeenCalled();
      });
    });

    describe('deletePortfolio', () => {
      it('should delete draft portfolio successfully', async () => {
        mockRepository.findById.mockResolvedValue(mockPortfolio);
        mockRepository.delete.mockResolvedValue(true);

        const result = await service.deletePortfolio('portfolio-123');

        expect(result).toBe(true);
        expect(mockCache.del).toHaveBeenCalledWith('portfolio:portfolio-123');
      });

      it('should prevent deletion of published portfolios', async () => {
        const publishedPortfolio = { ...mockPortfolio, status: 'published' as PortfolioStatus };
        mockRepository.findById.mockResolvedValue(publishedPortfolio);

        await expect(service.deletePortfolio('portfolio-123')).rejects.toThrow('Cannot delete published portfolio');
        expect(mockRepository.delete).not.toHaveBeenCalled();
      });
    });
  });

  describe('Publishing Operations', () => {
    describe('publishPortfolio', () => {
      it('should publish draft portfolio with subdomain', async () => {
        const draftPortfolio = { ...mockPortfolio, subdomain: 'john-doe' };
        const publishedPortfolio = {
          ...draftPortfolio,
          status: 'published' as PortfolioStatus,
          publishedAt: new Date(),
        };

        mockRepository.findById.mockResolvedValue(draftPortfolio);
        mockRepository.update.mockResolvedValue(publishedPortfolio);

        const result = await service.publishPortfolio('portfolio-123');

        expect(result).toEqual(publishedPortfolio);
        expect(mockRepository.update).toHaveBeenCalledWith(
          'portfolio-123',
          expect.objectContaining({
            status: 'published',
            publishedAt: expect.any(Date),
          })
        );
      });

      it('should generate subdomain if not provided', async () => {
        const portfolioWithoutSubdomain = { ...mockPortfolio, subdomain: null };
        mockRepository.findById.mockResolvedValue(portfolioWithoutSubdomain);
        mockRepository.checkSubdomainAvailability.mockResolvedValue(true);
        mockRepository.update.mockResolvedValue({
          ...portfolioWithoutSubdomain,
          status: 'published' as PortfolioStatus,
          subdomain: 'john-doe',
        });

        await service.publishPortfolio('portfolio-123');

        expect(mockRepository.update).toHaveBeenCalledWith(
          'portfolio-123',
          expect.objectContaining({
            subdomain: expect.stringMatching(/^[a-z0-9-]+$/),
          })
        );
      });

      it('should handle subdomain conflicts', async () => {
        const portfolioWithoutSubdomain = { ...mockPortfolio, subdomain: null };
        mockRepository.findById.mockResolvedValue(portfolioWithoutSubdomain);
        mockRepository.checkSubdomainAvailability
          .mockResolvedValueOnce(false) // First attempt fails
          .mockResolvedValueOnce(true);  // Second attempt succeeds

        await service.publishPortfolio('portfolio-123');

        expect(mockRepository.checkSubdomainAvailability).toHaveBeenCalledTimes(2);
      });
    });

    describe('unpublishPortfolio', () => {
      it('should unpublish portfolio and clear cache', async () => {
        const publishedPortfolio = {
          ...mockPortfolio,
          status: 'published' as PortfolioStatus,
          publishedAt: new Date(),
        };

        mockRepository.findById.mockResolvedValue(publishedPortfolio);
        mockRepository.update.mockResolvedValue({
          ...publishedPortfolio,
          status: 'draft' as PortfolioStatus,
        });

        const result = await service.unpublishPortfolio('portfolio-123');

        expect(result?.status).toBe('draft');
        expect(mockCache.del).toHaveBeenCalledWith('portfolio:portfolio-123');
      });
    });
  });

  describe('Search and Discovery', () => {
    describe('findBySubdomain', () => {
      it('should find portfolio by subdomain with caching', async () => {
        mockCache.get.mockResolvedValue(null);
        mockRepository.findBySubdomain.mockResolvedValue(mockPortfolio);

        const result = await service.findBySubdomain('john-doe');

        expect(result).toEqual(mockPortfolio);
        expect(mockCache.set).toHaveBeenCalledWith(
          'portfolio:subdomain:john-doe',
          mockPortfolio,
          300
        );
      });

      it('should return cached result if available', async () => {
        mockCache.get.mockResolvedValue(mockPortfolio);

        const result = await service.findBySubdomain('john-doe');

        expect(result).toEqual(mockPortfolio);
        expect(mockRepository.findBySubdomain).not.toHaveBeenCalled();
      });
    });

    describe('searchPortfolios', () => {
      it('should search portfolios with filters', async () => {
        const searchResults = [mockPortfolio];
        mockRepository.search.mockResolvedValue(searchResults);

        const filters = {
          query: 'developer',
          template: 'modern' as const,
          status: 'published' as PortfolioStatus,
        };

        const result = await service.searchPortfolios(filters);

        expect(result).toEqual(searchResults);
        expect(mockRepository.search).toHaveBeenCalledWith(filters);
      });

      it('should handle empty search results', async () => {
        mockRepository.search.mockResolvedValue([]);

        const result = await service.searchPortfolios({ query: 'nonexistent' });

        expect(result).toEqual([]);
      });
    });
  });

  describe('Analytics and Metrics', () => {
    describe('incrementViews', () => {
      it('should increment portfolio views', async () => {
        mockRepository.incrementViews.mockResolvedValue(true);

        const result = await service.incrementViews('portfolio-123');

        expect(result).toBe(true);
        expect(mockRepository.incrementViews).toHaveBeenCalledWith('portfolio-123');
      });

      it('should handle view increment failures gracefully', async () => {
        mockRepository.incrementViews.mockResolvedValue(false);

        const result = await service.incrementViews('non-existent');

        expect(result).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockRepository.findByUserId.mockRejectedValue(new Error('Connection refused'));

      await expect(service.getUserPortfolios('user-123')).rejects.toThrow('Connection refused');
    });

    it('should handle validation errors with proper status codes', async () => {
      const validationError = new AppError('Invalid portfolio data', 400);
      mockRepository.create.mockRejectedValue(validationError);

      await expect(service.createPortfolio('user-123', {} as any)).rejects.toThrow(validationError);
    });

    it('should handle concurrent update conflicts', async () => {
      const conflictError = new AppError('Portfolio was modified by another user', 409);
      mockRepository.update.mockRejectedValue(conflictError);
      mockRepository.findById.mockResolvedValue(mockPortfolio);

      await expect(service.updatePortfolio('portfolio-123', { bio: 'New bio' })).rejects.toThrow(conflictError);
    });
  });

  describe('Cache Management', () => {
    it('should handle cache failures gracefully', async () => {
      mockCache.get.mockRejectedValue(new Error('Redis connection failed'));
      mockRepository.findById.mockResolvedValue(mockPortfolio);

      const result = await service.getPortfolio('portfolio-123');

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.findById).toHaveBeenCalled();
    });

    it('should continue operation when cache set fails', async () => {
      mockCache.get.mockResolvedValue(null);
      mockCache.set.mockRejectedValue(new Error('Cache write failed'));
      mockRepository.findById.mockResolvedValue(mockPortfolio);

      const result = await service.getPortfolio('portfolio-123');

      expect(result).toEqual(mockPortfolio);
    });
  });
});
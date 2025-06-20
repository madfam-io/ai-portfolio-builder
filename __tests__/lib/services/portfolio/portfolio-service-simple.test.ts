import { PortfolioService } from '@/lib/services/portfolio/portfolio-service';
import { PortfolioRepository } from '@/lib/services/portfolio/portfolio.repository';
import { Portfolio } from '@/types/portfolio';

// Mock dependencies
jest.mock('@/lib/services/portfolio/portfolio.repository');
jest.mock('@/lib/cache/redis-cache.server', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    clearPattern: jest.fn(),
  },
  CACHE_KEYS: {
    PORTFOLIO: 'portfolio:',
  },
}));
jest.mock('@/lib/utils/logger');

describe('PortfolioService', () => {
  let service: PortfolioService;
  let mockRepository: jest.Mocked<PortfolioRepository>;

  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'John Doe',
    title: 'Developer',
    bio: 'A passionate developer',
    email: 'john@example.com',
    template: 'modern',
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Portfolio;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock repository
    mockRepository = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findBySubdomain: jest.fn(),
    } as unknown as jest.Mocked<PortfolioRepository>;

    // Mock the constructor
    (PortfolioRepository as jest.MockedClass<typeof PortfolioRepository>).mockImplementation(() => mockRepository);

    service = new PortfolioService();
  });

  describe('getUserPortfolios', () => {
    it('should return user portfolios', async () => {
      const portfolios = [mockPortfolio];
      mockRepository.findByUserId.mockResolvedValue(portfolios);

      const result = await service.getUserPortfolios('user-123');

      expect(result).toEqual(portfolios);
      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });
  });

  describe('getPortfolio', () => {
    it('should return portfolio by id', async () => {
      mockRepository.findById.mockResolvedValue(mockPortfolio);

      const result = await service.getPortfolio('portfolio-123');

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.findById).toHaveBeenCalledWith('portfolio-123');
    });
  });

  describe('createPortfolio', () => {
    it('should create new portfolio', async () => {
      const createData = {
        userId: 'user-123',
        name: 'Jane Doe',
        title: 'Designer',
        template: 'minimal' as const,
      };

      mockRepository.create.mockResolvedValue(mockPortfolio);

      const result = await service.createPortfolio(createData);

      expect(result).toEqual(mockPortfolio);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
    });
  });

  describe('updatePortfolio', () => {
    it('should update existing portfolio', async () => {
      const updateData = { bio: 'Updated bio' };
      const updatedPortfolio = { ...mockPortfolio, ...updateData };

      mockRepository.update.mockResolvedValue(updatedPortfolio);

      const result = await service.updatePortfolio('portfolio-123', updateData);

      expect(result).toEqual(updatedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith('portfolio-123', updateData);
    });
  });

  describe('deletePortfolio', () => {
    it('should delete portfolio successfully', async () => {
      mockRepository.delete.mockResolvedValue(true);

      const result = await service.deletePortfolio('portfolio-123');

      expect(result).toBe(true);
      expect(mockRepository.delete).toHaveBeenCalledWith('portfolio-123');
    });
  });

  describe('publishPortfolio', () => {
    it('should publish portfolio', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        status: 'published' as const,
        publishedAt: expect.any(Date),
      };

      mockRepository.update.mockResolvedValue(publishedPortfolio);

      const result = await service.publishPortfolio('portfolio-123');

      expect(result).toEqual(publishedPortfolio);
      expect(mockRepository.update).toHaveBeenCalledWith('portfolio-123', {
        status: 'published',
        publishedAt: expect.any(Date),
      });
    });
  });

  describe('unpublishPortfolio', () => {
    it('should unpublish portfolio', async () => {
      const unpublishedPortfolio = {
        ...mockPortfolio,
        status: 'draft' as const,
      };

      mockRepository.update.mockResolvedValue(unpublishedPortfolio);

      const result = await service.unpublishPortfolio('portfolio-123');

      expect(result).toEqual(unpublishedPortfolio);
    });
  });
});
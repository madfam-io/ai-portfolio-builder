import { PortfolioServiceClient } from '@/lib/services/portfolio/portfolio-service-client';
import { logger } from '@/lib/utils/logger';
import {
  Portfolio,
  CreatePortfolioDTO,
  UpdatePortfolioDTO,
} from '@/types/portfolio';

// Mock dependencies
jest.mock('@/lib/utils/logger');

// Mock fetch
global.fetch = jest.fn();

describe('PortfolioServiceClient', () => {
  let portfolioServiceClient: PortfolioServiceClient;

  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Test Portfolio',
    title: 'Developer',
    bio: 'Test bio',
    tagline: 'Test tagline',
    avatarUrl: 'https://example.com/avatar.jpg',
    contact: {
      email: 'test@example.com',
      phone: '123-456-7890',
      location: 'New York',
    },
    social: {
      github: 'https://github.com/test',
      linkedin: 'https://linkedin.com/in/test',
    },
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'developer',
    customization: {},
    aiSettings: {},
    status: 'draft',
    subdomain: 'test',
    views: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    portfolioServiceClient = new PortfolioServiceClient();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getUserPortfolios', () => {
    it('should fetch user portfolios successfully', async () => {
      const mockPortfolios = [mockPortfolio];
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockPortfolios,
      });

      const result = await portfolioServiceClient.getUserPortfolios('user-123');

      expect(result).toEqual(mockPortfolios);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios?userId=user-123'
      );
    });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(
        portfolioServiceClient.getUserPortfolios('user-123')
      ).rejects.toThrow('Failed to fetch portfolios');

      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching portfolios:',
        expect.any(Error)
      );
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network error');
      (global.fetch as jest.Mock).mockRejectedValue(networkError);

      await expect(
        portfolioServiceClient.getUserPortfolios('user-123')
      ).rejects.toThrow('Network error');

      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching portfolios:',
        networkError
      );
    });
  });

  describe('getPortfolio', () => {
    it('should fetch portfolio successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockPortfolio,
      });

      const result = await portfolioServiceClient.getPortfolio('portfolio-123');

      expect(result).toEqual(mockPortfolio);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/portfolio-123'
      );
    });

    it('should handle fetch error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(
        portfolioServiceClient.getPortfolio('portfolio-123')
      ).rejects.toThrow('Failed to fetch portfolio');

      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching portfolio:',
        expect.any(Error)
      );
    });
  });

  describe('createPortfolio', () => {
    it('should create portfolio successfully', async () => {
      const createData: CreatePortfolioDTO = {
        name: 'New Portfolio',
        title: 'Developer',
        bio: 'Bio',
        template: 'developer',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockPortfolio,
      });

      const result = await portfolioServiceClient.createPortfolio(createData);

      expect(result).toEqual(mockPortfolio);
      expect(global.fetch).toHaveBeenCalledWith('/api/v1/portfolios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });
    });

    it('should handle creation error', async () => {
      const createData: CreatePortfolioDTO = {
        name: 'New Portfolio',
        title: 'Developer',
        bio: 'Bio',
        template: 'developer',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
      });

      await expect(
        portfolioServiceClient.createPortfolio(createData)
      ).rejects.toThrow('Failed to create portfolio');

      expect(logger.error).toHaveBeenCalledWith(
        'Error creating portfolio:',
        expect.any(Error)
      );
    });
  });

  describe('updatePortfolio', () => {
    it('should update portfolio successfully', async () => {
      const updateData: UpdatePortfolioDTO = {
        name: 'Updated Portfolio',
        bio: 'Updated bio',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => ({ ...mockPortfolio, ...updateData }),
      });

      const result = await portfolioServiceClient.updatePortfolio(
        'portfolio-123',
        updateData
      );

      expect(result.name).toBe('Updated Portfolio');
      expect(result.bio).toBe('Updated bio');
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/portfolio-123',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );
    });

    it('should handle update error', async () => {
      const updateData: UpdatePortfolioDTO = {
        name: 'Updated Portfolio',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(
        portfolioServiceClient.updatePortfolio('portfolio-123', updateData)
      ).rejects.toThrow('Failed to update portfolio');

      expect(logger.error).toHaveBeenCalledWith(
        'Error updating portfolio:',
        expect.any(Error)
      );
    });
  });

  describe('deletePortfolio', () => {
    it('should delete portfolio successfully', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await portfolioServiceClient.deletePortfolio('portfolio-123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/portfolio-123',
        {
          method: 'DELETE',
        }
      );
    });

    it('should handle deletion error', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(
        portfolioServiceClient.deletePortfolio('portfolio-123')
      ).rejects.toThrow('Failed to delete portfolio');

      expect(logger.error).toHaveBeenCalledWith(
        'Error deleting portfolio:',
        expect.any(Error)
      );
    });
  });

  describe('Error handling', () => {
    it('should handle non-Error objects in catch blocks', async () => {
      (global.fetch as jest.Mock).mockRejectedValue('String error');

      await expect(
        portfolioServiceClient.getPortfolio('portfolio-123')
      ).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle JSON parsing errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(
        portfolioServiceClient.getPortfolio('portfolio-123')
      ).rejects.toThrow('Invalid JSON');
    });

    it('should handle empty response bodies', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => null,
      });

      const result = await portfolioServiceClient.getPortfolio('portfolio-123');
      expect(result).toBeNull();
    });
  });

  describe('Request headers', () => {
    it('should not include Content-Type header for GET requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => mockPortfolio,
      });

      await portfolioServiceClient.getPortfolio('portfolio-123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/portfolio-123'
      );
      // No headers object should be passed for GET requests
    });

    it('should not include Content-Type header for DELETE requests', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
      });

      await portfolioServiceClient.deletePortfolio('portfolio-123');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/portfolios/portfolio-123',
        { method: 'DELETE' }
      );
      // No Content-Type header for DELETE
    });
  });

  describe('Response status codes', () => {
    const testCases = [
      {
        method: 'getUserPortfolios',
        args: ['user-123'],
        status: 401,
        error: 'Failed to fetch portfolios',
      },
      {
        method: 'getPortfolio',
        args: ['portfolio-123'],
        status: 404,
        error: 'Failed to fetch portfolio',
      },
      {
        method: 'createPortfolio',
        args: [
          { name: 'Test', title: 'Dev', bio: 'Bio', template: 'developer' },
        ],
        status: 400,
        error: 'Failed to create portfolio',
      },
      {
        method: 'updatePortfolio',
        args: ['portfolio-123', { name: 'Updated' }],
        status: 403,
        error: 'Failed to update portfolio',
      },
      {
        method: 'deletePortfolio',
        args: ['portfolio-123'],
        status: 403,
        error: 'Failed to delete portfolio',
      },
    ];

    testCases.forEach(({ method, args, status, error }) => {
      it(`should handle ${status} status for ${method}`, async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
          ok: false,
          status,
        });

        await expect(
          (portfolioServiceClient as any)[method](...args)
        ).rejects.toThrow(error);
      });
    });
  });
});

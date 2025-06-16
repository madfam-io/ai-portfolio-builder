import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/portfolios/[id]/publish/route';
import { authenticateUser } from '@/lib/api/middleware/auth';
import { portfolioService } from '@/lib/services/portfolio/portfolio-service';

// Mock dependencies
jest.mock('@/lib/api/middleware/auth');
jest.mock('@/lib/services/portfolio/portfolio-service');
jest.mock('@/lib/utils/logger');

describe('/api/v1/portfolios/[id]/publish', () => {
  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock user
    mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
    };

    // Default mock implementations
    (authenticateUser as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('POST /api/v1/portfolios/[id]/publish', () => {
    it('should publish portfolio successfully', async () => {
      const mockPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        name: 'My Portfolio',
        status: 'draft',
      };

      const mockPublishedPortfolio = {
        ...mockPortfolio,
        status: 'published',
        subdomain: 'my-portfolio',
        publishedAt: new Date().toISOString(),
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.publishPortfolio as jest.Mock).mockResolvedValue(mockPublishedPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toEqual(mockPublishedPortfolio);
      expect(data.message).toBe('Portfolio published successfully');

      expect(portfolioService.getPortfolio).toHaveBeenCalledWith('portfolio-123');
      expect(portfolioService.publishPortfolio).toHaveBeenCalledWith('portfolio-123');
    });

    it('should handle unauthenticated requests', async () => {
      (authenticateUser as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('should prevent publishing portfolios not owned by user', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toBe('Portfolio not found or access denied');
    });

    it('should handle portfolio not found during publish', async () => {
      const mockPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.publishPortfolio as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Portfolio not found');
    });

    it('should handle service errors', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe('Failed to publish portfolio');
    });

    it('should handle already published portfolios', async () => {
      const mockPublishedPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        status: 'published',
        publishedAt: '2025-06-15T10:00:00Z',
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPublishedPortfolio);
      (portfolioService.publishPortfolio as jest.Mock).mockResolvedValue(mockPublishedPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.status).toBe('published');
    });
  });
});
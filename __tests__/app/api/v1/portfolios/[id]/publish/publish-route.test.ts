import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/portfolios/[id]/publish/route';
import { portfolioService } from '@/lib/services/portfolio/portfolio-service';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');
jest.mock('@/lib/services/portfolio/portfolio-service');

describe('Portfolio Publish API Route - /api/v1/portfolios/[id]/publish', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' }
  };

  const mockPortfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'Test Portfolio',
    title: 'Test Title',
    bio: 'Test bio',
    template: 'developer',
    status: 'draft',
    subdomain: 'test-portfolio'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('POST /api/v1/portfolios/[id]/publish', () => {
    it('should publish portfolio successfully', async () => {
      const publishedPortfolio = { ...mockPortfolio, status: 'published', publishedAt: new Date() };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.publishPortfolio as jest.Mock).mockResolvedValue(publishedPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('published');
      expect(data.data.publishedAt).toBeDefined();
    });

    it('should validate portfolio completeness before publishing', async () => {
      const incompletePortfolio = { ...mockPortfolio, bio: '', title: '' };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(incompletePortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Portfolio is incomplete');
      expect(portfolioService.publishPortfolio).not.toHaveBeenCalled();
    });

    it('should handle subdomain configuration', async () => {
      const portfolioWithSubdomain = { ...mockPortfolio };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(portfolioWithSubdomain);
      (portfolioService.checkSubdomainAvailability as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
        body: JSON.stringify({ subdomain: 'taken-subdomain' })
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Subdomain is not available');
    });

    it('should auto-generate subdomain if not provided', async () => {
      const portfolioWithoutSubdomain = { ...mockPortfolio, subdomain: null };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(portfolioWithoutSubdomain);
      (portfolioService.checkSubdomainAvailability as jest.Mock).mockResolvedValue(true);
      (portfolioService.updateSubdomain as jest.Mock).mockResolvedValue(true);
      (portfolioService.publishPortfolio as jest.Mock).mockResolvedValue({
        ...portfolioWithoutSubdomain,
        subdomain: 'test-portfolio-123',
        status: 'published'
      });

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(portfolioService.updateSubdomain).toHaveBeenCalled();
      expect(data.data.subdomain).toBeDefined();
    });

    it('should prevent publishing already published portfolio', async () => {
      const publishedPortfolio = { ...mockPortfolio, status: 'published' };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(publishedPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Portfolio is already published');
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST'
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should return 403 when publishing other user portfolio', async () => {
      const otherUserPortfolio = { ...mockPortfolio, userId: 'other-user' };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(otherUserPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST'
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toContain('Forbidden');
    });

    it('should handle publish service errors', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.publishPortfolio as jest.Mock).mockRejectedValue(
        new Error('Publishing failed')
      );

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123/publish', {
        method: 'POST'
      });

      const response = await POST(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to publish portfolio');
    });
  });
});
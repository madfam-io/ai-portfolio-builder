import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/portfolios/route';
import { portfolioService } from '@/lib/services/portfolio/portfolio-service';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');
jest.mock('@/lib/services/portfolio/portfolio-service');

describe('Portfolio API Routes - /api/v1/portfolios', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/v1/portfolios', () => {
    it('should return user portfolios successfully', async () => {
      const mockPortfolios = [
        { id: '1', name: 'Portfolio 1', userId: 'user-123' },
        { id: '2', name: 'Portfolio 2', userId: 'user-123' }
      ];
      
      (portfolioService.getUserPortfolios as jest.Mock).mockResolvedValue(mockPortfolios);

      const request = new NextRequest('http://localhost/api/v1/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPortfolios);
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/v1/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
    });

    it('should handle service errors gracefully', async () => {
      (portfolioService.getUserPortfolios as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost/api/v1/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Failed to fetch portfolios');
    });

    it('should support search parameter', async () => {
      const mockPortfolios = [{ id: '1', name: 'Test Portfolio' }];
      (portfolioService.searchPortfolios as jest.Mock).mockResolvedValue(mockPortfolios);

      const request = new NextRequest('http://localhost/api/v1/portfolios?search=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(portfolioService.searchPortfolios).toHaveBeenCalledWith('test', 'user-123');
      expect(data.data).toEqual(mockPortfolios);
    });
  });

  describe('POST /api/v1/portfolios', () => {
    it('should create portfolio successfully', async () => {
      const mockPortfolio = {
        id: 'new-portfolio',
        name: 'New Portfolio',
        title: 'Test Title',
        bio: 'Test bio'
      };

      (portfolioService.createPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Portfolio',
          title: 'Test Title',
          bio: 'Test bio',
          template: 'developer'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPortfolio);
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }) // Missing required fields
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
    });

    it('should prevent XSS in input fields', async () => {
      const request = new NextRequest('http://localhost/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({
          name: '<script>alert("xss")</script>',
          title: 'Test Title',
          bio: 'Test bio',
          template: 'developer'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid characters');
    });

    it('should handle duplicate portfolio names', async () => {
      (portfolioService.createPortfolio as jest.Mock).mockRejectedValue(
        new Error('Portfolio name already exists')
      );

      const request = new NextRequest('http://localhost/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Existing Portfolio',
          title: 'Test',
          bio: 'Test',
          template: 'developer'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('already exists');
    });
  });
});
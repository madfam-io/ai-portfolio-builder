import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/v1/portfolios/[id]/route';
import { portfolioService } from '@/lib/services/portfolio/portfolio-service';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');
jest.mock('@/lib/services/portfolio/portfolio-service');

describe('Portfolio API Routes - /api/v1/portfolios/[id]', () => {
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
    status: 'draft'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('GET /api/v1/portfolios/[id]', () => {
    it('should return portfolio successfully', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123');
      const response = await GET(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockPortfolio);
    });

    it('should return 404 when portfolio not found', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/v1/portfolios/invalid-id');
      const response = await GET(request, { params: { id: 'invalid-id' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('should return 403 when accessing other user portfolio', async () => {
      const otherUserPortfolio = { ...mockPortfolio, userId: 'other-user' };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(otherUserPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123');
      const response = await GET(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Forbidden');
    });

    it('should return 401 when not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123');
      const response = await GET(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });
  });

  describe('PUT /api/v1/portfolios/[id]', () => {
    it('should update portfolio successfully', async () => {
      const updatedPortfolio = { ...mockPortfolio, title: 'Updated Title' };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.updatePortfolio as jest.Mock).mockResolvedValue(updatedPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' })
      });

      const response = await PUT(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.title).toBe('Updated Title');
    });

    it('should validate update data', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123', {
        method: 'PUT',
        body: JSON.stringify({ title: '<script>alert("xss")</script>' })
      });

      const response = await PUT(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid');
    });

    it('should handle partial updates', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.updatePortfolio as jest.Mock).mockResolvedValue({
        ...mockPortfolio,
        bio: 'Updated bio only'
      });

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123', {
        method: 'PUT',
        body: JSON.stringify({ bio: 'Updated bio only' })
      });

      const response = await PUT(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(portfolioService.updatePortfolio).toHaveBeenCalledWith(
        'portfolio-123',
        { bio: 'Updated bio only' }
      );
    });

    it('should prevent updating other user portfolio', async () => {
      const otherUserPortfolio = { ...mockPortfolio, userId: 'other-user' };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(otherUserPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Hacked' })
      });

      const response = await PUT(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(portfolioService.updatePortfolio).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/v1/portfolios/[id]', () => {
    it('should delete portfolio successfully', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.deletePortfolio as jest.Mock).mockResolvedValue(true);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toContain('deleted');
    });

    it('should prevent deleting published portfolio', async () => {
      const publishedPortfolio = { ...mockPortfolio, status: 'published' };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(publishedPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Cannot delete published portfolio');
      expect(portfolioService.deletePortfolio).not.toHaveBeenCalled();
    });

    it('should prevent deleting other user portfolio', async () => {
      const otherUserPortfolio = { ...mockPortfolio, userId: 'other-user' };
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(otherUserPortfolio);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'portfolio-123' } });

      expect(response.status).toBe(403);
      expect(portfolioService.deletePortfolio).not.toHaveBeenCalled();
    });

    it('should handle deletion failures', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.deletePortfolio as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost/api/v1/portfolios/portfolio-123', {
        method: 'DELETE'
      });

      const response = await DELETE(request, { params: { id: 'portfolio-123' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Failed to delete');
    });
  });
});
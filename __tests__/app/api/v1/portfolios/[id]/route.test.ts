import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/v1/portfolios/[id]/route';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { portfolioService } from '@/lib/services/portfolio/portfolio-service';

// Mock dependencies
jest.mock('@/lib/auth/supabase-server');
jest.mock('@/lib/services/portfolio/portfolio-service');
jest.mock('@/lib/utils/logger');

describe('Portfolio [id] API Routes', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockPortfolio = {
    id: 'portfolio-1',
    userId: 'user-123',
    title: 'My Portfolio',
    template: 'developer',
    data: {
      personalInfo: {
        name: 'John Doe',
        title: 'Software Developer',
      },
    },
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
      },
    };

    (createSupabaseServerClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('GET /api/v1/portfolios/[id]', () => {
    it('should return portfolio when user owns it', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1');
      const response = await GET(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data).toEqual(mockPortfolio);
      expect(portfolioService.getPortfolio).toHaveBeenCalledWith('portfolio-1', 'user-123');
    });

    it('should return 404 when portfolio not found', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/nonexistent');
      const response = await GET(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Portfolio not found');
    });

    it('should return 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1');
      const response = await GET(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Unauthorized');
    });

    it('should return 403 when user does not own portfolio', async () => {
      const otherUserPortfolio = {
        ...mockPortfolio,
        userId: 'other-user-456',
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(otherUserPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1');
      const response = await GET(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Access denied');
    });
  });

  describe('PUT /api/v1/portfolios/[id]', () => {
    const updateData = {
      title: 'Updated Portfolio',
      template: 'designer',
      data: {
        personalInfo: {
          name: 'Jane Doe',
          title: 'UI/UX Designer',
        },
      },
    };

    it('should update portfolio when user owns it', async () => {
      const updatedPortfolio = {
        ...mockPortfolio,
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.updatePortfolio as jest.Mock).mockResolvedValue(updatedPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data).toEqual(updatedPortfolio);
      expect(portfolioService.updatePortfolio).toHaveBeenCalledWith('portfolio-1', updateData);
    });

    it('should validate template value on update', async () => {
      const invalidUpdate = {
        template: 'invalid-template',
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1', {
        method: 'PUT',
        body: JSON.stringify(invalidUpdate),
      });

      const response = await PUT(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Invalid template');
    });

    it('should allow partial updates', async () => {
      const partialUpdate = {
        title: 'New Title Only',
      };

      const updatedPortfolio = {
        ...mockPortfolio,
        title: 'New Title Only',
        updatedAt: new Date().toISOString(),
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.updatePortfolio as jest.Mock).mockResolvedValue(updatedPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1', {
        method: 'PUT',
        body: JSON.stringify(partialUpdate),
      });

      const response = await PUT(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.title).toBe('New Title Only');
      expect(portfolioService.updatePortfolio).toHaveBeenCalledWith('portfolio-1', partialUpdate);
    });

    it('should return 404 when portfolio not found', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/nonexistent', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Portfolio not found');
    });
  });

  describe('DELETE /api/v1/portfolios/[id]', () => {
    it('should delete portfolio when user owns it', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.deletePortfolio as jest.Mock).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.message).toBe('Portfolio deleted successfully');
      expect(portfolioService.deletePortfolio).toHaveBeenCalledWith('portfolio-1');
    });

    it('should return 404 when portfolio not found', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/nonexistent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Portfolio not found');
    });

    it('should return 403 when user does not own portfolio', async () => {
      const otherUserPortfolio = {
        ...mockPortfolio,
        userId: 'other-user-456',
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(otherUserPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Access denied');
    });

    it('should not delete published portfolios without force flag', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        isPublished: true,
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(publishedPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('published portfolio');
    });

    it('should delete published portfolio with force flag', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        isPublished: true,
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(publishedPortfolio);
      (portfolioService.deletePortfolio as jest.Mock).mockResolvedValue(true);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-1?force=true',
        { method: 'DELETE' }
      );

      const response = await DELETE(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(portfolioService.deletePortfolio).toHaveBeenCalled();
    });
  });
});
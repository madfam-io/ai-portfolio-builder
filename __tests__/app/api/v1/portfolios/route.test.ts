import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/portfolios/route';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { portfolioService } from '@/lib/services/portfolio/portfolio-service';

// Mock dependencies
jest.mock('@/lib/auth/supabase-server');
jest.mock('@/lib/services/portfolio/portfolio-service');
jest.mock('@/lib/utils/logger');

describe('Portfolio API Routes', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockPortfolios = [
    {
      id: 'portfolio-1',
      userId: 'user-123',
      title: 'My Portfolio',
      template: 'developer',
      isPublished: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'portfolio-2',
      userId: 'user-123',
      title: 'Second Portfolio',
      template: 'designer',
      isPublished: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

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

  describe('GET /api/v1/portfolios', () => {
    it('should return user portfolios when authenticated', async () => {
      (portfolioService.getUserPortfolios as jest.Mock).mockResolvedValue(mockPortfolios);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data).toEqual(mockPortfolios);
      expect(portfolioService.getUserPortfolios).toHaveBeenCalledWith('user-123');
    });

    it('should return 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Unauthorized');
    });

    it('should handle service errors gracefully', async () => {
      (portfolioService.getUserPortfolios as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Failed to fetch portfolios');
    });

    it('should include API version header', async () => {
      (portfolioService.getUserPortfolios as jest.Mock).mockResolvedValue(mockPortfolios);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      const response = await GET(request);

      expect(response.headers.get('X-API-Version')).toBe('1.0');
    });
  });

  describe('POST /api/v1/portfolios', () => {
    const newPortfolioData = {
      title: 'New Portfolio',
      template: 'developer',
      data: {
        personalInfo: {
          name: 'John Doe',
          title: 'Software Developer',
        },
      },
    };

    it('should create a new portfolio when authenticated', async () => {
      const createdPortfolio = {
        id: 'portfolio-3',
        userId: 'user-123',
        ...newPortfolioData,
        isPublished: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      (portfolioService.createPortfolio as jest.Mock).mockResolvedValue(createdPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify(newPortfolioData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.status).toBe('success');
      expect(data.data).toEqual(createdPortfolio);
      expect(portfolioService.createPortfolio).toHaveBeenCalledWith({
        ...newPortfolioData,
        userId: 'user-123',
      });
    });

    it('should validate required fields', async () => {
      const invalidData = {
        template: 'developer',
        // Missing title
      };

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('validation');
    });

    it('should validate template value', async () => {
      const invalidTemplate = {
        title: 'Test Portfolio',
        template: 'invalid-template',
      };

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify(invalidTemplate),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('template');
    });

    it('should handle malformed JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Invalid request body');
    });

    it('should return 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify(newPortfolioData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Unauthorized');
    });
  });
});
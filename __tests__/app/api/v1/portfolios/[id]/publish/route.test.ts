import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/portfolios/[id]/publish/route';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { portfolioService } from '@/lib/services/portfolio/portfolio-service';

// Mock dependencies
jest.mock('@/lib/auth/supabase-server');
jest.mock('@/lib/services/portfolio/portfolio-service');
jest.mock('@/lib/utils/logger');

describe('Portfolio Publish API Route', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockPortfolio = {
    id: 'portfolio-1',
    userId: 'user-123',
    title: 'My Portfolio',
    template: 'developer',
    subdomain: null,
    data: {
      personalInfo: {
        name: 'John Doe',
        title: 'Software Developer',
        bio: 'Experienced developer',
      },
      experience: [
        {
          id: '1',
          title: 'Senior Developer',
          company: 'Tech Corp',
          startDate: '2020-01-01',
          endDate: null,
          description: 'Leading development team',
        },
      ],
      projects: [
        {
          id: '1',
          title: 'E-commerce Platform',
          description: 'Built scalable platform',
          technologies: ['React', 'Node.js'],
        },
      ],
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

  describe('POST /api/v1/portfolios/[id]/publish', () => {
    const publishRequest = {
      subdomain: 'johndoe',
    };

    it('should publish portfolio successfully', async () => {
      const publishedPortfolio = {
        ...mockPortfolio,
        subdomain: 'johndoe',
        isPublished: true,
        publishedAt: new Date().toISOString(),
        publishUrl: 'https://johndoe.prisma-portfolios.com',
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.checkSubdomainAvailability as jest.Mock).mockResolvedValue(true);
      (portfolioService.publishPortfolio as jest.Mock).mockResolvedValue(publishedPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1/publish', {
        method: 'POST',
        body: JSON.stringify(publishRequest),
      });

      const response = await POST(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data).toEqual(publishedPortfolio);
      expect(data.data.isPublished).toBe(true);
      expect(data.data.subdomain).toBe('johndoe');
      expect(portfolioService.publishPortfolio).toHaveBeenCalledWith('portfolio-1', 'johndoe');
    });

    it('should validate subdomain format', async () => {
      const invalidSubdomain = {
        subdomain: 'Invalid-Subdomain!', // Contains uppercase and special chars
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1/publish', {
        method: 'POST',
        body: JSON.stringify(invalidSubdomain),
      });

      const response = await POST(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Invalid subdomain format');
    });

    it('should check subdomain availability', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);
      (portfolioService.checkSubdomainAvailability as jest.Mock).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1/publish', {
        method: 'POST',
        body: JSON.stringify(publishRequest),
      });

      const response = await POST(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Subdomain already taken');
      expect(portfolioService.checkSubdomainAvailability).toHaveBeenCalledWith('johndoe');
    });

    it('should validate portfolio completeness', async () => {
      const incompletePortfolio = {
        ...mockPortfolio,
        data: {
          personalInfo: {
            name: '', // Missing name
            title: '',
            bio: '',
          },
        },
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(incompletePortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1/publish', {
        method: 'POST',
        body: JSON.stringify(publishRequest),
      });

      const response = await POST(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Portfolio is incomplete');
      expect(data.errors).toContain('Name is required');
    });

    it('should handle already published portfolios', async () => {
      const alreadyPublished = {
        ...mockPortfolio,
        isPublished: true,
        subdomain: 'existing-subdomain',
      };

      const updatedPortfolio = {
        ...alreadyPublished,
        subdomain: 'johndoe',
        updatedAt: new Date().toISOString(),
      };

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(alreadyPublished);
      (portfolioService.checkSubdomainAvailability as jest.Mock).mockResolvedValue(true);
      (portfolioService.publishPortfolio as jest.Mock).mockResolvedValue(updatedPortfolio);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1/publish', {
        method: 'POST',
        body: JSON.stringify(publishRequest),
      });

      const response = await POST(request, { params: { id: 'portfolio-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.subdomain).toBe('johndoe');
    });

    it('should enforce subdomain length limits', async () => {
      const tooShort = { subdomain: 'ab' }; // Too short
      const tooLong = { subdomain: 'a'.repeat(64) }; // Too long

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      // Test too short
      let request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1/publish', {
        method: 'POST',
        body: JSON.stringify(tooShort),
      });

      let response = await POST(request, { params: { id: 'portfolio-1' } });
      let data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('at least 3 characters');

      // Test too long
      request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1/publish', {
        method: 'POST',
        body: JSON.stringify(tooLong),
      });

      response = await POST(request, { params: { id: 'portfolio-1' } });
      data = await response.json();

      expect(response.status).toBe(400);
      expect(data.message).toContain('maximum 63 characters');
    });

    it('should block reserved subdomains', async () => {
      const reservedSubdomains = ['admin', 'api', 'www', 'dashboard', 'auth'];

      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

      for (const reserved of reservedSubdomains) {
        const request = new NextRequest('http://localhost:3000/api/v1/portfolios/portfolio-1/publish', {
          method: 'POST',
          body: JSON.stringify({ subdomain: reserved }),
        });

        const response = await POST(request, { params: { id: 'portfolio-1' } });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.message).toContain('reserved');
      }
    });

    it('should return 404 when portfolio not found', async () => {
      (portfolioService.getPortfolio as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/nonexistent/publish', {
        method: 'POST',
        body: JSON.stringify(publishRequest),
      });

      const response = await POST(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Portfolio not found');
    });
  });
});
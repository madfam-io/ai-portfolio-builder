import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/preview/route';
import { createClient } from '@/lib/supabase/server';
import { renderDeveloperTemplate } from '@/lib/templates/developer';
import { renderDesignerTemplate } from '@/lib/templates/designer';
import { renderConsultantTemplate } from '@/lib/templates/consultant';
import { transformDbPortfolioToApi } from '@/lib/utils/portfolio-transformer';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/templates/developer');
jest.mock('@/lib/templates/designer');
jest.mock('@/lib/templates/consultant');
jest.mock('@/lib/utils/portfolio-transformer');
jest.mock('@/lib/utils/logger');

describe('Portfolio Preview API Routes', () => {
  let mockSupabaseClient: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase client
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

    // Mock logger
    (logger.error as jest.Mock).mockImplementation(() => {});

    // Mock template renderers
    (renderDeveloperTemplate as jest.Mock).mockReturnValue(
      '<div>Developer Template</div>'
    );
    (renderDesignerTemplate as jest.Mock).mockReturnValue(
      '<div>Designer Template</div>'
    );
    (renderConsultantTemplate as jest.Mock).mockReturnValue(
      '<div>Consultant Template</div>'
    );

    // Mock transformer
    (transformDbPortfolioToApi as jest.Mock).mockImplementation(db => ({
      ...db,
      transformed: true,
    }));
  });

  describe('GET /api/v1/preview', () => {
    const mockDbPortfolio = {
      id: 'portfolio-123',
      user_id: 'user-123',
      name: 'Test Portfolio',
      title: 'Software Developer',
      bio: 'Test bio',
      template: 'developer',
    };

    it('should generate preview with developer template', async () => {
      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockDbPortfolio,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?portfolioId=portfolio-123&template=developer'
      );
      const response = await GET(request);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/html');
      expect(response.headers.get('X-Frame-Options')).toBe('SAMEORIGIN');
      expect(html).toContain('Developer Template');
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Test Portfolio - Preview');
      expect(renderDeveloperTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          transformed: true,
        })
      );
    });

    it('should generate preview with designer template', async () => {
      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockDbPortfolio,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?portfolioId=portfolio-123&template=designer'
      );
      const response = await GET(request);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain('Designer Template');
      expect(renderDesignerTemplate).toHaveBeenCalled();
    });

    it('should generate preview with consultant template', async () => {
      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockDbPortfolio,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?portfolioId=portfolio-123&template=consultant'
      );
      const response = await GET(request);
      const html = await response.text();

      expect(response.status).toBe(200);
      expect(html).toContain('Consultant Template');
      expect(renderConsultantTemplate).toHaveBeenCalled();
    });

    it('should include live reload script', async () => {
      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockDbPortfolio,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?portfolioId=portfolio-123&template=developer'
      );
      const response = await GET(request);
      const html = await response.text();

      expect(html).toContain("window.addEventListener('message'");
      expect(html).toContain('UPDATE_PORTFOLIO');
      expect(html).toContain('PREVIEW_READY');
    });

    it('should include necessary assets', async () => {
      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockDbPortfolio,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?portfolioId=portfolio-123&template=developer'
      );
      const response = await GET(request);
      const html = await response.text();

      expect(html).toContain('https://cdn.tailwindcss.com');
      expect(html).toContain('https://fonts.googleapis.com/css2?family=Inter');
    });

    it('should return 400 for missing portfolioId', async () => {
      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?template=developer'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request parameters');
      expect(data.data.details).toBeDefined();
    });

    it('should return 400 for missing template', async () => {
      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?portfolioId=portfolio-123'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request parameters');
    });

    it('should return 404 when portfolio not found', async () => {
      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?portfolioId=nonexistent&template=developer'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Portfolio not found');
    });

    it('should handle database connection errors', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?portfolioId=portfolio-123&template=developer'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate preview');
    });

    it('should handle template rendering errors', async () => {
      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockDbPortfolio,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);
      (renderDeveloperTemplate as jest.Mock).mockImplementation(() => {
        throw new Error('Template error');
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/preview?portfolioId=portfolio-123&template=developer'
      );
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to generate preview');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/preview', () => {
    const validPortfolioData = {
      portfolio: {
        id: 'portfolio-123',
        userId: 'user-123',
        name: 'Test Portfolio',
        title: 'Software Developer',
        bio: 'Test bio',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
        contact: { email: 'test@example.com' },
        social: {},
        template: 'developer',
        customization: {},
        status: 'draft',
      },
      template: 'developer',
    };

    it('should generate preview HTML from portfolio data', async () => {
      const _request = new NextRequest('http://localhost:3000/api/v1/preview', {
        method: 'POST',
        body: JSON.stringify(validPortfolioData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.html).toBe('<div>Developer Template</div>');
      expect(renderDeveloperTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Portfolio',
          title: 'Software Developer',
          bio: 'Test bio',
        })
      );
    });

    it('should handle designer template', async () => {
      const _request = new NextRequest('http://localhost:3000/api/v1/preview', {
        method: 'POST',
        body: JSON.stringify({
          ...validPortfolioData,
          template: 'designer',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.html).toBe('<div>Designer Template</div>');
      expect(renderDesignerTemplate).toHaveBeenCalled();
    });

    it('should handle consultant template', async () => {
      const _request = new NextRequest('http://localhost:3000/api/v1/preview', {
        method: 'POST',
        body: JSON.stringify({
          ...validPortfolioData,
          template: 'consultant',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.html).toBe('<div>Consultant Template</div>');
      expect(renderConsultantTemplate).toHaveBeenCalled();
    });

    it('should provide defaults for missing portfolio fields', async () => {
      const minimalPortfolio = {
        portfolio: {
          name: 'Minimal Portfolio',
          title: 'Developer',
          bio: 'Bio',
        },
        template: 'developer',
      };

      const _request = new NextRequest('http://localhost:3000/api/v1/preview', {
        method: 'POST',
        body: JSON.stringify(minimalPortfolio),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(renderDeveloperTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'preview',
          userId: 'preview-user',
          experience: [],
          education: [],
          projects: [],
          skills: [],
          certifications: [],
          contact: {},
          social: {},
          template: 'developer',
          customization: {},
          status: 'draft',
          views: 0,
        })
      );
    });

    it('should return 400 for invalid portfolio data', async () => {
      const invalidData = {
        portfolio: {
          // Missing required fields
        },
        template: 'developer',
      };

      const _request = new NextRequest('http://localhost:3000/api/v1/preview', {
        method: 'POST',
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
      expect(data.data.details).toBeDefined();
    });

    it('should handle template rendering errors', async () => {
      (renderDeveloperTemplate as jest.Mock).mockImplementation(() => {
        throw new Error('Render error');
      });

      const _request = new NextRequest('http://localhost:3000/api/v1/preview', {
        method: 'POST',
        body: JSON.stringify(validPortfolioData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update preview');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle invalid JSON', async () => {
      const _request = new NextRequest('http://localhost:3000/api/v1/preview', {
        method: 'POST',
        body: 'invalid-json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update preview');
    });
  });
});

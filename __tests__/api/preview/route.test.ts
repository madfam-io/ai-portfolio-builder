/**
 * Tests for Preview API Route
 */

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/preview/route';

// Mock portfolio service
const mockPortfolioData = {
  id: '1',
  name: 'John Doe',
  title: 'Software Engineer',
  bio: 'Experienced developer',
  template: 'developer',
  sections: {
    hero: {
      headline: 'Building amazing software',
      subheadline: 'Full-stack developer with 5+ years experience',
    },
    about: {
      content: 'I am passionate about creating elegant solutions...',
    },
    projects: [
      {
        id: '1',
        title: 'E-commerce Platform',
        description: 'Built a scalable e-commerce solution',
        technologies: ['React', 'Node.js', 'PostgreSQL'],
        link: 'https://example.com',
      },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    contact: {
      email: 'john@example.com',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
    },
  },
  customization: {
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      background: '#ffffff',
      text: '#1f2937',
    },
    fonts: {
      heading: 'Inter',
      body: 'system-ui',
    },
  },
};

jest.mock('@/lib/services/portfolioService', () => ({
  portfolioService: {
    getPortfolioById: jest.fn(),
    generatePreview: jest.fn(),
  },
}));

describe('Preview API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/preview', () => {
    it('should return preview data for valid portfolio ID', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.getPortfolioById.mockResolvedValue(mockPortfolioData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/preview?id=1')
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.portfolio).toEqual(mockPortfolioData);
      expect(data.previewUrl).toBeDefined();
    });

    it('should return error for missing portfolio ID', async () => {
      const request = new NextRequest(
        new URL('http://localhost:3000/api/preview')
      );
      const response = await GET(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe('Portfolio ID is required');
    });

    it('should return 404 for non-existent portfolio', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.getPortfolioById.mockResolvedValue(null);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/preview?id=999')
      );
      const response = await GET(request);

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data.error).toBe('Portfolio not found');
    });

    it('should handle template parameter', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.getPortfolioById.mockResolvedValue(mockPortfolioData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/preview?id=1&template=designer')
      );
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.portfolio.template).toBe('designer');
    });
  });

  describe('POST /api/preview', () => {
    it('should generate preview with portfolio data', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.generatePreview.mockResolvedValue({
        previewId: 'preview-123',
        previewUrl: 'http://localhost:3000/preview/preview-123',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/preview', {
        method: 'POST',
      });
      request.json = jest.fn().mockResolvedValue({
        portfolio: mockPortfolioData,
        options: {
          template: 'developer',
          includeAnalytics: false,
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.previewId).toBe('preview-123');
      expect(data.previewUrl).toBeDefined();
      expect(data.expiresAt).toBeDefined();
    });

    it('should validate required portfolio data', async () => {
      const request = new NextRequest('http://localhost:3000/api/preview', {
        method: 'POST',
      });
      request.json = jest.fn().mockResolvedValue({
        portfolio: {
          // Missing required fields
          name: 'John',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Invalid portfolio data');
    });

    it('should handle real-time updates', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.generatePreview.mockResolvedValue({
        previewId: 'preview-123',
        previewUrl: 'http://localhost:3000/preview/preview-123',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/preview', {
        method: 'POST',
      });
      request.json = jest.fn().mockResolvedValue({
        portfolio: mockPortfolioData,
        options: {
          realTime: true,
          sessionId: 'session-123',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.sessionId).toBe('session-123');
      expect(data.websocketUrl).toBeDefined();
    });

    it('should apply custom styling', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');

      const customPortfolio = {
        ...mockPortfolioData,
        customization: {
          ...mockPortfolioData.customization,
          colors: {
            primary: '#ff0000',
            secondary: '#00ff00',
            background: '#000000',
            text: '#ffffff',
          },
        },
      };

      portfolioService.generatePreview.mockResolvedValue({
        previewId: 'preview-123',
        previewUrl: 'http://localhost:3000/preview/preview-123',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/preview', {
        method: 'POST',
      });
      request.json = jest.fn().mockResolvedValue({
        portfolio: customPortfolio,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(portfolioService.generatePreview).toHaveBeenCalledWith(
        expect.objectContaining({
          customization: expect.objectContaining({
            colors: expect.objectContaining({
              primary: '#ff0000',
            }),
          }),
        })
      );
    });

    it('should handle template switching', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.generatePreview.mockResolvedValue({
        previewId: 'preview-123',
        previewUrl: 'http://localhost:3000/preview/preview-123',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });

      const templates = ['developer', 'designer', 'consultant'];

      for (const template of templates) {
        const request = new NextRequest('http://localhost:3000/api/preview', {
          method: 'POST',
        });
        request.json = jest.fn().mockResolvedValue({
          portfolio: { ...mockPortfolioData, template },
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        expect(portfolioService.generatePreview).toHaveBeenCalledWith(
          expect.objectContaining({ template })
        );
      }
    });

    it('should handle preview expiration', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');

      const expirationTime = new Date(Date.now() + 300000); // 5 minutes
      portfolioService.generatePreview.mockResolvedValue({
        previewId: 'preview-123',
        previewUrl: 'http://localhost:3000/preview/preview-123',
        expiresAt: expirationTime.toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/preview', {
        method: 'POST',
      });
      request.json = jest.fn().mockResolvedValue({
        portfolio: mockPortfolioData,
        options: {
          ttl: 300, // 5 minutes in seconds
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(new Date(data.expiresAt).getTime()).toBeCloseTo(
        expirationTime.getTime(),
        -1000 // Within 1 second
      );
    });
  });

  describe('Preview Security', () => {
    it('should require authentication for private portfolios', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.getPortfolioById.mockResolvedValue({
        ...mockPortfolioData,
        isPrivate: true,
      });

      const request = new NextRequest(
        new URL('http://localhost:3000/api/preview?id=1')
      );
      // No auth token provided

      const response = await GET(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe('Authentication required');
    });

    it('should generate secure preview URLs', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.generatePreview.mockResolvedValue({
        previewId: 'preview-123',
        previewUrl: 'http://localhost:3000/preview/preview-123',
        previewToken: 'secure-token-abc123',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });

      const request = new NextRequest('http://localhost:3000/api/preview', {
        method: 'POST',
      });
      request.json = jest.fn().mockResolvedValue({
        portfolio: mockPortfolioData,
        options: {
          secure: true,
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.previewToken).toBeDefined();
      expect(data.previewToken).toHaveLength(24); // Reasonable token length
    });
  });

  describe('Performance', () => {
    it('should cache preview data', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.getPortfolioById.mockResolvedValue(mockPortfolioData);

      // First request
      const request1 = new NextRequest(
        new URL('http://localhost:3000/api/preview?id=1')
      );
      await GET(request1);

      // Second request (should use cache)
      const request2 = new NextRequest(
        new URL('http://localhost:3000/api/preview?id=1')
      );
      const response2 = await GET(request2);

      expect(response2.headers.get('X-Cache')).toBe('HIT');
      // Should only call service once due to caching
      expect(portfolioService.getPortfolioById).toHaveBeenCalledTimes(1);
    });

    it('should bypass cache when requested', async () => {
      const { portfolioService } = require('@/lib/services/portfolioService');
      portfolioService.getPortfolioById.mockResolvedValue(mockPortfolioData);

      const request = new NextRequest(
        new URL('http://localhost:3000/api/preview?id=1&nocache=true')
      );
      const response = await GET(request);

      expect(response.headers.get('X-Cache')).toBe('MISS');
      expect(response.headers.get('Cache-Control')).toBe('no-store');
    });
  });
});

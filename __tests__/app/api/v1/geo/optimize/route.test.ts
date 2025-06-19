import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/geo/optimize/route';

// Mock dependencies
jest.mock('@/lib/services/error/error-logger');
jest.mock('@/lib/services/error/api-error-handler');
jest.mock('@/lib/ai/geo/optimizer', () => ({
  GeoContentOptimizer: jest.fn().mockImplementation(() => ({
    optimizeForLocale: jest.fn().mockResolvedValue({
      optimizedContent:
        'Desarrollador Senior de Software con 10 años de experiencia',
      changes: [
        {
          original: 'Senior Software Developer',
          localized: 'Desarrollador Senior de Software',
        },
        { original: '10 years', localized: '10 años' },
      ],
      confidence: 0.92,
    }),
    analyzeContent: jest.fn().mockResolvedValue({
      currentLocale: 'en-US',
      suggestedLocale: 'es-MX',
      culturalScore: 0.75,
    }),
  })),
}));

describe('/api/v1/geo/optimize', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/geo/optimize', () => {
    it('should optimize content for target locale', async () => {
      const requestBody = {
        content: 'Senior Software Developer with 10 years of experience',
        targetLocale: 'es-MX',
        contentType: 'bio',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('optimizedContent');
      expect(data).toHaveProperty('changes');
      expect(data).toHaveProperty('confidence');
      expect(data.optimizedContent).toContain('Desarrollador');
      expect(data.changes).toBeInstanceOf(Array);
      expect(data.confidence).toBeGreaterThan(0);
    });

    it('should validate required fields', async () => {
      const invalidBodies = [
        {}, // Empty body
        { content: 'Test' }, // Missing targetLocale
        { targetLocale: 'es-MX' }, // Missing content
        { content: '', targetLocale: 'es-MX' }, // Empty content
      ];

      for (const body of invalidBodies) {
        mockRequest = new NextRequest(
          'http://localhost:3000/api/v1/geo/optimize',
          {
            method: 'POST',
            body: JSON.stringify(body),
          }
        );

        const response = await POST(mockRequest);
        expect(response.status).toBe(400);
      }
    });

    it('should handle different content types', async () => {
      const contentTypes = ['bio', 'project', 'skills', 'experience'];

      for (const contentType of contentTypes) {
        const requestBody = {
          content: 'Professional content to be optimized',
          targetLocale: 'es-MX',
          contentType,
        };

        mockRequest = new NextRequest(
          'http://localhost:3000/api/v1/geo/optimize',
          {
            method: 'POST',
            body: JSON.stringify(requestBody),
          }
        );

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.contentType).toBe(contentType);
      }
    });

    it('should include optimization options', async () => {
      const requestBody = {
        content: 'Full Stack Developer specializing in modern web technologies',
        targetLocale: 'fr-FR',
        options: {
          preserveTechnicalTerms: true,
          formalityLevel: 'professional',
          includeLocalIdioms: false,
        },
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('options');
      expect(data.options).toEqual(requestBody.options);
    });

    it('should handle multiple target locales', async () => {
      const requestBody = {
        content: 'Experienced project manager with international background',
        targetLocales: ['es-MX', 'pt-BR', 'fr-FR'],
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('optimizations');
      expect(data.optimizations).toHaveProperty('es-MX');
      expect(data.optimizations).toHaveProperty('pt-BR');
      expect(data.optimizations).toHaveProperty('fr-FR');
    });

    it('should provide SEO optimization for locale', async () => {
      const requestBody = {
        content: 'Software Engineer building scalable applications',
        targetLocale: 'es-MX',
        includeSEO: true,
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('seo');
      expect(data.seo).toHaveProperty('title');
      expect(data.seo).toHaveProperty('description');
      expect(data.seo).toHaveProperty('keywords');
    });

    it('should analyze content if no target locale provided', async () => {
      const requestBody = {
        content:
          'Desarrollador de software con experiencia en aplicaciones web',
        analyze: true,
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('analysis');
      expect(data.analysis).toHaveProperty('detectedLocale');
      expect(data.analysis).toHaveProperty('confidence');
      expect(data.analysis).toHaveProperty('suggestions');
    });
  });

  describe('Performance Optimization', () => {
    it('should cache optimization results', async () => {
      const requestBody = {
        content: 'Senior Developer with cloud expertise',
        targetLocale: 'es-MX',
        useCache: true,
      };

      // First request
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response1 = await POST(mockRequest);
      const data1 = await response1.json();

      // Second request with same content
      const response2 = await POST(mockRequest);
      const data2 = await response2.json();

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(data2).toHaveProperty('cached', true);
      expect(data1.optimizedContent).toBe(data2.optimizedContent);
    });

    it('should handle batch optimization requests', async () => {
      const requestBody = {
        batch: [
          { content: 'Software Engineer', targetLocale: 'es-MX' },
          { content: 'Project Manager', targetLocale: 'pt-BR' },
          { content: 'UX Designer', targetLocale: 'fr-FR' },
        ],
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('results');
      expect(data.results).toBeInstanceOf(Array);
      expect(data.results.length).toBe(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid locale codes', async () => {
      const requestBody = {
        content: 'Test content',
        targetLocale: 'invalid-locale',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should handle optimization failures gracefully', async () => {
      const GeoContentOptimizer =
        require('@/lib/ai/geo/optimizer').GeoContentOptimizer;
      GeoContentOptimizer.mockImplementationOnce(() => ({
        optimizeForLocale: jest
          .fn()
          .mockRejectedValue(new Error('Optimization failed')),
      }));

      const requestBody = {
        content: 'Test content',
        targetLocale: 'es-MX',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
    });

    it('should validate content length limits', async () => {
      const requestBody = {
        content: 'x'.repeat(10001), // Exceeds limit
        targetLocale: 'es-MX',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/optimize',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });
  });
});

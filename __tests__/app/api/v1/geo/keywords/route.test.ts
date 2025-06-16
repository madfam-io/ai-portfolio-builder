import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/geo/keywords/route';

// Mock dependencies
jest.mock('@/lib/services/error/error-logger');
jest.mock('@/lib/services/error/api-error-handler');

describe('/api/v1/geo/keywords', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/geo/keywords', () => {
    it('should return keywords for a specific locale and industry', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords?locale=es-MX&industry=software'
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('keywords');
      expect(data.keywords).toBeInstanceOf(Array);
      expect(data.keywords.length).toBeGreaterThan(0);
      expect(data.keywords[0]).toHaveProperty('term');
      expect(data.keywords[0]).toHaveProperty('relevance');
      expect(data.keywords[0]).toHaveProperty('searchVolume');
    });

    it('should use default locale if not provided', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords?industry=marketing'
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.locale).toBe('en-US');
      expect(data.keywords).toBeInstanceOf(Array);
    });

    it('should handle different industries', async () => {
      const industries = [
        'software',
        'design',
        'consulting',
        'education',
        'finance',
      ];

      for (const industry of industries) {
        mockRequest = new NextRequest(
          `http://localhost:3000/api/v1/geo/keywords?locale=en-US&industry=${industry}`
        );

        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.industry).toBe(industry);
        expect(data.keywords).toBeInstanceOf(Array);
      }
    });

    it('should return trending keywords', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords?locale=es-MX&industry=software&trending=true'
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('trending');
      expect(data.trending).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/geo/keywords', () => {
    it('should extract keywords from content', async () => {
      const requestBody = {
        content:
          'Experienced Full Stack Developer with expertise in ReNode.js, and AWS',
        locale: 'en-US',
        extractionOptions: {
          maxKeywords: 10,
          includeNgrams: true,
        },
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('extractedKeywords');
      expect(data.extractedKeywords).toBeInstanceOf(Array);
      expect(data.extractedKeywords.length).toBeLessThanOrEqual(10);
      expect(data.extractedKeywords[0]).toHaveProperty('keyword');
      expect(data.extractedKeywords[0]).toHaveProperty('frequency');
      expect(data.extractedKeywords[0]).toHaveProperty('relevance');
    });

    it('should validate request body', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should localize extracted keywords', async () => {
      const requestBody = {
        content: 'Software Engineer with cloud computing experience',
        locale: 'es-MX',
        extractionOptions: {
          localize: true,
        },
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.extractedKeywords).toBeInstanceOf(Array);
      expect(data.extractedKeywords[0]).toHaveProperty('localizedKeyword');
    });

    it('should handle different content types', async () => {
      const contentTypes = [
        { type: 'bio', content: 'Senior developer with 10 years experience' },
        {
          type: 'project',
          content: 'Built scalable e-commerce platform using microservices',
        },
        {
          type: 'skills',
          content: 'JavaScript, Python, Docker, Kubernetes, AWS',
        },
      ];

      for (const { type, content } of contentTypes) {
        const requestBody = {
          content,
          contentType: type,
          locale: 'en-US',
        };

        mockRequest = new NextRequest(
          'http://localhost:3000/api/v1/geo/keywords',
          {
            method: 'POST',
            body: JSON.stringify(requestBody),
          }
        );

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.contentType).toBe(type);
        expect(data.extractedKeywords).toBeInstanceOf(Array);
      }
    });
  });

  describe('Keyword Suggestions', () => {
    it('should provide keyword suggestions based on partial input', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords?suggest=true&q=react&locale=en-US'
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('suggestions');
      expect(data.suggestions).toBeInstanceOf(Array);
      expect(
        data.suggestions.every((s: any) =>
          s.keyword.toLowerCase().includes('react')
        )
      ).toBe(true);
    });

    it('should limit suggestion results', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords?suggest=true&q=dev&locale=en-US&limit=5'
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.suggestions).toBeInstanceOf(Array);
      expect(data.suggestions.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid locale format', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords?locale=invalid&industry=software'
      );

      const response = await GET(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should handle missing required parameters in POST', async () => {
      const requestBody = {
        // Missing content
        locale: 'en-US',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
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

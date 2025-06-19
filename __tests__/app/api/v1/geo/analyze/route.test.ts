import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/geo/analyze/route';

// Mock dependencies
jest.mock('@/lib/services/error/error-logger');
jest.mock('@/lib/services/error/api-error-handler');

describe('/api/v1/geo/analyze', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/geo/analyze', () => {
    it('should analyze geo location from request headers', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/analyze',
        {
          headers: {
            'x-forwarded-for': '8.8.8.8',
            'accept-language': 'es-MX,es;q=0.9,en;q=0.8',
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('location');
      expect(data).toHaveProperty('language');
      expect(data).toHaveProperty('currency');
      expect(data).toHaveProperty('keywords');
    });

    it('should handle missing headers gracefully', async () => {
      mockRequest = new NextRequest('http://localhost:3000/api/v1/geo/analyze');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.location.country).toBe('Unknown');
      expect(data.language.primary).toBe('en');
      expect(data.currency.code).toBe('USD');
    });

    it('should detect Spanish-speaking countries', async () => {
      mockRequest = new NextRequest(
      'http://localhost:3000/api/v1/geo/analyze',
        {
          headers: {
            'x-forwarded-for': '189.203.10.123', // Mexico IP
            'accept-language': 'es-MX,es;q=0.9',
          },
        }
    );

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.language.primary).toBe('es');
      expect(data.currency.code).toBe('MXN');
    });
  });

  describe('POST /api/v1/geo/analyze', () => {
    it('should analyze content for geo optimization', async () => {
      const requestBody = {
        content: 'Senior Software Engineer with 10 years of experience',
        targetLocale: 'es-MX',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/analyze',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('analysis');
      expect(data.analysis).toHaveProperty('language');
      expect(data.analysis).toHaveProperty('culturalRelevance');
      expect(data.analysis).toHaveProperty('suggestions');
    });

    it('should validate request body', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/analyze',
        {
          method: 'POST',
          body: JSON.stringify({}),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should handle different target locales', async () => {
      const locales = ['en-US', 'es-ES', 'pt-BR', 'fr-FR'];

      for (const locale of locales) {
        const requestBody = {
          content: 'Professional with international experience',
          targetLocale: locale,
        };

        mockRequest = new NextRequest(
          'http://localhost:3000/api/v1/geo/analyze',
          {
            method: 'POST',
            body: JSON.stringify(requestBody),
          }
        );

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.analysis.targetLocale).toBe(locale);
      }
    });

    it('should provide keyword suggestions based on locale', async () => {
      const requestBody = {
        content: 'Full Stack Developer specializing in React and Node.js',
        targetLocale: 'es-MX',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/analyze',
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.analysis.suggestions).toBeInstanceOf(Array);
      expect(data.analysis.suggestions.length).toBeGreaterThan(0);
      expect(data.analysis.suggestions[0]).toHaveProperty('original');
      expect(data.analysis.suggestions[0]).toHaveProperty('localized');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in POST request', async () => {
      mockRequest = new NextRequest(
      'http://localhost:3000/api/v1/geo/analyze',
        {
          method: 'POST',
          body: 'invalid json',
        }
    );

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should handle server errors gracefully', async () => {
      // Mock an internal error
      jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
        throw new Error('Internal server error');
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/analyze',
        {
          method: 'POST',
          body: JSON.stringify({ content: 'test', targetLocale: 'en-US' }),
        }
      );

      const response = await POST(mockRequest);

      expect(response.status).toBe(500);
    });
  });
});

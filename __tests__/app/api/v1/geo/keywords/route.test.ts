import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/geo/keywords/route';


// Mock dependencies
jest.mock('@/lib/services/error/error-logger');
jest.mock('@/lib/services/error/api-error-handler');

// Mock Supabase to return authenticated user
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
        error: null,
      }),
    },
  })),
}));

// Mock GEO service
jest.mock('@/lib/ai/geo/geo-service', () => ({
  getGEOService: jest.fn(() => ({
    researchKeywords: jest.fn().mockResolvedValue([
      {
        keyword: 'software developer',
        searchVolume: 12000,
        difficulty: 65,
        trends: 'rising',
        relatedKeywords: [
          'web developer',
          'full stack developer',
          'software engineer',
        ],
        questions: [
          'What does a software developer do?',
          'How to become a software developer?',
        ],
      },
    ]),
  })),
}));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('/api/v1/geo/keywords', () => {
  let mockRequest: NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/geo/keywords', () => {
    it('should return trending keywords for industry', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords?industry=technology'

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('industry', 'technology');
      expect(data.data).toHaveProperty('trending');
      expect(data.data.trending).toBeInstanceOf(Array);
      expect(data.data.trending.length).toBeGreaterThan(0);
    });

    it('should default to technology industry if not provided', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords'

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('industry', 'technology');
      expect(data.data).toHaveProperty('trending');
      expect(data.data.trending).toBeInstanceOf(Array);
    });

    it('should handle different industries', async () => {
      const industries = ['technology', 'design', 'marketing', 'business'];

      for (const industry of industries) {
        mockRequest = new NextRequest(
          `http://localhost:3000/api/v1/geo/keywords?industry=${industry}`

        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('success', true);
        expect(data.data).toHaveProperty('industry', industry);
        expect(data.data).toHaveProperty('trending');
        expect(data.data.trending).toBeInstanceOf(Array);
      }
    });

    it('should return categories and tips', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords?industry=technology'

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('categories');
      expect(data.data).toHaveProperty('tips');
      expect(data.data.categories).toBeInstanceOf(Object);
      expect(data.data.tips).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/v1/geo/keywords', () => {
    it('should research keywords from seed keyword', async () => {
      const requestBody = {
        seedKeyword: 'full stack developer',
        industry: 'technology',
        contentType: 'bio',
        location: 'San Francisco',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('primaryKeyword');
      expect(data.data).toHaveProperty('relatedKeywords');
      expect(data.data).toHaveProperty('variations');
      expect(data.data).toHaveProperty('longTailKeywords');
      expect(data.data.variations).toBeInstanceOf(Array);
      expect(data.data.longTailKeywords).toBeInstanceOf(Array);
    });

    it('should validate request body', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Missing required seedKeyword
        }

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should handle location-based keywords', async () => {
      const requestBody = {
        seedKeyword: 'software engineer',
        location: 'New York',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('locationBased');
      expect(data.data.locationBased).toBeInstanceOf(Array);
      expect(data.data.locationBased.length).toBeGreaterThan(0);
    });

    it('should handle industry-specific keywords', async () => {
      const requestBody = {
        seedKeyword: 'consultant',
        industry: 'business',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success', true);
      expect(data.data).toHaveProperty('industrySpecific');
      expect(data.data.industrySpecific).toBeInstanceOf(Array);
      expect(data.data.industrySpecific.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing required parameters in POST', async () => {
      const requestBody = {
        // Missing seedKeyword
        industry: 'technology',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });

    it('should handle seed keyword too short', async () => {
      const requestBody = {
        seedKeyword: 'a', // Too short (less than 2 characters)
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/geo/keywords',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }

      const response = await POST(mockRequest);

      expect(response.status).toBe(400);
    });
  });
});

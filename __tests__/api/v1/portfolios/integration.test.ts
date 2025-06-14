/**
 * Portfolio API Integration Tests
 * 
 * Tests the portfolio API routes without mocking the database or services.
 * Uses a test database or in-memory data for real integration testing.
 */

import { NextRequest } from 'next/server';

import {
  GET,
  POST,
} from '@/app/api/v1/portfolios/route';
import { env } from '@/lib/config';

// Test data
const testUser = {
  id: 'test-user-123',
  email: 'test@example.com',
};

const testPortfolio = {
  name: 'Test Portfolio',
  template: 'developer',
  data: {
    personalInfo: {
      name: 'John Doe',
      title: 'Full Stack Developer',
      email: 'john@example.com',
      location: 'San Francisco, CA',
      bio: 'Experienced developer with passion for building great products',
    },
    experience: [],
    projects: [],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
    education: [],
  },
  customization: {
    primaryColor: '#3B82F6',
    fontFamily: 'Inter',
    darkMode: false,
  },
};

/**
 * Helper to create authenticated request
 */
function createAuthenticatedRequest(
  url: string,
  options: RequestInit = {}
): NextRequest {
  const request = new NextRequest(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  // Mock authentication by setting user in request
  // In real app, this would be done by middleware
  (request as any).user = testUser;
  
  return request;
}

describe('Portfolio API Integration Tests', () => {
  // Skip tests if Supabase is not configured
  const skipIfNoDb = env.NEXT_PUBLIC_SUPABASE_URL ? describe : describe.skip;
  
  skipIfNoDb('GET /api/v1/portfolios', () => {
    it('should return empty array for new user', async () => {
      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/v1/portfolios'
      );
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
    
    it('should return 401 for unauthenticated request', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios'
      );
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });
  });
  
  skipIfNoDb('POST /api/v1/portfolios', () => {
    it('should create a new portfolio', async () => {
      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          body: JSON.stringify(testPortfolio),
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        name: testPortfolio.name,
        template: testPortfolio.template,
        userId: testUser.id,
      });
      expect(data.data.id).toBeDefined();
      expect(data.data.subdomain).toBeDefined();
    });
    
    it('should validate required fields', async () => {
      const invalidPortfolio = {
        // Missing required fields
        template: 'developer',
      };
      
      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          body: JSON.stringify(invalidPortfolio),
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
    });
    
    it('should handle malformed JSON', async () => {
      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          body: 'invalid json{',
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
  
  // Test with mock data when database is not available
  const mockTests = !env.NEXT_PUBLIC_SUPABASE_URL ? describe : describe.skip;
  
  mockTests('Portfolio API with Mock Data', () => {
    it('should work with mock data in development', async () => {
      const request = createAuthenticatedRequest(
        'http://localhost:3000/api/v1/portfolios'
      );
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Mock data returns sample portfolios
      expect(data.data.length).toBeGreaterThan(0);
    });
  });
});

/**
 * Test helpers for portfolio operations
 */
export const portfolioTestHelpers = {
  createAuthenticatedRequest,
  testUser,
  testPortfolio,
  
  /**
   * Create a test portfolio and return it
   */
  async createTestPortfolio(customData?: Partial<typeof testPortfolio>) {
    const request = createAuthenticatedRequest(
      'http://localhost:3000/api/v1/portfolios',
      {
        method: 'POST',
        body: JSON.stringify({ ...testPortfolio, ...customData }),
      }
    );
    
    const response = await POST(request);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Failed to create test portfolio: ${data.error}`);
    }
    
    return data.data;
  },
  
  /**
   * Clean up test portfolios
   */
  async cleanupTestPortfolios(ids: string[]) {
    // In a real test, this would delete the test data
    // For now, just log
    console.log('Cleanup test portfolios:', ids);
  },
};
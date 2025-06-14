/**
 * Bio Enhancement API Integration Tests
 * 
 * Tests the AI bio enhancement endpoint with real service integration
 * when API keys are available, or with predictable mocks when not.
 */

import { NextRequest } from 'next/server';

import { POST } from '@/app/api/v1/ai/enhance-bio/route';
import { env, services } from '@/lib/config';

// Test data
const testBioContext = {
  currentBio: 'I am a software developer.',
  profession: 'Full Stack Developer',
  experience: '5 years',
  skills: ['JavaScript', 'React', 'Node.js', 'Python'],
  tone: 'professional' as const,
};

describe('Bio Enhancement API Integration Tests', () => {
  // Skip tests if HuggingFace API is not configured
  const skipIfNoAI = services.huggingface ? describe : describe.skip;
  
  skipIfNoAI('POST /api/v1/ai/enhance-bio with real AI', () => {
    it('should enhance a bio successfully', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: JSON.stringify(testBioContext),
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        enhancedBio: expect.any(String),
        confidence: expect.any(Number),
        wordCount: expect.any(Number),
      });
      
      // Enhanced bio should be longer than original
      expect(data.data.enhancedBio.length).toBeGreaterThan(
        testBioContext.currentBio.length
      );
      
      // Should respect word limit (150 words)
      expect(data.data.wordCount).toBeLessThanOrEqual(150);
      
      // Confidence should be between 0 and 1
      expect(data.data.confidence).toBeGreaterThanOrEqual(0);
      expect(data.data.confidence).toBeLessThanOrEqual(1);
    }, 30000); // Longer timeout for AI processing
    
    it('should handle rate limiting gracefully', async () => {
      // Make multiple requests quickly
      const requests = Array(5).fill(null).map(() => 
        new NextRequest(
          'http://localhost:3000/api/v1/ai/enhance-bio',
          {
            method: 'POST',
            body: JSON.stringify(testBioContext),
          }
        )
      );
      
      const responses = await Promise.all(
        requests.map(req => POST(req))
      );
      
      // At least one should succeed
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
      
      // Some might be rate limited
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      if (rateLimitedCount > 0) {
        const rateLimitedResponse = responses.find(r => r.status === 429);
        const data = await rateLimitedResponse!.json();
        expect(data.error).toContain('rate limit');
      }
    });
  });
  
  describe('POST /api/v1/ai/enhance-bio validation', () => {
    it('should validate required fields', async () => {
      const invalidContext = {
        // Missing required currentBio
        profession: 'Developer',
      };
      
      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: JSON.stringify(invalidContext),
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Validation failed');
    });
    
    it('should validate bio length limits', async () => {
      const longBio = 'word '.repeat(1000); // 1000 words
      
      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: JSON.stringify({
            ...testBioContext,
            currentBio: longBio,
          }),
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
    
    it('should validate tone options', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: JSON.stringify({
            ...testBioContext,
            tone: 'invalid-tone',
          }),
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
  
  // Test with demo mode when AI is not available
  const demoTests = !services.huggingface ? describe : describe.skip;
  
  demoTests('Bio Enhancement API in Demo Mode', () => {
    it('should return predictable demo response', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: JSON.stringify(testBioContext),
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.enhancedBio).toContain('software developer');
      expect(data.data.confidence).toBeCloseTo(0.95, 2);
    });
  });
  
  describe('Error handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: 'not valid json{',
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.data.code).toBe('SYNTAX_ERROR');
    });
    
    it('should handle empty request body', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          body: '',
        }
      );
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });
});

/**
 * Test helpers for AI operations
 */
export const aiTestHelpers = {
  testBioContext,
  
  /**
   * Create a test request for bio enhancement
   */
  createBioEnhancementRequest(context?: Partial<typeof testBioContext>) {
    return new NextRequest(
      'http://localhost:3000/api/v1/ai/enhance-bio',
      {
        method: 'POST',
        body: JSON.stringify({ ...testBioContext, ...context }),
      }
    );
  },
  
  /**
   * Test if response contains enhanced content
   */
  validateEnhancedBioResponse(data: any) {
    expect(data.enhancedBio).toBeDefined();
    expect(typeof data.enhancedBio).toBe('string');
    expect(data.enhancedBio.length).toBeGreaterThan(10);
    
    expect(data.confidence).toBeDefined();
    expect(typeof data.confidence).toBe('number');
    expect(data.confidence).toBeGreaterThanOrEqual(0);
    expect(data.confidence).toBeLessThanOrEqual(1);
    
    expect(data.wordCount).toBeDefined();
    expect(typeof data.wordCount).toBe('number');
    expect(data.wordCount).toBeGreaterThan(0);
    expect(data.wordCount).toBeLessThanOrEqual(150);
  },
};
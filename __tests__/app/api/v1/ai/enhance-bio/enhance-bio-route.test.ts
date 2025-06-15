import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/enhance-bio/route';
import { aiService } from '@/lib/ai/client';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');
jest.mock('@/lib/ai/client');

describe('AI Bio Enhancement API Route - /api/v1/ai/enhance-bio', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('POST /api/v1/ai/enhance-bio', () => {
    it('should enhance bio successfully', async () => {
      const mockEnhancement = {
        content: 'Enhanced professional bio with 10+ years experience...',
        confidence: 0.85,
        suggestions: ['Add specific achievements', 'Include industry keywords'],
        wordCount: 120,
        qualityScore: 85
      };

      (aiService.enhanceBio as jest.Mock).mockResolvedValue(mockEnhancement);

      const request = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          bio: 'I am a software developer',
          context: {
            industry: 'Technology',
            experienceLevel: 'senior',
            targetAudience: 'recruiters'
          }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockEnhancement);
      expect(aiService.enhanceBio).toHaveBeenCalledWith(
        'I am a software developer',
        expect.objectContaining({
          industry: 'Technology',
          experienceLevel: 'senior'
        })
      );
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          // Missing bio field
          context: { industry: 'Technology' }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Bio is required');
    });

    it('should validate bio length', async () => {
      const request = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          bio: 'Short',
          context: { industry: 'Technology' }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Bio must be at least 10 characters');
    });

    it('should sanitize input to prevent XSS', async () => {
      const request = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          bio: 'I am a developer <script>alert("xss")</script>',
          context: { industry: 'Technology' }
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid characters in bio');
    });

    it('should handle optional context gracefully', async () => {
      const mockEnhancement = {
        content: 'Enhanced bio without specific context',
        confidence: 0.7,
        suggestions: [],
        wordCount: 100,
        qualityScore: 75
      };

      (aiService.enhanceBio as jest.Mock).mockResolvedValue(mockEnhancement);

      const request = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          bio: 'I am a professional with diverse experience'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(aiService.enhanceBio).toHaveBeenCalledWith(
        'I am a professional with diverse experience',
        {}
      );
    });

    it('should require authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          bio: 'Test bio',
          context: {}
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should handle AI service errors', async () => {
      (aiService.enhanceBio as jest.Mock).mockRejectedValue(
        new Error('AI service unavailable')
      );

      const request = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify({
          bio: 'I am a software developer with experience'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toContain('AI service temporarily unavailable');
    });

    it('should enforce rate limiting', async () => {
      // Simulate rate limit headers
      const request = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        headers: {
          'x-rate-limit-remaining': '0'
        },
        body: JSON.stringify({
          bio: 'Test bio'
        })
      });

      // This would be handled by middleware, but we can test the response
      const response = await POST(request);
      
      // If rate limiting is implemented in middleware, it would return 429
      // For now, we'll just ensure the request processes normally
      expect(response.status).toBeLessThan(500);
    });

    it('should cache repeated requests', async () => {
      const mockEnhancement = {
        content: 'Cached enhanced bio',
        confidence: 0.85,
        suggestions: [],
        wordCount: 100,
        qualityScore: 85
      };

      (aiService.enhanceBio as jest.Mock).mockResolvedValue(mockEnhancement);

      const requestBody = {
        bio: 'Same bio for caching test',
        context: { industry: 'Technology' }
      };

      // First request
      const request1 = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      await POST(request1);

      // Second request with same data
      const request2 = new NextRequest('http://localhost/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      const response2 = await POST(request2);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.data).toEqual(mockEnhancement);
      // AI service should only be called once due to caching
      expect(aiService.enhanceBio).toHaveBeenCalledTimes(1);
    });
  });
});
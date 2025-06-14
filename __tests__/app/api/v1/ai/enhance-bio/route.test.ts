import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/enhance-bio/route';
import { createSupabaseServerClient } from '@/lib/auth/supabase-server';
import { aiClient } from '@/lib/ai/client';

// Mock dependencies
jest.mock('@/lib/auth/supabase-server');
jest.mock('@/lib/ai/client');
jest.mock('@/lib/utils/logger');

describe('AI Enhance Bio API Route', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
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

  describe('POST /api/v1/ai/enhance-bio', () => {
    const validRequest = {
      currentBio: 'I am a software developer with experience in web development.',
      experience: '5 years of professional experience',
      skills: ['JavaScript', 'React', 'Node.js', 'Python'],
      achievements: [
        'Built a scalable e-commerce platform',
        'Led a team of 3 developers',
      ],
    };

    const mockEnhancedResult = {
      enhancedBio: 'Experienced software developer with 5 years of expertise in web development, specializing in JavaScript, React, Node.js, and Python. Successfully built a scalable e-commerce platform and led a team of 3 developers to deliver high-impact solutions.',
      qualityScore: 85,
      improvements: [
        'Added specific years of experience',
        'Highlighted key technologies',
        'Emphasized leadership experience',
      ],
      wordCount: 45,
    };

    it('should enhance bio successfully when authenticated', async () => {
      (aiClient.enhanceBio as jest.Mock).mockResolvedValue(mockEnhancedResult);

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(validRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data).toEqual(mockEnhancedResult);
      expect(aiClient.enhanceBio).toHaveBeenCalledWith(validRequest);
    });

    it('should return 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(validRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Unauthorized');
    });

    it('should validate required fields', async () => {
      const invalidRequest = {
        // Missing currentBio
        experience: '5 years',
        skills: ['JavaScript'],
        achievements: [],
      };

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(invalidRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('currentBio');
    });

    it('should validate data types', async () => {
      const invalidTypes = {
        currentBio: 'Valid bio',
        experience: 'Valid experience',
        skills: 'not-an-array', // Should be array
        achievements: ['Valid achievement'],
      };

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(invalidTypes),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('skills');
    });

    it('should handle empty bio gracefully', async () => {
      const emptyBioRequest = {
        currentBio: '',
        experience: 'Some experience',
        skills: ['JavaScript'],
        achievements: [],
      };

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(emptyBioRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Bio cannot be empty');
    });

    it('should handle AI service errors', async () => {
      (aiClient.enhanceBio as jest.Mock).mockRejectedValue(
        new Error('AI service unavailable')
      );

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(validRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('error');
      expect(data.message).toBe('AI service temporarily unavailable');
    });

    it('should handle rate limiting', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      
      (aiClient.enhanceBio as jest.Mock).mockRejectedValue(rateLimitError);

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(validRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.status).toBe('error');
      expect(data.message).toContain('rate limit');
    });

    it('should include quality metrics in response', async () => {
      (aiClient.enhanceBio as jest.Mock).mockResolvedValue(mockEnhancedResult);

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(validRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.qualityScore).toBeDefined();
      expect(data.data.wordCount).toBeDefined();
      expect(data.data.improvements).toBeDefined();
      expect(Array.isArray(data.data.improvements)).toBe(true);
    });

    it('should sanitize output for security', async () => {
      const maliciousResult = {
        enhancedBio: 'Great developer <script>alert("XSS")</script> with experience',
        qualityScore: 80,
        improvements: [],
        wordCount: 10,
      };

      (aiClient.enhanceBio as jest.Mock).mockResolvedValue(maliciousResult);

      const request = new NextRequest('http://localhost:3000/api/v1/ai/enhance-bio', {
        method: 'POST',
        body: JSON.stringify(validRequest),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.enhancedBio).not.toContain('<script>');
      expect(data.data.enhancedBio).not.toContain('</script>');
    });
  });
});
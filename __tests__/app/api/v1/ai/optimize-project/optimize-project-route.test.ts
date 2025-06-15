import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/ai/optimize-project/route';
import { aiService } from '@/lib/ai/client';
import { getServerSession } from 'next-auth';

jest.mock('next-auth');
jest.mock('@/lib/ai/client');

describe('AI Project Optimization API Route - /api/v1/ai/optimize-project', () => {
  const mockSession = {
    user: { id: 'user-123', email: 'test@example.com' }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('POST /api/v1/ai/optimize-project', () => {
    it('should optimize project description successfully', async () => {
      const mockOptimization = {
        original: 'Built a web app',
        enhanced: 'Developed a scalable web application serving 10K+ users...',
        keyAchievements: [
          'Reduced load time by 40%',
          'Implemented CI/CD pipeline',
          'Led team of 5 developers'
        ],
        technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
        impactMetrics: [
          { metric: 'User Growth', value: '300%', period: '6 months' },
          { metric: 'Performance', value: '40% faster', period: 'after optimization' }
        ],
        confidence: 0.9
      };

      (aiService.optimizeProjectDescription as jest.Mock).mockResolvedValue(mockOptimization);

      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Built a web app',
          skills: ['JavaScript', 'React'],
          industryContext: 'Technology'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockOptimization);
      expect(aiService.optimizeProjectDescription).toHaveBeenCalledWith(
        'Built a web app',
        ['JavaScript', 'React'],
        'Technology'
      );
    });

    it('should validate required description field', async () => {
      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          skills: ['JavaScript']
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Description is required');
    });

    it('should validate description length', async () => {
      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Too short',
          skills: []
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Description must be at least 20 characters');
    });

    it('should handle long descriptions', async () => {
      const longDescription = 'A'.repeat(2001);
      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          description: longDescription,
          skills: []
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Description must not exceed 2000 characters');
    });

    it('should sanitize skills array', async () => {
      const mockOptimization = {
        enhanced: 'Optimized description',
        keyAchievements: [],
        technologies: ['JavaScript'],
        impactMetrics: [],
        confidence: 0.8
      };

      (aiService.optimizeProjectDescription as jest.Mock).mockResolvedValue(mockOptimization);

      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Built a secure web application with modern tech stack',
          skills: ['JavaScript', '<script>alert("xss")</script>', 'React']
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Ensure malicious skill was filtered out
      expect(aiService.optimizeProjectDescription).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['JavaScript', 'React']),
        undefined
      );
    });

    it('should handle optional industry context', async () => {
      const mockOptimization = {
        enhanced: 'Generic optimized description',
        keyAchievements: [],
        technologies: [],
        impactMetrics: [],
        confidence: 0.7
      };

      (aiService.optimizeProjectDescription as jest.Mock).mockResolvedValue(mockOptimization);

      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Created an innovative solution for business problems',
          skills: ['Problem Solving', 'Leadership']
          // No industryContext provided
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(aiService.optimizeProjectDescription).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array),
        undefined
      );
    });

    it('should require authentication', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Test project description',
          skills: []
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toContain('Unauthorized');
    });

    it('should handle AI service quota exceeded', async () => {
      const quotaError = new Error('Quota exceeded');
      quotaError.name = 'QuotaExceededError';
      (aiService.optimizeProjectDescription as jest.Mock).mockRejectedValue(quotaError);

      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Built a comprehensive project management system',
          skills: ['Project Management', 'Agile']
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain('AI service quota exceeded');
    });

    it('should validate skills array format', async () => {
      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Valid description for a project',
          skills: 'not-an-array' // Invalid format
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Skills must be an array');
    });

    it('should limit skills array size', async () => {
      const tooManySkills = Array(51).fill('Skill');
      const request = new NextRequest('http://localhost/api/v1/ai/optimize-project', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Project with too many skills listed',
          skills: tooManySkills
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Maximum 50 skills allowed');
    });
  });
});
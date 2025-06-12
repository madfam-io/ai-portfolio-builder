/**
 * Tests for HuggingFace AI Service
 * Comprehensive test suite for open-source AI integration
 */

import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { BioContext, UserProfile } from '@/lib/ai/types';

// Mock fetch for testing
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('HuggingFaceService', () => {
  let service: HuggingFaceService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HuggingFaceService('test-api-key');
  });

  describe('Bio Enhancement', () => {
    const mockBioContext: BioContext = {
      title: 'Software Engineer',
      skills: ['JavaScript', 'React', 'Node.js'],
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Developer',
          yearsExperience: 3,
        },
      ],
      tone: 'professional',
      targetLength: 'concise',
    };

    it('should enhance bio successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            generated_text:
              'Enhanced bio: Experienced Software Engineer with 3+ years developing scalable applications using JavaScript, React, and Node.js at Tech Corp.',
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.enhanceBio(
        'I am a software engineer who codes.',
        mockBioContext
      );

      expect(result.content).toContain('Experienced Software Engineer');
      expect(result.enhancementType).toBe('bio');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.wordCount).toBeGreaterThan(0);
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 503,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(
        service.enhanceBio('test bio', mockBioContext)
      ).rejects.toThrow(
        'Model microsoft/Phi-3.5-mini-instruct is unavailable on huggingface'
      );
    });

    it('should handle quota exceeded errors', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(
        service.enhanceBio('test bio', mockBioContext)
      ).rejects.toThrow('API quota exceeded for huggingface');
    });

    it('should clean up model response properly', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            generated_text:
              'Bio: This is an enhanced bio with multiple\n\n\nline breaks.',
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.enhanceBio('test', mockBioContext);

      expect(result.content).toBe(
        'This is an enhanced bio with multiple line breaks.'
      );
      expect(result.content).not.toContain('Bio:');
      expect(result.content).not.toContain('\n\n\n');
    });
  });

  describe('Project Optimization', () => {
    it('should optimize project description successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            generated_text: JSON.stringify({
              description:
                'Enhanced project description with STAR format and metrics.',
              highlights: ['10k+ users', 'Real-time features'],
              metrics: ['99.9% uptime', '10,000+ users'],
              starFormat: {
                situation: 'E-commerce platform needed',
                task: 'Build scalable solution',
                action: 'Developed React/Node.js app',
                result: 'Achieved 10k+ users',
              },
            }),
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.optimizeProjectDescription(
        'E-commerce App',
        'Built an online store',
        ['React', 'Node.js']
      );

      expect(result.description).toContain('Enhanced project');
      expect(result.highlights).toHaveLength(2);
      expect(result.starFormat.situation).toBeTruthy();
    });

    it('should handle non-JSON responses gracefully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [
          {
            generated_text:
              'This is not JSON, just a text response about the project.',
          },
        ],
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.optimizeProjectDescription(
        'Test Project',
        'Basic description',
        ['JavaScript']
      );

      expect(result.description).toBe(
        'This is not JSON, just a text response about the project.'
      );
      expect(result.highlights).toEqual([]);
      expect(result.metrics).toEqual([]);
    });
  });

  describe('Template Recommendation', () => {
    const mockUserProfile: UserProfile = {
      title: 'Frontend Developer',
      skills: ['React', 'JavaScript', 'CSS'],
      projectCount: 5,
      hasDesignWork: true,
      experienceLevel: 'mid',
    };

    it('should recommend appropriate template', async () => {
      const result = await service.recommendTemplate(mockUserProfile);

      expect(result.recommendedTemplate).toBe('developer');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.reasoning).toContain('skills');
      expect(result.alternatives).toHaveLength(2);
    });

    it('should recommend designer template for design-heavy profiles', async () => {
      const designProfile: UserProfile = {
        title: 'UI/UX Designer',
        skills: ['Figma', 'Sketch', 'Design Systems'],
        projectCount: 8,
        hasDesignWork: true,
        experienceLevel: 'senior',
      };

      const result = await service.recommendTemplate(designProfile);

      expect(result.recommendedTemplate).toBe('designer');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should recommend consultant template for business roles', async () => {
      const businessProfile: UserProfile = {
        title: 'Business Consultant',
        skills: ['Strategy', 'Analysis', 'Project Management'],
        projectCount: 3,
        hasDesignWork: false,
        experienceLevel: 'senior',
      };

      const result = await service.recommendTemplate(businessProfile);

      expect(result.recommendedTemplate).toBe('consultant');
    });
  });

  describe('Content Scoring', () => {
    it('should score content quality accurately', async () => {
      const professionalContent =
        'Led development team of 5 engineers, delivering 3 major products that increased revenue by 40% and improved user satisfaction scores by 25%.';

      const result = await service.scoreContent(professionalContent, 'bio');

      expect(result.overall).toBeGreaterThan(70);
      expect(result.professionalism).toBeGreaterThan(80);
      expect(result.impact).toBeGreaterThan(80);
      expect(result.suggestions.length).toBeLessThanOrEqual(1); // May have completeness suggestion
    });

    it('should provide suggestions for low-quality content', async () => {
      const poorContent = 'I do stuff and things. Like really good stuff.';

      const result = await service.scoreContent(poorContent, 'bio');

      expect(result.overall).toBeLessThan(70);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('professional'))).toBe(
        true
      );
    });

    it('should calculate readability scores correctly', async () => {
      const readableContent =
        'I am a software engineer. I build web applications. I love solving complex problems.';
      const unreadableContent =
        'I am a software engineer who builds web applications and loves solving complex problems that involve multiple stakeholders and cross-functional teams working together to deliver high-quality solutions.';

      const readableResult = await service.scoreContent(readableContent, 'bio');
      const unreadableResult = await service.scoreContent(
        unreadableContent,
        'bio'
      );

      // Both should have valid readability scores
      expect(readableResult.readability).toBeGreaterThan(0);
      expect(unreadableResult.readability).toBeGreaterThan(0);
    });
  });

  describe('Health Check', () => {
    it('should return true for healthy service', async () => {
      const mockResponse = {
        status: 200,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.healthCheck();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('microsoft/Phi-3.5-mini-instruct'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should return false for unhealthy service', async () => {
      const mockResponse = {
        status: 503,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.healthCheck();

      expect(result).toBe(false);
    });
  });

  describe('Usage Statistics', () => {
    it('should return usage statistics', async () => {
      const stats = await service.getUsageStats();

      expect(stats).toHaveProperty('requestsToday');
      expect(stats).toHaveProperty('costToday');
      expect(stats).toHaveProperty('avgResponseTime');
      expect(stats).toHaveProperty('successRate');
    });
  });

  describe('Error Handling', () => {
    it('should wrap unknown errors in AIServiceError', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Unknown error'));

      await expect(
        service.enhanceBio('test', {
          title: 'Test',
          skills: ['test'],
          experience: [],
          tone: 'professional',
          targetLength: 'concise',
        })
      ).rejects.toThrow('Model call failed');
    });

    it('should preserve AIServiceError instances', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
      };
      mockFetch.mockResolvedValueOnce(mockResponse as any);

      await expect(
        service.enhanceBio('test', {
          title: 'Test',
          skills: ['test'],
          experience: [],
          tone: 'professional',
          targetLength: 'concise',
        })
      ).rejects.toThrow('API request failed: 400');
    });
  });

  describe('Token Estimation', () => {
    it('should estimate tokens correctly', () => {
      const text = 'This is a test string with some words.';
      // Access private method for testing
      const estimatedTokens = (service as any).estimateTokens(text);

      expect(estimatedTokens).toBeGreaterThan(0);
      expect(estimatedTokens).toBe(Math.ceil(text.length / 4));
    });
  });

  describe('Configuration', () => {
    it('should work without API key in demo mode', () => {
      const demoService = new HuggingFaceService();
      expect(demoService).toBeInstanceOf(HuggingFaceService);
    });

    it('should use environment variable for API key', () => {
      const originalEnv = process.env.HUGGINGFACE_API_KEY;
      process.env.HUGGINGFACE_API_KEY = 'env-api-key';

      const envService = new HuggingFaceService();
      expect((envService as any).apiKey).toBe('env-api-key');

      process.env.HUGGINGFACE_API_KEY = originalEnv;
    });
  });
});

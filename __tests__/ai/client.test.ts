import { AIClient, AIClientError, AIUtils } from '@/lib/ai/client';
import { BioContext, UserProfile } from '@/lib/ai/types';

/**
 * Tests for AI Client
 * Tests the frontend client for AI operations
 */

// Mock fetch for testing
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('AIClient', () => {
  let client: AIClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new AIClient({ timeout: 5000, retries: 2 });
  });

  describe('Bio Enhancement', () => {
    const mockBioContext: BioContext = {
      title: 'Software Engineer',
      skills: ['JavaScript', 'React'],
      experience: [],
      tone: 'professional',
      targetLength: 'concise',
    };

    it('should enhance bio successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            content: 'Enhanced bio content',
            confidence: 0.85,
            suggestions: [],
            wordCount: 15,
            qualityScore: 85,
            enhancementType: 'bio',
          },
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as unknown);

      const result = await client.enhanceBio('Original bio', mockBioContext);

      expect(result.content).toBe('Enhanced bio content');
      expect(result.confidence).toBe(0.85);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai/enhance-bio',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"bio":"Original bio"'),
        })
      );
    });

    it('should handle authentication errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Authentication required' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as unknown);

      await expect(client.enhanceBio('test', mockBioContext)).rejects.toThrow(
        'Authentication required'
      );
    });

    it('should handle rate limiting', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        json: jest.fn().mockResolvedValue({ error: 'Rate limit exceeded' }),
        headers: new Map(),
        url: 'http://test.com',
        body: null,
        bodyUsed: false,
        clone: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(),
        blob: jest.fn(),
        arrayBuffer: jest.fn(),
      };

      mockFetch.mockImplementation(() =>
        Promise.resolve(mockResponse as unknown)
      );

      await expect(client.enhanceBio('test', mockBioContext)).rejects.toThrow(
        'Rate limit exceeded'
      );
    });
  });

  describe('Project Optimization', () => {
    it('should optimize project successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            original: 'Built an online store',
            enhanced: 'Enhanced description',
            keyAchievements: ['10k+ users'],
            technologies: ['React', 'Node.js'],
            impactMetrics: ['99.9% uptime'],
            confidence: 0.95,
          },
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as unknown);

      const result = await client.optimizeProject(
        'Built an online store',
        ['React', 'Node.js'],
        'E-commerce Platform'
      );

      expect(result.enhanced).toBe('Enhanced description');
      expect(result.keyAchievements).toContain('10k+ users');
    });

    it('should handle batch optimization', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            results: [
              {
                success: true,
                data: { 
                  original: 'Desc 1',
                  enhanced: 'Enhanced 1',
                  keyAchievements: [],
                  technologies: ['React'],
                  impactMetrics: [],
                  confidence: 0.9
                },
                error: null,
              },
              { success: false, data: null, error: 'Failed to process' },
            ],
            summary: { total: 2, successful: 1, failed: 1 },
          },
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as unknown);

      const projects = [
        { description: 'Desc 1', technologies: ['React'], industryContext: 'Project 1' },
        { description: 'Desc 2', technologies: ['Vue'], industryContext: 'Project 2' },
      ];

      const result = await client.optimizeProjectsBatch(projects);

      expect(result.summary.total).toBe(2);
      expect(result.summary.successful).toBe(1);
      expect(result.results[0]?.success).toBe(true);
      expect(result.results[1]?.success).toBe(false);
    });
  });

  describe('Template Recommendation', () => {
    const mockUserProfile: UserProfile = {
      title: 'Frontend Developer',
      skills: ['React', 'JavaScript'],
      projectCount: 3,
      hasDesignWork: false,
      experienceLevel: 'mid',
    };

    it('should recommend template successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            recommendedTemplate: 'developer',
            confidence: 0.85,
            reasoning: 'Perfect for technical roles',
            alternatives: [
              { template: 'minimal', score: 0.6, reasons: ['Clean layout'] },
            ],
          },
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as unknown);

      const result = await client.recommendTemplate(mockUserProfile);

      expect(result.recommendedTemplate).toBe('developer');
      expect(result.confidence).toBe(0.85);
      expect(result.alternatives).toHaveLength(1);
    });

    it('should get all templates', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            templates: {
              developer: {
                name: 'Developer',
                description: 'Clean, code-focused layout',
                features: ['GitHub integration'],
                preview: '/templates/developer-preview.jpg',
                bestFor: ['Software Engineers'],
                industries: ['Technology'],
              },
            },
          },
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as unknown);

      const result = await client.getTemplates();

      expect(result.templates).toHaveProperty('developer');
      expect(result.templates.developer?.name).toBe('Developer');
    });
  });

  describe('Enhancement History', () => {
    it('should get enhancement history', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          success: true,
          data: {
            history: [
              {
                id: '1',
                operation_type: 'bio_enhancement',
                metadata: { qualityScore: 85 },
                created_at: '2024-01-15T10:00:00Z',
              },
            ],
            totalEnhancements: 1,
          },
        }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as unknown);

      const result = await client.getEnhancementHistory();

      expect(result.history).toHaveLength(1);
      expect(result.totalEnhancements).toBe(1);
      expect(result.history[0]?.operation_type).toBe('bio_enhancement');
    });
  });

  describe('Error Handling and Retries', () => {
    it('should retry on retryable errors', async () => {
      const failResponse = {
        ok: false,
        status: 503,
        json: async () => ({ error: 'Service unavailable' }),
      };
      const successResponse = {
        ok: true,
        json: async () => ({ success: true, data: { content: 'Success' } }),
      };

      mockFetch
        .mockResolvedValueOnce(failResponse as unknown)
        .mockResolvedValueOnce(successResponse as unknown);

      const result = await client.enhanceBio('test', {
        title: 'Test',
        skills: ['test'],
        experience: [],
        tone: 'professional',
        targetLength: 'concise',
      });

      expect(result.content).toBe('Success');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retryable errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      };
      mockFetch.mockResolvedValueOnce(mockResponse as unknown);

      await expect(
        client.enhanceBio('test', {
          title: 'Test',
          skills: ['test'],
          experience: [],
          tone: 'professional',
          targetLength: 'concise',
        })
      ).rejects.toThrow('Authentication required');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout errors', async () => {
      const timeoutClient = new AIClient({ timeout: 100 });

      mockFetch.mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => {
              const error = new Error('The operation was aborted');
              error.name = 'AbortError';
              reject(error);
            }, 200);
          })
      );

      await expect(
        timeoutClient.enhanceBio('test', {
          title: 'Test',
          skills: ['test'],
          experience: [],
          tone: 'professional',
          targetLength: 'concise',
        })
      ).rejects.toThrow('Request timeout');
    });

    it('should implement exponential backoff', async () => {
      const start = Date.now();
      const retryableClient = new AIClient({ retries: 3, timeout: 1000 });

      const failResponse = {
        ok: false,
        status: 503,
        json: async () => ({ error: 'Service unavailable' }),
      };

      mockFetch.mockResolvedValue(failResponse as unknown);

      await expect(
        retryableClient.enhanceBio('test', {
          title: 'Test',
          skills: ['test'],
          experience: [],
          tone: 'professional',
          targetLength: 'concise',
        })
      ).rejects.toThrow();

      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThan(1000 + 2000); // Initial delay + exponential backoff
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});

describe('AIUtils', () => {
  describe('extractUserProfile', () => {
    it('should extract user profile from portfolio data', () => {
      const portfolio = {
        title: 'Senior Frontend Developer',
        skills: [
          { name: 'React', level: 'expert' },
          { name: 'JavaScript', level: 'expert' },
        ],
        projects: [
          {
            title: 'E-commerce Platform',
            technologies: ['React', 'Node.js'],
          },
          {
            title: 'Design System',
            technologies: ['Figma', 'Storybook'],
          },
        ],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Senior Developer',
            startDate: '2020-01-01',
            current: true,
          },
          {
            company: 'Startup Inc',
            position: 'Developer',
            startDate: '2018-01-01',
            endDate: '2019-12-31',
            current: false,
          },
        ],
      };

      const profile = AIUtils.extractUserProfile(portfolio);

      expect(profile.title).toBe('Senior Frontend Developer');
      expect(profile.skills).toEqual(['React', 'JavaScript']);
      expect(profile.projectCount).toBe(2);
      expect(profile.hasDesignWork).toBe(true); // Has Figma
      expect(profile.experienceLevel).toBe('senior'); // 6+ years
    });
  });

  describe('calculateExperienceLevel', () => {
    it('should calculate experience level correctly', () => {
      const entryLevel = [
        {
          startDate: '2023-01-01',
          endDate: '2024-01-01',
          current: false,
        },
      ];

      const midLevel = [
        {
          startDate: '2021-01-01',
          current: true,
        },
      ];

      const seniorLevel = [
        {
          startDate: '2018-01-01',
          endDate: '2021-01-01',
          current: false,
        },
        {
          startDate: '2021-01-01',
          current: true,
        },
      ];

      const leadLevel = [
        {
          startDate: '2015-01-01',
          current: true,
        },
      ];

      expect(AIUtils.calculateExperienceLevel(entryLevel)).toBe('entry');
      expect(AIUtils.calculateExperienceLevel(midLevel)).toBe('mid');
      expect(AIUtils.calculateExperienceLevel(seniorLevel)).toBe('senior');
      expect(AIUtils.calculateExperienceLevel(leadLevel)).toBe('lead');
    });
  });

  describe('prepareBioContext', () => {
    it('should prepare bio context from portfolio data', () => {
      const portfolio = {
        title: 'Software Engineer',
        skills: [{ name: 'JavaScript' }, { name: 'React' }],
        experience: [
          {
            company: 'Tech Corp',
            position: 'Developer',
            startDate: '2020-01-01',
            current: true,
          },
        ],
        aiSettings: {
          tone: 'creative',
          targetLength: 'detailed',
        },
      };

      const context = AIUtils.prepareBioContext(portfolio);

      expect(context.title).toBe('Software Engineer');
      expect(context.skills).toEqual(['JavaScript', 'React']);
      expect(context.tone).toBe('creative');
      expect(context.targetLength).toBe('detailed');
      expect(context.experience).toHaveLength(1);
    });
  });

  describe('needsEnhancement', () => {
    it('should identify content that needs enhancement', () => {
      const shortBio = 'I code stuff.';
      const goodBio =
        'Senior Software Engineer with 5+ years experience leading development teams. Increased application performance by 40% and managed teams of 8+ developers.';

      const basicProject = 'Built a website.';
      const detailedProject =
        'Developed full-stack e-commerce platform serving 10k+ users, increasing conversion rates by 25% through optimized UX and performance improvements.';

      expect(AIUtils.needsEnhancement(shortBio, 'bio')).toBe(true);
      expect(AIUtils.needsEnhancement(goodBio, 'bio')).toBe(false);
      expect(AIUtils.needsEnhancement(basicProject, 'project')).toBe(true);
      expect(AIUtils.needsEnhancement(detailedProject, 'project')).toBe(false);
    });
  });

  describe('calculateYearsExperience', () => {
    it('should calculate years of experience correctly', () => {
      // Test with a well-defined 2-year period
      const start = '2020-01-01';
      const end = '2022-01-01';

      // Past role with explicit end date
      const pastYears = AIUtils.calculateYearsExperience(start, end, false);

      // Should be exactly 2 years (2020 to 2022)
      expect(pastYears).toBe(2);

      // Test current role - from 2020 to now should be several years
      const currentYears = AIUtils.calculateYearsExperience(start, null, true);

      // Should be at least 4 years (2020 to 2024+)
      expect(currentYears).toBeGreaterThanOrEqual(4);
    });
  });
});

describe('AIClientError', () => {
  it('should create error with correct properties', () => {
    const error = new AIClientError('Test error', 'TEST_CODE', true);

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.retryable).toBe(true);
    expect(error.name).toBe('AIClientError');
  });
});

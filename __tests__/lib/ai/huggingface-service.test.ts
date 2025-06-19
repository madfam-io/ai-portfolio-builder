/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import {
  enhanceBio,
  optimizeProjectDescription,
  recommendTemplate,
  generateTechStack,
  improveSection,
  assessContentQuality,
  AIModel,
  AI_MODELS,
} from '@/lib/ai/huggingface-service';
import { HfInference } from '@huggingface/inference';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@huggingface/inference');
jest.mock('@/lib/utils/logger');

const mockHfInference = jest.mocked(HfInference);
const mockLogger = jest.mocked(logger);

describe('HuggingFace AI Service', () => {
  let mockHf: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup HuggingFace mock
    mockHf = {
      textGeneration: jest.fn(),
      featureExtraction: jest.fn(),
      textClassification: jest.fn(),
    };

    mockHfInference.mockImplementation(() => mockHf);

    // Mock logger
    mockLogger.info = jest.fn();
    mockLogger.error = jest.fn();
    mockLogger.warn = jest.fn();
  });

  describe('enhanceBio', () => {
    const originalBio = 'I am a software developer with 5 years of experience.';

    it('should enhance bio with default model', async () => {
      const enhancedBio =
        'Experienced software developer with 5+ years crafting innovative solutions. Specialized in full-stack development, cloud architecture, and agile methodologies. Passionate about building scalable applications that solve real-world problems.';

      mockHf.textGeneration.mockResolvedValue({
        generated_text: `Enhanced bio: ${enhancedBio}`,
      });

      const result = await enhanceBio(originalBio);

      expect(result).toEqual({
        enhanced: enhancedBio,
        quality: expect.any(Number),
        model: 'llama-3.1-70b',
        error: null,
      });

      expect(mockHf.textGeneration).toHaveBeenCalledWith({
        model: AI_MODELS['llama-3.1-70b'].id,
        inputs: expect.stringContaining(originalBio),
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.9,
          do_sample: true,
        },
      });

      expect(result.quality).toBeGreaterThan(0);
      expect(result.quality).toBeLessThanOrEqual(100);
    });

    it('should use specified AI model', async () => {
      mockHf.textGeneration.mockResolvedValue({
        generated_text: 'Enhanced bio: Professional developer...',
      });

      await enhanceBio(originalBio, 'phi-3.5');

      expect(mockHf.textGeneration).toHaveBeenCalledWith(
        expect.objectContaining({
          model: AI_MODELS['phi-3.5'].id,
        })
      );
    });

    it('should enforce word limit', async () => {
      const longBio = 'word '.repeat(200); // Very long response
      mockHf.textGeneration.mockResolvedValue({
        generated_text: `Enhanced bio: ${longBio}`,
      });

      const result = await enhanceBio(originalBio);

      const wordCount = result.enhanced.split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(150);
    });

    it('should calculate quality score', async () => {
      const testCases = [
        {
          bio: 'Developer.',
          expectedQuality: 20, // Too short
        },
        {
          bio: 'Experienced software engineer with expertise in React, Node.js, and cloud technologies. Passionate about creating innovative solutions.',
          expectedQuality: 80, // Good
        },
        {
          bio: 'I I I am am developer developer with with experience experience.',
          expectedQuality: 40, // Repetitive
        },
      ];

      for (const testCase of testCases) {
        mockHf.textGeneration.mockResolvedValue({
          generated_text: `Enhanced bio: ${testCase.bio}`,
        });

        const result = await enhanceBio('original');
        expect(result.quality).toBeCloseTo(testCase.expectedQuality, -1);
      }
    });

    it('should handle API errors gracefully', async () => {
      mockHf.textGeneration.mockRejectedValue(
        new Error('HuggingFace API error')
      );

      const result = await enhanceBio(originalBio);

      expect(result).toEqual({
        enhanced: originalBio, // Return original on error
        quality: 0,
        model: 'llama-3.1-70b',
        error: 'Failed to enhance bio',
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to enhance bio',
        expect.any(Error)
      );
    });

    it('should validate model selection', async () => {
      mockHf.textGeneration.mockResolvedValue({
        generated_text: 'Enhanced bio: Professional...',
      });

      await enhanceBio(originalBio, 'invalid-model' as AIModel);

      // Should fallback to default model
      expect(mockHf.textGeneration).toHaveBeenCalledWith(
        expect.objectContaining({
          model: AI_MODELS['llama-3.1-70b'].id,
        })
      );
    });
  });

  describe('optimizeProjectDescription', () => {
    const projectInfo = {
      title: 'E-commerce Platform',
      description: 'Built an online store',
      technologies: ['React', 'Node.js', 'MongoDB'],
      duration: '3 months',
    };

    it('should optimize project description using STAR format', async () => {
      const optimizedDescription = `
        Situation: Led development of a comprehensive e-commerce platform for a growing retail business.
        Task: Design and implement a scalable online store with real-time inventory management.
        Action: Built full-stack solution using React, Node.js, and MongoDB. Implemented secure payment processing and responsive design.
        Result: Delivered platform processing 1000+ daily transactions with 99.9% uptime, increasing client revenue by 150%.
      `;

      mockHf.textGeneration.mockResolvedValue({
        generated_text: `Optimized: ${optimizedDescription}`,
      });

      const result = await optimizeProjectDescription(projectInfo);

      expect(result).toEqual({
        optimized: expect.stringContaining('Situation:'),
        metrics: expect.arrayContaining([
          expect.stringContaining('1000'),
          expect.stringContaining('99.9%'),
          expect.stringContaining('150%'),
        ]),
        quality: expect.any(Number),
        error: null,
      });

      expect(mockHf.textGeneration).toHaveBeenCalledWith({
        model: AI_MODELS['llama-3.1-70b'].id,
        inputs: expect.stringContaining('STAR method'),
        parameters: {
          max_new_tokens: 200,
          temperature: 0.6,
          top_p: 0.85,
          do_sample: true,
        },
      });
    });

    it('should extract metrics from description', async () => {
      const descriptionWithMetrics = `
        Achieved 50% performance improvement, reduced costs by $10,000,
        managed team of 5 developers, delivered 2 weeks early.
      `;

      mockHf.textGeneration.mockResolvedValue({
        generated_text: `Optimized: ${descriptionWithMetrics}`,
      });

      const result = await optimizeProjectDescription(projectInfo);

      expect(result.metrics).toEqual([
        '50% performance improvement',
        '$10,000',
        '5 developers',
        '2 weeks early',
      ]);
    });

    it('should handle projects without metrics', async () => {
      const descriptionNoMetrics = 'Built a web application for internal use.';

      mockHf.textGeneration.mockResolvedValue({
        generated_text: `Optimized: ${descriptionNoMetrics}`,
      });

      const result = await optimizeProjectDescription(projectInfo);

      expect(result.metrics).toEqual([]);
      expect(result.quality).toBeLessThan(70); // Lower quality without metrics
    });
  });

  describe('recommendTemplate', () => {
    const userProfile = {
      profession: 'Full Stack Developer',
      experience: '5 years',
      skills: ['React', 'Node.js', 'Python', 'AWS'],
      style: 'modern and minimal',
    };

    it('should recommend appropriate template', async () => {
      mockHf.textClassification = jest.fn().mockResolvedValue([
        { label: 'developer', score: 0.85 },
        { label: 'designer', score: 0.1 },
        { label: 'consultant', score: 0.05 },
      ]);

      const result = await recommendTemplate(userProfile);

      expect(result).toEqual({
        template: 'developer',
        confidence: 85,
        reasoning: expect.stringContaining('technical background'),
        alternatives: [
          { template: 'designer', confidence: 10 },
          { template: 'consultant', confidence: 5 },
        ],
        error: null,
      });
    });

    it('should provide reasoning for recommendation', async () => {
      mockHf.textClassification = jest
        .fn()
        .mockResolvedValue([{ label: 'designer', score: 0.75 }]);

      mockHf.textGeneration.mockResolvedValue({
        generated_text:
          'Reasoning: Your creative background and portfolio focus suggest the designer template would best showcase your visual work.',
      });

      const result = await recommendTemplate({
        profession: 'UI/UX Designer',
        experience: '3 years',
        skills: ['Figma', 'Sketch', 'Adobe XD'],
        style: 'creative and bold',
      });

      expect(result.reasoning).toContain('creative background');
      expect(result.reasoning).toContain('visual work');
    });

    it('should handle low confidence recommendations', async () => {
      mockHf.textClassification = jest.fn().mockResolvedValue([
        { label: 'developer', score: 0.4 },
        { label: 'designer', score: 0.35 },
        { label: 'consultant', score: 0.25 },
      ]);

      const result = await recommendTemplate(userProfile);

      expect(result.confidence).toBe(40);
      expect(result.alternatives).toHaveLength(2);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Low confidence template recommendation',
        expect.objectContaining({ confidence: 40 })
      );
    });
  });

  describe('generateTechStack', () => {
    it('should generate tech stack from project description', async () => {
      const projectDescription = `
        Built a real-time chat application using React for the frontend,
        Node.js and Socket.io for the backend, with MongoDB for data storage.
        Deployed on AWS EC2 with Docker containers.
      `;

      mockHf.featureExtraction = jest.fn().mockResolvedValue([
        [0.9, 0.1, 0.05], // React
        [0.85, 0.15, 0.1], // Node.js
        [0.8, 0.2, 0.1], // Socket.io
        [0.75, 0.25, 0.15], // MongoDB
        [0.7, 0.3, 0.2], // AWS
        [0.65, 0.35, 0.25], // Docker
      ]);

      const result = await generateTechStack(projectDescription);

      expect(result).toEqual({
        technologies: expect.arrayContaining([
          'React',
          'Node.js',
          'Socket.io',
          'MongoDB',
          'AWS',
          'Docker',
        ]),
        categories: {
          frontend: ['React'],
          backend: ['Node.js', 'Socket.io'],
          database: ['MongoDB'],
          cloud: ['AWS'],
          devops: ['Docker'],
        },
        confidence: expect.any(Number),
        error: null,
      });
    });

    it('should categorize technologies correctly', async () => {
      const description =
        'Vue.js frontend, Django REST API, PostgreSQL database';

      mockHf.featureExtraction = jest.fn().mockResolvedValue([
        [0.9, 0.1, 0.05],
        [0.85, 0.15, 0.1],
        [0.8, 0.2, 0.1],
      ]);

      const result = await generateTechStack(description);

      expect(result.categories).toEqual({
        frontend: ['Vue.js'],
        backend: ['Django'],
        database: ['PostgreSQL'],
        cloud: [],
        devops: [],
      });
    });
  });

  describe('improveSection', () => {
    it('should improve about section', async () => {
      const originalContent = 'I like coding and building things.';

      mockHf.textGeneration.mockResolvedValue({
        generated_text:
          'Improved: Passionate software engineer dedicated to crafting elegant solutions to complex problems. I thrive on transforming ideas into robust, scalable applications that make a meaningful impact.',
      });

      const result = await improveSection('about', originalContent);

      expect(result).toEqual({
        improved: expect.stringContaining('Passionate software engineer'),
        suggestions: expect.arrayContaining([
          expect.stringContaining('specific'),
        ]),
        quality: expect.any(Number),
        error: null,
      });
    });

    it('should provide section-specific suggestions', async () => {
      const sectionTests = [
        {
          section: 'skills',
          suggestions: ['proficiency levels', 'categories'],
        },
        {
          section: 'experience',
          suggestions: ['achievements', 'metrics'],
        },
        {
          section: 'education',
          suggestions: ['relevant coursework', 'honors'],
        },
      ];

      for (const test of sectionTests) {
        mockHf.textGeneration.mockResolvedValue({
          generated_text: 'Improved content',
        });

        const result = await improveSection(test.section as any, 'content');

        for (const keyword of test.suggestions) {
          expect(
            result.suggestions.some(s => s.toLowerCase().includes(keyword))
          ).toBe(true);
        }
      }
    });
  });

  describe('assessContentQuality', () => {
    it('should assess high quality content', async () => {
      const highQualityContent = {
        bio: 'Experienced full-stack developer with 8+ years building scalable web applications. Specialized in React, Node.js, and cloud architecture. Led teams of 5-10 developers on enterprise projects.',
        projects: [
          {
            description:
              'Developed e-commerce platform handling $1M+ monthly transactions with 99.9% uptime.',
          },
          {
            description:
              'Built real-time analytics dashboard processing 100K events/second.',
          },
        ],
        skills: ['React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL'],
      };

      const result = await assessContentQuality(highQualityContent);

      expect(result).toEqual({
        overall: expect.any(Number),
        breakdown: {
          completeness: expect.any(Number),
          professionalism: expect.any(Number),
          specificity: expect.any(Number),
          impact: expect.any(Number),
        },
        suggestions: expect.any(Array),
        strengths: expect.arrayContaining([expect.stringContaining('metrics')]),
        error: null,
      });

      expect(result.overall).toBeGreaterThan(80);
    });

    it('should identify content weaknesses', async () => {
      const weakContent = {
        bio: 'I am developer',
        projects: [],
        skills: ['coding'],
      };

      const result = await assessContentQuality(weakContent);

      expect(result.overall).toBeLessThan(40);
      expect(result.breakdown.completeness).toBeLessThan(30);
      expect(result.suggestions).toContain(expect.stringContaining('bio'));
      expect(result.suggestions).toContain(expect.stringContaining('projects'));
    });

    it('should provide actionable suggestions', async () => {
      const mediumContent = {
        bio: 'Software developer with experience in web development.',
        projects: [
          {
            description: 'Built a website for a client.',
          },
        ],
        skills: ['JavaScript', 'HTML', 'CSS'],
      };

      const result = await assessContentQuality(mediumContent);

      expect(result.suggestions).toContain(
        expect.stringContaining('specific years')
      );

      expect(result.suggestions).toContain(expect.stringContaining('metrics'));
      expect(result.suggestions).toContain(
        expect.stringContaining('technologies')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle rate limiting', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      (rateLimitError as any).status = 429;

      mockHf.textGeneration.mockRejectedValue(rateLimitError);

      const result = await enhanceBio('test bio');

      expect(result.error).toContain('rate limit');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'HuggingFace rate limit hit',
        expect.any(Object)
      );
    });

    it('should handle model unavailability', async () => {
      const modelError = new Error('Model loading failed');
      (modelError as any).status = 503;

      mockHf.textGeneration
        .mockRejectedValueOnce(modelError) // First model fails
        .mockResolvedValueOnce({
          // Fallback model works
          generated_text: 'Enhanced: Fallback result',
        });

      const result = await enhanceBio('test bio', 'llama-3.1-70b');

      expect(result.error).toBeNull();
      expect(result.model).not.toBe('llama-3.1-70b'); // Should use fallback
    });

    it('should handle API key issues', async () => {
      const authError = new Error('Invalid API key');
      (authError as any).status = 401;

      mockHf.textGeneration.mockRejectedValue(authError);

      const result = await enhanceBio('test bio');

      expect(result.error).toContain('configuration');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'HuggingFace API authentication failed',
        expect.any(Object)
      );
    });
  });

  describe('Performance', () => {
    it('should timeout long-running requests', 20000, async () => {
      jest.useFakeTimers();

      mockHf.textGeneration.mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(
              () => resolve({ generated_text: 'Late response' }),
              30000
            );
          })
      );

      const promise = enhanceBio('test bio');
      jest.advanceTimersByTime(15000); // 15 second timeout

      const result = await promise;
      expect(result.error).toContain('timeout');

      jest.useRealTimers();
    });

    it('should cache repeated requests', async () => {
      mockHf.textGeneration.mockResolvedValue({
        generated_text: 'Enhanced: Cached result',
      });

      // First call
      await enhanceBio('same bio');
      expect(mockHf.textGeneration).toHaveBeenCalledTimes(1);

      // Second call with same input
      await enhanceBio('same bio');
      expect(mockHf.textGeneration).toHaveBeenCalledTimes(1); // Should use cache
    });
  });
});

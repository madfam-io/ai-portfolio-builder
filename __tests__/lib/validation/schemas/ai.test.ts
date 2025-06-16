import {
  enhanceBioSchema,
  optimizeProjectSchema,
  recommendTemplateSchema,
  generateContentSchema,
  batchAIOperationSchema,
  aiFeedbackSchema,
} from '@/lib/validation/schemas/ai';

describe('AI Validation Schemas', () => {
  describe('enhanceBioSchema', () => {
    it('should validate valid bio enhancement request', () => {
      const validData = {
        text: 'I am a software developer with experience in web development.',
      };

      const result = enhanceBioSchema.parse(validData);
      expect(result).toEqual({
        text: validData.text,
        tone: 'professional',
        targetLength: 100,
      });
    });

    it('should accept optional parameters', () => {
      const validData = {
        text: 'Senior developer with 10 years of experience',
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        tone: 'creative',
        industry: 'Technology',
        targetLength: 150,
      };

      const result = enhanceBioSchema.parse(validData);
      expect(result.model).toBe('meta-llama/Llama-3.1-8B-Instruct');
      expect(result.tone).toBe('creative');
      expect(result.industry).toBe('Technology');
    });

    it('should reject text too short', () => {
      const invalidData = {
        text: 'Too short',
      };

      expect(() => enhanceBioSchema.parse(invalidData)).toThrow(
        'Bio must be at least 10 characters'
      );
    });

    it('should reject text too long', () => {
      const invalidData = {
        text: 'a'.repeat(501),
      };

      expect(() => enhanceBioSchema.parse(invalidData)).toThrow(
        'Bio must be less than 500 characters'
      );
    });

    it('should reject invalid model', () => {
      const invalidData = {
        text: 'Valid bio text for enhancement',
        model: 'invalid-model',
      };

      expect(() => enhanceBioSchema.parse(invalidData)).toThrow();
    });
  });

  describe('optimizeProjectSchema', () => {
    it('should validate valid project optimization request', () => {
      const validData = {
        title: 'E-commerce Platform',
        description:
          'Built a scalable e-commerce platform using React and Node.js',
      };

      const result = optimizeProjectSchema.parse(validData);
      expect(result).toEqual({
        title: validData.title,
        description: validData.description,
        format: 'STAR',
        includeMetrics: true,
        targetLength: 150,
      });
    });

    it('should accept all parameters', () => {
      const validData = {
        title: 'Mobile App',
        description:
          'Developed a cross-platform mobile application for iOS and Android',
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        format: 'CAR',
        includeMetrics: false,
        targetLength: 200,
      };

      const result = optimizeProjectSchema.parse(validData);
      expect(result.format).toBe('CAR');
      expect(result.includeMetrics).toBe(false);
    });

    it('should reject description too short', () => {
      const invalidData = {
        title: 'Project',
        description: 'Too short desc',
      };

      expect(() => optimizeProjectSchema.parse(invalidData)).toThrow(
        'Description must be at least 20 characters'
      );
    });

    it('should validate format options', () => {
      const invalidData = {
        title: 'Project',
        description: 'A valid project description that is long enough',
        format: 'invalid',
      };

      expect(() => optimizeProjectSchema.parse(invalidData)).toThrow();
    });
  });

  describe('recommendTemplateSchema', () => {
    it('should validate valid template recommendation request', () => {
      const validData = {
        industry: 'Technology',
        experience: 'senior',
        skills: ['React', 'Node.js', 'Python'],
      };

      const result = recommendTemplateSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept preferences', () => {
      const validData = {
        industry: 'Design',
        experience: 'mid',
        skills: ['UI/UX', 'Figma'],
        preferences: {
          style: 'modern',
          colorScheme: 'dark',
          layout: 'grid',
        },
      };

      const result = recommendTemplateSchema.parse(validData);
      expect(result.preferences?.style).toBe('modern');
    });

    it('should require at least one skill', () => {
      const invalidData = {
        industry: 'Technology',
        experience: 'senior',
        skills: [],
      };

      expect(() => recommendTemplateSchema.parse(invalidData)).toThrow();
    });

    it('should validate experience level', () => {
      const invalidData = {
        industry: 'Technology',
        experience: 'expert',
        skills: ['React'],
      };

      expect(() => recommendTemplateSchema.parse(invalidData)).toThrow();
    });

    it('should enforce skill limit', () => {
      const invalidData = {
        industry: 'Technology',
        experience: 'senior',
        skills: Array(21).fill('skill'),
      };

      expect(() => recommendTemplateSchema.parse(invalidData)).toThrow();
    });
  });

  describe('generateContentSchema', () => {
    it('should validate valid content generation request', () => {
      const validData = {
        prompt: 'Generate a professional bio for a software developer',
        contentType: 'bio',
      };

      const result = generateContentSchema.parse(validData);
      expect(result).toEqual({
        prompt: validData.prompt,
        contentType: validData.contentType,
        maxTokens: 200,
        temperature: 0.7,
      });
    });

    it('should accept all parameters', () => {
      const validData = {
        prompt: 'Generate a creative project description',
        model: 'HuggingFaceH4/zephyr-7b-beta',
        maxTokens: 300,
        temperature: 0.9,
        contentType: 'project',
      };

      const result = generateContentSchema.parse(validData);
      expect(result.maxTokens).toBe(300);
      expect(result.temperature).toBe(0.9);
    });

    it('should validate temperature range', () => {
      const invalidData = {
        prompt: 'Generate content',
        contentType: 'bio',
        temperature: 1.5,
      };

      expect(() => generateContentSchema.parse(invalidData)).toThrow();
    });

    it('should validate content type', () => {
      const invalidData = {
        prompt: 'Generate content',
        contentType: 'invalid',
      };

      expect(() => generateContentSchema.parse(invalidData)).toThrow();
    });
  });

  describe('batchAIOperationSchema', () => {
    it('should validate batch operations', () => {
      const validData = {
        operations: [
          {
            type: 'enhance_bio',
            data: {
              text: 'Software developer with experience',
            },
          },
          {
            type: 'optimize_project',
            data: {
              title: 'E-commerce Platform',
              description: 'Built a scalable platform for online shopping',
            },
          },
        ],
      };

      const result = batchAIOperationSchema.parse(validData);
      expect(result.operations).toHaveLength(2);
    });

    it('should require at least one operation', () => {
      const invalidData = {
        operations: [],
      };

      expect(() => batchAIOperationSchema.parse(invalidData)).toThrow();
    });

    it('should enforce maximum operations limit', () => {
      const invalidData = {
        operations: Array(11).fill({
          type: 'enhance_bio',
          data: { text: 'Test bio text here' },
        }),
      };

      expect(() => batchAIOperationSchema.parse(invalidData)).toThrow();
    });

    it('should validate operation data', () => {
      const invalidData = {
        operations: [
          {
            type: 'enhance_bio',
            data: {
              text: 'short',
            },
          },
        ],
      };

      expect(() => batchAIOperationSchema.parse(invalidData)).toThrow();
    });
  });

  describe('aiFeedbackSchema', () => {
    it('should validate valid feedback', () => {
      const validData = {
        operationId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        improved: true,
      };

      const result = aiFeedbackSchema.parse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept optional feedback text', () => {
      const validData = {
        operationId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 4,
        feedback: 'Great improvement, but could be more concise',
        improved: true,
      };

      const result = aiFeedbackSchema.parse(validData);
      expect(result.feedback).toBe(
        'Great improvement, but could be more concise'
      );
    });

    it('should validate rating range', () => {
      const invalidData = {
        operationId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6,
        improved: true,
      };

      expect(() => aiFeedbackSchema.parse(invalidData)).toThrow();
    });

    it('should validate UUID format', () => {
      const invalidData = {
        operationId: 'not-a-uuid',
        rating: 5,
        improved: true,
      };

      expect(() => aiFeedbackSchema.parse(invalidData)).toThrow();
    });

    it('should enforce feedback length limit', () => {
      const invalidData = {
        operationId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 3,
        feedback: 'a'.repeat(501),
        improved: false,
      };

      expect(() => aiFeedbackSchema.parse(invalidData)).toThrow();
    });
  });
});

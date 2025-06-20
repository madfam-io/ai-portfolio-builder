import { z } from 'zod';
import { describe, test, it, expect, jest, beforeEach } from '@jest/globals';
import type { Mock, MockedClass } from 'jest-mock';

import {

jest.mock('@/lib/ai/huggingface-service', () => ({

jest.setTimeout(30000);

// Mock HuggingFace service
const mockHuggingFaceService = {
  healthCheck: jest.fn().mockResolvedValue(true),
  enhanceBio: jest.fn().mockResolvedValue({
    enhancedBio: 'Enhanced bio',
    wordCount: 10,
    tone: 'professional',
  }),
  optimizeProject: jest.fn().mockResolvedValue({
    optimizedTitle: 'Optimized Title',
    optimizedDescription: 'Optimized description',
  }),
  getAvailableModels: jest.fn().mockResolvedValue([
    { id: 'model-1', name: 'Model 1' },
    { id: 'model-2', name: 'Model 2' },
  ]),
};

  HuggingFaceService: jest.fn().mockImplementation(() => mockHuggingFaceService),
}));

  enhanceBioSchema,
  optimizeProjectSchema,
  recommendTemplateSchema,
  generateContentSchema,
  batchAIOperationSchema,
  aiFeedbackSchema,
} from '@/lib/validation/schemas/ai';

describe('AI Validation Schemas', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  describe('enhanceBioSchema', () => {
    it('should validate valid bio enhancement request', async () => {
      const validData = {
        text: 'I am a software developer with experience in web development.',
      };

      const result = enhanceBioSchema.safeParse(validData);
      expect(result).toEqual({
        text: validData.text,
        tone: 'professional',
        targetLength: 100,
      });
    });

    it('should accept optional parameters', async () => {
      const validData = {
        text: 'Senior developer with 10 years of experience',
        model: 'meta-llama/Llama-3.1-8B-Instruct',
        tone: 'creative',
        industry: 'Technology',
        targetLength: 150,
      };

      const result = enhanceBioSchema.safeParse(validData);
      expect(result.model).toBe('meta-llama/Llama-3.1-8B-Instruct');
      expect(result.tone).toBe('creative');
      expect(result.industry).toBe('Technology');
    });

    it('should reject text too short', async () => {
      const invalidData = {
        text: 'Too short',
      };

      expect(() => enhanceBioSchema.safeParse(invalidData)).toThrow(
        'Bio must be at least 10 characters'

    });

    it('should reject text too long', async () => {
      const invalidData = {
        text: 'a'.repeat(501),
      };

      expect(() => enhanceBioSchema.safeParse(invalidData)).toThrow(
        'Bio must be less than 500 characters'

    });

    it('should reject invalid model', async () => {
      const invalidData = {
        text: 'Valid bio text for enhancement',
        model: 'invalid-model',
      };

      expect(() => enhanceBioSchema.safeParse(invalidData)).toThrow();
    });
  });

  describe('optimizeProjectSchema', () => {
    it('should validate valid project optimization request', async () => {
      const validData = {
        title: 'E-commerce Platform',
        description:
          'Built a scalable e-commerce platform using React and Node.js',
      };

      const result = optimizeProjectSchema.safeParse(validData);
      expect(result).toEqual({
        title: validData.title,
        description: validData.description,
        format: 'STAR',
        includeMetrics: true,
        targetLength: 150,
      });
    });

    it('should accept all parameters', async () => {
      const validData = {
        title: 'Mobile App',
        description:
          'Developed a cross-platform mobile application for iOS and Android',
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        format: 'CAR',
        includeMetrics: false,
        targetLength: 200,
      };

      const result = optimizeProjectSchema.safeParse(validData);
      expect(result.format).toBe('CAR');
      expect(result.includeMetrics).toBe(false);
    });

    it('should reject description too short', async () => {
      const invalidData = {
        title: 'Project',
        description: 'Too short desc',
      };

      expect(() => optimizeProjectSchema.safeParse(invalidData)).toThrow(
        'Description must be at least 20 characters'

    });

    it('should validate format options', async () => {
      const invalidData = {
        title: 'Project',
        description: 'A valid project description that is long enough',
        format: 'invalid',
      };

      expect(() => optimizeProjectSchema.safeParse(invalidData)).toThrow();
    });
  });

  describe('recommendTemplateSchema', () => {
    it('should validate valid template recommendation request', async () => {
      const validData = {
        industry: 'Technology',
        experience: 'senior',
        skills: ['React', 'Node.js', 'Python'],
      };

      const result = recommendTemplateSchema.safeParse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept preferences', async () => {
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

      const result = recommendTemplateSchema.safeParse(validData);
      expect(result.preferences?.style).toBe('modern');
    });

    it('should require at least one skill', async () => {
      const invalidData = {
        industry: 'Technology',
        experience: 'senior',
        skills: [],
      };

      expect(() => recommendTemplateSchema.safeParse(invalidData)).toThrow();
    });

    it('should validate experience level', async () => {
      const invalidData = {
        industry: 'Technology',
        experience: 'expert',
        skills: ['React'],
      };

      expect(() => recommendTemplateSchema.safeParse(invalidData)).toThrow();
    });

    it('should enforce skill limit', async () => {
      const invalidData = {
        industry: 'Technology',
        experience: 'senior',
        skills: Array(21).fill('skill'),
      };

      expect(() => recommendTemplateSchema.safeParse(invalidData)).toThrow();
    });
  });

  describe('generateContentSchema', () => {
    it('should validate valid content generation request', async () => {
      const validData = {
        prompt: 'Generate a professional bio for a software developer',
        contentType: 'bio',
      };

      const result = generateContentSchema.safeParse(validData);
      expect(result).toEqual({
        prompt: validData.prompt,
        contentType: validData.contentType,
        maxTokens: 200,
        temperature: 0.7,
      });
    });

    it('should accept all parameters', async () => {
      const validData = {
        prompt: 'Generate a creative project description',
        model: 'HuggingFaceH4/zephyr-7b-beta',
        maxTokens: 300,
        temperature: 0.9,
        contentType: 'project',
      };

      const result = generateContentSchema.safeParse(validData);
      expect(result.maxTokens).toBe(300);
      expect(result.temperature).toBe(0.9);
    });

    it('should validate temperature range', async () => {
      const invalidData = {
        prompt: 'Generate content',
        contentType: 'bio',
        temperature: 1.5,
      };

      expect(() => generateContentSchema.safeParse(invalidData)).toThrow();
    });

    it('should validate content type', async () => {
      const invalidData = {
        prompt: 'Generate content',
        contentType: 'invalid',
      };

      expect(() => generateContentSchema.safeParse(invalidData)).toThrow();
    });
  });

  describe('batchAIOperationSchema', () => {
    it('should validate batch operations', async () => {
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

      const result = batchAIOperationSchema.safeParse(validData);
      expect(result.operations).toHaveLength(2);
    });

    it('should require at least one operation', async () => {
      const invalidData = {
        operations: [],
      };

      expect(() => batchAIOperationSchema.safeParse(invalidData)).toThrow();
    });

    it('should enforce maximum operations limit', async () => {
      const invalidData = {
        operations: Array(11).fill({
          type: 'enhance_bio',
          data: { text: 'Test bio text here' },
        }),
      };

      expect(() => batchAIOperationSchema.safeParse(invalidData)).toThrow();
    });

    it('should validate operation data', async () => {
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

      expect(() => batchAIOperationSchema.safeParse(invalidData)).toThrow();
    });
  });

  describe('aiFeedbackSchema', () => {
    it('should validate valid feedback', async () => {
      const validData = {
        operationId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 5,
        improved: true,
      };

      const result = aiFeedbackSchema.safeParse(validData);
      expect(result).toEqual(validData);
    });

    it('should accept optional feedback text', async () => {
      const validData = {
        operationId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 4,
        feedback: 'Great improvement, but could be more concise',
        improved: true,
      };

      const result = aiFeedbackSchema.safeParse(validData);
      expect(result.feedback).toBe(
        'Great improvement, but could be more concise'

    });

    it('should validate rating range', async () => {
      const invalidData = {
        operationId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 6,
        improved: true,
      };

      expect(() => aiFeedbackSchema.safeParse(invalidData)).toThrow();
    });

    it('should validate UUID format', async () => {
      const invalidData = {
        operationId: 'not-a-uuid',
        rating: 5,
        improved: true,
      };

      expect(() => aiFeedbackSchema.safeParse(invalidData)).toThrow();
    });

    it('should enforce feedback length limit', async () => {
      const invalidData = {
        operationId: '123e4567-e89b-12d3-a456-426614174000',
        rating: 3,
        feedback: 'a'.repeat(501),
        improved: false,
      };

      expect(() => aiFeedbackSchema.safeParse(invalidData)).toThrow();
    });
  });
});
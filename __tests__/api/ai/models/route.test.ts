/**
 * AI Models API route test suite
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/ai/models/route';

// Mock HuggingFace service
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn().mockImplementation(() => ({
    getAvailableModels: jest.fn().mockResolvedValue({
      bio: [
        {
          id: 'meta-llama/Llama-3.1-8B-Instruct',
          name: 'Llama 3.1 8B Instruct',
          description: 'High quality text generation',
          performance: { quality: 90, speed: 85, cost: 7 },
          status: 'available',
        },
      ],
      project: [
        {
          id: 'microsoft/Phi-3.5-mini-instruct',
          name: 'Phi-3.5 Mini Instruct',
          description: 'Fast and efficient model',
          performance: { quality: 80, speed: 95, cost: 3 },
          status: 'available',
        },
      ],
      template: [
        {
          id: 'meta-llama/Llama-3.1-8B-Instruct',
          name: 'Llama 3.1 8B Instruct',
          description: 'Best for template recommendations',
          performance: { quality: 90, speed: 85, cost: 7 },
          status: 'available',
        },
      ],
    }),
  })),
}));

describe('AI Models API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/ai/models', () => {
    test('returns available models for all tasks', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/models');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.models).toBeDefined();
      expect(data.models.bio).toHaveLength(1);
      expect(data.models.project).toHaveLength(1);
      expect(data.models.template).toHaveLength(1);
    });

    test('returns model details with performance metrics', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/models');
      const response = await GET(request);

      const data = await response.json();
      const bioModel = data.models.bio[0];

      expect(bioModel).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        performance: {
          quality: expect.any(Number),
          speed: expect.any(Number),
          cost: expect.any(Number),
        },
        status: 'available',
      });
    });

    test('includes metadata in response', async () => {
      const request = new NextRequest('http://localhost:3000/api/ai/models');
      const response = await GET(request);

      const data = await response.json();

      expect(data.metadata).toBeDefined();
      expect(data.metadata.timestamp).toBeDefined();
      expect(data.metadata.version).toBeDefined();
    });

    test('handles service errors gracefully', async () => {
      // Mock error
      const HuggingFaceService =
        require('@/lib/ai/huggingface-service').HuggingFaceService;
      HuggingFaceService.mockImplementationOnce(() => ({
        getAvailableModels: jest
          .fn()
          .mockRejectedValue(new Error('Service unavailable')),
      }));

      const request = new NextRequest('http://localhost:3000/api/ai/models');
      const response = await GET(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});

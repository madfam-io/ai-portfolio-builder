/**
 * AI Models API route test suite
 */

import { GET } from '@/app/api/v1/ai/models/route';

// Mock HuggingFace service
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn().mockImplementation(() => ({
    getAvailableModels: jest.fn().mockResolvedValue([
      {
        id: 'meta-llama/Llama-3.1-8B-Instruct',
        name: 'Llama 3.1 8B Instruct',
        provider: 'Meta',
        capabilities: ['bio', 'project', 'template'],
        costPerRequest: 0.0003,
        averageLatency: 2500,
        qualityRating: 0.92,
        isRecommended: true,
        status: 'active',
      },
      {
        id: 'microsoft/Phi-3.5-mini-instruct',
        name: 'Phi-3.5 Mini Instruct',
        provider: 'Microsoft',
        capabilities: ['bio', 'project'],
        costPerRequest: 0.0001,
        averageLatency: 1800,
        qualityRating: 0.85,
        isRecommended: false,
        status: 'active',
      },
    ]),
  })),
}));

describe('AI Models API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/ai/models', () => {
    test('returns available models for all tasks', async () => {
      const response = await GET();

      expect(response.status).toBe(200);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.data.models).toBeDefined();
      expect(Array.isArray(data.data.models)).toBe(true);
      expect(data.data.models).toHaveLength(2);
      expect(data.data.totalModels).toBe(2);
    });

    test('returns model details with performance metrics', async () => {
      const response = await GET();

      const data = await response.json();
      const firstModel = data.data.models[0];

      expect(firstModel).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        provider: expect.any(String),
        capabilities: expect.any(Array),
        costPerRequest: expect.any(Number),
        averageLatency: expect.any(Number),
        qualityRating: expect.any(Number),
        isRecommended: expect.any(Boolean),
        status: 'active',
      });
    });

    test('includes metadata in response', async () => {
      const response = await GET();

      const data = await response.json();

      expect(data.data.lastUpdated).toBeDefined();
      expect(data.data.totalModels).toBeDefined();
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

      const response = await GET();

      // The API returns fallback models when there's an error
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.models).toBeDefined();
      expect(Array.isArray(data.data.models)).toBe(true);
    });
  });
});

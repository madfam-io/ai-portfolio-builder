import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/ai/models/route';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { withCacheHeaders, generateETag } from '@/lib/cache/cache-headers';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/ai/huggingface-service');
jest.mock('@/lib/cache/cache-headers');
jest.mock('@/lib/utils/logger');

describe('GET /api/v1/ai/models', () => {
  let mockHuggingFaceInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock HuggingFace service instance
    mockHuggingFaceInstance = {
      getAvailableModels: jest.fn(),
    };

    (HuggingFaceService as jest.Mock).mockImplementation(
      () => mockHuggingFaceInstance
    );

    // Mock cache functions
    (withCacheHeaders as jest.Mock).mockImplementation(response => response);
    (generateETag as jest.Mock).mockReturnValue('test-etag');

    // Mock logger
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  const mockModels = [
    {
      id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
      name: 'Llama 3.1 8B Instruct',
      provider: 'huggingface',
      capabilities: ['bio', 'project', 'template'],
      costPerRequest: 0.0003,
      avgResponseTime: 2500,
      qualityRating: 0.92,
      isRecommended: true,
      lastUpdated: '2024-01-15T10:00:00Z',
    },
    {
      id: 'microsoft/Phi-3.5-mini-instruct',
      name: 'Phi-3.5 Mini Instruct',
      provider: 'huggingface',
      capabilities: ['bio', 'project'],
      costPerRequest: 0.0001,
      avgResponseTime: 1800,
      qualityRating: 0.87,
      isRecommended: true,
      lastUpdated: '2024-01-15T10:00:00Z',
    },
    {
      id: 'mistralai/Mistral-7B-Instruct-v0.3',
      name: 'Mistral 7B Instruct v0.3',
      provider: 'huggingface',
      capabilities: ['bio', 'project', 'template'],
      costPerRequest: 0.0002,
      avgResponseTime: 2200,
      qualityRating: 0.89,
      isRecommended: false,
      lastUpdated: '2024-01-15T10:00:00Z',
    },
  ];

  it('should return available models successfully', async () => {
    mockHuggingFaceInstance.getAvailableModels.mockResolvedValue(mockModels);

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      data: {
        models: mockModels,
        totalModels: 3,
        lastUpdated: expect.any(String),
      },
    });
    expect(mockHuggingFaceInstance.getAvailableModels).toHaveBeenCalled();
  });

  it('should apply cache headers to response', async () => {
    mockHuggingFaceInstance.getAvailableModels.mockResolvedValue(mockModels);

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    await GET();

    expect(withCacheHeaders).toHaveBeenCalled();
    expect(generateETag).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          models: mockModels,
        }),
      })
    );
  });

  it('should return recommended models first', async () => {
    mockHuggingFaceInstance.getAvailableModels.mockResolvedValue(mockModels);

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET();
    const data = await response.json();

    const recommendedModels = data.data.models.filter(
      (m: any) => m.isRecommended
    );
    expect(recommendedModels).toHaveLength(2);
    expect(recommendedModels[0].id).toBe(
      'meta-llama/Meta-Llama-3.1-8B-Instruct'
    );
    expect(recommendedModels[1].id).toBe('microsoft/Phi-3.5-mini-instruct');
  });

  it('should include model capabilities', async () => {
    mockHuggingFaceInstance.getAvailableModels.mockResolvedValue(mockModels);

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET();
    const data = await response.json();

    const llamaModel = data.data.models.find((m: any) =>
      m.id.includes('Llama')
    );
    expect(llamaModel.capabilities).toContain('bio');
    expect(llamaModel.capabilities).toContain('project');
    expect(llamaModel.capabilities).toContain('template');
  });

  it('should return fallback models on error', async () => {
    const error = new Error('API unavailable');
    mockHuggingFaceInstance.getAvailableModels.mockRejectedValue(error);

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      success: true,
      data: {
        models: expect.arrayContaining([
          expect.objectContaining({
            id: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
            name: 'Llama 3.1 8B Instruct',
          }),
          expect.objectContaining({
            id: 'microsoft/Phi-3.5-mini-instruct',
            name: 'Phi-3.5 Mini Instruct',
          }),
        ]),
        fallback: true,
        totalModels: 2,
      },
    });
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to fetch available models',
      error
    );
  });

  it('should include cost information', async () => {
    mockHuggingFaceInstance.getAvailableModels.mockResolvedValue(mockModels);

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET();
    const data = await response.json();

    data.data.models.forEach((model: any) => {
      expect(model).toHaveProperty('costPerRequest');
      expect(typeof model.costPerRequest).toBe('number');
      expect(model.costPerRequest).toBeGreaterThan(0);
    });
  });

  it('should include performance metrics', async () => {
    mockHuggingFaceInstance.getAvailableModels.mockResolvedValue(mockModels);

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET();
    const data = await response.json();

    data.data.models.forEach((model: any) => {
      expect(model).toHaveProperty('avgResponseTime');
      expect(model).toHaveProperty('qualityRating');
      expect(model.avgResponseTime).toBeGreaterThan(0);
      expect(model.qualityRating).toBeGreaterThan(0);
      expect(model.qualityRating).toBeLessThanOrEqual(1);
    });
  });

  it('should handle empty models list', async () => {
    mockHuggingFaceInstance.getAvailableModels.mockResolvedValue([]);

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.models).toEqual([]);
    expect(data.data.totalModels).toBe(0);
  });

  it('should include lastUpdated timestamp', async () => {
    mockHuggingFaceInstance.getAvailableModels.mockResolvedValue(mockModels);

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET();
    const data = await response.json();

    expect(data.data.lastUpdated).toBeDefined();
    expect(new Date(data.data.lastUpdated).toISOString()).toBe(
      data.data.lastUpdated
    );
  });

  it('should handle non-Error exceptions', async () => {
    mockHuggingFaceInstance.getAvailableModels.mockRejectedValue(
      'String error'
    );

    const _request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.fallback).toBe(true);
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to fetch available models',
      { error: 'String error' }
    );
  });
});

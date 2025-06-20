import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/v1/ai/models/route';

jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn().mockImplementation(() => ({
    getAvailableModels: jest.fn().mockResolvedValue([
      { id: 'model-1', name: 'Model 1' },
      { id: 'model-2', name: 'Model 2' },
    ]),
  })),
}));

jest.mock('@/lib/cache/cache-headers', () => ({ 
  setCacheHeaders: jest.fn(),
 }));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('GET /api/v1/ai/models', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return available AI models', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/ai/models');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.models).toHaveLength(2);
    expect(result.data.models[0]).toHaveProperty('id', 'model-1');
  });
});
/**
 * Bio Enhancement API test suite - working version
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/enhance-bio/route';

// Mock dependencies
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn().mockImplementation(() => ({
    enhanceBio: jest.fn().mockResolvedValue({
      enhancedBio: 'Enhanced professional bio text',
      suggestions: [
        'Add quantifiable achievements',
        'Include specific technologies',
      ],
      qualityScore: {
        overall: 0.85,
        clarity: 0.9,
        professionalism: 0.88,
        keywords: 0.8,
        engagement: 0.82,
      },
      metadata: {
        model: 'llama-3-8b-instruct',
        processingTime: 1234,
        wordCount: 28,
        readabilityScore: 75,
      },
    }),
    isAvailable: jest.fn().mockResolvedValue(true),
  })),
}));

const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue({ data: [], error: null }),
  }),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => Promise.resolve(mockSupabase)),
}));

describe('Bio Enhancement API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('enhances bio for authenticated user', async () => {
    // Setup authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/ai/enhance-bio',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: 'I am a software developer with experience in web applications.',
          options: {
            tone: 'professional',
            model: 'llama-3-8b-instruct',
          },
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('enhancedBio');
    expect(data).toHaveProperty('suggestions');
    expect(data).toHaveProperty('qualityScore');
    expect(data.enhancedBio).toBe('Enhanced professional bio text');
  });

  test('returns 401 when not authenticated', async () => {
    // No user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/ai/enhance-bio',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: 'Test bio' }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toContain('Unauthorized');
  });

  test('validates required bio field', async () => {
    // Setup auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/ai/enhance-bio',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: '' }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Bio cannot be empty');
  });

  test('validates bio length', async () => {
    // Setup auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/ai/enhance-bio',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: 'Short' }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Bio must be at least 10 characters');
  });

  test('enforces rate limiting', async () => {
    // Setup auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    // Mock rate limit exceeded
    mockSupabase.from().limit.mockResolvedValueOnce({
      data: Array(10).fill({ created_at: new Date() }),
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/ai/enhance-bio',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: 'I am a software developer with experience.',
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toContain('Rate limit exceeded');
  });

  test('tracks usage in database', async () => {
    // Setup auth
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/ai/enhance-bio',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bio: 'I am a software developer with experience in web applications.',
        }),
      }
    );

    await POST(request);

    // Verify usage tracking
    expect(mockSupabase.from).toHaveBeenCalledWith('ai_usage');
    expect(mockSupabase.from().insert).toHaveBeenCalled();
  });
});

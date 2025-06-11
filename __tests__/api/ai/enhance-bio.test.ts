/**
 * Bio Enhancement API test suite - working version
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/enhance-bio/route';

// Mock dependencies
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn().mockImplementation(() => ({
    enhanceBio: jest.fn().mockResolvedValue({
      content: 'Enhanced professional bio text',
      confidence: 0.85,
      suggestions: [
        'Add quantifiable achievements',
        'Include specific technologies',
      ],
      wordCount: 28,
      qualityScore: 85,
      enhancementType: 'bio',
    }),
    healthCheck: jest.fn().mockResolvedValue(true),
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
          context: {
            title: 'Software Developer',
            skills: ['JavaScript', 'React', 'Node.js'],
            tone: 'professional',
            targetLength: 'concise',
          },
        }),
      }
    );

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    expect(data.data).toHaveProperty(
      'content',
      'Enhanced professional bio text'
    );
    expect(data.data).toHaveProperty('confidence', 0.85);
    expect(data.data).toHaveProperty('qualityScore', 85);
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
    expect(data.error).toContain('Authentication required');
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
        body: JSON.stringify({
          bio: '',
          context: {
            title: 'Software Developer',
            skills: ['JavaScript'],
          },
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid request data');
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
        body: JSON.stringify({
          bio: 'Short',
          context: {
            title: 'Software Developer',
            skills: ['JavaScript'],
          },
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid request data');
  });

  test.skip('enforces rate limiting', async () => {
    // TODO: Implement rate limiting in the API first
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
          context: {
            title: 'Software Developer',
            skills: ['JavaScript'],
          },
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
          context: {
            title: 'Software Developer',
            skills: ['JavaScript'],
          },
        }),
      }
    );

    await POST(request);

    // Verify usage tracking
    expect(mockSupabase.from).toHaveBeenCalledWith('ai_usage_logs');
    expect(mockSupabase.from().insert).toHaveBeenCalled();
  });
});

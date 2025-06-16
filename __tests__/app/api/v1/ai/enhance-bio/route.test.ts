import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/v1/ai/enhance-bio/route';
import { HuggingFaceService } from '@/lib/ai/huggingface-service';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/ai/huggingface-service');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/utils/logger');

// Mock HuggingFaceService
const mockHuggingFaceService = HuggingFaceService as jest.MockedClass<
  typeof HuggingFaceService
>;

// Mock createClient
const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>;

describe('/api/v1/ai/enhance-bio', () => {
  let mockSupabaseClient: any;
  let mockUser: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock user
    mockUser = {
      id: 'test-user-123',
      email: 'test@example.com',
    };

    // Setup mock Supabase client
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
    };

    mockCreateClient.mockResolvedValue(mockSupabaseClient as any);

    // Setup HuggingFace service mock
    mockHuggingFaceService.prototype.healthCheck = jest
      .fn()
      .mockResolvedValue(true);
    mockHuggingFaceService.prototype.enhanceBio = jest.fn().mockResolvedValue({
      content: 'Enhanced bio content',
      qualityScore: 0.85,
      confidence: 0.9,
      suggestions: ['Consider adding specific achievements'],
    });
  });

  describe('POST /api/v1/ai/enhance-bio', () => {
    it('should enhance bio successfully for authenticated user', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bio: 'I am a software developer with 5 years of experience.',
            context: {
              title: 'Senior Software Engineer',
              skills: ['JavaScript', 'React', 'Node.js'],
              experience: [
                {
                  company: 'Tech Corp',
                  position: 'Software Engineer',
                  yearsExperience: 5,
                },
              ],
              industry: 'Technology',
              tone: 'professional',
              targetLength: 'concise',
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual({
        content: 'Enhanced bio content',
        qualityScore: 0.85,
        confidence: 0.9,
        suggestions: ['Consider adding specific achievements'],
      });
      expect(data.metadata).toHaveProperty('originalLength');
      expect(data.metadata).toHaveProperty('enhancedLength');
      expect(data.metadata).toHaveProperty('processingTime');

      // Verify AI service was called correctly
      expect(mockHuggingFaceService.prototype.enhanceBio).toHaveBeenCalledWith(
        'I am a software developer with 5 years of experience.',
        expect.objectContaining({
          title: 'Senior Software Engineer',
          skills: ['JavaScript', 'React', 'Node.js'],
        })
      );

      // Verify AI usage was logged
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_usage_logs');
      expect(mockSupabaseClient.insert).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bio: 'Test bio',
            context: {
              title: 'Developer',
              skills: ['JavaScript'],
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return 400 for invalid request body', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bio: 'Too short', // Less than 10 characters
            context: {
              title: '', // Empty title
              skills: [], // No skills
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.errors).toBeDefined();
    });

    it('should handle AI service unavailability', async () => {
      mockHuggingFaceService.prototype.healthCheck.mockResolvedValue(false);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bio: 'I am a software developer with 5 years of experience.',
            context: {
              title: 'Senior Software Engineer',
              skills: ['JavaScript'],
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(data.error.message).toContain(
        'AI service temporarily unavailable'
      );
    });

    it('should handle database connection failure', async () => {
      mockCreateClient.mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bio: 'Test bio content',
            context: {
              title: 'Developer',
              skills: ['JavaScript'],
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(data.error.message).toContain('Database connection failed');
    });

    it('should validate bio length constraints', async () => {
      const longBio = 'a'.repeat(1001); // Exceeds max length

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bio: longBio,
            context: {
              title: 'Developer',
              skills: ['JavaScript'],
            },
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/ai/enhance-bio', () => {
    it('should return enhancement history for authenticated user', async () => {
      const mockHistory = [
        {
          id: '1',
          user_id: 'test-user-123',
          operation_type: 'bio_enhancement',
          metadata: { qualityScore: 0.85 },
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          user_id: 'test-user-123',
          operation_type: 'bio_enhancement',
          metadata: { qualityScore: 0.9 },
          created_at: '2024-01-02T00:00:00Z',
        },
      ];

      mockSupabaseClient.limit.mockResolvedValue({
        data: mockHistory,
        error: null,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.history).toEqual(mockHistory);
      expect(data.data.totalEnhancements).toBe(2);

      // Verify correct query was made
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('ai_usage_logs');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        'user_id',
        'test-user-123'
      );
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        'operation_type',
        'bio_enhancement'
      );
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(mockSupabaseClient.limit).toHaveBeenCalledWith(10);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should handle database query errors', async () => {
      mockSupabaseClient.limit.mockResolvedValue({
        data: null,
        error: new Error('Database query failed'),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });

    it('should return empty history when no enhancements exist', async () => {
      mockSupabaseClient.limit.mockResolvedValue({
        data: [],
        error: null,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/enhance-bio',
        {
          method: 'GET',
        }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.history).toEqual([]);
      expect(data.data.totalEnhancements).toBe(0);
    });
  });
});

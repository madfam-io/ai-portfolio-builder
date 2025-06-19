import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, PUT } from '@/app/api/v1/ai/models/selection/route';
import { logger } from '@/lib/utils/logger';
import { setupCommonMocks } from '@/__tests__/utils/api-route-test-helpers';

// Import createClient after the mock
const { createClient } = require('@/lib/supabase/server');

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@/lib/utils/logger');

describe('AI Model Selection API Routes', () => {
  setupCommonMocks();

  let mockSupabaseClient: any;
  let mockAuth: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth methods
    mockAuth = {
      getUser: jest.fn(),
    };

    // Mock Supabase client
    mockSupabaseClient = {
      auth: mockAuth,
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);

    // Mock logger
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  describe('GET /api/v1/ai/models/selection', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockPreferences = {
      preferences: {
        bio: 'custom-model/bio-enhanced',
        project: 'custom-model/project-optimizer',
        template: 'custom-model/template-recommender',
        scoring: 'custom-model/scorer',
      },
    };

    it('should return user model preferences successfully', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockPreferences,
          error: null,
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: mockPreferences.preferences,
        isDefault: false,
      });
      expect(mockSelect.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('should return default models for unauthenticated users', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: null } });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          bio: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
          project: 'microsoft/Phi-3.5-mini-instruct',
          template: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
          scoring: 'microsoft/DialoGPT-medium',
        },
        isDefault: true,
      });
    });

    it('should return defaults when user has no preferences', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' },
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.isDefault).toBe(true);
      expect(data.data).toHaveProperty('bio');
      expect(data.data).toHaveProperty('project');
      expect(data.data).toHaveProperty('template');
      expect(data.data).toHaveProperty('scoring');
    });

    it('should handle database connection errors', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });

    it('should handle database query errors', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database error'),
        }),
      };

      mockSupabaseClient.from.mockReturnValue(mockSelect);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to get model selection');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/ai/models/selection', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const validUpdateData = {
      taskType: 'bio',
      modelId: 'new-model/bio-v2',
    };

    it('should update model preference successfully', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            preferences: {
              bio: 'old-model',
              project: 'existing-project-model',
            },
          },
          error: null,
        }),
      };

      const mockUpsert = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockInsert = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSelect) // Get current preferences
        .mockReturnValueOnce(mockUpsert) // Update preferences
        .mockReturnValueOnce(mockInsert); // Log usage

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/models/selection',
        {
          method: 'PUT',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          taskType: 'bio',
          modelId: 'new-model/bio-v2',
          preferences: {
            bio: 'new-model/bio-v2',
            project: 'existing-project-model',
          },
        },
      });

      expect(mockUpsert.upsert).toHaveBeenCalledWith(
        {
          user_id: 'user-123',
          preferences: {
            bio: 'new-model/bio-v2',
            project: 'existing-project-model',
          },
          updated_at: expect.any(String),
        },
        { onConflict: 'user_id' }
      );
    });

    it('should create new preferences for first-time users', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116' },
        }),
      };

      const mockUpsert = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockInsert = {
        insert: jest.fn().mockResolvedValue({ error: null }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSelect)
        .mockReturnValueOnce(mockUpsert)
        .mockReturnValueOnce(mockInsert);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/models/selection',
        {
          method: 'PUT',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.preferences).toEqual({
        bio: 'new-model/bio-v2',
      });
    });

    it('should return 401 when not authenticated', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: null } });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/models/selection',
        {
          method: 'PUT',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    it('should validate task type', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const invalidData = {
        taskType: 'invalid-type',
        modelId: 'some-model',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/models/selection',
        {
          method: 'PUT',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should validate model ID is not empty', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const invalidData = {
        taskType: 'bio',
        modelId: '',
      };

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/models/selection',
        {
          method: 'PUT',
          body: JSON.stringify(invalidData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should handle database connection errors', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/models/selection',
        {
          method: 'PUT',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database connection failed');
    });

    it('should handle update errors', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { preferences: {} },
          error: null,
        }),
      };

      const mockUpsert = {
        upsert: jest.fn().mockResolvedValue({
          error: new Error('Update failed'),
        }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSelect)
        .mockReturnValueOnce(mockUpsert);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/models/selection',
        {
          method: 'PUT',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update model selection');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should continue even if logging fails', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: mockUser } });

      const mockSelect = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { preferences: {} },
          error: null,
        }),
      };

      const mockUpsert = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };

      const mockInsert = {
        insert: jest.fn().mockResolvedValue({
          error: new Error('Logging failed'),
        }),
      };

      mockSupabaseClient.from
        .mockReturnValueOnce(mockSelect)
        .mockReturnValueOnce(mockUpsert)
        .mockReturnValueOnce(mockInsert);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/ai/models/selection',
        {
          method: 'PUT',
          body: JSON.stringify(validUpdateData),
        }
      );

      const response = await PUT(request);
      const data = await response.json();

      // Should still succeed despite logging failure
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(logger.error).toHaveBeenCalledWith(
        'Failed to log model selection',
        expect.any(Error)
      );
    });
  });
});

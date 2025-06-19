import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/v1/portfolios/[id]/route';
import { createClient } from '@/lib/supabase/server';
import { AuthenticatedRequest } from '@/lib/api/middleware/auth';
import { setupCommonMocks, createMockRequest } from '@/__tests__/utils/api-route-test-helpers';


// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/v1/portfolios/[id]', () => {
  setupCommonMocks();

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
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis()
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('GET /api/v1/portfolios/[id]', () => {
    it('should retrieve portfolio successfully', async () => {
      const mockPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        name: 'My Portfolio',
        title: 'Software Developer',
        bio: 'Experienced developer',
        template: 'modern',
        status: 'draft',
        data: {
          experience: [],
          projects: [],
          skills: [],
        },
        created_at: '2025-06-15T10:00:00Z',
        updated_at: '2025-06-15T10:00:00Z',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      const request = {
        user: mockUser,
        url: 'http://localhost:3000/api/v1/portfolios/portfolio-123',
        method: 'GET',
      } as unknown as AuthenticatedRequest;

      const response = await GET(request, { params: { id: 'portfolio-123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(data.data.id).toBe('portfolio-123');
      expect(data.data.name).toBe('My Portfolio');
    });

    it('should return 404 for non-existent portfolio', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const request = {
        user: mockUser,
        url: 'http://localhost:3000/api/v1/portfolios/non-existent',
        method: 'GET',
      } as unknown as AuthenticatedRequest;

      const response = await GET(request, { params: { id: 'non-existent' } });
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Portfolio not found');
    });

    it('should return 403 for unauthorized access', async () => {
      const mockPortfolio = {
        id: 'portfolio-123',
        user_id: 'different-user-456',
        name: 'Someone Else Portfolio',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockPortfolio,
        error: null,
      });

      const request = {
        user: mockUser,
        url: 'http://localhost:3000/api/v1/portfolios/portfolio-123',
        method: 'GET',
      } as unknown as AuthenticatedRequest;

      const response = await GET(request, { params: { id: 'portfolio-123' } });
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toBe('Not authorized to access this portfolio');
    });

    it('should handle database service unavailable', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const request = {
        user: mockUser,
        url: 'http://localhost:3000/api/v1/portfolios/portfolio-123',
        method: 'GET',
      } as unknown as AuthenticatedRequest;

      const response = await GET(request, { params: { id: 'portfolio-123' } });
      expect(response.status).toBe(503);

      const data = await response.json();
      expect(data.error).toBe('Database service not available');
    });
  });

  describe('PUT /api/v1/portfolios/[id]', () => {
    it('should update portfolio successfully', async () => {
      const mockExistingPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        name: 'Old Name',
        title: 'Old Title',
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockExistingPortfolio,
        error: null,
      });

      const updatedPortfolio = {
        ...mockExistingPortfolio,
        name: 'Updated Portfolio',
        title: 'Senior Developer',
        bio: 'Updated bio',
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: updatedPortfolio,
        error: null,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Updated Portfolio',
            title: 'Senior Developer',
            bio: 'Updated bio',
          }),
        }
      );

      (request as any).user = mockUser;

      const response = await PUT(request as AuthenticatedRequest, {
        params: { id: 'portfolio-123' },
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.name).toBe('Updated Portfolio');
      expect(data.data.title).toBe('Senior Developer');
    });

    it('should validate update data', async () => {
      const mockExistingPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        name: 'My Portfolio',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockExistingPortfolio,
        error: null,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: '', // Invalid: empty name
            title: 'A'.repeat(201), // Invalid: too long
            invalidField: 'should be removed', // Should be sanitized
          }),
        }

      (request as any).user = mockUser;

      const response = await PUT(request as AuthenticatedRequest, {
        params: { id: 'portfolio-123' },
      });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Validation failed');
      expect(data.details).toBeDefined();
    });

    it('should handle partial updates', async () => {
      const mockExistingPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        name: 'My Portfolio',
        title: 'Developer',
        bio: 'Current bio',
        template: 'modern',
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockExistingPortfolio,
        error: null,
      });

      const partiallyUpdated = {
        ...mockExistingPortfolio,
        bio: 'Updated bio only',
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: partiallyUpdated,
        error: null,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bio: 'Updated bio only',
          }),
        }

      (request as any).user = mockUser;

      const response = await PUT(request as AuthenticatedRequest, {
        params: { id: 'portfolio-123' },
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.bio).toBe('Updated bio only');
      expect(data.data.name).toBe('My Portfolio'); // Unchanged
      expect(data.data.title).toBe('Developer'); // Unchanged
    });

    it('should handle update conflicts', async () => {
      const mockExistingPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        name: 'My Portfolio',
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockExistingPortfolio,
        error: null,
      });

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subdomain: 'existing-subdomain',
          }),
        }

      (request as any).user = mockUser;

      const response = await PUT(request as AuthenticatedRequest, {
        params: { id: 'portfolio-123' },
      });
      expect(response.status).toBe(409);

      const data = await response.json();
      expect(data.error).toBe('Subdomain already taken');
    });
  });

  describe('DELETE /api/v1/portfolios/[id]', () => {
    it('should delete portfolio successfully', async () => {
      const mockPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        name: 'Portfolio to Delete',
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockPortfolio,
        error: null,
      });

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockPortfolio,
        error: null,
      });

      const request = {
        user: mockUser,
        url: 'http://localhost:3000/api/v1/portfolios/portfolio-123',
        method: 'DELETE',
      } as unknown as AuthenticatedRequest;

      const response = await DELETE(request, {
        params: { id: 'portfolio-123' },
      });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toEqual({ success: true });
      expect(data.message).toBe('Portfolio deleted successfully');
    });

    it('should prevent deleting published portfolios', async () => {
      const mockPublishedPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        name: 'Published Portfolio',
        status: 'published',
      };

      mockSupabaseClient.single.mockResolvedValue({
        data: mockPublishedPortfolio,
        error: null,
      });

      const request = {
        user: mockUser,
        url: 'http://localhost:3000/api/v1/portfolios/portfolio-123',
        method: 'DELETE',
      } as unknown as AuthenticatedRequest;

      const response = await DELETE(request, {
        params: { id: 'portfolio-123' },
      });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe(
        'Cannot delete published portfolio. Please unpublish first.'

    });

    it('should handle deletion of non-existent portfolio', async () => {
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const request = {
        user: mockUser,
        url: 'http://localhost:3000/api/v1/portfolios/non-existent',
        method: 'DELETE',
      } as unknown as AuthenticatedRequest;

      const response = await DELETE(request, {
        params: { id: 'non-existent' },
      });
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Portfolio not found');
    });

    it('should handle database errors during deletion', async () => {
      const mockPortfolio = {
        id: 'portfolio-123',
        user_id: 'test-user-123',
        name: 'Portfolio',
        status: 'draft',
      };

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: mockPortfolio,
        error: null,
      });

      mockSupabaseClient.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' },
      });

      const request = {
        user: mockUser,
        url: 'http://localhost:3000/api/v1/portfolios/portfolio-123',
        method: 'DELETE',
      } as unknown as AuthenticatedRequest;

      const response = await DELETE(request, {
        params: { id: 'portfolio-123' },
      });
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe('Failed to delete portfolio');
    });
  });
});

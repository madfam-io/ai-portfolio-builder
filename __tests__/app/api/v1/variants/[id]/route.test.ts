/**
 * @jest-environment node
 */

import { jest } from '@jest/globals';
import { setupCommonMocks, createMockRequest } from '@/__tests__/utils/api-route-test-helpers';


describe('/api/v1/variants/[id]', () => {
  const mockVariant = {
    id: 'variant-123',
    portfolioId: 'portfolio-456',
    name: 'Tech Recruiter Version',
    description: 'Optimized for technical recruiters',
    targetAudience: 'recruiters',
    isActive: true,
    content: {
      bio: 'Senior developer focused on scalable solutions',
      projects: [
        {
          id: 'proj-1',
          title: 'Cloud Migration',
          description: 'Led migration of monolith to microservices',
        },
      ],
    },
    metadata: {
      keywords: ['cloud', 'microservices', 'leadership'],
      tone: 'professional',
    },
    performance: {
      views: 150,
      clicks: 45,
      conversionRate: 0.3,
    },
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-15T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/variants/[id]', () => {
    it('should retrieve a variant by ID', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockVariant,
              error: null,
            }),
          })),
        },
      });

      const { GET } = await import('@/app/api/v1/variants/[id]/route');
      
      const request = createMockRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        { params: { id: 'variant-123' } }

      const response = await GET(request, { params: { id: 'variant-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockVariant);
    });

    it('should verify user owns the portfolio', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: jest.fn((table: string) => {
            if (table === 'portfolios') {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: { id: 'portfolio-456', userId: 'user-123' },
                  error: null,
                }),
              };
            }
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockVariant,
                error: null,
              }),
            };
          }),
        },
      });

      const { GET } = await import('@/app/api/v1/variants/[id]/route');
      
      const request = createMockRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        { params: { id: 'variant-123' } }

      const response = await GET(request, { params: { id: 'variant-123' } });
      expect(response.status).toBe(200);
    });

    it('should return 404 if variant not found', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows found' },
            }),
          })),
        },
      });

      const { GET } = await import('@/app/api/v1/variants/[id]/route');
      
      const request = createMockRequest(
        'http://localhost:3000/api/v1/variants/non-existent',
        { params: { id: 'non-existent' } }

      const response = await GET(request, { params: { id: 'non-existent' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Variant not found');
    });
  });

  describe('PUT /api/v1/variants/[id]', () => {
    it('should update variant content', async () => {
      const updateData = {
        content: {
          bio: 'Updated bio for recruiters',
        },
      };

      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: jest.fn((table: string) => {
            if (table === 'portfolios') {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: { id: 'portfolio-456', userId: 'user-123' },
                  error: null,
                }),
              };
            }
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockVariant,
                error: null,
              }),
              update: jest.fn().mockReturnThis(),
            };
          }),
        },
      });

      const { PUT } = await import('@/app/api/v1/variants/[id]/route');
      
      const request = createMockRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        { 
          method: 'PUT',
          body: updateData,
          params: { id: 'variant-123' } 
        }

      const response = await PUT(request, { params: { id: 'variant-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        ...mockVariant,
        ...updateData,
      });
    });

    it('should validate variant update data', async () => {
      const invalidData = {
        content: 'not an object', // Should be object
      };

      setupCommonMocks();

      const { PUT } = await import('@/app/api/v1/variants/[id]/route');
      
      const request = createMockRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        { 
          method: 'PUT',
          body: invalidData,
          params: { id: 'variant-123' } 
        }

      const response = await PUT(request, { params: { id: 'variant-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid update data');
    });
  });

  describe('DELETE /api/v1/variants/[id]', () => {
    it('should delete variant', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: jest.fn((table: string) => {
            if (table === 'portfolios') {
              return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: { id: 'portfolio-456', userId: 'user-123' },
                  error: null,
                }),
              };
            }
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: mockVariant,
                error: null,
              }),
              delete: jest.fn().mockReturnThis(),
            };
          }),
        },
      });

      const { DELETE } = await import('@/app/api/v1/variants/[id]/route');
      
      const request = createMockRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        { 
          method: 'DELETE',
          params: { id: 'variant-123' } 
        }

      const response = await DELETE(request, { params: { id: 'variant-123' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Variant deleted successfully');
    });

    it('should prevent deleting active variant', async () => {
      setupCommonMocks({
        supabase: {
          auth: {
            getUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'user-123' } },
              error: null,
            }),
          },
          from: jest.fn(() => ({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { ...mockVariant, isActive: true },
              error: null,
            }),
          })),
        },
      });

      const { DELETE } = await import('@/app/api/v1/variants/[id]/route');
      
      const request = createMockRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        { 
          method: 'DELETE',
          params: { id: 'variant-123' } 
        }

      const response = await DELETE(request, { params: { id: 'variant-123' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot delete active variant');
    });
  });
});

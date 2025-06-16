import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/v1/variants/[id]/route';
import { createClient } from '@/lib/supabase/server';

// Mock dependencies
jest.mock('@/lib/services/error/error-logger');
jest.mock('@/lib/services/error/api-error-handler');
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));

describe('/api/v1/variants/[id]', () => {
  let mockRequest: NextRequest;
  let mockSupabase: any;
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

    // Mock Supabase client
    mockSupabase = {
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
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
      })),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  describe('GET /api/v1/variants/[id]', () => {
    it('should retrieve a variant by ID', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123'
      );
      const params = { id: 'variant-123' };

      const response = await GET(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockVariant);
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolio_variants');
    });

    it('should verify user owns the portfolio', async () => {
      // Mock portfolio ownership check
      mockSupabase.from.mockImplementation((table: string) => {
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
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123'
      );
      const params = { id: 'variant-123' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(200);
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
    });

    it('should return 404 for non-existent variant', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'Not found' },
        }),
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/non-existent'
      );
      const params = { id: 'non-existent' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(404);
    });

    it('should return 403 if user does not own the portfolio', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolios') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'portfolio-456', userId: 'other-user' },
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
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123'
      );
      const params = { id: 'variant-123' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/v1/variants/[id]', () => {
    it('should update a variant', async () => {
      const updateData = {
        name: 'Updated Recruiter Version',
        description: 'Better optimized for FAANG recruiters',
        content: {
          bio: 'Senior engineer with FAANG experience',
        },
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        {
          method: 'PUT',
          body: JSON.stringify(updateData),
        }
      );
      const params = { id: 'variant-123' };

      const updatedVariant = { ...mockVariant, ...updateData };
      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: updatedVariant,
          error: null,
        }),
      });

      const response = await PUT(mockRequest, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe(updateData.name);
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolio_variants');
    });

    it('should validate update data', async () => {
      const invalidData = {
        name: '', // Empty name should be invalid
        targetAudience: 'invalid-audience-type',
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        {
          method: 'PUT',
          body: JSON.stringify(invalidData),
        }
      );
      const params = { id: 'variant-123' };

      const response = await PUT(mockRequest, { params });

      expect(response.status).toBe(400);
    });

    it('should update variant performance metrics', async () => {
      const performanceUpdate = {
        performance: {
          views: 200,
          clicks: 60,
          conversionRate: 0.35,
        },
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        {
          method: 'PUT',
          body: JSON.stringify(performanceUpdate),
        }
      );
      const params = { id: 'variant-123' };

      const response = await PUT(mockRequest, { params });

      expect(response.status).toBe(200);
    });

    it('should handle partial updates', async () => {
      const partialUpdate = {
        isActive: false,
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        {
          method: 'PUT',
          body: JSON.stringify(partialUpdate),
        }
      );
      const params = { id: 'variant-123' };

      const response = await PUT(mockRequest, { params });

      expect(response.status).toBe(200);
    });

    it('should update metadata and keywords', async () => {
      const metadataUpdate = {
        metadata: {
          keywords: ['aws', 'kubernetes', 'terraform'],
          tone: 'technical',
          emphasis: ['leadership', 'architecture'],
        },
      };

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        {
          method: 'PUT',
          body: JSON.stringify(metadataUpdate),
        }
      );
      const params = { id: 'variant-123' };

      const response = await PUT(mockRequest, { params });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/variants/[id]', () => {
    it('should delete a variant', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        {
          method: 'DELETE',
        }
      );
      const params = { id: 'variant-123' };

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({
          data: [mockVariant],
          error: null,
        }),
      });

      const response = await DELETE(mockRequest, { params });

      expect(response.status).toBe(204);
      expect(mockSupabase.from).toHaveBeenCalledWith('portfolio_variants');
    });

    it('should not delete the primary variant', async () => {
      const primaryVariant = { ...mockVariant, isPrimary: true };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: primaryVariant,
          error: null,
        }),
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        {
          method: 'DELETE',
        }
      );
      const params = { id: 'variant-123' };

      const response = await DELETE(mockRequest, { params });

      expect(response.status).toBe(400);
    });

    it('should handle deletion of active variant', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (
          table === 'portfolio_variants' &&
          !mockSupabase.from.mock.calls.length
        ) {
          // First call - check if variant is active
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { ...mockVariant, isActive: true },
              error: null,
            }),
          };
        } else if (table === 'portfolio_variants') {
          // Second call - deactivate before delete
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue({
              data: { ...mockVariant, isActive: false },
              error: null,
            }),
          };
        }
        return {
          delete: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValue({
            data: [mockVariant],
            error: null,
          }),
        };
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123',
        {
          method: 'DELETE',
        }
      );
      const params = { id: 'variant-123' };

      const response = await DELETE(mockRequest, { params });

      expect(response.status).toBe(204);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: new Error('Database connection failed'),
        }),
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123'
      );
      const params = { id: 'variant-123' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(500);
    });

    it('should require authentication', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/variant-123'
      );
      const params = { id: 'variant-123' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(401);
    });

    it('should handle invalid variant ID format', async () => {
      mockRequest = new NextRequest(
        'http://localhost:3000/api/v1/variants/invalid-id-format'
      );
      const params = { id: 'invalid-id-format' };

      const response = await GET(mockRequest, { params });

      expect(response.status).toBe(400);
    });
  });
});

import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/portfolios/[id]/variants/route';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { withAuth } from '@/lib/api/middleware/auth';
import type { CreateVariantInput } from '@/types/portfolio-variants';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@/lib/utils/logger');
jest.mock('@/lib/api/middleware/auth');

describe('/api/v1/portfolios/[id]/variants', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  const mockPortfolio = {
    id: 'portfolio-123',
    user_id: 'user-123',
  };

  const mockVariants = [
    {
      id: 'variant-1',
      portfolio_id: 'portfolio-123',
      name: 'Default',
      slug: 'default',
      is_default: true,
      is_published: true,
      content_overrides: {},
      audience_profile_id: null,
      audience_profile: null,
      ai_optimization: {},
      analytics: {},
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'variant-2',
      portfolio_id: 'portfolio-123',
      name: 'Tech Recruiters',
      slug: 'tech-recruiters',
      is_default: false,
      is_published: false,
      content_overrides: { bio: 'Customized bio for tech recruiters' },
      audience_profile_id: 'audience-1',
      audience_profile: {
        id: 'audience-1',
        type: 'recruiter',
        name: 'Tech Recruiters',
        industry: 'technology',
      },
      ai_optimization: { enhanced: true },
      analytics: { views: 50 },
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  const mockSupabase = {
    from: jest.fn(),
  };

  const params = { id: 'portfolio-123' };

  beforeEach(() => {
    jest.clearAllMocks();
    (createClient as jest.Mock).mockResolvedValue(mockSupabase);
    (logger.error as jest.Mock).mockImplementation(() => {});
    (logger.info as jest.Mock).mockImplementation(() => {});

    // Mock withAuth to pass through the handler with authenticated user
    (withAuth as jest.Mock).mockImplementation(handler => {
      return async (request: NextRequest, context: any) => {
        const authenticatedRequest = request as any;
        authenticatedRequest.user = mockUser;
        return handler(authenticatedRequest, context);
      };
    });
  });

  describe('GET /api/v1/portfolios/[id]/variants', () => {
    it('should return all variants for a portfolio', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolios') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockPortfolio,
              error: null,
            }),
          };
        }
        if (table === 'portfolio_variants') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: mockVariants,
              error: null,
            }),
          };
        }
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants'
      );

      const handler = GET as any;
      const response = await handler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.variants).toHaveLength(2);
      expect(data.data.variants[0]).toEqual({
        id: 'variant-1',
        portfolioId: 'portfolio-123',
        name: 'Default',
        slug: 'default',
        isDefault: true,
        isPublished: true,
        contentOverrides: {},
        audienceProfile: {
          id: null,
          type: 'general',
          name: 'General Audience',
        },
        aiOptimization: {},
        analytics: {},
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });
    });

    it('should return 503 when database is unavailable', async () => {
      (createClient as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants'
      );

      const handler = GET as any;
      const response = await handler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Database service not available');
    });

    it('should return 404 when portfolio not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants'
      );

      const handler = GET as any;
      const response = await handler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Portfolio not found');
    });

    it('should return 500 when database query fails', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolios') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockPortfolio,
              error: null,
            }),
          };
        }
        if (table === 'portfolio_variants') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          };
        }
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants'
      );

      const handler = GET as any;
      const response = await handler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch variants');
      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('POST /api/v1/portfolios/[id]/variants', () => {
    const createVariantInput: CreateVariantInput = {
      name: 'Enterprise Clients',
      audienceType: 'client',
      audienceDetails: {
        name: 'Enterprise Clients',
        description: 'Fortune 500 decision makers',
        industry: 'enterprise',
        companySize: 'large',
        keyPriorities: ['ROI', 'Security', 'Scalability'],
        painPoints: ['Legacy systems', 'Digital transformation'],
        decisionCriteria: ['Cost', 'Support', 'Integration'],
        importantKeywords: ['enterprise', 'scalable', 'secure'],
        avoidKeywords: ['startup', 'experimental'],
        communicationStyle: 'formal',
        preferredLength: 'detailed',
      },
    };

    it('should create a new variant with audience profile', async () => {
      const mockAudienceProfile = {
        id: 'audience-new',
        ...createVariantInput.audienceDetails,
      };

      const mockCreatedVariant = {
        id: 'variant-new',
        portfolio_id: 'portfolio-123',
        audience_profile_id: 'audience-new',
        name: 'Enterprise Clients',
        slug: 'enterprise-clients',
        is_default: false,
        is_published: false,
        content_overrides: {},
        audience_profile: mockAudienceProfile,
        ai_optimization: {},
        analytics: {},
        created_at: '2024-01-03T00:00:00Z',
        updated_at: '2024-01-03T00:00:00Z',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolios') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockPortfolio,
              error: null,
            }),
          };
        }
        if (table === 'audience_profiles') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockAudienceProfile,
              error: null,
            }),
          };
        }
        if (table === 'portfolio_variants') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockCreatedVariant,
              error: null,
            }),
          };
        }
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants',
        {
          method: 'POST',
          body: JSON.stringify(createVariantInput),
        }
      );

      const handler = POST as any;
      const response = await handler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.variant).toEqual({
        id: 'variant-new',
        portfolioId: 'portfolio-123',
        name: 'Enterprise Clients',
        slug: 'enterprise-clients',
        isDefault: false,
        isPublished: false,
        contentOverrides: {},
        audienceProfile: expect.objectContaining({
          id: 'audience-new',
          name: 'Enterprise Clients',
        }),
        aiOptimization: {},
        analytics: {},
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      });
      expect(logger.info).toHaveBeenCalledWith('Created portfolio variant', {
        userId: 'user-123',
        portfolioId: 'portfolio-123',
        variantId: 'variant-new',
      });
    });

    it('should create variant based on existing variant', async () => {
      const inputWithBase: CreateVariantInput = {
        name: 'Modified Enterprise',
        audienceType: 'client',
        basedOnVariant: 'variant-2',
      };

      const baseVariantOverrides = {
        bio: 'Custom bio',
        skills: ['Custom skills'],
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolios') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockPortfolio,
              error: null,
            }),
          };
        }
        if (table === 'portfolio_variants') {
          // First call to get base variant
          if (
            table === 'portfolio_variants' &&
            !mockSupabase.from.mock.calls.length
          ) {
            return {
              select: jest.fn().mockReturnThis(),
              eq: jest.fn().mockReturnThis(),
              single: jest.fn().mockResolvedValue({
                data: { content_overrides: baseVariantOverrides },
                error: null,
              }),
            };
          }
          // Second call to create new variant
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'variant-new',
                portfolio_id: 'portfolio-123',
                name: 'Modified Enterprise',
                slug: 'modified-enterprise',
                is_default: false,
                is_published: false,
                content_overrides: baseVariantOverrides,
                audience_profile: null,
                ai_optimization: {},
                analytics: {},
                created_at: '2024-01-03T00:00:00Z',
                updated_at: '2024-01-03T00:00:00Z',
              },
              error: null,
            }),
          };
        }
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants',
        {
          method: 'POST',
          body: JSON.stringify(inputWithBase),
        }
      );

      const handler = POST as any;
      const response = await handler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.variant.contentOverrides).toEqual(baseVariantOverrides);
    });

    it('should handle slug generation correctly', async () => {
      const inputWithSpecialChars: CreateVariantInput = {
        name: 'Tech & Start-ups (2024)',
        audienceType: 'general',
      };

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolios') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockPortfolio,
              error: null,
            }),
          };
        }
        if (table === 'portfolio_variants') {
          return {
            insert: jest.fn(data => {
              // Verify slug is generated correctly
              expect(data.slug).toBe('tech-start-ups-2024');
              return {
                select: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({
                  data: {
                    id: 'variant-new',
                    ...data,
                    created_at: '2024-01-03T00:00:00Z',
                    updated_at: '2024-01-03T00:00:00Z',
                  },
                  error: null,
                }),
              };
            }),
          };
        }
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants',
        {
          method: 'POST',
          body: JSON.stringify(inputWithSpecialChars),
        }
      );

      const handler = POST as any;
      const response = await handler(request, { params });

      expect(response.status).toBe(200);
    });

    it('should return 404 when portfolio not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Not found' },
        }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants',
        {
          method: 'POST',
          body: JSON.stringify(createVariantInput),
        }
      );

      const handler = POST as any;
      const response = await handler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Portfolio not found');
    });

    it('should return 500 when audience profile creation fails', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolios') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockPortfolio,
              error: null,
            }),
          };
        }
        if (table === 'audience_profiles') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          };
        }
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants',
        {
          method: 'POST',
          body: JSON.stringify(createVariantInput),
        }
      );

      const handler = POST as any;
      const response = await handler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create audience profile');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should return 500 when variant creation fails', async () => {
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'portfolios') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: mockPortfolio,
              error: null,
            }),
          };
        }
        if (table === 'portfolio_variants') {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Insert failed' },
            }),
          };
        }
      });

      const request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios/portfolio-123/variants',
        {
          method: 'POST',
          body: JSON.stringify({
            name: 'Simple Variant',
            audienceType: 'general',
          }),
        }
      );

      const handler = POST as any;
      const response = await handler(request, { params });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create variant');
      expect(logger.error).toHaveBeenCalled();
    });
  });
});

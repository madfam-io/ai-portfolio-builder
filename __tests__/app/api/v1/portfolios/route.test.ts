import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/portfolios/route';
import { createClient } from '@/lib/supabase/server';
import { AuthenticatedRequest } from '@/lib/api/middleware/auth';

// Mock dependencies
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/utils/logger');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

describe('/api/v1/portfolios', () => {
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
      or: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    // Mock createClient to return the mock Supabase client
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);
  });

  describe('GET /api/v1/portfolios', () => {
    it('should return portfolios for authenticated user', async () => {
      const mockPortfolios = [
        {
          id: 'portfolio-1',
          user_id: 'test-user-123',
          name: 'My Portfolio',
          slug: 'my-portfolio',
          template: 'developer',
          status: 'published',
          data: {
            title: 'John Doe',
            bio: 'Full-stack developer',
          },
          subdomain: 'johndoe',
          views: 100,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'portfolio-2',
          user_id: 'test-user-123',
          name: 'Design Portfolio',
          slug: 'design-portfolio',
          template: 'designer',
          status: 'draft',
          data: {
            title: 'Jane Designer',
            bio: 'Creative designer',
          },
          subdomain: 'janedesigner',
          views: 50,
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
        },
      ];

      // Mock successful query
      mockSupabaseClient.range.mockResolvedValue({
        data: mockPortfolios,
        error: null,
      });

      // Mock count query
      mockSupabaseClient.select.mockImplementation(
        (columns: string, options?: any) => {
          if (options?.count === 'exact' && options?.head === true) {
            return Promise.resolve({ count: 2, error: null });
          }
          return mockSupabaseClient;
        }
      );

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios'
      ) as AuthenticatedRequest;
      request.user = mockUser;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.portfolios).toHaveLength(2);
      expect(data.data.portfolios[0]).toEqual(mockPortfolios[0]);
      expect(data.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });

      // Verify correct queries were made
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('portfolios');
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        'user_id',
        'test-user-123'
      );
      expect(mockSupabaseClient.order).toHaveBeenCalledWith('updated_at', {
        ascending: false,
      });
      expect(mockSupabaseClient.range).toHaveBeenCalledWith(0, 9);
    });

    it('should handle pagination parameters', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabaseClient.select.mockImplementation(
        (columns: string, options?: any) => {
          if (options?.count === 'exact' && options?.head === true) {
            return Promise.resolve({ count: 50, error: null });
          }
          return mockSupabaseClient;
        }
      );

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios?page=3&limit=20'
      ) as AuthenticatedRequest;
      request.user = mockUser;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.pagination).toEqual({
        page: 3,
        limit: 20,
        total: 50,
        totalPages: 3,
      });

      // Verify pagination was applied correctly
      expect(mockSupabaseClient.range).toHaveBeenCalledWith(40, 59); // (page-1)*limit to from+limit-1
    });

    it('should filter by status', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios?status=published'
      ) as AuthenticatedRequest;
      request.user = mockUser;

      await GET(request);

      // Verify status filter was applied
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith('status', 'published');
    });

    it('should filter by template', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios?template=developer'
      ) as AuthenticatedRequest;
      request.user = mockUser;

      await GET(request);

      // Verify template filter was applied
      expect(mockSupabaseClient.eq).toHaveBeenCalledWith(
        'template',
        'developer'
      );
    });

    it('should handle search parameter', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: [],
        error: null,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios?search=john'
      ) as AuthenticatedRequest;
      request.user = mockUser;

      await GET(request);

      // Verify search filter was applied
      expect(mockSupabaseClient.or).toHaveBeenCalledWith(
        'name.ilike.%john%,data->>title.ilike.%john%,data->>bio.ilike.%john%'
      );
    });

    it('should handle database errors', async () => {
      mockSupabaseClient.range.mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios'
      ) as AuthenticatedRequest;
      request.user = mockUser;

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });
  });

  describe('POST /api/v1/portfolios', () => {
    it('should create a new portfolio successfully', async () => {
      const newPortfolio = {
        name: 'My New Portfolio',
        template: 'developer',
        title: 'John Developer',
        bio: 'Experienced full-stack developer',
      };

      const createdPortfolio = {
        id: 'test-uuid-123',
        user_id: 'test-user-123',
        name: 'My New Portfolio',
        slug: 'my-new-portfolio',
        template: 'developer',
        status: 'draft',
        data: {
          title: 'John Developer',
          bio: 'Experienced full-stack developer',
        },
        subdomain: 'my-new-portfolio',
        views: 0,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      // Mock subdomain check
      mockSupabaseClient.like.mockResolvedValue({
        data: [],
        error: null,
      });

      // Mock insert
      mockSupabaseClient.single.mockResolvedValue({
        data: createdPortfolio,
        error: null,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPortfolio),
        }
      ) as AuthenticatedRequest;
      request.user = mockUser;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Portfolio created successfully');
      expect(data.data.portfolio).toBeDefined();
      expect(data.data.portfolio.id).toBe('test-uuid-123');

      // Verify subdomain uniqueness check
      expect(mockSupabaseClient.like).toHaveBeenCalledWith(
        'subdomain',
        'my-new-portfolio%'
      );

      // Verify insert was called with correct data
      expect(mockSupabaseClient.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-123',
          user_id: 'test-user-123',
          name: 'My New Portfolio',
          template: 'developer',
          subdomain: 'my-new-portfolio',
        })
      );
    });

    it('should handle subdomain conflicts', async () => {
      const newPortfolio = {
        name: 'My Portfolio',
        template: 'designer',
        title: 'Jane Designer',
      };

      // Mock existing subdomains
      mockSupabaseClient.like.mockResolvedValue({
        data: [{ subdomain: 'my-portfolio' }, { subdomain: 'my-portfolio-1' }],
        error: null,
      });

      // Mock successful insert with unique subdomain
      mockSupabaseClient.single.mockResolvedValue({
        data: {
          id: 'test-uuid-123',
          subdomain: 'my-portfolio-2',
        },
        error: null,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          body: JSON.stringify(newPortfolio),
        }
      ) as AuthenticatedRequest;
      request.user = mockUser;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);

      // Verify the generated subdomain in the insert call
      const insertCall = mockSupabaseClient.insert.mock.calls[0][0];
      expect(insertCall.subdomain).toBe('my-portfolio-2');
    });

    it('should validate required fields', async () => {
      const invalidPortfolio = {
        // Missing required fields
        template: 'developer',
      };

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          body: JSON.stringify(invalidPortfolio),
        }
      ) as AuthenticatedRequest;
      request.user = mockUser;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.details.errors).toBeDefined();
    });

    it('should handle invalid JSON', async () => {
      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          body: 'Invalid JSON',
        }
      ) as AuthenticatedRequest;
      request.user = mockUser;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Invalid JSON');
    });

    it('should handle database insert errors', async () => {
      const newPortfolio = {
        name: 'My Portfolio',
        template: 'consultant',
        title: 'John Consultant',
      };

      // Mock subdomain check
      mockSupabaseClient.like.mockResolvedValue({
        data: [],
        error: null,
      });

      // Mock insert error
      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: new Error('Insert failed'),
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          body: JSON.stringify(newPortfolio),
        }
      ) as AuthenticatedRequest;
      request.user = mockUser;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('EXTERNAL_SERVICE_ERROR');
    });

    it('should handle unique constraint violations', async () => {
      const newPortfolio = {
        name: 'My Portfolio',
        template: 'developer',
        title: 'John Developer',
      };

      // Mock subdomain check
      mockSupabaseClient.like.mockResolvedValue({
        data: [],
        error: null,
      });

      // Mock unique constraint error
      const uniqueError: any = new Error('Unique constraint violation');
      uniqueError.code = '23505';

      mockSupabaseClient.single.mockResolvedValue({
        data: null,
        error: uniqueError,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          body: JSON.stringify(newPortfolio),
        }
      ) as AuthenticatedRequest;
      request.user = mockUser;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('CONFLICT_ERROR');
      expect(data.error.message).toContain('subdomain already exists');
    });

    it('should sanitize portfolio name for subdomain', async () => {
      const newPortfolio = {
        name: 'My Awesome Portfolio!!!   With Special @#$ Characters',
        template: 'designer',
        title: 'Creative Designer',
      };

      // Mock subdomain check
      mockSupabaseClient.like.mockResolvedValue({
        data: [],
        error: null,
      });

      // Mock insert
      mockSupabaseClient.single.mockResolvedValue({
        data: { id: 'test-uuid-123' },
        error: null,
      });

      const _request = new NextRequest(
        'http://localhost:3000/api/v1/portfolios',
        {
          method: 'POST',
          body: JSON.stringify(newPortfolio),
        }
      ) as AuthenticatedRequest;
      request.user = mockUser;

      await POST(request);

      // Verify subdomain was properly sanitized
      const insertCall = mockSupabaseClient.insert.mock.calls[0][0];
      expect(insertCall.subdomain).toBe(
        'my-awesome-portfolio-with-special-characters'
      );
    });
  });
});

/**
 * @jest-environment node
 */

// Mock modules first, before any imports
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn(),
  })
}));

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

jest.mock('@/lib/validation/portfolio', () => ({
  validateCreatePortfolio: jest.fn(),
  validatePortfolioQuery: jest.fn(),
  sanitizePortfolioData: jest.fn()
}));

jest.mock('@/lib/utils/portfolio-transformer', () => ({
  transformDbPortfolioToApi: jest.fn(p => p)
}));

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid')
}));

// Mock auth middleware to add user to request
jest.mock('@/lib/api/middleware/auth', () => ({
  withAuth: (handler: any) => (request: any) => {
    request.user = { id: 'test-user-id', email: 'test@example.com' };
    return handler(request);
  }
}));

// Mock response helpers
jest.mock('@/lib/api/response-helpers', () => ({
  apiSuccess: jest.fn((data, options = {}) => 
    new Response(JSON.stringify({ status: 'success', data }), {
      status: options.status || 200,
      headers: { 'Content-Type': 'application/json' }
    })
  ),
  apiError: jest.fn((message, options = {}) => 
    new Response(JSON.stringify({ 
      status: 'error', 
      message,
      ...(options.data && { data: options.data })
    }), {
      status: options.status || 500,
      headers: { 'Content-Type': 'application/json' }
    })
  ),
  versionedApiHandler: jest.fn((handler) => handler)
}));

// Now import everything after mocks are set up
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/portfolios/route';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';
import { validateCreatePortfolio, validatePortfolioQuery, sanitizePortfolioData } from '@/lib/validation/portfolio';

// Set up mock objects after imports
const mockSupabase = {
  from: jest.fn(),
  auth: {
    getUser: jest.fn()
  }
};

describe('Portfolio API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock implementations
    (createClient as jest.Mock).mockImplementation(async () => mockSupabase);
    
    (validatePortfolioQuery as jest.Mock).mockReturnValue({
      data: {
        page: 1,
        limit: 10
      }
    });
    
    (validateCreatePortfolio as jest.Mock).mockReturnValue({
      isValid: true,
      errors: []
    });
    
    (sanitizePortfolioData as jest.Mock).mockImplementation(data => data);
  });

  describe('GET /api/v1/portfolios', () => {
    it('should fetch portfolios successfully', async () => {
      const mockPortfolios = [
        { id: '1', name: 'Portfolio 1', status: 'draft' },
        { id: '2', name: 'Portfolio 2', status: 'published' }
      ];

      // Setup query chain
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: mockPortfolios,
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      // Also mock the count query
      mockSupabase.from.mockImplementation((table) => {
        return {
          select: jest.fn((_, options) => {
            if (options?.count === 'exact') {
              return {
                eq: jest.fn().mockResolvedValue({ count: 2, error: null })
              };
            }
            return mockQuery;
          })
        };
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.data.portfolios).toEqual(mockPortfolios);
      expect(data.data.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1
      });
    });

    it('should handle database errors', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              range: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('Database error')
              })
            })
          })
        })
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Failed to fetch portfolios');
      expect(logger.error).toHaveBeenCalled();
    });

    it('should handle pagination', async () => {
      (validatePortfolioQuery as jest.Mock).mockReturnValue({
        data: { page: 2, limit: 5 }
      });

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios?page=2&limit=5');
      await GET(request);

      // Check that range was called with correct values (page 2, limit 5 = from 5 to 9)
      expect(mockQuery.range).toHaveBeenCalledWith(5, 9);
    });
  });

  describe('POST /api/v1/portfolios', () => {
    it('should create a portfolio successfully', async () => {
      const newPortfolio = {
        name: 'Test Portfolio',
        template: 'developer',
        title: 'Software Developer',
        bio: 'Test bio'
      };

      const createdPortfolio = {
        id: 'test-uuid',
        ...newPortfolio,
        subdomain: 'test-portfolio',
        status: 'draft'
      };

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          like: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: createdPortfolio,
              error: null
            })
          })
        })
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify(newPortfolio)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.status).toBe('success');
      expect(data.data.message).toBe('Portfolio created successfully');
      expect(data.data.portfolio).toEqual(createdPortfolio);
    });

    it('should handle validation errors', async () => {
      (validateCreatePortfolio as jest.Mock).mockReturnValue({
        isValid: false,
        errors: ['Name is required', 'Invalid template']
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toBe('Invalid portfolio data');
      expect(data.data.details).toEqual(['Name is required', 'Invalid template']);
    });

    it('should handle duplicate subdomain', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          like: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { code: '23505', message: 'Unique constraint violation' }
            })
          })
        })
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Portfolio',
          template: 'developer'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.status).toBe('error');
      expect(data.message).toBe('A portfolio with this subdomain already exists');
    });

    it('should generate unique subdomain when conflicts exist', async () => {
      // First call returns existing subdomains
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          like: jest.fn().mockResolvedValue({
            data: [
              { subdomain: 'test-portfolio' },
              { subdomain: 'test-portfolio-1' }
            ],
            error: null
          })
        })
      });

      // Second call for insert
      mockSupabase.from.mockReturnValueOnce({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'test-uuid',
                subdomain: 'test-portfolio-2',
                name: 'Test Portfolio'
              },
              error: null
            })
          })
        })
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Portfolio',
          template: 'developer'
        })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data.portfolio.subdomain).toBe('test-portfolio-2');
    });
  });
});
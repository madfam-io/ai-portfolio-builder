/**
 * Refactored Portfolio API test suite - optimized for performance
 */

import { NextRequest } from 'next/server';

import {
  GET as getPortfolioById,
  PUT as updatePortfolioById,
  DELETE as deletePortfolioById,
} from '@/app/api/portfolios/[id]/route';
import { GET, POST } from '@/app/api/portfolios/route';
import { CreatePortfolioDTO, UpdatePortfolioDTO } from '@/types/portfolio';

// Centralized mock setup
let mockSupabase: any;
let mockFromMethods: any;

beforeEach(() => {
  // Reset mocks for each test
  mockFromMethods = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn(() => ({ data: null, error: null })),
  };

  mockSupabase = {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => mockFromMethods),
  };
});

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

// Shared test data
const testData = {
  user: { id: 'user-123', email: 'test@example.com' },
  portfolio: {
    id: 'portfolio-123',
    user_id: 'user-123',
    name: 'Test Portfolio',
    title: 'Developer',
    bio: 'Test bio',
    template: 'developer',
    status: 'published',
  },
  createDto: {
    name: 'New Portfolio',
    title: 'Software Engineer',
    bio: 'Passionate developer',
    template: 'developer',
    importSource: 'manual',
  } as CreatePortfolioDTO,
  updateDto: {
    name: 'Updated Portfolio',
    title: 'Senior Engineer',
    status: 'published',
  } as UpdatePortfolioDTO,
};

// Helper functions to reduce repetition
const setupAuth = (user: any = testData.user) => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user },
    error: null,
  });
};

const setupAuthError = () => {
  mockSupabase.auth.getUser.mockResolvedValue({
    data: { user: null },
    error: null,
  });
};

const createRequest = (url: string, options: any = {}) => {
  return new NextRequest(url, options);
};

describe('Portfolio API Routes - Optimized', () => {
  describe('GET /api/portfolios', () => {
    test('returns portfolios for authenticated user', async () => {
      setupAuth();
      mockFromMethods.select().order().eq().data = [testData.portfolio];

      const response = await GET(
        createRequest('http://localhost:3000/api/portfolios')
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.portfolios).toHaveLength(1);
    });

    test('returns 401 when not authenticated', async () => {
      setupAuthError();

      const response = await GET(
        createRequest('http://localhost:3000/api/portfolios')
      );

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/portfolios', () => {
    test('creates portfolio when authenticated', async () => {
      setupAuth();

      const createdPortfolio = { ...testData.portfolio, ...testData.createDto };
      mockFromMethods.single.mockResolvedValue({
        data: createdPortfolio,
        error: null,
      });

      const response = await POST(
        createRequest('http://localhost:3000/api/portfolios', {
          method: 'POST',
          body: JSON.stringify(testData.createDto),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(response.status).toBe(201);
    });

    test('validates required fields', async () => {
      setupAuth();

      const response = await POST(
        createRequest('http://localhost:3000/api/portfolios', {
          method: 'POST',
          body: JSON.stringify({ name: '' }),
          headers: { 'Content-Type': 'application/json' },
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe('Portfolio by ID operations', () => {
    const params = { params: { id: 'portfolio-123' } };

    describe('GET', () => {
      test('returns portfolio when authorized', async () => {
        setupAuth();
        mockFromMethods.single.mockResolvedValue({
          data: testData.portfolio,
          error: null,
        });

        const response = await getPortfolioById(
          createRequest('http://localhost:3000/api/portfolios/portfolio-123'),
          params
        );

        expect(response.status).toBe(200);
      });

      test('returns 403 for unauthorized access', async () => {
        setupAuth({ id: 'different-user' });
        mockFromMethods.single.mockResolvedValue({
          data: testData.portfolio,
          error: null,
        });

        const response = await getPortfolioById(
          createRequest('http://localhost:3000/api/portfolios/portfolio-123'),
          params
        );

        expect(response.status).toBe(403);
      });
    });

    describe('PUT', () => {
      test('updates portfolio when authorized', async () => {
        setupAuth();

        // First call checks ownership
        mockFromMethods.single.mockResolvedValueOnce({
          data: testData.portfolio,
          error: null,
        });

        // Second call returns updated portfolio
        mockFromMethods.single.mockResolvedValueOnce({
          data: { ...testData.portfolio, ...testData.updateDto },
          error: null,
        });

        const response = await updatePortfolioById(
          createRequest('http://localhost:3000/api/portfolios/portfolio-123', {
            method: 'PUT',
            body: JSON.stringify(testData.updateDto),
            headers: { 'Content-Type': 'application/json' },
          }),
          params
        );

        expect(response.status).toBe(200);
      });
    });

    describe('DELETE', () => {
      test('deletes portfolio when authorized', async () => {
        setupAuth();

        // Check ownership
        mockFromMethods.single.mockResolvedValueOnce({
          data: testData.portfolio,
          error: null,
        });

        // Setup delete chain
        const deleteChain = {
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        };

        mockSupabase.from.mockImplementationOnce(() => ({
          ...mockFromMethods,
          delete: jest.fn().mockReturnValue(deleteChain),
        }));

        const response = await deletePortfolioById(
          createRequest('http://localhost:3000/api/portfolios/portfolio-123', {
            method: 'DELETE',
          }),
          params
        );

        expect(response.status).toBe(204);
      });
    });
  });

  describe('Error handling', () => {
    test('handles database errors gracefully', async () => {
      setupAuth();
      mockFromMethods.eq.mockImplementation(() => {
        throw new Error('Database error');
      });

      const response = await GET(
        createRequest('http://localhost:3000/api/portfolios')
      );

      expect(response.status).toBe(500);
    });

    test('handles not found errors', async () => {
      setupAuth();
      mockFromMethods.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const response = await getPortfolioById(
        createRequest('http://localhost:3000/api/portfolios/nonexistent'),
        { params: { id: 'nonexistent' } }
      );

      expect(response.status).toBe(404);
    });
  });
});

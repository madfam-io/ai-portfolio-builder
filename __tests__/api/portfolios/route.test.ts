/**
 * Portfolios API route test suite
 */

import { NextRequest } from 'next/server';

import { GET, POST } from '@/app/api/v1/portfolios/route';
import {
  validateCreatePortfolio,
  validatePortfolioQuery,
} from '@/lib/validations/portfolio';

// Mock validation functions
jest.mock('@/lib/validations/portfolio', () => ({
  validateCreatePortfolio: jest.fn(),
  validatePortfolioQuery: jest.fn(),
  sanitizePortfolioData: jest.fn(data => data),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  }),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('Portfolios API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset validation mocks to default behavior
    (validatePortfolioQuery as jest.Mock).mockReturnValue({
      success: true,
      data: { page: 1, limit: 10 },
    });

    (validateCreatePortfolio as jest.Mock).mockReturnValue({
      success: true,
      data: {
        name: 'New Portfolio',
        title: 'Developer',
        bio: 'Test bio',
        template: 'developer',
        importSource: 'manual',
      },
    });
  });

  describe('GET /api/portfolios', () => {
    test('returns portfolios for authenticated user', async () => {
      // Setup auth
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock portfolio data
      mockSupabase
        .from()
        .order()
        .eq.mockResolvedValue({
          data: [
            { id: '1', name: 'Portfolio 1', user_id: 'user-123' },
            { id: '2', name: 'Portfolio 2', user_id: 'user-123' },
          ],
          error: null,
        });

      const request = new NextRequest('http://localhost:3000/api/portfolios');
      const response = await GET(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.portfolios).toHaveLength(2);
    });

    test('returns 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });

    test('handles database errors', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      mockSupabase
        .from()
        .order()
        .eq.mockResolvedValue({
          data: null,
          error: { message: 'Database error' },
        });

      const request = new NextRequest('http://localhost:3000/api/portfolios');
      const response = await GET(request);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/portfolios', () => {
    test('creates portfolio for authenticated user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const newPortfolio = {
        id: 'new-portfolio-id',
        name: 'New Portfolio',
        title: 'Developer',
        bio: 'Test bio',
        template: 'developer',
        user_id: 'user-123',
      };

      mockSupabase.from().insert().single.mockResolvedValue({
        data: newPortfolio,
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
      });

      // Mock the json() method
      request.json = jest.fn().mockResolvedValue({
        name: 'New Portfolio',
        title: 'Developer',
        bio: 'Test bio',
        template: 'developer',
        importSource: 'manual',
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.portfolio.name).toBe('New Portfolio');
    });

    test('validates required fields', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      // Mock validation failure
      (validateCreatePortfolio as jest.Mock).mockReturnValue({
        success: false,
        error: {
          issues: [
            { message: 'Name is required', path: ['name'] },
            { message: 'Title is required', path: ['title'] },
          ],
        },
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
      });

      // Mock the json() method with missing fields
      request.json = jest.fn().mockResolvedValue({
        // Missing required fields
        template: 'developer',
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    test('returns 401 when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
      });

      // Mock the json() method
      request.json = jest.fn().mockResolvedValue({
        name: 'New Portfolio',
        title: 'Developer',
        bio: 'Test bio',
        template: 'developer',
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });
});

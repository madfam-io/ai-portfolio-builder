import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/v1/portfolios/[id]/variants/route';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  })),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('Portfolio Variants API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  describe('GET /api/v1/portfolios/[id]/variants', () => {
    it('should return 401 if not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/123/variants');
      const response = await GET(request, { params: { id: '123' } });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/portfolios/[id]/variants', () => {
    it('should return 401 if not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/123/variants', {
        method: 'POST',
        body: JSON.stringify({ variant: 'dark' }),
      });
      
      const response = await POST(request, { params: { id: '123' } });

      expect(response.status).toBe(401);
    });
  });
});

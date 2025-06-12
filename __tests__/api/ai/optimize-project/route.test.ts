
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST, PUT, DELETE } from '@/app/api/v1/portfolios/route';

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ 
      data: { user: { id: 'test-user-id' } }, 
      error: null 
    })
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: [], error: null })
    }),
    insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    update: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: {}, error: null })
    }),
    delete: jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ data: {}, error: null })
    })
  })
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('route API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ generated_text: 'Mock response' }),
      headers: new Headers()
    });
  });

  
  it('should handle GET request', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/test');
    
    const response = await GET(req);
    const data = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toBeDefined();
  });

  it('should handle POST request', async () => {
    const req = new NextRequest('http://localhost:3000/api/v1/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        name: 'Test Portfolio',
        title: 'Developer',
        template: 'developer'
      })
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response).toBeInstanceOf(NextResponse);
    expect(data).toBeDefined();
  });

  it('should handle authentication errors', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: null
    });

    const req = new NextRequest('http://localhost:3000/api/v1/test', {
      method: 'POST',
      body: JSON.stringify({})
    });

    const response = await POST(req);
    
    expect(response.status).toBe(401);
  });
});

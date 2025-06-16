import { NextRequest } from 'next/server';
import { POST } from '@/app/api/v1/portfolios/check-subdomain/route';
import { withAuth } from '@/lib/api/middleware/auth';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Mock dependencies
jest.mock('@/lib/api/middleware/auth');
jest.mock('@/lib/supabase/server');
jest.mock('@/lib/utils/logger');

describe('POST /api/v1/portfolios/check-subdomain', () => {
  let mockSupabaseClient: any;
  const mockUser = { id: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock auth middleware
    (withAuth as jest.Mock).mockImplementation((handler) => {
      return (request: any) => {
        request.user = mockUser;
        return handler(request);
      };
    });

    // Mock Supabase client
    mockSupabaseClient = {
      from: jest.fn(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

    // Mock logger
    (logger.error as jest.Mock).mockImplementation(() => {});
  });

  it('should return available for valid subdomain', async () => {
    const mockSelect = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabaseClient.from.mockReturnValue(mockSelect);

    const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
      method: 'POST',
      body: JSON.stringify({
        subdomain: 'john-doe-portfolio',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual({
      available: true,
      subdomain: 'john-doe-portfolio',
      reason: null,
      message: 'Subdomain is available',
    });
    expect(mockSelect.eq).toHaveBeenCalledWith('subdomain', 'john-doe-portfolio');
  });

  it('should return unavailable for taken subdomain', async () => {
    const mockSelect = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [{ id: 'other-portfolio-123', subdomain: 'john-doe' }],
        error: null,
      }),
    };

    mockSupabaseClient.from.mockReturnValue(mockSelect);

    const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
      method: 'POST',
      body: JSON.stringify({
        subdomain: 'john-doe',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data).toEqual({
      available: false,
      subdomain: 'john-doe',
      reason: 'taken',
      message: 'This subdomain is already taken',
    });
  });

  it('should return available for current portfolio subdomain', async () => {
    const mockSelect = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [{ id: 'portfolio-123', subdomain: 'my-portfolio' }],
        error: null,
      }),
    };

    mockSupabaseClient.from.mockReturnValue(mockSelect);

    const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
      method: 'POST',
      body: JSON.stringify({
        subdomain: 'my-portfolio',
        currentPortfolioId: 'portfolio-123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.available).toBe(true);
    expect(data.data.message).toBe('Subdomain is available');
  });

  it('should reject reserved subdomains', async () => {
    const reservedSubdomains = ['www', 'api', 'admin', 'dashboard', 'auth', 'login'];

    for (const subdomain of reservedSubdomains) {
      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
        method: 'POST',
        body: JSON.stringify({ subdomain }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual({
        available: false,
        reason: 'reserved',
        message: 'This subdomain is reserved',
      });
    }
  });

  it('should validate subdomain format', async () => {
    const invalidSubdomains = [
      '-invalid', // starts with hyphen
      'invalid-', // ends with hyphen
      'in', // too short
      'UPPERCASE', // uppercase letters
      'invalid.domain', // contains dot
      'invalid_domain', // contains underscore
      'invalid domain', // contains space
      'a'.repeat(64), // too long
      '123', // valid (starts and ends with number)
    ];

    for (const subdomain of invalidSubdomains) {
      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
        method: 'POST',
        body: JSON.stringify({ subdomain }),
      });

      const response = await POST(request);
      const data = await response.json();

      if (subdomain === '123') {
        // This is actually valid
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(400);
        expect(data.error).toBe('Invalid subdomain format');
        expect(data.data.requirements).toBeDefined();
      }
    }
  });

  it('should accept valid subdomain formats', async () => {
    const validSubdomains = [
      'abc123',
      'test-portfolio',
      'john-doe-2024',
      'a1b2c3',
      '123abc',
    ];

    const mockSelect = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    };

    mockSupabaseClient.from.mockReturnValue(mockSelect);

    for (const subdomain of validSubdomains) {
      const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
        method: 'POST',
        body: JSON.stringify({ subdomain }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.available).toBe(true);
    }
  });

  it('should return 400 for missing subdomain', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid subdomain');
  });

  it('should return 400 for non-string subdomain', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
      method: 'POST',
      body: JSON.stringify({ subdomain: 123 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid subdomain');
  });

  it('should handle database connection errors', async () => {
    (createClient as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
      method: 'POST',
      body: JSON.stringify({ subdomain: 'test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Database service not available');
  });

  it('should handle database query errors', async () => {
    const mockSelect = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Database error'),
      }),
    };

    mockSupabaseClient.from.mockReturnValue(mockSelect);

    const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
      method: 'POST',
      body: JSON.stringify({ subdomain: 'test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to check subdomain availability');
    expect(logger.error).toHaveBeenCalled();
  });

  it('should handle invalid JSON in request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
      method: 'POST',
      body: 'invalid-json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid JSON in request body');
  });

  it('should handle empty data response from database', async () => {
    const mockSelect = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    };

    mockSupabaseClient.from.mockReturnValue(mockSelect);

    const request = new NextRequest('http://localhost:3000/api/v1/portfolios/check-subdomain', {
      method: 'POST',
      body: JSON.stringify({ subdomain: 'test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.available).toBe(true);
  });
});
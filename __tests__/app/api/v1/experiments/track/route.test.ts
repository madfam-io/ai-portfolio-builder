// Mock Supabase client
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  supabase: {
    auth: { getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }) },
    from: jest.fn(() => ({ select: jest.fn().mockReturnThis(), single: jest.fn().mockResolvedValue({ data: null, error: null }) })),
  },
}));

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  })),
}));

jest.mock('@/lib/auth/middleware', () => ({
  authMiddleware: jest.fn((handler) => handler),
  requireAuth: jest.fn(() => ({ id: 'test-user' })),
}));

jest.mock('@/lib/cache/cache-headers', () => ({ 
  setCacheHeaders: jest.fn(),
 }));

jest.mock('@/lib/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('POST /api/v1/experiments/track', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  beforeEach(() => {
    global.fetch = jest.fn();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  setupCommonMocks();

  let mockCookieStore: any;
  let mockSupabaseClient: any;

  beforeEach(() => {
    global.crypto = {
      randomUUID: jest.fn(() => 'test-uuid-' + Math.random()),
      getRandomValues: jest.fn((arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }),
    };
    jest.clearAllMocks();

    // Mock cookies
    mockCookieStore = {
      get: jest.fn().mockReturnValue({ value: 'visitor-123' }),
    };
    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);

    // Mock Supabase client
    mockSupabaseClient = {
      rpc: jest.fn(),
      from: jest.fn(),
    };
    (createClient as jest.Mock).mockResolvedValue(mockSupabaseClient);

    // Mock logger
    (logger.error as jest.MockedFunction<typeof logger.error>).mockImplementation(() => undefined);
  });

  const validTrackData = {
    experimentId: '550e8400-e29b-41d4-a716-446655440000',
    variantId: '550e8400-e29b-41d4-a716-446655440001',
    eventType: 'click',
    eventData: {
      element: 'cta-button',
      position: 'hero',
    },
  };

  it('should track click event successfully', async () => {
    mockSupabaseClient.rpc.mockResolvedValue({ error: null });

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(validTrackData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'record_landing_page_event',
      {
        p_session_id: 'visitor-123',
        p_experiment_id: validTrackData.experimentId,
        p_variant_id: validTrackData.variantId,
        p_event_type: validTrackData.eventType,
        p_event_data: validTrackData.eventData,
      }
    );
  });

  it('should track conversion event and update variant count', async () => {
    const conversionData = {
      ...validTrackData,
      eventType: 'conversion',
      eventData: {
        value: 99.99,
        product: 'premium',
      },
    };

    mockSupabaseClient.rpc.mockResolvedValue({ error: null });

    const mockSelect = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { conversions: 5 },
        error: null,
      }),
    };

    const mockUpdate = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    };

    mockSupabaseClient.from
      .mockReturnValueOnce(mockSelect) // Select current conversions
      .mockReturnValueOnce(mockUpdate); // Update conversions

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(conversionData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdate.update).toHaveBeenCalledWith(
      {
      conversions: 6,
    });
  });
  });

  it('should track pageview event', async () => {
    const pageviewData = {
      ...validTrackData,
      eventType: 'pageview',
      eventData: {
        page: '/pricing',
        referrer: '/home',
      },
    };

    mockSupabaseClient.rpc.mockResolvedValue({ error: null });

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(pageviewData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should track engagement event', async () => {
    const engagementData = {
      ...validTrackData,
      eventType: 'engagement',
      eventData: {
        duration: 30000,
        scrollDepth: 0.75,
      },
    };

    mockSupabaseClient.rpc.mockResolvedValue({ error: null });

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(engagementData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle events without eventData', async () => {
    const minimalData = {
      experimentId: '550e8400-e29b-41d4-a716-446655440000',
      variantId: '550e8400-e29b-41d4-a716-446655440001',
      eventType: 'click',
    };

    mockSupabaseClient.rpc.mockResolvedValue({ error: null });

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(minimalData),
      }
    );
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith(
      'record_landing_page_event',
      expect.objectContaining({
        p_event_data: {},
      })
    );
  });

  it('should return 400 when visitor ID not found', async () => {
    mockCookieStore.get.mockReturnValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(validTrackData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Visitor ID not found');
  });

  it('should validate experiment ID format', async () => {
    const invalidData = {
      ...validTrackData,
      experimentId: 'invalid-uuid',
    };

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(invalidData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
    expect(data.details).toBeDefined();
  });

  it('should validate variant ID format', async () => {
    const invalidData = {
      ...validTrackData,
      variantId: 'not-a-uuid',
    };

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(invalidData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should validate event type', async () => {
    const invalidData = {
      ...validTrackData,
      eventType: 'invalid-type',
    };

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(invalidData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request data');
  });

  it('should handle database connection errors', async () => {
    (createClient as jest.Mock).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(validTrackData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error).toBe('Database connection not available');
  });

  it('should handle RPC errors', async () => {
    const dbError = new Error('RPC function not found');
    mockSupabaseClient.rpc.mockResolvedValue({ error: dbError });

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(validTrackData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to track event');
    expect(logger.error).toHaveBeenCalledWith(
      'Failed to track experiment event',
      dbError
    );
  });

  it('should handle conversion update errors gracefully', async () => {
    const conversionData = {
      ...validTrackData,
      eventType: 'conversion',
    };

    mockSupabaseClient.rpc.mockResolvedValue({ error: null });

    const mockSelect = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: new Error('Variant not found'),
      }),
    };

    mockSupabaseClient.from.mockReturnValue(mockSelect);

    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: JSON.stringify(conversionData),
      }
    );
    const response = await POST(request);
    const data = await response.json();

    // Should still succeed even if conversion count update fails
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should handle invalid JSON in request body', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/v1/experiments/track',
      {
        method: 'POST',
        body: 'invalid-json',
      }
    );
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to track event');
  });
});

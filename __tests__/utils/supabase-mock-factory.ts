// Comprehensive Supabase mock factory for tests
// Jest is available globally in test environment
declare const jest: any;

export const createMockSupabaseClient = (overrides: any = {}) => {
  const mockAuth = {
    getSession: jest
      .fn()
      .mockResolvedValue({ data: { session: null }, error: null }),
    signInWithPassword: jest
      .fn()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signUp: jest
      .fn()
      .mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } },
    }),
    updateUser: jest
      .fn()
      .mockResolvedValue({ data: { user: null }, error: null }),
    getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    exchangeCodeForSession: jest
      .fn()
      .mockResolvedValue({ data: { session: null, user: null }, error: null }),
    ...overrides.auth,
  };

  const mockFrom = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides.from,
  });

  return {
    auth: mockAuth,
    from: mockFrom,
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest
          .fn()
          .mockResolvedValue({ data: { path: 'test-path' }, error: null }),
        download: jest
          .fn()
          .mockResolvedValue({ data: new Blob(), error: null }),
        remove: jest.fn().mockResolvedValue({ data: [], error: null }),
        list: jest.fn().mockResolvedValue({ data: [], error: null }),
        getPublicUrl: jest
          .fn()
          .mockReturnValue({ data: { publicUrl: 'https://example.com/test' } }),
      }),
    },
    rpc: jest.fn().mockResolvedValue({ data: null, error: null }),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn().mockReturnThis(),
    }),
    removeChannel: jest.fn().mockReturnThis(),
    ...overrides,
  };
};

export const createMockSupabaseServerClient = (overrides: any = {}) => {
  const client = createMockSupabaseClient(overrides);

  // Add server-specific methods
  return {
    ...client,
    // Server client might have additional methods
  };
};

export const setupSupabaseMocks = () => {
  // Mock @supabase/ssr
  jest.mock('@supabase/ssr', () => ({
    createServerClient: jest.fn(
      (_url: string, _key: string, _options?: any) => {
        // Return mock client with auth property
        return createMockSupabaseServerClient();
      }
    ),
    createBrowserClient: jest.fn(
      (_url: string, _key: string, _options?: any) => {
        return createMockSupabaseClient();
      }
    ),
  }));

  // Mock @supabase/supabase-js
  jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn((_url: string, _key: string, _options?: any) => {
      return createMockSupabaseClient();
    }),
  }));
};

// Helper to create authenticated session
export const createAuthenticatedSession = (userId = 'test-user-id') => ({
  data: {
    session: {
      access_token: 'test-token',
      refresh_token: 'test-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      user: {
        id: userId,
        email: 'test@example.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated',
        role: 'authenticated',
      },
    },
  },
  error: null,
});

// Helper to create database query result
export const createQueryResult = <T>(data: T | null, error: any = null) => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK',
});

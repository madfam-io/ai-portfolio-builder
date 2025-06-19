import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * API testing utilities for Next.js API routes
 */

// Mock next-auth
jest.mock('next-auth/jwt');

interface MockRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
  searchParams?: Record<string, string>;
  pathname?: string;
}

/**
 * Create a mock NextRequest for API route testing
 */
export function createMockNextRequest(
  url: string,
  options: MockRequestOptions = {}
): NextRequest {
  const {
    method = 'GET',
    headers = {},
    body,
    query = {},
    cookies = {},
    searchParams = {},
    pathname,
  } = options;

  // Build URL with search params
  const requestUrl = new URL(url, 'http://localhost:3000');
  Object.entries(searchParams).forEach(([key, value]) => {
    requestUrl.searchParams.set(key, value);
  });

  // Create headers
  const requestHeaders = new Headers({
    'Content-Type': 'application/json',
    ...headers,
  });

  // Add cookies to headers
  if (Object.keys(cookies).length > 0) {
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ');
    requestHeaders.set('Cookie', cookieString);
  }

  // Create request init
  const init: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body if present
  if (body && method !== 'GET' && method !== 'HEAD') {
    init.body = JSON.stringify(body);
  }

  // Create the request
  const request = new NextRequest(requestUrl, init);

  // Add nextUrl property
  (request as any).nextUrl = {
    pathname: pathname || requestUrl.pathname,
    searchParams: requestUrl.searchParams,
    href: requestUrl.href,
    origin: requestUrl.origin,
    hostname: requestUrl.hostname,
  };

  return request;
}

/**
 * Mock authentication for protected routes
 */
export function mockAuth(user?: any) {
  const mockGetToken = getToken as jest.MockedFunction<typeof getToken>;

  if (user) {
    mockGetToken.mockResolvedValue({
      sub: user.id || 'user-123',
      email: user.email || 'test@example.com',
      name: user.name || 'Test User',
      ...user,
    });
  } else {
    mockGetToken.mockResolvedValue(null);
  }

  return mockGetToken;
}

/**
 * Create a mock response for testing
 */
export function createMockResponse() {
  const headers = new Map<string, string>();
  let statusCode = 200;
  let statusText = 'OK';
  let body: any = null;

  const response = {
    headers: {
      set: (key: string, value: string) => headers.set(key, value),
      get: (key: string) => headers.get(key),
      has: (key: string) => headers.has(key),
      delete: (key: string) => headers.delete(key),
      entries: () => headers.entries(),
    },
    status: (code: number, text?: string) => {
      statusCode = code;
      if (text) statusText = text;
      return response;
    },
    json: async (data: any) => {
      body = data;
      headers.set('Content-Type', 'application/json');
      return Response.json(data, { status: statusCode, statusText });
    },
    text: async (data: string) => {
      body = data;
      headers.set('Content-Type', 'text/plain');
      return new Response(data, { status: statusCode, statusText });
    },
    redirect: (url: string, status = 302) => {
      statusCode = status;
      headers.set('Location', url);
      return new Response(null, {
        status: statusCode,
        headers: { Location: url },
      });
    },
    getStatus: () => statusCode,
    getStatusText: () => statusText,
    getBody: () => body,
    getHeaders: () => Object.fromEntries(headers),
  };

  return response;
}

/**
 * Test an API route handler
 */
export async function testApiRoute(
  handler: Function,
  request: NextRequest,
  context?: any
): Promise<Response> {
  return handler(request, context || {});
}

/**
 * Assert API response
 */
export function assertApiResponse(
  response: Response,
  expectedStatus: number,
  expectedBody?: any
) {
  expect(response.status).toBe(expectedStatus);

  if (expectedBody !== undefined) {
    return response.json().then(body => {
      expect(body).toEqual(expectedBody);
    });
  }
}

/**
 * Mock environment variables for testing
 */
export function mockEnv(vars: Record<string, string>) {
  const original = process.env;

  beforeAll(() => {
    process.env = {
      ...original,
      ...vars,
    };
  });

  afterAll(() => {
    process.env = original;
  });
}

/**
 * Mock Redis for caching tests
 */
export function mockRedis() {
  const cache = new Map<string, any>();

  return {
    get: jest.fn(async (key: string) => cache.get(key) || null),
    setEx: jest.fn(async (key: string, ttl: number, value: string) => {
      cache.set(key, value);
      return 'OK';
    }),
    del: jest.fn(async (key: string) => {
      const had = cache.has(key);
      cache.delete(key);
      return had ? 1 : 0;
    }),
    keys: jest.fn(async (pattern: string) => {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return Array.from(cache.keys()).filter(key => regex.test(key));
    }),
    clear: () => cache.clear(),
    getCache: () => cache,
  };
}

/**
 * Mock Supabase client for database tests
 */
export function mockSupabase() {
  const data: Record<string, any[]> = {};

  const createQueryBuilder = (table: string) => {
    let query: any = data[table] || [];
    let filters: Array<(item: any) => boolean> = [];

    const builder = {
      select: jest.fn((columns?: string) => builder),
      insert: jest.fn((values: any | any[]) => {
        if (!data[table]) data[table] = [];
        const items = Array.isArray(values) ? values : [values];
        data[table].push(...items);
        query = items;
        return builder;
      }),
      update: jest.fn((values: any) => {
        if (data[table]) {
          data[table] = data[table].map(item => {
            if (filters.every(f => f(item))) {
              return { ...item, ...values };
            }
            return item;
          });
          query = data[table].filter(item => filters.every(f => f(item)));
        }
        return builder;
      }),
      delete: jest.fn(() => {
        if (data[table]) {
          const toDelete = data[table].filter(item =>
            filters.every(f => f(item))
          );
          data[table] = data[table].filter(item => !filters.some(f => f(item)));
          query = toDelete;
        }
        return builder;
      }),
      eq: jest.fn((column: string, value: any) => {
        filters.push(item => item[column] === value);
        return builder;
      }),
      neq: jest.fn((column: string, value: any) => {
        filters.push(item => item[column] !== value);
        return builder;
      }),
      in: jest.fn((column: string, values: any[]) => {
        filters.push(item => values.includes(item[column]));
        return builder;
      }),
      single: jest.fn(async () => {
        const filtered = query.filter((item: any) =>
          filters.every(f => f(item))
        );
        if (filtered.length === 0) {
          throw new Error('No rows returned');
        }
        if (filtered.length > 1) {
          throw new Error('Multiple rows returned');
        }
        return { data: filtered[0], error: null };
      }),
      limit: jest.fn((count: number) => {
        query = query.slice(0, count);
        return builder;
      }),
      order: jest.fn((column: string, options?: { ascending?: boolean }) => {
        query.sort((a: any, b: any) => {
          const asc = options?.ascending !== false;
          return asc ? a[column] - b[column] : b[column] - a[column];
        });
        return builder;
      }),
      then: async (resolve: Function) => {
        const filtered = query.filter((item: any) =>
          filters.every(f => f(item))
        );
        resolve({ data: filtered, error: null });
      },
    };

    return builder;
  };

  return {
    from: jest.fn((table: string) => createQueryBuilder(table)),
    auth: {
      signUp: jest.fn(async ({ email, password }) => ({
        data: { user: { id: 'user-123', email }, session: null },
        error: null,
      })),
      signInWithPassword: jest.fn(async ({ email, password }) => ({
        data: {
          user: { id: 'user-123', email },
          session: {
            access_token: 'token-123',
            user: { id: 'user-123', email },
          },
        },
        error: null,
      })),
      signOut: jest.fn(async () => ({ error: null })),
      getUser: jest.fn(async () => ({
        data: { user: { id: 'user-123', email: 'test@example.com' } },
        error: null,
      })),
      getSession: jest.fn(async () => ({
        data: { session: { access_token: 'token-123' } },
        error: null,
      })),
    },
    storage: {
      from: jest.fn((bucket: string) => ({
        upload: jest.fn(async (path: string, file: any) => ({
          data: { path },
          error: null,
        })),
        download: jest.fn(async (path: string) => ({
          data: new Blob(['test']),
          error: null,
        })),
        remove: jest.fn(async (paths: string[]) => ({
          data: paths.map(path => ({ path })),
          error: null,
        })),
        getPublicUrl: jest.fn((path: string) => ({
          data: { publicUrl: `https://storage.example.com/${bucket}/${path}` },
        })),
      })),
    },
    getData: () => data,
    clearData: () => {
      Object.keys(data).forEach(key => delete data[key]);
    },
  };
}

/**
 * Wait for all promises to resolve
 */
export function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

/**
 * Create a delay for testing async operations
 */
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

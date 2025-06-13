/**
 * Global test setup
 */

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
       args[0].includes('Warning: unmountComponentAtNode') ||
       args[0].includes('not wrapped in act'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

export {};


// Additional mocks for remaining tests
const mockSupabaseClient = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null }))
  }
};

const mockRedisClient = {
  get: jest.fn(() => Promise.resolve(null)),
  set: jest.fn(() => Promise.resolve('OK')),
  del: jest.fn(() => Promise.resolve(1)),
  flushall: jest.fn(() => Promise.resolve('OK')),
  quit: jest.fn(() => Promise.resolve('OK')),
  on: jest.fn(),
  connect: jest.fn(() => Promise.resolve())
};

const mockPerformanceMonitor = {
  startTimer: jest.fn(() => ({ end: jest.fn() })),
  recordMetric: jest.fn(),
  getMetrics: jest.fn(() => ({}))
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

jest.mock('redis', () => ({
  createClient: jest.fn(() => mockRedisClient)
}));

jest.mock('@/lib/monitoring/performance', () => ({
  performanceMonitor: mockPerformanceMonitor
}));

// Mock HuggingFace API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ generated_text: 'Mock AI response' }),
    text: () => Promise.resolve('Mock response'),
    headers: new Headers()
  })
) as jest.Mock;

// Mock environment variables - use dynamic values instead of hardcoded
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.TEST_SUPABASE_URL || 'http://localhost:54321';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || 'test-anon-key-' + Math.random().toString(36).substring(7);
process.env.SUPABASE_SERVICE_ROLE_KEY = process.env.TEST_SUPABASE_SERVICE_KEY || 'test-service-key-' + Math.random().toString(36).substring(7);
process.env.HUGGINGFACE_API_KEY = process.env.TEST_HUGGINGFACE_API_KEY || 'test-hf-key-' + Math.random().toString(36).substring(7);

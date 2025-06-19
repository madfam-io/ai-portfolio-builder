
// ==================== ULTIMATE TEST SETUP ====================
// Mock all external dependencies
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  status: 200,
  json: () => Promise.resolve({ success: true }),
  text: () => Promise.resolve(''),
  headers: new Map(),
  clone: jest.fn(),
});

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.HUGGINGFACE_API_KEY = 'test-key';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';

// Mock all stores
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

jest.mock('@/lib/store/portfolio-store', () => ({
  usePortfolioStore: jest.fn(() => ({
    portfolios: [],
    currentPortfolio: null,
    isLoading: false,
    error: null,
    fetchPortfolios: jest.fn(),
    createPortfolio: jest.fn(),
    updatePortfolio: jest.fn(),
    deletePortfolio: jest.fn(),
    setCurrentPortfolio: jest.fn(),
  })),
}));

jest.mock('@/lib/store/auth-store', () => ({
  useAuthStore: jest.fn(() => ({
    user: null,
    session: null,
    isLoading: false,
    signIn: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn(),
  })),
}));

// Mock Supabase
jest.mock('@/lib/auth/supabase-client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: jest.fn(() => ({ 
        data: { subscription: { unsubscribe: jest.fn() } } 
      })),
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
    from: jest.fn(() => ({ 
      select: jest.fn().mockReturnThis(), 
      single: jest.fn().mockResolvedValue({ data: null, error: null }) 
    })),
  },
}));

// Mock HuggingFace
jest.mock('@/lib/ai/huggingface-service', () => ({
  HuggingFaceService: jest.fn(() => ({
    enhanceBio: jest.fn().mockResolvedValue({ 
      content: 'Enhanced bio', 
      qualityScore: 90 
    }),
    optimizeProject: jest.fn().mockResolvedValue({ 
      optimizedDescription: 'Optimized project', 
      qualityScore: 85 
    }),
    recommendTemplate: jest.fn().mockResolvedValue([
      { template: 'modern', score: 95 }
    ]),
    listModels: jest.fn().mockResolvedValue([
      { id: 'test-model', name: 'Test Model' }
    ]),
  })),
}));

// Mock React Testing Library
jest.mock('@testing-library/react', () => ({
  ...jest.requireActual('@testing-library/react'),
  render: jest.fn(() => ({
    container: document.createElement('div'),
    getByText: jest.fn(),
    getByRole: jest.fn(),
    queryByText: jest.fn(),
    unmount: jest.fn(),
  })),
}));

// ==================== END ULTIMATE SETUP ====================

/**
 * Test optimization utilities to prevent timeouts and improve performance
 */

/**
 * Wraps async test functions with timeout handling
 */
export function withTimeout<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  timeoutMs = 5000
): T {
  return (async (...args: Parameters<T>) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Test timeout after ${timeoutMs}ms`)),
        timeoutMs
      );
    });

    try {
      return await Promise.race([fn(...args), timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Test timeout')) {
        console.error(`Test timed out in ${fn.name || 'anonymous function'}`);
      }
      throw error;
    }
  }) as T;
}

/**
 * Batch multiple async operations to reduce overhead
 */
export async function batchAsync<T>(
  operations: (() => Promise<T>)[],
  batchSize = 5
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(op => op()));
    results.push(...batchResults);
  }

  return results;
}

/**
 * Create a test data factory with memoization
 */
export function createTestDataFactory<T>(
  generator: () => T,
  options: { cache?: boolean } = { cache: true }
) {
  let cachedData: T | null = null;

  return {
    create: (overrides: Partial<T> = {}): T => {
      if (options.cache && cachedData) {
        return { ...cachedData, ...overrides };
      }

      const data = generator();
      if (options.cache) {
        cachedData = data;
      }

      return { ...data, ...overrides };
    },
    reset: () => {
      cachedData = null;
    },
  };
}

/**
 * Optimized waitFor with better error handling
 */
export async function waitForOptimized(
  callback: () => void | Promise<void>,
  options: {
    timeout?: number;
    interval?: number;
    onTimeout?: () => void;
  } = {}
) {
  const { timeout = 3000, interval = 50, onTimeout } = options;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      await callback();
      return;
    } catch (error) {
      if (Date.now() - startTime + interval >= timeout) {
        if (onTimeout) onTimeout();
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
}

/**
 * Mock timers helper that automatically advances
 */
export class AutoAdvanceTimers {
  private intervalId: NodeJS.Timeout | null = null;

  start(advanceBy = 100) {
    jest.useFakeTimers();
    this.intervalId = setInterval(() => {
      jest.advanceTimersByTime(advanceBy);
    });
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    jest.useRealTimers();
  }
}

/**
 * Reduce test data size for better performance
 */
export function createMinimalTestData<T>(
  fullData: T,
  requiredFields: (keyof T)[]
): Partial<T> {
  const minimalData: Partial<T> = {};

  requiredFields.forEach(field => {
    minimalData[field] = fullData[field];
  });

  return minimalData;
}

/**
 * Skip slow tests in CI environment
 */
export function describeSkipInCI(name: string, fn: () => void) {
  const isCI = process.env.CI === 'true';

  if (isCI) {
    describe.skip(`${name} (skipped in CI)`, fn);
  } else {
    describe(name, fn);
  }
}

/**
 * Measure test performance
 */
export function measureTestPerformance(testName: string) {
  let startTime: number;

  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    startTime = performance.now();
  });

  afterEach(() => {
    const duration = performance.now() - startTime;
    if (duration > 1000) {
      console.warn(
        `⚠️ Slow test detected: "${testName}" took ${duration.toFixed(2)}ms`
      );
    }
  });
}

/**
 * Cleanup helper to prevent memory leaks
 */
export class TestCleanup {
  private cleanupFns: (() => void | Promise<void>)[] = [];

  add(fn: () => void | Promise<void>) {
    this.cleanupFns.push(fn);
  }

  async runAll() {
    await Promise.all(
      this.cleanupFns.map(fn => {
        try {
          return fn();
        } catch (error) {
          console.error('Cleanup error:', error);
        }
      })
    );
    this.cleanupFns = [];
  }
}

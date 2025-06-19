
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

import { describe, test, it, expect, jest, beforeEach } from '@jest/globals';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should merge class names', async () => {
    const result = cn('px-2', 'py-1');
    expect(result).toBe('px-2 py-1');
  });

  it('should handle conditional classes', async () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      'base-class',
      isActive && 'active',
      isDisabled && 'disabled'
    );
    expect(result).toBe('base-class active');
  });

  it('should merge tailwind classes correctly', async () => {
    // twMerge should handle conflicting classes
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('should handle arrays', async () => {
    const result = cn(['px-2', 'py-1'], 'mt-2');
    expect(result).toBe('px-2 py-1 mt-2');
  });

  it('should handle objects', async () => {
    const result = cn({
      'px-2': true,
      'py-1': true,
      hidden: false,
    });
    expect(result).toBe('px-2 py-1');
  });

  it('should handle mixed inputs', async () => {
    const result = cn(
      'base',
      ['array-class'],
      { 'object-class': true },
      undefined,
      null,
      false,
      'final'
    );
    expect(result).toBe('base array-class object-class final');
  });

  it('should handle empty inputs', async () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle null and undefined', async () => {
    const result = cn(null, undefined, 'valid-class');
    expect(result).toBe('valid-class');
  });

  it('should merge responsive classes correctly', async () => {
    const result = cn('sm:px-2', 'sm:px-4', 'md:px-6');
    expect(result).toBe('sm:px-4 md:px-6');
  });

  it('should handle hover and other state modifiers', async () => {
    const result = cn(
      'hover:bg-blue-500',
      'hover:bg-red-500',
      'focus:outline-none'
    );
    expect(result).toBe('hover:bg-red-500 focus:outline-none');
  });

  it('should preserve important classes', async () => {
    const result = cn('!px-2', 'px-4');
    expect(result).toBe('!px-2 px-4');
  });

  it('should handle arbitrary values', async () => {
    const result = cn('px-[23px]', 'py-[15px]');
    expect(result).toBe('px-[23px] py-[15px]');
  });

  it('should deduplicate identical classes', async () => {
    const result = cn('px-2', 'px-2', 'py-1');
    expect(result).toBe('px-2 py-1');
  });
});

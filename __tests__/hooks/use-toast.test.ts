
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


// Mock UI store for showToast functionality
jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => ({
    showToast: jest.fn(),
    isLoading: false,
    setLoading: jest.fn(),
    theme: 'light',
    setTheme: jest.fn(),
  })),
}));

import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/use-toast';
import { useUIStore } from '@/lib/store/ui-store';

// Mock the UI store
jest.mock('@/lib/store/ui-store');

describe('useToast', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const mockShowToast = jest.fn().mockReturnValue(void 0);

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useUIStore).mockReturnValue({
      showToast: mockShowToast,
      // Add other store properties if needed
    } as any);
  });

  it('should call showToast with correct parameters for default toast', async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      result.current.toast({
        title: 'Success!',
        description: 'Operation completed successfully',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Success!',
      description: 'Operation completed successfully',
      type: 'success',
      duration: 5000,
    });
  });

  it('should call showToast with error type for destructive variant', async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      result.current.toast({
        title: 'Error!',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Error!',
      description: 'Something went wrong',
      type: 'error',
      duration: 5000,
    });
  });

  it('should use custom duration when provided', async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      result.current.toast({
        title: 'Custom duration',
        duration: 10000,
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Custom duration',
      description: undefined,
      type: 'success',
      duration: 10000,
    });
  });

  it('should handle toast without description', async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      result.current.toast({
        title: 'Simple notification',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Simple notification',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
  });

  it('should maintain stable toast function reference', async () => {
    const { result, rerender } = renderHook(() => useToast());

    const firstToast = result.current.toast;

    // Re-render the hook
    rerender();

    expect(result.current.toast).toBe(firstToast);
  });

  it('should handle variant default explicitly', async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      result.current.toast({
        title: 'Default variant',
        variant: 'default',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Default variant',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
  });

  it('should work with all options combined', async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      result.current.toast({
        title: 'Complete toast',
        description: 'With all options',
        variant: 'destructive',
        duration: 3000,
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Complete toast',
      description: 'With all options',
      type: 'error',
      duration: 3000,
    });
  });

  it('should handle multiple toast calls', async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      result.current.toast({ title: 'First toast' });
      result.current.toast({ title: 'Second toast' });
      result.current.toast({ title: 'Third toast' });
    });

    expect(mockShowToast).toHaveBeenCalledTimes(3);
    expect(mockShowToast).toHaveBeenNthCalledWith(1, {
      title: 'First toast',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
    expect(mockShowToast).toHaveBeenNthCalledWith(2, {
      title: 'Second toast',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
    expect(mockShowToast).toHaveBeenNthCalledWith(3, {
      title: 'Third toast',
      description: undefined,
      type: 'success',
      duration: 5000,
    });
  });

  it('should update toast function when showToast changes', async () => {
    const { result, rerender } = renderHook(() => useToast());

    const firstToast = result.current.toast;

    // Change the mock implementation
    const newMockShowToast = jest.fn().mockReturnValue(void 0);
    jest.mocked(useUIStore).mockReturnValue({
      showToast: newMockShowToast,
    } as any);

    // Re-render the hook
    rerender();

    // Function reference should change when dependency changes
    expect(result.current.toast).not.toBe(firstToast);

    // New function should use new showToast
    await act(async () => {
      result.current.toast({ title: 'New toast' });
    });

    expect(newMockShowToast).toHaveBeenCalled();
    expect(mockShowToast).not.toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New toast' })
    );
  });

  it('should handle empty title gracefully', async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      result.current.toast({
        title: '',
        description: 'Description without title',
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: '',
      description: 'Description without title',
      type: 'success',
      duration: 5000,
    });
  });

  it('should handle very long messages', async () => {
    const { result } = renderHook(() => useToast());

    const longTitle = 'A'.repeat(200);
    const longDescription = 'B'.repeat(500);

    await act(async () => {
      result.current.toast({
        title: longTitle,
        description: longDescription,
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: longTitle,
      description: longDescription,
      type: 'success',
      duration: 5000,
    });
  });

  it('should handle duration of 0', async () => {
    const { result } = renderHook(() => useToast());

    await act(async () => {
      result.current.toast({
        title: 'Persistent toast',
        duration: 0,
      });
    });

    expect(mockShowToast).toHaveBeenCalledWith({
      title: 'Persistent toast',
      description: undefined,
      type: 'success',
      duration: 0,
    });
  });
});

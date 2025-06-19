
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

import { jest, describe, test, it, expect, beforeEach, afterEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { errorLogger } from '@/lib/services/error/error-logger';

/**
 * Tests for Error Boundary Components
 */

import {
  ErrorBoundary,
  ComponentErrorBoundary,
} from '@/components/error/error-boundary';


// Mock error logger
jest.mock('@/lib/services/error/error-logger', () => ({
  errorLogger: {
    logError: jest.fn().mockReturnValue(void 0),
  },
}));

// Component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({
  shouldThrow = true,
}) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that throws async error
const ThrowAsyncError: React.FC = () => {
  React.useEffect(() => {
    throw new Error('Async error');
  }, []);
  return <div>Loading...</div>;
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    jest.clearAllMocks();
    // Suppress console.error for these tests
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when no error', async () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should catch and display errors', async () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(
        'We apologize for the inconvenience. An unexpected error occurred.'
      )
    ).toBeInTheDocument();
  });

  it('should log errors with context', async () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>

    expect(errorLogger.logError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
      }),
      expect.objectContaining({
        component: expect.any(String),
        metadata: expect.objectContaining({
          errorCount: 1,
        }),
      })
  });

  it('should show error details in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary showDetails>
        <ThrowError />
      </ErrorBoundary>

    expect(screen.getByText('Test error')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should hide error details in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary showDetails>
        <ThrowError />
      </ErrorBoundary>

    expect(screen.queryByText('Test error')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('should reset error boundary on button click', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Click try again
    fireEvent.click(screen.getByText('Try Again'));

    // Rerender with non-throwing component
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should use custom fallback', async () => {
    const customFallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>

    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
  });

  it('should call onError callback', async () => {
    const onError = jest.fn().mockReturnValue(void 0);

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error',
      }),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should reset on resetKeys change', async () => {
    const { rerender } = render(
      <ErrorBoundary resetKeys={['key1']}>
        <ThrowError />
      </ErrorBoundary>

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Change reset keys
    rerender(
      <ErrorBoundary resetKeys={['key2']}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should auto-reset after multiple errors', async () => {
    jest.useFakeTimers();

    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>

    // Trigger multiple errors
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText('Try Again'));
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>

    }

    expect(
      screen.getByText(
        'Multiple errors detected. The page will refresh automatically in a few seconds.'
      )
    ).toBeInTheDocument();

    // Fast-forward timers
    jest.advanceTimersByTime(5000);

    // Should auto-reset
    rerender(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>

    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});

describe('ComponentErrorBoundary', () => {
  beforeEach(() => {
    // Set up test environment variables
    process.env.NODE_ENV = 'test';
    process.env.HUGGINGFACE_API_KEY = 'test-key';
    process.env.NEXTAUTH_SECRET = 'test-secret';
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_123';
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render children when no error', async () => {
    render(
      <ComponentErrorBoundary>
        <div>Component content</div>
      </ComponentErrorBoundary>

    expect(screen.getByText('Component content')).toBeInTheDocument();
  });

  it('should show component-specific error message', async () => {
    render(
      <ComponentErrorBoundary componentName="TestComponent">
        <ThrowError />
      </ComponentErrorBoundary>

    expect(
      screen.getByText('Failed to load TestComponent')
    ).toBeInTheDocument();
  });

  it('should use custom fallback', async () => {
    render(
      <ComponentErrorBoundary fallback={<div>Custom component error</div>}>
        <ThrowError />
      </ComponentErrorBoundary>

    expect(screen.getByText('Custom component error')).toBeInTheDocument();
  });

  it('should be isolated (not affect parent)', async () => {
    render(
      <div>
        <div>Outside content</div>
        <ComponentErrorBoundary>
          <ThrowError />
        </ComponentErrorBoundary>
      </div>

    expect(screen.getByText('Outside content')).toBeInTheDocument();
    expect(screen.getByText('Failed to load component')).toBeInTheDocument();
  });
});

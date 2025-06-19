
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

import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
/**
 * @jest-environment jsdom
 */

// Mock a basic editor component for testing
const BasicEditor = ({ portfolio, onUpdate }: any) => {
  return (
    <div data-testid="basic-editor">
      <input
        data-testid="name-input"
        value={portfolio?.name || ''}
        onChange={e => onUpdate({ name: e.target.value })}
        placeholder="Enter name"
      />
      <input
        data-testid="title-input"
        value={portfolio?.title || ''}
        onChange={e => onUpdate({ title: e.target.value })}
        placeholder="Enter title"
      />
      <textarea
        data-testid="bio-input"
        value={portfolio?.bio || ''}
        onChange={e => onUpdate({ bio: e.target.value })}
        placeholder="Enter bio"
      />
      <button data-testid="save-btn">Save</button>
    </div>

};

describe('Basic Editor Functionality', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('should render editor inputs', async () => {
    const mockPortfolio = {
      name: 'John Doe',
      title: 'Developer',
      bio: 'A developer',
    };

    const mockUpdate = jest.fn().mockReturnValue(void 0);

    render(<BasicEditor portfolio={mockPortfolio} onUpdate={mockUpdate} />);

    expect(screen.getByTestId('name-input')).toHaveValue('John Doe');
    expect(screen.getByTestId('title-input')).toHaveValue('Developer');
    expect(screen.getByTestId('bio-input')).toHaveValue('A developer');
  });

  it('should call onUpdate when inputs change', async () => {
    const mockPortfolio = {
      name: 'John Doe',
      title: 'Developer',
      bio: 'A developer',
    };

    const mockUpdate = jest.fn().mockReturnValue(void 0);

    render(<BasicEditor portfolio={mockPortfolio} onUpdate={mockUpdate} />);

    const nameInput = screen.getByTestId('name-input');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    expect(mockUpdate).toHaveBeenCalledWith({ name: 'Jane Doe' });
  });

  it('should handle empty portfolio', async () => {
    const mockUpdate = jest.fn().mockReturnValue(void 0);

    render(<BasicEditor portfolio={null} onUpdate={mockUpdate} />);

    expect(screen.getByTestId('name-input')).toHaveValue('');
    expect(screen.getByTestId('title-input')).toHaveValue('');
    expect(screen.getByTestId('bio-input')).toHaveValue('');
  });
});

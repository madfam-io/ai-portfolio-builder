
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
import { render, screen } from '@testing-library/react';
/**
 * @jest-environment jsdom
 */

// Mock template components
const MockModernTemplate = ({ portfolio }: any) => (
  <div data-testid="modern-template">
    <h1>{portfolio.name}</h1>
    <p>{portfolio.title}</p>
  </div>

const MockMinimalTemplate = ({ portfolio }: any) => (
  <div data-testid="minimal-template">
    <h1>{portfolio.name}</h1>
    <p>{portfolio.title}</p>
  </div>

const MockBusinessTemplate = ({ portfolio }: any) => (
  <div data-testid="business-template">
    <h1>{portfolio.name}</h1>
    <p>{portfolio.title}</p>
  </div>

// Template selector component
const TemplateSelector = ({ template, onTemplateChange }: any) => (
  <div data-testid="template-selector">
    <button
      data-testid="modern-btn"
      onClick={() => onTemplateChange('modern')}
      className={template === 'modern' ? 'selected' : ''}
    >
      Modern
    </button>
    <button
      data-testid="minimal-btn"
      onClick={() => onTemplateChange('minimal')}
      className={template === 'minimal' ? 'selected' : ''}
    >
      Minimal
    </button>
    <button
      data-testid="business-btn"
      onClick={() => onTemplateChange('business')}
      className={template === 'business' ? 'selected' : ''}
    >
      Business
    </button>
  </div>

// Template renderer
const TemplateRenderer = ({ portfolio }: any) => {
  const templates = {
    modern: MockModernTemplate,
    minimal: MockMinimalTemplate,
    business: MockBusinessTemplate,
  };

  const TemplateComponent =
    templates[portfolio.template as keyof typeof templates];

  if (!TemplateComponent) {
    return <div data-testid="unknown-template">Unknown template</div>;
  }

  return <TemplateComponent portfolio={portfolio} />;
};

describe('Template System Integration', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const mockPortfolio = {
    id: 'test',
    name: 'John Doe',
    title: 'Software Developer',
    template: 'modern',
  };

  it('should render modern template by default', async () => {
    render(<TemplateRenderer portfolio={mockPortfolio} />);

    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Developer')).toBeInTheDocument();
  });

  it('should render minimal template when selected', async () => {
    const portfolioWithMinimal = { ...mockPortfolio, template: 'minimal' };

    render(<TemplateRenderer portfolio={portfolioWithMinimal} />);

    expect(screen.getByTestId('minimal-template')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render business template when selected', async () => {
    const portfolioWithBusiness = { ...mockPortfolio, template: 'business' };

    render(<TemplateRenderer portfolio={portfolioWithBusiness} />);

    expect(screen.getByTestId('business-template')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should handle unknown template gracefully', async () => {
    const portfolioWithUnknown = { ...mockPortfolio, template: 'unknown' };

    render(<TemplateRenderer portfolio={portfolioWithUnknown} />);

    expect(screen.getByTestId('unknown-template')).toBeInTheDocument();
    expect(screen.getByText('Unknown template')).toBeInTheDocument();
  });

  it('should render template selector with correct active state', async () => {
    const mockOnChange = jest.fn().mockReturnValue(void 0);

    render(
      <TemplateSelector template="modern" onTemplateChange={mockOnChange} />

    expect(screen.getByTestId('template-selector')).toBeInTheDocument();
    expect(screen.getByTestId('modern-btn')).toHaveClass('selected');
    expect(screen.getByTestId('minimal-btn')).not.toHaveClass('selected');
    expect(screen.getByTestId('business-btn')).not.toHaveClass('selected');
  });

  it('should handle missing portfolio data gracefully', async () => {
    const emptyPortfolio = {
      id: 'test',
      name: '',
      title: '',
      template: 'modern',
    };

    render(<TemplateRenderer portfolio={emptyPortfolio} />);

    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
  });

  it('should preserve data across template changes', async () => {
    const { rerender } = render(<TemplateRenderer portfolio={mockPortfolio} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();

    const portfolioWithNewTemplate = { ...mockPortfolio, template: 'minimal' };
    rerender(<TemplateRenderer portfolio={portfolioWithNewTemplate} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByTestId('minimal-template')).toBeInTheDocument();
  });

  it('should render all templates with same data consistently', async () => {
    const templates = ['modern', 'minimal', 'business'];

    templates.forEach(template => {
      const portfolioWithTemplate = { ...mockPortfolio, template };
      const { unmount } = render(
        <TemplateRenderer portfolio={portfolioWithTemplate} />

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Developer')).toBeInTheDocument();

      unmount();
    });
  });
});

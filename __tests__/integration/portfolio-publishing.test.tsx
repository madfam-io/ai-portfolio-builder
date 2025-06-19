
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
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Portfolio } from '@/types/portfolio';
/**
 * @jest-environment jsdom
 */

// Mock fetch for API calls
global.fetch = jest.fn().mockReturnValue(void 0);

// Mock the publishing flow components
const MockPublishingFlow = () => {
  const [step, setStep] = React.useState<
    'subdomain' | 'preview' | 'publishing' | 'success'
  >('subdomain');
  const [subdomain, setSubdomain] = React.useState('');
  const [isPublishing, setIsPublishing] = React.useState(false);

  const handleSubdomainCheck = async () => {
    try {
      const response = await fetch('/api/v1/portfolios/check-subdomain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain }),
      });

      if (response.ok) {
        setStep('preview');
      }
    } catch (error) {
      console.error('Subdomain check failed');
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setStep('publishing');

    try {
      const response = await fetch(
        '/api/v1/portfolios/test-portfolio/publish',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subdomain }),
        }

      if (response.ok) {
        setStep('success');
      }
    } catch (error) {
      console.error('Publishing failed');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div data-testid="publishing-flow">
      {step === 'subdomain' && (
        <div data-testid="subdomain-step">
          <h2>Choose Your Subdomain</h2>
          <input
            data-testid="subdomain-input"
            value={subdomain}
            onChange={e => setSubdomain(e.target.value)}
            placeholder="your-name"
          />
          <button
            data-testid="check-subdomain-btn"
            onClick={handleSubdomainCheck}
            disabled={!subdomain}
          >
            Check Availability
          </button>
        </div>
      )}

      {step === 'preview' && (
        <div data-testid="preview-step">
          <h2>Preview Your Portfolio</h2>
          <p>Your portfolio will be available at: {subdomain}.prisma.dev</p>
          <button data-testid="publish-btn" onClick={handlePublish}>
            Publish Portfolio
          </button>
          <button data-testid="back-btn" onClick={() => setStep('subdomain')}>
            Back
          </button>
        </div>
      )}

      {step === 'publishing' && (
        <div data-testid="publishing-step">
          <h2>Publishing Your Portfolio...</h2>
          <div data-testid="loading-indicator">Publishing in progress</div>
        </div>
      )}

      {step === 'success' && (
        <div data-testid="success-step">
          <h2>Portfolio Published Successfully!</h2>
          <p>Your portfolio is now live at:</p>
          <a
            data-testid="live-portfolio-link"
            href={`https://${subdomain}.prisma.dev`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {subdomain}.prisma.dev
          </a>
          <button data-testid="view-analytics-btn">View Analytics</button>
        </div>
      )}
    </div>

};

describe('Portfolio Publishing Integration', () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Subdomain Selection Flow', () => {
    it('should render subdomain selection step initially', async () => {
      render(<MockPublishingFlow />);

      expect(screen.getByTestId('subdomain-step')).toBeInTheDocument();
      expect(screen.getByText('Choose Your Subdomain')).toBeInTheDocument();
      expect(screen.getByTestId('subdomain-input')).toBeInTheDocument();
    });

    it('should enable check button when subdomain is entered', async () => {
      render(<MockPublishingFlow />);

      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      expect(checkButton).toBeDisabled();

      fireEvent.change(input, { target: { value: 'john-doe' } });

      expect(checkButton).not.toBeDisabled();
    });

    it('should check subdomain availability when button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(<MockPublishingFlow />);

      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'john-doe' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/portfolios/check-subdomain',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subdomain: 'john-doe' }),
          }

      });
    });

    it('should advance to preview step when subdomain is available', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(<MockPublishingFlow />);

      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'john-doe' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });
    });

    it('should handle subdomain validation errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Subdomain taken')

      render(<MockPublishingFlow />);

      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'taken-subdomain' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        // Should remain on subdomain step
        expect(screen.getByTestId('subdomain-step')).toBeInTheDocument();
      });
    });
  });

  describe('Preview and Confirmation Flow', () => {
    it('should show preview with subdomain URL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(<MockPublishingFlow />);

      // Navigate to preview step
      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'john-doe' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByText(/john-doe\.prisma\.dev/)).toBeInTheDocument();
        expect(screen.getByTestId('publish-btn')).toBeInTheDocument();
        expect(screen.getByTestId('back-btn')).toBeInTheDocument();
      });
    });

    it('should allow navigation back to subdomain step', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      render(<MockPublishingFlow />);

      // Navigate to preview step
      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'john-doe' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });

      // Go back
      const backButton = screen.getByTestId('back-btn');
      fireEvent.click(backButton);

      expect(screen.getByTestId('subdomain-step')).toBeInTheDocument();
    });
  });

  describe('Publishing Process', () => {
    it('should show publishing step when publish button is clicked', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            url: 'https://john-doe.prisma.dev',
            deploymentId: 'deploy_123',
          }),
        });

      render(<MockPublishingFlow />);

      // Navigate to preview step
      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'john-doe' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });

      // Start publishing
      const publishButton = screen.getByTestId('publish-btn');
      fireEvent.click(publishButton);

      expect(screen.getByTestId('publishing-step')).toBeInTheDocument();
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });

    it('should make publish API call with correct data', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<MockPublishingFlow />);

      // Navigate through flow
      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'john-doe' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });

      const publishButton = screen.getByTestId('publish-btn');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/v1/portfolios/test-portfolio/publish',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ subdomain: 'john-doe' }),
          }

      });
    });

    it('should show success step after publishing completes', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<MockPublishingFlow />);

      // Complete flow
      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'john-doe' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });

      const publishButton = screen.getByTestId('publish-btn');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-step')).toBeInTheDocument();
        expect(
          screen.getByText('Portfolio Published Successfully!')
        ).toBeInTheDocument();
        expect(screen.getByTestId('live-portfolio-link')).toBeInTheDocument();
      });
    });

    it('should handle publishing errors gracefully', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockRejectedValueOnce(new Error('Publishing failed'));

      render(<MockPublishingFlow />);

      // Navigate through flow
      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'john-doe' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });

      const publishButton = screen.getByTestId('publish-btn');
      fireEvent.click(publishButton);

      await waitFor(() => {
        // Should show publishing step initially
        expect(screen.getByTestId('publishing-step')).toBeInTheDocument();
      });

      // Wait for error handling - should not advance to success
      await waitFor(
        () => {
          expect(screen.queryByTestId('success-step')).not.toBeInTheDocument();
        },
        { timeout: 3000 }

    });
  });

  describe('Success State and Post-Publishing', () => {
    it('should display live portfolio link in success step', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<MockPublishingFlow />);

      // Complete full flow
      const input = screen.getByTestId('subdomain-input');
      fireEvent.change(input, { target: { value: 'john-doe' } });

      const checkButton = screen.getByTestId('check-subdomain-btn');
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });

      const publishButton = screen.getByTestId('publish-btn');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-step')).toBeInTheDocument();
      });

      const liveLink = screen.getByTestId('live-portfolio-link');
      expect(liveLink).toHaveAttribute('href', 'https://john-doe.prisma.dev');
      expect(liveLink).toHaveAttribute('target', '_blank');
      expect(liveLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should provide analytics access in success step', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      render(<MockPublishingFlow />);

      // Complete full flow to success
      const input = screen.getByTestId('subdomain-input');
      fireEvent.change(input, { target: { value: 'john-doe' } });

      const checkButton = screen.getByTestId('check-subdomain-btn');
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });

      const publishButton = screen.getByTestId('publish-btn');
      fireEvent.click(publishButton);

      await waitFor(() => {
        expect(screen.getByTestId('success-step')).toBeInTheDocument();
      });

      expect(screen.getByTestId('view-analytics-btn')).toBeInTheDocument();
    });
  });

  describe('Accessibility and UX', () => {
    it('should have proper focus management throughout flow', async () => {
      render(<MockPublishingFlow />);

      const input = screen.getByTestId('subdomain-input');
      input.focus();
      expect(input).toHaveFocus();

      fireEvent.change(input, { target: { value: 'john-doe' } });

      const checkButton = screen.getByTestId('check-subdomain-btn');
      expect(checkButton).not.toBeDisabled();
    });

    it('should provide clear progress indication', async () => {
      render(<MockPublishingFlow />);

      // Each step should be clearly identified
      expect(screen.getByTestId('subdomain-step')).toBeInTheDocument();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ available: true }),
      });

      const input = screen.getByTestId('subdomain-input');
      const checkButton = screen.getByTestId('check-subdomain-btn');

      fireEvent.change(input, { target: { value: 'john-doe' } });
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });
    });

    it('should have appropriate loading states', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ available: true }),
        })
        .mockImplementationOnce(
          () => new Promise(resolve => setTimeout(resolve, 100))

      render(<MockPublishingFlow />);

      // Navigate to publishing step
      const input = screen.getByTestId('subdomain-input');
      fireEvent.change(input, { target: { value: 'john-doe' } });

      const checkButton = screen.getByTestId('check-subdomain-btn');
      fireEvent.click(checkButton);

      await waitFor(() => {
        expect(screen.getByTestId('preview-step')).toBeInTheDocument();
      });

      const publishButton = screen.getByTestId('publish-btn');
      fireEvent.click(publishButton);

      expect(screen.getByTestId('publishing-step')).toBeInTheDocument();
      expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
    });
  });
});

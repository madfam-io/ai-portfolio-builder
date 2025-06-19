
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

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockUseLanguage  } from '@/__tests__/utils/mock-i18n';
import React from 'react';

// Mock zustand stores
const mockPortfolioStore = {
  portfolios: [],
  currentPortfolio: null,
  isLoading: false,
  error: null,
  fetchPortfolios: jest.fn(),
  createPortfolio: jest.fn(),
  updatePortfolio: jest.fn(),
  deletePortfolio: jest.fn(),
  setCurrentPortfolio: jest.fn(),
};

jest.mock('@/lib/store/portfolio-store', () => ({ 
  usePortfolioStore: jest.fn(() => mockPortfolioStore),
 }));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import NewPortfolioPage from '@/app/editor/new/page';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';

import { // Mock i18n

jest.mock('zustand', () => ({
jest.mock('@/lib/i18n/refactored-context', () => ({
jest.mock('next/navigation');
jest.mock('@/lib/store/portfolio-store');
jest.mock('@/lib/store/auth-store');
jest.mock('@/hooks/use-toast');
jest.mock('@/components/auth/protected-route', () => ({
jest.mock('@/components/layouts/BaseLayout', () => ({
jest.mock('lucide-react', () => ({

create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

  useLanguage: () => mockUseLanguage(),
}));

describe, test, it, expect, beforeEach, jest  } from '@jest/globals';

// Mock dependencies

  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock lucide-react icons

  ChevronRight: () => <span>ChevronRight</span>,
  ChevronLeft: () => <span>ChevronLeft</span>,
  User: () => <span>User</span>,
  Layout: () => <span>Layout</span>,
  Upload: () => <span>Upload</span>,
  Sparkles: () => <span>Sparkles</span>,
  Check: () => <span>Check</span>,
}));

describe('Portfolio Creation Flow', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const mockPush = jest.fn().mockReturnValue(void 0);
  const mockToast = jest.fn().mockReturnValue(void 0);
  const mockCreatePortfolio = jest.fn().mockReturnValue(void 0);

  const mockT = {
    // Basic info step
    createNewPortfolio: 'Create New Portfolio',
    yourName: 'Your Name',
    yourTitle: 'Your Title',
    shortBio: 'Short Bio',
    tellUsAboutYourself: 'Tell us about yourself',
    next: 'Next',

    // Template step
    chooseTemplate: 'Choose a Template',
    modern: 'Modern',
    modernDesc: 'Clean and minimalist design',
    creative: 'Creative',
    creativeDesc: 'Bold and expressive layout',
    professional: 'Professional',
    professionalDesc: 'Traditional and formal style',
    back: 'Back',

    // Import step
    importData: 'Import Your Data',
    manual: 'Manual Entry',
    manualDesc: 'Enter your information manually',
    linkedin: 'LinkedIn',
    linkedinDesc: 'Import from LinkedIn profile',
    github: 'GitHub',
    githubDesc: 'Import from GitHub profile',
    cv: 'Upload CV',
    cvDesc: 'Upload your CV/Resume',

    // Enhance step
    aiEnhancement: 'AI Enhancement',
    enhanceContentDesc: 'Our AI will enhance your content',
    createPortfolio: 'Create Portfolio',
    creating: 'Creating...',

    // Messages
    success: 'Success',
    portfolioCreated: 'Your portfolio has been created!',
    error: 'Error',
    failedToCreatePortfolio: 'Failed to create portfolio. Please try again.',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    (useLanguage as jest.Mock).mockReturnValue({
      t: mockT,
      language: 'en',
    });
    jest.mocked(useAuthStore).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as any);
    (
      usePortfolioStore as jest.MockedFunction<typeof usePortfolioStore>
    ).mockReturnValue({
      createPortfolio: mockCreatePortfolio,
    } as any);
  });

  describe('Basic Info Step', () => {
    it('should render basic info form', async () => {
      render(<NewPortfolioPage />);

      expect(screen.getByLabelText(mockT.yourName)).toBeInTheDocument();
      expect(screen.getByLabelText(mockT.yourTitle)).toBeInTheDocument();
      expect(screen.getByLabelText(mockT.shortBio)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: mockT.next })
      ).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<NewPortfolioPage />);

      const nextButton = screen.getByRole('button', { name: mockT.next });

      // Try to proceed without filling fields
      await user.click(nextButton);

      // Should still be on the same step
      expect(screen.getByLabelText(mockT.yourName)).toBeInTheDocument();
    });

    it('should proceed to template step when fields are filled', async () => {
      const user = userEvent.setup();
      render(<NewPortfolioPage />);

      // Fill in the form
      await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
      await user.type(
        screen.getByLabelText(mockT.yourTitle),
        'Software Engineer'

      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'

      // Click next
      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Should be on template step
      await waitFor(() => {
        expect(screen.getByText(mockT.chooseTemplate)).toBeInTheDocument();
      });
    });
  });

  describe('Template Selection Step', () => {
    it('should display template options', async () => {
      const user = userEvent.setup();
      render(<NewPortfolioPage />);

      // Navigate to template step
      await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
      await user.type(
        screen.getByLabelText(mockT.yourTitle),
        'Software Engineer'

      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'

      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Check template options
      await waitFor(() => {
        expect(screen.getByText(mockT.modern)).toBeInTheDocument();
        expect(screen.getByText(mockT.creative)).toBeInTheDocument();
        expect(screen.getByText(mockT.professional)).toBeInTheDocument();
      });
    });

    it('should allow template selection', async () => {
      const user = userEvent.setup();
      render(<NewPortfolioPage />);

      // Navigate to template step
      await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
      await user.type(
        screen.getByLabelText(mockT.yourTitle),
        'Software Engineer'

      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'

      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Select creative template
      await waitFor(() => {
        const creativeOption = screen
          .getByText(mockT.creative)
          .closest('button');
        expect(creativeOption).toBeInTheDocument();
      });

      const creativeOption = screen.getByText(mockT.creative).closest('button');
      await user.click(creativeOption!);

      // Proceed to next step
      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Should be on import step
      await waitFor(() => {
        expect(screen.getByText(mockT.importData)).toBeInTheDocument();
      });
    });

    it('should allow going back to basic info', async () => {
      const user = userEvent.setup();
      render(<NewPortfolioPage />);

      // Navigate to template step
      await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
      await user.type(
        screen.getByLabelText(mockT.yourTitle),
        'Software Engineer'

      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'

      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Click back
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: mockT.back })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: mockT.back }));

      // Should be back on basic info step
      expect(screen.getByLabelText(mockT.yourName)).toHaveValue('John Doe');
    });
  });

  describe('Import Data Step', () => {
    const navigateToImportStep = async () => {
      const user = userEvent.setup();

      // Fill basic info
      await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
      await user.type(
        screen.getByLabelText(mockT.yourTitle),
        'Software Engineer'

      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'

      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Select template
      await waitFor(() => {
        const modernOption = screen.getByText(mockT.modern).closest('button');
        expect(modernOption).toBeInTheDocument();
      });
      await user.click(screen.getByText(mockT.modern).closest('button')!);
      await user.click(screen.getByRole('button', { name: mockT.next }));
    };

    it('should display import options', async () => {
      render(<NewPortfolioPage />);
      await navigateToImportStep();

      await waitFor(() => {
        expect(screen.getByText(mockT.manual)).toBeInTheDocument();
        expect(screen.getByText(mockT.linkedin)).toBeInTheDocument();
        expect(screen.getByText(mockT.github)).toBeInTheDocument();
        expect(screen.getByText(mockT.cv)).toBeInTheDocument();
      });
    });

    it('should select import source', async () => {
      const user = userEvent.setup();
      render(<NewPortfolioPage />);
      await navigateToImportStep();

      // Select GitHub import
      await waitFor(() => {
        const githubOption = screen.getByText(mockT.github).closest('button');
        expect(githubOption).toBeInTheDocument();
      });

      await user.click(screen.getByText(mockT.github).closest('button')!);
      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Should be on enhance step
      await waitFor(() => {
        expect(screen.getByText(mockT.aiEnhancement)).toBeInTheDocument();
      });
    });
  });

  describe('AI Enhancement Step', () => {
    const navigateToEnhanceStep = async () => {
      const user = userEvent.setup();

      // Fill basic info
      await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
      await user.type(
        screen.getByLabelText(mockT.yourTitle),
        'Software Engineer'

      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'

      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Select template
      await waitFor(() => screen.getByText(mockT.modern));
      await user.click(screen.getByText(mockT.modern).closest('button')!);
      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Select import source
      await waitFor(() => screen.getByText(mockT.manual));

  create: jest.fn((createState) => {
    const api = (() => {
      let state = createState(
        (...args) => {
          state = Object.assign({}, state, args[0]);
          return state;
        },
        () => state,
        api
      );
      return state;
    })();
    return Object.assign(() => api, api);
  }),
}));

      await user.click(screen.getByText(mockT.manual).closest('button')!);
      await user.click(screen.getByRole('button', { name: mockT.next }));
    };

    it('should display AI enhancement options', async () => {
      render(<NewPortfolioPage />);
      await navigateToEnhanceStep();

      await waitFor(() => {
        expect(screen.getByText(mockT.aiEnhancement)).toBeInTheDocument();
        expect(screen.getByText(mockT.enhanceContentDesc)).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: mockT.createPortfolio })
        ).toBeInTheDocument();
      });
    });

    it('should create portfolio successfully', async () => {
      const user = userEvent.setup();
      const mockPortfolio = { id: 'portfolio-123' };
      mockCreatePortfolio.mockResolvedValue(mockPortfolio);

      render(<NewPortfolioPage />);
      await navigateToEnhanceStep();

      // Click create portfolio
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: mockT.createPortfolio })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: mockT.createPortfolio })

      // Should show creating state
      expect(
        screen.getByRole('button', { name: mockT.creating })
      ).toBeDisabled();

      // Wait for creation to complete
      await waitFor(() => {
        expect(mockCreatePortfolio).toHaveBeenCalledWith(
      {
          name: 'John Doe',
          title: 'Software Engineer',
          bio: 'Experienced developer',
          template: 'modern',
    });
  });
      });

      // Should show success toast and redirect
      expect(mockToast).toHaveBeenCalledWith(
      {
        title: mockT.success,
        description: mockT.portfolioCreated,
    });
  });
      expect(mockPush).toHaveBeenCalledWith('/editor/portfolio-123');
    });

    it('should handle portfolio creation error', async () => {
      const user = userEvent.setup();
      mockCreatePortfolio.mockRejectedValue(new Error('Network error'));

      render(<NewPortfolioPage />);
      await navigateToEnhanceStep();

      // Click create portfolio
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: mockT.createPortfolio })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: mockT.createPortfolio })

      // Wait for error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
      {
          title: mockT.error,
          description: mockT.failedToCreatePortfolio,
          variant: 'destructive',
    });
  });
      });

      // Button should be enabled again
      expect(
        screen.getByRole('button', { name: mockT.createPortfolio })
      ).toBeEnabled();

      // Should not redirect
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('Step Navigation', () => {
    it('should track progress through steps', async () => {
      const user = userEvent.setup();
      render(<NewPortfolioPage />);

      // Should start at step 1
      expect(screen.getByTestId('step-1')).toHaveAttribute(
        'data-active',
        'true'

      // Navigate to step 2
      await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
      await user.type(
        screen.getByLabelText(mockT.yourTitle),
        'Software Engineer'

      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'

      await user.click(screen.getByRole('button', { name: mockT.next }));

      await waitFor(() => {
        expect(screen.getByTestId('step-2')).toHaveAttribute(
          'data-active',
          'true'

      });

      // Navigate to step 3
      await user.click(screen.getByText(mockT.modern).closest('button')!);
      await user.click(screen.getByRole('button', { name: mockT.next }));

      await waitFor(() => {
        expect(screen.getByTestId('step-3')).toHaveAttribute(
          'data-active',
          'true'

      });

      // Navigate to step 4
      await user.click(screen.getByText(mockT.manual).closest('button')!);
      await user.click(screen.getByRole('button', { name: mockT.next }));

      await waitFor(() => {
        expect(screen.getByTestId('step-4')).toHaveAttribute(
          'data-active',
          'true'

      });
    });

    it('should preserve form data when navigating between steps', async () => {
      const user = userEvent.setup();
      render(<NewPortfolioPage />);

      // Fill basic info
      await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
      await user.type(
        screen.getByLabelText(mockT.yourTitle),
        'Software Engineer'

      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'

      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Go to template step and back
      await waitFor(() => screen.getByText(mockT.chooseTemplate));
      await user.click(screen.getByRole('button', { name: mockT.back }));

      // Check that data is preserved
      expect(screen.getByLabelText(mockT.yourName)).toHaveValue('John Doe');
      expect(screen.getByLabelText(mockT.yourTitle)).toHaveValue(
        'Software Engineer'

      expect(screen.getByLabelText(mockT.shortBio)).toHaveValue(
        'Experienced developer'

    });
  });
});
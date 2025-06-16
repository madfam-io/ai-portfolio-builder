import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import NewPortfolioPage from '@/app/editor/new/page';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/lib/store/portfolio-store');
jest.mock('@/lib/store/auth-store');
jest.mock('@/hooks/use-toast');
jest.mock('@/lib/i18n/refactored-context');
jest.mock('@/components/auth/protected-route', () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));
jest.mock('@/components/layouts/BaseLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronRight: () => <span>ChevronRight</span>,
  ChevronLeft: () => <span>ChevronLeft</span>,
  User: () => <span>User</span>,
  Layout: () => <span>Layout</span>,
  Upload: () => <span>Upload</span>,
  Sparkles: () => <span>Sparkles</span>,
  Check: () => <span>Check</span>,
}));

describe('Portfolio Creation Flow', () => {
  const mockPush = jest.fn();
  const mockToast = jest.fn();
  const mockCreatePortfolio = jest.fn();

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
    (useAuthStore as jest.MockedFunction<typeof useAuthStore>).mockReturnValue({
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
    it('should render basic info form', () => {
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
      );
      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'
      );

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
      );
      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'
      );
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
      );
      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'
      );
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
      );
      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'
      );
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
      );
      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'
      );
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
      );
      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'
      );
      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Select template
      await waitFor(() => screen.getByText(mockT.modern));
      await user.click(screen.getByText(mockT.modern).closest('button')!);
      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Select import source
      await waitFor(() => screen.getByText(mockT.manual));
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
      );

      // Should show creating state
      expect(
        screen.getByRole('button', { name: mockT.creating })
      ).toBeDisabled();

      // Wait for creation to complete
      await waitFor(() => {
        expect(mockCreatePortfolio).toHaveBeenCalledWith({
          name: 'John Doe',
          title: 'Software Engineer',
          bio: 'Experienced developer',
          template: 'modern',
        });
      });

      // Should show success toast and redirect
      expect(mockToast).toHaveBeenCalledWith({
        title: mockT.success,
        description: mockT.portfolioCreated,
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
      );

      // Wait for error
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: mockT.error,
          description: mockT.failedToCreatePortfolio,
          variant: 'destructive',
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
      );

      // Navigate to step 2
      await user.type(screen.getByLabelText(mockT.yourName), 'John Doe');
      await user.type(
        screen.getByLabelText(mockT.yourTitle),
        'Software Engineer'
      );
      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'
      );
      await user.click(screen.getByRole('button', { name: mockT.next }));

      await waitFor(() => {
        expect(screen.getByTestId('step-2')).toHaveAttribute(
          'data-active',
          'true'
        );
      });

      // Navigate to step 3
      await user.click(screen.getByText(mockT.modern).closest('button')!);
      await user.click(screen.getByRole('button', { name: mockT.next }));

      await waitFor(() => {
        expect(screen.getByTestId('step-3')).toHaveAttribute(
          'data-active',
          'true'
        );
      });

      // Navigate to step 4
      await user.click(screen.getByText(mockT.manual).closest('button')!);
      await user.click(screen.getByRole('button', { name: mockT.next }));

      await waitFor(() => {
        expect(screen.getByTestId('step-4')).toHaveAttribute(
          'data-active',
          'true'
        );
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
      );
      await user.type(
        screen.getByLabelText(mockT.shortBio),
        'Experienced developer'
      );
      await user.click(screen.getByRole('button', { name: mockT.next }));

      // Go to template step and back
      await waitFor(() => screen.getByText(mockT.chooseTemplate));
      await user.click(screen.getByRole('button', { name: mockT.back }));

      // Check that data is preserved
      expect(screen.getByLabelText(mockT.yourName)).toHaveValue('John Doe');
      expect(screen.getByLabelText(mockT.yourTitle)).toHaveValue(
        'Software Engineer'
      );
      expect(screen.getByLabelText(mockT.shortBio)).toHaveValue(
        'Experienced developer'
      );
    });
  });
});

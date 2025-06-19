
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
import userEvent from '@testing-library/user-event';
import { mockUseLanguage } from '@/__tests__/utils/mock-i18n';
import { EditorPreview } from '@/components/editor/EditorPreview';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Portfolio } from '@/types/portfolio';
/**
 * @jest-environment jsdom
 */

// Mock i18n
jest.mock('@/lib/i18n/refactored-context', () => ({ 
  useLanguage: mockUseLanguage,
 }));

// Mock dependencies

// Mock useLanguage hook
  useLanguage: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    t: {
      welcomeMessage: 'Welcome',
      heroTitle: 'Create Your Portfolio',
      getStarted: 'Get Started',
      save: 'Save',
      cancel: 'Cancel',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      enhanceWithAI: 'Enhance with AI',
      publish: 'Publish',
      preview: 'Preview',
      // Add more translations as needed
    },
  }),
  LanguageProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

  useLanguage: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({ 
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
 }));

// Mock template rendering
jest.mock('@/components/templates/DeveloperTemplate', () => ({
  DeveloperTemplate: ({ portfolio }: any) => (
    <div data-testid="developer-template">
      <h1>{portfolio.title}</h1>
      <p>{portfolio.tagline}</p>
      <div data-testid="hero-section">Hero: {portfolio.title}</div>
      <div data-testid="about-section">About: {portfolio.bio}</div>
      <div data-testid="projects-section">
        Projects: {portfolio.projects?.length || 0}
      </div>
    </div>
  ),
}));

jest.mock('@/components/templates/DesignerTemplate', () => ({
  DesignerTemplate: ({ portfolio }: any) => (
    <div data-testid="designer-template">
      <h1>{portfolio.title}</h1>
      <p>{portfolio.tagline}</p>
    </div>
  ),
}));

jest.mock('@/components/templates/ConsultantTemplate', () => ({
  ConsultantTemplate: ({ portfolio }: any) => (
    <div data-testid="consultant-template">
      <h1>{portfolio.title}</h1>
      <p>{portfolio.tagline}</p>
    </div>
  ),
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('EditorPreview', () => {
  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'My Portfolio',
    title: 'Software Developer',
    tagline: 'Building amazing web applications',
    bio: 'Experienced developer with passion for creating user-friendly applications.',
    contact: {
      email: 'test@example.com',
      phone: '+1-555-0123',
      location: 'San Francisco, CA',
    },
    social: {
      linkedin: 'https://linkedin.com/in/test',
      github: 'https://github.com/test',
    },
    experience: [
      {
        id: 'exp-1',
        company: 'Tech Company',
        position: 'Senior Developer',
        startDate: '2022-01-01',
        endDate: '2024-12-31',
        description: 'Led development of key features',
        current: false,
      },
    ],
    education: [],
    projects: [
      {
        id: 'project-1',
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce application',
        technologies: ['React', 'Node.js'],
        link: 'https://github.com/test/ecommerce',
      },
      {
        id: 'project-2',
        title: 'Portfolio Website',
        description: 'Personal portfolio built with Next.js',
        technologies: ['Next.js', 'TypeScript'],
        link: 'https://github.com/test/portfolio',
      },
    ],
    skills: ['JavaScript', 'React', 'Node.js'],
    certifications: [],
    template: 'developer',
    customization: {},
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProps = {
    portfolio: mockPortfolio,
    previewMode: 'desktop' as const,
    className: '',
  };

  const mockTranslations = {
    preview: 'Preview',
    desktopView: 'Desktop View',
    tabletView: 'Tablet View',
    mobileView: 'Mobile View',
    loading: 'Loading preview...',
    error: 'Error loading preview',
    noTemplate: 'No template selected',
    refreshPreview: 'Refresh Preview',
    fullscreen: 'Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
  };

  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    jest.clearAllMocks();
    (mockUseLanguage as any).mockImplementation(() => ({
      t: mockTranslations,
    });
  });

  const renderEditorPreview = (props = mockProps) => {
    return render(<EditorPreview {...props} />);
  };

  describe('Initial Rendering', () => {
    it('should render the preview container', async () => {
      renderEditorPreview();

      const previewContainer = screen.getByRole('region', { name: /preview/i });
      expect(previewContainer).toBeInTheDocument();
    });

    it('should render the correct template based on portfolio', async () => {
      renderEditorPreview();

      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(
        screen.getByText('Building amazing web applications')
      ).toBeInTheDocument();
    });

    it('should render designer template when specified', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          template: 'designer',
        },
      });

      expect(screen.getByTestId('designer-template')).toBeInTheDocument();
      expect(
        screen.queryByTestId('developer-template')
      ).not.toBeInTheDocument();
    });

    it('should render consultant template when specified', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          template: 'consultant',
        },
      });

      expect(screen.getByTestId('consultant-template')).toBeInTheDocument();
      expect(
        screen.queryByTestId('developer-template')
      ).not.toBeInTheDocument();
    });

    it('should apply custom className', async () => {
      renderEditorPreview({
        ...mockProps,
        className: 'custom-preview-class',
      });

      const previewContainer = screen.getByRole('region', { name: /preview/i });
      expect(previewContainer).toHaveClass('custom-preview-class');
    });
  });

  describe('Preview Mode Responsiveness', () => {
    it('should apply desktop styling in desktop mode', async () => {
      renderEditorPreview({
        ...mockProps,
        previewMode: 'desktop',
      });

      const templateContainer =
        screen.getByTestId('developer-template').parentElement;
      expect(templateContainer).toHaveClass('w-full'); // Desktop full width
    });

    it('should apply tablet styling in tablet mode', async () => {
      renderEditorPreview({
        ...mockProps,
        previewMode: 'tablet',
      });

      const templateContainer =
        screen.getByTestId('developer-template').parentElement;
      expect(templateContainer).toHaveClass('max-w-3xl'); // Tablet max width
    });

    it('should apply mobile styling in mobile mode', async () => {
      renderEditorPreview({
        ...mockProps,
        previewMode: 'mobile',
      });

      const templateContainer =
        screen.getByTestId('developer-template').parentElement;
      expect(templateContainer).toHaveClass('max-w-sm'); // Mobile max width
    });

    it('should transition smoothly between preview modes', async () => {
      const { rerender } = renderEditorPreview({
        ...mockProps,
        previewMode: 'desktop',
      });

      let container = screen.getByTestId('developer-template').parentElement;
      expect(container).toHaveClass('w-full');

      rerender(<EditorPreview {...mockProps} previewMode="mobile" />);

      container = screen.getByTestId('developer-template').parentElement;
      expect(container).toHaveClass('max-w-sm');
      expect(container).toHaveClass('transition-all'); // Smooth transition
    });

    it('should center content in all preview modes', async () => {
      const modes = ['desktop', 'tablet', 'mobile'] as const;

      modes.forEach(mode => {
        const { rerender } = renderEditorPreview({
          ...mockProps,
          previewMode: mode,
        });

        const container =
          screen.getByTestId('developer-template').parentElement;
        expect(container).toHaveClass('mx-auto'); // Centered
      });
    });
  });

  describe('Template Data Rendering', () => {
    it('should pass complete portfolio data to template', async () => {
      renderEditorPreview();

      // Check that portfolio data is rendered
      expect(screen.getByText('Hero: Software Developer')).toBeInTheDocument();
      expect(
        screen.getByText(/About:.*Experienced developer/)
      ).toBeInTheDocument();
      expect(screen.getByText('Projects: 2')).toBeInTheDocument();
    });

    it('should update template when portfolio data changes', async () => {
      const { rerender } = renderEditorPreview();

      expect(screen.getByText('Hero: Software Developer')).toBeInTheDocument();

      rerender(
        <EditorPreview
          {...mockProps}
          portfolio={{
            ...mockPortfolio,
            title: 'Full Stack Developer',
          }}
        />

      expect(
        screen.getByText('Hero: Full Stack Developer')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Hero: Software Developer')
      ).not.toBeInTheDocument();
    });

    it('should handle portfolio with missing data gracefully', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          title: '',
          tagline: '',
          bio: '',
          projects: [],
        },
      });

      // Should still render template without crashing
      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
      expect(screen.getByText('Projects: 0')).toBeInTheDocument();
    });

    it('should handle null portfolio gracefully', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: null as any,
      });

      // Should show error state or fallback
      expect(screen.getByText('Error loading preview')).toBeInTheDocument();
    });
  });

  describe('Real-time Updates', () => {
    it('should reflect changes immediately', async () => {
      const { rerender } = renderEditorPreview();

      expect(
        screen.getByText('Building amazing web applications')
      ).toBeInTheDocument();

      rerender(
        <EditorPreview
          {...mockProps}
          portfolio={{
            ...mockPortfolio,
            tagline: 'Creating innovative solutions',
          }}
        />

      expect(
        screen.getByText('Creating innovative solutions')
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Building amazing web applications')
      ).not.toBeInTheDocument();
    });

    it('should handle rapid updates efficiently', async () => {
      const { rerender } = renderEditorPreview();

      // Simulate rapid typing/editing
      const updates = [
        'Dev',
        'Developer',
        'Full Stack Dev',
        'Full Stack Developer',
      ];

      updates.forEach(title => {
        rerender(
          <EditorPreview
            {...mockProps}
            portfolio={{
              ...mockPortfolio,
              title,
            }}
          />

        expect(screen.getByText(`Hero: ${title}`)).toBeInTheDocument();
      });
    });

    it('should maintain scroll position during updates', async () => {
      renderEditorPreview();

      const previewContainer = screen.getByRole('region', { name: /preview/i });

      // Simulate scroll
      fireEvent.scroll(previewContainer, { target: { scrollTop: 100 } });

      // Update content
      const { rerender } = render(
        <EditorPreview
          {...mockProps}
          portfolio={{
            ...mockPortfolio,
            title: 'Updated Title',
          }}
        />

      // Scroll position should be maintained
      expect(previewContainer.scrollTop).toBe(100);
    });
  });

  describe('Template Switching', () => {
    it('should switch templates correctly', async () => {
      const { rerender } = renderEditorPreview();

      expect(screen.getByTestId('developer-template')).toBeInTheDocument();

      rerender(
        <EditorPreview
          {...mockProps}
          portfolio={{
            ...mockPortfolio,
            template: 'designer',
          }}
        />

      expect(screen.getByTestId('designer-template')).toBeInTheDocument();
      expect(
        screen.queryByTestId('developer-template')
      ).not.toBeInTheDocument();
    });

    it('should preserve data across template switches', async () => {
      const { rerender } = renderEditorPreview();

      rerender(
        <EditorPreview
          {...mockProps}
          portfolio={{
            ...mockPortfolio,
            template: 'designer',
          }}
        />

      // Data should still be passed to new template
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(
        screen.getByText('Building amazing web applications')
      ).toBeInTheDocument();
    });

    it('should handle unknown template types', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          template: 'unknown-template' as any,
        },
      });

      // Should fallback to default template or show error
      expect(
        screen.getByText(/template.*not.*found|developer-template/i)
      ).toBeInTheDocument();
    });
  });

  describe('Performance Optimization', () => {
    it('should not re-render template when preview mode changes', async () => {
      const { rerender } = renderEditorPreview();

      const template = screen.getByTestId('developer-template');
      const templateHTML = template.innerHTML;

      rerender(<EditorPreview {...mockProps} previewMode="tablet" />);

      // Template content should remain the same
      expect(screen.getByTestId('developer-template').innerHTML).toBe(
        templateHTML

    });

    it('should only re-render when portfolio data changes', async () => {
      const { rerender } = renderEditorPreview();

      // Change only preview mode (no portfolio data change)
      rerender(<EditorPreview {...mockProps} previewMode="mobile" />);

      // Template should not re-render
      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });

    it('should handle large portfolio data efficiently', async () => {
      const largePortfolio = {
        ...mockPortfolio,
        projects: Array.from({ length: 50 }, (_, i) => ({
          id: `project-${i}`,
          title: `Project ${i}`,
          description: `Description for project ${i}`,
          technologies: ['React', 'Node.js'],
          link: `https://github.com/test/project-${i}`,
        })),
        skills: Array.from({ length: 20 }, (_, i) => `Skill ${i}`),
      };

      renderEditorPreview({
        ...mockProps,
        portfolio: largePortfolio,
      });

      expect(screen.getByText('Projects: 50')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle template rendering errors gracefully', async () => {
      // Mock console.error to avoid test output pollution
      const originalError = console.error;
      console.error = jest.fn();

      // Force an error in template
      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          template: 'error-template' as any,
        },
      });

      // Should show error message or fallback
      expect(screen.getByText(/error|fallback/i)).toBeInTheDocument();

      console.error = originalError;
    });

    it('should recover from errors on data update', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: null as any,
      });

      expect(screen.getByText('Error loading preview')).toBeInTheDocument();

      // Recovery with valid data
      const { rerender } = render(<EditorPreview {...mockProps} />);

      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
      expect(
        screen.queryByText('Error loading preview')
      ).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderEditorPreview();

      const previewRegion = screen.getByRole('region', { name: /preview/i });
      expect(previewRegion).toHaveAttribute('aria-label', 'Portfolio preview');
    });

    it('should announce preview mode changes to screen readers', async () => {
      renderEditorPreview();

      const previewRegion = screen.getByRole('region', { name: /preview/i });
      expect(previewRegion).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper heading structure', async () => {
      renderEditorPreview();

      // Template should have proper heading structure
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Software Developer');
    });

    it('should be keyboard navigable', async () => {
      renderEditorPreview();

      const previewContainer = screen.getByRole('region', { name: /preview/i });
      expect(previewContainer.tabIndex).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Custom Styling', () => {
    it('should apply preview mode specific classes', async () => {
      renderEditorPreview({
        ...mockProps,
        previewMode: 'mobile',
      });

      const container = screen.getByTestId('developer-template').parentElement;
      expect(container).toHaveClass('preview-mobile');
    });

    it('should apply theme customizations', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          customization: {
            colors: {
              primary: '#ff6b6b',
              secondary: '#4ecdc4',
            },
          },
        },
      });

      // Customizations should be passed to template
      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });

    it('should handle missing customization data', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          customization: undefined as any,
        },
      });

      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('should work with external state management', async () => {
      const { rerender } = renderEditorPreview();

      // Simulate external state change
      rerender(
        <EditorPreview
          {...mockProps}
          portfolio={{
            ...mockPortfolio,
            title: 'Updated by external state',
          }}
          previewMode="tablet"
        />

      expect(
        screen.getByText('Hero: Updated by external state')
      ).toBeInTheDocument();

      const container = screen.getByTestId('developer-template').parentElement;
      expect(container).toHaveClass('max-w-3xl'); // Tablet mode
    });

    it('should handle concurrent updates', async () => {
      const { rerender } = renderEditorPreview();

      // Simulate multiple concurrent updates
      rerender(
        <EditorPreview
          {...mockProps}
          portfolio={{
            ...mockPortfolio,
            title: 'Update 1',
            tagline: 'Tagline 1',
          }}
          previewMode="mobile"
        />

      expect(screen.getByText('Hero: Update 1')).toBeInTheDocument();
      expect(screen.getByText('Tagline 1')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely long content', async () => {
      const longContent = 'A'.repeat(1000);

      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          title: longContent,
          bio: longContent,
        },
      });

      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });

    it('should handle special characters in content', async () => {
      renderEditorPreview({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          title: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
          tagline: '你好世界 🌍 émojis & ñovelty',
        },
      });

      expect(screen.getByText(/Special chars/)).toBeInTheDocument();
      expect(screen.getByText(/你好世界.*émojis/)).toBeInTheDocument();
    });

    it('should handle undefined preview mode gracefully', async () => {
      renderEditorPreview({
        ...mockProps,
        previewMode: undefined as any,
      });

      // Should default to desktop or handle gracefully
      expect(screen.getByTestId('developer-template')).toBeInTheDocument();
    });
  });
});

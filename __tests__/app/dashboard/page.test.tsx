/**
 * Dashboard page test suite
 */

// Mock AuthContext - MUST be before any imports that use it
jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockRouter = {
  push: mockPush,
  replace: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  redirect: jest.fn(),
}));

// Mock Next.js Image component to avoid IntersectionObserver issues
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({
  __esModule: true,
  default: function Link({ children, href, ...props }: any) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  },
}));

// Mock BaseLayout - just render children without providers since they're mocked
jest.mock('@/components/layouts/BaseLayout', () => ({
  __esModule: true,
  default: function BaseLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="base-layout">{children}</div>;
  },
}));

// Import test dependencies after mocks
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import DashboardPage from '@/app/dashboard/page';

import { renderWithLanguage } from '../../utils/i18n-test-utils';
import { useAuth } from '@/lib/contexts/AuthContext';

// Get the mocked function
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Create test user
const mockUser = { id: 'user-1', email: 'test@example.com' };

// Default mock implementation
mockUseAuth.mockReturnValue({
  user: mockUser,
  loading: false,
  error: null,
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
});

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Dashboard Page', () => {
  const mockPortfolios = [
    {
      id: '1',
      name: 'My Portfolio',
      title: 'Developer',
      template: 'developer',
      status: 'published',
      subdomain: 'my-portfolio',
      views: 100,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'Creative Portfolio',
      title: 'Designer',
      template: 'creative',
      status: 'draft',
      subdomain: 'creative-portfolio',
      views: 50,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();

    // Clear localStorage to ensure consistent test environment
    localStorage.clear();

    // Default mock for successful portfolio fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPortfolios }),
    });

    // Reset auth context to default state
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
  });

  describe('Content Rendering', () => {
    test('renders dashboard header', async () => {
      renderWithLanguage(<DashboardPage />);

      // Check for user greeting with email
      const heading = await screen.findByText(/hello.*test/i);
      expect(heading).toBeInTheDocument();
    });

    test('displays user greeting', async () => {
      renderWithLanguage(<DashboardPage />);

      // Should show hello message with email prefix
      const greeting = await screen.findByText(/hello.*test/i);
      expect(greeting).toBeInTheDocument();
    });

    test('shows create portfolio button', async () => {
      renderWithLanguage(<DashboardPage />);

      const createButton = await screen.findByRole('link', {
        name: /create.*portfolio|crear.*portafolio/i,
      });
      expect(createButton).toBeInTheDocument();
      expect(createButton).toHaveAttribute('href', '/editor');
    });
  });

  describe('Portfolio List', () => {
    test('displays user portfolios', async () => {
      renderWithLanguage(<DashboardPage />);

      // Should show both portfolios
      expect(await screen.findByText('My Portfolio')).toBeInTheDocument();
      expect(await screen.findByText('Creative Portfolio')).toBeInTheDocument();
    });

    test('shows portfolio status', async () => {
      renderWithLanguage(<DashboardPage />);

      // Should indicate published status
      await waitFor(() => {
        const elements = screen.getAllByText(
          /published|publicado|draft|borrador/i
        );
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    test('displays portfolio titles', async () => {
      renderWithLanguage(<DashboardPage />);

      // Should show portfolio titles
      expect(await screen.findByText('Developer')).toBeInTheDocument();
      expect(await screen.findByText('Designer')).toBeInTheDocument();
    });

    test('shows edit and view buttons', async () => {
      renderWithLanguage(<DashboardPage />);

      // Wait for portfolios to load
      await screen.findByText('My Portfolio');

      // Should have edit links for each portfolio
      const editLinks = await screen.findAllByRole('link', {
        name: /edit portfolio/i,
      });

      expect(editLinks.length).toBe(2);
      expect(editLinks[0]).toHaveAttribute('href', '/editor?id=1');
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no portfolios', async () => {
      // Mock empty portfolio response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      renderWithLanguage(<DashboardPage />);

      // Should show empty state message
      const emptyMessage = await screen.findByText(
        /no portfolios yet|no tienes portafolios/i
      );
      expect(emptyMessage).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    test('handles portfolio deletion', async () => {
      const user = userEvent.setup();

      // Mock window.confirm
      window.confirm = jest.fn(() => true);

      // Mock successful delete response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPortfolios }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        });

      renderWithLanguage(<DashboardPage />);

      // Wait for portfolios to load
      await screen.findByText('My Portfolio');

      const deleteButtons = await screen.findAllByRole('button', {
        name: /delete portfolio/i,
      });

      // Click delete on first portfolio
      await user.click(deleteButtons[0]);

      expect(window.confirm).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/portfolios/1', {
        method: 'DELETE',
      });
    });
  });

  describe('Authentication', () => {
    test('redirects to login when not authenticated', async () => {
      // Mock no user
      mockUseAuth.mockReturnValue({
        user: null,
        loading: false,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      });

      renderWithLanguage(<DashboardPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth/signin');
      });
    });
  });

  describe('Loading State', () => {
    test('shows loading indicator initially', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        loading: true,
        error: null,
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
      });

      renderWithLanguage(<DashboardPage />);

      // Check for loading spinner
      const loading = screen.getByText(/loading.*dashboard|cargando/i);
      expect(loading).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error when portfolio fetch fails', async () => {
      // Mock failed fetch
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to fetch portfolios' }),
      });

      renderWithLanguage(<DashboardPage />);

      const errorMessage = await screen.findByText(
        /Failed to load portfolios/i
      );
      expect(errorMessage).toBeInTheDocument();

      // Should show Try Again button
      const retryButton = await screen.findByRole('button', {
        name: /try again/i,
      });
      expect(retryButton).toBeInTheDocument();
    });
  });
});

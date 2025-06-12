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
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
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
import { useAuth } from '@/lib/contexts/AuthContext';

import { renderWithLanguage } from '../../utils/i18n-test-utils';

// Get the mocked function
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Create test user with all required User type properties
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  accountType: 'customer' as const,
  status: 'active' as const,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  language: 'es' as const,
  featureFlags: {},
  customerProfile: {
    subscriptionPlan: 'free' as const,
    subscriptionStatus: 'active' as const,
    subscriptionStartDate: new Date('2025-01-01'),
    portfoliosCreated: 0,
    aiEnhancementsUsed: 1,
    monthlyPortfolioViews: 0,
    maxPortfolios: 1,
    maxAiEnhancements: 3,
    customDomainEnabled: false,
    analyticsEnabled: false,
    prioritySupport: false,
  },
};

// Default mock implementation
mockUseAuth.mockReturnValue({
  // Authentication state
  loading: false,
  user: mockUser,
  supabaseUser: null,
  session: null,

  // User type and permissions
  isAdmin: false,
  isInAdminMode: false,
  isImpersonating: false,
  permissions: [],
  subscriptionPlan: 'free',
  permissionLevel: 'Customer',

  // Authentication methods
  signIn: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  resetPassword: jest.fn(),

  // Admin functionality
  switchToAdminMode: jest.fn(),
  switchToUserMode: jest.fn(),
  impersonateUser: jest.fn(),
  stopImpersonation: jest.fn(),

  // Permission checking
  canAccess: jest.fn(() => false),
  canAccessFeature: jest.fn(() => false),
  hasReachedLimit: jest.fn(() => false),

  // Profile management
  updateProfile: jest.fn(),
  upgradeSubscription: jest.fn(),
  refreshUser: jest.fn(),

  // Subscription info
  isSubscriptionActive: true,
  daysUntilExpiration: null,
  usageStats: {
    portfoliosCreated: 0,
    aiEnhancementsUsed: 1,
    monthlyViews: 0,
  },
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
      json: () => Promise.resolve({ data: mockPortfolios }),
    });

    // Reset auth context to default state
    mockUseAuth.mockReturnValue({
      // Authentication state
      loading: false,
      user: mockUser,
      supabaseUser: null,
      session: null,

      // User type and permissions
      isAdmin: false,
      isInAdminMode: false,
      isImpersonating: false,
      permissions: [],
      subscriptionPlan: 'free',
      permissionLevel: 'Customer',

      // Authentication methods
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPassword: jest.fn(),

      // Admin functionality
      switchToAdminMode: jest.fn(),
      switchToUserMode: jest.fn(),
      impersonateUser: jest.fn(),
      stopImpersonation: jest.fn(),

      // Permission checking
      canAccess: jest.fn(() => false),
      canAccessFeature: jest.fn(() => false),
      hasReachedLimit: jest.fn(() => false),

      // Profile management
      updateProfile: jest.fn(),
      upgradeSubscription: jest.fn(),
      refreshUser: jest.fn(),

      // Subscription info
      isSubscriptionActive: true,
      daysUntilExpiration: null,
      usageStats: {
        portfoliosCreated: 0,
        aiEnhancementsUsed: 1,
        monthlyViews: 0,
      },
    });
  });

  describe('Content Rendering', () => {
    test('renders dashboard header', async () => {
      renderWithLanguage(<DashboardPage />);

      // Check for user greeting - dashboard shows "Hola, test!"
      const heading = await screen.findByText(/hola.*test/i);
      expect(heading).toBeInTheDocument();
    });

    test('displays user greeting', async () => {
      renderWithLanguage(<DashboardPage />);

      // Should show hello message with email prefix - "Hola, test!"
      const greeting = await screen.findByText(/hola.*test/i);
      expect(greeting).toBeInTheDocument();
    });

    test('shows create portfolio button', async () => {
      renderWithLanguage(<DashboardPage />);

      // Look for "Crear Nuevo Portafolio" button
      const createButton = await screen.findByText(/crear nuevo portafolio/i);
      expect(createButton).toBeInTheDocument();
      const createLink = createButton.closest('a');
      expect(createLink).not.toBeNull();
      expect(createLink!).toHaveAttribute('href', '/editor');
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

      // Should indicate portfolio status - "Publicado" or "Borrador"
      await waitFor(() => {
        const published = screen.getAllByText(/publicado/i);
        const draft = screen.getAllByText(/borrador/i);
        expect(published.length + draft.length).toBeGreaterThan(0);
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

      // Should have edit links for each portfolio (they use icon buttons)
      const editLinks = await screen.findAllByTitle('Edit portfolio');
      expect(editLinks).toHaveLength(2);
      expect(editLinks[0]).toHaveAttribute('href', '/editor?id=1');
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no portfolios', async () => {
      // Mock empty portfolio response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      renderWithLanguage(<DashboardPage />);

      // Should show empty state message - "Aún no tienes portafolios"
      const emptyMessage = await screen.findByText(
        /aún no tienes portafolios/i
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
          json: () => Promise.resolve({ data: mockPortfolios }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      renderWithLanguage(<DashboardPage />);

      // Wait for portfolios to load
      await screen.findByText('My Portfolio');

      // Find delete buttons by title attribute
      const deleteButtons = await screen.findAllByTitle('Delete portfolio');

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
        // Authentication state
        loading: false,
        user: null,
        supabaseUser: null,
        session: null,

        // User type and permissions
        isAdmin: false,
        isInAdminMode: false,
        isImpersonating: false,
        permissions: [],
        subscriptionPlan: undefined,
        permissionLevel: 'Unknown',

        // Authentication methods
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        resetPassword: jest.fn(),

        // Admin functionality
        switchToAdminMode: jest.fn(),
        switchToUserMode: jest.fn(),
        impersonateUser: jest.fn(),
        stopImpersonation: jest.fn(),

        // Permission checking
        canAccess: jest.fn(() => false),
        canAccessFeature: jest.fn(() => false),
        hasReachedLimit: jest.fn(() => true),

        // Profile management
        updateProfile: jest.fn(),
        upgradeSubscription: jest.fn(),
        refreshUser: jest.fn(),

        // Subscription info
        isSubscriptionActive: false,
        daysUntilExpiration: null,
        usageStats: {
          portfoliosCreated: 0,
          aiEnhancementsUsed: 0,
          monthlyViews: 0,
        },
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
        // Authentication state
        loading: true,
        user: null,
        supabaseUser: null,
        session: null,

        // User type and permissions
        isAdmin: false,
        isInAdminMode: false,
        isImpersonating: false,
        permissions: [],
        subscriptionPlan: undefined,
        permissionLevel: 'Unknown',

        // Authentication methods
        signIn: jest.fn(),
        signUp: jest.fn(),
        signOut: jest.fn(),
        resetPassword: jest.fn(),

        // Admin functionality
        switchToAdminMode: jest.fn(),
        switchToUserMode: jest.fn(),
        impersonateUser: jest.fn(),
        stopImpersonation: jest.fn(),

        // Permission checking
        canAccess: jest.fn(() => false),
        canAccessFeature: jest.fn(() => false),
        hasReachedLimit: jest.fn(() => true),

        // Profile management
        updateProfile: jest.fn(),
        upgradeSubscription: jest.fn(),
        refreshUser: jest.fn(),

        // Subscription info
        isSubscriptionActive: false,
        daysUntilExpiration: null,
        usageStats: {
          portfoliosCreated: 0,
          aiEnhancementsUsed: 0,
          monthlyViews: 0,
        },
      });

      renderWithLanguage(<DashboardPage />);

      // Check for loading text - "Cargando tu panel..."
      const loading = screen.getByText(/cargando tu panel/i);
      expect(loading).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error when portfolio fetch fails', async () => {
      // Mock failed fetch
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch portfolios' }),
      });

      renderWithLanguage(<DashboardPage />);

      // Error shows the actual error message
      const errorMessage = await screen.findByText(
        /Failed to load portfolios/i
      );
      expect(errorMessage).toBeInTheDocument();

      // Should show Try Again button
      const retryButton = await screen.findByText(/Try Again/i);
      expect(retryButton).toBeInTheDocument();
    });
  });
});

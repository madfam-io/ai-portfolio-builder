/**
 * Dashboard page test suite
 */

import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '@/app/dashboard/page';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  redirect: jest.fn(),
}));

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    signOut: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
  }),
};

jest.mock('@/lib/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock server functions
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => mockSupabase),
}));

// Mock BaseLayout
jest.mock('@/components/layouts/BaseLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Mock AuthContext
jest.mock('@/lib/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-1', email: 'test@example.com' },
    loading: false,
    error: null,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock portfolio service
jest.mock('@/lib/services/portfolioService', () => ({
  portfolioService: {
    getUserPortfolios: jest.fn().mockResolvedValue([
      {
        id: '1',
        userId: 'user-1',
        name: 'John Doe',
        title: 'Software Developer',
        bio: 'Experienced developer',
        contact: { email: 'john@example.com' },
        social: {},
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
        template: 'developer',
        customization: {},
        status: 'published',
        subdomain: 'johndoe',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]),
    deletePortfolio: jest.fn().mockResolvedValue(true),
  },
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear localStorage to ensure consistent test environment
    localStorage.clear();

    // Default to authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'Test User',
          },
        },
      },
      error: null,
    });

    // Default portfolio data
    mockSupabase.from().order.mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'My Portfolio',
          title: 'Developer',
          template: 'developer',
          published: true,
          subdomain: 'my-portfolio',
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Creative Portfolio',
          title: 'Designer',
          template: 'creative',
          published: false,
          subdomain: 'creative-portfolio',
          updated_at: new Date().toISOString(),
        },
      ],
      error: null,
    });
  });

  describe('Content Rendering', () => {
    test('renders dashboard header', async () => {
      renderWithLanguage(<DashboardPage />);

      // Check for dashboard title
      const heading = await screen.findByRole('heading', { level: 1 });
      expect(heading).toBeInTheDocument();
    });

    test('displays user greeting', async () => {
      renderWithLanguage(<DashboardPage />);

      // Should show welcome message
      const greeting = await screen.findByText(/welcome|bienvenido/i);
      expect(greeting).toBeInTheDocument();
    });

    test('shows create portfolio button', async () => {
      renderWithLanguage(<DashboardPage />);

      const createButton = await screen.findByRole('button', {
        name: /create|crear/i,
      });
      expect(createButton).toBeInTheDocument();
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
      const publishedBadge = await screen.findByText(/published|publicado/i);
      expect(publishedBadge).toBeInTheDocument();
    });

    test('displays portfolio templates', async () => {
      renderWithLanguage(<DashboardPage />);

      // Should show template types
      expect(await screen.findByText(/developer/i)).toBeInTheDocument();
      expect(await screen.findByText(/creative/i)).toBeInTheDocument();
    });

    test('shows edit and preview buttons', async () => {
      renderWithLanguage(<DashboardPage />);

      // Should have action buttons for each portfolio
      const editButtons = await screen.findAllByRole('button', {
        name: /edit|editar/i,
      });
      const previewButtons = await screen.findAllByRole('link', {
        name: /preview|vista previa/i,
      });

      expect(editButtons.length).toBeGreaterThanOrEqual(2);
      expect(previewButtons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Empty State', () => {
    test('shows empty state when no portfolios', async () => {
      mockSupabase.from().order.mockResolvedValue({
        data: [],
        error: null,
      });

      renderWithLanguage(<DashboardPage />);

      // Should show empty state message
      const emptyMessage = await screen.findByText(
        /no portfolios|sin portafolios/i
      );
      expect(emptyMessage).toBeInTheDocument();
    });
  });

  describe('User Interaction', () => {
    test('navigates to editor on create button click', async () => {
      const user = userEvent.setup();
      const mockPush = jest.fn();
      const useRouter = require('next/navigation').useRouter;
      useRouter.mockReturnValue({ push: mockPush });

      renderWithLanguage(<DashboardPage />);

      const createButton = await screen.findByRole('button', {
        name: /create|crear/i,
      });
      await user.click(createButton);

      expect(mockPush).toHaveBeenCalledWith('/editor');
    });

    test('handles portfolio deletion', async () => {
      const user = userEvent.setup();
      mockSupabase.from().delete = jest.fn().mockReturnThis();
      mockSupabase.from().eq = jest.fn().mockResolvedValue({ error: null });

      renderWithLanguage(<DashboardPage />);

      const deleteButtons = await screen.findAllByRole('button', {
        name: /delete|eliminar/i,
      });

      // Click delete on first portfolio
      if (deleteButtons[0]) await user.click(deleteButtons[0]);

      // Confirm deletion
      const confirmButton = await screen.findByRole('button', {
        name: /confirm|confirmar/i,
      });
      await user.click(confirmButton);

      expect(mockSupabase.from().delete).toHaveBeenCalled();
    });
  });

  describe('Authentication', () => {
    test('redirects to login when not authenticated', async () => {
      const redirect = require('next/navigation').redirect;

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      renderWithLanguage(<DashboardPage />);

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(redirect).toHaveBeenCalledWith('/auth/signin');
    });
  });

  describe('Loading State', () => {
    test('shows loading indicator initially', () => {
      renderWithLanguage(<DashboardPage />);

      const loading = screen.queryByRole('progressbar');
      expect(loading).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('displays error when portfolio fetch fails', async () => {
      mockSupabase.from().order.mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch portfolios' },
      });

      renderWithLanguage(<DashboardPage />);

      const errorMessage = await screen.findByText(/error|error/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });
});

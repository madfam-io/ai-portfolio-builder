import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

import EditorPage from '@/app/editor/page';

/**
 * Editor page test suite
 */

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(key => {
      if (key === 'template') return 'developer';
      if (key === 'id') return null;
      return null;
    }),
  }),
  redirect: jest.fn(),
}));

// Mock Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
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

// Mock editor components
jest.mock('@/components/editor/PortfolioEditor', () => ({
  __esModule: true,
  default: ({ onSave, onChange, portfolio }: unknown) => (
    <div data-testid="portfolio-editor">
      <button onClick={() => onSave(portfolio)}>Save</button>
      <button onClick={() => onChange({ ...portfolio, name: 'Updated' })}>
        Change
      </button>
    </div>
  ),
}));

jest.mock('@/components/editor/PortfolioPreview', () => ({
  __esModule: true,
  default: ({ portfolio }: unknown) => (
    <div data-testid="portfolio-preview">
      <h1>{portfolio?.name || 'Preview'}</h1>
    </div>
  ),
}));

describe('Editor Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default to authenticated user
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
      error: null,
    });

    // Default portfolio data for existing portfolio
    mockSupabase.from().single.mockResolvedValue({
      data: {
        id: 'portfolio-123',
        name: 'My Portfolio',
        title: 'Full Stack Developer',
        bio: 'Experienced developer',
        template: 'developer',
        published: false,
        subdomain: 'my-portfolio',
      },
      error: null,
    });
  });

  describe('Content Rendering', () => {
    test('renders editor layout', async () => {
      renderWithLanguage(<EditorPage />);

      // Should render both editor and preview
      expect(await screen.findByTestId('portfolio-editor')).toBeInTheDocument();
      expect(
        await screen.findByTestId('portfolio-preview')
      ).toBeInTheDocument();
    });

    test('shows editor toolbar', async () => {
      renderWithLanguage(<EditorPage />);

      // Should have save button and other controls
      const saveButton = await screen.findByRole('button', {
        name: /save|guardar/i,
      });
      expect(saveButton).toBeInTheDocument();
    });

    test('displays template selector for new portfolio', async () => {
      renderWithLanguage(<EditorPage />);

      // When creating new portfolio, should show template options
      const templateOptions = await screen.findAllByRole('button', {
        name: /template/i,
      });
      expect(templateOptions.length).toBeGreaterThan(0);
    });
  });

  describe('Portfolio Loading', () => {
    test('loads existing portfolio when id provided', async () => {
      const useSearchParams = require('next/navigation').useSearchParams;
      useSearchParams.mockReturnValue({
        get: jest.fn(key => {
          if (key === 'id') return 'portfolio-123';
          return null;
        }),
      });

      renderWithLanguage(<EditorPage />);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
        expect(mockSupabase.from().eq).toHaveBeenCalledWith(
          'id',
          'portfolio-123'
        );
      });

      // Should display loaded portfolio name
      expect(await screen.findByText('My Portfolio')).toBeInTheDocument();
    });

    test('creates new portfolio when no id provided', async () => {
      renderWithLanguage(<EditorPage />);

      // Should not try to load a portfolio
      await waitFor(() => {
        expect(mockSupabase.from().single).not.toHaveBeenCalled();
      });
    });
  });

  describe('Portfolio Saving', () => {
    test('saves portfolio changes', async () => {
      const user = userEvent.setup();

      mockSupabase.from().update.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue({
        data: { id: 'portfolio-123' },
        error: null,
      });

      renderWithLanguage(<EditorPage />);

      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      });
    });

    test('creates new portfolio on first save', async () => {
      const user = userEvent.setup();

      mockSupabase.from().insert.mockReturnThis();
      mockSupabase.from().single.mockResolvedValue({
        data: { id: 'new-portfolio-123' },
        error: null,
      });

      renderWithLanguage(<EditorPage />);

      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      });
    });

    test('shows success message after save', async () => {
      const user = userEvent.setup();

      mockSupabase.from().update.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue({
        data: { id: 'portfolio-123' },
        error: null,
      });

      renderWithLanguage(<EditorPage />);

      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      const successMessage = await screen.findByText(/saved|guardado/i);
      expect(successMessage).toBeInTheDocument();
    });
  });

  describe('Preview Mode', () => {
    test('updates preview in real-time', async () => {
      const user = userEvent.setup();

      renderWithLanguage(<EditorPage />);

      // Make a change in editor
      const changeButton = await screen.findByText('Change');
      await user.click(changeButton);

      // Preview should update
      await waitFor(() => {
        expect(screen.getByText('Updated')).toBeInTheDocument();
      });
    });

    test('toggles between mobile and desktop preview', async () => {
      const user = userEvent.setup();

      renderWithLanguage(<EditorPage />);

      // Find preview toggle buttons
      const mobileButton = await screen.findByRole('button', {
        name: /mobile/i,
      });
      await user.click(mobileButton);

      // Preview container should have mobile class/style
      const preview = screen.getByTestId('portfolio-preview');
      expect(preview).toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    test('redirects to login when not authenticated', async () => {
      const redirect = require('next/navigation').redirect;

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      renderWithLanguage(<EditorPage />);

      await waitFor(() => {
        expect(redirect).toHaveBeenCalledWith('/auth/signin');
      });
    });
  });

  describe('Auto-save', () => {
    test('auto-saves after changes', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      mockSupabase.from().update.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue({
        data: { id: 'portfolio-123' },
        error: null,
      });

      renderWithLanguage(<EditorPage />);

      // Make a change
      const changeButton = await screen.findByText('Change');
      await user.click(changeButton);

      // Fast-forward auto-save timer
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockSupabase.from).toHaveBeenCalledWith('portfolios');
      });

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    test('shows error message on save failure', async () => {
      const user = userEvent.setup();

      mockSupabase.from().update.mockReturnThis();
      mockSupabase.from().eq.mockResolvedValue({
        data: null,
        error: { message: 'Failed to save portfolio' },
      });

      renderWithLanguage(<EditorPage />);

      const saveButton = await screen.findByRole('button', { name: /save/i });
      await user.click(saveButton);

      const errorMessage = await screen.findByText(/error|error/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/lib/store/portfolio-store');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@/components/editor/EditorHeader', () => ({
  EditorHeader: () => <div data-testid="editor-header">Editor Header</div>,
}));
jest.mock('@/components/editor/EditorContent', () => ({
  EditorContent: () => <div data-testid="editor-content">Editor Content</div>,
}));

describe('EditorLayout', () => {
  const mockPortfolio = {
    id: '1',
    title: 'Test Portfolio',
    isPublished: false,
  };

  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: mockPortfolio,
      loading: false,
      error: null,
    });
  });

  it('renders editor header and content when portfolio is loaded', () => {
    render(<EditorLayout />);

    expect(screen.getByTestId('editor-header')).toBeInTheDocument();
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('shows loading state when portfolio is loading', () => {
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: null,
      loading: true,
      error: null,
    });

    render(<EditorLayout />);

    expect(screen.getByText('Loading portfolio...')).toBeInTheDocument();
    expect(screen.queryByTestId('editor-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('editor-content')).not.toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    const errorMessage = 'Failed to load portfolio';
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: null,
      loading: false,
      error: errorMessage,
    });

    render(<EditorLayout />);

    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.queryByTestId('editor-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('editor-content')).not.toBeInTheDocument();
  });

  it('redirects to dashboard when no portfolio and not loading', () => {
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: null,
      loading: false,
      error: null,
    });

    render(<EditorLayout />);

    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard');
  });

  it('renders with correct layout structure', () => {
    const { container } = render(<EditorLayout />);

    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveClass('flex', 'flex-col', 'h-screen');

    // Check for header at top
    const header = screen.getByTestId('editor-header').parentElement;
    expect(header).toHaveClass('border-b');

    // Check for content area
    const content = screen.getByTestId('editor-content').parentElement;
    expect(content).toHaveClass('flex-1', 'overflow-hidden');
  });

  it('handles different portfolio states correctly', () => {
    // Published portfolio
    const publishedPortfolio = {
      ...mockPortfolio,
      isPublished: true,
    };

    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: publishedPortfolio,
      loading: false,
      error: null,
    });

    const { rerender } = render(<EditorLayout />);
    expect(screen.getByTestId('editor-header')).toBeInTheDocument();

    // Unpublished portfolio
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: mockPortfolio,
      loading: false,
      error: null,
    });

    rerender(<EditorLayout />);
    expect(screen.getByTestId('editor-header')).toBeInTheDocument();
  });

  it('shows spinner animation in loading state', () => {
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: null,
      loading: true,
      error: null,
    });

    render(<EditorLayout />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('shows error alert with proper styling', () => {
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: null,
      loading: false,
      error: 'Network error',
    });

    render(<EditorLayout />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('border-red-500'); // Assuming destructive variant
  });
});
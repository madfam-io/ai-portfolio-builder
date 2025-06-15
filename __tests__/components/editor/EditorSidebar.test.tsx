import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorSidebar } from '@/components/editor/EditorSidebar';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useEditorStore } from '@/lib/store/editor-store';

jest.mock('@/lib/store/portfolio-store');
jest.mock('@/lib/store/editor-store');

describe('EditorSidebar', () => {
  const mockPortfolio = {
    id: 'portfolio-123',
    name: 'Test Portfolio',
    sections: {
      hero: { enabled: true, order: 1 },
      about: { enabled: true, order: 2 },
      experience: { enabled: true, order: 3 },
      projects: { enabled: false, order: 4 },
      skills: { enabled: true, order: 5 },
      contact: { enabled: true, order: 6 }
    }
  };

  const mockUsePortfolioStore = {
    portfolio: mockPortfolio,
    updateSection: jest.fn(),
    reorderSections: jest.fn()
  };

  const mockUseEditorStore = {
    activeSection: 'hero',
    setActiveSection: jest.fn(),
    isPreviewMode: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePortfolioStore as unknown as jest.Mock).mockReturnValue(mockUsePortfolioStore);
    (useEditorStore as unknown as jest.Mock).mockReturnValue(mockUseEditorStore);
  });

  it('should render all sections', () => {
    render(<EditorSidebar />);

    expect(screen.getByText('Hero')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Experience')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('should highlight active section', () => {
    render(<EditorSidebar />);

    const heroSection = screen.getByText('Hero').closest('div');
    expect(heroSection).toHaveClass('active');
  });

  it('should handle section click', () => {
    render(<EditorSidebar />);

    fireEvent.click(screen.getByText('Experience'));

    expect(mockUseEditorStore.setActiveSection).toHaveBeenCalledWith('experience');
  });

  it('should toggle section visibility', () => {
    render(<EditorSidebar />);

    const projectsToggle = screen.getByLabelText('Toggle Projects section');
    fireEvent.click(projectsToggle);

    expect(mockUsePortfolioStore.updateSection).toHaveBeenCalledWith('projects', {
      enabled: true
    });
  });

  it('should disable section editing in preview mode', () => {
    mockUseEditorStore.isPreviewMode = true;
    render(<EditorSidebar />);

    const toggles = screen.getAllByRole('switch');
    toggles.forEach(toggle => {
      expect(toggle).toBeDisabled();
    });
  });

  it('should show enabled state correctly', () => {
    render(<EditorSidebar />);

    const heroToggle = screen.getByLabelText('Toggle Hero section');
    const projectsToggle = screen.getByLabelText('Toggle Projects section');

    expect(heroToggle).toBeChecked();
    expect(projectsToggle).not.toBeChecked();
  });

  it('should handle drag and drop reordering', () => {
    render(<EditorSidebar />);

    // Simulate drag and drop
    const heroSection = screen.getByText('Hero').closest('[draggable]');
    const aboutSection = screen.getByText('About').closest('[draggable]');

    fireEvent.dragStart(heroSection!);
    fireEvent.dragEnter(aboutSection!);
    fireEvent.dragEnd(heroSection!);

    expect(mockUsePortfolioStore.reorderSections).toHaveBeenCalled();
  });

  it('should show section icons', () => {
    render(<EditorSidebar />);

    // Check for presence of icons (implementation dependent)
    expect(screen.getByText('Hero').parentElement).toContainHTML('svg');
  });

  it('should collapse/expand sidebar', () => {
    render(<EditorSidebar />);

    const collapseButton = screen.getByLabelText('Collapse sidebar');
    fireEvent.click(collapseButton);

    expect(screen.getByTestId('sidebar')).toHaveClass('collapsed');
  });

  it('should show section order numbers', () => {
    render(<EditorSidebar />);

    expect(screen.getByText('1')).toBeInTheDocument(); // Hero order
    expect(screen.getByText('2')).toBeInTheDocument(); // About order
  });

  it('should disable reordering for disabled sections', () => {
    render(<EditorSidebar />);

    const projectsSection = screen.getByText('Projects').closest('[draggable]');
    expect(projectsSection).toHaveAttribute('draggable', 'false');
  });

  it('should show tooltips on hover', async () => {
    render(<EditorSidebar />);

    const heroSection = screen.getByText('Hero');
    fireEvent.mouseEnter(heroSection);

    // Wait for tooltip
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Main introduction section');
  });
});
/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PortfolioEditor from '@/components/editor/PortfolioEditor';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDebounce } from '@/hooks/useDebounce';
import { useEditorHistory } from '@/hooks/useEditorHistory';
import { Portfolio, TemplateType } from '@/types/portfolio';


// Mock dependencies

// Mock useLanguage hook
jest.mock('@/lib/i18n/refactored-context', () => ({
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

jest.mock('@/hooks/useAutoSave');
jest.mock('@/hooks/useDebounce');
jest.mock('@/hooks/useEditorHistory');
jest.mock('@/lib/utils/logger');

// Mock child components
jest.mock('@/components/editor/EditorHeader', () => ({
  EditorHeader: ({ portfolio, onSave }: any) => (
    <div data-testid="editor-header">
      <button onClick={() => onSave(portfolio)}>Save</button>
    </div>
  ),
}));

jest.mock('@/components/editor/EditorSidebar', () => ({
  EditorSidebar: ({ portfolio, onUpdate, onSectionSelect }: any) => (
    <div data-testid="editor-sidebar">
      <button onClick={() => onUpdate({ name: 'Updated Name' })}>
        Update Name
      </button>
      <button onClick={() => onSectionSelect('projects')}>
        Select Projects
      </button>
    </div>
  ),
}));

jest.mock('@/components/editor/EditorToolbar', () => ({
  EditorToolbar: ({ onTemplateChange, onPreviewModeChange }: any) => (
    <div data-testid="editor-toolbar">
      <button onClick={() => onTemplateChange('modern')}>
        Change Template
      </button>
      <button onClick={() => onPreviewModeChange('tablet')}>Tablet View</button>
    </div>
  ),
}));

jest.mock('@/components/editor/PortfolioPreview', () => ({
  PortfolioPreview: ({ portfolio, previewMode }: any) => (
    <div data-testid="portfolio-preview">
      <div>Portfolio: {portfolio.name}</div>
      <div>Template: {portfolio.template}</div>
      <div>Preview Mode: {previewMode}</div>
    </div>
  ),
}));

describe('PortfolioEditor', () => {
  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'My Portfolio',
    title: 'Software Developer',
    bio: 'Experienced developer',
    contact: { email: 'test@example.com' },
    social: {},
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'developer' as TemplateType,
    customization: {},
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const defaultProps = {
    portfolioId: 'portfolio-123',
    userId: 'user-123',
    onSave: jest.fn(),
    onPublish: jest.fn(),
    onPreview: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock hooks
    (useAutoSave as jest.Mock).mockImplementation(({ data, onSave }) => ({
      isSaving: false,
      lastSaved: null,
      error: null,
    }));

    (useDebounce as jest.Mock).mockImplementation(value => value);

    (useEditorHistory as jest.Mock).mockReturnValue({
      canUndo: true,
      canRedo: true,
      undo: jest.fn(),
      redo: jest.fn(),
      addToHistory: jest.fn(),
    });

    // Mock fetch for loading portfolio
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: mockPortfolio }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render portfolio editor components', async () => {
    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-header')).toBeInTheDocument();
      expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('portfolio-preview')).toBeInTheDocument();
    });
  });

  it('should load portfolio on mount', async () => {
    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/v1/portfolios/${defaultProps.portfolioId}`,
        expect.any(Object)

    });

    expect(screen.getByText('Portfolio: My Portfolio')).toBeInTheDocument();
  });

  it('should handle portfolio loading error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to load'));

    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load portfolio/i)).toBeInTheDocument();
    });
  });

  it('should update portfolio when sidebar triggers update', async () => {
    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
    });

    const updateButton = screen.getByText('Update Name');
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(screen.getByText('Portfolio: Updated Name')).toBeInTheDocument();
    });
  });

  it('should change template when toolbar triggers change', async () => {
    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument();
    });

    expect(screen.getByText('Template: developer')).toBeInTheDocument();

    const templateButton = screen.getByText('Change Template');
    fireEvent.click(templateButton);

    await waitFor(() => {
      expect(screen.getByText('Template: modern')).toBeInTheDocument();
    });
  });

  it('should change preview mode', async () => {
    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument();
    });

    expect(screen.getByText('Preview Mode: desktop')).toBeInTheDocument();

    const previewButton = screen.getByText('Tablet View');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Preview Mode: tablet')).toBeInTheDocument();
    });
  });

  it('should handle save action', async () => {
    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-header')).toBeInTheDocument();
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ ...mockPortfolio, name: 'Saved Portfolio' }),
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/v1/portfolios/${defaultProps.portfolioId}`,
        expect.objectContaining({
          method: 'PUT',
        })
    });

    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  it('should handle save errors', async () => {
    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-header')).toBeInTheDocument();
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Save failed' }),
    });

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Failed to save portfolio/i)).toBeInTheDocument();
    });
  });

  it('should track edit state', async () => {
    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
    });

    // Initially not dirty
    expect(useAutoSave).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.any(Object),
      })

    // Make a change
    const updateButton = screen.getByText('Update Name');
    fireEvent.click(updateButton);

    // Should be marked as dirty
    await waitFor(() => {
      expect(useAutoSave).toHaveBeenLastCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Updated Name',
          }),
        })
    });
  });

  it('should handle section selection', async () => {
    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
    });

    const projectsButton = screen.getByText('Select Projects');
    fireEvent.click(projectsButton);

    // Should update active section (implementation would scroll to section)
    expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
  });

  it('should integrate with autosave hook', async () => {
    const mockAutoSave = {
      autoSave: jest.fn(),
      lastSaved: new Date(),
      error: null,
    };

    (useAutoSave as jest.Mock).mockReturnValue(mockAutoSave);

    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(useAutoSave).toHaveBeenCalledWith(
        defaultProps.portfolioId,
        expect.any(Object),
        expect.any(Boolean)

    });
  });

  it('should integrate with editor history', async () => {
    const mockHistory = {
      pushToHistory: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      canUndo: true,
      canRedo: false,
    };

    (useEditorHistory as jest.Mock).mockReturnValue(mockHistory);

    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
    });

    // Make a change
    const updateButton = screen.getByText('Update Name');
    fireEvent.click(updateButton);

    expect(mockHistory.pushToHistory).toHaveBeenCalled();
  });

  it('should handle keyboard shortcuts', async () => {
    const mockHistory = {
      pushToHistory: jest.fn(),
      undo: jest.fn(),
      redo: jest.fn(),
      canUndo: true,
      canRedo: true,
    };

    (useEditorHistory as jest.Mock).mockReturnValue(mockHistory);

    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
    });

    // Test Ctrl+Z (undo)
    fireEvent.keyDown(document, { key: 'z', ctrlKey: true });
    expect(mockHistory.undo).toHaveBeenCalled();

    // Test Ctrl+Y (redo)
    fireEvent.keyDown(document, { key: 'y', ctrlKey: true });
    expect(mockHistory.redo).toHaveBeenCalled();
  });

  it('should debounce rapid updates', async () => {
    let debouncedValue: any;
    (useDebounce as jest.Mock).mockImplementation(value => {
      debouncedValue = value;
      return value;
    });

    render(<PortfolioEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
    });

    // Make multiple rapid updates
    const updateButton = screen.getByText('Update Name');
    fireEvent.click(updateButton);
    fireEvent.click(updateButton);
    fireEvent.click(updateButton);

    expect(useDebounce).toHaveBeenCalled();
  });
});

import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { useUIStore } from '@/lib/store/ui-store';

// Mock the UI store
const mockUIStore = {
  theme: 'light' as const,
  setTheme: jest.fn(),
  isLoading: false,
  setLoading: jest.fn(),
  showToast: jest.fn(),
};

jest.mock('@/lib/store/ui-store', () => ({
  useUIStore: jest.fn(() => mockUIStore),
}));

// Mock portfolio data
const mockPortfolio = {
  id: 'test-portfolio',
  name: 'My Portfolio',
  template: 'developer',
  status: 'draft' as const,
  content: {},
  settings: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default props for EditorHeader
const mockProps = {
  portfolio: mockPortfolio,
  isDirty: false,
  isSaving: false,
  onSave: jest.fn(),
  onPublish: jest.fn(),
  onPreview: jest.fn(),
  canUndo: false,
  canRedo: false,
  onUndo: jest.fn(),
  onRedo: jest.fn(),
  lastSaved: undefined as Date | undefined,
};

describe('EditorHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  const renderEditorHeader = (props = {}) => {
    const finalProps = { ...mockProps, ...props };
    return render(<EditorHeader {...finalProps} />);
  };

  describe('Initial Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderEditorHeader();
      expect(container).toBeTruthy();
    });

    it('should render portfolio name', () => {
      renderEditorHeader();
      expect(screen.getByText('My Portfolio')).toBeInTheDocument();
    });

    it('should render all action buttons', () => {
      renderEditorHeader();

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Publish')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('Redo')).toBeInTheDocument();
    });

    it('should show clean state when not dirty', () => {
      renderEditorHeader();
      expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('should show last saved time when available', () => {
      const lastSaved = new Date('2025-01-15T10:30:00Z');
      renderEditorHeader({
        ...mockProps,
        lastSaved,
      });

      expect(screen.getByText('Last saved')).toBeInTheDocument();
    });

    it('should show template and status information', () => {
      renderEditorHeader();
      expect(screen.getByText('developer template')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      renderEditorHeader({
        ...mockProps,
        isDirty: true,
      });

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(mockProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('should show saving state', () => {
      renderEditorHeader({
        ...mockProps,
        isSaving: true,
      });

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeDisabled();
    });

    it('should show unsaved changes indicator when dirty', () => {
      renderEditorHeader({
        ...mockProps,
        isDirty: true,
      });

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('should disable save button when saving', () => {
      renderEditorHeader({
        ...mockProps,
        isSaving: true,
      });

      const saveButton = screen.getByText('Saving...');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when changes exist', () => {
      renderEditorHeader({
        ...mockProps,
        isDirty: true,
      });

      const saveButton = screen.getByText('Save');
      expect(saveButton).not.toBeDisabled();
    });

    it('should disable save button when no changes', () => {
      renderEditorHeader({
        ...mockProps,
        isDirty: false,
      });

      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
    });
  });

  describe('Publish Functionality', () => {
    it('should call onPublish when publish button is clicked', async () => {
      const user = userEvent.setup();
      renderEditorHeader();

      const publishButton = screen.getByText('Publish');
      await user.click(publishButton);

      expect(mockProps.onPublish).toHaveBeenCalledTimes(1);
    });

    it('should disable publish button when saving', () => {
      renderEditorHeader({
        ...mockProps,
        isSaving: true,
      });

      const publishButton = screen.getByText('Publish');
      expect(publishButton).toBeDisabled();
    });

    it('should show published status for published portfolios', () => {
      renderEditorHeader({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          status: 'published',
        },
      });

      expect(screen.getByText('Unpublish')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
    });
  });

  describe('Preview Functionality', () => {
    it('should call onPreview when preview button is clicked', async () => {
      const user = userEvent.setup();
      renderEditorHeader();

      const previewButton = screen.getByText('Preview');
      await user.click(previewButton);

      expect(mockProps.onPreview).toHaveBeenCalledTimes(1);
    });

    it('should be available even when saving', () => {
      renderEditorHeader({
        ...mockProps,
        isSaving: true,
      });

      const previewButton = screen.getByText('Preview');
      expect(previewButton).not.toBeDisabled();
    });
  });

  describe('Undo/Redo Functionality', () => {
    it('should call onUndo when undo button is clicked', async () => {
      const user = userEvent.setup();
      renderEditorHeader({
        ...mockProps,
        canUndo: true,
      });

      const undoButton = screen.getByText('Undo');
      await user.click(undoButton);

      expect(mockProps.onUndo).toHaveBeenCalledTimes(1);
    });

    it('should call onRedo when redo button is clicked', async () => {
      const user = userEvent.setup();
      renderEditorHeader({
        ...mockProps,
        canRedo: true,
      });

      const redoButton = screen.getByText('Redo');
      await user.click(redoButton);

      expect(mockProps.onRedo).toHaveBeenCalledTimes(1);
    });

    it('should disable undo button when canUndo is false', () => {
      renderEditorHeader({
        ...mockProps,
        canUndo: false,
      });

      const undoButton = screen.getByText('Undo');
      expect(undoButton).toBeDisabled();
    });

    it('should disable redo button when canRedo is false', () => {
      renderEditorHeader({
        ...mockProps,
        canRedo: false,
      });

      const redoButton = screen.getByText('Redo');
      expect(redoButton).toBeDisabled();
    });

    it('should enable undo button when canUndo is true', () => {
      renderEditorHeader({
        ...mockProps,
        canUndo: true,
      });

      const undoButton = screen.getByText('Undo');
      expect(undoButton).not.toBeDisabled();
    });

    it('should enable redo button when canRedo is true', () => {
      renderEditorHeader({
        ...mockProps,
        canRedo: true,
      });

      const redoButton = screen.getByText('Redo');
      expect(redoButton).not.toBeDisabled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should handle Ctrl+S for save', () => {
      renderEditorHeader({
        ...mockProps,
        isDirty: true,
      });

      fireEvent.keyDown(document, { key: 's', ctrlKey: true });

      expect(mockProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('should handle Ctrl+Z for undo', () => {
      renderEditorHeader({
        ...mockProps,
        canUndo: true,
      });

      fireEvent.keyDown(document, { key: 'z', ctrlKey: true });

      expect(mockProps.onUndo).toHaveBeenCalledTimes(1);
    });

    it('should handle Ctrl+Y for redo', () => {
      renderEditorHeader({
        ...mockProps,
        canRedo: true,
      });

      fireEvent.keyDown(document, { key: 'y', ctrlKey: true });

      expect(mockProps.onRedo).toHaveBeenCalledTimes(1);
    });

    it('should not trigger shortcuts when buttons are disabled', () => {
      renderEditorHeader({
        ...mockProps,
        canUndo: false,
        canRedo: false,
        isDirty: false,
      });

      fireEvent.keyDown(document, { key: 's', ctrlKey: true });
      fireEvent.keyDown(document, { key: 'z', ctrlKey: true });
      fireEvent.keyDown(document, { key: 'y', ctrlKey: true });

      expect(mockProps.onSave).not.toHaveBeenCalled();
      expect(mockProps.onUndo).not.toHaveBeenCalled();
      expect(mockProps.onRedo).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      renderEditorHeader();

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Publish' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Preview' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
    });

    it('should have proper aria labels for disabled buttons', () => {
      renderEditorHeader({
        ...mockProps,
        canUndo: false,
        canRedo: false,
      });

      const undoButton = screen.getByRole('button', { name: 'Undo' });
      const redoButton = screen.getByRole('button', { name: 'Redo' });

      expect(undoButton).toHaveAttribute('disabled');
      expect(redoButton).toHaveAttribute('disabled');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing portfolio gracefully', () => {
      renderEditorHeader({
        ...mockProps,
        portfolio: null,
      });

      // Should not crash and show fallback content
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should handle rapid button clicks', async () => {
      const user = userEvent.setup();
      renderEditorHeader({
        ...mockProps,
        isDirty: true,
      });

      const saveButton = screen.getByText('Save');

      // Rapid clicks
      await user.click(saveButton);
      await user.click(saveButton);
      await user.click(saveButton);

      // Should call once per click
      expect(mockProps.onSave).toHaveBeenCalledTimes(3);
    });
  });

  describe('Component Interface Validation', () => {
    it('should accept all required props', () => {
      expect(() => renderEditorHeader()).not.toThrow();
    });

    it('should handle optional lastSaved prop', () => {
      const lastSaved = new Date();
      expect(() =>
        renderEditorHeader({
          ...mockProps,
          lastSaved,
        })
      ).not.toThrow();
    });
  });
});
/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Portfolio } from '@/types/portfolio';

// Mock dependencies
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('EditorHeader', () => {
  const mockPortfolio: Portfolio = {
    id: 'portfolio-123',
    userId: 'user-123',
    name: 'My Portfolio',
    title: 'Software Developer',
    tagline: 'Building amazing applications',
    bio: 'Experienced developer',
    contact: { email: 'test@example.com' },
    social: {},
    experience: [],
    education: [],
    projects: [],
    skills: [],
    certifications: [],
    template: 'developer',
    customization: {},
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProps = {
    portfolio: mockPortfolio,
    isDirty: false,
    isSaving: false,
    lastSaved: null as Date | null,
    onSave: jest.fn(),
    onPublish: jest.fn(),
    onPreview: jest.fn(),
    canUndo: false,
    canRedo: false,
    onUndo: jest.fn(),
    onRedo: jest.fn(),
  };

  const mockTranslations = {
    save: 'Save',
    saving: 'Saving...',
    publish: 'Publish',
    preview: 'Preview',
    undo: 'Undo',
    redo: 'Redo',
    lastSaved: 'Last saved',
    never: 'Never',
    unsavedChanges: 'Unsaved changes',
    publishingPortfolio: 'Publishing Portfolio',
    previewPortfolio: 'Preview Portfolio',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      t: mockTranslations,
    } as any);
  });

  const renderEditorHeader = (props = mockProps) => {
    return render(<EditorHeader {...props} />);
  };

  describe('Initial Rendering', () => {
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
    });

    it('should show last saved time when available', () => {
      const lastSaved = new Date('2025-01-15T10:30:00Z');
      renderEditorHeader({
        ...mockProps,
        lastSaved,
      });

      expect(screen.getByText(/Last saved/)).toBeInTheDocument();
    });
  });

  describe('Save Functionality', () => {
    it('should call onSave when save button is clicked', async () => {
      const user = userEvent.setup();
      renderEditorHeader();

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

      expect(screen.getByText('Publish')).toBeInTheDocument();
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
    it('should handle Ctrl+S for save', async () => {
      renderEditorHeader({
        ...mockProps,
        isDirty: true,
      });

      fireEvent.keyDown(document, { key: 's', ctrlKey: true });

      expect(mockProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('should handle Ctrl+Z for undo', async () => {
      renderEditorHeader({
        ...mockProps,
        canUndo: true,
      });

      fireEvent.keyDown(document, { key: 'z', ctrlKey: true });

      expect(mockProps.onUndo).toHaveBeenCalledTimes(1);
    });

    it('should handle Ctrl+Y for redo', async () => {
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

  describe('Status Display', () => {
    it('should show last saved time in readable format', () => {
      const lastSaved = new Date('2025-01-15T10:30:00Z');
      renderEditorHeader({
        ...mockProps,
        lastSaved,
      });

      expect(screen.getByText(/Last saved/)).toBeInTheDocument();
    });

    it('should show "Never" when no last saved time', () => {
      renderEditorHeader({
        ...mockProps,
        lastSaved: null,
      });

      expect(screen.getByText('Never')).toBeInTheDocument();
    });

    it('should combine dirty state with saving state correctly', () => {
      renderEditorHeader({
        ...mockProps,
        isDirty: true,
        isSaving: true,
      });

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(screen.queryByText('Unsaved changes')).not.toBeInTheDocument();
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

    it('should be keyboard navigable', () => {
      renderEditorHeader();

      const buttons = screen.getAllByRole('button');

      // Focus first button
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);

      // Tab to next button
      fireEvent.keyDown(buttons[0], { key: 'Tab' });

      // Should be able to navigate between buttons
      expect(
        buttons.every(
          button => button.tabIndex >= 0 || button.hasAttribute('disabled')
        )
      ).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing portfolio gracefully', () => {
      renderEditorHeader({
        ...mockProps,
        portfolio: null as any,
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

      // Should only call once per click
      expect(mockProps.onSave).toHaveBeenCalledTimes(3);
    });

    it('should handle invalid last saved dates', () => {
      renderEditorHeader({
        ...mockProps,
        lastSaved: new Date('invalid-date'),
      });

      // Should fallback to "Never"
      expect(screen.getByText('Never')).toBeInTheDocument();
    });
  });

  describe('Internationalization', () => {
    it('should use translated text from language hook', () => {
      renderEditorHeader();

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Publish')).toBeInTheDocument();
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Undo')).toBeInTheDocument();
      expect(screen.getByText('Redo')).toBeInTheDocument();
    });

    it('should fallback gracefully when translations are missing', () => {
      mockUseLanguage.mockReturnValue({
        t: {},
      } as any);

      renderEditorHeader();

      // Should still render buttons with fallback text
      expect(screen.getAllByRole('button')).toHaveLength(5);
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = renderEditorHeader();

      // Same props should not cause re-render
      rerender(<EditorHeader {...mockProps} />);

      expect(screen.getByText('My Portfolio')).toBeInTheDocument();
    });

    it('should handle prop changes efficiently', () => {
      const { rerender } = renderEditorHeader();

      // Update only isDirty
      rerender(<EditorHeader {...mockProps} isDirty={true} />);

      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();

      // Update only isSaving
      rerender(<EditorHeader {...mockProps} isDirty={true} isSaving={true} />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });
});

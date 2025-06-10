import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorHeader } from '@/components/editor/EditorHeader';
import { Portfolio } from '@/types/portfolio';

const mockPortfolio: Portfolio = {
  id: 'test-portfolio-1',
  userId: 'user-1',
  name: 'Test Portfolio',
  title: 'Software Developer',
  bio: 'Test bio',
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

const defaultProps = {
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
};

describe('EditorHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Portfolio Information Display', () => {
    it('should display portfolio name', () => {
      render(<EditorHeader {...defaultProps} />);
      expect(screen.getByText('Test Portfolio')).toBeInTheDocument();
    });

    it('should display fallback for untitled portfolio', () => {
      const portfolioWithoutName = { ...mockPortfolio, name: '' };
      render(
        <EditorHeader {...defaultProps} portfolio={portfolioWithoutName} />
      );
      expect(screen.getByText('Untitled Portfolio')).toBeInTheDocument();
    });

    it('should display template name', () => {
      render(<EditorHeader {...defaultProps} />);
      expect(screen.getByText('Developer template')).toBeInTheDocument();
    });

    it('should display draft status', () => {
      render(<EditorHeader {...defaultProps} />);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should display published status', () => {
      const publishedPortfolio = { ...mockPortfolio, status: 'published' as const };
      render(
        <EditorHeader {...defaultProps} portfolio={publishedPortfolio} />
      );
      expect(screen.getByText('Published')).toBeInTheDocument();
    });
  });

  describe('Save Status Display', () => {
    it('should show saving state', () => {
      render(<EditorHeader {...defaultProps} isSaving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should show unsaved changes', () => {
      render(<EditorHeader {...defaultProps} isDirty={true} />);
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });

    it('should show last saved time', () => {
      const lastSaved = new Date();
      render(<EditorHeader {...defaultProps} lastSaved={lastSaved} />);
      expect(screen.getByText(/Saved/)).toBeInTheDocument();
    });

    it('should show "Never saved" when no lastSaved date', () => {
      render(<EditorHeader {...defaultProps} />);
      expect(screen.getByText('Never saved')).toBeInTheDocument();
    });

    it('should format recent save time correctly', () => {
      const recentTime = new Date(Date.now() - 30000); // 30 seconds ago
      render(<EditorHeader {...defaultProps} lastSaved={recentTime} />);
      expect(screen.getByText('Saved just now')).toBeInTheDocument();
    });

    it('should format older save time correctly', () => {
      const olderTime = new Date(Date.now() - 120000); // 2 minutes ago
      render(<EditorHeader {...defaultProps} lastSaved={olderTime} />);
      expect(screen.getByText('Saved 2 minutes ago')).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should render undo button', () => {
      render(<EditorHeader {...defaultProps} />);
      const undoButton = screen.getByTitle('Undo');
      expect(undoButton).toBeInTheDocument();
    });

    it('should render redo button', () => {
      render(<EditorHeader {...defaultProps} />);
      const redoButton = screen.getByTitle('Redo');
      expect(redoButton).toBeInTheDocument();
    });

    it('should enable undo button when canUndo is true', () => {
      render(<EditorHeader {...defaultProps} canUndo={true} />);
      const undoButton = screen.getByTitle('Undo');
      expect(undoButton).not.toBeDisabled();
    });

    it('should disable undo button when canUndo is false', () => {
      render(<EditorHeader {...defaultProps} canUndo={false} />);
      const undoButton = screen.getByTitle('Undo');
      expect(undoButton).toBeDisabled();
    });

    it('should enable redo button when canRedo is true', () => {
      render(<EditorHeader {...defaultProps} canRedo={true} />);
      const redoButton = screen.getByTitle('Redo');
      expect(redoButton).not.toBeDisabled();
    });

    it('should disable redo button when canRedo is false', () => {
      render(<EditorHeader {...defaultProps} canRedo={false} />);
      const redoButton = screen.getByTitle('Redo');
      expect(redoButton).toBeDisabled();
    });

    it('should render preview button', () => {
      render(<EditorHeader {...defaultProps} />);
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('should render save button', () => {
      render(<EditorHeader {...defaultProps} />);
      expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('should render publish button for draft', () => {
      render(<EditorHeader {...defaultProps} />);
      expect(screen.getByText('Publish')).toBeInTheDocument();
    });

    it('should render unpublish button for published portfolio', () => {
      const publishedPortfolio = { ...mockPortfolio, status: 'published' as const };
      render(
        <EditorHeader {...defaultProps} portfolio={publishedPortfolio} />
      );
      expect(screen.getByText('Unpublish')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onUndo when undo button is clicked', () => {
      const onUndo = jest.fn();
      render(<EditorHeader {...defaultProps} canUndo={true} onUndo={onUndo} />);
      
      const undoButton = screen.getByTitle('Undo');
      fireEvent.click(undoButton);
      
      expect(onUndo).toHaveBeenCalledTimes(1);
    });

    it('should call onRedo when redo button is clicked', () => {
      const onRedo = jest.fn();
      render(<EditorHeader {...defaultProps} canRedo={true} onRedo={onRedo} />);
      
      const redoButton = screen.getByTitle('Redo');
      fireEvent.click(redoButton);
      
      expect(onRedo).toHaveBeenCalledTimes(1);
    });

    it('should call onPreview when preview button is clicked', () => {
      const onPreview = jest.fn();
      render(<EditorHeader {...defaultProps} onPreview={onPreview} />);
      
      const previewButton = screen.getByText('Preview');
      fireEvent.click(previewButton);
      
      expect(onPreview).toHaveBeenCalledTimes(1);
    });

    it('should call onSave when save button is clicked', () => {
      const onSave = jest.fn();
      render(<EditorHeader {...defaultProps} isDirty={true} onSave={onSave} />);
      
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);
      
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    it('should call onPublish when publish button is clicked', () => {
      const onPublish = jest.fn();
      render(<EditorHeader {...defaultProps} onPublish={onPublish} />);
      
      const publishButton = screen.getByText('Publish');
      fireEvent.click(publishButton);
      
      expect(onPublish).toHaveBeenCalledTimes(1);
    });
  });

  describe('Button States', () => {
    it('should disable save button when not dirty', () => {
      render(<EditorHeader {...defaultProps} isDirty={false} />);
      const saveButton = screen.getByText('Save');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when dirty', () => {
      render(<EditorHeader {...defaultProps} isDirty={true} />);
      const saveButton = screen.getByText('Save');
      expect(saveButton).not.toBeDisabled();
    });

    it('should disable save button when saving', () => {
      render(<EditorHeader {...defaultProps} isSaving={true} isDirty={true} />);
      const saveButton = screen.getByText('Saving...');
      expect(saveButton).toBeDisabled();
    });

    it('should show saving state in button text', () => {
      render(<EditorHeader {...defaultProps} isSaving={true} />);
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('Visual Styling', () => {
    it('should apply published status styling', () => {
      const publishedPortfolio = { ...mockPortfolio, status: 'published' as const };
      render(
        <EditorHeader {...defaultProps} portfolio={publishedPortfolio} />
      );
      
      const statusBadge = screen.getByText('Published');
      expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
    });

    it('should apply draft status styling', () => {
      render(<EditorHeader {...defaultProps} />);
      
      const statusBadge = screen.getByText('Draft');
      expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should apply save button styling', () => {
      render(<EditorHeader {...defaultProps} isDirty={true} />);
      
      const saveButton = screen.getByText('Save');
      expect(saveButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should apply publish button styling', () => {
      render(<EditorHeader {...defaultProps} />);
      
      const publishButton = screen.getByText('Publish');
      expect(publishButton).toHaveClass('bg-green-600', 'text-white');
    });
  });
});
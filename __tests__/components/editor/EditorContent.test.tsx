import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditorContent } from '@/components/editor/EditorContent';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useLanguage } from '@/lib/i18n/refactored-context';

// Mock dependencies
jest.mock('@/lib/store/portfolio-store');
jest.mock('@/lib/i18n/refactored-context');
jest.mock('@/components/editor/EditorCanvas', () => ({
  EditorCanvas: () => <div data-testid="editor-canvas">Editor Canvas</div>,
}));
jest.mock('@/components/editor/EditorSidebar', () => ({
  EditorSidebar: () => <div data-testid="editor-sidebar">Editor Sidebar</div>,
}));
jest.mock('@/components/editor/PreviewControls', () => ({
  PreviewControls: ({ onDeviceChange, onTemplateChange }: any) => (
    <div data-testid="preview-controls">
      <button onClick={() => onDeviceChange('tablet')}>Tablet</button>
      <button onClick={() => onTemplateChange('designer')}>Designer</button>
    </div>
  ),
}));
jest.mock('@/components/editor/RealTimePreview', () => ({
  RealTimePreview: ({ device, template }: any) => (
    <div data-testid="real-time-preview">
      Preview - Device: {device}, Template: {template}
    </div>
  ),
}));

describe('EditorContent', () => {
  const mockPortfolio = {
    id: '1',
    template: 'developer',
    data: {},
  };

  const mockUpdatePortfolio = jest.fn();
  const mockT = {
    editor: 'Editor',
    preview: 'Preview',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: mockPortfolio,
      updatePortfolio: mockUpdatePortfolio,
    });
    (useLanguage as jest.Mock).mockReturnValue({
      t: mockT,
    });
  });

  it('renders editor and preview tabs', () => {
    render(<EditorContent />);

    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('shows editor content by default', () => {
    render(<EditorContent />);

    expect(screen.getByTestId('editor-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('editor-sidebar')).toBeInTheDocument();
    expect(screen.queryByTestId('real-time-preview')).not.toBeInTheDocument();
  });

  it('switches to preview tab when clicked', () => {
    render(<EditorContent />);

    const previewTab = screen.getByText('Preview');
    fireEvent.click(previewTab);

    expect(screen.queryByTestId('editor-canvas')).not.toBeInTheDocument();
    expect(screen.queryByTestId('editor-sidebar')).not.toBeInTheDocument();
    expect(screen.getByTestId('real-time-preview')).toBeInTheDocument();
    expect(screen.getByTestId('preview-controls')).toBeInTheDocument();
  });

  it('updates preview device when changed', () => {
    render(<EditorContent />);

    // Switch to preview tab
    fireEvent.click(screen.getByText('Preview'));

    // Initially shows desktop
    expect(screen.getByText('Preview - Device: desktop, Template: developer')).toBeInTheDocument();

    // Change to tablet
    fireEvent.click(screen.getByText('Tablet'));
    expect(screen.getByText('Preview - Device: tablet, Template: developer')).toBeInTheDocument();
  });

  it('updates portfolio template when changed', () => {
    render(<EditorContent />);

    // Switch to preview tab
    fireEvent.click(screen.getByText('Preview'));

    // Change template
    fireEvent.click(screen.getByText('Designer'));

    expect(mockUpdatePortfolio).toHaveBeenCalledWith('1', {
      template: 'designer',
    });
  });

  it('renders loading state when no portfolio', () => {
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: null,
      updatePortfolio: mockUpdatePortfolio,
    });

    render(<EditorContent />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('maintains tab state when switching', () => {
    render(<EditorContent />);

    // Switch to preview
    fireEvent.click(screen.getByText('Preview'));
    expect(screen.getByTestId('real-time-preview')).toBeInTheDocument();

    // Switch back to editor
    fireEvent.click(screen.getByText('Editor'));
    expect(screen.getByTestId('editor-canvas')).toBeInTheDocument();
  });

  it('renders with correct tab styling', () => {
    render(<EditorContent />);

    const editorTab = screen.getByText('Editor').closest('button');
    const previewTab = screen.getByText('Preview').closest('button');

    // Editor tab is active by default
    expect(editorTab).toHaveAttribute('data-state', 'active');
    expect(previewTab).toHaveAttribute('data-state', 'inactive');

    // Click preview tab
    fireEvent.click(screen.getByText('Preview'));

    // Preview tab is now active
    expect(editorTab).toHaveAttribute('data-state', 'inactive');
    expect(previewTab).toHaveAttribute('data-state', 'active');
  });
});
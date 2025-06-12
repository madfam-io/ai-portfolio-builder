/**
 * @fileoverview Tests for PreviewControls Component
 *
 * Tests the preview controls functionality including device mode switching,
 * zoom controls, fullscreen toggle, and responsiveness indicators.
 */

import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

import { PreviewControls } from '@/components/editor/PreviewControls';

describe('PreviewControls', () => {
  const mockOnPreviewModeChange = jest.fn() as jest.Mock;
  const mockOnZoomChange = jest.fn() as jest.Mock;
  const mockOnToggleFullscreen = jest.fn() as jest.Mock;
  const mockOnToggleSectionBorders = jest.fn() as jest.Mock;
  const mockOnToggleInteractiveElements = jest.fn() as jest.Mock;
  const mockOnRefresh = jest.fn() as jest.Mock;

  const defaultProps = {
    previewMode: 'desktop' as const,
    previewState: 'editing' as const,
    zoomLevel: 1,
    showSectionBorders: false,
    showInteractiveElements: true,
    onPreviewModeChange: mockOnPreviewModeChange,
    onToggleFullscreen: mockOnToggleFullscreen,
    onZoomChange: mockOnZoomChange,
    onToggleSectionBorders: mockOnToggleSectionBorders,
    onToggleInteractiveElements: mockOnToggleInteractiveElements,
    onRefresh: mockOnRefresh,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all device mode buttons', () => {
    render(<PreviewControls {...defaultProps} />);

    expect(screen.getByTitle('Desktop Preview')).toBeInTheDocument();
    expect(screen.getByTitle('Tablet Preview')).toBeInTheDocument();
    expect(screen.getByTitle('Mobile Preview')).toBeInTheDocument();
  });

  it('highlights the active mode button', () => {
    render(<PreviewControls {...defaultProps} />);

    const desktopButton = screen.getByTitle('Desktop Preview');
    expect(desktopButton).toHaveClass('bg-white', 'text-gray-900');

    const tabletButton = screen.getByTitle('Tablet Preview');
    expect(tabletButton).not.toHaveClass('bg-white');
  });

  it('calls onPreviewModeChange when switching device modes', () => {
    render(<PreviewControls {...defaultProps} />);

    const tabletButton = screen.getByTitle('Tablet Preview');
    fireEvent.click(tabletButton);

    expect(mockOnPreviewModeChange).toHaveBeenCalledWith('tablet');
  });

  it('displays current zoom level', () => {
    render(<PreviewControls {...defaultProps} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles zoom out', () => {
    render(<PreviewControls {...defaultProps} />);

    const zoomOutButton = screen.getByTitle('Zoom Out');
    fireEvent.click(zoomOutButton);

    expect(mockOnZoomChange).toHaveBeenCalledWith(0.9);
  });

  it('handles zoom in', () => {
    render(<PreviewControls {...defaultProps} />);

    const zoomInButton = screen.getByTitle('Zoom In');
    fireEvent.click(zoomInButton);

    expect(mockOnZoomChange).toHaveBeenCalledWith(1.1);
  });

  it('disables zoom out at minimum zoom', () => {
    render(<PreviewControls {...defaultProps} zoomLevel={0.25} />);

    const zoomOutButton = screen.getByTitle('Zoom Out');
    expect(zoomOutButton).toBeDisabled();
  });

  it('disables zoom in at maximum zoom', () => {
    render(<PreviewControls {...defaultProps} zoomLevel={2} />);

    const zoomInButton = screen.getByTitle('Zoom In');
    expect(zoomInButton).toBeDisabled();
  });

  it('resets zoom to 100%', () => {
    render(<PreviewControls {...defaultProps} zoomLevel={1.5} />);

    const resetButton = screen.getByTitle('Reset Zoom');
    fireEvent.click(resetButton);

    expect(mockOnZoomChange).toHaveBeenCalledWith(1);
  });

  it('toggles fullscreen mode', () => {
    render(<PreviewControls {...defaultProps} />);

    const fullscreenButton = screen.getByTitle('Enter Fullscreen');
    fireEvent.click(fullscreenButton);

    expect(mockOnToggleFullscreen).toHaveBeenCalled();
  });

  it('shows exit fullscreen button when in fullscreen', () => {
    render(<PreviewControls {...defaultProps} previewState="fullscreen" />);

    expect(screen.getByTitle('Exit Fullscreen')).toBeInTheDocument();
  });

  it('displays refresh button', () => {
    render(<PreviewControls {...defaultProps} />);

    const refreshButton = screen.getByTitle('Refresh Preview');
    expect(refreshButton).toBeInTheDocument();
  });

  it('shows section borders toggle', () => {
    render(<PreviewControls {...defaultProps} />);

    const bordersButton = screen.getByTitle('Toggle Section Borders');
    fireEvent.click(bordersButton);

    expect(mockOnToggleSectionBorders).toHaveBeenCalled();
  });

  it('shows interactive elements toggle', () => {
    render(<PreviewControls {...defaultProps} />);

    const interactiveButton = screen.getByTitle('Toggle Interactive Elements');
    fireEvent.click(interactiveButton);

    expect(mockOnToggleInteractiveElements).toHaveBeenCalled();
  });

  it('maintains button states across re-renders', () => {
    const { rerender } = render(<PreviewControls {...defaultProps} />);

    // Change props and verify states are maintained
    rerender(<PreviewControls {...defaultProps} zoomLevel={1.5} />);
    expect(screen.getByText('150%')).toBeInTheDocument();

    rerender(
      <PreviewControls {...defaultProps} previewMode="mobile" zoomLevel={1.5} />
    );
    const mobileButton = screen.getByTitle('Mobile Preview');
    expect(mobileButton).toHaveClass('bg-white', 'text-gray-900');
  });
});

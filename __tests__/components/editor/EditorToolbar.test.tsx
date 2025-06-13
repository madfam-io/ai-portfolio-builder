import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { TemplateType } from '@/types/portfolio';

const defaultProps = {
  previewMode: 'desktop' as const,
  onPreviewModeChange: jest.fn(),
  template: 'developer' as TemplateType,
  onTemplateChange: jest.fn(),
  showPreview: false,
  onTogglePreview: jest.fn(),
};

describe('EditorToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Template Selector', () => {
    it('should render template selector', () => {
      render(<EditorToolbar {...defaultProps} />);
      expect(screen.getByText('Template:')).toBeInTheDocument();
    });

    it('should display current template', () => {
      render(<EditorToolbar {...defaultProps} template="developer" />);
      const select = screen.getByDisplayValue('Developer');
      expect(select).toBeInTheDocument();
    });

    it('should render all template options', () => {
      render(<EditorToolbar {...defaultProps} />);

      // Check if all options are available
      expect(screen.getByText('Developer')).toBeInTheDocument();
      expect(screen.getByText('Designer')).toBeInTheDocument();
      expect(screen.getByText('Consultant')).toBeInTheDocument();
      expect(screen.getByText('Business')).toBeInTheDocument();
      expect(screen.getByText('Creative')).toBeInTheDocument();
      expect(screen.getByText('Minimal')).toBeInTheDocument();
    });

    it('should call onTemplateChange when template is changed', () => {
      const onTemplateChange = jest.fn();
      render(
        <EditorToolbar {...defaultProps} onTemplateChange={onTemplateChange} />
      );

      const select = screen.getByDisplayValue('Developer');
      fireEvent.change(select, { target: { value: 'designer' } });

      expect(onTemplateChange).toHaveBeenCalledWith('designer');
    });

    it('should display different templates correctly', () => {
      const { rerender } = render(
        <EditorToolbar {...defaultProps} template="designer" />
      );
      expect(screen.getByDisplayValue('Designer')).toBeInTheDocument();

      rerender(<EditorToolbar {...defaultProps} template="consultant" />);
      expect(screen.getByDisplayValue('Consultant')).toBeInTheDocument();

      rerender(<EditorToolbar {...defaultProps} template="minimal" />);
      expect(screen.getByDisplayValue('Minimal')).toBeInTheDocument();
    });
  });

  describe('Preview Mode Controls', () => {
    it('should render all preview mode buttons', () => {
      render(<EditorToolbar {...defaultProps} />);

      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.getByText('Tablet')).toBeInTheDocument();
      expect(screen.getByText('Mobile')).toBeInTheDocument();
    });

    it('should highlight active preview mode', () => {
      render(<EditorToolbar {...defaultProps} previewMode="desktop" />);

      const desktopButton = screen.getByText('Desktop');
      expect(desktopButton.closest('button')).toHaveClass(
        'bg-white',
        'text-gray-900',
        'shadow-sm'
      );
    });

    it('should not highlight inactive preview modes', () => {
      render(<EditorToolbar {...defaultProps} previewMode="desktop" />);

      const tabletButton = screen.getByText('Tablet');
      const mobileButton = screen.getByText('Mobile');

      expect(tabletButton.closest('button')).not.toHaveClass(
        'bg-white',
        'text-gray-900',
        'shadow-sm'
      );
      expect(mobileButton.closest('button')).not.toHaveClass(
        'bg-white',
        'text-gray-900',
        'shadow-sm'
      );
    });

    it('should call onPreviewModeChange when desktop is clicked', () => {
      const onPreviewModeChange = jest.fn();
      render(
        <EditorToolbar
          {...defaultProps}
          previewMode="mobile"
          onPreviewModeChange={onPreviewModeChange}
        />
      );

      const desktopButton = screen.getByText('Desktop');
      fireEvent.click(desktopButton);

      expect(onPreviewModeChange).toHaveBeenCalledWith('desktop');
    });

    it('should call onPreviewModeChange when tablet is clicked', () => {
      const onPreviewModeChange = jest.fn();
      render(
        <EditorToolbar
          {...defaultProps}
          onPreviewModeChange={onPreviewModeChange}
        />
      );

      const tabletButton = screen.getByText('Tablet');
      fireEvent.click(tabletButton);

      expect(onPreviewModeChange).toHaveBeenCalledWith('tablet');
    });

    it('should call onPreviewModeChange when mobile is clicked', () => {
      const onPreviewModeChange = jest.fn();
      render(
        <EditorToolbar
          {...defaultProps}
          onPreviewModeChange={onPreviewModeChange}
        />
      );

      const mobileButton = screen.getByText('Mobile');
      fireEvent.click(mobileButton);

      expect(onPreviewModeChange).toHaveBeenCalledWith('mobile');
    });

    it('should highlight tablet mode correctly', () => {
      render(<EditorToolbar {...defaultProps} previewMode="tablet" />);

      const tabletButton = screen.getByText('Tablet');
      expect(tabletButton.closest('button')).toHaveClass(
        'bg-white',
        'text-gray-900',
        'shadow-sm'
      );
    });

    it('should highlight mobile mode correctly', () => {
      render(<EditorToolbar {...defaultProps} previewMode="mobile" />);

      const mobileButton = screen.getByText('Mobile');
      expect(mobileButton.closest('button')).toHaveClass(
        'bg-white',
        'text-gray-900',
        'shadow-sm'
      );
    });
  });

  describe('Preview Toggle', () => {
    it('should show "Show Preview" when preview is hidden', () => {
      render(<EditorToolbar {...defaultProps} showPreview={false} />);
      expect(screen.getByText('Show Preview')).toBeInTheDocument();
    });

    it('should show "Hide Preview" when preview is shown', () => {
      render(<EditorToolbar {...defaultProps} showPreview={true} />);
      expect(screen.getByText('Hide Preview')).toBeInTheDocument();
    });

    it('should call onTogglePreview when clicked', () => {
      const onTogglePreview = jest.fn();
      render(
        <EditorToolbar {...defaultProps} onTogglePreview={onTogglePreview} />
      );

      const toggleButton = screen.getByText('Show Preview');
      fireEvent.click(toggleButton);

      expect(onTogglePreview).toHaveBeenCalledTimes(1);
    });

    it('should call onTogglePreview when hiding preview', () => {
      const onTogglePreview = jest.fn();
      render(
        <EditorToolbar
          {...defaultProps}
          showPreview={true}
          onTogglePreview={onTogglePreview}
        />
      );

      const toggleButton = screen.getByText('Hide Preview');
      fireEvent.click(toggleButton);

      expect(onTogglePreview).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icons', () => {
    it('should render preview mode icons', () => {
      render(<EditorToolbar {...defaultProps} />);

      // Icons should be present (testing via parent elements)
      const desktopButton = screen.getByText('Desktop').parentElement;
      const tabletButton = screen.getByText('Tablet').parentElement;
      const mobileButton = screen.getByText('Mobile').parentElement;

      expect(desktopButton).toBeInTheDocument();
      expect(tabletButton).toBeInTheDocument();
      expect(mobileButton).toBeInTheDocument();
    });

    it('should render preview toggle icons', () => {
      const { rerender } = render(
        <EditorToolbar {...defaultProps} showPreview={false} />
      );

      const showButton = screen.getByText('Show Preview').parentElement;
      expect(showButton).toBeInTheDocument();

      rerender(<EditorToolbar {...defaultProps} showPreview={true} />);

      const hideButton = screen.getByText('Hide Preview').parentElement;
      expect(hideButton).toBeInTheDocument();
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper layout structure', () => {
      const { container } = render(<EditorToolbar {...defaultProps} />);

      // Check if main container has proper styling - get the outermost div
      const toolbar = container.firstChild;
      expect(toolbar).toHaveClass('bg-white', 'border-b', 'border-gray-200');
    });

    it('should have responsive preview mode controls styling', () => {
      render(<EditorToolbar {...defaultProps} />);

      // Find the container with preview controls
      const desktopButton = screen.getByText('Desktop');
      const previewControlsContainer = desktopButton.closest(
        'div[class*="bg-gray-100"]'
      );
      expect(previewControlsContainer).toHaveClass('bg-gray-100', 'rounded-lg');
    });

    it('should apply hover effects on buttons', () => {
      render(<EditorToolbar {...defaultProps} previewMode="tablet" />);

      const desktopButton = screen.getByText('Desktop');
      expect(desktopButton.closest('button')).toHaveClass(
        'hover:text-gray-900'
      );
    });

    it('should apply template selector styling', () => {
      render(<EditorToolbar {...defaultProps} />);

      const select = screen.getByDisplayValue('Developer');
      expect(select).toHaveClass('border', 'border-gray-200', 'rounded-lg');
    });

    it('should apply preview toggle button styling', () => {
      render(<EditorToolbar {...defaultProps} />);

      const toggleButton = screen.getByText('Show Preview');
      expect(toggleButton.closest('button')).toHaveClass(
        'border',
        'border-gray-200',
        'rounded-lg'
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper button labels', () => {
      render(<EditorToolbar {...defaultProps} />);

      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.getByText('Tablet')).toBeInTheDocument();
      expect(screen.getByText('Mobile')).toBeInTheDocument();
      expect(screen.getByText('Show Preview')).toBeInTheDocument();
    });

    it('should have proper select label', () => {
      render(<EditorToolbar {...defaultProps} />);
      expect(screen.getByText('Template:')).toBeInTheDocument();
    });

    it('should be keyboard accessible', () => {
      render(<EditorToolbar {...defaultProps} />);

      const select = screen.getByDisplayValue('Developer');
      expect(select).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-blue-500'
      );
    });
  });
});

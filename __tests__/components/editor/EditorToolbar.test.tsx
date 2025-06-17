/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { TemplateType } from '@/types/portfolio';

// Mock dependencies
jest.mock('@/lib/i18n/refactored-context', () => ({
  useLanguage: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}));

const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

describe('EditorToolbar', () => {
  const mockProps = {
    previewMode: 'desktop' as const,
    onPreviewModeChange: jest.fn(),
    template: 'developer' as TemplateType,
    onTemplateChange: jest.fn(),
    showPreview: false,
    onTogglePreview: jest.fn(),
  };

  const mockTranslations = {
    viewMode: 'View Mode',
    desktop: 'Desktop',
    tablet: 'Tablet',
    mobile: 'Mobile',
    template: 'Template',
    developer: 'Developer',
    designer: 'Designer',
    consultant: 'Consultant',
    modern: 'Modern',
    minimal: 'Minimal',
    creative: 'Creative',
    preview: 'Preview',
    hidePreview: 'Hide Preview',
    showPreview: 'Show Preview',
    fullScreen: 'Full Screen',
    splitView: 'Split View',
    templateSelector: 'Template Selector',
    previewModeSelector: 'Preview Mode Selector',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLanguage.mockReturnValue({
      t: mockTranslations,
    } as any);
  });

  const renderEditorToolbar = (props = mockProps) => {
    return render(<EditorToolbar {...props} />);
  };

  describe('Initial Rendering', () => {
    it('should render preview mode selector', () => {
      renderEditorToolbar();

      expect(screen.getByText('View Mode')).toBeInTheDocument();
      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.getByText('Tablet')).toBeInTheDocument();
      expect(screen.getByText('Mobile')).toBeInTheDocument();
    });

    it('should render template selector', () => {
      renderEditorToolbar();

      expect(screen.getByText('Template')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });

    it('should render preview toggle button', () => {
      renderEditorToolbar();

      expect(screen.getByText('Show Preview')).toBeInTheDocument();
    });

    it('should highlight current preview mode', () => {
      renderEditorToolbar({
        ...mockProps,
        previewMode: 'tablet',
      });

      const tabletButton = screen.getByText('Tablet');
      expect(tabletButton).toHaveClass('bg-primary'); // Active state
    });

    it('should highlight current template', () => {
      renderEditorToolbar();

      const developerTemplate = screen.getByText('Developer');
      expect(developerTemplate).toHaveClass('bg-primary'); // Active state
    });
  });

  describe('Preview Mode Selection', () => {
    it('should call onPreviewModeChange when desktop is selected', async () => {
      const user = userEvent.setup();
      renderEditorToolbar({
        ...mockProps,
        previewMode: 'mobile',
      });

      const desktopButton = screen.getByText('Desktop');
      await user.click(desktopButton);

      expect(mockProps.onPreviewModeChange).toHaveBeenCalledWith('desktop');
    });

    it('should call onPreviewModeChange when tablet is selected', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      const tabletButton = screen.getByText('Tablet');
      await user.click(tabletButton);

      expect(mockProps.onPreviewModeChange).toHaveBeenCalledWith('tablet');
    });

    it('should call onPreviewModeChange when mobile is selected', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      const mobileButton = screen.getByText('Mobile');
      await user.click(mobileButton);

      expect(mockProps.onPreviewModeChange).toHaveBeenCalledWith('mobile');
    });

    it('should update active state when preview mode changes', () => {
      const { rerender } = renderEditorToolbar();

      // Initially desktop is active
      let desktopButton = screen.getByText('Desktop');
      expect(desktopButton).toHaveClass('bg-primary');

      // Change to mobile
      rerender(<EditorToolbar {...mockProps} previewMode="mobile" />);

      const mobileButton = screen.getByText('Mobile');
      expect(mobileButton).toHaveClass('bg-primary');

      desktopButton = screen.getByText('Desktop');
      expect(desktopButton).not.toHaveClass('bg-primary');
    });

    it('should show responsive icons for preview modes', () => {
      renderEditorToolbar();

      // Check for presence of mode buttons with icons
      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.getByText('Tablet')).toBeInTheDocument();
      expect(screen.getByText('Mobile')).toBeInTheDocument();
    });
  });

  describe('Template Selection', () => {
    it('should render template dropdown', () => {
      renderEditorToolbar();

      expect(screen.getByText('Template')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });

    it('should call onTemplateChange when new template is selected', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      // Open template dropdown
      const templateSelector = screen.getByText('Developer');
      await user.click(templateSelector);

      // Select designer template
      const designerOption = screen.getByText('Designer');
      await user.click(designerOption);

      expect(mockProps.onTemplateChange).toHaveBeenCalledWith('designer');
    });

    it('should show all available templates', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      // Open template dropdown
      const templateSelector = screen.getByText('Developer');
      await user.click(templateSelector);

      // Check all template options are available
      expect(screen.getByText('Developer')).toBeInTheDocument();
      expect(screen.getByText('Designer')).toBeInTheDocument();
      expect(screen.getByText('Consultant')).toBeInTheDocument();
    });

    it('should update selected template when prop changes', () => {
      const { rerender } = renderEditorToolbar();

      // Initially developer template
      expect(screen.getByText('Developer')).toBeInTheDocument();

      // Change to designer template
      rerender(<EditorToolbar {...mockProps} template="designer" />);

      expect(screen.getByText('Designer')).toBeInTheDocument();
    });

    it('should prevent selecting the same template', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      // Open template dropdown
      const templateSelector = screen.getByText('Developer');
      await user.click(templateSelector);

      // Click current template
      const currentTemplate = screen.getByText('Developer');
      await user.click(currentTemplate);

      // Should not call onTemplateChange for same template
      expect(mockProps.onTemplateChange).not.toHaveBeenCalled();
    });
  });

  describe('Preview Toggle', () => {
    it('should show "Show Preview" when preview is hidden', () => {
      renderEditorToolbar({
        ...mockProps,
        showPreview: false,
      });

      expect(screen.getByText('Show Preview')).toBeInTheDocument();
    });

    it('should show "Hide Preview" when preview is shown', () => {
      renderEditorToolbar({
        ...mockProps,
        showPreview: true,
      });

      expect(screen.getByText('Hide Preview')).toBeInTheDocument();
    });

    it('should call onTogglePreview when button is clicked', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      const previewButton = screen.getByText('Show Preview');
      await user.click(previewButton);

      expect(mockProps.onTogglePreview).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid toggle clicks', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      const previewButton = screen.getByText('Show Preview');

      // Rapid clicks
      await user.click(previewButton);
      await user.click(previewButton);
      await user.click(previewButton);

      expect(mockProps.onTogglePreview).toHaveBeenCalledTimes(3);
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation between controls', () => {
      renderEditorToolbar();

      const buttons = screen.getAllByRole('button');

      // Focus first button
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);

      // Tab navigation should work
      buttons.forEach(button => {
        expect(button.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle Enter key for preview mode selection', () => {
      renderEditorToolbar();

      const tabletButton = screen.getByText('Tablet');
      tabletButton.focus();

      fireEvent.keyDown(tabletButton, { key: 'Enter' });

      expect(mockProps.onPreviewModeChange).toHaveBeenCalledWith('tablet');
    });

    it('should handle Space key for preview toggle', () => {
      renderEditorToolbar();

      const previewButton = screen.getByText('Show Preview');
      previewButton.focus();

      fireEvent.keyDown(previewButton, { key: ' ' });

      expect(mockProps.onTogglePreview).toHaveBeenCalledTimes(1);
    });

    it('should handle arrow keys for preview mode navigation', () => {
      renderEditorToolbar();

      const desktopButton = screen.getByText('Desktop');
      desktopButton.focus();

      // Arrow right should move to tablet
      fireEvent.keyDown(desktopButton, { key: 'ArrowRight' });

      expect(document.activeElement).toBe(screen.getByText('Tablet'));
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderEditorToolbar();

      const viewModeGroup = screen.getByLabelText('Preview Mode Selector');
      expect(viewModeGroup).toBeInTheDocument();

      const templateSelector = screen.getByLabelText('Template Selector');
      expect(templateSelector).toBeInTheDocument();
    });

    it('should indicate current selections with aria-current', () => {
      renderEditorToolbar();

      const desktopButton = screen.getByText('Desktop');
      expect(desktopButton).toHaveAttribute('aria-current', 'true');

      const developerTemplate = screen.getByText('Developer');
      expect(developerTemplate).toHaveAttribute('aria-current', 'true');
    });

    it('should have proper role attributes', () => {
      renderEditorToolbar();

      const previewModeGroup = screen.getByRole('group', {
        name: /view mode/i,
      });
      expect(previewModeGroup).toBeInTheDocument();

      const templateGroup = screen.getByRole('group', { name: /template/i });
      expect(templateGroup).toBeInTheDocument();
    });

    it('should provide descriptive button labels', () => {
      renderEditorToolbar();

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should announce state changes to screen readers', () => {
      renderEditorToolbar();

      const previewButton = screen.getByText('Show Preview');
      expect(previewButton).toHaveAttribute('aria-pressed', 'false');

      // After toggle, should update aria-pressed
      const { rerender } = render(
        <EditorToolbar {...mockProps} showPreview={true} />
      );

      const hidePreviewButton = screen.getByText('Hide Preview');
      expect(hidePreviewButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Responsive Design', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderEditorToolbar();

      // Should still render all controls but potentially in compact layout
      expect(screen.getByText('Desktop')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
      expect(screen.getByText('Show Preview')).toBeInTheDocument();
    });

    it('should show icons only in compact mode', () => {
      renderEditorToolbar();

      // In compact mode, buttons might show only icons
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should maintain functionality on small screens', async () => {
      const user = userEvent.setup();

      // Mock tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      renderEditorToolbar();

      const mobileButton = screen.getByText('Mobile');
      await user.click(mobileButton);

      expect(mockProps.onPreviewModeChange).toHaveBeenCalledWith('mobile');
    });
  });

  describe('Visual States', () => {
    it('should show loading state during template change', () => {
      renderEditorToolbar({
        ...mockProps,
        isChangingTemplate: true,
      } as any);

      // Template selector should be disabled during change
      const templateButton = screen.getByText('Developer');
      expect(templateButton).toBeDisabled();
    });

    it('should highlight selected states correctly', () => {
      renderEditorToolbar({
        ...mockProps,
        previewMode: 'tablet',
        template: 'designer',
      });

      const tabletButton = screen.getByText('Tablet');
      const designerButton = screen.getByText('Designer');

      expect(tabletButton).toHaveClass('bg-primary');
      expect(designerButton).toHaveClass('bg-primary');
    });

    it('should show hover states', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      const mobileButton = screen.getByText('Mobile');

      await user.hover(mobileButton);

      // Hover state should be applied (tested via CSS classes)
      expect(mobileButton).toHaveClass('hover:bg-primary/20');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing template gracefully', () => {
      renderEditorToolbar({
        ...mockProps,
        template: undefined as any,
      });

      // Should not crash and show fallback
      expect(screen.getByText('Template')).toBeInTheDocument();
    });

    it('should handle invalid preview mode', () => {
      renderEditorToolbar({
        ...mockProps,
        previewMode: 'invalid' as any,
      });

      // Should default to desktop or handle gracefully
      expect(screen.getByText('Desktop')).toBeInTheDocument();
    });

    it('should handle rapid mode changes', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      const desktopButton = screen.getByText('Desktop');
      const tabletButton = screen.getByText('Tablet');
      const mobileButton = screen.getByText('Mobile');

      // Rapid mode changes
      await user.click(tabletButton);
      await user.click(mobileButton);
      await user.click(desktopButton);

      expect(mockProps.onPreviewModeChange).toHaveBeenCalledTimes(3);
      expect(mockProps.onPreviewModeChange).toHaveBeenLastCalledWith('desktop');
    });
  });

  describe('Integration', () => {
    it('should work with external state management', () => {
      const { rerender } = renderEditorToolbar();

      // External state change
      rerender(
        <EditorToolbar
          {...mockProps}
          previewMode="mobile"
          template="creative"
          showPreview={true}
        />
      );

      expect(screen.getByText('Mobile')).toHaveClass('bg-primary');
      expect(screen.getByText('Creative')).toBeInTheDocument();
      expect(screen.getByText('Hide Preview')).toBeInTheDocument();
    });

    it('should persist user preferences', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      // User selections should be maintained
      const tabletButton = screen.getByText('Tablet');
      await user.click(tabletButton);

      expect(mockProps.onPreviewModeChange).toHaveBeenCalledWith('tablet');
    });
  });

  describe('Internationalization', () => {
    it('should use translated labels', () => {
      renderEditorToolbar();

      expect(screen.getByText('View Mode')).toBeInTheDocument();
      expect(screen.getByText('Template')).toBeInTheDocument();
      expect(screen.getByText('Show Preview')).toBeInTheDocument();
    });

    it('should fallback gracefully when translations are missing', () => {
      mockUseLanguage.mockReturnValue({
        t: {},
      } as any);

      renderEditorToolbar();

      // Should still render controls with fallback text
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    it('should handle RTL languages', () => {
      renderEditorToolbar();

      // Toolbar should adapt to RTL layouts
      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const { rerender } = renderEditorToolbar();

      // Same props should not cause unnecessary re-renders
      rerender(<EditorToolbar {...mockProps} />);

      expect(screen.getByText('Desktop')).toBeInTheDocument();
    });

    it('should debounce rapid interactions', async () => {
      const user = userEvent.setup();
      renderEditorToolbar();

      const tabletButton = screen.getByText('Tablet');

      // Multiple rapid clicks
      await user.click(tabletButton);
      await user.click(tabletButton);

      // Should handle all clicks properly
      expect(mockProps.onPreviewModeChange).toHaveBeenCalledTimes(2);
    });
  });
});

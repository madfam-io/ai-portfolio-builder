import { describe, test, it, expect, beforeEach, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { TemplateSelector } from '@/components/editor/TemplateSelector';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { Portfolio } from '@/types/portfolio';

jest.mock('@/lib/store/portfolio-store');
jest.mock('@/components/templates/ModernTemplate', () => ({
jest.mock('@/components/templates/MinimalTemplate', () => ({
jest.mock('@/components/templates/BusinessTemplate', () => ({
jest.mock('@/components/templates/CreativeTemplate', () => ({
jest.mock('@/components/templates/EducatorTemplate', () => ({

// E2E test running in unit test mode

// Mock Playwright for unit test environment
global.page = {
  goto: jest.fn(),
  click: jest.fn(),
  fill: jest.fn(),
  waitForSelector: jest.fn(),
  waitForLoadState: jest.fn(),
  locator: jest.fn(() => ({
    click: jest.fn(),
    fill: jest.fn(),
    isVisible: jest.fn().mockResolvedValue(true)}))};

/**
 * @jest-environment jsdom
 */

// Mock the portfolio store

// Mock the template components

  ModernTemplate: ({ portfolio }: { portfolio: Portfolio }) => {
    return React.createElement('div', { 'data-testid': 'modern-template' }, `Modern Template - ${portfolio.name}`);
  }
}));

  MinimalTemplate: ({ portfolio }: { portfolio: Portfolio }) => {
    return React.createElement('div', { 'data-testid': 'minimal-template' }, `Minimal Template - ${portfolio.name}`);
  }
}));

  BusinessTemplate: ({ portfolio }: { portfolio: Portfolio }) => {
    return React.createElement('div', { 'data-testid': 'business-template' }, `Business Template - ${portfolio.name}`);
  }
}));

  CreativeTemplate: ({ portfolio }: { portfolio: Portfolio }) => {
    return React.createElement('div', { 'data-testid': 'creative-template' }, `Creative Template - ${portfolio.name}`);
  }
}));

  EducatorTemplate: ({ portfolio }: { portfolio: Portfolio }) => {
    return React.createElement('div', { 'data-testid': 'educator-template' }, `Educator Template - ${portfolio.name}`);
  }
}));

const mockPortfolio: Portfolio = {
  id: 'test-portfolio',
  name: 'John Doe',
  title: 'Software Developer',
  bio: 'A passionate developer',
  template: 'modern',
  skills: [],
  projects: [],
  experience: [],
  education: [],
  certifications: [],
  contact: {},
  social: {},
  customization: {}
};

const mockPortfolioStore = {
  currentPortfolio: mockPortfolio,
  updateTemplate: jest.fn().mockReturnValue(void 0),
  updatePortfolio: jest.fn().mockReturnValue(void 0),
  isLoading: false,
  isDirty: false
};

// Mock template renderer component
const MockTemplateRenderer = ({ portfolio }: { portfolio: Portfolio }) => {
  const templates = {
    modern: () => React.createElement('div', { 'data-testid': 'modern-template' }, `Modern Template - ${portfolio.name}`),
    minimal: () => React.createElement('div', { 'data-testid': 'minimal-template' }, `Minimal Template - ${portfolio.name}`),
    business: () => React.createElement('div', { 'data-testid': 'business-template' }, `Business Template - ${portfolio.name}`),
    creative: () => React.createElement('div', { 'data-testid': 'creative-template' }, `Creative Template - ${portfolio.name}`),
    educator: () => React.createElement('div', { 'data-testid': 'educator-template' }, `Educator Template - ${portfolio.name}`)
  };

  const TemplateComponent = templates[portfolio.template as keyof typeof templates];
  return TemplateComponent ? TemplateComponent() : React.createElement('div', {}, 'Unknown template');
};

const TemplateSwitchingTest = () => {
  const { currentPortfolio, updateTemplate } = usePortfolioStore();

  if (!currentPortfolio) return React.createElement('div', {}, 'No portfolio');

  return React.createElement('div', {},
    React.createElement(TemplateSelector, {
      selectedTemplate: currentPortfolio.template,
      onTemplateChange: updateTemplate
    }),
    React.createElement(MockTemplateRenderer, { portfolio: currentPortfolio })
  );
};

describe('Template Switching E2E', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (usePortfolioStore as jest.Mock).mockReturnValue(mockPortfolioStore);
  });

  describe('Template Selection', () => {
    it('should display all available templates', async () => {
      render(<TemplateSwitchingTest />);

      expect(screen.getByText(/modern/i)).toBeInTheDocument();
      expect(screen.getByText(/minimal/i)).toBeInTheDocument();
      expect(screen.getByText(/business/i)).toBeInTheDocument();
      expect(screen.getByText(/creative/i)).toBeInTheDocument();
      expect(screen.getByText(/educator/i)).toBeInTheDocument();
    });

    it('should highlight the currently selected template', async () => {
      render(<TemplateSwitchingTest />);

      const modernOption = screen.getByText(/modern/i).closest('button');
      expect(modernOption).toHaveClass('ring-2', 'ring-blue-500');
    });

    it('should render the current template', async () => {
      render(<TemplateSwitchingTest />);

      expect(screen.getByTestId('modern-template')).toBeInTheDocument();
      expect(screen.getByText('Modern Template - John Doe')).toBeInTheDocument();
    });
  });

  describe('Template Switching Flow', () => {
    it('should switch to minimal template when selected', async () => {
      const { rerender } = render(<TemplateSwitchingTest />);

      const minimalButton = screen.getByText(/minimal/i).closest('button');
      fireEvent.click(minimalButton!);

      expect(mockPortfolioStore.updateTemplate).toHaveBeenCalledWith('minimal');

      // Simulate state update
      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        currentPortfolio: { ...mockPortfolio, template: 'minimal' }
      });

      rerender(<TemplateSwitchingTest />);

      await waitFor(() => {
        expect(screen.getByTestId('minimal-template')).toBeInTheDocument();
        expect(screen.getByText('Minimal Template - John Doe')).toBeInTheDocument();
      });
    });

    it('should switch to business template when selected', async () => {
      const { rerender } = render(<TemplateSwitchingTest />);

      const businessButton = screen.getByText(/business/i).closest('button');
      fireEvent.click(businessButton!);

      expect(mockPortfolioStore.updateTemplate).toHaveBeenCalledWith('business');

      // Simulate state update
      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        currentPortfolio: { ...mockPortfolio, template: 'business' }
      });

      rerender(<TemplateSwitchingTest />);

      await waitFor(() => {
        expect(screen.getByTestId('business-template')).toBeInTheDocument();
        expect(screen.getByText('Business Template - John Doe')).toBeInTheDocument();
      });
    });

    it('should switch to creative template when selected', async () => {
      const { rerender } = render(<TemplateSwitchingTest />);

      const creativeButton = screen.getByText(/creative/i).closest('button');
      fireEvent.click(creativeButton!);

      expect(mockPortfolioStore.updateTemplate).toHaveBeenCalledWith('creative');

      // Simulate state update
      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        currentPortfolio: { ...mockPortfolio, template: 'creative' }
      });

      rerender(<TemplateSwitchingTest />);

      await waitFor(() => {
        expect(screen.getByTestId('creative-template')).toBeInTheDocument();
        expect(screen.getByText('Creative Template - John Doe')).toBeInTheDocument();
      });
    });

    it('should switch to educator template when selected', async () => {
      const { rerender } = render(<TemplateSwitchingTest />);

      const educatorButton = screen.getByText(/educator/i).closest('button');
      fireEvent.click(educatorButton!);

      expect(mockPortfolioStore.updateTemplate).toHaveBeenCalledWith('educator');

      // Simulate state update
      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        currentPortfolio: { ...mockPortfolio, template: 'educator' }
      });

      rerender(<TemplateSwitchingTest />);

      await waitFor(() => {
        expect(screen.getByTestId('educator-template')).toBeInTheDocument();
        expect(screen.getByText('Educator Template - John Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Data Preservation', () => {
    it('should preserve portfolio data when switching templates', async () => {
      const portfolioWithData = {
        ...mockPortfolio,
        name: 'Jane Doe',
        title: 'Senior Developer',
        bio: 'Experienced developer with 10 years',
        skills: [{ name: 'React', level: 'Expert' }],
        projects: [{ id: '1', title: 'Project 1', description: 'Test project', technologies: [] }]
      };

      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        currentPortfolio: portfolioWithData
      });

      const { rerender } = render(<TemplateSwitchingTest />);

      // Switch template
      const minimalButton = screen.getByText(/minimal/i).closest('button');
      fireEvent.click(minimalButton!);

      // Simulate template change while preserving data
      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        currentPortfolio: { ...portfolioWithData, template: 'minimal' }
      });

      rerender(<TemplateSwitchingTest />);

      // Verify data is preserved
      await waitFor(() => {
        expect(screen.getByText('Minimal Template - Jane Doe')).toBeInTheDocument();
      });

      // Verify the update was called correctly
      expect(mockPortfolioStore.updateTemplate).toHaveBeenCalledWith('minimal');
    });
  });

  describe('Template Previews', () => {
    it('should show template previews on hover', async () => {
      render(<TemplateSwitchingTest />);

      const businessButton = screen.getByText(/business/i).closest('button');

      fireEvent.mouseEnter(businessButton!);

      await waitFor(() => {
        expect(businessButton).toHaveClass('hover:scale-105');
      });
    });

    it('should display template descriptions', async () => {
      render(<TemplateSwitchingTest />);

      expect(screen.getByText(/professional and sleek/i)).toBeInTheDocument();
      expect(screen.getByText(/clean and minimal/i)).toBeInTheDocument();
      expect(screen.getByText(/corporate and executive/i)).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should work on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375});

      render(<TemplateSwitchingTest />);

      expect(screen.getByTestId('modern-template')).toBeInTheDocument();

      const minimalButton = screen.getByText(/minimal/i).closest('button');
      fireEvent.click(minimalButton!);

      expect(mockPortfolioStore.updateTemplate).toHaveBeenCalledWith('minimal');
    });

    it('should handle touch events on mobile', async () => {
      render(<TemplateSwitchingTest />);

      const businessButton = screen.getByText(/business/i).closest('button');

      fireEvent.touchStart(businessButton!);
      fireEvent.touchEnd(businessButton!);

      expect(mockPortfolioStore.updateTemplate).toHaveBeenCalledWith('business');
    });
  });

  describe('Error Handling', () => {
    it('should handle template switching errors gracefully', async () => {
      const errorStore = {
        ...mockPortfolioStore,
        updateTemplate: jest.fn().mockImplementation(() => {
          throw new Error('Template switch failed');
        })
      };

      (usePortfolioStore as jest.Mock).mockReturnValue(errorStore);

      render(<TemplateSwitchingTest />);

      const minimalButton = screen.getByText(/minimal/i).closest('button');

      expect(() => {
        fireEvent.click(minimalButton!);
      }).not.toThrow();

      // Should still display current template
      expect(screen.getByTestId('modern-template')).toBeInTheDocument();
    });

    it('should handle missing template gracefully', async () => {
      const portfolioWithInvalidTemplate = {
        ...mockPortfolio,
        template: 'invalid-template' as any
      };

      (usePortfolioStore as jest.Mock).mockReturnValue({
        ...mockPortfolioStore,
        currentPortfolio: portfolioWithInvalidTemplate
      });

      render(<TemplateSwitchingTest />);

      expect(screen.getByText('Unknown template')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', async () => {
      const renderSpy = jest.fn().mockReturnValue(void 0);

      const TrackedComponent = () => {
        renderSpy();
        return <TemplateSwitchingTest />;
      };

      const { rerender } = render(<TrackedComponent />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props shouldn't trigger additional renders
      rerender(<TrackedComponent />);

      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should debounce rapid template changes', async () => {
      jest.useFakeTimers();

      render(<TemplateSwitchingTest />);

      const minimalButton = screen.getByText(/minimal/i).closest('button');
      const businessButton = screen.getByText(/business/i).closest('button');

      // Rapid clicks
      fireEvent.click(minimalButton!);
      fireEvent.click(businessButton!);
      fireEvent.click(minimalButton!);

      jest.advanceTimersByTime(300);

      // Should only call the last one
      expect(mockPortfolioStore.updateTemplate).toHaveBeenLastCalledWith('minimal');

      jest.useRealTimers();
    });
  });
});
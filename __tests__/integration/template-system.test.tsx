/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect, jest } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';


// Mock template components
const MockModernTemplate = ({ portfolio }: any) => (
  <div data-testid="modern-template">
    <h1>{portfolio.name}</h1>
    <p>{portfolio.title}</p>
  </div>

const MockMinimalTemplate = ({ portfolio }: any) => (
  <div data-testid="minimal-template">
    <h1>{portfolio.name}</h1>
    <p>{portfolio.title}</p>
  </div>

const MockBusinessTemplate = ({ portfolio }: any) => (
  <div data-testid="business-template">
    <h1>{portfolio.name}</h1>
    <p>{portfolio.title}</p>
  </div>

// Template selector component
const TemplateSelector = ({ template, onTemplateChange }: any) => (
  <div data-testid="template-selector">
    <button
      data-testid="modern-btn"
      onClick={() => onTemplateChange('modern')}
      className={template === 'modern' ? 'selected' : ''}
    >
      Modern
    </button>
    <button
      data-testid="minimal-btn"
      onClick={() => onTemplateChange('minimal')}
      className={template === 'minimal' ? 'selected' : ''}
    >
      Minimal
    </button>
    <button
      data-testid="business-btn"
      onClick={() => onTemplateChange('business')}
      className={template === 'business' ? 'selected' : ''}
    >
      Business
    </button>
  </div>

// Template renderer
const TemplateRenderer = ({ portfolio }: any) => {
  const templates = {
    modern: MockModernTemplate,
    minimal: MockMinimalTemplate,
    business: MockBusinessTemplate,
  };

  const TemplateComponent =
    templates[portfolio.template as keyof typeof templates];

  if (!TemplateComponent) {
    return <div data-testid="unknown-template">Unknown template</div>;
  }

  return <TemplateComponent portfolio={portfolio} />;
};

describe('Template System Integration', () => {
  const mockPortfolio = {
    id: 'test',
    name: 'John Doe',
    title: 'Software Developer',
    template: 'modern',
  };

  it('should render modern template by default', () => {
    render(<TemplateRenderer portfolio={mockPortfolio} />);

    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Software Developer')).toBeInTheDocument();
  });

  it('should render minimal template when selected', () => {
    const portfolioWithMinimal = { ...mockPortfolio, template: 'minimal' };

    render(<TemplateRenderer portfolio={portfolioWithMinimal} />);

    expect(screen.getByTestId('minimal-template')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render business template when selected', () => {
    const portfolioWithBusiness = { ...mockPortfolio, template: 'business' };

    render(<TemplateRenderer portfolio={portfolioWithBusiness} />);

    expect(screen.getByTestId('business-template')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should handle unknown template gracefully', () => {
    const portfolioWithUnknown = { ...mockPortfolio, template: 'unknown' };

    render(<TemplateRenderer portfolio={portfolioWithUnknown} />);

    expect(screen.getByTestId('unknown-template')).toBeInTheDocument();
    expect(screen.getByText('Unknown template')).toBeInTheDocument();
  });

  it('should render template selector with correct active state', () => {
    const mockOnChange = jest.fn();

    render(
      <TemplateSelector template="modern" onTemplateChange={mockOnChange} />

    expect(screen.getByTestId('template-selector')).toBeInTheDocument();
    expect(screen.getByTestId('modern-btn')).toHaveClass('selected');
    expect(screen.getByTestId('minimal-btn')).not.toHaveClass('selected');
    expect(screen.getByTestId('business-btn')).not.toHaveClass('selected');
  });

  it('should handle missing portfolio data gracefully', () => {
    const emptyPortfolio = {
      id: 'test',
      name: '',
      title: '',
      template: 'modern',
    };

    render(<TemplateRenderer portfolio={emptyPortfolio} />);

    expect(screen.getByTestId('modern-template')).toBeInTheDocument();
  });

  it('should preserve data across template changes', () => {
    const { rerender } = render(<TemplateRenderer portfolio={mockPortfolio} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();

    const portfolioWithNewTemplate = { ...mockPortfolio, template: 'minimal' };
    rerender(<TemplateRenderer portfolio={portfolioWithNewTemplate} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByTestId('minimal-template')).toBeInTheDocument();
  });

  it('should render all templates with same data consistently', () => {
    const templates = ['modern', 'minimal', 'business'];

    templates.forEach(template => {
      const portfolioWithTemplate = { ...mockPortfolio, template };
      const { unmount } = render(
        <TemplateRenderer portfolio={portfolioWithTemplate} />

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Developer')).toBeInTheDocument();

      unmount();
    });
  });
});

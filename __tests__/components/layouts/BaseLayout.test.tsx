import React from 'react';
import { render, screen } from '@testing-library/react';
import BaseLayout from '@/components/layouts/BaseLayout';

// Mock the child components to isolate BaseLayout testing
jest.mock('@/components/landing/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock('@/components/landing/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

jest.mock('@/components/BackToTopButton', () => ({
  __esModule: true,
  default: () => <div data-testid="back-to-top">BackToTop</div>,
}));

describe('BaseLayout Component', () => {
  it('renders children content', () => {
    render(
      <BaseLayout>
        <div data-testid="child-content">Test Content</div>
      </BaseLayout>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders header by default', () => {
    render(
      <BaseLayout>
        <div>Content</div>
      </BaseLayout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders footer by default', () => {
    render(
      <BaseLayout>
        <div>Content</div>
      </BaseLayout>
    );

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders back to top button', () => {
    render(
      <BaseLayout>
        <div>Content</div>
      </BaseLayout>
    );

    expect(screen.getByTestId('back-to-top')).toBeInTheDocument();
  });

  it('hides header when showHeader is false', () => {
    render(
      <BaseLayout showHeader={false}>
        <div>Content</div>
      </BaseLayout>
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('hides footer when showFooter is false', () => {
    render(
      <BaseLayout showFooter={false}>
        <div>Content</div>
      </BaseLayout>
    );

    expect(screen.queryByTestId('footer')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <BaseLayout className="custom-class">
        <div>Content</div>
      </BaseLayout>
    );

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
    expect(wrapper).toHaveClass('min-h-screen');
    expect(wrapper).toHaveClass('bg-white');
    expect(wrapper).toHaveClass('dark:bg-gray-900');
  });
});
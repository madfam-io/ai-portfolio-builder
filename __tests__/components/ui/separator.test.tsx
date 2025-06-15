import React from 'react';
import { render, screen } from '@testing-library/react';
import { Separator } from '@/components/ui/separator';

describe('Separator Component', () => {
  describe('Basic Rendering', () => {
    it('should render separator', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Separator ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should apply custom className', () => {
      render(
        <Separator className="custom-separator" data-testid="separator" />
      );
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('custom-separator');
      // Should still have default classes
      expect(separator).toHaveClass('shrink-0', 'bg-border');
    });

    it('should spread additional props', () => {
      render(<Separator data-testid="separator" id="test-separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('id', 'test-separator');
    });
  });

  describe('Orientation', () => {
    it('should render horizontal orientation by default', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveClass('h-[1px]', 'w-full');
    });

    it('should render horizontal orientation explicitly', () => {
      render(<Separator orientation="horizontal" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
      expect(separator).toHaveClass('h-[1px]', 'w-full');
    });

    it('should render vertical orientation', () => {
      render(<Separator orientation="vertical" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
      expect(separator).toHaveClass('h-full', 'w-[1px]');
    });
  });

  describe('Decorative Prop', () => {
    it('should be decorative by default', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      // Decorative separators don't have role="separator"
      expect(separator).not.toHaveAttribute('role', 'separator');
    });

    it('should be decorative when explicitly set', () => {
      render(<Separator decorative={true} data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).not.toHaveAttribute('role', 'separator');
    });

    it('should have separator role when not decorative', () => {
      render(<Separator decorative={false} data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'separator');
    });
  });

  describe('Default Classes', () => {
    it('should have base styling classes', () => {
      render(<Separator data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('shrink-0', 'bg-border');
    });

    it('should have correct horizontal classes', () => {
      render(<Separator orientation="horizontal" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-[1px]', 'w-full');
    });

    it('should have correct vertical classes', () => {
      render(<Separator orientation="vertical" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-full', 'w-[1px]');
    });
  });

  describe('Use Cases', () => {
    it('should work as content divider', () => {
      render(
        <div>
          <p>Section 1</p>
          <Separator data-testid="divider" />
          <p>Section 2</p>
        </div>
      );

      expect(screen.getByText('Section 1')).toBeInTheDocument();
      expect(screen.getByTestId('divider')).toBeInTheDocument();
      expect(screen.getByText('Section 2')).toBeInTheDocument();
    });

    it('should work in navigation menu', () => {
      render(
        <nav>
          <a href="#home">Home</a>
          <Separator orientation="vertical" decorative={false} />
          <a href="#about">About</a>
          <Separator orientation="vertical" decorative={false} />
          <a href="#contact">Contact</a>
        </nav>
      );

      const separators = screen.getAllByRole('separator');
      expect(separators).toHaveLength(2);
      separators.forEach(separator => {
        expect(separator).toHaveAttribute('data-orientation', 'vertical');
      });
    });

    it('should work in sidebar layout', () => {
      render(
        <div className="flex">
          <aside>Sidebar content</aside>
          <Separator
            orientation="vertical"
            className="mx-4"
            data-testid="separator"
          />
          <main>Main content</main>
        </div>
      );

      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('mx-4');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });

    it('should work in card sections', () => {
      render(
        <div>
          <h2>Card Header</h2>
          <Separator className="my-4" />
          <p>Card content goes here</p>
          <Separator className="my-4" />
          <footer>Card footer</footer>
        </div>
      );

      expect(screen.getByText('Card Header')).toBeInTheDocument();
      expect(screen.getByText('Card content goes here')).toBeInTheDocument();
      expect(screen.getByText('Card footer')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible when not decorative', () => {
      render(<Separator decorative={false} data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('role', 'separator');
    });

    it('should support aria-label when not decorative', () => {
      render(
        <Separator
          decorative={false}
          aria-label="Content separator"
          data-testid="separator"
        />
      );
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveAttribute('aria-label', 'Content separator');
    });

    it('should be hidden from screen readers when decorative', () => {
      render(<Separator decorative={true} data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      // Decorative separators should not have role="separator"
      expect(separator).not.toHaveAttribute('role', 'separator');
    });

    it('should have correct orientation for screen readers', () => {
      render(<Separator orientation="vertical" decorative={false} />);
      const separator = screen.getByRole('separator');
      expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('Custom Styling', () => {
    it('should support custom colors', () => {
      render(<Separator className="bg-red-500" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('bg-red-500');
    });

    it('should support custom thickness for horizontal', () => {
      render(
        <Separator
          orientation="horizontal"
          className="h-2"
          data-testid="separator"
        />
      );
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('h-2');
    });

    it('should support custom thickness for vertical', () => {
      render(
        <Separator
          orientation="vertical"
          className="w-2"
          data-testid="separator"
        />
      );
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('w-2');
    });

    it('should support spacing classes', () => {
      render(<Separator className="mx-8 my-4" data-testid="separator" />);
      const separator = screen.getByTestId('separator');
      expect(separator).toHaveClass('mx-8', 'my-4');
    });
  });

  describe('Layout Integration', () => {
    it('should work in flex containers', () => {
      render(
        <div className="flex items-center space-x-4">
          <span>Item 1</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Item 2</span>
          <Separator orientation="vertical" className="h-4" />
          <span>Item 3</span>
        </div>
      );

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    it('should work in grid layouts', () => {
      render(
        <div className="grid grid-cols-3 gap-4">
          <div>Column 1</div>
          <Separator orientation="vertical" />
          <div>Column 2</div>
        </div>
      );

      expect(screen.getByText('Column 1')).toBeInTheDocument();
      expect(screen.getByText('Column 2')).toBeInTheDocument();
    });
  });

  describe('Multiple Separators', () => {
    it('should render multiple separators correctly', () => {
      render(
        <div>
          <Separator data-testid="sep-1" />
          <Separator data-testid="sep-2" />
          <Separator data-testid="sep-3" />
        </div>
      );

      expect(screen.getByTestId('sep-1')).toBeInTheDocument();
      expect(screen.getByTestId('sep-2')).toBeInTheDocument();
      expect(screen.getByTestId('sep-3')).toBeInTheDocument();
    });

    it('should handle mixed orientations', () => {
      render(
        <div>
          <Separator orientation="horizontal" data-testid="horizontal" />
          <Separator orientation="vertical" data-testid="vertical" />
        </div>
      );

      const horizontal = screen.getByTestId('horizontal');
      const vertical = screen.getByTestId('vertical');

      expect(horizontal).toHaveAttribute('data-orientation', 'horizontal');
      expect(vertical).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined orientation gracefully', () => {
      render(
        <Separator orientation={undefined as any} data-testid="separator" />
      );
      const separator = screen.getByTestId('separator');
      // Should fall back to horizontal
      expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('should handle invalid orientation gracefully', () => {
      render(
        <Separator orientation={'diagonal' as any} data-testid="separator" />
      );
      const separator = screen.getByTestId('separator');
      // Should still render
      expect(separator).toBeInTheDocument();
    });

    it('should work with minimal props', () => {
      render(<Separator data-testid="separator" />);
      // Should render without error
      const separator = screen.getByTestId('separator');
      expect(separator).toBeInTheDocument();
    });
  });
});

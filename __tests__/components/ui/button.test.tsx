import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button, buttonVariants } from '@/components/ui/button';

describe('Button Component', () => {
  describe('Basic Rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>);
      expect(screen.getByRole('button')).toHaveClass('custom-class');
    });

    it('should spread additional props', () => {
      render(<Button data-testid="custom-button" id="test-id">Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('id', 'test-id');
    });
  });

  describe('Variants', () => {
    const variants = [
      'default',
      'destructive',
      'outline',
      'secondary',
      'ghost',
      'link',
      'success',
      'warning',
      'info',
    ] as const;

    variants.forEach(variant => {
      it(`should render ${variant} variant`, () => {
        render(<Button variant={variant}>{variant} Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        // Check that the button has appropriate variant classes by checking specific styles
        if (variant === 'default') {
          expect(button).toHaveClass('bg-primary');
        } else if (variant === 'destructive') {
          expect(button).toHaveClass('bg-destructive');
        } else if (variant === 'outline') {
          expect(button).toHaveClass('border');
        } else if (variant === 'secondary') {
          expect(button).toHaveClass('bg-secondary');
        } else if (variant === 'ghost') {
          expect(button).toHaveClass('hover:bg-accent');
        } else if (variant === 'link') {
          expect(button).toHaveClass('text-primary', 'underline-offset-4');
        } else if (variant === 'success') {
          expect(button).toHaveClass('bg-success');
        } else if (variant === 'warning') {
          expect(button).toHaveClass('bg-warning');
        } else if (variant === 'info') {
          expect(button).toHaveClass('bg-info');
        }
      });
    });
  });

  describe('Sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'] as const;

    sizes.forEach(size => {
      it(`should render ${size} size`, () => {
        render(<Button size={size}>{size} Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
        // Check that appropriate size classes are applied
        const sizeClasses = buttonVariants({ size });
        if (size.includes('icon')) {
          expect(button.className).toMatch(/[hw]-\d+/);
        } else {
          expect(button.className).toMatch(/h-\d+/);
        }
      });
    });
  });

  describe('Full Width', () => {
    it('should render full width button', () => {
      render(<Button fullWidth>Full Width Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('should not be full width by default', () => {
      render(<Button>Normal Button</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should disable button when loading', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should hide icons when loading', () => {
      render(
        <Button loading leftIcon={<span>L</span>} rightIcon={<span>R</span>}>
          Loading
        </Button>
      );
      expect(screen.queryByText('L')).not.toBeInTheDocument();
      expect(screen.queryByText('R')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render left icon', () => {
      render(<Button leftIcon={<span data-testid="left-icon">←</span>}>Button</Button>);
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      const iconWrapper = screen.getByTestId('left-icon').parentElement;
      expect(iconWrapper).toHaveClass('mr-2');
    });

    it('should render right icon', () => {
      render(<Button rightIcon={<span data-testid="right-icon">→</span>}>Button</Button>);
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      const iconWrapper = screen.getByTestId('right-icon').parentElement;
      expect(iconWrapper).toHaveClass('ml-2');
    });

    it('should render both icons', () => {
      render(
        <Button 
          leftIcon={<span data-testid="left">L</span>} 
          rightIcon={<span data-testid="right">R</span>}
        >
          Button
        </Button>
      );
      expect(screen.getByTestId('left')).toBeInTheDocument();
      expect(screen.getByTestId('right')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable button when disabled prop is true', () => {
      render(<Button disabled>Disabled Button</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should apply disabled styles', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/disabled:opacity-50/);
    });
  });

  describe('AsChild', () => {
    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      );
      const link = screen.getByRole('link', { name: 'Link Button' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/test');
    });

    it('should apply button styles to child component', () => {
      render(
        <Button asChild variant="secondary" size="lg">
          <a href="/test">Link</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link.className).toMatch(/bg-secondary/);
      expect(link.className).toMatch(/h-12/);
    });

    it('should handle disabled state with asChild', () => {
      render(
        <Button asChild disabled>
          <a href="/test">Disabled Link</a>
        </Button>
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Interactions', () => {
    it('should handle click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable Button</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not trigger click when disabled', async () => {
      const handleClick = jest.fn();
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not trigger click when loading', async () => {
      const handleClick = jest.fn();
      render(<Button loading onClick={handleClick}>Loading Button</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard navigation', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Keyboard Button</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      
      await userEvent.keyboard('{Enter}');
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      await userEvent.keyboard(' ');
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes when loading', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('should hide decorative icons from screen readers', () => {
      render(
        <Button leftIcon={<span>←</span>} rightIcon={<span>→</span>}>
          Button
        </Button>
      );
      const leftIconWrapper = screen.getByText('←').parentElement;
      const rightIconWrapper = screen.getByText('→').parentElement;
      expect(leftIconWrapper).toHaveAttribute('aria-hidden', 'true');
      expect(rightIconWrapper).toHaveAttribute('aria-hidden', 'true');
    });

    it('should hide loading spinner from screen readers', () => {
      render(<Button loading>Loading</Button>);
      const spinner = screen.getByRole('button').querySelector('svg');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      expect(screen.getByRole('button', { name: 'Custom label' })).toBeInTheDocument();
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Button aria-describedby="description">Button</Button>
          <span id="description">This is a description</span>
        </>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('CSS Classes', () => {
    it('should have focus ring classes', () => {
      render(<Button>Focus Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/focus-visible:ring-2/);
      expect(button.className).toMatch(/focus-visible:outline-none/);
    });

    it('should have transition classes', () => {
      render(<Button>Transition Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/transition-all/);
      expect(button.className).toMatch(/duration-200/);
    });

    it('should prevent text selection', () => {
      render(<Button>No Select Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toMatch(/select-none/);
    });
  });

  describe('buttonVariants utility', () => {
    it('should generate correct classes for variants', () => {
      const defaultClasses = buttonVariants();
      expect(defaultClasses).toMatch(/bg-primary/);
      
      const destructiveClasses = buttonVariants({ variant: 'destructive' });
      expect(destructiveClasses).toMatch(/bg-destructive/);
      
      const outlineClasses = buttonVariants({ variant: 'outline' });
      expect(outlineClasses).toMatch(/border/);
    });

    it('should generate correct classes for sizes', () => {
      const defaultSize = buttonVariants({ size: 'default' });
      expect(defaultSize).toMatch(/h-10/);
      
      const smallSize = buttonVariants({ size: 'sm' });
      expect(smallSize).toMatch(/h-8/);
      
      const iconSize = buttonVariants({ size: 'icon' });
      expect(iconSize).toMatch(/h-10 w-10/);
    });

    it('should combine variant props correctly', () => {
      const combined = buttonVariants({ 
        variant: 'secondary', 
        size: 'lg', 
        fullWidth: true 
      });
      expect(combined).toMatch(/bg-secondary/);
      expect(combined).toMatch(/h-12/);
      expect(combined).toMatch(/w-full/);
    });
  });
});
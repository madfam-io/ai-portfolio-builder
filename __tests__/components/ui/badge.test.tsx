import React from 'react';
import { render, screen } from '@testing-library/react';
import { Badge, badgeVariants } from '@/components/ui/badge';

describe('Badge Component', () => {
  describe('Basic Rendering', () => {
    it('should render badge with text', () => {
      render(<Badge>Badge Text</Badge>);
      expect(screen.getByText('Badge Text')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<Badge className="custom-badge" data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('custom-badge');
      // Should still have default classes
      expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full');
    });

    it('should spread additional props', () => {
      render(<Badge data-testid="badge" id="test-badge" role="status">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveAttribute('id', 'test-badge');
      expect(badge).toHaveAttribute('role', 'status');
    });

    it('should render as div element by default', () => {
      render(<Badge data-testid="badge">Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge.tagName).toBe('DIV');
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Badge data-testid="badge">Default Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-primary',
        'text-primary-foreground'
      );
    });

    it('should render secondary variant', () => {
      render(<Badge variant="secondary" data-testid="badge">Secondary Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-secondary',
        'text-secondary-foreground'
      );
    });

    it('should render destructive variant', () => {
      render(<Badge variant="destructive" data-testid="badge">Destructive Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass(
        'border-transparent',
        'bg-destructive',
        'text-destructive-foreground'
      );
    });

    it('should render outline variant', () => {
      render(<Badge variant="outline" data-testid="badge">Outline Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('text-foreground');
      expect(badge).not.toHaveClass('border-transparent');
    });
  });

  describe('Default Classes', () => {
    it('should have base styling classes', () => {
      render(<Badge data-testid="badge">Styled Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-full',
        'border',
        'px-2.5',
        'py-0.5',
        'text-xs',
        'font-semibold',
        'transition-colors'
      );
    });

    it('should have focus styles', () => {
      render(<Badge data-testid="badge">Focusable Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass(
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-ring',
        'focus:ring-offset-2'
      );
    });

    it('should have hover styles for variants', () => {
      render(<Badge variant="default" data-testid="badge">Hoverable Badge</Badge>);
      const badge = screen.getByTestId('badge');
      expect(badge).toHaveClass('hover:bg-primary/80');
    });
  });

  describe('Content Types', () => {
    it('should render text content', () => {
      render(<Badge>Simple Text</Badge>);
      expect(screen.getByText('Simple Text')).toBeInTheDocument();
    });

    it('should render numeric content', () => {
      render(<Badge>42</Badge>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with icons', () => {
      render(
        <Badge>
          <span data-testid="icon">★</span>
          Featured
        </Badge>
      );
      expect(screen.getByTestId('icon')).toBeInTheDocument();
      expect(screen.getByText('Featured')).toBeInTheDocument();
    });

    it('should render empty badge', () => {
      render(<Badge data-testid="empty-badge"></Badge>);
      const badge = screen.getByTestId('empty-badge');
      expect(badge).toBeInTheDocument();
      expect(badge).toBeEmptyDOMElement();
    });

    it('should render badge with only icon', () => {
      render(
        <Badge data-testid="icon-badge">
          <span data-testid="only-icon">♦</span>
        </Badge>
      );
      expect(screen.getByTestId('only-icon')).toBeInTheDocument();
      expect(screen.getByTestId('icon-badge')).toHaveTextContent('♦');
    });
  });

  describe('Use Cases', () => {
    it('should work as status indicator', () => {
      render(<Badge variant="destructive" role="status">Error</Badge>);
      const badge = screen.getByRole('status');
      expect(badge).toHaveTextContent('Error');
      expect(badge).toHaveClass('bg-destructive');
    });

    it('should work as notification badge', () => {
      render(<Badge variant="default" aria-label="3 notifications">3</Badge>);
      const badge = screen.getByLabelText('3 notifications');
      expect(badge).toHaveTextContent('3');
    });

    it('should work as category tag', () => {
      render(<Badge variant="secondary">JavaScript</Badge>);
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    it('should work with long text', () => {
      const longText = 'This is a very long badge text that might wrap';
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });
  });

  describe('Multiple Badges', () => {
    it('should render multiple badges correctly', () => {
      render(
        <div>
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      );

      expect(screen.getByText('Default')).toBeInTheDocument();
      expect(screen.getByText('Secondary')).toBeInTheDocument();
      expect(screen.getByText('Destructive')).toBeInTheDocument();
      expect(screen.getByText('Outline')).toBeInTheDocument();
    });

    it('should handle badge groups', () => {
      render(
        <div role="group" aria-label="Tags">
          <Badge>React</Badge>
          <Badge>TypeScript</Badge>
          <Badge>Next.js</Badge>
        </div>
      );

      const group = screen.getByRole('group', { name: 'Tags' });
      expect(group).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
      expect(screen.getByText('Next.js')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support ARIA labels', () => {
      render(<Badge aria-label="Status: Active">Active</Badge>);
      expect(screen.getByLabelText('Status: Active')).toBeInTheDocument();
    });

    it('should support role attribute', () => {
      render(<Badge role="status">Online</Badge>);
      expect(screen.getByRole('status')).toHaveTextContent('Online');
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Badge aria-describedby="description">Important</Badge>
          <span id="description">This badge indicates important items</span>
        </>
      );
      const badge = screen.getByText('Important');
      expect(badge).toHaveAttribute('aria-describedby', 'description');
    });

    it('should be readable by screen readers', () => {
      render(<Badge>New Feature</Badge>);
      const badge = screen.getByText('New Feature');
      expect(badge).toBeVisible();
      expect(badge).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('badgeVariants utility', () => {
    it('should generate correct classes for default variant', () => {
      const classes = badgeVariants();
      expect(classes).toMatch(/bg-primary/);
      expect(classes).toMatch(/text-primary-foreground/);
      expect(classes).toMatch(/border-transparent/);
    });

    it('should generate correct classes for secondary variant', () => {
      const classes = badgeVariants({ variant: 'secondary' });
      expect(classes).toMatch(/bg-secondary/);
      expect(classes).toMatch(/text-secondary-foreground/);
    });

    it('should generate correct classes for destructive variant', () => {
      const classes = badgeVariants({ variant: 'destructive' });
      expect(classes).toMatch(/bg-destructive/);
      expect(classes).toMatch(/text-destructive-foreground/);
    });

    it('should generate correct classes for outline variant', () => {
      const classes = badgeVariants({ variant: 'outline' });
      expect(classes).toMatch(/text-foreground/);
      expect(classes).not.toMatch(/border-transparent/);
    });

    it('should include base classes for all variants', () => {
      const variants = ['default', 'secondary', 'destructive', 'outline'] as const;
      
      variants.forEach(variant => {
        const classes = badgeVariants({ variant });
        expect(classes).toMatch(/inline-flex/);
        expect(classes).toMatch(/items-center/);
        expect(classes).toMatch(/rounded-full/);
        expect(classes).toMatch(/text-xs/);
        expect(classes).toMatch(/font-semibold/);
      });
    });
  });

  describe('Custom Styling', () => {
    it('should override default styles with custom className', () => {
      render(
        <Badge className="bg-yellow-500 text-black" data-testid="custom-badge">
          Custom
        </Badge>
      );
      const badge = screen.getByTestId('custom-badge');
      expect(badge).toHaveClass('bg-yellow-500', 'text-black');
      // Should still have structural classes
      expect(badge).toHaveClass('inline-flex', 'rounded-full');
    });

    it('should work with responsive classes', () => {
      render(
        <Badge className="sm:px-4 md:py-1 lg:text-sm" data-testid="responsive-badge">
          Responsive
        </Badge>
      );
      const badge = screen.getByTestId('responsive-badge');
      expect(badge).toHaveClass('sm:px-4', 'md:py-1', 'lg:text-sm');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined variant gracefully', () => {
      render(<Badge variant={undefined as any} data-testid="badge">Test</Badge>);
      const badge = screen.getByTestId('badge');
      // Should fall back to default variant
      expect(badge).toHaveClass('bg-primary');
    });

    it('should handle special characters in content', () => {
      const specialContent = '!@#$%^&*()';
      render(<Badge>{specialContent}</Badge>);
      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });

    it('should handle React elements as children', () => {
      render(
        <Badge>
          <strong>Bold</strong> and <em>italic</em>
        </Badge>
      );
      expect(screen.getByText('Bold')).toBeInTheDocument();
      expect(screen.getByText('italic')).toBeInTheDocument();
    });
  });
});
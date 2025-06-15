import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with default styles', () => {
      render(<Card data-testid="card">Card content</Card>);
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        'rounded-lg',
        'border',
        'bg-card',
        'text-card-foreground',
        'shadow-sm'
      );
    });

    it('should apply custom className', () => {
      render(<Card className="custom-class">Card</Card>);
      const card = screen.getByText('Card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('rounded-lg'); // Should still have default classes
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<Card ref={ref}>Card</Card>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it('should spread additional props', () => {
      render(<Card data-testid="card" id="test-card" role="article">Card</Card>);
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('role', 'article');
    });
  });

  describe('CardHeader', () => {
    it('should render header with default styles', () => {
      render(<CardHeader data-testid="header">Header content</CardHeader>);
      const header = screen.getByTestId('header');
      expect(header).toHaveClass(
        'flex',
        'flex-col',
        'space-y-1.5',
        'p-6'
      );
    });

    it('should apply custom className', () => {
      render(<CardHeader className="custom-header">Header</CardHeader>);
      const header = screen.getByText('Header');
      expect(header).toHaveClass('custom-header');
      expect(header).toHaveClass('flex', 'flex-col');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardHeader ref={ref}>Header</CardHeader>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardTitle', () => {
    it('should render title with default styles', () => {
      render(<CardTitle data-testid="title">Card Title</CardTitle>);
      const title = screen.getByTestId('title');
      expect(title).toHaveClass(
        'text-2xl',
        'font-semibold',
        'leading-none',
        'tracking-tight'
      );
    });

    it('should apply custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);
      const title = screen.getByText('Title');
      expect(title).toHaveClass('custom-title');
      expect(title).toHaveClass('text-2xl', 'font-semibold');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardTitle ref={ref}>Title</CardTitle>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardDescription', () => {
    it('should render description with default styles', () => {
      render(<CardDescription data-testid="description">Description text</CardDescription>);
      const description = screen.getByTestId('description');
      expect(description).toHaveClass(
        'text-sm',
        'text-muted-foreground'
      );
    });

    it('should apply custom className', () => {
      render(<CardDescription className="custom-desc">Description</CardDescription>);
      const description = screen.getByText('Description');
      expect(description).toHaveClass('custom-desc');
      expect(description).toHaveClass('text-sm');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardDescription ref={ref}>Description</CardDescription>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardContent', () => {
    it('should render content with default styles', () => {
      render(<CardContent data-testid="content">Content text</CardContent>);
      const content = screen.getByTestId('content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('should apply custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>);
      const content = screen.getByText('Content');
      expect(content).toHaveClass('custom-content');
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardContent ref={ref}>Content</CardContent>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('CardFooter', () => {
    it('should render footer with default styles', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>);
      const footer = screen.getByTestId('footer');
      expect(footer).toHaveClass(
        'flex',
        'items-center',
        'p-6',
        'pt-0'
      );
    });

    it('should apply custom className', () => {
      render(<CardFooter className="custom-footer">Footer</CardFooter>);
      const footer = screen.getByText('Footer');
      expect(footer).toHaveClass('custom-footer');
      expect(footer).toHaveClass('flex', 'items-center');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>();
      render(<CardFooter ref={ref}>Footer</CardFooter>);
      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('Complete Card Structure', () => {
    it('should render complete card with all components', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Test Card Title</CardTitle>
            <CardDescription>This is a test card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is the main content of the card.</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByTestId('complete-card')).toBeInTheDocument();
      expect(screen.getByText('Test Card Title')).toBeInTheDocument();
      expect(screen.getByText('This is a test card description')).toBeInTheDocument();
      expect(screen.getByText('This is the main content of the card.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument();
    });

    it('should handle card without header', () => {
      render(
        <Card>
          <CardContent>Content only</CardContent>
        </Card>
      );

      expect(screen.getByText('Content only')).toBeInTheDocument();
    });

    it('should handle card without footer', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(screen.getByText('Title Only')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle minimal card', () => {
      render(
        <Card>
          <CardContent>Minimal card</CardContent>
        </Card>
      );

      expect(screen.getByText('Minimal card')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should support ARIA attributes on card', () => {
      render(
        <Card role="article" aria-labelledby="card-title">
          <CardTitle id="card-title">Accessible Card</CardTitle>
        </Card>
      );

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-labelledby', 'card-title');
    });

    it('should support semantic HTML structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description for screen readers</CardDescription>
          </CardHeader>
          <CardContent>
            Main content that screen readers can navigate
          </CardContent>
        </Card>
      );

      // Test that all text content is accessible
      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description for screen readers')).toBeInTheDocument();
      expect(screen.getByText('Main content that screen readers can navigate')).toBeInTheDocument();
    });
  });

  describe('Custom Content', () => {
    it('should render complex content in card', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Product Card</CardTitle>
            <CardDescription>$99.99</CardDescription>
          </CardHeader>
          <CardContent>
            <img src="/test.jpg" alt="Product" />
            <ul>
              <li>Feature 1</li>
              <li>Feature 2</li>
            </ul>
          </CardContent>
          <CardFooter>
            <button>Add to Cart</button>
            <button>Wishlist</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Product Card')).toBeInTheDocument();
      expect(screen.getByText('$99.99')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Product' })).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Wishlist' })).toBeInTheDocument();
    });

    it('should handle multiple cards', () => {
      render(
        <div>
          <Card>
            <CardContent>Card 1</CardContent>
          </Card>
          <Card>
            <CardContent>Card 2</CardContent>
          </Card>
          <Card>
            <CardContent>Card 3</CardContent>
          </Card>
        </div>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Card 3')).toBeInTheDocument();
    });
  });
});
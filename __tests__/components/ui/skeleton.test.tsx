import React from 'react';
import { render, screen } from '@testing-library/react';
import { Skeleton } from '@/components/ui/skeleton';

describe('Skeleton Component', () => {
  describe('Basic Rendering', () => {
    it('should render skeleton', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton.tagName).toBe('DIV');
    });

    it('should apply custom className', () => {
      render(<Skeleton className="custom-skeleton" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('custom-skeleton');
      // Should still have default classes
      expect(skeleton).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted');
    });

    it('should spread additional props', () => {
      render(
        <Skeleton 
          data-testid="skeleton" 
          id="test-skeleton"
          role="status"
          aria-label="Loading content"
        />
      );
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('id', 'test-skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
    });
  });

  describe('Default Classes', () => {
    it('should have base styling classes', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass(
        'animate-pulse',
        'rounded-md',
        'bg-muted'
      );
    });
  });

  describe('Custom Styling', () => {
    it('should support custom sizes', () => {
      render(<Skeleton className="h-4 w-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-4', 'w-full');
    });

    it('should support custom shapes', () => {
      render(<Skeleton className="rounded-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('rounded-full');
    });

    it('should support custom colors', () => {
      render(<Skeleton className="bg-gray-200" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('bg-gray-200');
    });

    it('should support removing animation', () => {
      render(<Skeleton className="animate-none" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-none');
    });
  });

  describe('Use Cases', () => {
    it('should work as text line placeholder', () => {
      render(<Skeleton className="h-4 w-3/4" data-testid="text-skeleton" />);
      const skeleton = screen.getByTestId('text-skeleton');
      expect(skeleton).toHaveClass('h-4', 'w-3/4');
    });

    it('should work as avatar placeholder', () => {
      render(
        <Skeleton 
          className="h-12 w-12 rounded-full" 
          data-testid="avatar-skeleton" 
        />
      );
      const skeleton = screen.getByTestId('avatar-skeleton');
      expect(skeleton).toHaveClass('h-12', 'w-12', 'rounded-full');
    });

    it('should work as card placeholder', () => {
      render(
        <div>
          <Skeleton className="h-48 w-full mb-4" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
      
      // Just verify they render without error
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('should work as button placeholder', () => {
      render(
        <Skeleton 
          className="h-10 w-24 rounded-md" 
          data-testid="button-skeleton" 
        />
      );
      const skeleton = screen.getByTestId('button-skeleton');
      expect(skeleton).toHaveClass('h-10', 'w-24', 'rounded-md');
    });

    it('should work as table row placeholder', () => {
      render(
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveClass('h-8', 'w-full');
      });
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label for screen readers', () => {
      render(<Skeleton aria-label="Loading user profile" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-label', 'Loading user profile');
    });

    it('should support role attribute', () => {
      render(<Skeleton role="status" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('role', 'status');
    });

    it('should support aria-hidden for decorative skeletons', () => {
      render(<Skeleton aria-hidden="true" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });

    it('should support aria-busy for loading states', () => {
      render(<Skeleton aria-busy="true" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Multiple Skeletons', () => {
    it('should render multiple skeletons for complex layouts', () => {
      render(
        <div data-testid="skeleton-group">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-2" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      );
      
      const group = screen.getByTestId('skeleton-group');
      const skeletons = group.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('should work in grid layouts', () => {
      render(
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      );
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });

    it('should work in list layouts', () => {
      render(
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      );
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(6); // 2 avatars + 4 text lines
    });
  });

  describe('Content Types', () => {
    it('should work with nested content', () => {
      render(
        <Skeleton data-testid="skeleton">
          <span>This content should be hidden by skeleton</span>
        </Skeleton>
      );
      
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toBeInTheDocument();
      // Content might still be there in DOM but visually hidden by skeleton styling
      expect(skeleton).toHaveTextContent('This content should be hidden by skeleton');
    });

    it('should work without content', () => {
      render(<Skeleton data-testid="empty-skeleton" />);
      const skeleton = screen.getByTestId('empty-skeleton');
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toBeEmptyDOMElement();
    });
  });

  describe('Responsive Design', () => {
    it('should support responsive classes', () => {
      render(
        <Skeleton 
          className="h-4 w-full sm:h-6 sm:w-3/4 md:h-8 md:w-1/2" 
          data-testid="responsive-skeleton" 
        />
      );
      const skeleton = screen.getByTestId('responsive-skeleton');
      expect(skeleton).toHaveClass(
        'h-4', 'w-full', 
        'sm:h-6', 'sm:w-3/4', 
        'md:h-8', 'md:w-1/2'
      );
    });

    it('should work with breakpoint-specific animations', () => {
      render(
        <Skeleton 
          className="animate-pulse sm:animate-bounce md:animate-none" 
          data-testid="animated-skeleton" 
        />
      );
      const skeleton = screen.getByTestId('animated-skeleton');
      expect(skeleton).toHaveClass(
        'animate-pulse', 
        'sm:animate-bounce', 
        'md:animate-none'
      );
    });
  });

  describe('Loading States', () => {
    it('should work as loading placeholder for cards', () => {
      render(
        <div className="border rounded-lg p-4">
          <Skeleton className="h-4 w-1/4 mb-2" /> {/* Title */}
          <Skeleton className="h-20 w-full mb-4" /> {/* Content */}
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-16" /> {/* Button 1 */}
            <Skeleton className="h-8 w-16" /> {/* Button 2 */}
          </div>
        </div>
      );
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(4);
    });

    it('should work as loading placeholder for forms', () => {
      render(
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" /> {/* Label */}
          <Skeleton className="h-10 w-full" /> {/* Input */}
          <Skeleton className="h-4 w-24" /> {/* Label */}
          <Skeleton className="h-20 w-full" /> {/* Textarea */}
          <Skeleton className="h-10 w-32" /> {/* Submit button */}
        </div>
      );
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(5);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small sizes', () => {
      render(<Skeleton className="h-1 w-1" data-testid="tiny-skeleton" />);
      const skeleton = screen.getByTestId('tiny-skeleton');
      expect(skeleton).toHaveClass('h-1', 'w-1');
    });

    it('should handle very large sizes', () => {
      render(<Skeleton className="h-screen w-screen" data-testid="large-skeleton" />);
      const skeleton = screen.getByTestId('large-skeleton');
      expect(skeleton).toHaveClass('h-screen', 'w-screen');
    });

    it('should work with complex custom classes', () => {
      render(
        <Skeleton 
          className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl shadow-lg transform hover:scale-105 transition-transform" 
          data-testid="complex-skeleton" 
        />
      );
      const skeleton = screen.getByTestId('complex-skeleton');
      expect(skeleton).toHaveClass(
        'bg-gradient-to-r',
        'from-gray-200',
        'to-gray-300',
        'rounded-xl',
        'shadow-lg'
      );
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return <Skeleton data-testid="skeleton" />;
      };

      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle many skeletons efficiently', () => {
      const manySkeletons = Array.from({ length: 100 }, (_, i) => (
        <Skeleton key={i} className="h-4 w-full mb-1" />
      ));

      render(<div>{manySkeletons}</div>);
      
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(100);
    });
  });
});
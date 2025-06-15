import React from 'react';
import { render, screen } from '@testing-library/react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

describe('Alert Components', () => {
  describe('Alert', () => {
    describe('Basic Rendering', () => {
      it('should render alert with content', () => {
        render(<Alert>Alert content</Alert>);
        expect(screen.getByText('Alert content')).toBeInTheDocument();
      });

      it('should have alert role', () => {
        render(<Alert data-testid="alert">Alert content</Alert>);
        const alert = screen.getByTestId('alert');
        expect(alert).toHaveAttribute('role', 'alert');
      });

      it('should render as div element', () => {
        render(<Alert data-testid="alert">Alert content</Alert>);
        const alert = screen.getByTestId('alert');
        expect(alert.tagName).toBe('DIV');
      });

      it('should forward ref correctly', () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<Alert ref={ref}>Alert content</Alert>);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });

      it('should apply custom className', () => {
        render(
          <Alert className="custom-alert" data-testid="alert">
            Alert
          </Alert>
        );
        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass('custom-alert');
        // Should still have default classes
        expect(alert).toHaveClass('relative', 'w-full', 'rounded-lg');
      });

      it('should spread additional props', () => {
        render(
          <Alert data-testid="alert" id="test-alert">
            Alert
          </Alert>
        );
        const alert = screen.getByTestId('alert');
        expect(alert).toHaveAttribute('id', 'test-alert');
      });
    });

    describe('Variants', () => {
      it('should render default variant', () => {
        render(<Alert data-testid="alert">Default Alert</Alert>);
        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass('bg-background', 'text-foreground');
      });

      it('should render destructive variant', () => {
        render(
          <Alert variant="destructive" data-testid="alert">
            Destructive Alert
          </Alert>
        );
        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass('border-destructive/50', 'text-destructive');
      });
    });

    describe('Default Classes', () => {
      it('should have base styling classes', () => {
        render(<Alert data-testid="alert">Styled Alert</Alert>);
        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass(
          'relative',
          'w-full',
          'rounded-lg',
          'border',
          'p-4'
        );
      });

      it('should have SVG positioning classes', () => {
        render(<Alert data-testid="alert">Alert with icon</Alert>);
        const alert = screen.getByTestId('alert');
        expect(alert).toHaveClass(
          '[&>svg]:absolute',
          '[&>svg]:left-4',
          '[&>svg]:top-4'
        );
      });
    });
  });

  describe('AlertTitle', () => {
    describe('Basic Rendering', () => {
      it('should render title with text', () => {
        render(<AlertTitle>Alert Title</AlertTitle>);
        expect(screen.getByText('Alert Title')).toBeInTheDocument();
      });

      it('should render as h5 element', () => {
        render(<AlertTitle data-testid="alert-title">Title</AlertTitle>);
        const title = screen.getByTestId('alert-title');
        expect(title.tagName).toBe('H5');
      });

      it('should forward ref correctly', () => {
        const ref = React.createRef<HTMLHeadingElement>();
        render(<AlertTitle ref={ref}>Title</AlertTitle>);
        expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      });

      it('should apply custom className', () => {
        render(
          <AlertTitle className="custom-title" data-testid="title">
            Title
          </AlertTitle>
        );
        const title = screen.getByTestId('title');
        expect(title).toHaveClass('custom-title');
        // Should still have default classes
        expect(title).toHaveClass('mb-1', 'font-medium');
      });

      it('should spread additional props', () => {
        render(
          <AlertTitle data-testid="title" id="test-title">
            Title
          </AlertTitle>
        );
        const title = screen.getByTestId('title');
        expect(title).toHaveAttribute('id', 'test-title');
      });
    });

    describe('Default Classes', () => {
      it('should have correct styling classes', () => {
        render(<AlertTitle data-testid="title">Styled Title</AlertTitle>);
        const title = screen.getByTestId('title');
        expect(title).toHaveClass(
          'mb-1',
          'font-medium',
          'leading-none',
          'tracking-tight'
        );
      });
    });
  });

  describe('AlertDescription', () => {
    describe('Basic Rendering', () => {
      it('should render description with text', () => {
        render(<AlertDescription>Alert description</AlertDescription>);
        expect(screen.getByText('Alert description')).toBeInTheDocument();
      });

      it('should render as div element', () => {
        render(
          <AlertDescription data-testid="description">
            Description
          </AlertDescription>
        );
        const description = screen.getByTestId('description');
        expect(description.tagName).toBe('DIV');
      });

      it('should forward ref correctly', () => {
        const ref = React.createRef<HTMLParagraphElement>();
        render(<AlertDescription ref={ref}>Description</AlertDescription>);
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
      });

      it('should apply custom className', () => {
        render(
          <AlertDescription className="custom-desc" data-testid="desc">
            Description
          </AlertDescription>
        );
        const description = screen.getByTestId('desc');
        expect(description).toHaveClass('custom-desc');
        // Should still have default classes
        expect(description).toHaveClass('text-sm');
      });

      it('should spread additional props', () => {
        render(
          <AlertDescription data-testid="desc" id="test-desc">
            Description
          </AlertDescription>
        );
        const description = screen.getByTestId('desc');
        expect(description).toHaveAttribute('id', 'test-desc');
      });
    });

    describe('Default Classes', () => {
      it('should have correct styling classes', () => {
        render(
          <AlertDescription data-testid="desc">
            Styled Description
          </AlertDescription>
        );
        const description = screen.getByTestId('desc');
        expect(description).toHaveClass('text-sm', '[&_p]:leading-relaxed');
      });
    });
  });

  describe('Complete Alert Structure', () => {
    it('should render complete alert with all components', () => {
      render(
        <Alert>
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            Your changes have been saved successfully.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(
        screen.getByText('Your changes have been saved successfully.')
      ).toBeInTheDocument();
    });

    it('should work with destructive variant and components', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Something went wrong. Please try again.
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('text-destructive');
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(
        screen.getByText('Something went wrong. Please try again.')
      ).toBeInTheDocument();
    });

    it('should support icons with proper spacing', () => {
      render(
        <Alert>
          <svg data-testid="alert-icon">
            <circle cx="12" cy="12" r="10" />
          </svg>
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>This is an informational message.</AlertDescription>
        </Alert>
      );

      expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
      expect(screen.getByText('Info')).toBeInTheDocument();
      expect(
        screen.getByText('This is an informational message.')
      ).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work as success message', () => {
      render(
        <Alert>
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your profile has been updated.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(
        screen.getByText('Your profile has been updated.')
      ).toBeInTheDocument();
    });

    it('should work as error message', () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to save changes. Please check your connection.
          </AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole('alert');
      expect(alert).toHaveClass('text-destructive');
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should work as warning message', () => {
      render(
        <Alert>
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>This action cannot be undone.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Warning')).toBeInTheDocument();
      expect(
        screen.getByText('This action cannot be undone.')
      ).toBeInTheDocument();
    });

    it('should work as info message', () => {
      render(
        <Alert>
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>
            New features are available in this update.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Information')).toBeInTheDocument();
      expect(
        screen.getByText('New features are available in this update.')
      ).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper alert role for screen readers', () => {
      render(<Alert>Important message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeInTheDocument();
    });

    it('should support aria-live attribute', () => {
      render(<Alert aria-live="polite">Live message</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });

    it('should support aria-describedby', () => {
      render(
        <>
          <Alert aria-describedby="extra-info">Alert message</Alert>
          <div id="extra-info">Additional context</div>
        </>
      );
      const alert = screen.getByRole('alert');
      expect(alert).toHaveAttribute('aria-describedby', 'extra-info');
    });

    it('should be visible to screen readers', () => {
      render(<Alert>Accessible alert</Alert>);
      const alert = screen.getByRole('alert');
      expect(alert).toBeVisible();
      expect(alert).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('Content Types', () => {
    it('should handle long descriptions', () => {
      const longText =
        'This is a very long alert description that contains multiple sentences and provides detailed information about the current state or action that the user needs to be aware of.';
      render(
        <Alert>
          <AlertDescription>{longText}</AlertDescription>
        </Alert>
      );
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('should handle React elements in content', () => {
      render(
        <Alert>
          <AlertTitle>
            <strong>Important</strong> Update
          </AlertTitle>
          <AlertDescription>
            Please review the <em>new terms</em> of service.
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText('Update')).toBeInTheDocument();
      expect(screen.getByText('new terms')).toBeInTheDocument();
    });

    it('should handle empty content gracefully', () => {
      render(<Alert data-testid="empty-alert"></Alert>);
      const alert = screen.getByTestId('empty-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toBeEmptyDOMElement();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined variant gracefully', () => {
      render(
        <Alert variant={undefined as any} data-testid="alert">
          Test
        </Alert>
      );
      const alert = screen.getByTestId('alert');
      // Should fall back to default variant
      expect(alert).toHaveClass('bg-background');
    });

    it('should work without title', () => {
      render(
        <Alert>
          <AlertDescription>Just a description without title</AlertDescription>
        </Alert>
      );
      expect(
        screen.getByText('Just a description without title')
      ).toBeInTheDocument();
    });

    it('should work without description', () => {
      render(
        <Alert>
          <AlertTitle>Just a title</AlertTitle>
        </Alert>
      );
      expect(screen.getByText('Just a title')).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      const specialText = 'Alert with special chars: @#$%^&*()';
      render(<Alert>{specialText}</Alert>);
      expect(screen.getByText(specialText)).toBeInTheDocument();
    });
  });
});

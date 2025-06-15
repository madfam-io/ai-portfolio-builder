import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input, inputVariants } from '@/components/ui/input';

describe('Input Component', () => {
  describe('Basic Rendering', () => {
    it('should render input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should apply custom className', () => {
      render(<Input className="custom-input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('custom-input');
    });

    it('should spread additional props', () => {
      render(<Input data-testid="input" id="test-input" autoComplete="off" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('id', 'test-input');
      expect(input).toHaveAttribute('autoComplete', 'off');
    });
  });

  describe('Input Types', () => {
    const inputTypes = ['text', 'email', 'password', 'number', 'tel', 'url'] as const;

    inputTypes.forEach(type => {
      it(`should render ${type} input type`, () => {
        render(<Input type={type} data-testid={`${type}-input`} />);
        const input = screen.getByTestId(`${type}-input`);
        expect(input).toHaveAttribute('type', type);
      });
    });
  });

  describe('Variants', () => {
    it('should render default variant', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-input');
    });

    it('should render error variant', () => {
      render(<Input variant="error" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-destructive');
    });

    it('should render success variant', () => {
      render(<Input variant="success" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-success');
    });
  });

  describe('Sizes', () => {
    it('should render default size', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('h-10', 'px-3', 'py-2');
    });

    it('should render small size', () => {
      render(<Input inputSize="sm" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('h-8', 'px-2', 'py-1', 'text-sm');
    });

    it('should render large size', () => {
      render(<Input inputSize="lg" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('h-12', 'px-4', 'py-3', 'text-base');
    });
  });

  describe('State Prop', () => {
    it('should apply error state styling', () => {
      render(<Input state="error" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-destructive');
    });

    it('should apply success state styling', () => {
      render(<Input state="success" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-success');
    });

    it('should override variant when state is provided', () => {
      render(<Input variant="success" state="error" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-destructive');
      expect(input).not.toHaveClass('border-success');
    });
  });

  describe('Error and Helper Text', () => {
    it('should display error message', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toHaveClass('text-destructive');
    });

    it('should display helper text', () => {
      render(<Input helperText="Enter your full name" />);
      expect(screen.getByText('Enter your full name')).toBeInTheDocument();
      expect(screen.getByText('Enter your full name')).toHaveClass('text-muted-foreground');
    });

    it('should prioritize error over helper text', () => {
      render(<Input error="Error message" helperText="Helper text" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });

    it('should not render message container when no error or helper text', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.nextSibling).toBeNull();
    });
  });

  describe('Left and Right Elements', () => {
    it('should render left element', () => {
      render(
        <Input
          leftElement={<span data-testid="left-icon">@</span>}
          data-testid="input"
        />
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('pl-10');
    });

    it('should render right element', () => {
      render(
        <Input
          rightElement={<span data-testid="right-icon">$</span>}
          data-testid="input"
        />
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('pr-10');
    });

    it('should render both left and right elements', () => {
      render(
        <Input
          leftElement={<span data-testid="left">@</span>}
          rightElement={<span data-testid="right">$</span>}
          data-testid="input"
        />
      );
      expect(screen.getByTestId('left')).toBeInTheDocument();
      expect(screen.getByTestId('right')).toBeInTheDocument();
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('pl-10', 'pr-10');
    });

    it('should position elements correctly', () => {
      render(
        <Input
          leftElement={<span data-testid="left">@</span>}
          rightElement={<span data-testid="right">$</span>}
        />
      );
      const leftElement = screen.getByTestId('left').parentElement;
      const rightElement = screen.getByTestId('right').parentElement;
      
      expect(leftElement).toHaveClass('absolute', 'left-3');
      expect(rightElement).toHaveClass('absolute', 'right-3');
    });

    it('should display helper text with elements', () => {
      render(
        <Input
          leftElement={<span>@</span>}
          helperText="Username"
        />
      );
      expect(screen.getByText('Username')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      
      await user.type(input, 'test');
      expect(input.value).toBe('');
    });
  });

  describe('Interactions', () => {
    it('should handle value changes', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} data-testid="input" />);
      
      const input = screen.getByTestId('input');
      await user.type(input, 'hello');
      
      expect(handleChange).toHaveBeenCalledTimes(5); // Once for each character
    });

    it('should handle focus and blur events', async () => {
      const user = userEvent.setup();
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      render(
        <Input 
          onFocus={handleFocus} 
          onBlur={handleBlur} 
          data-testid="input" 
        />
      );
      
      const input = screen.getByTestId('input');
      await user.click(input);
      expect(handleFocus).toHaveBeenCalledTimes(1);
      
      await user.tab();
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should support controlled input', async () => {
      const user = userEvent.setup();
      const ControlledInput = () => {
        const [value, setValue] = React.useState('');
        return (
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            data-testid="input"
          />
        );
      };

      render(<ControlledInput />);
      const input = screen.getByTestId('input') as HTMLInputElement;
      
      await user.type(input, 'controlled');
      expect(input.value).toBe('controlled');
    });

    it('should support uncontrolled input', async () => {
      const user = userEvent.setup();
      render(<Input defaultValue="default" data-testid="input" />);
      
      const input = screen.getByTestId('input') as HTMLInputElement;
      expect(input.value).toBe('default');
      
      await user.clear(input);
      await user.type(input, 'uncontrolled');
      expect(input.value).toBe('uncontrolled');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-label', () => {
      render(<Input aria-label="Username input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-label', 'Username input');
    });

    it('should support aria-describedby with helper text', () => {
      render(<Input helperText="Enter username" aria-describedby="help" />);
      const input = screen.getByRole('textbox');
      const helperText = screen.getByText('Enter username');
      expect(input).toHaveAttribute('aria-describedby');
      expect(helperText).toBeInTheDocument();
    });

    it('should support aria-invalid with error state', () => {
      render(<Input state="error" error="Invalid input" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveClass('border-destructive');
    });

    it('should support placeholder text', () => {
      render(<Input placeholder="Enter your name" />);
      expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
    });
  });

  describe('File Input', () => {
    it('should handle file input type', () => {
      render(<Input type="file" data-testid="file-input" />);
      const input = screen.getByTestId('file-input');
      expect(input).toHaveAttribute('type', 'file');
      expect(input).toHaveClass('file:border-0', 'file:bg-transparent');
    });
  });

  describe('inputVariants utility', () => {
    it('should generate correct classes for variants', () => {
      const defaultClasses = inputVariants();
      expect(defaultClasses).toMatch(/border-input/);
      
      const errorClasses = inputVariants({ variant: 'error' });
      expect(errorClasses).toMatch(/border-destructive/);
      
      const successClasses = inputVariants({ variant: 'success' });
      expect(successClasses).toMatch(/border-success/);
    });

    it('should generate correct classes for sizes', () => {
      const defaultSize = inputVariants({ inputSize: 'default' });
      expect(defaultSize).toMatch(/h-10/);
      
      const smallSize = inputVariants({ inputSize: 'sm' });
      expect(smallSize).toMatch(/h-8/);
      
      const largeSize = inputVariants({ inputSize: 'lg' });
      expect(largeSize).toMatch(/h-12/);
    });

    it('should combine variant props correctly', () => {
      const combined = inputVariants({ 
        variant: 'error', 
        inputSize: 'lg'
      });
      expect(combined).toMatch(/border-destructive/);
      expect(combined).toMatch(/h-12/);
    });
  });

  describe('CSS Classes', () => {
    it('should have focus ring classes', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toMatch(/focus-visible:ring-2/);
      expect(input.className).toMatch(/focus-visible:outline-none/);
    });

    it('should have transition classes', () => {
      render(<Input data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input.className).toMatch(/transition-colors/);
      expect(input.className).toMatch(/duration-200/);
    });
  });
});
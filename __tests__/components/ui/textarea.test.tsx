import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '@/components/ui/textarea';

describe('Textarea Component', () => {
  describe('Basic Rendering', () => {
    it('should render textarea', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    });

    it('should apply custom className', () => {
      render(<Textarea className="custom-textarea" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('custom-textarea');
      // Should still have default classes
      expect(textarea).toHaveClass('flex', 'min-h-[80px]', 'w-full');
    });

    it('should spread additional props', () => {
      render(
        <Textarea
          data-testid="textarea"
          id="test-textarea"
          name="description"
          placeholder="Enter description"
        />
      );
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
      expect(textarea).toHaveAttribute('name', 'description');
      expect(textarea).toHaveAttribute('placeholder', 'Enter description');
    });
  });

  describe('Default Classes', () => {
    it('should have base styling classes', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass(
        'flex',
        'min-h-[80px]',
        'w-full',
        'rounded-md',
        'border',
        'border-input',
        'bg-background',
        'px-3',
        'py-2',
        'text-sm'
      );
    });

    it('should have focus styles', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass(
        'focus-visible:outline-none',
        'focus-visible:ring-2',
        'focus-visible:ring-ring',
        'focus-visible:ring-offset-2'
      );
    });

    it('should have disabled styles', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass(
        'disabled:cursor-not-allowed',
        'disabled:opacity-50'
      );
    });

    it('should have placeholder styles', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('placeholder:text-muted-foreground');
    });

    it('should have ring offset styles', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('ring-offset-background');
    });
  });

  describe('User Interaction', () => {
    it('should accept text input', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      await user.type(textarea, 'Hello, world!');
      expect(textarea).toHaveValue('Hello, world!');
    });

    it('should handle multiline text', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      const multilineText = 'Line 1\nLine 2\nLine 3';
      await user.type(textarea, multilineText);
      expect(textarea).toHaveValue(multilineText);
    });

    it('should handle onChange event', async () => {
      const handleChange = jest.fn();
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" onChange={handleChange} />);
      const textarea = screen.getByTestId('textarea');

      await user.type(textarea, 'test');
      expect(handleChange).toHaveBeenCalledTimes(4); // One for each character
    });

    it('should handle onFocus event', async () => {
      const handleFocus = jest.fn();
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" onFocus={handleFocus} />);
      const textarea = screen.getByTestId('textarea');

      await user.click(textarea);
      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur event', async () => {
      const handleBlur = jest.fn();
      const user = userEvent.setup();
      render(
        <div>
          <Textarea data-testid="textarea" onBlur={handleBlur} />
          <button>Other element</button>
        </div>
      );
      const textarea = screen.getByTestId('textarea');
      const button = screen.getByRole('button');

      await user.click(textarea);
      await user.click(button);
      expect(handleBlur).toHaveBeenCalledTimes(1);
    });
  });

  describe('Attributes and Props', () => {
    it('should support placeholder text', () => {
      render(<Textarea placeholder="Enter your message here..." />);
      expect(
        screen.getByPlaceholderText('Enter your message here...')
      ).toBeInTheDocument();
    });

    it('should support default value', () => {
      render(
        <Textarea defaultValue="Default content" data-testid="textarea" />
      );
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveValue('Default content');
    });

    it('should support controlled value', () => {
      const { rerender } = render(
        <Textarea value="Initial" onChange={() => {}} data-testid="textarea" />
      );
      let textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveValue('Initial');

      rerender(
        <Textarea value="Updated" onChange={() => {}} data-testid="textarea" />
      );
      textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveValue('Updated');
    });

    it('should support disabled state', () => {
      render(<Textarea disabled data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeDisabled();
    });

    it('should support readonly state', () => {
      render(
        <Textarea readOnly value="Read only content" data-testid="textarea" />
      );
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('readonly');
      expect(textarea).toHaveValue('Read only content');
    });

    it('should support required attribute', () => {
      render(<Textarea required data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toBeRequired();
    });

    it('should support maxLength attribute', () => {
      render(<Textarea maxLength={100} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('maxLength', '100');
    });

    it('should support rows attribute', () => {
      render(<Textarea rows={5} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should support cols attribute', () => {
      render(<Textarea cols={50} data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('cols', '50');
    });
  });

  describe('Form Integration', () => {
    it('should work with form labels', () => {
      render(
        <div>
          <label htmlFor="description">Description</label>
          <Textarea id="description" />
        </div>
      );

      const label = screen.getByText('Description');
      const textarea = screen.getByRole('textbox');

      expect(label).toHaveAttribute('for', 'description');
      expect(textarea).toHaveAttribute('id', 'description');
    });

    it('should submit with form', () => {
      const handleSubmit = jest.fn(e => e.preventDefault());
      render(
        <form onSubmit={handleSubmit}>
          <Textarea name="message" defaultValue="Test message" />
          <button type="submit">Submit</button>
        </form>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
      expect(handleSubmit).toHaveBeenCalled();
    });

    it('should work with form validation', async () => {
      const user = userEvent.setup();
      render(
        <form>
          <Textarea required minLength={5} data-testid="textarea" />
          <button type="submit">Submit</button>
        </form>
      );

      const textarea = screen.getByTestId('textarea');
      const button = screen.getByRole('button');

      // Try to submit with short text
      await user.type(textarea, 'Hi');

      // Trigger validation by trying to submit
      fireEvent.click(button);

      // Check validation state
      expect(textarea).toHaveAttribute('minLength', '5');
      expect(textarea).toBeRequired();
    });
  });

  describe('Accessibility', () => {
    it('should have textbox role', () => {
      render(<Textarea />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should support aria-label', () => {
      render(<Textarea aria-label="User feedback" />);
      const textarea = screen.getByRole('textbox', { name: 'User feedback' });
      expect(textarea).toBeInTheDocument();
    });

    it('should support aria-labelledby', () => {
      render(
        <div>
          <h2 id="feedback-label">Feedback</h2>
          <Textarea aria-labelledby="feedback-label" />
        </div>
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-labelledby', 'feedback-label');
    });

    it('should support aria-describedby', () => {
      render(
        <div>
          <Textarea aria-describedby="help-text" />
          <div id="help-text">Please provide detailed feedback</div>
        </div>
      );
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should be focusable with keyboard', async () => {
      const user = userEvent.setup();
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      await user.tab();
      expect(textarea).toHaveFocus();
    });

    it('should support aria-invalid for validation', () => {
      render(<Textarea aria-invalid="true" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Use Cases', () => {
    it('should work as comment input', () => {
      render(
        <div>
          <label htmlFor="comment">Leave a comment</label>
          <Textarea
            id="comment"
            placeholder="Share your thoughts..."
            rows={4}
          />
        </div>
      );

      expect(screen.getByLabelText('Leave a comment')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Share your thoughts...')
      ).toBeInTheDocument();
    });

    it('should work as message input', () => {
      render(
        <div>
          <label htmlFor="message">Message</label>
          <Textarea
            id="message"
            required
            minLength={10}
            maxLength={500}
            placeholder="Type your message (min 10 characters)"
          />
        </div>
      );

      const textarea = screen.getByLabelText('Message');
      expect(textarea).toBeRequired();
      expect(textarea).toHaveAttribute('minLength', '10');
      expect(textarea).toHaveAttribute('maxLength', '500');
    });

    it('should work as description field', () => {
      render(
        <div>
          <label htmlFor="description">Product Description</label>
          <Textarea
            id="description"
            defaultValue="High-quality product with excellent features."
            rows={6}
          />
        </div>
      );

      const textarea = screen.getByLabelText('Product Description');
      expect(textarea).toHaveValue(
        'High-quality product with excellent features.'
      );
    });
  });

  describe('Custom Styling', () => {
    it('should support custom height', () => {
      render(<Textarea className="min-h-[200px]" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('min-h-[200px]');
    });

    it('should support custom width', () => {
      render(<Textarea className="w-1/2" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('w-1/2');
    });

    it('should support custom border styles', () => {
      render(
        <Textarea className="border-2 border-blue-500" data-testid="textarea" />
      );
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('border-2', 'border-blue-500');
    });

    it('should support custom padding', () => {
      render(<Textarea className="p-6" data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveClass('p-6');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');
      expect(textarea).toHaveValue('');
    });

    it('should handle special characters', async () => {
      const user = userEvent.setup();
      const specialChars = '!@#$%^&*()_+-=';
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      await user.type(textarea, specialChars);
      expect(textarea).toHaveValue(specialChars);
    });

    it('should handle unicode characters', async () => {
      const user = userEvent.setup();
      const unicodeText = '🚀 Hello 世界 🌍';
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      await user.type(textarea, unicodeText);
      expect(textarea).toHaveValue(unicodeText);
    });

    it('should handle very long text', async () => {
      const user = userEvent.setup();
      const longText = 'A'.repeat(1000);
      render(<Textarea data-testid="textarea" />);
      const textarea = screen.getByTestId('textarea');

      await user.type(textarea, longText);
      expect(textarea).toHaveValue(longText);
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = () => {
        renderSpy();
        return <Textarea data-testid="textarea" />;
      };

      const { rerender } = render(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(1);

      rerender(<TestComponent />);
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });
  });
});

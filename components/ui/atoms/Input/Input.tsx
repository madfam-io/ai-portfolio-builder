import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../utils/cn';

const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
  {
    variants: {
      variant: {
        default: '',
        filled:
          'bg-muted/50 border-transparent focus:bg-background focus:border-input',
        flushed:
          'rounded-none border-0 border-b px-0 focus:ring-0 focus:ring-offset-0',
        unstyled: 'border-0 focus:ring-0 focus:ring-offset-0',
      },
      inputSize: {
        sm: 'h-8 px-3 py-1 text-xs',
        md: 'h-10 px-3 py-2',
        lg: 'h-12 px-4 py-3 text-base',
      },
      state: {
        default: '',
        error: 'border-destructive focus-visible:ring-destructive',
        success: 'border-success focus-visible:ring-success',
        warning: 'border-warning focus-visible:ring-warning',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      state: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  /**
   * Icon or element to display on the left side of the input
   */
  leftElement?: React.ReactNode;
  /**
   * Icon or element to display on the right side of the input
   */
  rightElement?: React.ReactNode;
  /**
   * Whether the input should take up the full width of its container
   */
  fullWidth?: boolean;
  /**
   * Error message to display below the input
   */
  error?: string;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Whether to show a loading spinner
   */
  loading?: boolean;
}

/**
 * Input component with multiple variants and addons
 *
 * @example
 * ```tsx
 * <Input placeholder="Enter your name" />
 *
 * <Input
 *   variant="filled"
 *   leftElement={<Icon />}
 *   placeholder="Search..."
 * />
 *
 * <Input
 *   state="error"
 *   error="This field is required"
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      variant,
      inputSize,
      state,
      leftElement,
      rightElement,
      fullWidth = true,
      error,
      helperText,
      loading,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = state === 'error' || !!error;
    const inputState = hasError ? 'error' : state;
    const isDisabled = disabled || loading;

    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant, inputSize, state: inputState }),
          leftElement && 'pl-10',
          rightElement && 'pr-10',
          loading && 'pr-10',
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-invalid={hasError}
        aria-describedby={
          error || helperText
            ? `${props.id || props.name}-description`
            : undefined
        }
        {...props}
      />
    );

    if (!leftElement && !rightElement && !loading) {
      return (
        <div className={cn('w-full', !fullWidth && 'w-auto')}>
          {inputElement}
          {(error || helperText) && (
            <p
              id={`${props.id || props.name}-description`}
              className={cn(
                'mt-2 text-xs',
                hasError ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {error || helperText}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className={cn('w-full', !fullWidth && 'w-auto')}>
        <div className="relative">
          {leftElement && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              >
                {leftElement}
              </span>
            </div>
          )}
          {inputElement}
          {(rightElement || loading) && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              {loading ? (
                <svg
                  className="h-4 w-4 animate-spin text-muted-foreground"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <span
                  className="h-4 w-4 text-muted-foreground"
                  aria-hidden="true"
                >
                  {rightElement}
                </span>
              )}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p
            id={`${props.id || props.name}-description`}
            className={cn(
              'mt-2 text-xs',
              hasError ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input, inputVariants };

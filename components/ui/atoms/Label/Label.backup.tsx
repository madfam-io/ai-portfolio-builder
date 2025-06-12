import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../utils/cn';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-destructive",
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement>,
    VariantProps<typeof labelVariants> {
  /**
   * Helper text to display below the label
   */
  helperText?: string;
  /**
   * Whether to show the label in an error state
   */
  error?: boolean;
  /**
   * Whether the associated field is optional
   */
  optional?: boolean;
}

/**
 * Label component for form fields
 *
 * @example
 * ```tsx
 * <Label htmlFor="email" required>
 *   Email Address
 * </Label>
 *
 * <Label htmlFor="bio" optional helperText="Tell us about yourself">
 *   Bio
 * </Label>
 * ```
 */
const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      className,
      size,
      required,
      helperText,
      error,
      optional,
      children,
      ...props
    },
    ref
  ): React.ReactElement => {
    return (
      <div className="space-y-1">
        <label
          ref={ref}
          className={cn(
            labelVariants({ size, required }),
            error && 'text-destructive',
            className
          )}
          {...props}
        >
          {children}
          {optional && !required && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          )}
        </label>
        {helperText && (
          <p
            className={cn(
              'text-xs',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Label.displayName = 'Label';

export { Label, labelVariants };
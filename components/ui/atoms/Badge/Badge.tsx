import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border border-input',
        success: 'border-transparent bg-success text-success-foreground',
        warning: 'border-transparent bg-warning text-warning-foreground',
        info: 'border-transparent bg-info text-info-foreground',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      interactive: {
        true: 'cursor-pointer hover:opacity-80 active:opacity-90',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /**
   * Icon to display before the badge content
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display after the badge content
   */
  rightIcon?: React.ReactNode;
  /**
   * Whether the badge can be clicked
   */
  interactive?: boolean;
}

/**
 * Badge component for status indicators and labels
 *
 * @example
 * ```tsx
 * <Badge>New</Badge>
 *
 * <Badge variant="success" leftIcon={<CheckIcon />}>
 *   Published
 * </Badge>
 *
 * <Badge variant="outline" interactive onClick={handleClick}>
 *   Click me
 * </Badge>
 * ```
 */
const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ): React.ReactElement => {
    const Component = interactive && props.onClick ? 'button' : 'div';

    return (
      <Component
        ref={ref as any}
        className={cn(badgeVariants({ variant, size, interactive }), className)}
        {...(props as any)}
      >
        {leftIcon && (
          <span className="mr-1 h-3 w-3" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-1 h-3 w-3" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </Component>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge, badgeVariants };

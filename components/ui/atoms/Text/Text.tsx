import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../utils/cn';

const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive',
      success: 'text-success',
      warning: 'text-warning',
      info: 'text-info',
    },
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    leading: {
      none: 'leading-none',
      tight: 'leading-tight',
      snug: 'leading-snug',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose',
    },
    truncate: {
      true: 'truncate',
    },
    wrap: {
      true: 'whitespace-normal',
      false: 'whitespace-nowrap',
    },
  },
  defaultVariants: {
    variant: 'body',
    size: 'base',
    weight: 'normal',
    align: 'left',
    leading: 'normal',
  },
});

type TextElement =
  | 'p'
  | 'span'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  /**
   * The HTML element to render
   */
  as?: TextElement;
  /**
   * Whether to apply gradient styling to the text
   */
  gradient?: boolean;
}

/**
 * Text component with typography variants
 *
 * @example
 * ```tsx
 * <Text size="2xl" weight="bold">
 *   Heading Text
 * </Text>
 *
 * <Text variant="muted" size="sm">
 *   Secondary text content
 * </Text>
 *
 * <Text gradient as="h1" size="5xl" weight="extrabold">
 *   Gradient Heading
 * </Text>
 * ```
 */
const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      className,
      variant,
      size,
      weight,
      align,
      leading,
      truncate,
      wrap,
      gradient,
      as: Component = 'p',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as any}
        className={cn(
          textVariants({
            variant: gradient ? undefined : variant,
            size,
            weight,
            align,
            leading,
            truncate,
            wrap,
          }),
          gradient &&
            'bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';

export { Text, textVariants };

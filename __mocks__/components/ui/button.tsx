import React from 'react';

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
  }
>(({ children, variant, size, ...props }, ref) => (
  <button ref={ref} data-variant={variant} data-size={size} {...props}>
    {children}
  </button>
));

Button.displayName = 'Button';
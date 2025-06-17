import React from 'react';

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} data-testid="card" {...props}>
    {children}
  </div>
));

Card.displayName = 'Card';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} data-testid="card-content" {...props}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

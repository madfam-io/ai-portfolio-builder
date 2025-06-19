import * as React from 'react';

export interface PopoverProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover = React.forwardRef<HTMLDivElement, PopoverProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
Popover.displayName = 'Popover';

export const PopoverTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
PopoverTrigger.displayName = 'PopoverTrigger';

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
PopoverContent.displayName = 'PopoverContent';

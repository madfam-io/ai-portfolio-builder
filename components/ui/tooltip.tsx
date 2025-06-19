import * as React from 'react';

export interface TooltipProps {
  children?: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const TooltipProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
TooltipProvider.displayName = 'TooltipProvider';

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
Tooltip.displayName = 'Tooltip';

export const TooltipTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
TooltipTrigger.displayName = 'TooltipTrigger';

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
TooltipContent.displayName = 'TooltipContent';

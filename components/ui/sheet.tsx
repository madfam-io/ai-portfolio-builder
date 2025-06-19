import * as React from 'react';

export interface SheetProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Sheet = React.forwardRef<HTMLDivElement, SheetProps>(
  ({ children, ...props }, ref) => {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  }
);
Sheet.displayName = 'Sheet';

export const SheetTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
SheetTrigger.displayName = 'SheetTrigger';

export const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
SheetContent.displayName = 'SheetContent';

export const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
SheetHeader.displayName = 'SheetHeader';

export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => {
  return (
    <h2 ref={ref} {...props}>
      {children}
    </h2>
  );
});
SheetTitle.displayName = 'SheetTitle';

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, ...props }, ref) => {
  return (
    <p ref={ref} {...props}>
      {children}
    </p>
  );
});
SheetDescription.displayName = 'SheetDescription';

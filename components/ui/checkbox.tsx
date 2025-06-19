import * as React from 'react';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={className}
        onChange={e => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

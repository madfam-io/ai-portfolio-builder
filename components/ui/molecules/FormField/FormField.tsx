import * as React from 'react';

import { Input, type InputProps } from '../../atoms/Input';
import { Label } from '../../atoms/Label';
import { cn } from '../../utils/cn';

export interface FormFieldProps extends InputProps {
  /**
   * The label text for the field
   */
  label: string;
  /**
   * The unique identifier for the field
   */
  name: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Whether the field is optional (shows optional text)
   */
  optional?: boolean;
  /**
   * Additional class name for the wrapper
   */
  wrapperClassName?: string;
}

/**
 * FormField molecule combining Label and Input atoms
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Email Address"
 *   name="email"
 *   type="email"
 *   required
 *   placeholder="john@example.com"
 * />
 *
 * <FormField
 *   label="Phone Number"
 *   name="phone"
 *   optional
 *   leftElement={<PhoneIcon />}
 * />
 * ```
 */
const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      name,
      required,
      optional,
      error,
      helperText,
      wrapperClassName,
      className,
      id,
      ...inputProps
    },
    ref
  ): React.ReactElement => {
    const fieldId = id || name;

    return (
      <div className={cn('space-y-2', wrapperClassName)}>
        <Label
          htmlFor={fieldId}
          required={required}
          optional={optional}
          error={!!error}
        >
          {label}
        </Label>
        <Input
          ref={ref}
          id={fieldId}
          name={name}
          error={error}
          helperText={helperText}
          state={error ? 'error' : undefined}
          className={className}
          aria-required={required}
          {...inputProps}
        />
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };

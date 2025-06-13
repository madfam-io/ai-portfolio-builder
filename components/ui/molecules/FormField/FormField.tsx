import * as React from 'react';
import { FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';

import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField as ShadcnFormField,
} from 'react-icons/fi';
import { Input, type InputProps } from '../../input';
import { Label, type LabelProps } from '../../label';

// Legacy FormField for direct use (without react-hook-form)
export interface LegacyFormFieldProps extends InputProps {
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
 * Legacy FormField molecule for direct use without react-hook-form
 *
 * @deprecated Use FormField with react-hook-form integration instead
 */
const LegacyFormField = React.forwardRef<
  HTMLInputElement,
  LegacyFormFieldProps
>(
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
          variant={error ? 'destructive' : 'default'}
        >
          {label}
          {optional && !required && (
            <span className="ml-1 text-xs text-muted-foreground">
              (optional)
            </span>
          )}
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

LegacyFormField.displayName = 'LegacyFormField';

// Enhanced FormField for react-hook-form integration
export interface EnhancedFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<InputProps, 'name'> {
  /**
   * The form control instance from react-hook-form
   */
  control: unknown; // Will be properly typed when used
  /**
   * The field name
   */
  name: TName;
  /**
   * The label text for the field
   */
  label: string;
  /**
   * Helper description text
   */
  description?: string;
  /**
   * Whether the field is required
   */
  required?: boolean;
  /**
   * Additional label props
   */
  labelProps?: Omit<LabelProps, 'children' | 'htmlFor'>;
  /**
   * Additional class name for the wrapper
   */
  wrapperClassName?: string;
}

/**
 * Enhanced FormField molecule with react-hook-form integration
 *
 * @example
 * ```tsx
 * // With react-hook-form
 * <FormField
 *   control={form.control}
 *   name="email"
 *   label="Email Address"
 *   description="We'll never share your email."
 *   required
 *   render={({ field }) => (
 *     <Input {...field} type="email" placeholder="john@example.com" />
 *   )}
 * />
 *
 * // Legacy usage (deprecated)
 * <LegacyFormField
 *   label="Email Address"
 *   name="email"
 *   type="email"
 *   required
 *   placeholder="john@example.com"
 * />
 * ```
 */
const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  required,
  labelProps,
  wrapperClassName,
  ...inputProps
}: EnhancedFormFieldProps<TFieldValues, TName>) => {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(wrapperClassName)}>
          <FormLabel required={required} {...labelProps}>
            {label}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              {...inputProps}
              error={fieldState.error?.message}
              state={fieldState.error ? 'error' : undefined}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormField.displayName = 'FormField';

export { FormField, LegacyFormField };
export type { EnhancedFormFieldProps as FormFieldProps };

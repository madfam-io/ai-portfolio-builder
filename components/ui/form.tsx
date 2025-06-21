/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import * as React from 'react';

export interface FormFieldContextValue {
  name: string;
  id: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
  null
);

export const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  return {
    invalid: false,
    isDirty: false,
    isTouched: false,
    error: null,
    name: fieldContext?.name,
    id: fieldContext?.id,
    formItemId: fieldContext?.formItemId,
    formDescriptionId: fieldContext?.formDescriptionId,
    formMessageId: fieldContext?.formMessageId,
  };
};

export const Form = React.forwardRef<
  HTMLFormElement,
  React.FormHTMLAttributes<HTMLFormElement>
>(({ children, ...props }, ref) => {
  return (
    <form ref={ref} {...props}>
      {children}
    </form>
  );
});
Form.displayName = 'Form';

export const FormField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { name?: string }
>(({ children, name = '', ...props }, ref) => {
  const id = React.useId();
  const formItemId = `${id}-form-item`;
  const formDescriptionId = `${id}-form-description`;
  const formMessageId = `${id}-form-message`;

  return (
    <FormFieldContext.Provider
      value={{
        name,
        id,
        formItemId,
        formDescriptionId,
        formMessageId,
      }}
    >
      <div ref={ref} {...props}>
        {children}
      </div>
    </FormFieldContext.Provider>
  );
});
FormField.displayName = 'FormField';

export const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
FormItem.displayName = 'FormItem';

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ children, ...props }, ref) => {
  return (
    <label ref={ref} {...props}>
      {children}
    </label>
  );
});
FormLabel.displayName = 'FormLabel';

export const FormControl = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => {
  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});
FormControl.displayName = 'FormControl';

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return (
    <p ref={ref} id={formDescriptionId} {...props}>
      {children}
    </p>
  );
});
FormDescription.displayName = 'FormDescription';

export const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, ...props }, ref) => {
  const { formMessageId } = useFormField();
  return (
    <p ref={ref} id={formMessageId} {...props}>
      {children}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

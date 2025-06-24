/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import * as React from 'react';
import { cn } from '../utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Error state for the input
   */
  error?: boolean;
  /**
   * Icon to display on the left side
   */
  leftIcon?: React.ReactNode;
  /**
   * Icon to display on the right side
   */
  rightIcon?: React.ReactNode;
  /**
   * Helper text to display below the input
   */
  helperText?: string;
  /**
   * Error message to display
   */
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      leftIcon,
      rightIcon,
      helperText,
      errorMessage,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = error || !!errorMessage;
    const showHelperText = helperText && !hasError;
    const showErrorMessage = hasError && errorMessage;

    const inputElement = (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          {
            'border-destructive focus-visible:ring-destructive': hasError,
            'pl-10': leftIcon,
            'pr-10': rightIcon,
          },
          className
        )}
        ref={ref}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={
          showHelperText
            ? `${props.id}-helper`
            : showErrorMessage
              ? `${props.id}-error`
              : undefined
        }
        {...props}
      />
    );

    if (!leftIcon && !rightIcon && !showHelperText && !showErrorMessage) {
      return inputElement;
    }

    return (
      <div className="w-full">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          {inputElement}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {showHelperText && (
          <p
            id={`${props.id}-helper`}
            className="mt-1 text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
        {showErrorMessage && (
          <p
            id={`${props.id}-error`}
            className="mt-1 text-sm text-destructive"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors duration-200",
  {
    variants: {
      variant: {
        default: "border-input",
        error: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
      },
      inputSize: {
        default: "h-10 px-3 py-2",
        sm: "h-8 px-2 py-1 text-sm",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  /**
   * Error message to display
   */
  error?: string
  /**
   * Helper text to display below the input
   */
  helperText?: string
  /**
   * Element to show on the left side of the input
   */
  leftElement?: React.ReactNode
  /**
   * Element to show on the right side of the input
   */
  rightElement?: React.ReactNode
  /**
   * Visual state of the input
   */
  state?: 'default' | 'error' | 'success'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    variant, 
    inputSize, 
    error, 
    helperText, 
    leftElement, 
    rightElement, 
    state,
    ...props 
  }, ref) => {
    const inputVariant = state === 'error' ? 'error' : state === 'success' ? 'success' : variant

    if (leftElement || rightElement) {
      return (
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftElement}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: inputVariant, inputSize }),
              leftElement && "pl-10",
              rightElement && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {rightElement}
            </div>
          )}
          {(error || helperText) && (
            <p className={cn(
              "mt-1 text-sm",
              error ? "text-destructive" : "text-muted-foreground"
            )}>
              {error || helperText}
            </p>
          )}
        </div>
      )
    }

    return (
      <div>
        <input
          type={type}
          className={cn(inputVariants({ variant: inputVariant, inputSize }), className)}
          ref={ref}
          {...props}
        />
        {(error || helperText) && (
          <p className={cn(
            "mt-1 text-sm",
            error ? "text-destructive" : "text-muted-foreground"
          )}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }

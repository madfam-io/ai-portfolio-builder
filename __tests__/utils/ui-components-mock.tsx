// Comprehensive mock for shadcn/ui components
import React from 'react';

// Button component mock
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: string;
    size?: string;
  }
>(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
));
Button.displayName = 'Button';

// Input component mock
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} {...props} />);
Input.displayName = 'Input';

// Label component mock
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ children, ...props }, ref) => (
  <label ref={ref} {...props}>
    {children}
  </label>
));
Label.displayName = 'Label';

// Textarea component mock
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>((props, ref) => <textarea ref={ref} {...props} />);
Textarea.displayName = 'Textarea';

// Card components mock
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
CardHeader.displayName = 'CardHeader';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
CardFooter.displayName = 'CardFooter';

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => (
  <h3 ref={ref} {...props}>
    {children}
  </h3>
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, ...props }, ref) => (
  <p ref={ref} {...props}>
    {children}
  </p>
));
CardDescription.displayName = 'CardDescription';

// Select components mock
export const Select = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
));
SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
SelectItem.displayName = 'SelectItem';

export const SelectValue = (props: any) => <span {...props} />;

// Dialog components mock
export const Dialog = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const DialogTrigger = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const DialogFooter = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => (
  <h2 ref={ref} {...props}>
    {children}
  </h2>
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, ...props }, ref) => (
  <p ref={ref} {...props}>
    {children}
  </p>
));
DialogDescription.displayName = 'DialogDescription';

// Form components mock
export const Form = ({ children, ...props }: any) => (
  <form {...props}>{children}</form>
);

export const FormField = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const FormItem = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const FormLabel = ({ children, ...props }: any) => (
  <label {...props}>{children}</label>
);

export const FormControl = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const FormDescription = ({ children, ...props }: any) => (
  <p {...props}>{children}</p>
);

export const FormMessage = ({ children, ...props }: any) => (
  <p {...props}>{children}</p>
);

// Progress component mock
export const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ value = 0, ...props }, ref) => (
  <div ref={ref} role="progressbar" aria-valuenow={value} {...props}>
    <div style={{ width: `${value}%` }} />
  </div>
));
Progress.displayName = 'Progress';

// Badge component mock
export const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: string }
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
Badge.displayName = 'Badge';

// Separator component mock
export const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />);
Separator.displayName = 'Separator';

// Tabs components mock
export const Tabs = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
TabsContent.displayName = 'TabsContent';

// Sheet components mock
export const Sheet = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const SheetTrigger = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
SheetContent.displayName = 'SheetContent';

export const SheetHeader = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => (
  <h2 ref={ref} {...props}>
    {children}
  </h2>
));
SheetTitle.displayName = 'SheetTitle';

export const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, ...props }, ref) => (
  <p ref={ref} {...props}>
    {children}
  </p>
));
SheetDescription.displayName = 'SheetDescription';

// Alert components mock
export const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: string }
>(({ children, ...props }, ref) => (
  <div ref={ref} role="alert" {...props}>
    {children}
  </div>
));
Alert.displayName = 'Alert';

export const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, ...props }, ref) => (
  <h5 ref={ref} {...props}>
    {children}
  </h5>
));
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
AlertDescription.displayName = 'AlertDescription';

// Checkbox component mock
export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} type="checkbox" {...props} />);
Checkbox.displayName = 'Checkbox';

// Switch component mock
export const Switch = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { checked?: boolean }
>(({ checked, ...props }, ref) => (
  <button ref={ref} role="switch" aria-checked={checked} {...props} />
));
Switch.displayName = 'Switch';

// ScrollArea component mock
export const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} style={{ overflow: 'auto' }} {...props}>
    {children}
  </div>
));
ScrollArea.displayName = 'ScrollArea';

// Avatar components mock
export const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
Avatar.displayName = 'Avatar';

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>((props, ref) => <img ref={ref} alt="" {...props} />);
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
AvatarFallback.displayName = 'AvatarFallback';

// Toast components mock
export const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
Toast.displayName = 'Toast';

export const ToastAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => (
  <button ref={ref} {...props}>
    {children}
  </button>
));
ToastAction.displayName = 'ToastAction';

// DropdownMenu components mock
export const DropdownMenu = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const DropdownMenuTrigger = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
DropdownMenuContent.displayName = 'DropdownMenuContent';

export const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>((props, ref) => <div ref={ref} {...props} />);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// Tooltip components mock
export const Tooltip = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const TooltipTrigger = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
TooltipContent.displayName = 'TooltipContent';

export const TooltipProvider = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

// Slider component mock
export const Slider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number[]; max?: number }
>(({ value = [0], max = 100, ...props }, ref) => (
  <div ref={ref} {...props}>
    <input type="range" value={value[0]} max={max} readOnly />
  </div>
));
Slider.displayName = 'Slider';

// RadioGroup components mock
export const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} role="radiogroup" {...props}>
    {children}
  </div>
));
RadioGroup.displayName = 'RadioGroup';

export const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => <input ref={ref} type="radio" {...props} />);
RadioGroupItem.displayName = 'RadioGroupItem';

// Popover components mock
export const Popover = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const PopoverTrigger = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
);

export const PopoverContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));
PopoverContent.displayName = 'PopoverContent';

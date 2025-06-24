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

/**
 * @madfam/ui-components
 *
 * Production-ready React UI components with Tailwind CSS, accessibility, and theming support
 *
 * @version 1.0.0
 * @license MIT
 * @author MADFAM Team <engineering@madfam.io>
 */

// Core utilities
export { cn } from './utils/cn';

// Base components
export { Button, buttonVariants } from './components/button';
export type { ButtonProps } from './components/button';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/card';

export { Input } from './components/input';
export type { InputProps } from './components/input';

export { Badge, badgeVariants } from './components/badge';
export type { BadgeProps } from './components/badge';

// Re-export commonly used types
export type { VariantProps } from 'class-variance-authority';

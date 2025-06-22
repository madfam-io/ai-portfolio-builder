/**
 * @license MIT
 * Copyright (c) 2025 MADFAM
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @madfam/experiments
 *
 * React components for experiments
 */

import React from 'react';
import { useExperiment, useFeatureFlag } from './hooks';

/**
 * Experiment component for A/B testing
 */
export interface ExperimentProps {
  experimentId: string;
  control: React.ReactNode;
  variations: Record<string, React.ReactNode>;
  fallback?: React.ReactNode;
  onExposure?: (variationId: string) => void;
}

export function Experiment({
  experimentId,
  control,
  variations,
  fallback = control,
  onExposure,
}: ExperimentProps) {
  const { variation, loading, error } = useExperiment(experimentId);

  React.useEffect(() => {
    if (variation && onExposure) {
      onExposure(variation.id);
    }
  }, [variation, onExposure]);

  if (loading) {
    return <>{fallback}</>;
  }

  if (error || !variation) {
    return <>{control}</>;
  }

  // Return control if marked as control
  if (variation.isControl) {
    return <>{control}</>;
  }

  // Return specific variation if exists
  const variationContent = variations[variation.id];
  if (variationContent) {
    return <>{variationContent}</>;
  }

  // Fallback to control
  return <>{control}</>;
}

/**
 * Feature flag component
 */
export interface FeatureFlagProps {
  flag: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  invert?: boolean;
}

export function FeatureFlag({
  flag,
  fallback = null,
  children,
  invert = false,
}: FeatureFlagProps) {
  const { enabled, loading } = useFeatureFlag(flag);

  if (loading) {
    return <>{fallback}</>;
  }

  const shouldRender = invert ? !enabled : enabled;

  return <>{shouldRender ? children : fallback}</>;
}

/**
 * Feature switch component for multiple states
 */
export interface FeatureSwitchProps {
  flag: string;
  cases: Record<string, React.ReactNode>;
  default?: React.ReactNode;
}

export function FeatureSwitch({
  flag,
  cases,
  default: defaultCase = null,
}: FeatureSwitchProps) {
  const { value, loading } = useFeatureFlag(flag);

  if (loading) {
    return <>{defaultCase}</>;
  }

  const stringValue = String(value);
  const caseContent = cases[stringValue];

  return <>{caseContent !== undefined ? caseContent : defaultCase}</>;
}

/**
 * Experiment variant component
 */
export interface VariantProps {
  experimentId: string;
  variantId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Variant({
  experimentId,
  variantId,
  children,
  fallback = null,
}: VariantProps) {
  const { variation } = useExperiment(experimentId);

  if (!variation || variation.id !== variantId) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * When component for conditional rendering
 */
export interface WhenProps {
  flag: string;
  is?: unknown;
  not?: unknown;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function When({ flag, is, not, children, fallback = null }: WhenProps) {
  const { value } = useFeatureFlag(flag);

  let shouldRender = false;

  if (is !== undefined) {
    shouldRender = value === is;
  } else if (not !== undefined) {
    shouldRender = value !== not;
  } else {
    shouldRender = Boolean(value);
  }

  return <>{shouldRender ? children : fallback}</>;
}

/**
 * Unless component (inverse of When)
 */
export interface UnlessProps extends Omit<WhenProps, 'is' | 'not'> {
  is?: unknown;
}

export function Unless({ flag, is, children, fallback = null }: UnlessProps) {
  const { value } = useFeatureFlag(flag);

  const shouldRender = is !== undefined ? value !== is : !Boolean(value);

  return <>{shouldRender ? children : fallback}</>;
}

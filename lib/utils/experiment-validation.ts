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

import type { VariantConfig } from '@/components/admin/experiments/create/VariantConfiguration';

export interface ExperimentValidationErrors {
  name?: string;
  variants?: string;
  traffic?: string;
  control?: string;
  _submit?: string;
  [key: string]: string | undefined;
}

export function validateExperimentForm(
  experimentName: string,
  variants: VariantConfig[]
): ExperimentValidationErrors {
  const errors: ExperimentValidationErrors = {};

  // Validate experiment name
  if (!experimentName.trim()) {
    errors.name = 'Experiment name is required';
  }

  // Validate variants
  if (variants.length < 2) {
    errors.variants = 'At least 2 variants are required';
  }

  // Validate traffic allocation
  const totalTraffic = variants.reduce(
    (sum, v) => sum + v.trafficPercentage,
    0
  );
  if (totalTraffic !== 100) {
    errors.traffic = `Traffic allocation must equal 100% (currently ${totalTraffic}%)`;
  }

  // Validate control variant
  const hasControl = variants.some(v => v.isControl);
  if (!hasControl) {
    errors.control = 'One variant must be marked as control';
  }

  return errors;
}

export function getRemainingTrafficPercentage(
  variants: VariantConfig[]
): number {
  const total = variants.reduce((sum, v) => sum + v.trafficPercentage, 0);
  return 100 - total;
}

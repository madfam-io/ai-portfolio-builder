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

import { consultantSampleData } from './consultant';
import { designerSampleData } from './designer';
import { developerSampleData } from './developer';
import { businessSampleData } from './business';
import { creativeSampleData } from './creative';
import { educatorSampleData } from './educator';
import { marketerSampleData } from './marketer';
import { freelancerSampleData } from './freelancer';

import type { SampleDataConfig } from './types';
import type { TemplateType } from '@/types/portfolio';

// Export all sample data configurations
export const SAMPLE_DATA_BY_TEMPLATE: Record<TemplateType, SampleDataConfig> = {
  developer: developerSampleData,
  designer: designerSampleData,
  consultant: consultantSampleData,
  business: businessSampleData,
  creative: creativeSampleData,
  minimal: freelancerSampleData,
  educator: educatorSampleData,
  modern: marketerSampleData,
};

// Export individual sample data for direct usage
export {
  developerSampleData,
  designerSampleData,
  consultantSampleData,
  businessSampleData,
  creativeSampleData,
  educatorSampleData,
  marketerSampleData,
  freelancerSampleData,
};

export type { SampleDataConfig };

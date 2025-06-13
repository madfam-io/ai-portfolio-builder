import { consultantSampleData } from './consultant';
import { designerSampleData } from './designer';
import { developerSampleData } from './developer';
import type { SampleDataConfig } from './types';

import type { TemplateType } from '@/types/portfolio';

// Export all sample data configurations
export const SAMPLE_DATA_BY_TEMPLATE: Record<TemplateType, SampleDataConfig> = {
  developer: developerSampleData,
  designer: designerSampleData,
  consultant: consultantSampleData,
  // TODO: Add remaining templates
  business: consultantSampleData, // Temporarily use consultant data
  creative: designerSampleData, // Temporarily use designer data
  minimal: developerSampleData, // Temporarily use developer data
  educator: consultantSampleData, // Temporarily use consultant data
  modern: developerSampleData, // Temporarily use developer data
};

export type { SampleDataConfig };
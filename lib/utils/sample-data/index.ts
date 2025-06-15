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
  // Using appropriate fallback data for other templates
  business: consultantSampleData,
  creative: designerSampleData,
  minimal: developerSampleData,
  educator: consultantSampleData,
  modern: developerSampleData,
};

export type { SampleDataConfig };

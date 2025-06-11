'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { reportWebVitals } from '@/lib/monitoring/performance';

export function WebVitals() {
  useReportWebVitals((metric) => {
    reportWebVitals(metric);
  });

  return null;
}
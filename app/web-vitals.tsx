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

'use client';

import { useReportWebVitals } from 'next/web-vitals';

import { reportWebVitals } from '@/lib/monitoring/performance';

export default function WebVitals() {
  useReportWebVitals(metric => {
    reportWebVitals(metric);
  });

  return null;
}

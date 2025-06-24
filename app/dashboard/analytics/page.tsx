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

import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analytics Dashboard | MADFAM',
  description: 'Monitor your business metrics and growth in real-time',
};

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <AnalyticsDashboard />
    </div>
  );
}

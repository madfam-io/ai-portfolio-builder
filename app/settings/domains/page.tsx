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

import { Metadata } from 'next';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { DomainSettingsContent } from './components/DomainSettingsContent';

export const metadata: Metadata = {
  title: 'Custom Domain Settings | PRISMA',
  description: 'Connect your custom domain to your portfolio',
};

export default function DomainSettingsPage() {
  return (
    <ProtectedRoute>
      <DomainSettingsContent />
    </ProtectedRoute>
  );
}

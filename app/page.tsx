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

import React from 'react';

import DynamicLandingPage from '@/components/landing/DynamicLandingPage';
import { LanguageProvider } from '@/lib/i18n/refactored-context';

export default function HomePage(): React.ReactElement {
  return (
    <LanguageProvider>
      <DynamicLandingPage />
    </LanguageProvider>
  );
}

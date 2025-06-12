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

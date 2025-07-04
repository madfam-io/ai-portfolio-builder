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

import Link from 'next/link';
import React from 'react';

import { useLanguage } from '@/lib/i18n/refactored-context';

export default function CTA(): React.ReactElement {
  const { t } = useLanguage();
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">{t.ctaTitle}</h2>
        <p className="text-xl mb-8 opacity-90">{t.ctaSubtitle}</p>
        <Link
          href="/dashboard"
          className="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition transform hover:-translate-y-1 hover:shadow-lg"
        >
          {t.ctaButton}
        </Link>
        <p className="mt-4 opacity-80">{t.ctaFooter}</p>
      </div>
    </section>
  );
}

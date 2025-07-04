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

import {
  Globe,
  Link,
  Palette,
  Smartphone,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

import { useLanguage } from '@/lib/i18n/refactored-context';

export default function Features(): React.ReactElement {
  const { t } = useLanguage();
  return (
    <section
      id="features"
      className="py-24 px-6 bg-white dark:bg-gray-900"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-20">
          <h2
            id="features-heading"
            className="text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            <span>{t.featuresTitle}</span>{' '}
            <span className="gradient-text">{t.standOut}</span>
          </h2>
          <p className="text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto font-medium">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          <div className="card-feature group">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.aiContentTitle}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.aiContentDesc}
            </p>
          </div>

          <div className="card-feature group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Link className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.oneClickTitle}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.oneClickDesc}
            </p>
          </div>

          <div className="card-feature group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Palette className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.templatesTitle}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.templatesDesc}
            </p>
          </div>

          <div className="card-feature group">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Globe className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.customDomainTitle}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.customDomainDesc}
            </p>
          </div>

          <div className="card-feature group">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.publishTitle}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.analyticsDesc}
            </p>
          </div>

          <div className="card-feature group">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
              <Smartphone className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.mobileTitle}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {t.mobileDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

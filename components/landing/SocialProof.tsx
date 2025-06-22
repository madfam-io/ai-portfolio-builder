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

import { Apple, Chrome, Facebook, Package, Square, Star } from 'lucide-react';
import React from 'react';

import { useLanguage } from '@/lib/i18n/refactored-context';

export default function SocialProof(): React.ReactElement {
  const { t } = useLanguage();
  return (
    <section className="py-12 bg-gray-100 dark:bg-gray-800 transition-colors duration-300">
      <div className="container mx-auto px-6">
        {/* Statistics Row */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-purple-600">
                10,000+
              </span>
              <span className="text-gray-600 dark:text-gray-300">
                {t.joinProfessionals}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star key={star} className="text-yellow-400 text-lg" />
              ))}
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                {t.rating}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">✓</span>
              <span className="text-gray-600 dark:text-gray-300">
                {t.gdprCompliant}
              </span>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            {t.testimonialsTitle}
          </h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                &ldquo;{t.testimonial1}&rdquo;
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t.testimonial1Author}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className="text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 italic">
                &ldquo;{t.testimonial2}&rdquo;
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {t.testimonial2Author}
              </p>
            </div>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t.trustedBy}</p>
          <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <span>{t.gdprCompliant}</span>
            <span className="mx-2">•</span>
            <span>{t.dataPrivacy}</span>
            <span className="mx-2">•</span>
            <span>{t.madeInMexico}</span>
          </div>
        </div>

        {/* Company Logos */}
        <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-60">
          <Chrome className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
          <Square className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
          <Apple className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
          <Package className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
          <Facebook className="text-2xl sm:text-3xl text-gray-700 dark:text-gray-400" />
        </div>
      </div>
    </section>
  );
}

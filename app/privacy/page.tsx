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

'use client';

import React from 'react';

import BaseLayout from '@/components/layouts/BaseLayout';
import { useLanguage } from '@/lib/i18n/refactored-context';

export default function PrivacyPage(): React.ReactElement {
  const { t } = useLanguage();

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 _sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {t.privacyTitle}
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t.privacyLastUpdated}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.privacyInfoCollectTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.privacyInfoCollectText}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>{t.privacyInfoCollectItem1}</li>
                <li>{t.privacyInfoCollectItem2}</li>
                <li>{t.privacyInfoCollectItem3}</li>
                <li>{t.privacyInfoCollectItem4}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.privacyHowUseTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.privacyHowUseText}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>{t.privacyHowUseItem1}</li>
                <li>{t.privacyHowUseItem2}</li>
                <li>{t.privacyHowUseItem3}</li>
                <li>{t.privacyHowUseItem4}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.privacyDataProtectionTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.privacyDataProtectionText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.privacyYourRightsTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.privacyYourRightsText}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>{t.privacyYourRightsItem1}</li>
                <li>{t.privacyYourRightsItem2}</li>
                <li>{t.privacyYourRightsItem3}</li>
                <li>{t.privacyYourRightsItem4}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.privacyCookiesTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.privacyCookiesText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.privacyChangesTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.privacyChangesText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.privacyContactTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t.privacyContactText}
              </p>
              <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                <p>Email: privacy@madfam.io</p>
                <p>{t.privacyContactAddress}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

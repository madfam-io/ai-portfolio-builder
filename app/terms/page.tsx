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

import BaseLayout from '@/components/layouts/BaseLayout';
import { useLanguage } from '@/lib/i18n/refactored-context';

export default function TermsPage(): React.ReactElement {
  const { t } = useLanguage();

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 _sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            {t.termsPageTitle}
          </h1>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              {t.termsLastUpdated}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsAcceptanceTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.termsAcceptanceText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsUseLicenseTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.termsUseLicenseText}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>{t.termsUseLicenseItem1}</li>
                <li>{t.termsUseLicenseItem2}</li>
                <li>{t.termsUseLicenseItem3}</li>
                <li>{t.termsUseLicenseItem4}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsAccountTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.termsAccountText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsContentTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.termsContentText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsProhibitedTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.termsProhibitedText}
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>{t.termsProhibitedItem1}</li>
                <li>{t.termsProhibitedItem2}</li>
                <li>{t.termsProhibitedItem3}</li>
                <li>{t.termsProhibitedItem4}</li>
                <li>{t.termsProhibitedItem5}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsPaymentTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.termsPaymentText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsTerminationTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.termsTerminationText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsDisclaimerTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.termsDisclaimerText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsChangesTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t.termsChangesText}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {t.termsContactTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {t.termsContactText}
              </p>
              <div className="mt-4 space-y-2 text-gray-600 dark:text-gray-300">
                <p>Email: legal@madfam.io</p>
                <p>{t.termsContactAddress}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

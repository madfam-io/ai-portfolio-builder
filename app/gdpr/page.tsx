'use client';

import Link from 'next/link';
import React from 'react';
import {
  FaShieldAlt,
  FaUser,
  FaKey,
  FaTrash,
  FaDownload,
  FaEdit,
} from 'react-icons/fa';

import BaseLayout from '@/components/layouts/BaseLayout';
import { useLanguage } from '@/lib/i18n/refactored-context';

export default function GDPRPage(): React.ReactElement {
  const { t } = useLanguage();

  const rights = [
    {
      icon: FaUser,
      title: t.gdprRightToInfo,
      description: t.gdprRightToInfoDesc,
    },
    {
      icon: FaEdit,
      title: t.gdprRightToRect,
      description: t.gdprRightToRectDesc,
    },
    {
      icon: FaTrash,
      title: t.gdprRightToErase,
      description: t.gdprRightToEraseDesc,
    },
    {
      icon: FaDownload,
      title: t.gdprRightToPort,
      description: t.gdprRightToPortDesc,
    },
    {
      icon: FaShieldAlt,
      title: t.gdprRightToObject,
      description: t.gdprRightToObjectDesc,
    },
    {
      icon: FaKey,
      title: t.gdprRightToRestrict,
      description: t.gdprRightToRestrictDesc,
    },
  ];

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t.gdprPageTitle}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t.gdprSubtitle}
            </p>
          </div>

          {/* Quick Summary */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl mb-12">
            <h2 className="text-2xl font-bold mb-4">{t.gdprCommitment}</h2>
            <p className="text-lg opacity-90 mb-4">{t.gdprCommitmentDesc}</p>
            <Link
              href="/contact?gdpr=true"
              className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              {t.gdprContactDpo}
            </Link>
          </div>

          {/* Your Rights */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              {t.gdprYourRights}
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {rights.map((right, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg"
                >
                  <right.icon className="text-3xl text-purple-600 mb-4" />
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {right.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {right.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Data We Collect */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.gdprWhatDataTitle || 'What Data We Collect'}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {t.gdprAccountInfoTitle || 'Account Information'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.gdprAccountInfoDesc ||
                    'Name, email address, password (encrypted), and profile information you provide.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {t.gdprPortfolioDataTitle || 'Portfolio Data'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.gdprPortfolioDataDesc ||
                    'Content you create, upload, or generate using our platform including text, images, and project information.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {t.gdprUsageAnalyticsTitle || 'Usage Analytics'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.gdprUsageAnalyticsDesc ||
                    'Aggregated, anonymized data about how you use our platform to improve our services.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {t.gdprTechnicalDataTitle || 'Technical Data'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.gdprTechnicalDataDesc ||
                    'IP address, browser type, device information, and cookies for security and functionality.'}
                </p>
              </div>
            </div>
          </div>

          {/* Legal Basis */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              {t.gdprLegalBasisTitle || 'Legal Basis for Processing'}
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {t.gdprContractTitle || 'Contract Performance'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.gdprContractDesc ||
                    'Processing necessary to provide our portfolio creation services as outlined in our Terms of Service.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {t.gdprLegitimateTitle || 'Legitimate Interest'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.gdprLegitimateDesc ||
                    'Improving our services, security measures, and providing customer support.'}
                </p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {t.gdprConsentTitle || 'Consent'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.gdprConsentDesc ||
                    'Marketing communications, optional analytics, and third-party integrations you explicitly approve.'}
                </p>
              </div>
            </div>
          </div>

          {/* Exercise Your Rights */}
          <div className="text-center bg-gray-100 dark:bg-gray-800 p-8 rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.gdprExerciseTitle || 'Exercise Your Rights'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t.gdprExerciseDesc ||
                'To exercise any of your GDPR rights, please contact us. We will respond within 30 days and may require identity verification.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact?gdpr=true"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
              >
                {t.gdprSubmitRequest || 'Submit GDPR Request'}
              </Link>
              <Link
                href="/profile"
                className="border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900 transition"
              >
                {t.gdprManageData || 'Manage Data in Profile'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

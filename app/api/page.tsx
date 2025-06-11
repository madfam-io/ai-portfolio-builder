'use client';

import { useLanguage } from '@/lib/i18n/refactored-context';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FaCode, FaKey, FaBook, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';

export default function APIPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              PRISMA <span className="gradient-text">API</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t.apiPageSubtitle}
            </p>
          </div>

          {/* API Features */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <FaCode className="text-3xl text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {t.apiRestfulTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.apiRestfulDesc}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <FaKey className="text-3xl text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {t.apiAuthTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.apiAuthDesc}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <FaBook className="text-3xl text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {t.apiDocsTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.apiDocsDesc}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
              <FaShieldAlt className="text-3xl text-red-600 mb-4" />
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {t.apiEnterpriseTitle}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t.apiEnterpriseDesc}
              </p>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t.apiComingSoon}</h2>
            <p className="text-xl mb-6 opacity-90">{t.apiWaitlistDesc}</p>
            <Link
              href="/auth/signup?plan=pro&api=true"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
            >
              {t.apiJoinWaitlist}
            </Link>
          </div>

          {/* Use Cases */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              {t.apiPerfectFor}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                  {t.apiHrPlatforms}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.apiHrDesc}
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                  {t.apiFreelanceMarketplaces}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.apiFreelanceDesc}
                </p>
              </div>
              <div className="text-center">
                <h3 className="font-bold mb-2 text-gray-900 dark:text-white">
                  {t.apiEducationalInstitutions}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {t.apiEducationalDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

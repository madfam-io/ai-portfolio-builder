'use client';

import { FaPlay, FaCheckCircle, FaUsers, FaStar } from 'react-icons/fa';
import { useLanguage } from '@/lib/i18n/minimal-context';
import Link from 'next/link';

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section className="pt-24 pb-20 px-6">
      <div className="container mx-auto text-center">
        <div className="inline-flex items-center bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
          <FaStar className="mr-2" />
          <span>Powered by GPT-4 & Claude AI</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          <span>{t.heroTitle}</span> <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {t.heroTitle2}
          </span>
          <br className="hidden sm:block" />
          <span>{t.heroTitle3}</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto px-4">
          {t.heroDesc}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 px-4">
          {/* Primary CTA Button */}
          <Link
            href="/about"
            className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-base sm:text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 min-h-[56px] interactive-enhanced block text-center"
            aria-label="Learn more about us"
          >
            <div className="relative z-10 flex items-center justify-center">
              <FaPlay className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200" />
              <span>{t.watchDemo}</span>
            </div>
            {/* Animated background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </Link>

          {/* Secondary CTA Button */}
          <Link
            href="/dashboard"
            className="group relative border-2 border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 px-8 sm:px-10 py-4 sm:py-5 rounded-xl text-base sm:text-lg font-semibold hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 min-h-[56px] interactive-enhanced block text-center"
            aria-label="Start free trial"
          >
            <div className="relative z-10 flex items-center justify-center">
              <span>{t.startFreeTrial}</span>
            </div>
            {/* Background fill animation */}
            <div className="absolute inset-0 bg-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-500 mr-2" />
            <span className="text-sm sm:text-base">{t.noCreditCard}</span>
          </div>
          <div className="flex items-center">
            <FaUsers className="text-blue-500 mr-2" />
            <span className="text-sm sm:text-base">{t.joinProfessionals}</span>
          </div>
          <div className="flex items-center">
            <FaStar className="text-yellow-500 mr-2" />
            <span className="text-sm sm:text-base">{t.rating}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

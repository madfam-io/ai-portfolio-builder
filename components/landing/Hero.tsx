'use client';

import Link from 'next/link';
import React from 'react';
import { FaPlay, FaCheckCircle, FaUsers, FaStar } from 'react-icons/fa';

import { useLanguage } from '@/lib/i18n/refactored-context';

export default function Hero(): React.ReactElement {
  const { t } = useLanguage();
  return (
    <section className="pt-32 pb-32 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto text-center max-w-7xl">
        <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300 px-6 py-3 rounded-full text-base font-semibold mb-10 shadow-lg">
          <FaStar className="mr-3 text-yellow-500" />
          <span>{t.poweredByAi}</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
          <span className="block">{t.heroTitle}</span>
          <span className="block gradient-text font-black">{t.heroTitle2}</span>
          <span className="block">{t.heroTitle3}</span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto px-4 font-medium leading-relaxed">
          {t.heroDesc}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 px-4">
          {/* Primary CTA Button */}
          <Link
            href="/dashboard"
            className="btn-primary group text-xl px-12 py-5 min-h-[64px] text-center inline-flex items-center justify-center"
            aria-label={t.startFreeTrial}
          >
            <FaPlay className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200" />
            <span>{t.startFreeTrial}</span>
            {/* Animated background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </Link>

          {/* Secondary CTA Button */}
          <Link
            href="/demo"
            className="btn-secondary group text-xl px-12 py-5 min-h-[64px] text-center inline-flex items-center justify-center relative"
            aria-label={t.watchDemo}
          >
            <span className="relative z-10">{t.watchDemo}</span>
            {/* Background fill animation */}
            <div className="absolute inset-0 bg-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-gray-600 dark:text-gray-300">
          <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-md">
            <FaCheckCircle className="text-green-500 mr-3 text-lg" />
            <span className="text-base font-medium">{t.noCreditCard}</span>
          </div>
          <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-md">
            <FaUsers className="text-blue-500 mr-3 text-lg" />
            <span className="text-base font-medium">{t.joinProfessionals}</span>
          </div>
          <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-md">
            <FaStar className="text-yellow-500 mr-3 text-lg" />
            <span className="text-base font-medium">{t.rating}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

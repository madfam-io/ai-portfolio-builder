/**
 * @fileoverview Hero component variants for A/B testing
 *
 * Different hero section implementations that can be selected
 * through the experiment system.
 */

'use client';

import Link from 'next/link';
import React from 'react';
import {
  FaPlay,
  FaCheckCircle,
  FaUsers,
  FaStar,
  FaRocket,
  FaArrowRight,
} from 'react-icons/fa';

import { useLanguage } from '@/lib/i18n/refactored-context';
import { useExperimentTracking } from '@/lib/services/feature-flags/use-experiment';

import type { HeroProps } from '@/types/experiments';

/**
 * Default Hero variant (current implementation)
 */
export function HeroDefault(props: HeroProps): React.ReactElement {
  const { t } = useLanguage();
  const { trackClick } = useExperimentTracking();

  const handleCTAClick = (ctaType: string) => {
    trackClick(`hero_cta_${ctaType}`, { variant: 'default' });
  };

  return (
    <section className="pt-32 pb-32 px-6 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto text-center max-w-7xl">
        <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 text-purple-700 dark:text-purple-300 px-6 py-3 rounded-full text-base font-semibold mb-10 shadow-lg">
          <FaStar className="mr-3 text-yellow-500" />
          <span>{props.title || t.poweredByAi}</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
          <span className="block">{t.heroTitle}</span>
          <span className="block gradient-text font-black">{t.heroTitle2}</span>
          <span className="block">{t.heroTitle3}</span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto px-4 font-medium leading-relaxed">
          {props.subtitle || t.heroDesc}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 px-4">
          <Link
            href="/dashboard"
            className="btn-primary group text-xl px-12 py-5 min-h-[64px] text-center inline-flex items-center justify-center"
            aria-label={props.ctaText || t.startFreeTrial}
            onClick={() => handleCTAClick('primary')}
          >
            <FaPlay className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200" />
            <span>{props.ctaText || t.startFreeTrial}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </Link>

          <Link
            href="/demo"
            className="btn-secondary group text-xl px-12 py-5 min-h-[64px] text-center inline-flex items-center justify-center relative"
            aria-label={t.watchDemo}
            onClick={() => handleCTAClick('secondary')}
          >
            <span className="relative z-10">{t.watchDemo}</span>
            <div className="absolute inset-0 bg-purple-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-xl"></div>
          </Link>
        </div>

        {props.showStats !== false && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-gray-600 dark:text-gray-300">
            <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-md">
              <FaCheckCircle className="text-green-500 mr-3 text-lg" />
              <span className="text-base font-medium">{t.noCreditCard}</span>
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-md">
              <FaUsers className="text-blue-500 mr-3 text-lg" />
              <span className="text-base font-medium">
                {t.joinProfessionals}
              </span>
            </div>
            <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-md">
              <FaStar className="text-yellow-500 mr-3 text-lg" />
              <span className="text-base font-medium">{t.rating}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/**
 * Minimal Hero variant - Cleaner, more focused design
 */
export function HeroMinimal(props: HeroProps): React.ReactElement {
  const { t } = useLanguage();
  const { trackClick } = useExperimentTracking();

  const handleCTAClick = () => {
    trackClick('hero_cta_minimal', { variant: 'minimal' });
  };

  return (
    <section className="pt-40 pb-40 px-6 bg-white dark:bg-gray-900">
      <div className="container mx-auto text-center max-w-5xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          {props.title || (
            <>
              <span className="block">{t.heroTitle}</span>
              <span className="block text-purple-600 dark:text-purple-400">
                {t.heroTitle2}
              </span>
            </>
          )}
        </h1>

        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto px-4 leading-relaxed">
          {props.subtitle || t.heroDesc}
        </p>

        <Link
          href="/dashboard"
          className="inline-flex items-center px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 text-lg"
          aria-label={props.ctaText || t.startFreeTrial}
          onClick={handleCTAClick}
        >
          {props.ctaText || t.startFreeTrial}
          <FaArrowRight className="ml-3" />
        </Link>

        {props.showStats !== false && (
          <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
            {t.noCreditCard} • {t.joinProfessionals}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Video Hero variant - With background video
 */
export function HeroVideo(props: HeroProps): React.ReactElement {
  const { t } = useLanguage();
  const { trackClick } = useExperimentTracking();

  const handleCTAClick = (ctaType: string) => {
    trackClick(`hero_cta_video_${ctaType}`, { variant: 'video' });
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      {props.videoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={props.videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 container mx-auto text-center max-w-6xl px-6">
        <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-base font-semibold mb-10">
          <FaRocket className="mr-3" />
          <span>{props.title || t.poweredByAi}</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-8 leading-tight">
          <span className="block">{t.heroTitle}</span>
          <span className="block text-purple-400">{t.heroTitle2}</span>
          <span className="block">{t.heroTitle3}</span>
        </h1>

        <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-4xl mx-auto px-4 font-medium leading-relaxed">
          {props.subtitle || t.heroDesc}
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center px-4">
          <Link
            href="/dashboard"
            className="bg-white hover:bg-gray-100 text-purple-600 font-bold text-xl px-12 py-5 rounded-xl transition-all duration-200 inline-flex items-center justify-center"
            aria-label={props.ctaText || t.startFreeTrial}
            onClick={() => handleCTAClick('primary')}
          >
            <FaPlay className="mr-3" />
            {props.ctaText || t.startFreeTrial}
          </Link>

          <Link
            href="/demo"
            className="bg-transparent hover:bg-white/10 border-2 border-white text-white font-bold text-xl px-12 py-5 rounded-xl transition-all duration-200 inline-flex items-center justify-center"
            aria-label={t.watchDemo}
            onClick={() => handleCTAClick('secondary')}
          >
            {t.watchDemo}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Split Hero variant - Two-column layout with image
 */
export function HeroSplit(props: HeroProps): React.ReactElement {
  const { t } = useLanguage();
  const { trackClick } = useExperimentTracking();

  const handleCTAClick = (ctaType: string) => {
    trackClick(`hero_cta_split_${ctaType}`, { variant: 'split' });
  };

  return (
    <section className="pt-24 pb-24 px-6 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="inline-flex items-center bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <FaStar className="mr-2 text-yellow-500" />
              <span>{props.title || t.poweredByAi}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
              <span className="block">{t.heroTitle}</span>
              <span className="block gradient-text">{t.heroTitle2}</span>
              <span className="block">{t.heroTitle3}</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              {props.subtitle || t.heroDesc}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/dashboard"
                className="btn-primary text-lg px-8 py-4 text-center inline-flex items-center justify-center"
                aria-label={props.ctaText || t.startFreeTrial}
                onClick={() => handleCTAClick('primary')}
              >
                <FaPlay className="mr-2" />
                {props.ctaText || t.startFreeTrial}
              </Link>

              <Link
                href="/demo"
                className="btn-secondary text-lg px-8 py-4 text-center inline-flex items-center justify-center"
                aria-label={t.watchDemo}
                onClick={() => handleCTAClick('secondary')}
              >
                {t.watchDemo}
              </Link>
            </div>

            {props.showStats !== false && (
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span>{t.noCreditCard}</span>
                </div>
                <div className="flex items-center">
                  <FaUsers className="text-blue-500 mr-2" />
                  <span>{t.joinProfessionals}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Image/Illustration */}
          <div className="relative">
            {props.backgroundImage ? (
              <img
                src={props.backgroundImage}
                alt="PRISMA Portfolio Builder"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            ) : (
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-4">
                  <div className="h-4 bg-white/30 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-white/30 rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="h-3 bg-white/30 rounded w-full mb-2"></div>
                    <div className="h-3 bg-white/30 rounded w-2/3"></div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="h-3 bg-white/30 rounded w-full mb-2"></div>
                    <div className="h-3 bg-white/30 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Hero variant selector - Returns the appropriate variant based on configuration
 */
export function getHeroVariant(
  variant: string
): React.ComponentType<HeroProps> {
  const variants: Record<string, React.ComponentType<HeroProps>> = {
    default: HeroDefault,
    minimal: HeroMinimal,
    video: HeroVideo,
    split: HeroSplit,
  };

  return variants[variant] || HeroDefault;
}

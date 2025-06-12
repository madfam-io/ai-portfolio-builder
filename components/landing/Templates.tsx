'use client';

import React from 'react';

import Link from 'next/link';

import { useLanguage } from '@/lib/i18n/minimal-context';

export default function Templates(): React.ReactElement {
  const { t } = useLanguage();

  const handleTemplateClick = (templateType: string) => {
    // Store selected template in localStorage for the editor
    localStorage.setItem('selectedTemplate', templateType);
    // Add analytics event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'template_selected', {
        template_type: templateType,
        event_category: 'engagement',
      });
    }
  };

  return (
    <section id="templates" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <span>{t.templatesTitle2}</span>{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"></span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.templatesSubtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          <Link
            href="/editor?template=developer"
            className="group cursor-pointer block"
            onClick={() => handleTemplateClick('developer')}
          >
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 h-64 rounded-lg mb-4 overflow-hidden relative transition-all duration-300 border-2 border-transparent group-hover:border-purple-400 group-hover:shadow-lg">
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center z-10">
                <div className="text-center">
                  <span className="text-white font-semibold text-lg block">
                    {t.useTemplate}
                  </span>
                  <span className="text-white text-sm opacity-80 block mt-2">
                    Click to start editing →
                  </span>
                </div>
              </div>
              {/* Enhanced Template Preview - Developer */}
              <div className="p-4 text-xs">
                <div className="bg-slate-800 h-8 rounded mb-2 flex items-center px-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  <div className="w-8 h-1 bg-gray-400 rounded"></div>
                </div>
                <div className="bg-white dark:bg-gray-600 h-4 rounded mb-2 w-3/4"></div>
                <div className="bg-white dark:bg-gray-600 h-4 rounded mb-4 w-1/2"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-500 h-12 rounded flex items-center justify-center">
                    <div className="w-6 h-1 bg-white rounded"></div>
                  </div>
                  <div className="bg-green-500 h-12 rounded flex items-center justify-center">
                    <div className="w-6 h-1 bg-white rounded"></div>
                  </div>
                </div>
              </div>
              {/* Badge */}
              <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                Tech
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.minimalDev}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t.minimalDevDesc}
            </p>
          </Link>

          <Link
            href="/editor?template=creative"
            className="group cursor-pointer block"
            onClick={() => handleTemplateClick('creative')}
          >
            <div className="bg-gradient-to-br from-pink-50 to-purple-100 dark:from-purple-900 dark:to-pink-900 h-64 rounded-lg mb-4 overflow-hidden relative transition-all duration-300 border-2 border-transparent group-hover:border-purple-400 group-hover:shadow-lg">
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex items-center justify-center z-10">
                <div className="text-center">
                  <span className="text-white font-semibold text-lg block">
                    {t.useTemplate}
                  </span>
                  <span className="text-white text-sm opacity-80 block mt-2">
                    Click to start editing →
                  </span>
                </div>
              </div>
              {/* Enhanced Template Preview - Creative */}
              <div className="p-4 text-xs">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-12 rounded mb-2 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full opacity-80"></div>
                </div>
                <div className="bg-white dark:bg-gray-600 h-4 rounded mb-2"></div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="bg-purple-300 h-8 rounded"></div>
                  <div className="bg-pink-300 h-8 rounded"></div>
                  <div className="bg-purple-400 h-8 rounded"></div>
                </div>
                <div className="bg-gradient-to-r from-purple-200 to-pink-200 h-6 rounded"></div>
              </div>
              {/* Badge */}
              <div className="absolute top-2 right-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                Creative
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.creativeDesigner}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t.creativeDesignerDesc}
            </p>
          </Link>

          <Link
            href="/editor?template=business"
            className="group cursor-pointer block"
            onClick={() => handleTemplateClick('business')}
          >
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                <span className="text-white font-semibold">
                  {t.useTemplate}
                </span>
              </div>
              {/* Template Preview */}
              <div className="p-4 text-xs">
                <div className="bg-blue-500 h-6 rounded mb-2"></div>
                <div className="bg-white dark:bg-gray-600 h-4 rounded mb-2"></div>
                <div className="bg-white dark:bg-gray-600 h-4 rounded mb-2 w-2/3"></div>
                <div className="flex gap-2">
                  <div className="bg-white dark:bg-gray-600 h-16 rounded flex-1"></div>
                  <div className="bg-white dark:bg-gray-600 h-16 rounded flex-1"></div>
                </div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.businessPro}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t.businessProDesc}
            </p>
          </Link>

          {/* Fourth template - Educators */}
          <Link
            href="/editor?template=educator"
            className="group cursor-pointer block"
            onClick={() => handleTemplateClick('educator')}
          >
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                <span className="text-white font-semibold">
                  {t.useTemplate}
                </span>
              </div>
              {/* Template Preview */}
              <div className="p-4 text-xs">
                <div className="bg-green-500 h-8 rounded mb-2"></div>
                <div className="bg-white dark:bg-gray-600 h-3 rounded mb-1"></div>
                <div className="bg-white dark:bg-gray-600 h-3 rounded mb-2 w-3/4"></div>
                <div className="bg-white dark:bg-gray-600 h-20 rounded"></div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.educatorSpeaker}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t.educatorSpeakerDesc}
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}

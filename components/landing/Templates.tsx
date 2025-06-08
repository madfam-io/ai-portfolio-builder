'use client';

import { useLanguage } from '@/lib/i18n/simple-context';

export default function Templates() {
  const { t } = useLanguage();
  return (
    <section id="templates" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <span>{t.templatesSecTitle}</span>{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Every Professional
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.templatesSecSubtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <div className="group cursor-pointer">
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                <span className="text-white font-semibold">
                  {t.useTemplate}
                </span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.minimalDev}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t.minimalDevDesc}
            </p>
          </div>

          <div className="group cursor-pointer">
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                <span className="text-white font-semibold">
                  {t.useTemplate}
                </span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.creativeDesigner}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t.creativeDesignerDesc}
            </p>
          </div>

          <div className="group cursor-pointer">
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                <span className="text-white font-semibold">
                  {t.useTemplate}
                </span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t.businessPro}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t.businessProDesc}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

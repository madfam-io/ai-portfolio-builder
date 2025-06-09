'use client';

import { useLanguage } from '@/lib/i18n/minimal-context';
import Link from 'next/link';

export default function Templates() {
  const { t } = useLanguage();
  
  const handleTemplateClick = (templateType: string) => {
    // Store selected template in localStorage for the editor
    localStorage.setItem('selectedTemplate', templateType);
  };

  return (
    <section id="templates" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <span>{t.templatesSecTitle}</span>{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t.everyProfessional}
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.templatesSecSubtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          <Link 
            href="/editor?template=developer" 
            className="group cursor-pointer block"
            onClick={() => handleTemplateClick('developer')}
          >
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                <span className="text-white font-semibold">
                  {t.useTemplate}
                </span>
              </div>
              {/* Template Preview */}
              <div className="p-4 text-xs">
                <div className="bg-white dark:bg-gray-600 h-8 rounded mb-2"></div>
                <div className="bg-white dark:bg-gray-600 h-4 rounded mb-2 w-3/4"></div>
                <div className="bg-white dark:bg-gray-600 h-4 rounded mb-4 w-1/2"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white dark:bg-gray-600 h-12 rounded"></div>
                  <div className="bg-white dark:bg-gray-600 h-12 rounded"></div>
                </div>
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
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4 overflow-hidden relative transition-colors duration-300">
              <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-90 transition flex items-center justify-center">
                <span className="text-white font-semibold">
                  {t.useTemplate}
                </span>
              </div>
              {/* Template Preview */}
              <div className="p-4 text-xs">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 h-12 rounded mb-2"></div>
                <div className="bg-white dark:bg-gray-600 h-4 rounded mb-2"></div>
                <div className="grid grid-cols-3 gap-1 mb-2">
                  <div className="bg-white dark:bg-gray-600 h-8 rounded"></div>
                  <div className="bg-white dark:bg-gray-600 h-8 rounded"></div>
                  <div className="bg-white dark:bg-gray-600 h-8 rounded"></div>
                </div>
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

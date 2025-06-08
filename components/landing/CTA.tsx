'use client';

import { useLanguage } from '@/lib/i18n/simple-context';

export default function CTA() {
  const { t } = useLanguage();
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">{t.ctaTitle}</h2>
        <p className="text-xl mb-8 opacity-90">{t.ctaSubtitle}</p>
        <button
          className="bg-white text-purple-600 px-8 py-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition transform hover:-translate-y-1 hover:shadow-lg"
          data-cta-button
        >
          {t.ctaButton}
        </button>
        <p className="mt-4 opacity-80">{t.ctaFooter}</p>
      </div>
    </section>
  );
}

'use client';

import { useLanguage } from '@/lib/i18n/simple-context';

export default function TestLanguage() {
  const { language, setLanguage, t, availableLanguages } = useLanguage();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Language Test Page</h1>

      <div className="mb-4">
        <p>
          <strong>Current Language:</strong> {language}
        </p>
        <p>
          <strong>Available Languages:</strong>{' '}
          {availableLanguages.map(l => l.code).join(', ')}
        </p>
      </div>

      <div className="space-x-4 mb-8">
        {availableLanguages.map(lang => (
          <button
            key={lang.code}
            onClick={() => {
              console.log(`Switching to ${lang.code}`);
              setLanguage(lang.code);
            }}
            className={`px-4 py-2 rounded ${
              language === lang.code
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p>
          <strong>Test Translations:</strong>
        </p>
        <p>features: {t.features}</p>
        <p>howItWorks: {t.howItWorks}</p>
        <p>getStarted: {t.getStarted}</p>
        <p>heroTitle: {t.heroTitle}</p>
      </div>
    </div>
  );
}

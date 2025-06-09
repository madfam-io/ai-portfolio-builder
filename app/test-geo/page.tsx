'use client';

import { useLanguage } from '@/lib/i18n/minimal-context';

export default function TestGeoPage() {
  const { t, language, detectedCountry, isDetecting } = useLanguage();

  return (
    <div className="container mx-auto px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Geolocation Detection Test
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Current Language Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Current Language:</strong> {language.toUpperCase()}
            </div>
            <div>
              <strong>Is Detecting:</strong> {isDetecting ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {detectedCountry && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold mb-4">Detection Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Detected Language:</strong> {detectedCountry.language.toUpperCase()}
              </div>
              <div>
                <strong>Country Code:</strong> {detectedCountry.countryCode || 'Unknown'}
              </div>
              <div>
                <strong>Flag:</strong> {detectedCountry.flag}
              </div>
              <div>
                <strong>Detection Method:</strong> {detectedCountry.method}
              </div>
              <div>
                <strong>Confident:</strong> {detectedCountry.confident ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Sample Translations</h2>
          <div className="space-y-2">
            <p><strong>Hero Title:</strong> {t.heroTitle}</p>
            <p><strong>Features:</strong> {t.features}</p>
            <p><strong>Get Started:</strong> {t.getStarted}</p>
            <p><strong>Pricing:</strong> {t.pricing}</p>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>How it works:</strong> The system detects your location using IP geolocation, 
            timezone, or browser settings. Spanish-speaking countries get Spanish by default, 
            English-speaking countries get English, and others fallback to Spanish (MADFAM&apos;s primary market).
          </p>
        </div>
      </div>
    </div>
  );
}
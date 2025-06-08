'use client';

import { useLanguage } from '@/lib/i18n/simple-context';
import { useEffect, useState } from 'react';

export default function LanguageStatus() {
  const { language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [localStorage, setLocalStorage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const stored = window.localStorage.getItem('madfam-language');
    setLocalStorage(stored);
  }, [language]);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-sm z-50">
      <div>Current Language: {language}</div>
      <div>localStorage: {localStorage}</div>
      <div>
        Document lang:{' '}
        {typeof document !== 'undefined'
          ? document.documentElement.lang
          : 'N/A'}
      </div>
    </div>
  );
}

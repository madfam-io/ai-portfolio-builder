'use client';

import React, { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';

import { useLanguage } from '@/lib/i18n/refactored-context';

export default function BackToTopButton(): React.ReactElement {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = (): void => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      className={`back-to-top-button ${isVisible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label={t.backToTop}
      title={t.backToTop}
    >
      <FaChevronUp className="w-4 h-4" />
    </button>
  );
}

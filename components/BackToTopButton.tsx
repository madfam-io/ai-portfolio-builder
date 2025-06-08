'use client';

import { useState, useEffect } from 'react';
import { FaArrowUp } from 'react-icons/fa';

export default function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(true); // Always visible for testing
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        if (!hasShown) {
          setHasShown(true);
        }
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Keyboard shortcut for back to top (Ctrl/Cmd + Home)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Home' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        scrollToTop();
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [hasShown]);

  const scrollToTop = () => {
    console.log('Back to top button clicked!');

    // Simple scroll to top
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      // Focus on main content for screen readers
      setTimeout(() => {
        const mainContent =
          document.querySelector('#main-content') || document.body;
        (mainContent as HTMLElement)?.focus({ preventScroll: true });
      }, 100);
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={() => {
        // Force scroll to top immediately
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Also try the smooth scroll
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth',
        });
      }}
      className="fixed bottom-6 right-6 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-offset-2 z-50 cursor-pointer flex items-center justify-center"
      aria-label="Back to top"
      title="Back to top"
      type="button"
      style={{
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <FaArrowUp className="w-5 h-5" />
    </button>
  );
}

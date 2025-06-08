'use client';

import { useEffect } from 'react';

export default function NavigationEnhancer() {
  useEffect(() => {
    // Skip link functionality
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className =
      'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none';
    skipLink.style.transform = 'translateY(-100%)';
    skipLink.style.transition = 'transform 0.3s ease';

    skipLink.addEventListener('focus', () => {
      skipLink.style.transform = 'translateY(0)';
    });

    skipLink.addEventListener('blur', () => {
      skipLink.style.transform = 'translateY(-100%)';
    });

    document.body.insertBefore(skipLink, document.body.firstChild);

    // Back to top button functionality
    const backToTopButton = document.createElement('button');
    backToTopButton.className = 'back-to-top-button';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    backToTopButton.setAttribute('title', 'Back to top');
    backToTopButton.innerHTML = `
      <svg class="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path>
      </svg>
    `;

    let hasShownButton = false;

    // Show/hide back to top button based on scroll position
    const toggleBackToTopButton = () => {
      if (window.pageYOffset > 300) {
        if (!hasShownButton) {
          backToTopButton.classList.add('back-to-top-pulse');
          hasShownButton = true;
          setTimeout(() => {
            backToTopButton.classList.remove('back-to-top-pulse');
          }, 2000);
        }
        backToTopButton.classList.add('visible');
      } else {
        backToTopButton.classList.remove('visible');
      }
    };

    // Smooth scroll to top functionality
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      // Focus on the top of the page for screen readers
      const mainContent =
        document.querySelector('#main-content') || document.body;
      (mainContent as HTMLElement).focus({ preventScroll: true });
    };

    backToTopButton.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', toggleBackToTopButton);

    document.body.appendChild(backToTopButton);

    // Keyboard navigation enhancement
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC key closes mobile menu
      if (e.key === 'Escape') {
        const mobileMenuButton = document.querySelector(
          '[aria-expanded="true"]'
        ) as HTMLButtonElement;
        if (mobileMenuButton) {
          mobileMenuButton.click();
        }
      }

      // Home key scrolls to top
      if (e.key === 'Home' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        scrollToTop();
      }

      // Tab key navigation enhancement
      if (e.key === 'Tab') {
        // Add visible focus indicators
        document.body.classList.add('user-is-tabbing');
      }
    };

    // Mouse click removes tab focus indicators
    const handleMouseDown = () => {
      document.body.classList.remove('user-is-tabbing');
    };

    // Smooth scroll enhancement with offset for fixed header
    const handleAnchorClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.tagName === 'A' && target.hash) {
        e.preventDefault();
        const targetElement = document.querySelector(target.hash);
        if (targetElement) {
          const headerOffset = 100;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });

          // Update URL without triggering scroll
          history.pushState(null, '', target.hash);

          // Set focus to target element for screen readers
          (targetElement as HTMLElement).focus({ preventScroll: true });
        }
      }
    };

    // Announce page sections to screen readers
    const announceSection = () => {
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => {
        if (!section.getAttribute('aria-label')) {
          const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
          if (heading) {
            section.setAttribute('aria-label', heading.textContent || '');
          }
        }
      });
    };

    // Enhanced focus management
    const manageFocus = () => {
      // Make sections focusable for keyboard navigation
      const sections = document.querySelectorAll('section[id]');
      sections.forEach(section => {
        if (!section.hasAttribute('tabindex')) {
          section.setAttribute('tabindex', '-1');
        }
      });

      // Improve button accessibility
      const buttons = document.querySelectorAll(
        'button:not([aria-label]):not([aria-labelledby])'
      );
      buttons.forEach(button => {
        if (!button.getAttribute('aria-label') && button.textContent) {
          button.setAttribute('aria-label', button.textContent.trim());
        }
      });
    };

    // Initialize enhancements
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('click', handleAnchorClick);

    // Run on initial load
    announceSection();
    manageFocus();

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', toggleBackToTopButton);
      backToTopButton.removeEventListener('click', scrollToTop);
      if (skipLink.parentNode) {
        skipLink.parentNode.removeChild(skipLink);
      }
      if (backToTopButton.parentNode) {
        backToTopButton.parentNode.removeChild(backToTopButton);
      }
    };
  }, []);

  return null; // This component only adds functionality, no visual elements
}

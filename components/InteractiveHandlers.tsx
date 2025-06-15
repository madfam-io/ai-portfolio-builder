'use client';

import { useEffect } from 'react';

/**
 * Safe interactive handlers that avoid dangerouslySetInnerHTML
 * This component sets up all the interactive functionality using React hooks
 */
export default function InteractiveHandlers() {
  // Theme is handled by UI store in other components

  useEffect(() => {
    // Currency state
    let currency = localStorage.getItem('currency') || 'USD';
    let mobileMenuOpen = false;

    // Currency conversion rates
    const exchangeRates: Record<string, number> = {
      USD: 1.0,
      MXN: 20.0,
      EUR: 0.85,
    };
    const currencySymbols: Record<string, string> = {
      USD: '$',
      MXN: '$',
      EUR: '€',
    };

    // Currency toggle
    function toggleCurrency() {
      const currencies = ['USD', 'MXN', 'EUR'];
      const currentIndex = currencies.indexOf(currency);
      currency = currencies[(currentIndex + 1) % currencies.length] || 'USD';
      localStorage.setItem('currency', currency);
      updateCurrencyDisplay();
    }

    // Mobile menu toggle
    function toggleMobileMenu() {
      mobileMenuOpen = !mobileMenuOpen;
      const mobileMenu = document.querySelector(
        '[data-mobile-menu]'
      ) as HTMLElement;
      if (mobileMenu) {
        mobileMenu.style.display = mobileMenuOpen ? 'block' : 'none';
      }

      // Update icon using data attribute
      document.querySelectorAll('[data-mobile-menu-icon]').forEach(el => {
        el.setAttribute('data-open', mobileMenuOpen ? 'true' : 'false');
      });
    }

    function updateCurrencyDisplay() {
      const symbol = currencySymbols[currency];

      document.querySelectorAll('[data-currency-display]').forEach(el => {
        el.textContent = currency;
      });

      document.querySelectorAll('[data-price]').forEach(el => {
        const usdPrice = parseFloat(el.getAttribute('data-price') || '0');
        const rate = exchangeRates[currency];
        if (rate !== undefined) {
          const convertedPrice = Math.round(usdPrice * rate);
          el.textContent = (symbol || '$') + convertedPrice;
        }
      });
    }

    // Event handler
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;

      // Currency button
      if (target.closest('[data-currency-toggle]')) {
        e.preventDefault();
        toggleCurrency();
      }

      // Mobile menu button
      if (target.closest('[data-mobile-menu-toggle]')) {
        e.preventDefault();
        toggleMobileMenu();
      }

      // Demo and CTA buttons
      if (target.closest('[data-demo-button]')) {
        e.preventDefault();
        // Dispatch custom event for React to handle
        window.dispatchEvent(new CustomEvent('demo-button-click'));
      }

      if (target.closest('[data-cta-button]')) {
        e.preventDefault();
        // Dispatch custom event for React to handle
        window.dispatchEvent(new CustomEvent('cta-button-click'));
      }
    }

    // Attach event listener
    document.addEventListener('click', handleClick);

    // Initial updates
    updateCurrencyDisplay();

    // Set initial icon states
    document.querySelectorAll('[data-mobile-menu-icon]').forEach(el => {
      el.setAttribute('data-open', 'false');
    });

    // Cleanup
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Dark mode is handled by the UI store, no need for manual handling

  return null;
}

import React from 'react';
export default function InteractiveScript(): React.ReactElement {
  const scriptContent = `
    (function() {
      'use strict';

      // Initialize state from localStorage
      let darkMode = localStorage.getItem('darkMode') === 'true';
      let currency = localStorage.getItem('currency') || 'USD';
      let mobileMenuOpen = false;

      // Currency conversion rates
      const exchangeRates = { USD: 1.0, MXN: 20.0, EUR: 0.85 };
      const currencySymbols = { USD: '$', MXN: '$', EUR: '€' };

      // Apply initial dark mode
      if (darkMode) {
        document.documentElement.classList.add('dark');
      }

      // Dark mode toggle
      function toggleDarkMode() {
        darkMode = !darkMode;
        localStorage.setItem('darkMode', darkMode.toString());
        
        if (darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Update icon state
        document.querySelectorAll('[data-dark-mode-icon]').forEach(el => {
          el.setAttribute('data-icon-state', darkMode ? 'sun' : 'moon');
        });
      }

      // Language toggle removed - handled by React Context

      // Currency toggle
      function toggleCurrency() {
        const currencies = ['USD', 'MXN', 'EUR'];
        const currentIndex = currencies.indexOf(currency);
        currency = currencies[(currentIndex + 1) % currencies.length];
        localStorage.setItem('currency', currency);
        updateCurrencyDisplay();
      }

      // Mobile menu toggle
      function toggleMobileMenu() {
        mobileMenuOpen = !mobileMenuOpen;
        const mobileMenu = document.querySelector('[data-mobile-menu]');
        if (mobileMenu) {
          mobileMenu.style.display = mobileMenuOpen ? 'block' : 'none';
        }

        // Update icon state
        document.querySelectorAll('[data-mobile-menu-icon]').forEach(el => {
          el.setAttribute('data-icon-state', mobileMenuOpen ? 'close' : 'menu');
        });
      }

      // Language display removed - handled by React Context

      function updateCurrencyDisplay() {
        const symbol = currencySymbols[currency];
        
        document.querySelectorAll('[data-currency-display]').forEach(el => {
          el.textContent = currency;
        });

        document.querySelectorAll('[data-price]').forEach(el => {
          const usdPrice = parseFloat(el.getAttribute('data-price'));
          const convertedPrice = Math.round(usdPrice * exchangeRates[currency]);
          el.textContent = symbol + convertedPrice;
        });
      }

      // Wait for interactive elements to be ready
      function initializeInteractive() {
        // Attach event listeners using event delegation
        document.addEventListener('click', function(e) {
          // Dark mode button
          if (e.target.closest('[data-dark-mode-toggle]')) {
            e.preventDefault();
            toggleDarkMode();
          }
          
          // Currency button
          if (e.target.closest('[data-currency-toggle]')) {
            e.preventDefault();
            toggleCurrency();
          }
          
          // Mobile menu button
          if (e.target.closest('[data-mobile-menu-toggle]')) {
            e.preventDefault();
            toggleMobileMenu();
          }

          // Demo and CTA buttons
          if (e.target.closest('[data-demo-button]')) {
            e.preventDefault();
            alert('Demo video would open here!');
          }

          if (e.target.closest('[data-cta-button]')) {
            e.preventDefault();
            alert('Sign up flow would start here!');
          }
          
          // Don't prevent default for other clicks to allow React handlers
        });

        // Initial updates
        updateCurrencyDisplay();
        
        // Set initial dark mode icon state
        document.querySelectorAll('[data-dark-mode-icon]').forEach(el => {
          el.setAttribute('data-icon-state', darkMode ? 'sun' : 'moon');
        });
      }

      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeInteractive);
      } else {
        initializeInteractive();
      }
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: scriptContent }}
      suppressHydrationWarning
    />
  );
}

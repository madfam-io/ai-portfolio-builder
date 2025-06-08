export default function InteractiveScript() {
  const scriptContent = `
    (function() {
      'use strict';
      
      // Initialize state from localStorage
      let darkMode = localStorage.getItem('darkMode') === 'true';
      let language = localStorage.getItem('language') || 'en';
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

        // Update icon
        document.querySelectorAll('[data-dark-mode-icon]').forEach(el => {
          el.innerHTML = darkMode ? 
            '<svg fill="currentColor" height="1em" stroke="currentColor" stroke-width="0" viewBox="0 0 512 512" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"/></svg>' :
            '<svg fill="currentColor" height="1em" stroke="currentColor" stroke-width="0" viewBox="0 0 512 512" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"/></svg>';
        });
      }

      // Language toggle
      function toggleLanguage() {
        language = language === 'en' ? 'es' : 'en';
        localStorage.setItem('language', language);
        updateLanguageDisplay();
      }

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

        // Update icon
        document.querySelectorAll('[data-mobile-menu-icon]').forEach(el => {
          el.innerHTML = mobileMenuOpen ?
            '<svg class="text-xl" fill="currentColor" height="1em" stroke="currentColor" stroke-width="0" viewBox="0 0 352 512" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/></svg>' :
            '<svg class="text-xl" fill="currentColor" height="1em" stroke="currentColor" stroke-width="0" viewBox="0 0 448 512" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"/></svg>';
        });
      }

      function updateLanguageDisplay() {
        document.querySelectorAll('[data-lang-display]').forEach(el => {
          el.textContent = language.toUpperCase();
        });
        document.querySelectorAll('[data-lang-flag]').forEach(el => {
          el.textContent = language === 'es' ? '🇪🇸' : '🇺🇸';
        });
      }

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
          
          // Language button
          if (e.target.closest('[data-lang-toggle]')) {
            e.preventDefault();
            toggleLanguage();
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
        });

        // Initial updates
        updateLanguageDisplay();
        updateCurrencyDisplay();
        
        // Set initial dark mode icon
        document.querySelectorAll('[data-dark-mode-icon]').forEach(el => {
          el.innerHTML = darkMode ? 
            '<svg fill="currentColor" height="1em" stroke="currentColor" stroke-width="0" viewBox="0 0 512 512" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"/></svg>' :
            '<svg fill="currentColor" height="1em" stroke="currentColor" stroke-width="0" viewBox="0 0 512 512" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"/></svg>';
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

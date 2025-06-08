'use client';

import { useState, useEffect } from 'react';
import {
  FaRocket,
  FaDollarSign,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
} from 'react-icons/fa';

export default function InteractiveHeader() {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [currency, setCurrency] = useState('USD');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Currency conversion rates and config
  const exchangeRates = { USD: 1.0, MXN: 20.0, EUR: 0.85 };

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDarkMode(localStorage.getItem('darkMode') === 'true');
      setLanguage(localStorage.getItem('language') || 'en');
      setCurrency(localStorage.getItem('currency') || 'USD');
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', newMode.toString());
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang);
    }
  };

  const toggleCurrency = () => {
    const currencies = ['USD', 'MXN', 'EUR'];
    const currentIndex = currencies.indexOf(currency);
    const nextCurrency = currencies[(currentIndex + 1) % currencies.length];
    setCurrency(nextCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', nextCurrency);
      // Dispatch custom event for same-tab updates
      window.dispatchEvent(
        new CustomEvent('currencyChange', { detail: nextCurrency })
      );
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Text content based on language
  const t =
    language === 'es'
      ? {
          nav: {
            features: 'Características',
            howItWorks: 'Cómo Funciona',
            templates: 'Plantillas',
            pricing: 'Precios',
            getStarted: 'Comenzar',
          },
        }
      : {
          nav: {
            features: 'Features',
            howItWorks: 'How it Works',
            templates: 'Templates',
            pricing: 'Pricing',
            getStarted: 'Get Started',
          },
        };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-50 transition-colors duration-300">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaRocket className="text-2xl text-purple-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              MADFAM<span className="text-purple-600">.</span>AI
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
            >
              {t.nav.features}
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
            >
              {t.nav.howItWorks}
            </a>
            <a
              href="#templates"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
            >
              {t.nav.templates}
            </a>
            <a
              href="#pricing"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
            >
              {t.nav.pricing}
            </a>

            <button
              onClick={toggleCurrency}
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition flex items-center space-x-1"
              title="Toggle Currency"
            >
              <FaDollarSign className="text-sm" />
              <span className="text-sm font-medium">{currency}</span>
            </button>

            <button
              onClick={toggleLanguage}
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition flex items-center space-x-1"
              title="Toggle Language"
            >
              <span className="flag-icon">
                {language === 'es' ? '🇪🇸' : '🇺🇸'}
              </span>
              <span className="text-sm font-medium">
                {language.toUpperCase()}
              </span>
            </button>

            <button
              onClick={toggleDarkMode}
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition"
              title="Toggle Dark Mode"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              {t.nav.getStarted}
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 dark:text-gray-300 p-2"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <FaTimes className="text-xl" />
              ) : (
                <FaBars className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t dark:border-gray-700">
            <div className="flex flex-col space-y-4 pt-4">
              <a
                href="#features"
                className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                onClick={closeMobileMenu}
              >
                {t.nav.features}
              </a>
              <a
                href="#how-it-works"
                className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                onClick={closeMobileMenu}
              >
                {t.nav.howItWorks}
              </a>
              <a
                href="#templates"
                className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                onClick={closeMobileMenu}
              >
                {t.nav.templates}
              </a>
              <a
                href="#pricing"
                className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                onClick={closeMobileMenu}
              >
                {t.nav.pricing}
              </a>
              <div className="flex items-center justify-center space-x-6 py-2">
                <button
                  onClick={toggleCurrency}
                  className="flex items-center space-x-2 text-gray-900 dark:text-white hover:text-purple-600 transition"
                  title="Toggle Currency"
                >
                  <FaDollarSign />
                  <span>{currency}</span>
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center space-x-2 text-gray-900 dark:text-white hover:text-purple-600 transition"
                  title="Toggle Language"
                >
                  <span className="flag-icon">
                    {language === 'es' ? '🇪🇸' : '🇺🇸'}
                  </span>
                  <span>{language.toUpperCase()}</span>
                </button>
                <button
                  onClick={toggleDarkMode}
                  className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                  title="Toggle Dark Mode"
                >
                  {darkMode ? <FaSun /> : <FaMoon />}
                </button>
              </div>
              <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                {t.nav.getStarted}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

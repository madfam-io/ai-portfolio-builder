'use client';

import { LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

import { useApp } from '@/lib/contexts/AppContext';
import { useAuthStore } from '@/lib/store/auth-store';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { logger } from '@/lib/utils/logger';

export default function Header(): React.ReactElement {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const {
    isDarkMode,
    currency,
    toggleDarkMode,
    setCurrency,
    isMobileMenuOpen,
    setMobileMenuOpen,
  } = useApp();
  const { user, isLoading: loading, signOut } = useAuthStore();
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentLang = availableLanguages.find(lang => lang.code === language);
  const otherLang = availableLanguages.find(lang => lang.code !== language);

  // Check if we're on the landing page to show anchor links vs page links
  const isLandingPage = pathname === '/';

  const currencySymbols = {
    MXN: '$',
    USD: '$',
    EUR: '€',
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-50 transition-colors duration-300">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/prisma-logo.png"
              alt="PRISMA Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                PRISMA
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                by MADFAM
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {isLandingPage ? (
              // Landing page - show anchor links
              <>
                <a
                  href="#features"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  {t.features}
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  {t.howItWorks}
                </a>
                <Link
                  href="/templates"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  {t.templates}
                </Link>
                <a
                  href="#pricing"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  {t.pricing}
                </a>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  About
                </Link>
                <Link
                  href="/demo/interactive"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 transition font-medium"
                >
                  Editor Demo
                </Link>
              </>
            ) : (
              // Other pages - show navigation links
              <>
                <Link
                  href="/dashboard"
                  className={`text-gray-600 dark:text-gray-300 hover:text-purple-600 transition ${
                    pathname === '/dashboard' ? 'text-purple-600' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/editor"
                  className={`text-gray-600 dark:text-gray-300 hover:text-purple-600 transition ${
                    pathname === '/editor' ? 'text-purple-600' : ''
                  }`}
                >
                  Editor
                </Link>
                <Link
                  href="/quick-start"
                  className={`text-gray-600 dark:text-gray-300 hover:text-purple-600 transition ${
                    pathname === '/quick-start' ? 'text-purple-600' : ''
                  }`}
                >
                  Quick Start
                </Link>
                <Link
                  href="/analytics"
                  className={`text-gray-600 dark:text-gray-300 hover:text-purple-600 transition ${
                    pathname === '/analytics' ? 'text-purple-600' : ''
                  }`}
                >
                  Analytics
                </Link>
                <Link
                  href="/templates"
                  className={`text-gray-600 dark:text-gray-300 hover:text-purple-600 transition ${
                    pathname === '/templates' ? 'text-purple-600' : ''
                  }`}
                >
                  Templates
                </Link>
                <Link
                  href="/marketplace"
                  className={`text-gray-600 dark:text-gray-300 hover:text-purple-600 transition ${
                    pathname === '/marketplace' ? 'text-purple-600' : ''
                  }`}
                >
                  Marketplace
                </Link>
                <Link
                  href="/about"
                  className={`text-gray-600 dark:text-gray-300 hover:text-purple-600 transition ${
                    pathname === '/about' ? 'text-purple-600' : ''
                  }`}
                >
                  About
                </Link>
                <Link
                  href="/#pricing"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  Pricing
                </Link>
              </>
            )}

            <button
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition flex items-center space-x-1 cursor-pointer"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                logger.debug('Currency toggle clicked', {
                  current: currency,
                  feature: 'header-currency-toggle',
                });
                setCurrency();
              }}
              title={`${t.switchCurrency} (${t.current}: ${currency})`}
            >
              <span className="text-sm font-bold">
                {currencySymbols[currency]}
              </span>
              <span className="text-sm font-medium">{currency}</span>
            </button>

            <button
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition flex items-center space-x-1 cursor-pointer"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                logger.debug('Language toggle clicked', {
                  current: language,
                  switching_to: otherLang?.code,
                  feature: 'header-language-toggle',
                });
                setLanguage(otherLang?.code || 'en');
              }}
              title={`${t.switchTo} ${otherLang?.name}`}
            >
              <span className="flag-icon">{currentLang?.flag}</span>
              <span className="text-sm font-medium">
                {language.toUpperCase()}
              </span>
            </button>

            <button
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition cursor-pointer"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                logger.debug('Dark mode toggle clicked', {
                  current: isDarkMode ? 'dark' : 'light',
                  feature: 'header-dark-mode-toggle',
                });
                toggleDarkMode();
              }}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? (
                <Sun className="text-yellow-500" />
              ) : (
                <Moon className="text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Auth Section */}
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  <User className="text-lg" />
                  <span className="text-sm font-medium">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/editor"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Editor
                    </Link>
                    <Link
                      href="/quick-start"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Quick Start
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="inline mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <LogOut className="inline mr-2" />
                      {t.signOut}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  {t.signIn}
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  {t.getStarted}
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              className="text-gray-600 dark:text-gray-300 p-2 cursor-pointer"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                logger.debug('Mobile menu toggle clicked', {
                  current: isMobileMenuOpen ? 'open' : 'closed',
                  feature: 'header-mobile-menu',
                });
                setMobileMenuOpen(!isMobileMenuOpen);
              }}
              title={`${isMobileMenuOpen ? 'Close' : 'Open'} mobile menu`}
            >
              {isMobileMenuOpen ? (
                <X className="text-xl" />
              ) : (
                <Menu className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden mt-4 pb-4 border-t dark:border-gray-700 transition-all duration-300 ${
            isMobileMenuOpen ? 'block' : 'hidden'
          }`}
        >
          <div className="flex flex-col space-y-4 pt-4">
            {isLandingPage ? (
              // Landing page - show anchor links
              <>
                <a
                  href="#features"
                  className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                >
                  {t.features}
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                >
                  {t.howItWorks}
                </a>
                <a
                  href="#templates"
                  className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                >
                  {t.templates}
                </a>
                <a
                  href="#pricing"
                  className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                >
                  {t.pricing}
                </a>
                <Link
                  href="/about"
                  className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                >
                  About
                </Link>
                <Link
                  href="/demo/interactive"
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 transition font-medium"
                >
                  Editor Demo
                </Link>
              </>
            ) : (
              // Other pages - show navigation links
              <>
                <Link
                  href="/dashboard"
                  className={`text-gray-900 dark:text-white hover:text-purple-600 transition ${
                    pathname === '/dashboard' ? 'text-purple-600' : ''
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/editor"
                  className={`text-gray-900 dark:text-white hover:text-purple-600 transition ${
                    pathname === '/editor' ? 'text-purple-600' : ''
                  }`}
                >
                  Editor
                </Link>
                <Link
                  href="/quick-start"
                  className={`text-gray-900 dark:text-white hover:text-purple-600 transition ${
                    pathname === '/quick-start' ? 'text-purple-600' : ''
                  }`}
                >
                  Quick Start
                </Link>
                <Link
                  href="/about"
                  className={`text-gray-900 dark:text-white hover:text-purple-600 transition ${
                    pathname === '/about' ? 'text-purple-600' : ''
                  }`}
                >
                  About
                </Link>
                <a
                  href="#pricing"
                  className="text-gray-900 dark:text-white hover:text-purple-600 transition"
                >
                  Pricing
                </a>
              </>
            )}

            {/* Language toggle for mobile */}
            <button
              className="text-gray-900 dark:text-white hover:text-purple-600 transition flex items-center space-x-2 py-2"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                logger.debug('Mobile language toggle clicked', {
                  current: language,
                  switching_to: otherLang?.code,
                  feature: 'header-mobile-language-toggle',
                });
                setLanguage(otherLang?.code || 'en');
              }}
              title={`${t.switchTo} ${otherLang?.name}`}
            >
              <span className="flag-icon">{currentLang?.flag}</span>
              <span className="text-sm font-medium">
                Switch to {otherLang?.name}
              </span>
            </button>

            {/* Currency toggle for mobile */}
            <button
              className="text-gray-900 dark:text-white hover:text-purple-600 transition flex items-center space-x-2 py-2"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setCurrency();
              }}
              title={`Switch currency (current: ${currency})`}
            >
              <span className="text-sm font-bold">
                {currencySymbols[currency]}
              </span>
              <span className="text-sm font-medium">Currency: {currency}</span>
            </button>

            {/* Dark mode toggle for mobile */}
            <button
              className="text-gray-900 dark:text-white hover:text-purple-600 transition flex items-center space-x-2 py-2"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                toggleDarkMode();
              }}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              {isDarkMode ? <Sun className="text-yellow-500" /> : <Moon />}
              <span className="text-sm font-medium">
                {isDarkMode ? 'Light mode' : 'Dark mode'}
              </span>
            </button>

            {/* Mobile Auth Section */}
            {loading ? (
              <div className="w-full h-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            ) : user ? (
              <div className="space-y-3">
                <div className="text-gray-900 dark:text-white font-medium border-t pt-3">
                  {t.hello}, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}!
                </div>
                <Link
                  href="/dashboard"
                  className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition text-center"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-gray-900 dark:text-white hover:text-purple-600 transition text-center py-2"
                >
                  <LogOut className="inline mr-2" />
                  {t.signOut}
                </button>
              </div>
            ) : (
              <div className="space-y-3 border-t pt-3">
                <Link
                  href="/auth/signin"
                  className="block w-full text-center text-gray-900 dark:text-white hover:text-purple-600 transition py-2"
                >
                  {t.signIn}
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition text-center"
                >
                  {t.getStarted}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

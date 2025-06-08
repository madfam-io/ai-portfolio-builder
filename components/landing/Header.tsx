'use client';

import { FaRocket, FaDollarSign, FaMoon, FaBars } from 'react-icons/fa';
import { useLanguage } from '@/lib/i18n/simple-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const pathname = usePathname();

  const currentLang = availableLanguages.find(lang => lang.code === language);
  const otherLang = availableLanguages.find(lang => lang.code !== language);

  // Check if we're on the landing page to show anchor links vs page links
  const isLandingPage = pathname === '/';

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full top-0 z-50 transition-colors duration-300">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <FaRocket className="text-2xl text-purple-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              MADFAM<span className="text-purple-600">.</span>AI
            </span>
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
                <a
                  href="#templates"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  {t.templates}
                </a>
                <a
                  href="#pricing"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  {t.pricing}
                </a>
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
                  href="/about"
                  className={`text-gray-600 dark:text-gray-300 hover:text-purple-600 transition ${
                    pathname === '/about' ? 'text-purple-600' : ''
                  }`}
                >
                  About
                </Link>
                <a
                  href="#pricing"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
                >
                  Pricing
                </a>
              </>
            )}

            <button
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition flex items-center space-x-1"
              data-currency-toggle
            >
              <FaDollarSign className="text-sm" />
              <span className="text-sm font-medium" data-currency-display>
                USD
              </span>
            </button>

            <button
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition flex items-center space-x-1 cursor-pointer"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Language toggle clicked!', {
                  current: language,
                  switching_to: otherLang?.code,
                });
                setLanguage(otherLang?.code || 'en');
              }}
              title={`Switch to ${otherLang?.name}`}
            >
              <span className="flag-icon">{currentLang?.flag}</span>
              <span className="text-sm font-medium">
                {language.toUpperCase()}
              </span>
            </button>

            <button
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition"
              data-dark-mode-toggle
            >
              <span data-dark-mode-icon>
                <FaMoon />
              </span>
            </button>

            {isLandingPage ? (
              <button
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                data-cta-button
              >
                {t.getStarted}
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              className="text-gray-600 dark:text-gray-300 p-2"
              data-mobile-menu-toggle
            >
              <span data-mobile-menu-icon>
                <FaBars className="text-xl" />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className="md:hidden mt-4 pb-4 border-t dark:border-gray-700"
          style={{ display: 'none' }}
          data-mobile-menu
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
                console.log('Mobile language toggle clicked!', {
                  current: language,
                  switching_to: otherLang?.code,
                });
                setLanguage(otherLang?.code || 'en');
              }}
              title={`Switch to ${otherLang?.name}`}
            >
              <span className="flag-icon">{currentLang?.flag}</span>
              <span className="text-sm font-medium">
                Switch to {otherLang?.name}
              </span>
            </button>

            {isLandingPage ? (
              <button
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                data-cta-button
              >
                {t.getStarted}
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition text-center block"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

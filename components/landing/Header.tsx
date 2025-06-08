import { FaRocket, FaDollarSign, FaMoon, FaBars } from 'react-icons/fa';

export default function Header() {
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
              data-translate="features"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
              data-translate="howItWorks"
            >
              How it Works
            </a>
            <a
              href="#templates"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
              data-translate="templates"
            >
              Templates
            </a>
            <a
              href="#pricing"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 transition"
              data-translate="pricing"
            >
              Pricing
            </a>

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
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 p-2 transition flex items-center space-x-1"
              data-lang-toggle
            >
              <span className="flag-icon" data-lang-flag>
                🇺🇸
              </span>
              <span className="text-sm font-medium" data-lang-display>
                EN
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

            <button
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              data-cta-button
              data-translate="getStarted"
            >
              Get Started
            </button>
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
            <a
              href="#features"
              className="text-gray-900 dark:text-white hover:text-purple-600 transition"
              data-translate="features"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-900 dark:text-white hover:text-purple-600 transition"
              data-translate="howItWorks"
            >
              How it Works
            </a>
            <a
              href="#templates"
              className="text-gray-900 dark:text-white hover:text-purple-600 transition"
              data-translate="templates"
            >
              Templates
            </a>
            <a
              href="#pricing"
              className="text-gray-900 dark:text-white hover:text-purple-600 transition"
              data-translate="pricing"
            >
              Pricing
            </a>
            <button
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
              data-cta-button
              data-translate="getStarted"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

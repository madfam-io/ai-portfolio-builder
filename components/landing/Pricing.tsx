'use client';

import { FaCheck } from 'react-icons/fa';
import { useLanguage } from '@/lib/i18n';

export default function Pricing() {
  const { t } = useLanguage();
  return (
    <section
      id="pricing"
      className="py-20 px-6 bg-gray-100 dark:bg-gray-800 transition-colors duration-300"
    >
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <span>{t.pricingTitle}</span>{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t.pricingSubtitle}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg transition-colors duration-300">
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Free
            </h3>
            <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              <span data-price="0">$0</span>
              <span className="text-lg text-gray-600 dark:text-gray-300">
                /month
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>1 portfolio</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>Basic templates</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>MADFAM subdomain</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>3 AI rewrites/month</span>
              </li>
            </ul>
            <button className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition">
              Start Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-purple-600 text-white p-8 rounded-xl shadow-lg transform scale-105">
            <div className="bg-yellow-400 text-purple-900 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-6">
              <span data-price="19">$19</span>
              <span className="text-lg opacity-80">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>3 portfolios</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>All templates</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>Custom domain</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>Unlimited AI rewrites</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>Analytics & SEO tools</span>
              </li>
            </ul>
            <button className="w-full bg-white text-purple-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
              Start Pro Trial
            </button>
          </div>

          {/* Business Plan */}
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg transition-colors duration-300">
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              Business
            </h3>
            <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              <span data-price="49">$49</span>
              <span className="text-lg text-gray-600 dark:text-gray-300">
                /month
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>Unlimited portfolios</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>White-label option</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>API access</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>Team collaboration</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>Priority support</span>
              </li>
            </ul>
            <button className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

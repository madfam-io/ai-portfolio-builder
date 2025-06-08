'use client';

import { FaCheck } from 'react-icons/fa';
import { useLanguage } from '@/lib/i18n/minimal-context';
import { useApp } from '@/lib/contexts/AppContext';

// Currency exchange rates (MXN as base)
const EXCHANGE_RATES = {
  MXN: 1,
  USD: 0.056, // 1 MXN = ~0.056 USD
  EUR: 0.052, // 1 MXN = ~0.052 EUR
};

// Base prices in MXN
const BASE_PRICES = {
  free: 0,
  pro: 340, // ~$19 USD
  business: 875, // ~$49 USD
};

const CURRENCY_SYMBOLS = {
  MXN: '$',
  USD: '$',
  EUR: '€',
};

export default function Pricing() {
  const { t } = useLanguage();
  const { currency } = useApp();

  const formatPrice = (basePriceMXN: number) => {
    if (basePriceMXN === 0) return '0';
    
    const convertedPrice = Math.round(basePriceMXN * EXCHANGE_RATES[currency]);
    const symbol = CURRENCY_SYMBOLS[currency];
    
    return `${symbol}${convertedPrice}`;
  };
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
              {t.powerfulFeatures}
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
              {t.planFree}
            </h3>
            <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              <span data-price="0">{formatPrice(BASE_PRICES.free)}</span>
              <span className="text-lg text-gray-600 dark:text-gray-300">
                {t.perMonth}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>{t.portfolio1}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>{t.basicTemplates}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>{t.madfamSubdomain}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>{t.aiRewrites3}</span>
              </li>
            </ul>
            <button className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition">
              {t.startFree}
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-purple-600 text-white p-8 rounded-xl shadow-lg transform scale-105">
            <div className="bg-yellow-400 text-purple-900 text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
              {t.mostPopular}
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.planPro}</h3>
            <div className="text-4xl font-bold mb-6">
              <span data-price="19">{formatPrice(BASE_PRICES.pro)}</span>
              <span className="text-lg opacity-80">{t.perMonth}</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.portfolios3}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.allTemplates}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.customDomain}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.unlimitedAiRewrites}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.analyticsTools}</span>
              </li>
            </ul>
            <button className="w-full bg-white text-purple-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
              {t.startProTrial}
            </button>
          </div>

          {/* Business Plan */}
          <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-lg transition-colors duration-300">
            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {t.planBusiness}
            </h3>
            <div className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
              <span data-price="49">{formatPrice(BASE_PRICES.business)}</span>
              <span className="text-lg text-gray-600 dark:text-gray-300">
                {t.perMonth}
              </span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>{t.unlimitedPortfolios}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>{t.whiteLabelOption}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>{t.apiAccess}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>{t.teamCollaboration}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <span>{t.prioritySupport}</span>
              </li>
            </ul>
            <button className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 transition">
              {t.contactSales}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

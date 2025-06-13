'use client';

import Link from 'next/link';
import React from 'react';
import { FaCheck } from 'react-icons/fa';

import { useApp } from '@/lib/contexts/AppContext';
import { useLanguage } from '@/lib/i18n/refactored-context';

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
  enterprise: 1750, // ~$99 USD
};

const CURRENCY_SYMBOLS = {
  MXN: '$',
  USD: '$',
  EUR: '€',
};

export default function Pricing(): React.ReactElement {
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

        {/* Limited Time Offer Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-4 rounded-lg text-center mb-12 shadow-lg">
          <p className="font-bold text-lg">{t.pricingLimitedOffer}</p>
          <p className="text-sm mt-1">{t.pricingOfferExpires}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
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
            <Link
              href="/auth/signup?plan=free"
              className="block w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900 transition text-center"
            >
              {t.startFree}
            </Link>
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
            <Link
              href="/auth/signup?plan=pro"
              className="block w-full bg-white text-purple-600 py-3 rounded-lg font-medium hover:bg-gray-100 transition text-center"
            >
              {t.startProTrial}
            </Link>
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
            <div className="space-y-3">
              <Link
                href="/auth/signup?plan=business"
                className="block w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition text-center"
              >
                {t.pricingStartBusinessTrial}
              </Link>
              <Link
                href="/contact?plan=business"
                className="block w-full border-2 border-purple-600 text-purple-600 dark:text-purple-400 py-2 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900 transition text-center text-sm"
              >
                {t.pricingContactSalesTeam}
              </Link>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-bl-lg">
              {t.pricingMostPowerful}
            </div>
            <h3 className="text-2xl font-bold mb-2">{t.planEnterprise}</h3>
            <div className="text-4xl font-bold mb-6">
              <span data-price="99">{formatPrice(BASE_PRICES.enterprise)}</span>
              <span className="text-lg opacity-80">{t.perMonth}</span>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.pricingEverythingInBusiness}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.pricingWhiteLabelSolutions}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.pricingDedicatedManager}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.pricingCustomIntegrations}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.pricing24Support}</span>
              </li>
              <li className="flex items-center">
                <FaCheck className="mr-3" />
                <span>{t.pricingSlaGuarantees}</span>
              </li>
            </ul>
            <div className="space-y-3">
              <Link
                href="/auth/signup?plan=enterprise"
                className="block w-full bg-yellow-400 text-gray-900 py-3 rounded-lg font-medium hover:bg-yellow-300 transition text-center"
              >
                {t.pricingStartEnterpriseTrial}
              </Link>
              <Link
                href="/contact?plan=enterprise"
                className="block w-full border-2 border-yellow-400 text-yellow-400 py-2 rounded-lg font-medium hover:bg-yellow-400 hover:text-gray-900 transition text-center text-sm"
              >
                {t.pricingRequestQuote}
              </Link>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t.pricingSecurePayment} • {t.pricingNoHiddenFees} •{' '}
            {t.pricingCancelAnytime}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span>{t.pricingMoneyBack}</span>
            <span>{t.pricingNoSetupFees}</span>
            <span>{t.pricingFreeMigration}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

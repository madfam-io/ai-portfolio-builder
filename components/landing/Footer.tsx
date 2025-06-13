'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import FaTwitter from 'react-icons/fa/FaTwitter';
import FaLinkedinIn from 'react-icons/fa/FaLinkedinIn';
import FaGithub from 'react-icons/fa/FaGithub';

import { useLanguage } from '@/lib/i18n/refactored-context';
import { getCurrentYear } from '@/lib/utils/date';

export default function Footer(): JSX.Element (): React.ReactElement {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300 py-12 px-6 transition-colors duration-300">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/prisma-logo.png"
                alt="PRISMA Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                  PRISMA
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  by MADFAM
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {t.footerTagline}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t.footerProduct}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerFeatures}
                </a>
              </li>
              <li>
                <a
                  href="#templates"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerTemplates}
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerPricing}
                </a>
              </li>
              <li>
                <Link
                  href="/api"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerApi}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t.footerCompany}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerAbout}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerBlog}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerCareers}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerContact}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {t.footerLegal}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerPrivacy}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerTerms}
                </Link>
              </li>
              <li>
                <Link
                  href="/gdpr"
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
                >
                  {t.footerGdpr}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-300 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0 text-gray-600 dark:text-gray-300">
            © {getCurrentYear()} PRISMA by MADFAM. {t.footerAllRightsReserved}
          </p>
          <div className="flex justify-center md:justify-end space-x-6">
            <a
              href="https://twitter.com/prisma_ai"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow PRISMA on Twitter"
            >
              <FaTwitter className="text-xl" />
            </a>
            <a
              href="https://linkedin.com/company/prisma-by-madfam"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow PRISMA on LinkedIn"
            >
              <FaLinkedinIn className="text-xl" />
            </a>
            <a
              href="https://github.com/aldoruizluna/ai-portfolio-builder"
              className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View PRISMA on GitHub"
            >
              <FaGithub className="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

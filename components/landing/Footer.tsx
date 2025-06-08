'use client';

import { FaRocket, FaTwitter, FaLinkedinIn, FaGithub } from 'react-icons/fa';
import { useLanguage } from '@/lib/i18n/minimal-context';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <FaRocket className="text-2xl text-purple-400" />
              <span className="text-xl font-bold text-white">MADFAM.AI</span>
            </div>
            <p className="text-sm">{t.footerTagline}</p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t.footerProduct}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">
                  {t.footerFeatures}
                </a>
              </li>
              <li>
                <a href="#templates" className="hover:text-white transition">
                  {t.footerTemplates}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  {t.footerPricing}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t.footerApi}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t.footerCompany}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  {t.footerAbout}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t.footerBlog}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t.footerCareers}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t.footerContact}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t.footerLegal}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-white transition">
                  {t.footerPrivacy}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t.footerTerms}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition">
                  {t.footerGdpr}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm mb-4 md:mb-0">
            {t.footerCopyright}
          </p>
          <div className="flex justify-center md:justify-end space-x-6">
            <a href="#" className="hover:text-white transition">
              <FaTwitter className="text-xl" />
            </a>
            <a href="#" className="hover:text-white transition">
              <FaLinkedinIn className="text-xl" />
            </a>
            <a
              href="https://github.com/madfam-io/"
              className="hover:text-white transition"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub className="text-xl" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

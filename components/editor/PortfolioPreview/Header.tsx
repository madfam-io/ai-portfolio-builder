/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
import {
  Linkedin as FiLinkedin,
  Github as FiGithub,
  Twitter as FiTwitter,
  ExternalLink as FiExternalLink,
} from 'lucide-react';
import { SectionProps } from './types';
import { getActiveSocialLinks } from './utils';

export function PortfolioHeader({ portfolio }: SectionProps) {
  const socialLinks = getActiveSocialLinks(portfolio);

  return (
    <header
      data-testid="portfolio-header"
      className={`text-center py-8 px-6 ${
        portfolio.customization.headerStyle === 'bold' ? 'header-bold' : ''
      }`}
    >
      {portfolio.avatarUrl && (
        <div className="relative w-24 h-24 mx-auto mb-4">
          <Image
            src={portfolio.avatarUrl}
            alt={portfolio.name}
            fill
            className="rounded-full object-cover"
          />
        </div>
      )}

      <h1
        data-testid="preview-name"
        className="text-3xl md:text-4xl font-bold mb-2"
      >
        {portfolio.name}
      </h1>

      <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
        {portfolio.title}
      </p>

      {portfolio.tagline && (
        <p className="text-lg text-gray-500 dark:text-gray-500 italic">
          {portfolio.tagline}
        </p>
      )}

      {/* Contact Info */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        {portfolio.contact.location && (
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{portfolio.contact.location}</span>
          </div>
        )}
        {portfolio.contact.availability && (
          <div className="flex items-center gap-1">
            <span>{portfolio.contact.availability}</span>
          </div>
        )}
      </div>

      {/* Social Links */}
      {socialLinks.length > 0 && (
        <div className="mt-4 flex justify-center gap-4">
          {socialLinks.map(({ platform, url }) => {
            const Icon =
              platform === 'linkedin'
                ? FiLinkedin
                : platform === 'github'
                  ? FiGithub
                  : platform === 'twitter'
                    ? FiTwitter
                    : FiExternalLink;
            const platformName =
              platform.charAt(0).toUpperCase() + platform.slice(1);
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platformName}
                className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <Icon size={20} />
              </a>
            );
          })}
        </div>
      )}
    </header>
  );
}

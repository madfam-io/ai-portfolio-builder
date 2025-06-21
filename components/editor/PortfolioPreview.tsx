/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import React from 'react';
import { PortfolioPreviewProps } from './PortfolioPreview/types';
import {
  getContainerClasses,
  getCustomStyles,
  getVisibleSections,
} from './PortfolioPreview/utils';
import { PortfolioHeader } from './PortfolioPreview/Header';
import { AboutSection } from './PortfolioPreview/sections/AboutSection';
import { ExperienceSection } from './PortfolioPreview/sections/ExperienceSection';
import { ProjectsSection } from './PortfolioPreview/sections/ProjectsSection';
import { SkillsSection } from './PortfolioPreview/sections/SkillsSection';
import { EducationSection } from './PortfolioPreview/sections/EducationSection';
import { CertificationsSection } from './PortfolioPreview/sections/CertificationsSection';
import { ContactSection } from './PortfolioPreview/sections/ContactSection';
import { DesignerTemplate } from './PortfolioPreview/templates/DesignerTemplate';
import { ConsultantTemplate } from './PortfolioPreview/templates/ConsultantTemplate';

export const PortfolioPreview = React.memo(function PortfolioPreview({
  portfolio,
  mode = 'desktop',
  activeSection,
  onSectionClick,
  isInteractive = true,
}: PortfolioPreviewProps) {
  // Apply custom CSS variables
  const customStyles = getCustomStyles(portfolio);

  // Use the mode prop to determine layout
  const isMobile = mode === 'mobile';
  const isTablet = mode === 'tablet';
  const isDesktop = mode === 'desktop';

  // Get visible sections
  const hasContent = getVisibleSections(portfolio);

  // Template-specific rendering
  const renderTemplateSpecific = (): React.ReactElement | null => {
    switch (portfolio.template) {
      case 'designer':
        return <DesignerTemplate portfolio={portfolio} />;
      case 'consultant':
        return <ConsultantTemplate portfolio={portfolio} />;
      default:
        return null;
    }
  };

  return (
    <div
      data-testid="portfolio-container"
      className={`w-full ${getContainerClasses(mode)} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
        isMobile ? 'mobile-layout' : ''
      } ${isTablet ? 'tablet-layout' : ''} ${isDesktop ? 'desktop-layout' : ''}`}
      style={customStyles}
    >
      {/* Header */}
      <PortfolioHeader portfolio={portfolio} />

      {/* Main Content */}
      <main className="px-6 pb-8 space-y-8">
        {/* About Section */}
        {hasContent.about && (
          <AboutSection
            portfolio={portfolio}
            activeSection={activeSection}
            onSectionClick={onSectionClick}
            isInteractive={isInteractive}
          />
        )}

        {/* Experience Section */}
        {hasContent.experience && (
          <ExperienceSection
            portfolio={portfolio}
            activeSection={activeSection}
            onSectionClick={onSectionClick}
            isInteractive={isInteractive}
          />
        )}

        {/* Projects Section */}
        {hasContent.projects && (
          <ProjectsSection
            portfolio={portfolio}
            activeSection={activeSection}
            onSectionClick={onSectionClick}
            isInteractive={isInteractive}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        )}

        {/* Skills Section */}
        {hasContent.skills && (
          <SkillsSection
            portfolio={portfolio}
            activeSection={activeSection}
            onSectionClick={onSectionClick}
            isInteractive={isInteractive}
          />
        )}

        {/* Education Section */}
        {hasContent.education && (
          <EducationSection
            portfolio={portfolio}
            activeSection={activeSection}
            onSectionClick={onSectionClick}
            isInteractive={isInteractive}
          />
        )}

        {/* Certifications Section */}
        {hasContent.certifications && (
          <CertificationsSection portfolio={portfolio} />
        )}

        {/* Template-specific content */}
        {renderTemplateSpecific()}

        {/* Contact Section */}
        <ContactSection portfolio={portfolio} />
      </main>
    </div>
  );
});

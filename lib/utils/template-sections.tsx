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

import { Portfolio, SectionType } from '@/types/portfolio';

// Default section order
export const DEFAULT_SECTION_ORDER: SectionType[] = [
  'hero',
  'about',
  'experience',
  'projects',
  'skills',
  'education',
  'certifications',
  'contact',
];

// Maps section types to their render components
export interface SectionRenderMap {
  hero?: () => React.ReactNode;
  about?: () => React.ReactNode;
  experience?: () => React.ReactNode;
  projects?: () => React.ReactNode;
  skills?: () => React.ReactNode;
  education?: () => React.ReactNode;
  certifications?: () => React.ReactNode;
  contact?: () => React.ReactNode;
  custom?: () => React.ReactNode;
}

/**
 * Get the ordered list of sections based on portfolio customization
 */
export function getOrderedSections(portfolio: Portfolio): SectionType[] {
  const customOrder = portfolio.customization?.sectionOrder as SectionType[];
  return customOrder || DEFAULT_SECTION_ORDER;
}

/**
 * Check if a section should be visible based on portfolio customization
 */
export function isSectionVisible(
  portfolio: Portfolio,
  section: string
): boolean {
  const hiddenSections = portfolio.customization?.hiddenSections || [];
  return !hiddenSections.includes(section);
}

/**
 * Render sections in the correct order with visibility filtering
 */
export function renderSections(
  portfolio: Portfolio,
  sectionRenderMap: SectionRenderMap
): React.ReactNode[] {
  const orderedSections = getOrderedSections(portfolio);

  return orderedSections
    .filter(section => isSectionVisible(portfolio, section))
    .map(section => {
      const renderFn = sectionRenderMap[section as keyof SectionRenderMap];
      if (!renderFn) return null;

      return (
        <div key={section} id={section} className="portfolio-section">
          {renderFn()}
        </div>
      );
    })
    .filter(Boolean) as React.ReactNode[];
}

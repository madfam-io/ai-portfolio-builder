'use client';

import { SectionProps } from '../types';
import { getSectionClasses } from '../utils';

export function AboutSection({
  portfolio,
  activeSection,
  onSectionClick,
  isInteractive,
}: SectionProps) {
  const handleSectionClick = () => {
    if (isInteractive && onSectionClick) {
      onSectionClick('about');
    }
  };

  return (
    <section
      id="about-section"
      data-testid="about-section"
      className={getSectionClasses('about', activeSection, isInteractive)}
      onClick={handleSectionClick}
    >
      <h2 className="text-2xl font-bold mb-4">About</h2>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {portfolio.bio}
      </p>
    </section>
  );
}

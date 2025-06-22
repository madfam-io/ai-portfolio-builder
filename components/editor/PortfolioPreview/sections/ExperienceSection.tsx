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

import { SectionProps } from '../types';
import { getSectionClasses } from '../utils';

export function ExperienceSection({
  portfolio,
  activeSection,
  onSectionClick,
  isInteractive,
}: SectionProps) {
  const handleSectionClick = () => {
    if (isInteractive && onSectionClick) {
      onSectionClick('experience');
    }
  };

  return (
    <section
      id="experience-section"
      data-testid="experience-section"
      className={getSectionClasses('experience', activeSection, isInteractive)}
      onClick={handleSectionClick}
    >
      <h2 className="text-2xl font-bold mb-4">Experience</h2>
      <div className="space-y-6">
        {portfolio.experience
          .sort((a, b) => (b.current ? 1 : 0) - (a.current ? 1 : 0))
          .map(exp => (
            <div
              key={exp.id}
              data-testid="experience-item"
              className="border-l-2 border-gray-200 dark:border-gray-700 pl-4"
            >
              <h3 className="text-lg font-semibold">{exp.position}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                {exp.company}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                {exp.description}
              </p>

              {exp.highlights && exp.highlights.length > 0 && (
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm space-y-1">
                  {exp.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              )}

              {exp.technologies && exp.technologies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {exp.technologies.map(tech => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    </section>
  );
}

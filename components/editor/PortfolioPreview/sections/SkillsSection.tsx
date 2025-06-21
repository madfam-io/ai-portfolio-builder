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

import { SectionProps } from '../types';
import { getSectionClasses, skillLevelToPercentage } from '../utils';

export function SkillsSection({
  portfolio,
  activeSection,
  onSectionClick,
  isInteractive,
}: SectionProps) {
  const handleSectionClick = () => {
    if (isInteractive && onSectionClick) {
      onSectionClick('skills');
    }
  };

  // Group skills by category
  const skillsByCategory = portfolio.skills.reduce(
    (acc, skill) => {
      const category = skill.category || 'General';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, typeof portfolio.skills>
  );

  return (
    <section
      id="skills-section"
      data-testid="skills-section"
      className={getSectionClasses('skills', activeSection, isInteractive)}
      onClick={handleSectionClick}
    >
      <h2 className="text-2xl font-bold mb-4">Skills</h2>
      {Object.entries(skillsByCategory).map(([category, skills]) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-semibold mb-3">{category}</h3>
          <div className="grid gap-3">
            {skills.map(skill => (
              <div
                key={skill.name}
                data-testid={`skill-${skill.name}`}
                data-level={skill.level}
                className="flex items-center justify-between"
              >
                <span className="font-medium">{skill.name}</span>
                {skill.level && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {skill.level}
                    </span>
                    <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded">
                      <div
                        className="skill-level-bar h-full bg-blue-600 rounded"
                        style={{
                          width: `${skillLevelToPercentage[skill.level]}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

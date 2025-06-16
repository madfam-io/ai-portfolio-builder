'use client';

import { SectionProps } from '../types';
import { getSectionClasses } from '../utils';

export function EducationSection({
  portfolio,
  activeSection,
  onSectionClick,
  isInteractive,
}: SectionProps) {
  const handleSectionClick = () => {
    if (isInteractive && onSectionClick) {
      onSectionClick('education');
    }
  };

  return (
    <section
      id="education-section"
      data-testid="education-section"
      className={getSectionClasses('education', activeSection, isInteractive)}
      onClick={handleSectionClick}
    >
      <h2 className="text-2xl font-bold mb-4">Education</h2>
      <div className="space-y-4">
        {portfolio.education.map(edu => (
          <div
            key={edu.id}
            className="border-l-2 border-gray-200 dark:border-gray-700 pl-4"
          >
            <h3 className="text-lg font-semibold">{edu.institution}</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              {edu.degree} in {edu.field}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
            </p>
            {edu.achievements && edu.achievements.length > 0 && (
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-sm mt-2">
                {edu.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

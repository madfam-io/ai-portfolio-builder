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
import { Github } from 'lucide-react';
import { SectionProps } from '../types';
import { getSectionClasses } from '../utils';

interface ProjectsSectionProps extends SectionProps {
  isMobile?: boolean;
  isTablet?: boolean;
}

export function ProjectsSection({
  portfolio,
  activeSection,
  onSectionClick,
  isInteractive,
  isMobile,
  isTablet,
}: ProjectsSectionProps) {
  const handleSectionClick = () => {
    if (isInteractive && onSectionClick) {
      onSectionClick('projects');
    }
  };

  return (
    <section
      id="projects-section"
      data-testid="projects-section"
      className={getSectionClasses('projects', activeSection, isInteractive)}
      onClick={handleSectionClick}
    >
      <h2 className="text-2xl font-bold mb-4">Projects</h2>
      <div
        data-testid="projects-grid"
        className={`grid gap-6 ${
          isMobile
            ? 'grid-cols-1'
            : isTablet
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-2'
        }`}
      >
        {portfolio.projects
          .sort(
            (a, b) =>
              (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
              (a.order || 0) - (b.order || 0)
          )
          .map(project => (
            <div
              key={project.id}
              data-testid={
                project.featured ? 'featured-project' : 'project-item'
              }
              className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
                project.featured ? 'featured ring-2 ring-blue-500' : ''
              }`}
            >
              {project.imageUrl && (
                <div className="relative w-full h-48">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {project.description}
                </p>

                {project.highlights && project.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {project.highlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  {project.technologies.map(tech => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.title} project`}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      View Project
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
                    >
                      <Github className="inline mr-1" />
                      Code
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}

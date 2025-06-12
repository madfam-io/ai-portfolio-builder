'use client';

import Image from 'next/image';
import React from 'react';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiGithub,
  FiLinkedin,
  FiTwitter,
  FiExternalLink,
} from 'react-icons/fi';

import { Portfolio } from '@/types/portfolio';

interface PortfolioPreviewProps {
  portfolio: Portfolio;
  mode?: 'desktop' | 'tablet' | 'mobile';
  activeSection?: string;
  onSectionClick?: (section: string) => void;
  isInteractive?: boolean;
}

export const PortfolioPreview = React.memo(function PortfolioPreview({
  portfolio,
  mode = 'desktop',
  activeSection,
  onSectionClick,
  isInteractive = true,
}: PortfolioPreviewProps) {
  // Apply custom CSS variables
  const customStyles = {
    '--primary-color': portfolio.customization.primaryColor || '#1a73e8',
    '--secondary-color': portfolio.customization.secondaryColor || '#34a853',
    '--accent-color': portfolio.customization.accentColor || '#ea4335',
    fontFamily: portfolio.customization.fontFamily
      ? `${portfolio.customization.fontFamily}, sans-serif`
      : undefined,
  } as React.CSSProperties;

  // Use the mode prop to determine layout
  const isMobile = mode === 'mobile';
  const isTablet = mode === 'tablet';
  const isDesktop = mode === 'desktop';

  // Get container classes based on preview mode
  const getContainerClasses = () => {
    if (mode === 'mobile') {
      return 'max-w-sm mx-auto';
    }
    if (mode === 'tablet') {
      return 'max-w-2xl mx-auto';
    }
    return 'max-w-4xl mx-auto';
  };

  // Handle section clicks for editor interaction
  const handleSectionClick = (sectionId: string) => {
    if (isInteractive && onSectionClick) {
      onSectionClick(sectionId);
    }
  };

  // Get section classes for highlighting active section
  const getSectionClasses = (sectionId: string) => {
    const baseClasses = isInteractive
      ? 'cursor-pointer transition-all duration-200'
      : '';
    const activeClasses =
      activeSection === sectionId && isInteractive
        ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-900/20'
        : '';
    const hoverClasses = isInteractive
      ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      : '';

    return `${baseClasses} ${activeClasses} ${hoverClasses} rounded-lg p-2 -m-2`;
  };

  // Filter out empty sections and respect hidden sections
  const hiddenSections = portfolio.customization.hiddenSections || [];
  const hasContent = {
    about: Boolean(portfolio.bio) && !hiddenSections.includes('about'),
    experience:
      portfolio.experience.length > 0 && !hiddenSections.includes('experience'),
    education:
      portfolio.education.length > 0 && !hiddenSections.includes('education'),
    projects:
      portfolio.projects.length > 0 && !hiddenSections.includes('projects'),
    skills: portfolio.skills.length > 0 && !hiddenSections.includes('skills'),
    certifications:
      portfolio.certifications.length > 0 &&
      !hiddenSections.includes('certifications'),
  };

  // Get social links with values
  const socialLinks = Object.entries(portfolio.social)
    .filter(([_, url]) => url && url.trim() !== '')
    .map(([platform, url]) => ({ platform, url }));

  // Skill level to percentage mapping
  const skillLevelToPercentage = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };

  // Template-specific rendering
  const renderTemplateSpecific = () => {
    switch (portfolio.template) {
      case 'designer':
        return (
          <div data-testid="designer-template">
            <div
              data-testid="portfolio-grid"
              className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6"
            >
              {portfolio.projects.map(project => (
                <div
                  key={project.id}
                  className="relative aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden"
                >
                  {project.imageUrl ? (
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      {project.title}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      case 'consultant':
        return (
          <div data-testid="consultant-template">
            <div
              data-testid="credentials-section"
              className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <h3 className="font-semibold mb-2">Credentials & Expertise</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Certifications
                  </h4>
                  {portfolio.certifications.map(cert => (
                    <p key={cert.id} className="text-sm">
                      {cert.name}
                    </p>
                  ))}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Experience
                  </h4>
                  <p className="text-sm">
                    {portfolio.experience.length} positions
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      data-testid="portfolio-container"
      className={`w-full ${getContainerClasses()} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 ${
        isMobile ? 'mobile-layout' : ''
      } ${isTablet ? 'tablet-layout' : ''} ${isDesktop ? 'desktop-layout' : ''}`}
      style={customStyles}
    >
      {/* Header */}
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
              <FiMapPin size={16} />
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

      {/* Main Content */}
      <main className="px-6 pb-8 space-y-8">
        {/* About Section */}
        {hasContent.about && (
          <section
            id="about-section"
            data-testid="about-section"
            className={getSectionClasses('about')}
            onClick={() => handleSectionClick('about')}
          >
            <h2 className="text-2xl font-bold mb-4">About</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {portfolio.bio}
            </p>
          </section>
        )}

        {/* Experience Section */}
        {hasContent.experience && (
          <section
            id="experience-section"
            data-testid="experience-section"
            className={getSectionClasses('experience')}
            onClick={() => handleSectionClick('experience')}
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
        )}

        {/* Projects Section */}
        {hasContent.projects && (
          <section
            id="projects-section"
            data-testid="projects-section"
            className={getSectionClasses('projects')}
            onClick={() => handleSectionClick('projects')}
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
                      <h3 className="text-lg font-semibold mb-2">
                        {project.title}
                      </h3>
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
                            <FiGithub className="inline mr-1" />
                            Code
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {hasContent.skills && (
          <section
            id="skills-section"
            data-testid="skills-section"
            className={getSectionClasses('skills')}
            onClick={() => handleSectionClick('skills')}
          >
            <h2 className="text-2xl font-bold mb-4">Skills</h2>
            {Object.entries(
              portfolio.skills.reduce(
                (acc, skill) => {
                  const category = skill.category || 'General';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(skill);
                  return acc;
                },
                {} as Record<string, typeof portfolio.skills>
              )
            ).map(([category, skills]) => (
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
        )}

        {/* Education Section */}
        {hasContent.education && (
          <section
            id="education-section"
            data-testid="education-section"
            className={getSectionClasses('education')}
            onClick={() => handleSectionClick('education')}
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
        )}

        {/* Certifications Section */}
        {hasContent.certifications && (
          <section
            id="certifications-section"
            data-testid="certifications-section"
          >
            <h2 className="text-2xl font-bold mb-4">Certifications</h2>
            <div className="grid gap-4">
              {portfolio.certifications.map(cert => (
                <div
                  key={cert.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  {cert.credentialUrl ? (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {cert.name}
                    </a>
                  ) : (
                    <h3 className="text-lg font-semibold">{cert.name}</h3>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">
                    {cert.issuer}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Issued: {cert.issueDate}
                    {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                  </p>
                  {cert.credentialId && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Credential ID: {cert.credentialId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Template-specific content */}
        {renderTemplateSpecific()}

        {/* Contact Section */}
        <section className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Get In Touch</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {portfolio.contact.email && (
              <a
                href={`mailto:${portfolio.contact.email}`}
                aria-label={`Email ${portfolio.name}`}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <FiMail />
                {portfolio.contact.email}
              </a>
            )}
            {portfolio.contact.phone && (
              <a
                href={`tel:${portfolio.contact.phone}`}
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline"
              >
                <FiPhone />
                {portfolio.contact.phone}
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
});

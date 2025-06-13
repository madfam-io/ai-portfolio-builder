'use client';

import {
  Code,
  Download,
  ExternalLink,
  Github,
  Linkedin,
  Mail,
  Twitter,
} from 'lucide-react';
import React from 'react';

import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { Portfolio } from '@/types/portfolio';

/**
 * @fileoverview Developer Portfolio Template
 *
 * A professional template designed specifically for developers and technical professionals.
 * Features a clean, code-focused design with emphasis on technical skills, GitHub integration,
 * and project showcases.
 *
 * Design Features:
 * - Gradient hero section with technical iconography
 * - Skills organized by category with proficiency indicators
 * - Project cards with GitHub and live demo links
 * - Experience timeline with technical focus
 * - Social links optimized for developer platforms
 *
 * Color Scheme: Blue-based with technical accent colors
 * Target Audience: Software developers, engineers, technical leads
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha
 */

/**
 * Props interface for the Developer Template component
 */
interface DeveloperTemplateProps {
  /** Portfolio data to render in the developer template */
  portfolio: Portfolio;
}

/**
 * Developer Portfolio Template Component
 *
 * Renders a complete developer-focused portfolio with technical emphasis.
 * Supports custom theming through portfolio customization settings.
 */
export function DeveloperTemplate({ portfolio }: DeveloperTemplateProps) {
  // Extract theme colors with developer-friendly defaults
  const primaryColor = portfolio.customization.primaryColor || '#2563eb'; // Blue primary
  const secondaryColor = portfolio.customization.secondaryColor || '#1e40af'; // Darker blue secondary

  // CSS custom properties for dynamic theming
  const customStyles = {
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      style={customStyles}
    >
      {/* Hero Section - Technical gradient with professional introduction */}
      <header className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                {portfolio.name}
              </h1>
              <h2 className="text-xl md:text-2xl text-blue-100 mb-6">
                {portfolio.title}
              </h2>
              <p className="text-lg text-blue-50 mb-8 leading-relaxed">
                {portfolio.bio}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  style={{ backgroundColor: primaryColor }}
                  className="px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Mail />
                  Get In Touch
                </button>
                <button className="px-6 py-3 border border-white/30 rounded-lg font-semibold hover:bg-white/10 transition-all flex items-center gap-2">
                  <Download />
                  Download CV
                </button>
              </div>
            </div>

            {/* Profile Image/Avatar */}
            <div className="flex justify-center">
              {portfolio.avatarUrl ? (
                <OptimizedImage
                  src={portfolio.avatarUrl}
                  alt={portfolio.name}
                  width={256}
                  height={256}
                  className="w-64 h-64 rounded-full object-cover shadow-2xl"
                  priority
                />
              ) : (
                <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                  <Code className="w-24 h-24 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Technical Skills Section - Categorized with proficiency levels */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            Technical Skills
          </h2>
          <div className="grid gap-6">
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
              <div key={category}>
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {skills.map(skill => (
                    <div key={skill.name} className="group">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {skill.name}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {skill.level}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: primaryColor,
                              width:
                                skill.level === 'expert'
                                  ? '95%'
                                  : skill.level === 'advanced'
                                    ? '80%'
                                    : skill.level === 'intermediate'
                                      ? '65%'
                                      : '45%',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section - Technical project showcase */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            Featured Projects
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio.projects
              .filter(p => p.featured)
              .map(project => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
                >
                  {project.imageUrl ? (
                    <OptimizedImage
                      src={project.imageUrl}
                      alt={project.title}
                      width={400}
                      height={192}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                      <Code className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies?.slice(0, 3).map(tech => (
                        <span
                          key={tech}
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{
                            backgroundColor: `${primaryColor}20`,
                            color: primaryColor,
                          }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex gap-3">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Live Demo
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-700 text-sm font-medium"
                        >
                          <Github className="w-4 h-4" />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Professional Experience Section - Timeline format */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">
            Experience
          </h2>
          <div className="space-y-8">
            {portfolio.experience.map(exp => (
              <div
                key={exp.id}
                className="relative pl-8 border-l-2 border-blue-200 dark:border-blue-800"
              >
                <div className="absolute w-4 h-4 bg-blue-600 rounded-full -left-2 top-2"></div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {exp.position}
                    </h3>
                    <span className="text-blue-600 font-medium">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  <h4 className="text-lg text-gray-700 dark:text-gray-300 mb-3">
                    {exp.company}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Social Links Section - Developer-focused platforms */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">Let&apos;s Work Together</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            I&apos;m always interested in new opportunities and exciting
            projects.
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-8">
            {portfolio.social.github && (
              <a
                href={portfolio.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
            )}
            {portfolio.social.linkedin && (
              <a
                href={portfolio.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            )}
            {portfolio.social.twitter && (
              <a
                href={portfolio.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
            )}
          </div>

          <button
            style={{ backgroundColor: primaryColor }}
            className="px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all"
          >
            Get In Touch
          </button>
        </div>
      </section>
    </div>
  );
}

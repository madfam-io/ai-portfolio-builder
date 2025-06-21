'use client';

import React from 'react';
import Image from 'next/image';
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Globe,
  Calendar,
  Star,
  ExternalLink,
} from 'lucide-react';

import { Portfolio } from '@/types/portfolio';

/**
 * @fileoverview Modern Portfolio Template
 *
 * A sleek, contemporary template featuring clean lines, bold typography,
 * and modern design principles. Perfect for professionals who want a
 * sophisticated yet approachable online presence.
 *
 * Design Features:
 * - Dark theme with neon accent colors
 * - Glass morphism effects and subtle animations
 * - Grid-based layout with clear sections
 * - Modern typography hierarchy
 * - Hover effects and smooth transitions
 * - Mobile-first responsive design
 *
 * Color Scheme: Dark background with cyan/blue accents
 * Target Audience: Tech professionals, startup founders, modern professionals
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

interface ModernTemplateProps {
  portfolio: Portfolio;
}

export function ModernTemplate({ portfolio }: ModernTemplateProps) {
  const socialLinks = [
    { platform: 'github', url: portfolio.social?.github, icon: Github },
    { platform: 'linkedin', url: portfolio.social?.linkedin, icon: Linkedin },
    { platform: 'twitter', url: portfolio.social?.twitter, icon: Twitter },
    { platform: 'website', url: portfolio.social?.website, icon: Globe },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-gray-900 to-gray-900"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-16">
          <div className="max-w-6xl mx-auto text-center">
            {/* Avatar */}
            {portfolio.avatarUrl && (
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 p-1">
                    <Image
                      src={portfolio.avatarUrl}
                      alt={portfolio.name}
                      width={120}
                      height={120}
                      className="w-full h-full rounded-full object-cover bg-gray-800"
                    />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-full blur-xl"></div>
                </div>
              </div>
            )}

            {/* Name & Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              {portfolio.name}
            </h1>
            <h2 className="text-xl md:text-2xl text-cyan-400 font-light mb-6 tracking-wide">
              {portfolio.title}
            </h2>

            {/* Location */}
            {portfolio.location && (
              <div className="flex items-center justify-center text-gray-400 mb-8">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{portfolio.location}</span>
              </div>
            )}

            {/* Bio */}
            {portfolio.bio && (
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                {portfolio.bio}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex justify-center space-x-6 mb-12">
                {socialLinks.map(({ platform, url, icon: Icon }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300 group"
                  >
                    <Icon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
                  </a>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {portfolio.contact?.email && (
                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="inline-flex items-center px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Get In Touch
                </a>
              )}
              <button className="inline-flex items-center px-8 py-3 rounded-full border border-white/20 text-white hover:bg-white/5 transition-all duration-300">
                Download CV
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Featured Projects
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolio.projects.slice(0, 6).map((project, index) => (
                  <div
                    key={project.id || index}
                    className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300"
                  >
                    {/* Project Image */}
                    {project.imageUrl && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          width={400}
                          height={192}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-white">
                        {project.title}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies
                              .slice(0, 4)
                              .map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30"
                                >
                                  {tech}
                                </span>
                              ))}
                          </div>
                        )}

                      {/* Links */}
                      <div className="flex space-x-4 pt-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {(project.liveUrl || project.projectUrl) && (
                          <a
                            href={project.liveUrl || project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-4 right-4">
                        <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Skills Section */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Skills & Expertise
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolio.skills.map((skill, index) => {
                  const skillName =
                    typeof skill === 'string' ? skill : skill.name;
                  const skillLevel =
                    typeof skill === 'object' && skill.level
                      ? skill.level
                      : 'Advanced';

                  return (
                    <div
                      key={index}
                      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">
                          {skillName}
                        </span>
                        <span className="text-cyan-400 text-sm">
                          {skillLevel}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                          style={{
                            width:
                              skillLevel === 'expert'
                                ? '95%'
                                : skillLevel === 'advanced'
                                  ? '85%'
                                  : skillLevel === 'intermediate'
                                    ? '70%'
                                    : '60%',
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Experience Section */}
        {portfolio.experience && portfolio.experience.length > 0 && (
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Experience
              </h3>
              <div className="space-y-8">
                {portfolio.experience.map((exp, index) => (
                  <div
                    key={index}
                    className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-white mb-1">
                          {exp.position}
                        </h4>
                        <p className="text-cyan-400 font-medium">
                          {exp.company}
                        </p>
                      </div>
                      <div className="text-gray-400 text-sm mt-2 md:mt-0 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-gray-300 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {`Let's Work Together`}
            </h3>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              {`Ready to bring your next project to life? Let's discuss how we can
              collaborate.`}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {portfolio.contact?.email && (
                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="flex items-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-full hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  {portfolio.contact.email}
                </a>
              )}
              {portfolio.contact?.phone && (
                <a
                  href={`tel:${portfolio.contact.phone}`}
                  className="flex items-center px-8 py-4 border border-white/20 text-white rounded-full hover:bg-white/5 transition-all duration-300"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  {portfolio.contact.phone}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-white/10">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} {portfolio.name}. Crafted with
              PRISMA Portfolio Builder.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

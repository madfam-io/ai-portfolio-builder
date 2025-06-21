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
import Image from 'next/image';
import {
  Mail,
  MapPin,
  Phone,
  Github,
  Linkedin,
  Twitter,
  Globe,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';

import { Portfolio } from '@/types/portfolio';

/**
 * @fileoverview Minimal Portfolio Template
 *
 * A clean, minimalist template focusing on typography and white space.
 * Perfect for professionals who prefer understated elegance and want
 * their content to speak for itself.
 *
 * Design Features:
 * - Clean typography with generous white space
 * - Subtle animations and hover effects
 * - Monochromatic color scheme with minimal accents
 * - Content-first layout with clear hierarchy
 * - Responsive design with mobile optimization
 * - Print-friendly styling
 *
 * Color Scheme: Black and white with subtle gray accents
 * Target Audience: Writers, consultants, academics, minimalists
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

interface MinimalTemplateProps {
  portfolio: Portfolio;
}

export function MinimalTemplate({ portfolio }: MinimalTemplateProps) {
  const socialLinks = [
    { platform: 'github', url: portfolio.social?.github, icon: Github },
    { platform: 'linkedin', url: portfolio.social?.linkedin, icon: Linkedin },
    { platform: 'twitter', url: portfolio.social?.twitter, icon: Twitter },
    { platform: 'website', url: portfolio.social?.website, icon: Globe },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-light">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-20 text-center border-b border-gray-100 pb-16">
          {/* Avatar */}
          {portfolio.avatarUrl && (
            <div className="mb-8 flex justify-center">
              <Image
                src={portfolio.avatarUrl}
                alt={portfolio.name}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border border-gray-200 hover:border-gray-300 transition-colors duration-300"
              />
            </div>
          )}

          {/* Name & Title */}
          <h1 className="text-4xl md:text-5xl font-extralight mb-4 tracking-tight">
            {portfolio.name}
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-600 mb-6 font-normal">
            {portfolio.title}
          </h2>

          {/* Location */}
          {portfolio.location && (
            <div className="flex items-center justify-center text-gray-500 mb-8 text-sm">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{portfolio.location}</span>
            </div>
          )}

          {/* Bio */}
          {portfolio.bio && (
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed mb-12">
              {portfolio.bio}
            </p>
          )}

          {/* Contact & Social */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            {portfolio.contact?.email && (
              <a
                href={`mailto:${portfolio.contact.email}`}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                {portfolio.contact.email}
              </a>
            )}
            {portfolio.contact?.phone && (
              <a
                href={`tel:${portfolio.contact.phone}`}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
              >
                <Phone className="w-4 h-4 mr-2" />
                {portfolio.contact.phone}
              </a>
            )}
            {socialLinks.map(({ platform, url, icon: Icon }) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="capitalize">{platform}</span>
              </a>
            ))}
          </div>
        </header>

        {/* Projects Section */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="mb-20">
            <h3 className="text-2xl font-light mb-12 text-center border-b border-gray-100 pb-4">
              Selected Work
            </h3>
            <div className="space-y-16">
              {portfolio.projects.map((project, index) => (
                <article key={project.id || index} className="group">
                  <div className="grid md:grid-cols-3 gap-8 items-start">
                    {/* Project Image */}
                    {project.imageUrl && (
                      <div className="md:col-span-1">
                        <Image
                          src={project.imageUrl}
                          alt={project.title}
                          width={300}
                          height={224}
                          className="w-full h-48 md:h-56 object-cover border border-gray-200 group-hover:border-gray-300 transition-colors duration-300"
                        />
                      </div>
                    )}

                    {/* Project Details */}
                    <div
                      className={
                        project.imageUrl ? 'md:col-span-2' : 'md:col-span-3'
                      }
                    >
                      <h4 className="text-xl font-normal mb-3 group-hover:text-gray-600 transition-colors duration-300">
                        {project.title}
                      </h4>
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">
                              Technologies:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="text-xs text-gray-600 border border-gray-200 px-3 py-1 hover:border-gray-300 transition-colors duration-300"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Links */}
                      <div className="flex space-x-6 text-sm">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
                          >
                            View Code
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                          </a>
                        )}
                        {(project.liveUrl || project.projectUrl) && (
                          <a
                            href={project.liveUrl || project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-300"
                          >
                            View Project
                            <ArrowUpRight className="w-4 h-4 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Experience Section */}
        {portfolio.experience && portfolio.experience.length > 0 && (
          <section className="mb-20">
            <h3 className="text-2xl font-light mb-12 text-center border-b border-gray-100 pb-4">
              Experience
            </h3>
            <div className="space-y-12">
              {portfolio.experience.map((exp, index) => (
                <article
                  key={index}
                  className="border-l-2 border-gray-100 pl-6"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-normal mb-1">
                        {exp.position}
                      </h4>
                      <p className="text-gray-600 mb-2">{exp.company}</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {exp.startDate} - {exp.endDate || 'Present'}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {exp.description}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <section className="mb-20">
            <h3 className="text-2xl font-light mb-12 text-center border-b border-gray-100 pb-4">
              Skills
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.skills.map((skill, index) => {
                const skillName =
                  typeof skill === 'string' ? skill : skill.name;
                const skillLevel =
                  typeof skill === 'object' && skill.level
                    ? skill.level
                    : undefined;

                return (
                  <div
                    key={index}
                    className="text-center p-4 border border-gray-100 hover:border-gray-200 transition-colors duration-300"
                  >
                    <h4 className="font-normal text-gray-900 mb-2">
                      {skillName}
                    </h4>
                    {skillLevel && (
                      <p className="text-sm text-gray-500">{skillLevel}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Education Section */}
        {portfolio.education && portfolio.education.length > 0 && (
          <section className="mb-20">
            <h3 className="text-2xl font-light mb-12 text-center border-b border-gray-100 pb-4">
              Education
            </h3>
            <div className="space-y-8">
              {portfolio.education.map((edu, index) => (
                <article key={index} className="text-center">
                  <h4 className="text-lg font-normal mb-2">{edu.degree}</h4>
                  <p className="text-gray-600 mb-1">{edu.institution}</p>
                  <p className="text-sm text-gray-500">
                    {edu.endDate || new Date().getFullYear()}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {portfolio.certifications && portfolio.certifications.length > 0 && (
          <section className="mb-20">
            <h3 className="text-2xl font-light mb-12 text-center border-b border-gray-100 pb-4">
              Certifications
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {portfolio.certifications.map((cert, index) => (
                <article
                  key={index}
                  className="text-center p-6 border border-gray-100"
                >
                  <h4 className="font-normal mb-2">{cert.name}</h4>
                  <p className="text-gray-600 text-sm mb-1">{cert.issuer}</p>
                  <p className="text-gray-500 text-xs">{cert.date}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-100 pt-12 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {portfolio.name}
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Created with PRISMA Portfolio Builder
          </p>
        </footer>
      </div>
    </div>
  );
}

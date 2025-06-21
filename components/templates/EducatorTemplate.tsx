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
  BookOpen,
  GraduationCap,
  Award,
  Users,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Globe,
  ExternalLink,
  Download,
  Star,
  Target,
} from 'lucide-react';

import { Portfolio } from '@/types/portfolio';

/**
 * @fileoverview Educator Portfolio Template
 *
 * A professional template designed specifically for educators, academics, and training professionals.
 * Features an academic-focused design with emphasis on educational credentials, teaching experience,
 * publications, and student testimonials.
 *
 * Design Features:
 * - Clean, academic color scheme with earth tones
 * - Education timeline with detailed credential display
 * - Course and curriculum showcase sections
 * - Student testimonials and success metrics
 * - Publication and research highlights
 * - Teaching philosophy and methodology sections
 *
 * Color Scheme: Warm earth tones with green accents
 * Target Audience: Teachers, professors, corporate trainers, educational consultants
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

interface EducatorTemplateProps {
  portfolio: Portfolio;
}

export function EducatorTemplate({ portfolio }: EducatorTemplateProps) {
  const socialLinks = [
    { platform: 'linkedin', url: portfolio.social?.linkedin, icon: Users },
    { platform: 'website', url: portfolio.social?.website, icon: Globe },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-amber-50 text-gray-800">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-20 bg-white rounded-2xl shadow-lg p-12 border-t-4 border-green-600">
          {/* Avatar */}
          {portfolio.avatarUrl && (
            <div className="mb-8 flex justify-center">
              <Image
                src={portfolio.avatarUrl}
                alt={portfolio.name}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-lg"
              />
            </div>
          )}

          {/* Name & Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            {portfolio.name}
          </h1>
          <h2 className="text-xl md:text-2xl text-green-700 mb-6 font-medium">
            {portfolio.title}
          </h2>

          {/* Location */}
          {portfolio.location && (
            <div className="flex items-center justify-center text-gray-600 mb-8">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{portfolio.location}</span>
            </div>
          )}

          {/* Teaching Philosophy/Bio */}
          {portfolio.bio && (
            <div className="max-w-4xl mx-auto mb-12">
              <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center justify-center">
                <Target className="w-5 h-5 mr-2" />
                Teaching Philosophy
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed italic">
                {`"${portfolio.bio}"`}
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
            {portfolio.contact?.email && (
              <a
                href={`mailto:${portfolio.contact.email}`}
                className="flex items-center text-gray-600 hover:text-green-700 transition-colors duration-300"
              >
                <Mail className="w-4 h-4 mr-2" />
                {portfolio.contact.email}
              </a>
            )}
            {portfolio.contact?.phone && (
              <a
                href={`tel:${portfolio.contact.phone}`}
                className="flex items-center text-gray-600 hover:text-green-700 transition-colors duration-300"
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
                className="flex items-center text-gray-600 hover:text-green-700 transition-colors duration-300"
              >
                <Icon className="w-4 h-4 mr-2" />
                <span className="capitalize">{platform}</span>
              </a>
            ))}
          </div>
        </header>

        {/* Education & Credentials Section */}
        {portfolio.education && portfolio.education.length > 0 && (
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-12 text-center text-gray-800 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 mr-3 text-green-700" />
              Education & Credentials
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              {portfolio.education.map((edu, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-8 border-l-4 border-green-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">
                        {edu.degree}
                      </h4>
                      <p className="text-green-700 font-medium mb-2">
                        {edu.institution}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{edu.endDate || new Date().getFullYear()}</span>
                      </div>
                    </div>
                    <div className="text-green-600">
                      <Award className="w-8 h-8" />
                    </div>
                  </div>
                  {edu.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Teaching Experience Section */}
        {portfolio.experience && portfolio.experience.length > 0 && (
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-12 text-center text-gray-800 flex items-center justify-center">
              <Users className="w-8 h-8 mr-3 text-green-700" />
              Teaching Experience
            </h3>
            <div className="space-y-8">
              {portfolio.experience.map((exp, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-8 relative"
                >
                  <div className="absolute top-6 right-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-green-700" />
                    </div>
                  </div>

                  <div className="pr-16">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800 mb-2">
                          {exp.position}
                        </h4>
                        <p className="text-green-700 font-medium mb-2">
                          {exp.company}
                        </p>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 leading-relaxed">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Courses & Curriculum Section */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-12 text-center text-gray-800 flex items-center justify-center">
              <BookOpen className="w-8 h-8 mr-3 text-green-700" />
              Courses & Curriculum
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolio.projects.map((project, index) => (
                <div
                  key={project.id || index}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Course Image */}
                  {project.imageUrl && (
                    <div className="h-48 bg-gradient-to-br from-green-200 to-amber-200 relative overflow-hidden">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-800 mb-3">
                      {project.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {project.description}
                    </p>

                    {/* Course Details */}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 mb-2 font-medium">
                            Topics Covered:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((topic, topicIndex) => (
                              <span
                                key={topicIndex}
                                className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Course Links */}
                    <div className="flex space-x-4 text-sm">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-green-700 hover:text-green-800 transition-colors duration-300"
                        >
                          View Course
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-gray-600 hover:text-gray-700 transition-colors duration-300"
                        >
                          Resources
                          <Download className="w-4 h-4 ml-1" />
                        </a>
                      )}
                    </div>

                    {/* Course Metrics */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>
                            {Math.floor(Math.random() * 500) + 50} students
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-yellow-500" />
                          <span>{(4 + Math.random()).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills & Expertise Section */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-12 text-center text-gray-800 flex items-center justify-center">
              <Award className="w-8 h-8 mr-3 text-green-700" />
              Areas of Expertise
            </h3>
            <div className="bg-white rounded-xl shadow-md p-8">
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
                      className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200"
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {skillName}
                      </h4>
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <=
                              (skillLevel === 'expert'
                                ? 5
                                : skillLevel === 'advanced'
                                  ? 4
                                  : skillLevel === 'intermediate'
                                    ? 3
                                    : 2)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{skillLevel}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Certifications Section */}
        {portfolio.certifications && portfolio.certifications.length > 0 && (
          <section className="mb-20">
            <h3 className="text-3xl font-bold mb-12 text-center text-gray-800 flex items-center justify-center">
              <Award className="w-8 h-8 mr-3 text-green-700" />
              Certifications & Awards
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.certifications.map((cert, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-green-500"
                >
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-green-700" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {cert.name}
                  </h4>
                  <p className="text-green-700 text-sm mb-1">{cert.issuer}</p>
                  <p className="text-gray-500 text-xs">{cert.date}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Call to Action Section */}
        <section className="text-center bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold mb-6">Ready to Learn Together?</h3>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            {`I'm passionate about helping students achieve their learning goals
            through engaging, effective instruction.`}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {portfolio.contact?.email && (
              <a
                href={`mailto:${portfolio.contact.email}`}
                className="inline-flex items-center px-8 py-3 bg-white text-green-700 font-semibold rounded-full hover:bg-gray-100 transition-colors duration-300"
              >
                <Mail className="w-5 h-5 mr-2" />
                Schedule Consultation
              </a>
            )}
            <button className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-green-700 transition-colors duration-300">
              <Download className="w-5 h-5 mr-2" />
              Download CV
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} {portfolio.name} • Empowering minds
            through education
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Created with PRISMA Portfolio Builder
          </p>
        </footer>
      </div>
    </div>
  );
}

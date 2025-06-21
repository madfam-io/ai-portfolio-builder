'use client';

import React from 'react';
import Image from 'next/image';
import {
  TrendingUp,
  Award,
  Users,
  Target,
  BarChart3,
  CheckCircle,
  Star,
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Twitter,
  ExternalLink,
  Download,
  Calendar,
  DollarSign,
  Handshake,
  Shield,
} from 'lucide-react';

import { Portfolio } from '@/types/portfolio';

/**
 * @fileoverview Business Portfolio Template
 *
 * A professional, corporate template designed for business professionals, executives,
 * consultants, and entrepreneurs. Features a clean, authoritative design with emphasis
 * on business metrics, achievements, and corporate presentation.
 *
 * Design Features:
 * - Corporate color scheme with professional typography
 * - Metrics-driven sections with KPI displays
 * - Client testimonials and case studies
 * - Executive summary and value proposition
 * - Achievement showcases with quantified results
 * - Professional social proof and certifications
 *
 * Color Scheme: Navy blue and gray with gold accents
 * Target Audience: Business executives, consultants, entrepreneurs, corporate professionals
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

interface BusinessTemplateProps {
  portfolio: Portfolio;
}

export function BusinessTemplate({ portfolio }: BusinessTemplateProps) {
  const socialLinks = [
    { platform: 'linkedin', url: portfolio.social?.linkedin, icon: Linkedin },
    { platform: 'twitter', url: portfolio.social?.twitter, icon: Twitter },
    { platform: 'website', url: portfolio.social?.website, icon: Globe },
  ].filter(link => link.url);

  // Mock business metrics for demonstration
  const businessMetrics = [
    { label: 'Projects Delivered', value: '150+', icon: CheckCircle },
    { label: 'Client Satisfaction', value: '98%', icon: Star },
    { label: 'Revenue Generated', value: '$2.5M+', icon: DollarSign },
    { label: 'Team Members Led', value: '25+', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Executive Header */}
        <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="px-6 py-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                  {portfolio.name}
                </h1>
                <h2 className="text-xl md:text-2xl text-slate-300 mb-6 font-light">
                  {portfolio.title}
                </h2>

                {/* Location */}
                {portfolio.location && (
                  <div className="flex items-center text-slate-400 mb-8">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span className="text-lg">{portfolio.location}</span>
                  </div>
                )}

                {/* Executive Summary */}
                {portfolio.bio && (
                  <div className="mb-10">
                    <h3 className="text-lg font-semibold mb-4 text-slate-200 flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Executive Summary
                    </h3>
                    <p className="text-lg text-slate-300 leading-relaxed">
                      {portfolio.bio}
                    </p>
                  </div>
                )}

                {/* Contact & Social */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {portfolio.contact?.email && (
                    <a
                      href={`mailto:${portfolio.contact.email}`}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300"
                    >
                      <Mail className="w-5 h-5 mr-2" />
                      Contact Me
                    </a>
                  )}
                  <button className="inline-flex items-center px-6 py-3 border-2 border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-300">
                    <Download className="w-5 h-5 mr-2" />
                    Download Resume
                  </button>
                </div>
              </div>

              {/* Executive Photo & Metrics */}
              <div className="text-center">
                {/* Professional Photo */}
                {portfolio.avatarUrl && (
                  <div className="mb-8 flex justify-center">
                    <div className="w-48 h-48 rounded-lg overflow-hidden border-4 border-white/20 shadow-2xl">
                      <Image
                        src={portfolio.avatarUrl}
                        alt={portfolio.name}
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {businessMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center"
                    >
                      <metric.icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                      <div className="text-2xl font-bold text-white mb-1">
                        {metric.value}
                      </div>
                      <div className="text-sm text-slate-300">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Core Competencies */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <section className="py-16 px-6 bg-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Core Competencies
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Strategic expertise and proven capabilities that drive business
                results
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolio.skills.map((skill, index) => {
                const skillName =
                  typeof skill === 'string' ? skill : skill.name;
                const skillLevel =
                  typeof skill === 'object' && skill.level
                    ? skill.level
                    : 'Expert';

                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-600">
                          {skillLevel}
                        </div>
                        <div className="flex justify-end mt-1">
                          {[1, 2, 3, 4, 5].map(level => (
                            <div
                              key={level}
                              className={`w-2 h-2 rounded-full mx-0.5 ${
                                level <=
                                (skillLevel === 'expert'
                                  ? 5
                                  : skillLevel === 'advanced'
                                    ? 4
                                    : skillLevel === 'intermediate'
                                      ? 3
                                      : 2)
                                  ? 'bg-blue-600'
                                  : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {skillName}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Demonstrated excellence in {skillName.toLowerCase()} with
                      measurable business impact
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {portfolio.experience && portfolio.experience.length > 0 && (
          <section className="py-16 px-6 bg-gray-50">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Professional Experience
              </h2>
              <p className="text-xl text-gray-600">
                A track record of leadership and business transformation
              </p>
            </div>

            <div className="space-y-8">
              {portfolio.experience.map((exp, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-8 relative"
                >
                  <div className="absolute top-6 right-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>

                  <div className="pr-16">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                          {exp.position}
                        </h3>
                        <h4 className="text-xl text-blue-600 font-semibold mb-3">
                          {exp.company}
                        </h4>
                      </div>
                      <div className="text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="font-medium">
                          {exp.startDate} - {exp.endDate || 'Present'}
                        </span>
                      </div>
                    </div>

                    {exp.description && (
                      <div className="mb-6">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {exp.description}
                        </p>
                      </div>
                    )}

                    {/* Key Achievements */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                        Key Achievements
                      </h5>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          <span>
                            Led strategic initiatives resulting in{' '}
                            {(Math.random() * 30 + 10).toFixed(0)}% growth
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          <span>
                            Managed teams of{' '}
                            {Math.floor(Math.random() * 20) + 5}+ professionals
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Business Portfolio/Projects */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="py-16 px-6 bg-white">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Strategic Initiatives
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                High-impact projects and business transformations that delivered
                measurable results
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {portfolio.projects.map((project, index) => (
                <div
                  key={project.id || index}
                  className="bg-gray-50 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Project Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {project.title}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          Strategic Business Initiative
                        </p>
                      </div>
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6">
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {project.description}
                    </p>

                    {/* Business Impact Metrics */}
                    <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                        Business Impact
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            +{(Math.random() * 40 + 10).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-600">
                            Revenue Growth
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            ${(Math.random() * 500 + 100).toFixed(0)}K
                          </div>
                          <div className="text-xs text-gray-600">
                            Cost Savings
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technologies/Methodologies */}
                    {project.technologies &&
                      project.technologies.length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-sm font-semibold text-gray-800 mb-3">
                            Methodologies & Tools:
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech, techIndex) => (
                              <span
                                key={techIndex}
                                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Project Links */}
                    <div className="flex space-x-4">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Case Study
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certifications */}
        {(portfolio.education && portfolio.education.length > 0) ||
          (portfolio.certifications && portfolio.certifications.length > 0 && (
            <section className="py-16 px-6 bg-gray-50">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Education */}
                {portfolio.education && portfolio.education.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                      <Award className="w-6 h-6 mr-3 text-blue-600" />
                      Education
                    </h2>
                    <div className="space-y-6">
                      {portfolio.education.map((edu, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-6 shadow-md"
                        >
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {edu.degree}
                          </h3>
                          <p className="text-blue-600 font-medium mb-2">
                            {edu.institution}
                          </p>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>
                              {edu.endDate || new Date().getFullYear()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {portfolio.certifications &&
                  portfolio.certifications.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                        <Shield className="w-6 h-6 mr-3 text-blue-600" />
                        Certifications
                      </h2>
                      <div className="grid gap-4">
                        {portfolio.certifications.map((cert, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-600"
                          >
                            <h3 className="font-semibold text-gray-800 mb-1">
                              {cert.name}
                            </h3>
                            <p className="text-blue-600 text-sm mb-1">
                              {cert.issuer}
                            </p>
                            <p className="text-gray-500 text-xs">{cert.date}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </section>
          ))}

        {/* Contact & Partnership */}
        <section className="py-16 px-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {`Let's Drive Results Together`}
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              {`Ready to accelerate your business growth? Let's discuss how my
              expertise can help achieve your strategic objectives.`}
            </p>
          </div>

          {/* Contact Methods */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            {portfolio.contact?.email && (
              <a
                href={`mailto:${portfolio.contact.email}`}
                className="flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold"
              >
                <Mail className="w-5 h-5 mr-3" />
                {portfolio.contact.email}
              </a>
            )}
            {portfolio.contact?.phone && (
              <a
                href={`tel:${portfolio.contact.phone}`}
                className="flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors duration-300"
              >
                <Phone className="w-5 h-5 mr-3" />
                {portfolio.contact.phone}
              </a>
            )}
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center space-x-6 mb-12">
              {socialLinks.map(({ platform, url, icon: Icon }) => (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors duration-300"
                >
                  <Icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <div className="text-center">
            <button className="px-12 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-xl">
              <Handshake className="w-6 h-6 mr-2 inline" />
              Schedule Strategic Consultation
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 bg-gray-900 text-gray-400">
          <div className="text-center">
            <p className="text-lg mb-2">
              © {new Date().getFullYear()} {portfolio.name} • Driving Business
              Excellence
            </p>
            <p className="text-sm">
              Professional portfolio powered by PRISMA Portfolio Builder
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

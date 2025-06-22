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

import {
  Award,
  BarChart,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Target as FiTarget,
  TrendingUp as FiTrendingUp,
  Users,
  Users as FiUsers,
} from 'lucide-react';
import React from 'react';

import { Portfolio } from '@/types/portfolio';

/**
 * @fileoverview Consultant Portfolio Template
 *
 * A professional business template designed for consultants, coaches, and service professionals.
 * Features a results-oriented design with emphasis on metrics, case studies, and business outcomes.
 *
 * Design Features:
 * - Professional gradient header with key performance metrics
 * - Service offerings with detailed feature lists
 * - Case studies with quantified results and ROI metrics
 * - Experience timeline with business context
 * - Skills categorization with proficiency tracking
 * - Multiple contact options with consultation types
 *
 * Color Scheme: Green-based with professional business accents
 * Target Audience: Business consultants, coaches, advisors, service professionals
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha
 */

/**
 * Props interface for the Consultant Template component
 */
interface ConsultantTemplateProps {
  /** Portfolio data to render in the consultant template */
  portfolio: Portfolio;
}

/**
 * Consultant Portfolio Template Component
 *
 * Renders a professional business portfolio optimized for consultants and service providers.
 * Features metrics-driven design with case studies and service offerings.
 */
export function ConsultantTemplate({ portfolio }: ConsultantTemplateProps) {
  // Extract theme colors with professional business defaults
  const primaryColor = portfolio.customization.primaryColor || '#059669'; // Green primary (trust/growth)
  const secondaryColor = portfolio.customization.secondaryColor || '#0284c7'; // Blue secondary (professional)

  // CSS custom properties for dynamic theming
  const customStyles = {
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-900 print:text-black"
      style={customStyles}
      data-testid="portfolio-container"
    >
      {/* Professional Header - Executive presentation with key metrics */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {portfolio.name}
              </h1>
              <h2 className="text-xl md:text-2xl text-green-400 mb-6 font-light">
                {portfolio.title}
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                {portfolio.bio}
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">15+</div>
                  <div className="text-sm text-gray-400">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">200+</div>
                  <div className="text-sm text-gray-400">
                    Projects Delivered
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">$50M+</div>
                  <div className="text-sm text-gray-400">Value Created</div>
                </div>
              </div>

              <button
                style={{ backgroundColor: primaryColor }}
                className="px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
              >
                Schedule Consultation
              </button>
            </div>

            {/* Professional Photo Placeholder */}
            <div className="flex justify-center">
              <div className="w-56 h-56 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-2xl">
                <Users className="w-20 h-20 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Consulting Services Section - Detailed service offerings */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Consulting Services
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              Strategic solutions that drive measurable business growth and
              operational excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FiTrendingUp,
                title: 'Strategy & Growth',
                description:
                  'Business strategy development, market analysis, and growth planning',
                features: [
                  'Market Research',
                  'Competitive Analysis',
                  'Growth Strategy',
                  'KPI Development',
                ],
              },
              {
                icon: FiTarget,
                title: 'Operations Excellence',
                description:
                  'Process optimization, efficiency improvements, and operational transformation',
                features: [
                  'Process Mapping',
                  'Workflow Optimization',
                  'Cost Reduction',
                  'Quality Improvement',
                ],
              },
              {
                icon: FiUsers,
                title: 'Change Management',
                description:
                  'Organizational change, team development, and transformation leadership',
                features: [
                  'Change Strategy',
                  'Team Training',
                  'Culture Development',
                  'Leadership Coaching',
                ],
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-6">
                  <service.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories & Case Studies - Quantified business results */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Success Stories
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Real results for real businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {portfolio.projects
              .filter(p => p.featured)
              .map(project => (
                <div
                  key={project.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 border-l-4 border-green-500"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <BarChart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                      <p className="text-green-600 font-medium">
                        Fortune 500 Client
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {project.description}
                  </p>

                  {/* Results */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        35%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Cost Reduction
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        $2.4M
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Annual Savings
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {project.technologies?.map(tech => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Professional Experience & Core Competencies */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Experience Timeline */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                Professional Experience
              </h2>
              <div className="space-y-6">
                {portfolio.experience.map(exp => (
                  <div
                    key={exp.id}
                    className="relative pl-8 border-l-2 border-green-200 dark:border-green-800"
                  >
                    <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-2 top-2"></div>
                    <div className="bg-white dark:bg-gray-700 rounded-lg p-6 shadow-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span className="text-green-600 font-medium text-sm">
                          {exp.startDate} -{' '}
                          {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {exp.position}
                      </h3>
                      <p className="text-blue-600 font-medium mb-3">
                        {exp.company}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {exp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Certifications */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                Core Competencies
              </h2>

              {/* Skills by Category */}
              {Object.entries(
                portfolio.skills.reduce(
                  (acc, skill) => {
                    const category = skill.category || 'Business';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(skill);
                    return acc;
                  },
                  {} as Record<string, typeof portfolio.skills>
                )
              ).map(([category, skills]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-600" />
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {skills.map(skill => (
                      <div
                        key={skill.name}
                        className="bg-white dark:bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {skill.name}
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            {skill.level}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{
                              width:
                                skill.level === 'expert'
                                  ? '95%'
                                  : skill.level === 'advanced'
                                    ? '85%'
                                    : skill.level === 'intermediate'
                                      ? '70%'
                                      : '50%',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Business Contact & Consultation Options */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Drive Results?</h2>
          <p className="text-xl text-green-100 mb-12 max-w-2xl mx-auto">
            {`Let's discuss how strategic consulting can accelerate your business
            growth and operational excellence.`}
          </p>

          {/* Contact Options */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 rounded-xl p-6">
              <Mail className="w-8 h-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Email Consultation</h3>
              <p className="text-sm text-green-100">
                Get expert advice via email
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <Phone className="w-8 h-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Strategy Call</h3>
              <p className="text-sm text-green-100">
                30-minute strategy session
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <DollarSign className="w-8 h-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Project Proposal</h3>
              <p className="text-sm text-green-100">
                Custom engagement proposal
              </p>
            </div>
          </div>

          <button className="px-12 py-4 bg-white text-green-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all">
            Schedule Free Consultation
          </button>
        </div>
      </section>
    </div>
  );
}

'use client';

import React from 'react';
import { FaBehance } from 'react-icons/fa';
} from 'react-icons/fi';
import {
  FiInstagram,
  FiDribbble,
  FiExternalLink,
  FiEye,
  FiHeart,
  FiAward,

import { Portfolio } from '@/types/portfolio';

/**
 * @fileoverview Designer Portfolio Template
 *
 * A creative template designed for designers, artists, and visual professionals.
 * Features a vibrant, visual-first design with emphasis on portfolio showcases,
 * social engagement metrics, and creative presentation.
 *
 * Design Features:
 * - Colorful gradient hero with animated background elements
 * - Masonry-style portfolio grid with hover interactions
 * - Social media integration (Instagram, Dribbble, Behance)
 * - Visual skill rating system with dot indicators
 * - Creative timeline layout for experience
 * - Engagement metrics (views, likes) for projects
 *
 * Color Scheme: Pink/Purple gradients with creative accents
 * Target Audience: Graphic designers, UI/UX designers, creative professionals
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha
 */


/**
 * Props interface for the Designer Template component
 */
interface DesignerTemplateProps {
  /** Portfolio data to render in the designer template */
  portfolio: Portfolio;
}

/**
 * Designer Portfolio Template Component
 *
 * Renders a vibrant, creative portfolio optimized for visual professionals.
 * Features masonry layouts, social metrics, and creative presentation.
 */
export function DesignerTemplate({ portfolio }: DesignerTemplateProps) {
  // Extract theme colors with creative defaults
  const primaryColor = portfolio.customization.primaryColor || '#ec4899'; // Pink primary
  const secondaryColor = portfolio.customization.secondaryColor || '#f97316'; // Orange secondary

  // CSS custom properties for dynamic theming
  const customStyles = {
    '--primary-color': primaryColor,
    '--secondary-color': secondaryColor,
  } as React.CSSProperties;

  return (
    <div
      className="min-h-screen bg-white dark:bg-gray-900"
      style={customStyles}
    >
      {/* Creative Hero Section - Animated gradient with floating elements */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-indigo-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-pink-200 rounded-full opacity-20 animate-pulse"></div>
              <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-3/4 w-40 h-40 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-500"></div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {portfolio.name}
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 mb-8 font-light">
              {portfolio.title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              {portfolio.bio}
            </p>

            <div className="flex justify-center gap-4">
              <button
                style={{ backgroundColor: primaryColor }}
                className="px-8 py-3 text-white rounded-full font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                View My Work
              </button>
              <button className="px-8 py-3 border-2 border-gray-300 rounded-full font-semibold hover:border-gray-400 transition-all">
                Contact Me
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Visual Portfolio Gallery - Masonry grid with social metrics */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Featured Work
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              A selection of my most recent design projects
            </p>
          </div>

          {/* Masonry-style Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio.projects
              .filter(p => p.featured)
              .map((project, index) => (
                <div
                  key={project.id}
                  className={`group cursor-pointer ${index % 3 === 1 ? 'md:mt-8' : ''}`}
                >
                  <div className="bg-white dark:bg-gray-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    {/* Project Image */}
                    <div className="h-64 bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-4">
                          <button className="p-3 bg-white rounded-full text-gray-800 hover:bg-gray-100">
                            <FiEye className="w-5 h-5" />
                          </button>
                          <button className="p-3 bg-white rounded-full text-gray-800 hover:bg-gray-100">
                            <FiHeart className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                        {project.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      {/* Project Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies?.slice(0, 3).map(tech => (
                          <span
                            key={tech}
                            className="px-3 py-1 text-sm rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 dark:from-pink-900/30 dark:to-purple-900/30 dark:text-pink-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {/* Project Links */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {project.liveUrl && (
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center gap-1"
                            >
                              <FiExternalLink className="w-4 h-4" />
                              Live View
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiEye className="w-4 h-4" />
                            {Math.floor(Math.random() * 1000) + 100}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiHeart className="w-4 h-4" />
                            {Math.floor(Math.random() * 50) + 10}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Creative Skills & Services - Visual skill indicators */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Skills & Services
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              What I bring to every project
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {Object.entries(
              portfolio.skills.reduce(
                (acc, skill) => {
                  const category = skill.category || 'Design';
                  if (!acc[category]) acc[category] = [];
                  acc[category].push(skill);
                  return acc;
                },
                {} as Record<string, typeof portfolio.skills>
              )
            ).map(([category, skills]) => (
              <div key={category} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <FiAward className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {category}
                </h3>
                <div className="space-y-2">
                  {skills.map(skill => (
                    <div
                      key={skill.name}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {skill.name}
                      </span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i <=
                              (skill.level === 'expert'
                                ? 5
                                : skill.level === 'advanced'
                                  ? 4
                                  : skill.level === 'intermediate'
                                    ? 3
                                    : 2)
                                ? 'bg-pink-500'
                                : 'bg-gray-300 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional Journey - Creative timeline layout */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Professional Journey
            </h2>
          </div>

          <div className="space-y-8">
            {portfolio.experience.map((exp, index) => (
              <div
                key={exp.id}
                className={`flex items-center ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
              >
                <div className="flex-1 px-6">
                  <div
                    className={`bg-white dark:bg-gray-700 rounded-2xl p-6 shadow-lg ${index % 2 === 0 ? 'text-right' : 'text-left'}`}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {exp.position}
                    </h3>
                    <h4 className="text-lg text-pink-600 mb-3">
                      {exp.company}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {exp.description}
                    </p>
                    <span className="text-sm text-gray-500">
                      {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 w-4 h-4 bg-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                <div className="flex-1"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creative Contact Section - Social platform focus */}
      <section className="py-20 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Let&apos;s Create Something Amazing
          </h2>
          <p className="text-xl text-pink-100 mb-12 max-w-2xl mx-auto">
            I&apos;m always excited to work on new projects and collaborate with
            creative minds.
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-6 mb-12">
            {portfolio.social.instagram && (
              <a
                href={portfolio.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all transform hover:scale-110"
              >
                <FiInstagram className="w-6 h-6" />
              </a>
            )}
            {portfolio.social.dribbble && (
              <a
                href={portfolio.social.dribbble}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all transform hover:scale-110"
              >
                <FiDribbble className="w-6 h-6" />
              </a>
            )}
            {portfolio.social.behance && (
              <a
                href={portfolio.social.behance}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all transform hover:scale-110"
              >
                <FaBehance className="w-6 h-6" />
              </a>
            )}
          </div>

          <button className="px-12 py-4 bg-white text-purple-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
            Start a Project
          </button>
        </div>
      </section>
    </div>
  );
}

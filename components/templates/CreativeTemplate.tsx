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
  Palette,
  Sparkles,
  Eye,
  Heart,
  Camera,
  Brush,
  MapPin,
  Mail,
  Phone,
  Globe,
  Instagram,
  Dribbble,
  Twitter,
  ExternalLink,
  Play,
  Zap,
} from 'lucide-react';

import { Portfolio } from '@/types/portfolio';

/**
 * @fileoverview Creative Portfolio Template
 *
 * A vibrant, artistic template designed for creative professionals, artists, and visual creators.
 * Features an expressive design with bold colors, artistic layouts, and creative presentation
 * elements that showcase visual work and artistic personality.
 *
 * Design Features:
 * - Vibrant gradient backgrounds with artistic elements
 * - Masonry-style portfolio grid with visual emphasis
 * - Creative color schemes and typography
 * - Social media integration with visual metrics
 * - Artistic skill presentation with creative indicators
 * - Inspiration and creative process sections
 *
 * Color Scheme: Purple, pink, and orange gradients with artistic accents
 * Target Audience: Artists, illustrators, graphic designers, creative directors, photographers
 *
 * @author PRISMA Development Team
 * @version 1.0.0
 */

interface CreativeTemplateProps {
  portfolio: Portfolio;
}

export function CreativeTemplate({ portfolio }: CreativeTemplateProps) {
  const socialLinks = [
    {
      platform: 'instagram',
      url: portfolio.social?.instagram,
      icon: Instagram,
    },
    { platform: 'dribbble', url: portfolio.social?.dribbble, icon: Dribbble },
    { platform: 'twitter', url: portfolio.social?.twitter, icon: Twitter },
    { platform: 'website', url: portfolio.social?.website, icon: Globe },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-50">
      {/* Floating Art Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-4 h-4 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-32 w-6 h-6 bg-pink-400 rounded-full animate-bounce opacity-50"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-orange-400 rounded-full animate-pulse opacity-70"></div>
        <div className="absolute bottom-20 right-20 w-5 h-5 bg-purple-500 rounded-full animate-bounce opacity-40"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <header className="min-h-screen flex items-center justify-center px-6 py-16 relative">
          {/* Artistic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-pink-300/30 to-orange-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-6xl mx-auto text-center">
            {/* Avatar with Artistic Frame */}
            {portfolio.avatarUrl && (
              <div className="mb-12 flex justify-center">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-2">
                    <Image
                      src={portfolio.avatarUrl}
                      alt={portfolio.name}
                      width={144}
                      height={144}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Name & Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              {portfolio.name}
            </h1>
            <h2 className="text-2xl md:text-3xl text-gray-700 mb-8 font-light">
              {portfolio.title}
            </h2>

            {/* Location */}
            {portfolio.location && (
              <div className="flex items-center justify-center text-gray-600 mb-8">
                <MapPin className="w-5 h-5 mr-2 text-purple-500" />
                <span className="text-lg">{portfolio.location}</span>
              </div>
            )}

            {/* Creative Bio */}
            {portfolio.bio && (
              <div className="max-w-4xl mx-auto mb-12">
                <p className="text-xl text-gray-700 leading-relaxed">
                  {portfolio.bio}
                </p>
              </div>
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
                    className="group relative"
                  >
                    <div className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                      <Icon className="w-6 h-6 text-gray-600 group-hover:text-purple-600 transition-colors duration-300" />
                    </div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm"></div>
                  </a>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Palette className="w-5 h-5 mr-2 inline" />
                View My Work
              </button>
              {portfolio.contact?.email && (
                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="px-8 py-4 border-2 border-purple-500 text-purple-600 font-semibold rounded-full hover:bg-purple-50 transition-all duration-300"
                >
                  <Mail className="w-5 h-5 mr-2 inline" />
                  {`Let's Collaborate`}
                </a>
              )}
            </div>
          </div>
        </header>

        {/* Creative Portfolio Gallery */}
        {portfolio.projects && portfolio.projects.length > 0 && (
          <section className="py-20 px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Featured Creations
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  A curated selection of my most inspiring and impactful
                  creative work
                </p>
              </div>

              {/* Masonry Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolio.projects.map((project, index) => (
                  <div
                    key={project.id || index}
                    className={`group relative ${index % 3 === 1 ? 'md:mt-12' : index % 3 === 2 ? 'md:mt-6' : ''}`}
                  >
                    <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                      {/* Project Image */}
                      <div className="relative h-64 bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 overflow-hidden">
                        {project.imageUrl ? (
                          <Image
                            src={project.imageUrl}
                            alt={project.title}
                            width={400}
                            height={256}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Camera className="w-16 h-16 text-purple-400" />
                          </div>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-3">
                                {project.liveUrl && (
                                  <a
                                    href={project.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300"
                                  >
                                    <Play className="w-5 h-5" />
                                  </a>
                                )}
                                <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300">
                                  <Eye className="w-5 h-5" />
                                </button>
                                <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-300">
                                  <Heart className="w-5 h-5" />
                                </button>
                              </div>
                              <div className="flex items-center space-x-4 text-white text-sm">
                                <span className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  {Math.floor(Math.random() * 5000) + 500}
                                </span>
                                <span className="flex items-center">
                                  <Heart className="w-4 h-4 mr-1" />
                                  {Math.floor(Math.random() * 200) + 50}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Project Info */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                          {project.title}
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {project.description}
                        </p>

                        {/* Project Tags */}
                        {project.technologies &&
                          project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {project.technologies
                                .slice(0, 3)
                                .map((tech, techIndex) => (
                                  <span
                                    key={techIndex}
                                    className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full"
                                  >
                                    {tech}
                                  </span>
                                ))}
                            </div>
                          )}

                        {/* Project Links */}
                        <div className="flex items-center justify-between">
                          <div className="flex space-x-3">
                            {project.liveUrl && (
                              <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                View Project
                              </a>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <div
                                key={star}
                                className={`w-2 h-2 rounded-full ${
                                  star <= Math.floor(Math.random() * 2) + 4
                                    ? 'bg-yellow-400'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Creative Skills Section */}
        {portfolio.skills && portfolio.skills.length > 0 && (
          <section className="py-20 px-6 bg-white/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Creative Arsenal
                </h2>
                <p className="text-xl text-gray-600">
                  Tools and techniques that bring ideas to life
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolio.skills.map((skill, index) => {
                  const skillName =
                    typeof skill === 'string' ? skill : skill.name;
                  const skillLevel =
                    typeof skill === 'object' && skill.level
                      ? skill.level
                      : 'Advanced';

                  return (
                    <div key={index} className="group">
                      <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-purple-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                            <Brush className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500 mb-1">
                              Proficiency
                            </div>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map(level => (
                                <div
                                  key={level}
                                  className={`w-2 h-2 rounded-full ${
                                    level <=
                                    (skillLevel === 'expert'
                                      ? 5
                                      : skillLevel === 'advanced'
                                        ? 4
                                        : skillLevel === 'intermediate'
                                          ? 3
                                          : 2)
                                      ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                                      : 'bg-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          {skillName}
                        </h3>
                        <p className="text-sm text-purple-600 font-medium">
                          {skillLevel}
                        </p>
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
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Creative Journey
                </h2>
                <p className="text-xl text-gray-600">
                  My path through the world of creativity and design
                </p>
              </div>

              <div className="space-y-12">
                {portfolio.experience.map((exp, index) => (
                  <div key={index} className="relative">
                    <div
                      className={`flex items-center ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
                    >
                      <div className="flex-1 px-8">
                        <div
                          className={`bg-white rounded-2xl p-8 shadow-lg ${index % 2 === 0 ? 'text-right' : 'text-left'}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className={index % 2 === 0 ? 'order-2' : ''}>
                              <h3 className="text-xl font-bold text-gray-800">
                                {exp.position}
                              </h3>
                              <h4 className="text-lg text-purple-600 font-medium">
                                {exp.company}
                              </h4>
                            </div>
                            <div
                              className={`text-sm text-gray-500 ${index % 2 === 0 ? 'order-1' : ''}`}
                            >
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
                      <div className="flex-shrink-0 w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-4 border-white shadow-lg"></div>
                      <div className="flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {`Let's Create Magic Together`}
            </h2>
            <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto">
              {`Have an idea that needs bringing to life? I'd love to collaborate
              and turn your vision into reality.`}
            </p>

            {/* Contact Info */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              {portfolio.contact?.email && (
                <a
                  href={`mailto:${portfolio.contact.email}`}
                  className="flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300"
                >
                  <Mail className="w-5 h-5 mr-3" />
                  {portfolio.contact.email}
                </a>
              )}
              {portfolio.contact?.phone && (
                <a
                  href={`tel:${portfolio.contact.phone}`}
                  className="flex items-center px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300"
                >
                  <Phone className="w-5 h-5 mr-3" />
                  {portfolio.contact.phone}
                </a>
              )}
            </div>

            {/* CTA Button */}
            <button className="px-12 py-4 bg-white text-purple-600 font-bold text-lg rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl">
              <Zap className="w-6 h-6 mr-2 inline" />
              Start a Project
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-gray-900 text-gray-300">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-lg mb-2">
              © {new Date().getFullYear()} {portfolio.name} • Creating beauty,
              one pixel at a time
            </p>
            <p className="text-sm text-gray-500">
              Crafted with love using PRISMA Portfolio Builder
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

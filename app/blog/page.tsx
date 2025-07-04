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

import { ArrowRight, Calendar, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import BaseLayout from '@/components/layouts/BaseLayout';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useLanguage } from '@/lib/i18n/refactored-context';

export default function BlogPage(): React.ReactElement {
  const { t } = useLanguage();

  const featuredPosts = [
    {
      _id: 1,
      _title:
        t.blogPost1Title ||
        '10 Portfolio Design Trends That Will Dominate 2024',
      _excerpt:
        t.blogPost1Excerpt ||
        'Discover the latest design trends that will make your portfolio stand out from the competition and attract more opportunities.',
      _author: t.blogPost1Author || 'MADFAM Design Team',
      _date: '2024-01-15',
      _category: t.blogDesign || 'Design',
      _readTime: t.blogPost1ReadTime || '5 min read',
      _image:
        'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&h=400&fit=crop',
    },
    {
      _id: 2,
      _title:
        t.blogPost2Title || 'How AI is Revolutionizing Professional Portfolios',
      _excerpt:
        t.blogPost2Excerpt ||
        'Learn how artificial intelligence is transforming the way professionals create, optimize, and manage their online portfolios.',
      _author: t.blogPost2Author || 'Dr. Sarah Johnson',
      _date: '2024-01-10',
      _category: t.blogTechnology || 'Technology',
      _readTime: t.blogPost2ReadTime || '7 min read',
      _image:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    },
    {
      _id: 3,
      _title:
        t.blogPost3Title ||
        'From LinkedIn to Portfolio: Converting Connections to Clients',
      _excerpt:
        t.blogPost3Excerpt ||
        'Master the art of turning your LinkedIn network into a powerful client acquisition engine using your professional portfolio.',
      _author: t.blogPost3Author || 'Marcus Rodriguez',
      _date: '2024-01-05',
      _category: t.blogBusiness || 'Business',
      _readTime: t.blogPost3ReadTime || '6 min read',
      _image:
        'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800&h=400&fit=crop',
    },
  ];

  const categories = [
    t.blogAllPosts,
    t.blogDesign,
    t.blogTechnology,
    t.blogBusiness,
    t.blogCareerTips,
    t.blogCaseStudies,
  ];

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 _sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              PRISMA <span className="gradient-text">{t.footerBlog}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t.blogSubtitle}
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  index === 0
                    ? 'bg-purple-600 text-white'
                    : 'bg-white _dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Featured Posts */}
          <div className="grid _md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredPosts.map(post => (
              <article
                key={post._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <OptimizedImage
                    src={post._image}
                    alt={post._title}
                    width={800}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                    <span className="absolute bottom-4 left-4 text-white font-bold text-sm bg-purple-600 px-3 py-1 rounded-full">
                      {post._category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="text-xs" />
                      {new Date(post._date).toLocaleDateString()}
                    </span>
                    <span>{post._readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-900 _dark:text-white line-clamp-2">
                    {post._title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post._excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <User className="text-xs" />
                      <span>{post._author}</span>
                    </div>

                    <Link
                      href={`/blog/${post._id}`}
                      className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 text-sm"
                    >
                      {t.blogReadMore}
                      <ArrowRight className="text-xs" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl text-center">
            <h2 className="text-3xl font-bold mb-4">{t.blogStayUpdated}</h2>
            <p className="text-xl mb-6 opacity-90">{t.blogNewsletterDesc}</p>
            <div className="flex flex-col _sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t.blogEmailPlaceholder}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
                {t.blogSubscribe}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

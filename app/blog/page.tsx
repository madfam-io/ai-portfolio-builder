'use client';

import Link from 'next/link';
import React from 'react';
import FaArrowRight from 'react-icons/fa/FaArrowRight';
import FaCalendar from 'react-icons/fa/FaCalendar';
import FaUser from 'react-icons/fa/FaUser';

import BaseLayout from '@/components/layouts/BaseLayout';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useLanguage } from '@/lib/i18n/refactored-context';

export default function BlogPage(): React.ReactElement {
  const { t } = useLanguage();

  const featuredPosts = [
    {
      id: 1,
      title:
        t.blogPost1Title ||
        '10 Portfolio Design Trends That Will Dominate 2024',
      excerpt:
        t.blogPost1Excerpt ||
        'Discover the latest design trends that will make your portfolio stand out from the competition and attract more opportunities.',
      author: t.blogPost1Author || 'MADFAM Design Team',
      date: '2024-01-15',
      category: t.blogDesign || 'Design',
      readTime: t.blogPost1ReadTime || '5 min read',
      image:
        'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&h=400&fit=crop',
    },
    {
      id: 2,
      title:
        t.blogPost2Title || 'How AI is Revolutionizing Professional Portfolios',
      excerpt:
        t.blogPost2Excerpt ||
        'Learn how artificial intelligence is transforming the way professionals create, optimize, and manage their online portfolios.',
      author: t.blogPost2Author || 'Dr. Sarah Johnson',
      date: '2024-01-10',
      category: t.blogTechnology || 'Technology',
      readTime: t.blogPost2ReadTime || '7 min read',
      image:
        'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    },
    {
      id: 3,
      title:
        t.blogPost3Title ||
        'From LinkedIn to Portfolio: Converting Connections to Clients',
      excerpt:
        t.blogPost3Excerpt ||
        'Master the art of turning your LinkedIn network into a powerful client acquisition engine using your professional portfolio.',
      author: t.blogPost3Author || 'Marcus Rodriguez',
      date: '2024-01-05',
      category: t.blogBusiness || 'Business',
      readTime: t.blogPost3ReadTime || '6 min read',
      image:
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
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
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Featured Posts */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredPosts.map(post => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <OptimizedImage
                    src={post.image}
                    alt={post.title}
                    width={800}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                    <span className="absolute bottom-4 left-4 text-white font-bold text-sm bg-purple-600 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <FaCalendar className="text-xs" />
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <span>{post.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <FaUser className="text-xs" />
                      <span>{post.author}</span>
                    </div>

                    <Link
                      href={`/blog/${post.id}`}
                      className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 text-sm"
                    >
                      {t.blogReadMore}
                      <FaArrowRight className="text-xs" />
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
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
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

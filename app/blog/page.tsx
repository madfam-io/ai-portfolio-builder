'use client';

import { useLanguage } from '@/lib/i18n/minimal-context';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FaCalendar, FaUser, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

export default function BlogPage() {
  const { t } = useLanguage();

  const featuredPosts = [
    {
      id: 1,
      title: '10 Portfolio Design Trends That Will Dominate 2024',
      excerpt:
        'Discover the latest design trends that will make your portfolio stand out from the competition and attract more opportunities.',
      author: 'MADFAM Design Team',
      date: '2024-01-15',
      category: 'Design',
      readTime: '5 min read',
      image: '/blog/portfolio-trends-2024.jpg',
    },
    {
      id: 2,
      title: 'How AI is Revolutionizing Professional Portfolios',
      excerpt:
        'Learn how artificial intelligence is transforming the way professionals create, optimize, and manage their online portfolios.',
      author: 'Dr. Sarah Johnson',
      date: '2024-01-10',
      category: 'Technology',
      readTime: '7 min read',
      image: '/blog/ai-portfolios.jpg',
    },
    {
      id: 3,
      title: 'From LinkedIn to Portfolio: Converting Connections to Clients',
      excerpt:
        'Master the art of turning your LinkedIn network into a powerful client acquisition engine using your professional portfolio.',
      author: 'Marcus Rodriguez',
      date: '2024-01-05',
      category: 'Business',
      readTime: '6 min read',
      image: '/blog/linkedin-portfolio.jpg',
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
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
                <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-500 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
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
      </main>

      <Footer />
    </div>
  );
}

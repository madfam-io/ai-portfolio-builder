'use client';

import BaseLayout from '@/components/layouts/BaseLayout';
// import { useLanguage } from '@/lib/i18n/simple-context'; // Not used yet
import Link from 'next/link';
import {
  FaArrowLeft,
  FaRocket,
  FaUsers,
  FaStar,
  FaHeart,
} from 'react-icons/fa';

export default function About() {
  // const { t } = useLanguage(); // Not used yet

  const team = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      image: '/api/placeholder/150/150',
      bio: 'Former tech lead at Google with 10+ years in AI and product development.',
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Design',
      image: '/api/placeholder/150/150',
      bio: 'Award-winning designer who has worked with Fortune 500 companies.',
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Lead Engineer',
      image: '/api/placeholder/150/150',
      bio: 'Full-stack engineer passionate about creating beautiful user experiences.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Portfolios Created' },
    { number: '500+', label: 'Companies Hiring' },
    { number: '95%', label: 'User Satisfaction' },
    { number: '24/7', label: 'Support Available' },
  ];

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About MADFAM.AI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            We&apos;re on a mission to democratize professional portfolio
            creation using the power of artificial intelligence.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-6">
              <FaRocket className="text-3xl text-purple-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Our Mission
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Every professional deserves a stunning portfolio that showcases
              their skills and achievements. Traditional portfolio creation is
              time-consuming, expensive, and often requires design expertise
              that not everyone has. We believe AI can change that.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              MADFAM.AI transforms your existing professional information into
              beautiful, personalized portfolios in under 30 minutes. Whether
              you&apos;re a developer, designer, consultant, or creative
              professional, we make it easy to present your best work to the
              world.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Trusted by Professionals Worldwide
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Passionate professionals building the future of portfolio creation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center"
              >
                <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FaUsers className="text-4xl text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-purple-600 font-medium mb-3">
                  {member.role}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <FaStar className="text-3xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Excellence
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We strive for perfection in every portfolio we help create,
                ensuring quality that stands out.
              </p>
            </div>
            <div className="text-center">
              <FaUsers className="text-3xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Accessibility
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Professional portfolio creation should be available to everyone,
                regardless of technical skill.
              </p>
            </div>
            <div className="text-center">
              <FaHeart className="text-3xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Empowerment
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We believe in empowering professionals to showcase their unique
                talents and achievements.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to Create Your Portfolio?
          </h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who have already transformed their
            careers with beautiful, AI-powered portfolios.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            Get Started Today
          </Link>
        </div>
      </div>
    </BaseLayout>
  );
}

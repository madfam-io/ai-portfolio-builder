'use client';

import { useLanguage } from '@/lib/i18n/minimal-context';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import {
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaHeart,
  FaRocket,
  FaGlobe,
} from 'react-icons/fa';
import Link from 'next/link';

export default function CareersPage() {
  const { t } = useLanguage();

  const openPositions = [
    {
      id: 1,
      title: 'Senior Full-Stack Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description:
        'Join our engineering team to build the next generation of AI-powered portfolio tools. Work with React, Node.js, and cutting-edge AI technologies.',
      requirements: [
        '5+ years React/Node.js experience',
        'AI/ML integration experience',
        'Portfolio or SaaS platform experience',
      ],
    },
    {
      id: 2,
      title: 'Product Designer',
      department: 'Design',
      location: 'Mexico City / Remote',
      type: 'Full-time',
      description:
        'Shape the user experience of PRISMA and help millions of professionals create stunning portfolios. Design for web and mobile platforms.',
      requirements: [
        '3+ years product design experience',
        'Figma/Adobe Creative Suite proficiency',
        'SaaS product experience',
      ],
    },
    {
      id: 3,
      title: 'AI Research Engineer',
      department: 'AI/ML',
      location: 'Remote',
      type: 'Full-time',
      description:
        'Research and develop AI models for content generation, template recommendation, and portfolio optimization using latest ML techniques.',
      requirements: [
        'PhD or MS in AI/ML/CS',
        'Experience with LLMs and NLP',
        'Python, TensorFlow/PyTorch',
      ],
    },
    {
      id: 4,
      title: 'Customer Success Manager',
      department: 'Customer Success',
      location: 'Austin, TX / Remote',
      type: 'Full-time',
      description:
        'Drive customer adoption and success, ensuring our users get maximum value from PRISMA. Work closely with product and engineering teams.',
      requirements: [
        '3+ years customer success experience',
        'SaaS platform experience',
        'Bilingual (English/Spanish) preferred',
      ],
    },
  ];

  const benefits = [
    {
      icon: FaGlobe,
      title: t.careersRemoteTitle,
      description: t.careersRemoteDesc,
    },
    {
      icon: FaHeart,
      title: t.careersBenefitsTitle,
      description: t.careersBenefitsDesc,
    },
    {
      icon: FaRocket,
      title: t.careersGrowthTitle,
      description: t.careersGrowthDesc,
    },
    {
      icon: FaUsers,
      title: t.careersInclusiveTitle,
      description: t.careersInclusiveDesc,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {t.careersPageTitle}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t.careersSubtitle}
            </p>
          </div>

          {/* Company Culture */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">{t.careersWhyMadfam}</h2>
              <p className="text-xl opacity-90">{t.careersWhyDesc}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <benefit.icon className="text-3xl mx-auto mb-4" />
                  <h3 className="font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm opacity-90">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Open Positions
            </h2>

            <div className="space-y-6">
              {openPositions.map(position => (
                <div
                  key={position.id}
                  className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FaUsers className="text-xs" />
                          {position.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-xs" />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaClock className="text-xs" />
                          {position.type}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/contact?position=${position.id}`}
                      className="mt-4 md:mt-0 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition whitespace-nowrap"
                    >
                      Apply Now
                    </Link>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {position.description}
                  </p>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      Key Requirements:
                    </h4>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                      {position.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* No Perfect Match */}
          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Don&apos;t see a perfect match?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We&apos;re always looking for talented individuals who share our
              passion for innovation and excellence.
            </p>
            <Link
              href="/contact?general=true"
              className="inline-block border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900 transition"
            >
              Send Us Your Resume
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

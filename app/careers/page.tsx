'use client';

import React from 'react';
import Link from 'next/link';

import {
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaHeart,
  FaRocket,
  FaGlobe,
} from 'react-icons/fa';
import BaseLayout from '@/components/layouts/BaseLayout';
import { useLanguage } from '@/lib/i18n/refactored-context';


export default function CareersPage(): React.ReactElement {
  const { t } = useLanguage();

  const openPositions = [
    {
      _id: 1,
      _title: t.careersPosition1Title || 'Senior Full-Stack Developer',
      _department: t.careersPosition1Department || 'Engineering',
      _location: t.careersPosition1Location || 'Remote',
      _type: t.careersPosition1Type || 'Full-time',
      _description:
        t.careersPosition1Description ||
        'Join our engineering team to build the next generation of AI-powered portfolio tools. Work with React, Node.js, and cutting-edge AI technologies.',
      requirements: [
        t.careersPosition1Req1 || '5+ years React/Node.js experience',
        t.careersPosition1Req2 || 'AI/ML integration experience',
        t.careersPosition1Req3 || 'Portfolio or SaaS platform experience',
      ],
    },
    {
      _id: 2,
      _title: t.careersPosition2Title || 'Product Designer',
      _department: t.careersPosition2Department || 'Design',
      _location: t.careersPosition2Location || 'Mexico City / Remote',
      _type: t.careersPosition2Type || 'Full-time',
      _description:
        t.careersPosition2Description ||
        'Shape the user experience of PRISMA and help millions of professionals create stunning portfolios. Design for web and mobile platforms.',
      requirements: [
        t.careersPosition2Req1 || '3+ years product design experience',
        t.careersPosition2Req2 || 'Figma/Adobe Creative Suite proficiency',
        t.careersPosition2Req3 || 'SaaS product experience',
      ],
    },
    {
      _id: 3,
      _title: t.careersPosition3Title || 'AI Research Engineer',
      _department: t.careersPosition3Department || 'AI/ML',
      _location: t.careersPosition3Location || 'Remote',
      _type: t.careersPosition3Type || 'Full-time',
      _description:
        t.careersPosition3Description ||
        'Research and develop AI models for content generation, template recommendation, and portfolio optimization using latest ML techniques.',
      requirements: [
        t.careersPosition3Req1 || 'PhD or MS in AI/ML/CS',
        t.careersPosition3Req2 || 'Experience with LLMs and NLP',
        t.careersPosition3Req3 || 'Python, TensorFlow/PyTorch',
      ],
    },
    {
      _id: 4,
      _title: t.careersPosition4Title || 'Customer Success Manager',
      _department: t.careersPosition4Department || 'Customer Success',
      _location: t.careersPosition4Location || 'Austin, TX / Remote',
      _type: t.careersPosition4Type || 'Full-time',
      _description:
        t.careersPosition4Description ||
        'Drive customer adoption and success, ensuring our users get maximum value from PRISMA. Work closely with product and engineering teams.',
      requirements: [
        t.careersPosition4Req1 || '3+ years customer success experience',
        t.careersPosition4Req2 || 'SaaS platform experience',
        t.careersPosition4Req3 || 'Bilingual (English/Spanish) preferred',
      ],
    },
  ];

  const benefits = [
    {
      _icon: FaGlobe,
      _title: t.careersRemoteTitle,
      _description: t.careersRemoteDesc,
    },
    {
      _icon: FaHeart,
      _title: t.careersBenefitsTitle,
      _description: t.careersBenefitsDesc,
    },
    {
      _icon: FaRocket,
      _title: t.careersGrowthTitle,
      _description: t.careersGrowthDesc,
    },
    {
      _icon: FaUsers,
      _title: t.careersInclusiveTitle,
      _description: t.careersInclusiveDesc,
    },
  ];

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 _sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
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
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 _dark:text-white">
              {t.careersOpenPositions || 'Open Positions'}
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
                      {t.careersApplyNow || 'Apply Now'}
                    </Link>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {position.description}
                  </p>

                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      {t.careersKeyRequirements || 'Key Requirements:'}
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
          <div className="text-center bg-white _dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {t.careersNoMatch || "Don't see a perfect match?"}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t.careersNoMatchDesc ||
                "We're always looking for talented individuals who share our passion for innovation and excellence."}
            </p>
            <Link
              href="/contact?general=true"
              className="inline-block border-2 border-purple-600 text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900 transition"
            >
              {t.careersSendResume || 'Send Us Your Resume'}
            </Link>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

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
  Clock,
  Globe as FaGlobe,
  Heart as FaHeart,
  MapPin,
  Rocket as FaRocket,
  Users,
  Users as FaUsers,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import BaseLayout from '@/components/layouts/BaseLayout';
import { useLanguage } from '@/lib/i18n/refactored-context';

// Type definitions
interface Position {
  _id: number;
  _title: string;
  _department: string;
  _location: string;
  _type: string;
  _description: string;
  requirements: string[];
}

interface Benefit {
  _icon: React.ComponentType<{ className?: string }>;
  _title: string | undefined;
  _description: string | undefined;
}

// Component for the hero section
function HeroSection({ t }: { t: Record<string, string | undefined> }) {
  return (
    <div className="text-center mb-16">
      <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
        {t.careersPageTitle}
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        {t.careersSubtitle}
      </p>
    </div>
  );
}

// Component for benefits section
function BenefitsSection({
  benefits,
  t,
}: {
  benefits: Benefit[];
  t: Record<string, string | undefined>;
}) {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-xl mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">{t.careersWhyMadfam}</h2>
        <p className="text-xl opacity-90">{t.careersWhyDesc}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="text-center">
            <benefit._icon className="text-3xl mx-auto mb-4" />
            <h3 className="font-bold mb-2">{benefit._title}</h3>
            <p className="text-sm opacity-90">{benefit._description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for individual job position
function JobPosition({
  position,
  t,
}: {
  position: Position;
  t: Record<string, string | undefined>;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {position._title}
          </h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Users className="text-xs" />
              {position._department}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="text-xs" />
              {position._location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="text-xs" />
              {position._type}
            </span>
          </div>
        </div>

        <Link
          href={`/contact?position=${position._id}`}
          className="mt-4 md:mt-0 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition whitespace-nowrap"
        >
          {t.careersApplyNow || 'Apply Now'}
        </Link>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {position._description}
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
  );
}

// Component for open positions section
function OpenPositionsSection({
  positions,
  t,
}: {
  positions: Position[];
  t: Record<string, string | undefined>;
}) {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 _dark:text-white">
        {t.careersOpenPositions || 'Open Positions'}
      </h2>

      <div className="space-y-6">
        {positions.map(position => (
          <JobPosition key={position._id} position={position} t={t} />
        ))}
      </div>
    </div>
  );
}

// Component for the footer section
function NoMatchSection({ t }: { t: Record<string, string | undefined> }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-xl text-center">
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {t.careersNoMatch || `Don't See the Perfect Match?`}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        {t.careersNoMatchDesc ||
          `We're always looking for talented individuals to join our team. Send us your resume and tell us why you'd be a great fit for PRISMA.`}
      </p>
      <Link
        href="/contact"
        className="inline-block bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
      >
        {t.careersSendResume || 'Send Your Resume'}
      </Link>
    </div>
  );
}

// Helper function to create a single position with config object
function createPosition(
  config: {
    id: number;
    keys: {
      title: string;
      dept: string;
      loc: string;
      type: string;
      desc: string;
      reqs: string[];
    };
    defaults: {
      title: string;
      dept: string;
      loc: string;
      type: string;
      desc: string;
      reqs: string[];
    };
  },
  t: Record<string, string | undefined>
): Position {
  return {
    _id: config.id,
    _title: t[config.keys.title] || config.defaults.title,
    _department: t[config.keys.dept] || config.defaults.dept,
    _location: t[config.keys.loc] || config.defaults.loc,
    _type: t[config.keys.type] || config.defaults.type,
    _description: t[config.keys.desc] || config.defaults.desc,
    requirements: config.keys.reqs.map(
      (key, i) => t[key] || config.defaults.reqs[i] || ''
    ),
  };
}

// Position configurations
const POSITION_CONFIGS = [
  {
    id: 1,
    keys: {
      title: 'careersPosition1Title',
      dept: 'careersPosition1Department',
      loc: 'careersPosition1Location',
      type: 'careersPosition1Type',
      desc: 'careersPosition1Description',
      reqs: [
        'careersPosition1Req1',
        'careersPosition1Req2',
        'careersPosition1Req3',
      ],
    },
    defaults: {
      title: 'Senior Full-Stack Developer',
      dept: 'Engineering',
      loc: 'Remote',
      type: 'Full-time',
      desc: 'Join our engineering team to build the next generation of AI-powered portfolio tools. Work with React, Node.js, and cutting-edge AI technologies.',
      reqs: [
        '5+ years React/Node.js experience',
        'AI/ML integration experience',
        'Portfolio or SaaS platform experience',
      ],
    },
  },
  {
    id: 2,
    keys: {
      title: 'careersPosition2Title',
      dept: 'careersPosition2Department',
      loc: 'careersPosition2Location',
      type: 'careersPosition2Type',
      desc: 'careersPosition2Description',
      reqs: [
        'careersPosition2Req1',
        'careersPosition2Req2',
        'careersPosition2Req3',
      ],
    },
    defaults: {
      title: 'Product Designer',
      dept: 'Design',
      loc: 'Mexico City / Remote',
      type: 'Full-time',
      desc: 'Shape the user experience of PRISMA and help millions of professionals create stunning portfolios. Design for web and mobile platforms.',
      reqs: [
        '3+ years product design experience',
        'Figma/Adobe Creative Suite proficiency',
        'SaaS product experience',
      ],
    },
  },
  {
    id: 3,
    keys: {
      title: 'careersPosition3Title',
      dept: 'careersPosition3Department',
      loc: 'careersPosition3Location',
      type: 'careersPosition3Type',
      desc: 'careersPosition3Description',
      reqs: [
        'careersPosition3Req1',
        'careersPosition3Req2',
        'careersPosition3Req3',
      ],
    },
    defaults: {
      title: 'AI Research Engineer',
      dept: 'AI/ML',
      loc: 'Remote',
      type: 'Full-time',
      desc: 'Research and develop AI models for content generation, template recommendation, and portfolio optimization using latest ML techniques.',
      reqs: [
        'PhD or MS in AI/ML/CS',
        'Experience with LLMs and NLP',
        'Python, TensorFlow/PyTorch',
      ],
    },
  },
  {
    id: 4,
    keys: {
      title: 'careersPosition4Title',
      dept: 'careersPosition4Department',
      loc: 'careersPosition4Location',
      type: 'careersPosition4Type',
      desc: 'careersPosition4Description',
      reqs: [
        'careersPosition4Req1',
        'careersPosition4Req2',
        'careersPosition4Req3',
      ],
    },
    defaults: {
      title: 'Customer Success Manager',
      dept: 'Customer Success',
      loc: 'Austin, TX / Remote',
      type: 'Full-time',
      desc: 'Drive customer adoption and success, ensuring our users get maximum value from PRISMA. Work closely with product and engineering teams.',
      reqs: [
        '3+ years customer success experience',
        'SaaS platform experience',
        'Bilingual (English/Spanish) preferred',
      ],
    },
  },
];

// Helper function to create positions data
function createPositions(t: Record<string, string | undefined>): Position[] {
  return POSITION_CONFIGS.map(config => createPosition(config, t));
}

// Helper function to create benefits data
function createBenefits(t: Record<string, string | undefined>): Benefit[] {
  return [
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
}

export default function CareersPage(): React.ReactElement {
  const { t } = useLanguage();

  const openPositions = createPositions(t);
  const benefits = createBenefits(t);

  return (
    <BaseLayout>
      <div className="container mx-auto px-4 _sm:px-6 lg:px-8 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          <HeroSection t={t} />
          <BenefitsSection benefits={benefits} t={t} />
          <OpenPositionsSection positions={openPositions} t={t} />
          <NoMatchSection t={t} />
        </div>
      </div>
    </BaseLayout>
  );
}

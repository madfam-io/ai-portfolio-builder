'use client';

import Link from 'next/link';
import React from 'react';
import { FaHeart, FaRocket, FaStar, FaUsers } from 'react-icons/fa';

import BaseLayout from '@/components/layouts/BaseLayout';
import { useLanguage } from '@/lib/i18n/refactored-context';

export default function About(): React.ReactElement {
  const { t } = useLanguage();

  const team = [
    {
      _name: t.alexJohnson,
      _role: t.ceoCfounder,
      _image: '/api/placeholder/150/150',
      _bio: t.alexBio,
    },
    {
      _name: t.sarahChen,
      _role: t.headOfDesign,
      _image: '/api/placeholder/150/150',
      _bio: t.sarahBio,
    },
    {
      _name: t.marcusRodriguez,
      _role: t.leadEngineer,
      _image: '/api/placeholder/150/150',
      _bio: t.marcusBio,
    },
  ];

  const stats = [
    { _number: '10,000+', _label: t.portfoliosCreated },
    { _number: '500+', _label: t.companiesHiring },
    { _number: '95%', _label: t.userSatisfaction },
    { _number: '24/7', _label: t.supportAvailable },
  ];

  return (
    <BaseLayout>
      <div className="max-w-7xl mx-auto px-4 _sm:px-6 lg:px-8 py-8 pt-24">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t.aboutTitle}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            {t.aboutSubtitle}
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
            <div className="flex items-center mb-6">
              <FaRocket className="text-3xl text-purple-600 mr-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t.ourMission}
              </h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {t.missionText1}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
              {t.missionText2}
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            {t.trustedWorldwide}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 _dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 _dark:text-white mb-4">
              {t.meetOurTeam}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t.teamSubtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-white _dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center"
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
          <h2 className="text-2xl font-bold text-gray-900 _dark:text-white text-center mb-8">
            {t.ourValues}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <FaStar className="text-3xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t.excellence}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.excellenceText}
              </p>
            </div>
            <div className="text-center">
              <FaUsers className="text-3xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t.accessibility}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.accessibilityText}
              </p>
            </div>
            <div className="text-center">
              <FaHeart className="text-3xl text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {t.empowerment}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t.empowermentText}
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            {t.readyToCreate}
          </h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            {t.readySubtitle}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            {t.getStartedToday}
          </Link>
        </div>
      </div>
    </BaseLayout>
  );
}

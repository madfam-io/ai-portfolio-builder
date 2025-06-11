'use client';

import { useLanguage } from '@/lib/i18n/refactored-context';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import {
  FaPlay,
  FaCheckCircle,
  FaArrowRight,
  FaClock,
  FaUser,
} from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';

export default function DemoPage() {
  const { t } = useLanguage();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const demoSteps = [
    {
      title: t.demoStep1Title,
      description: t.demoStep1Desc,
      duration: t.demoStep1Duration,
      icon: '📄',
    },
    {
      title: t.demoStep2Title,
      description: t.demoStep2Desc,
      duration: t.demoStep2Duration,
      icon: '🤖',
    },
    {
      title: t.demoStep3Title,
      description: t.demoStep3Desc,
      duration: t.demoStep3Duration,
      icon: '🎨',
    },
    {
      title: t.demoStep4Title,
      description: t.demoStep4Desc,
      duration: t.demoStep4Duration,
      icon: '🚀',
    },
  ];

  const features = [
    t.demoFeature1,
    t.demoFeature2,
    t.demoFeature3,
    t.demoFeature4,
    t.demoFeature5,
    t.demoFeature6,
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              See PRISMA <span className="gradient-text">in Action</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Watch how PRISMA transforms a simple resume into a stunning
              professional portfolio in under 5 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo/interactive"
                className="btn-primary group text-xl px-12 py-5 min-h-[64px] text-center inline-flex items-center justify-center"
              >
                <FaPlay className="mr-3 text-lg group-hover:scale-110 transition-transform duration-200" />
                <span>Try Interactive Demo</span>
              </Link>

              <button
                onClick={() => setIsVideoPlaying(true)}
                className="btn-secondary group text-xl px-12 py-5 min-h-[64px] text-center inline-flex items-center justify-center"
              >
                <FaPlay className="mr-3 text-lg" />
                <span>Watch Video Demo</span>
              </button>
            </div>
          </div>

          {/* Video Player */}
          <div className="mb-16 max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
              {isVideoPlaying ? (
                <div className="aspect-video bg-black flex items-center justify-center">
                  <div className="text-center text-white">
                    <FaPlay className="text-6xl mb-4 mx-auto opacity-50" />
                    <p className="text-xl">Demo Video Coming Soon</p>
                    <p className="text-gray-400 mt-2">
                      In the meantime, try our interactive demo
                    </p>
                    <Link
                      href="/demo/interactive"
                      className="inline-block mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
                    >
                      Launch Interactive Demo
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  className="aspect-video bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center cursor-pointer group"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition">
                      <FaPlay className="text-3xl ml-1" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      Portfolio Creation Demo
                    </h3>
                    <p className="text-lg opacity-90">
                      See the complete process from resume to portfolio
                    </p>
                    <p className="text-sm opacity-75 mt-2">
                      5 minutes • Step-by-step walkthrough
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Demo Steps */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              How It Works
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {demoSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {step.description}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-sm text-purple-600 font-medium">
                    <FaClock className="text-xs" />
                    {step.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Example */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Live Portfolio Example
            </h2>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gray-200 dark:bg-gray-700 p-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="flex-1 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    https://johndoe.prisma.madfam.io
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                    <FaUser className="text-2xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      John Doe
                    </h3>
                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
                      Senior Full-Stack Developer
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      San Francisco, CA • 5+ years experience
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      Projects
                    </h4>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      Skills
                    </h4>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-4/5"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/5"></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                      Experience
                    </h4>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Showcase */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              What You Get
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
                >
                  <FaCheckCircle className="text-green-500 text-xl flex-shrink-0" />
                  <span className="text-gray-900 dark:text-white font-medium">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white p-12 rounded-xl">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Create Your Portfolio?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of professionals who have transformed their careers
              with PRISMA.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="bg-white text-purple-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition inline-flex items-center justify-center gap-2"
              >
                Start Free Trial
                <FaArrowRight />
              </Link>
              <Link
                href="/demo/interactive"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-purple-600 transition"
              >
                Try Interactive Demo
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

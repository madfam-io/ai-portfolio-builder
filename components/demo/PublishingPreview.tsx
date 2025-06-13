'use client';

import React, { useState } from 'react';
import {
  FiGlobe,
  FiBarChart,
  FiShield,
  FiShare2,
  FiMail,
  FiEye,
  FiUsers,
  FiTrendingUp,
  FiCheck,
  FiCopy,
  FiCode,
  FiDownload,
} from 'react-icons/fi';
import HiSparkles from 'react-icons/hi/HiSparkles';

interface PublishingPreviewProps {
  portfolioName?: string;
  onPublish?: () => void;
  isDemo?: boolean;
  className?: string;
}

interface AnalyticsData {
  views: number;
  uniqueVisitors: number;
  engagementRate: number;
  averageTimeOnSite: string;
  topSources: Array<{ source: string; percentage: number; color: string }>;
  recentActivity: Array<{ action: string; count: number; time: string }>;
}

export function PublishingPreview({
  portfolioName = 'John Doe',
  onPublish,
  isDemo = true,
  className = '',
}: PublishingPreviewProps): React.ReactElement {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishProgress, setPublishProgress] = useState(0);
  const [isPublished, setIsPublished] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [seoScore, setSeoScore] = useState(0);
  const [performanceScore, setPerformanceScore] = useState(0);

  const subdomain = portfolioName.toLowerCase().replace(/\s+/g, '');
  const portfolioUrl = `https://${subdomain}.prisma.madfam.io`;

  const mockAnalytics: AnalyticsData = {
    views: 1247,
    uniqueVisitors: 892,
    engagementRate: 68,
    averageTimeOnSite: '2m 34s',
    topSources: [
      { source: 'LinkedIn', percentage: 45, color: 'bg-blue-500' },
      { source: 'Direct', percentage: 30, color: 'bg-gray-500' },
      { source: 'Google', percentage: 15, color: 'bg-green-500' },
      { source: 'GitHub', percentage: 10, color: 'bg-purple-500' },
    ],
    recentActivity: [
      { action: 'Portfolio views', count: 23, time: 'Last 24h' },
      { action: 'Contact form submissions', count: 5, time: 'Last 7 days' },
      { action: 'Social shares', count: 12, time: 'Last 7 days' },
      { action: 'Download requests', count: 8, time: 'Last 7 days' },
    ],
  };

  const handlePublish = () => {
    setIsPublishing(true);
    setPublishProgress(0);

    const steps = [
      { label: 'Optimizing content...', progress: 20 },
      { label: 'Generating SEO metadata...', progress: 40 },
      { label: 'Setting up subdomain...', progress: 60 },
      { label: 'Configuring SSL certificate...', progress: 80 },
      { label: 'Going live...', progress: 100 },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPublishProgress(step.progress);
    }

    // Animate scores
    const seoInterval = setInterval(() => {
      setSeoScore(prev => {
        if (prev >= 94) {
          clearInterval(seoInterval);
          return 94;
        }
        return prev + 3;
      });
    }, 50);

    const perfInterval = setInterval(() => {
      setPerformanceScore(prev => {
        if (prev >= 97) {
          clearInterval(perfInterval);
          return 97;
        }
        return prev + 4;
      });
    }, 50);

    setIsPublishing(false);
    setIsPublished(true);

    if (onPublish) {
      onPublish();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success feedback
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!isPublished) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}
      >
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <FiGlobe className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Ready to Publish</h3>
              <p className="text-green-100">
                Your portfolio is ready to go live
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isPublishing ? (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Publishing Your Portfolio
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Setting up your professional presence...
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Publishing Progress
                  </span>
                  <span className="text-sm text-gray-500">
                    {publishProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-600 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${publishProgress}%` }}
                  />
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <HiSparkles className="w-4 h-4 animate-pulse" />
                  <span>Optimizing for search engines and performance...</span>
                </div>
              </div>

              {/* URL Preview */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Your portfolio will be available at:
                  </p>
                  <div className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                    {portfolioUrl}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Publish Your Portfolio
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Make your portfolio live and accessible to the world
                </p>
              </div>

              {/* Publishing Features */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiGlobe className="w-5 h-5 text-blue-600" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      Custom Subdomain
                    </h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Your unique URL: {portfolioUrl}
                  </p>
                  <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
                    Available
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiShield className="w-5 h-5 text-green-600" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      SSL Certificate
                    </h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Secure HTTPS connection included
                  </p>
                  <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                    Automatic
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiBarChart className="w-5 h-5 text-purple-600" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      Analytics Dashboard
                    </h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Track views, engagement, and leads
                  </p>
                  <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 px-2 py-1 rounded-full">
                    Included
                  </span>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <FiTrendingUp className="w-5 h-5 text-orange-600" />
                    <h5 className="font-semibold text-gray-900 dark:text-white">
                      SEO Optimization
                    </h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Optimized for search engines
                  </p>
                  <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded-full">
                    Automated
                  </span>
                </div>
              </div>

              <button
                onClick={handlePublish}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-3"
              >
                <FiGlobe className="w-6 h-6" />
                <span>Publish Portfolio</span>
                <HiSparkles className="w-6 h-6" />
              </button>

              {isDemo && (
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Demo mode - Experience the publishing process
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Success Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiCheck className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">
                  Portfolio Published Successfully!
                </h3>
                <p className="text-green-100">
                  Your portfolio is now live and accessible
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">🎉</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Live URL */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Your portfolio is live at:
                </p>
                <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">
                  {portfolioUrl}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(portfolioUrl)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiCopy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Performance Scores */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    SEO Score
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Search optimization
                  </p>
                </div>
                <div
                  className={`text-3xl font-bold ${getScoreColor(seoScore)}`}
                >
                  {seoScore}/100
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${getScoreBg(seoScore)}`}
                  style={{ width: `${seoScore}%` }}
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">
                    Performance
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Loading speed
                  </p>
                </div>
                <div
                  className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}
                >
                  {performanceScore}/100
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${getScoreBg(performanceScore)}`}
                  style={{ width: `${performanceScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.open(portfolioUrl, '_blank')}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FiEye className="w-4 h-4" />
              <span>View Live</span>
            </button>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FiBarChart className="w-4 h-4" />
              <span>View Analytics</span>
            </button>
            <button className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <FiShare2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-center space-x-3">
              <FiBarChart className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Analytics Dashboard</h3>
                <p className="text-purple-100">
                  Track your portfolio performance
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <FiEye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {mockAnalytics.views.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Views
                </div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <FiUsers className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {mockAnalytics.uniqueVisitors.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Unique Visitors
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center">
                <FiTrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {mockAnalytics.engagementRate}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Engagement
                </div>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 text-center">
                <FiUsers className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {mockAnalytics.averageTimeOnSite}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Avg. Time
                </div>
              </div>
            </div>

            {/* Traffic Sources */}
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
                Traffic Sources
              </h5>
              <div className="space-y-3">
                {mockAnalytics.topSources.map(source => (
                  <div
                    key={source.source}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400">
                      {source.source}
                    </div>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${source.color}`}
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm font-medium text-gray-900 dark:text-white">
                      {source.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h5 className="font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h5>
              <div className="space-y-3">
                {mockAnalytics.recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.time}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-purple-600">
                      {activity.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sharing Options */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Share Your Portfolio
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <FiMail className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-600">Email Signature</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
              <FiCode className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-600">QR Code</span>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
              <FiDownload className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-600">PDF Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

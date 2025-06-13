'use client';

import { FiCheck, FiTrendingUp, FiZap } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import React, { useState, useEffect } from 'react';




interface AnimatedBioEnhancementProps {
  originalBio: string;
  onEnhance: (enhancedBio: string) => void;
  template: string;
}

export function AnimatedBioEnhancement({
  originalBio,
  onEnhance,
  template,
}: AnimatedBioEnhancementProps): React.ReactElement {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedBio, setEnhancedBio] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [qualityScore, setQualityScore] = useState(65);
  const [targetScore, setTargetScore] = useState(65);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Enhanced bios based on template
  const enhancedBios: Record<string, string> = {
    developer:
      'Results-driven software engineer with 5+ years crafting scalable web solutions. Specialized in React, Node.js, and cloud architectures, delivering 40% performance improvements across enterprise applications. Led cross-functional teams in implementing microservices that reduced deployment time by 60%. Passionate about creating intuitive user experiences that drive business growth and user satisfaction.',
    designer:
      'Award-winning UI/UX designer with 5+ years transforming complex challenges into elegant digital experiences. Expert in design systems, user research, and accessibility, increasing user engagement by 85% across multiple platforms. Pioneered design thinking workshops that accelerated product development cycles by 45%. Committed to creating inclusive designs that delight users and drive measurable business outcomes.',
    consultant:
      'Strategic management consultant with 5+ years driving organizational transformation and operational excellence. Specialized in digital transformation and change management, delivering $2M+ in cost savings for Fortune 500 clients. Led 15+ enterprise-wide initiatives improving efficiency by 35%. Passionate about empowering teams to achieve sustainable growth through data-driven insights and innovative solutions.',
    business:
      'Dynamic business leader with 5+ years scaling revenue and building high-performance teams. Expert in strategic planning and market expansion, achieving 150% YoY growth across multiple ventures. Spearheaded digital transformation initiatives resulting in $5M revenue increase. Dedicated to fostering innovation and creating value through customer-centric strategies and operational excellence.',
    creative:
      'Versatile creative professional with 5+ years crafting compelling narratives across digital and traditional media. Specialized in brand storytelling and content strategy, increasing audience engagement by 200%. Launched award-winning campaigns reaching 1M+ viewers. Passionate about pushing creative boundaries while delivering measurable impact through authentic, purpose-driven content.',
    minimal:
      'Accomplished professional with 5+ years of proven expertise in delivering exceptional results. Demonstrated ability to lead complex projects, optimize processes, and drive innovation. Consistently exceeded performance targets by 30%+. Committed to continuous learning and creating lasting value through strategic thinking and collaborative leadership.',
    educator:
      'Innovative educator with 5+ years transforming learning experiences through technology and evidence-based pedagogy. Specialized in curriculum design and educational technology, improving student outcomes by 40%. Developed engaging programs serving 500+ learners annually. Dedicated to fostering inclusive learning environments that inspire curiosity and lifelong learning.',
    modern:
      'Forward-thinking professional with 5+ years at the intersection of technology and business innovation. Expert in agile methodologies and digital transformation, accelerating time-to-market by 50%. Built and scaled products used by 100K+ users globally. Passionate about leveraging emerging technologies to solve complex challenges and create meaningful impact.',
  };

  const keywordsByTemplate: Record<string, string[]> = {
    developer: [
      'React',
      'Node.js',
      'cloud architectures',
      'microservices',
      'performance optimization',
    ],
    designer: [
      'UI/UX',
      'design systems',
      'user research',
      'accessibility',
      'design thinking',
    ],
    consultant: [
      'strategic planning',
      'digital transformation',
      'change management',
      'cost savings',
      'operational excellence',
    ],
    business: [
      'revenue growth',
      'team building',
      'market expansion',
      'strategic planning',
      'digital transformation',
    ],
    creative: [
      'brand storytelling',
      'content strategy',
      'audience engagement',
      'creative campaigns',
      'digital media',
    ],
    minimal: [
      'project leadership',
      'process optimization',
      'innovation',
      'performance',
      'collaboration',
    ],
    educator: [
      'curriculum design',
      'educational technology',
      'student outcomes',
      'inclusive learning',
      'pedagogy',
    ],
    modern: [
      'agile methodologies',
      'digital transformation',
      'product development',
      'emerging technologies',
      'innovation',
    ],
  };

  const improvementsList = [
    'Added quantifiable achievements and metrics',
    'Highlighted industry-specific expertise',
    'Incorporated action verbs and power words',
    'Created compelling value proposition',
    'Optimized for ATS and SEO keywords',
  ];

  // Typewriter effect
  useEffect(() => {
    if (enhancedBio && isEnhancing) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= enhancedBio.length) {
          setDisplayText(enhancedBio.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsEnhancing(false);
          setShowComparison(true);
        }
      }, 20);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [enhancedBio, isEnhancing]);

  // Quality score animation
  useEffect(() => {
    if (targetScore > qualityScore) {
      const increment = (targetScore - qualityScore) / 30;
      const interval = setInterval(() => {
        setQualityScore(prev => {
          const next = prev + increment;
          if (next >= targetScore) {
            clearInterval(interval);
            return targetScore;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [targetScore, qualityScore]);

  const handleEnhance = (): void => {
    setIsEnhancing(true);
    const selectedBio = (enhancedBios[template as keyof typeof enhancedBios] ??
      enhancedBios.developer) as string;
    setEnhancedBio(selectedBio);
    setTargetScore(95);

    // Simulate keyword extraction
    setTimeout(() => {
      const selectedKeywords = (keywordsByTemplate[
        template as keyof typeof keywordsByTemplate
      ] ?? keywordsByTemplate.developer) as string[];
      setExtractedKeywords(selectedKeywords);
    }, 1000);

    // Simulate improvements detection
    setTimeout(() => {
      setImprovements(improvementsList);
    }, 1500);

    // Notify parent component
    setTimeout(() => {
      const selectedBio = (enhancedBios[
        template as keyof typeof enhancedBios
      ] ?? enhancedBios.developer) as string;
      onEnhance(selectedBio);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Original Bio Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Original Bio:
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Quality Score:</span>
            <span
              className={`text-sm font-bold ${getScoreColor(isEnhancing ? Math.round(qualityScore) : 65)}`}
            >
              {isEnhancing ? Math.round(qualityScore) : 65}%
            </span>
          </div>
        </div>
        <div
          className={`p-4 rounded-lg transition-all duration-300 ${
            showComparison
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-gray-50 dark:bg-gray-700'
          }`}
        >
          <p className="text-gray-600 dark:text-gray-400">{originalBio}</p>
          {showComparison && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              ❌ Generic description • No metrics • Missing keywords • Passive
              voice
            </div>
          )}
        </div>
      </div>

      {/* Enhancement Button */}
      <button
        onClick={handleEnhance}
        disabled={isEnhancing}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-3 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isEnhancing ? (
          <>
            <HiSparkles className="w-5 h-5 animate-pulse" />
            <span>AI is enhancing your bio...</span>
            <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </>
        ) : (
          <>
            <FiZap className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Enhance with AI</span>
            <HiSparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          </>
        )}
      </button>

      {/* Enhanced Bio Section */}
      {(displayText || enhancedBio) && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              AI-Enhanced Bio:
            </label>
            {!isEnhancing && (
              <div className="flex items-center space-x-2">
                <FiTrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-bold text-green-600">
                  {Math.round(qualityScore)}% Quality Score
                </span>
              </div>
            )}
          </div>
          <div
            className={`p-4 rounded-lg transition-all duration-300 ${
              showComparison
                ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 shadow-lg'
                : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            }`}
          >
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {displayText}
              {isEnhancing && (
                <span className="inline-block w-1 h-5 bg-purple-600 animate-pulse ml-1" />
              )}
            </p>
            {showComparison && (
              <div className="mt-3 text-xs text-green-600 dark:text-green-400">
                ✅ Quantifiable achievements • Industry keywords • Active voice
                • Compelling narrative
              </div>
            )}
          </div>
        </div>
      )}

      {/* Extracted Keywords */}
      {extractedKeywords.length > 0 && (
        <div className="animate-fade-in space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Extracted Keywords:
          </h4>
          <div className="flex flex-wrap gap-2">
            {extractedKeywords.map((keyword, index) => (
              <span
                key={keyword}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Improvements Made */}
      {improvements.length > 0 && (
        <div className="animate-fade-in space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            AI Improvements:
          </h4>
          <div className="space-y-2">
            {improvements.map((improvement, index) => (
              <div
                key={improvement}
                className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-400 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <FiCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{improvement}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

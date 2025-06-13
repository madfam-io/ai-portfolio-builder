'use client';

import React, { useState } from 'react';
import HiSparkles from 'react-icons/hi/HiSparkles';
import FiZap from 'react-icons/fi/FiZap';
import FiTrendingUp from 'react-icons/fi/FiTrendingUp';
import FiTarget from 'react-icons/fi/FiTarget';
import FiCheck from 'react-icons/fi/FiCheck';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies?: string[];
  link?: string;
}

interface ProjectEnhancementDemoProps {
  projects: Project[];
  onProjectEnhance: (projectId: string, enhancedDescription: string) => void;
}

interface STARBreakdown {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export function ProjectEnhancementDemo(): JSX.Element ({
  projects,
  onProjectEnhance,
}: ProjectEnhancementDemoProps) {
  const [enhancingProject, setEnhancingProject] = useState<string | null>(null);
  const [enhancedProjects, setEnhancedProjects] = useState<Set<string>>(
    new Set()
  );
  const [showSTAR, setShowSTAR] = useState<Record<string, boolean>>({});
  const [starBreakdowns, setStarBreakdowns] = useState<
    Record<string, STARBreakdown>
  >({});

  const enhancedDescriptions: Record<string, string> = {
    'E-commerce Platform':
      'Architected a scalable e-commerce platform serving 100K+ daily users, implementing microservices architecture that reduced page load time by 40%. Led a team of 5 developers to integrate real-time inventory management, resulting in 25% decrease in overselling incidents and $500K annual savings. Deployed advanced caching strategies and CDN optimization, achieving 99.9% uptime.',
    'Task Management App':
      'Developed an AI-powered task management application used by 50+ teams, featuring intelligent prioritization that improved team productivity by 35%. Implemented real-time collaboration features using WebSocket technology, reducing project completion time by 20%. Integrated with 10+ third-party tools, becoming the central hub for workflow automation.',
    'Portfolio Website':
      'Created a high-performance portfolio platform generating 200+ qualified leads monthly, with optimized SEO achieving first-page rankings for 15+ keywords. Implemented progressive web app features resulting in 60% increase in mobile engagement. Built custom analytics dashboard providing actionable insights that improved conversion rates by 45%.',
  };

  const starData: Record<string, STARBreakdown> = {
    'E-commerce Platform': {
      situation:
        'Company facing scalability issues with 50% cart abandonment rate due to slow performance',
      task: 'Redesign architecture to handle 10x traffic growth while improving user experience',
      action:
        'Implemented microservices, optimized database queries, and added intelligent caching layers',
      result:
        'Achieved 40% faster load times, reduced abandonment to 20%, saved $500K annually',
    },
    'Task Management App': {
      situation:
        'Teams struggling with scattered tools and 30% project deadline misses',
      task: 'Create unified platform to streamline workflows and improve team collaboration',
      action:
        'Built AI prioritization engine, real-time sync, and seamless integrations',
      result:
        'Improved on-time delivery by 35%, adopted by 50+ teams, 95% user satisfaction',
    },
    'Portfolio Website': {
      situation:
        'Low online visibility with <10 monthly inquiries from potential clients',
      task: 'Build SEO-optimized platform to increase qualified lead generation',
      action:
        'Implemented technical SEO, created engaging content, added conversion tracking',
      result:
        'Generated 200+ monthly leads, first-page rankings, 45% conversion rate increase',
    },
  };

  const extractedMetrics: Record<string, string[]> = {
    'E-commerce Platform': [
      '100K+ daily users',
      '40% faster load time',
      '25% reduction in overselling',
      '$500K annual savings',
      '99.9% uptime',
    ],
    'Task Management App': [
      '50+ teams',
      '35% productivity increase',
      '20% faster completion',
      '10+ integrations',
      '95% satisfaction',
    ],
    'Portfolio Website': [
      '200+ monthly leads',
      '15+ keyword rankings',
      '60% mobile engagement increase',
      '45% conversion improvement',
    ],
  };

  const handleEnhance = async (project: Project) => {
    setEnhancingProject(project.id);

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const enhancedDesc =
      enhancedDescriptions[project.title] ||
      `Enhanced ${project.title}: Delivered measurable impact through innovative solutions, improving key metrics by 40%+ and driving significant business value. Leveraged cutting-edge technologies to solve complex challenges and exceed stakeholder expectations.`;

    setEnhancedProjects(prev => new Set([...prev, project.id]));
    setStarBreakdowns(prev => ({
      ...prev,
      [project.id]: starData[project.title] || {
        situation: 'Identified opportunity for improvement',
        task: 'Develop innovative solution',
        action: 'Implemented best practices and modern technologies',
        result: 'Achieved significant measurable improvements',
      },
    }));
    setEnhancingProject(null);
    onProjectEnhance(project.id, enhancedDesc);
  };

  const toggleSTAR = (projectId: string) => {
    setShowSTAR(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Project Enhancement with STAR Format
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Transform basic descriptions into compelling success stories
        </p>
      </div>

      <div className="grid gap-6">
        {projects.slice(0, 3).map(project => (
          <div
            key={project.id}
            className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
              enhancedProjects.has(project.id) ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {project.title}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <p
                      className={
                        enhancedProjects.has(project.id)
                          ? 'line-through opacity-50'
                          : ''
                      }
                    >
                      {project.description}
                    </p>
                  </div>
                </div>
                {enhancedProjects.has(project.id) && (
                  <div className="flex items-center space-x-1 text-green-600 text-sm">
                    <FiCheck className="w-4 h-4" />
                    <span>Enhanced</span>
                  </div>
                )}
              </div>

              {/* Enhanced Description */}
              {enhancedProjects.has(project.id) && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {enhancedDescriptions[project.title]}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleEnhance(project)}
                  disabled={
                    enhancingProject === project.id ||
                    enhancedProjects.has(project.id)
                  }
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enhancingProject === project.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enhancing...</span>
                    </>
                  ) : (
                    <>
                      <FiZap className="w-4 h-4" />
                      <span>Enhance with AI</span>
                    </>
                  )}
                </button>

                {enhancedProjects.has(project.id) && (
                  <button
                    onClick={() => toggleSTAR(project.id)}
                    className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center space-x-2"
                  >
                    <FiTarget className="w-4 h-4" />
                    <span>View STAR</span>
                  </button>
                )}
              </div>

              {/* STAR Breakdown */}
              {showSTAR[project.id] && starBreakdowns[project.id] && (
                <div className="mt-4 space-y-3 animate-fade-in">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="bg-blue-600 text-white text-xs font-bold rounded px-2 py-1">
                        S
                      </div>
                      <div>
                        <h5 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                          Situation
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {starBreakdowns[project.id]?.situation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="bg-purple-600 text-white text-xs font-bold rounded px-2 py-1">
                        T
                      </div>
                      <div>
                        <h5 className="font-semibold text-purple-900 dark:text-purple-300 mb-1">
                          Task
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {starBreakdowns[project.id]?.task}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="bg-green-600 text-white text-xs font-bold rounded px-2 py-1">
                        A
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                          Action
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {starBreakdowns[project.id]?.action}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="bg-orange-600 text-white text-xs font-bold rounded px-2 py-1">
                        R
                      </div>
                      <div>
                        <h5 className="font-semibold text-orange-900 dark:text-orange-300 mb-1">
                          Result
                        </h5>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {starBreakdowns[project.id]?.result}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Extracted Metrics */}
              {enhancedProjects.has(project.id) &&
                extractedMetrics[project.title] && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2 mb-2">
                      <FiTrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Key Metrics:
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {extractedMetrics[project.title]?.map((metric, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <HiSparkles className="w-4 h-4 text-purple-600" />
          <span>
            AI analyzes your projects and creates compelling narratives with
            measurable impact
          </span>
        </div>
      </div>

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

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

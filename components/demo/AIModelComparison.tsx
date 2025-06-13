'use client';

import React, { useState, useEffect } from 'react';
import FiZap from 'react-icons/fi/FiZap';
import FiDollarSign from 'react-icons/fi/FiDollarSign';
import FiClock from 'react-icons/fi/FiClock';
import FiAward from 'react-icons/fi/FiAward';
import FiInfo from 'react-icons/fi/FiInfo';
import HiSparkles from 'react-icons/hi/HiSparkles';

interface AIModel {
  id: string;
  name: string;
  provider: string;
  speed: number; // 1-5
  quality: number; // 1-5
  cost: string;
  responseTime: string;
  bestFor: string[];
  description: string;
  recommended?: boolean;
}

interface AIModelComparisonProps {
  selectedModel?: string;
  onModelSelect?: (modelId: string) => void;
  activeTask?: 'bio' | 'project' | 'template';
}

export function AIModelComparison(): JSX.Element ({
  selectedModel = 'llama-3.1',
  onModelSelect,
  activeTask = 'bio',
}: AIModelComparisonProps) {
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);
  const [animatingModel, setAnimatingModel] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const models: AIModel[] = [
    {
      id: 'llama-3.1',
      name: 'Llama 3.1 8B',
      provider: 'Meta',
      speed: 4,
      quality: 5,
      cost: '$0.0002/request',
      responseTime: '1.2s',
      bestFor: ['Professional bios', 'Complex content', 'Technical writing'],
      description:
        'State-of-the-art model with excellent comprehension and generation capabilities',
      recommended: activeTask === 'bio',
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B v0.3',
      provider: 'Mistral AI',
      speed: 3,
      quality: 4,
      cost: '$0.0001/request',
      responseTime: '1.8s',
      bestFor: [
        'Creative content',
        'Template recommendations',
        'General purpose',
      ],
      description: 'Versatile model balancing performance and efficiency',
      recommended: activeTask === 'template',
    },
    {
      id: 'phi-3.5',
      name: 'Phi-3.5 Mini',
      provider: 'Microsoft',
      speed: 5,
      quality: 3,
      cost: '$0.00005/request',
      responseTime: '0.6s',
      bestFor: ['Quick edits', 'Project descriptions', 'Real-time suggestions'],
      description: 'Lightning-fast model optimized for speed and efficiency',
      recommended: activeTask === 'project',
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowComparison(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleModelSelect = (modelId: string) => {
    setAnimatingModel(modelId);
    setTimeout(() => {
      setAnimatingModel(null);
      onModelSelect?.(modelId);
    }, 300);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-xs ${
          i < rating ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'
        }`}
      >
        ★
      </span>
    ));
  };

  const renderSpeedBars = (speed: number) => {
    return (
      <div className="flex space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-3 rounded-sm transition-all duration-300 ${
              i < speed
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : 'bg-gray-200 dark:bg-gray-700'
            }`}
            style={{
              animationDelay: `${i * 100}ms`,
              transform:
                showComparison && i < speed ? 'scaleY(1)' : 'scaleY(0.3)',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Choose Your AI Model
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select the perfect AI model based on your needs
        </p>
      </div>

      {/* Live Status Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-2 text-sm bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-md">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-gray-700 dark:text-gray-300">
            All models operational
          </span>
          <span className="text-gray-500">• 99.9% uptime</span>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid lg:grid-cols-3 gap-4">
        {models.map((model, index) => (
          <div
            key={model.id}
            className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 cursor-pointer
              ${selectedModel === model.id ? 'ring-2 ring-purple-500 shadow-xl' : 'hover:shadow-xl'}
              ${animatingModel === model.id ? 'scale-105' : 'scale-100'}
              ${showComparison ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleModelSelect(model.id)}
            onMouseEnter={() => setHoveredModel(model.id)}
            onMouseLeave={() => setHoveredModel(null)}
          >
            {/* Recommended Badge */}
            {model.recommended && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-3 py-1 rounded-bl-lg">
                <span className="flex items-center space-x-1">
                  <HiSparkles className="w-3 h-3" />
                  <span>Recommended</span>
                </span>
              </div>
            )}

            {/* Model Header */}
            <div className="p-6 pb-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                    {model.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    by {model.provider}
                  </p>
                </div>
                <button
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={e => {
                    e.stopPropagation();
                    // Show model details
                  }}
                >
                  <FiInfo className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {model.description}
              </p>
            </div>

            {/* Metrics */}
            <div className="px-6 py-4 space-y-3">
              {/* Speed */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiZap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Speed
                  </span>
                </div>
                {renderSpeedBars(model.speed)}
              </div>

              {/* Quality */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiAward className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Quality
                  </span>
                </div>
                <div>{renderStars(model.quality)}</div>
              </div>

              {/* Cost */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiDollarSign className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Cost
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {model.cost}
                </span>
              </div>

              {/* Response Time */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiClock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Response
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {model.responseTime}
                </span>
              </div>
            </div>

            {/* Best For */}
            <div className="px-6 pb-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Best for:
              </p>
              <div className="flex flex-wrap gap-1">
                {model.bestFor.map((use, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                  >
                    {use}
                  </span>
                ))}
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedModel === model.id && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-purple-500 opacity-5" />
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-blue-600" />
              </div>
            )}

            {/* Hover Effect */}
            {hoveredModel === model.id && selectedModel !== model.id && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison View */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Quick Comparison
          </h4>
          <span className="text-xs text-gray-500">
            Based on{' '}
            {activeTask === 'bio'
              ? 'Bio Enhancement'
              : activeTask === 'project'
                ? 'Project Description'
                : 'Template Selection'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Fastest
            </p>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              Phi-3.5 Mini
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Best Quality
            </p>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              Llama 3.1 8B
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Best Value
            </p>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              Mistral 7B
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

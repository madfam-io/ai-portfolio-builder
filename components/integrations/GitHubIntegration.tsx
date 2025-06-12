'use client';

import React, { useState } from 'react';
import { FiGithub, FiStar, FiGitBranch, FiCode, FiCalendar, FiCheck, FiEye } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

interface GitHubRepository {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  url: string;
  lastUpdated: string;
  isPrivate: boolean;
}

interface GitHubProfile {
  username: string;
  name: string;
  bio: string;
  publicRepos: number;
  followers: number;
  following: number;
  repositories: GitHubRepository[];
}

interface GitHubIntegrationProps {
  onImport?: (profile: GitHubProfile) => void;
  onRepositorySelect?: (repositories: GitHubRepository[]) => void;
  isDemo?: boolean;
  className?: string;
  maxRepositories?: number;
}

export function GitHubIntegration({
  onImport,
  onRepositorySelect,
  isDemo = false,
  className = '',
  maxRepositories = 6
}: GitHubIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [analysisProgress, setAnalysisProgress] = useState(0);

  // Mock GitHub data for demo
  const mockProfile: GitHubProfile = {
    username: 'johndoe',
    name: 'John Doe',
    bio: 'Full-stack developer passionate about open source and clean code',
    publicRepos: 42,
    followers: 156,
    following: 89,
    repositories: [
      {
        id: '1',
        name: 'portfolio-website',
        description: 'Personal portfolio built with Next.js and Tailwind CSS',
        language: 'TypeScript',
        stars: 28,
        forks: 12,
        url: 'https://github.com/johndoe/portfolio-website',
        lastUpdated: '2024-01-15',
        isPrivate: false
      },
      {
        id: '2',
        name: 'e-commerce-platform',
        description: 'Full-stack e-commerce solution with React and Node.js',
        language: 'JavaScript',
        stars: 45,
        forks: 23,
        url: 'https://github.com/johndoe/e-commerce-platform',
        lastUpdated: '2024-01-10',
        isPrivate: false
      },
      {
        id: '3',
        name: 'task-manager-app',
        description: 'React-based task management application with real-time updates',
        language: 'TypeScript',
        stars: 19,
        forks: 8,
        url: 'https://github.com/johndoe/task-manager-app',
        lastUpdated: '2024-01-05',
        isPrivate: false
      },
      {
        id: '4',
        name: 'api-gateway-microservice',
        description: 'Scalable API gateway built with Express.js and Docker',
        language: 'JavaScript',
        stars: 12,
        forks: 5,
        url: 'https://github.com/johndoe/api-gateway-microservice',
        lastUpdated: '2023-12-20',
        isPrivate: false
      },
      {
        id: '5',
        name: 'ml-data-analyzer',
        description: 'Python-based machine learning tool for data analysis',
        language: 'Python',
        stars: 34,
        forks: 15,
        url: 'https://github.com/johndoe/ml-data-analyzer',
        lastUpdated: '2023-12-15',
        isPrivate: false
      },
      {
        id: '6',
        name: 'mobile-expense-tracker',
        description: 'React Native app for tracking personal expenses',
        language: 'JavaScript',
        stars: 22,
        forks: 9,
        url: 'https://github.com/johndoe/mobile-expense-tracker',
        lastUpdated: '2023-12-01',
        isPrivate: false
      }
    ]
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    
    if (isDemo) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsConnected(true);
      setIsConnecting(false);
      handleAnalyze();
    } else {
      // Real implementation would handle GitHub OAuth
      try {
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        const redirectUri = `${window.location.origin}/api/integrations/github/callback`;
        const scope = 'repo,read:user,user:email';
        
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      } catch (error) {
        console.error('GitHub connection failed:', error);
        setIsConnecting(false);
      }
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    const steps = [
      { label: 'Fetching repositories...', progress: 20 },
      { label: 'Analyzing code quality...', progress: 40 },
      { label: 'Calculating metrics...', progress: 60 },
      { label: 'Ranking projects...', progress: 80 },
      { label: 'Generating insights...', progress: 100 }
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setAnalysisProgress(step.progress);
    }
    
    setProfile(mockProfile);
    // Auto-select top repositories
    const topRepos = mockProfile.repositories
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 3)
      .map(repo => repo.id);
    setSelectedRepos(new Set(topRepos));
    setIsAnalyzing(false);
    
    if (onImport) {
      onImport(mockProfile);
    }
  };

  const toggleRepository = (repoId: string) => {
    const newSelected = new Set(selectedRepos);
    if (newSelected.has(repoId)) {
      newSelected.delete(repoId);
    } else if (newSelected.size < maxRepositories) {
      newSelected.add(repoId);
    }
    setSelectedRepos(newSelected);
  };

  const handleConfirmSelection = () => {
    if (profile && onRepositorySelect) {
      const selectedRepositories = profile.repositories.filter(repo => 
        selectedRepos.has(repo.id)
      );
      onRepositorySelect(selectedRepositories);
    }
  };

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      'TypeScript': 'bg-blue-500',
      'JavaScript': 'bg-yellow-500',
      'Python': 'bg-green-500',
      'Java': 'bg-red-500',
      'Go': 'bg-cyan-500',
      'Rust': 'bg-orange-500',
      'C++': 'bg-purple-500',
      'C#': 'bg-indigo-500',
    };
    return colors[language] || 'bg-gray-500';
  };

  if (!isConnected) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6">
          <div className="flex items-center space-x-3">
            <FiGithub className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">GitHub Integration</h3>
              <p className="text-gray-300">Showcase your best repositories and coding skills</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <FiCode className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Repository Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI analyzes your code quality and project impact</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiStar className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Smart Selection</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Automatically highlights your most impressive projects</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiGitBranch className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Live Updates</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Portfolio stays current with your latest commits</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting to GitHub...</span>
              </>
            ) : (
              <>
                <FiGithub className="w-5 h-5" />
                <span>Connect GitHub Account</span>
              </>
            )}
          </button>
          
          {isDemo && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Demo mode - No actual GitHub connection required
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center space-x-3">
            <FiGithub className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Analyzing Your Repositories</h3>
              <p className="text-green-100">AI is evaluating your projects...</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Analysis Progress
            </span>
            <span className="text-sm text-gray-500">{analysisProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-600 to-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <HiSparkles className="w-4 h-4 animate-pulse" />
            <span>Evaluating code quality, documentation, and project impact...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiGithub className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">GitHub Connected</h3>
              <p className="text-green-100">{profile?.publicRepos} repositories analyzed</p>
            </div>
          </div>
          <div className="text-right text-green-100">
            <p className="text-sm">{profile?.followers} followers</p>
            <p className="text-xs opacity-75">{profile?.following} following</p>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
              Select Your Best Repositories
            </h4>
            <span className="text-sm text-gray-500">
              {selectedRepos.size}/{maxRepositories} selected
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose up to {maxRepositories} repositories to showcase in your portfolio
          </p>
        </div>
        
        <div className="grid gap-4 mb-6">
          {profile?.repositories.map((repo) => (
            <div
              key={repo.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedRepos.has(repo.id)
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => toggleRepository(repo.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h5 className="font-bold text-gray-900 dark:text-white">{repo.name}</h5>
                    {selectedRepos.has(repo.id) && (
                      <FiCheck className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {repo.description}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`} />
                      <span>{repo.language}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiStar className="w-3 h-3" />
                      <span>{repo.stars}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiGitBranch className="w-3 h-3" />
                      <span>{repo.forks}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FiCalendar className="w-3 h-3" />
                      <span>{new Date(repo.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(repo.url, '_blank');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FiEye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={handleConfirmSelection}
          disabled={selectedRepos.size === 0}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <FiCheck className="w-5 h-5" />
          <span>Import Selected Repositories</span>
        </button>
      </div>
    </div>
  );
}
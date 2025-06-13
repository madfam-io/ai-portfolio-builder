'use client';

import React, { useState } from 'react';
import {
  FiLinkedin,
  FiCheck,
  FiDownload,
  FiUser,
  FiBriefcase,
  FiAward,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

interface LinkedInProfile {
  name: string;
  headline: string;
  summary: string;
  location: string;
  connections: number;
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  skills: Array<{
    name: string;
    endorsements: number;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    year: string;
  }>;
}

interface LinkedInImportProps {
  onImport?: (profile: LinkedInProfile) => void;
  isDemo?: boolean;
  className?: string;
}

export function LinkedInImport({
  onImport,
  isDemo = false,
  className = '',
}: LinkedInImportProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importedData, setImportedData] = useState<LinkedInProfile | null>(
    null
  );

  // Mock LinkedIn profile data for demo
  const mockProfile: LinkedInProfile = {
    name: 'John Doe',
    headline: 'Senior Full-Stack Developer at TechCorp',
    summary:
      'Passionate software engineer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies.',
    location: 'San Francisco, CA',
    connections: 500,
    experience: [
      {
        company: 'TechCorp',
        position: 'Senior Full-Stack Developer',
        duration: '2022 - Present',
        description:
          'Lead development of microservices architecture serving 1M+ users. Reduced deployment time by 60% through CI/CD optimization.',
      },
      {
        company: 'StartupXYZ',
        position: 'Frontend Developer',
        duration: '2020 - 2022',
        description:
          'Built responsive web applications using React and TypeScript. Improved user engagement by 40% through UX optimization.',
      },
      {
        company: 'DevAgency',
        position: 'Junior Developer',
        duration: '2019 - 2020',
        description:
          'Developed client websites and web applications. Gained experience in full-stack development and agile methodologies.',
      },
    ],
    skills: [
      { name: 'React', endorsements: 45 },
      { name: 'JavaScript', endorsements: 38 },
      { name: 'Node.js', endorsements: 32 },
      { name: 'TypeScript', endorsements: 28 },
      { name: 'Python', endorsements: 22 },
    ],
    education: [
      {
        school: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        year: '2019',
      },
    ],
  };

  const handleConnect = async () => {
    setIsConnecting(true);

    if (isDemo) {
      // Demo flow
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsConnected(true);
      setIsConnecting(false);
    } else {
      // Real implementation would handle LinkedIn OAuth
      try {
        // Redirect to LinkedIn OAuth
        const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
        const redirectUri = `${window.location.origin}/api/integrations/linkedin/callback`;
        const scope = 'r_liteprofile r_emailaddress w_member_social';

        window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
      } catch (error) {
        console.error('LinkedIn connection failed:', error);
        setIsConnecting(false);
      }
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    setImportProgress(0);

    // Simulate progressive data import
    const steps = [
      { label: 'Fetching profile data...', progress: 20 },
      { label: 'Importing experience...', progress: 40 },
      { label: 'Processing skills...', progress: 60 },
      { label: 'Extracting education...', progress: 80 },
      { label: 'Optimizing content...', progress: 100 },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setImportProgress(step.progress);
    }

    setImportedData(mockProfile);
    setIsImporting(false);

    if (onImport) {
      onImport(mockProfile);
    }
  };

  if (!isConnected) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center space-x-3">
            <FiLinkedin className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">LinkedIn Import</h3>
              <p className="text-blue-100">
                Connect your LinkedIn profile to import your professional data
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <FiCheck className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Professional Experience
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Import your work history, job titles, and descriptions
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiCheck className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Skills & Endorsements
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get your skills with endorsement counts for credibility
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiCheck className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Education & Certifications
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Import your academic background and professional
                  certifications
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting to LinkedIn...</span>
              </>
            ) : (
              <>
                <FiLinkedin className="w-5 h-5" />
                <span>Connect LinkedIn Profile</span>
              </>
            )}
          </button>

          {isDemo && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Demo mode - No actual LinkedIn connection required
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FiLinkedin className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">LinkedIn Connected</h3>
              <p className="text-green-100">
                Ready to import your professional data
              </p>
            </div>
          </div>
          <FiCheck className="w-8 h-8" />
        </div>
      </div>

      {!importedData ? (
        <div className="p-6">
          {isImporting ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Importing your data...
                </span>
                <span className="text-sm text-gray-500">{importProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <HiSparkles className="w-4 h-4 animate-pulse" />
                <span>AI is enhancing your content for maximum impact...</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleImport}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <FiDownload className="w-5 h-5" />
              <span>Import LinkedIn Data</span>
            </button>
          )}
        </div>
      ) : (
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Import Successful!
            </h4>
            <p className="text-gray-600 dark:text-gray-400">
              Your LinkedIn data has been imported and optimized
            </p>
          </div>

          {/* Imported Data Preview */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FiUser className="w-4 h-4 text-blue-600" />
                <h5 className="font-medium text-gray-900 dark:text-white">
                  Profile
                </h5>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {importedData.name} • {importedData.connections}+ connections
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FiBriefcase className="w-4 h-4 text-green-600" />
                <h5 className="font-medium text-gray-900 dark:text-white">
                  Experience
                </h5>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {importedData.experience.length} positions imported
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <FiAward className="w-4 h-4 text-purple-600" />
                <h5 className="font-medium text-gray-900 dark:text-white">
                  Skills
                </h5>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {importedData.skills.length} skills with endorsements
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
              <FiCheck className="w-4 h-4" />
              <span>
                All data has been imported and is ready for customization
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

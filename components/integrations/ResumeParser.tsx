'use client';

import React, { useState, useCallback } from 'react';
import { FiUpload, FiFile, FiCheck, FiX, FiEye } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

interface ParsedResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    confidence: number;
  }>;
  education: Array<{
    school: string;
    degree: string;
    field: string;
    year: string;
    confidence: number;
  }>;
  skills: Array<{
    name: string;
    category: string;
    confidence: number;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    confidence: number;
  }>;
  languages: Array<{
    language: string;
    level: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

interface ResumeParserProps {
  onParse?: (data: ParsedResumeData) => void;
  isDemo?: boolean;
  className?: string;
  acceptedFormats?: string[];
}

export function ResumeParser({
  onParse,
  isDemo = false,
  className = '',
  acceptedFormats = ['.pdf', '.doc', '.docx', '.txt']
}: ResumeParserProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  // const [editingSection, setEditingSection] = useState<string | null>(null);

  // Mock parsed data for demo
  const mockParsedData: ParsedResumeData = {
    personalInfo: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      summary: 'Experienced software engineer with 5+ years building scalable web applications and leading development teams.'
    },
    experience: [
      {
        company: 'TechCorp Inc.',
        position: 'Senior Full-Stack Developer',
        duration: '2022 - Present',
        description: 'Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%.',
        confidence: 95
      },
      {
        company: 'StartupXYZ',
        position: 'Frontend Developer',
        duration: '2020 - 2022',
        description: 'Built responsive web applications using React and TypeScript. Improved user engagement by 40% through UX optimization.',
        confidence: 92
      },
      {
        company: 'DevAgency',
        position: 'Junior Developer',
        duration: '2019 - 2020',
        description: 'Developed client websites and web applications. Gained experience in full-stack development.',
        confidence: 88
      }
    ],
    education: [
      {
        school: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        year: '2019',
        confidence: 98
      }
    ],
    skills: [
      { name: 'React', category: 'Frontend', confidence: 95 },
      { name: 'Node.js', category: 'Backend', confidence: 90 },
      { name: 'TypeScript', category: 'Languages', confidence: 92 },
      { name: 'Python', category: 'Languages', confidence: 85 },
      { name: 'AWS', category: 'Cloud', confidence: 88 },
      { name: 'Docker', category: 'DevOps', confidence: 82 },
      { name: 'PostgreSQL', category: 'Database', confidence: 86 },
      { name: 'Git', category: 'Tools', confidence: 94 }
    ],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Full-stack e-commerce solution with React frontend and Node.js backend',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
        confidence: 89
      },
      {
        name: 'Task Management App',
        description: 'Real-time collaborative task management application',
        technologies: ['React', 'Socket.io', 'MongoDB'],
        confidence: 85
      }
    ],
    languages: [
      { language: 'English', level: 'Native' },
      { language: 'Spanish', level: 'Conversational' }
    ],
    certifications: [
      {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023'
      }
    ]
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const file = files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsUploading(false);
    
    // Start parsing
    await handleParse();
  };

  const handleParse = async () => {
    setIsParsing(true);
    setParseProgress(0);
    
    const steps = [
      { label: 'Reading document...', progress: 20 },
      { label: 'Extracting text content...', progress: 40 },
      { label: 'Identifying sections...', progress: 60 },
      { label: 'Parsing structured data...', progress: 80 },
      { label: 'Validating and optimizing...', progress: 100 }
    ];
    
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setParseProgress(step.progress);
    }
    
    setParsedData(mockParsedData);
    setIsParsing(false);
    
    if (onParse) {
      onParse(mockParsedData);
    }
  };

  // const getConfidenceColor = (confidence: number) => {
  //   if (confidence >= 90) return 'text-green-600';
  //   if (confidence >= 70) return 'text-yellow-600';
  //   return 'text-red-600';
  // };

  // const getConfidenceBadge = (confidence: number) => {
  //   if (confidence >= 90) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  //   if (confidence >= 70) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  //   return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
  // };

  if (!uploadedFile) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <FiUpload className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Resume Parser</h3>
              <p className="text-green-100">Upload your resume and let AI extract all the details</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <FiFile className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Drop your resume here
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              or click to browse and select a file
            </p>
            
            <input
              type="file"
              accept={acceptedFormats.join(',')}
              onChange={handleFileSelect}
              className="hidden"
              id="resume-upload"
            />
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <FiUpload className="w-4 h-4" />
              <span>Choose File</span>
            </label>
            
            <div className="mt-4 text-sm text-gray-500">
              Supported formats: {acceptedFormats.join(', ')}
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-start space-x-3">
              <FiCheck className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">AI-Powered Extraction</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Intelligently identifies and extracts all sections of your resume</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiCheck className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Smart Validation</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Confidence scores help you verify extracted information</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FiCheck className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white">Privacy Protected</h5>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your resume is processed securely and never stored</p>
              </div>
            </div>
          </div>
          
          {isDemo && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Demo mode - Upload any file to see the parsing simulation
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isUploading || isParsing) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center space-x-3">
            <FiFile className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">
                {isUploading ? 'Uploading Resume' : 'Parsing Content'}
              </h3>
              <p className="text-blue-100">
                {uploadedFile.name} • {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isParsing ? 'Parsing Progress' : 'Upload Progress'}
            </span>
            <span className="text-sm text-gray-500">
              {isParsing ? `${parseProgress}%` : '100%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${isParsing ? parseProgress : 100}%` }}
            />
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <HiSparkles className="w-4 h-4 animate-pulse" />
            <span>
              {isUploading 
                ? 'Uploading your resume securely...'
                : 'AI is analyzing and extracting your professional information...'
              }
            </span>
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
            <FiFile className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold">Resume Parsed Successfully</h3>
              <p className="text-green-100">{uploadedFile.name} • All sections extracted</p>
            </div>
          </div>
          <FiCheck className="w-8 h-8" />
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="text-center">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Extraction Complete!
          </h4>
          <p className="text-gray-600 dark:text-gray-400">
            Review the extracted information and make any necessary corrections
          </p>
        </div>
        
        {/* Extraction Summary */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{parsedData?.experience.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Work Experience</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{parsedData?.skills.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Skills Identified</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{parsedData?.projects.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Projects Found</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{parsedData?.education.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Education</div>
          </div>
        </div>
        
        {/* Confidence Score Overview */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-gray-900 dark:text-white">Overall Extraction Quality</h5>
            <span className="text-2xl font-bold text-green-600">92%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 h-2 rounded-full" style={{ width: '92%' }} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            High-confidence extraction with minimal manual review needed
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => console.log('Review extracted data')}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <FiEye className="w-4 h-4" />
            <span>Review Extracted Data</span>
          </button>
          <button
            onClick={() => setParsedData(null)}
            className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
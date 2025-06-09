'use client';

import React, { useState } from 'react';
import { PortfolioEditor } from '@/components/editor';
import { Portfolio, TemplateType } from '@/types/portfolio';
import { LanguageProvider } from '@/lib/i18n/minimal-context';

// Demo portfolio data
const demoPortfolio: Portfolio = {
  id: 'demo-1',
  userId: 'demo-user',
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Experienced developer with a passion for creating scalable applications using modern technologies.',
  tagline: 'Building the future, one line at a time',
  avatarUrl: '/avatar.jpg',
  contact: {
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'San Francisco, CA',
    availability: 'Available for freelance',
  },
  social: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      startDate: '2020-01',
      current: true,
      description: 'Leading development of cloud-native applications',
      highlights: ['Led team of 5 developers', 'Increased performance by 40%'],
      technologies: ['React', 'Node.js', 'AWS'],
    },
    {
      id: 'exp-2',
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      startDate: '2018-06',
      endDate: '2019-12',
      current: false,
      description: 'Built MVP for fintech startup',
      highlights: ['Architected microservices', 'Implemented CI/CD'],
      technologies: ['Vue.js', 'Python', 'Docker'],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      current: false,
      achievements: ["Dean's List", 'Graduated Magna Cum Laude'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'E-commerce Platform',
      description: 'Built a scalable e-commerce solution handling 100k+ users',
      imageUrl: '/project1.jpg',
      projectUrl: 'https://example.com',
      githubUrl: 'https://github.com/johndoe/ecommerce',
      technologies: ['React', 'Node.js', 'MongoDB'],
      highlights: ['100k+ active users', 'Real-time inventory', '99.9% uptime'],
      featured: true,
      order: 1,
    },
    {
      id: 'proj-2',
      title: 'Task Management App',
      description: 'Collaborative task management with real-time updates',
      technologies: ['React Native', 'Firebase'],
      highlights: ['Cross-platform', 'Offline sync'],
      featured: false,
      order: 2,
    },
  ],
  skills: [
    { name: 'JavaScript', level: 'expert', category: 'Programming' },
    { name: 'TypeScript', level: 'advanced', category: 'Programming' },
    { name: 'React', level: 'expert', category: 'Frontend' },
    { name: 'Node.js', level: 'advanced', category: 'Backend' },
    { name: 'AWS', level: 'intermediate', category: 'Cloud' },
    { name: 'Docker', level: 'intermediate', category: 'DevOps' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      issueDate: '2022-01',
      credentialId: 'ABC123',
      credentialUrl: 'https://aws.amazon.com/verify/ABC123',
    },
  ],
  template: 'developer' as TemplateType,
  customization: {
    primaryColor: '#1a73e8',
    secondaryColor: '#34a853',
    accentColor: '#ea4335',
    fontFamily: 'Inter',
    headerStyle: 'bold',
    sectionOrder: [
      'about',
      'experience',
      'projects',
      'skills',
      'education',
      'certifications',
    ],
  },
  status: 'draft',
  subdomain: 'johndoe',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
};

export default function PortfolioEditorDemo() {
  const [portfolio, setPortfolio] = useState<Portfolio>(demoPortfolio);
  const [isPublished, setIsPublished] = useState(false);

  const handleSave = async (updatedPortfolio: Portfolio) => {
    console.log('Saving portfolio:', updatedPortfolio);
    setPortfolio(updatedPortfolio);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handlePublish = async () => {
    console.log('Publishing portfolio...');
    setIsPublished(!isPublished);
    setPortfolio(prev => ({
      ...prev,
      status: isPublished ? 'draft' : 'published',
      publishedAt: isPublished ? undefined : new Date(),
    }));
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Demo Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Portfolio Editor Demo
              </h1>
              <p className="text-sm text-gray-600">
                Interactive demonstration of the PRISMA portfolio editor
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  portfolio.status === 'published'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {portfolio.status}
              </span>
              <a
                href="/"
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to Landing
              </a>
            </div>
          </div>
        </div>

        {/* Portfolio Editor */}
        <PortfolioEditor
          portfolio={portfolio}
          onSave={handleSave}
          onPublish={handlePublish}
          autoSave={false}
        />

        {/* Demo Info */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-sm font-medium text-blue-900 mb-2">
              Demo Information
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • This is a functional demo of the PRISMA Portfolio Editor
              </li>
              <li>
                • Try editing the basic information, adding skills, or changing
                templates
              </li>
              <li>• The preview updates in real-time as you make changes</li>
              <li>
                • Save and publish functions are simulated (no data is actually
                saved)
              </li>
              <li>• AI enhancement features are placeholders in this demo</li>
            </ul>
          </div>
        </div>
      </div>
    </LanguageProvider>
  );
}

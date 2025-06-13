'use client';

import { useState } from 'react';
} from 'react-icons/fi';
import {
  FiUser,
  FiBriefcase,
  FiFolder,
  FiAward,
  FiMail,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiPlus,
  FiEdit3,

import { Portfolio, SectionType } from '@/types/portfolio';


interface EditorSidebarProps {
  portfolio: Portfolio;
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  onSectionUpdate: (section: SectionType, updates: unknown) => void;
  errors: Record<string, string>;
}

const SECTION_CONFIG = {
  hero: {
    icon: FiUser,
    label: 'Hero Section',
    description: 'Main introduction',
  },
  about: {
    icon: FiUser,
    label: 'About Me',
    description: 'Personal background',
  },
  experience: {
    icon: FiBriefcase,
    label: 'Experience',
    description: 'Work history',
  },
  projects: {
    icon: FiFolder,
    label: 'Projects',
    description: 'Portfolio projects',
  },
  skills: {
    icon: FiAward,
    label: 'Skills',
    description: 'Technical abilities',
  },
  education: {
    icon: FiAward,
    label: 'Education',
    description: 'Academic background',
  },
  contact: {
    icon: FiMail,
    label: 'Contact',
    description: 'Contact information',
  },
  custom: {
    icon: FiSettings,
    label: 'Custom Section',
    description: 'Custom content',
  },
};

export function EditorSidebar({
  portfolio,
  activeSection,
  onSectionChange,
  onSectionUpdate,
  errors,
}: EditorSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(
    new Set([activeSection])
  );

  const toggleSection = (section: SectionType) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
    onSectionChange(section);
  };

  const renderBasicInfoEditor = () => (
    <div className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          value={portfolio.name || ''}
          onChange={e =>
            onSectionUpdate('hero', { ...portfolio, name: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Your full name"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Professional Title
        </label>
        <input
          type="text"
          value={portfolio.title || ''}
          onChange={e =>
            onSectionUpdate('hero', { ...portfolio, title: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Senior Software Developer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tagline
        </label>
        <input
          type="text"
          value={portfolio.tagline || ''}
          onChange={e =>
            onSectionUpdate('hero', { ...portfolio, tagline: e.target.value })
          }
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="A short, catchy tagline"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          value={portfolio.bio || ''}
          onChange={e =>
            onSectionUpdate('about', { ...portfolio, bio: e.target.value })
          }
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Tell us about yourself..."
        />
        <p className="text-xs text-gray-500 mt-1">
          {portfolio.bio?.length || 0} / 500 characters
        </p>
      </div>
    </div>
  );

  const renderExperienceEditor = () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Work Experience</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          <FiPlus className="w-4 h-4 inline mr-1" />
          Add Experience
        </button>
      </div>

      <div className="space-y-3">
        {portfolio.experience?.map(exp => (
          <div key={exp.id} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{exp.company}</h4>
                <p className="text-sm text-gray-600">{exp.position}</p>
                <p className="text-xs text-gray-500">
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <FiEdit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProjectsEditor = () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Projects</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          <FiPlus className="w-4 h-4 inline mr-1" />
          Add Project
        </button>
      </div>

      <div className="space-y-3">
        {portfolio.projects?.map(project => (
          <div
            key={project.id}
            className="border border-gray-200 rounded-lg p-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{project.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  {project.featured && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Featured
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {project.technologies?.slice(0, 2).join(', ')}
                    {project.technologies &&
                      project.technologies.length > 2 &&
                      '...'}
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <FiEdit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkillsEditor = () => (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900">Skills</h3>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          <FiPlus className="w-4 h-4 inline mr-1" />
          Add Skill
        </button>
      </div>

      <div className="space-y-3">
        {Object.entries(
          portfolio.skills?.reduce(
            (acc, skill) => {
              const category = skill.category || 'General';
              if (!acc[category]) acc[category] = [];
              acc[category].push(skill);
              return acc;
            },
            {} as Record<string, any[]>
          ) || {}
        ).map(([category, skills]) => (
          <div key={category} className="border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {skill.name}
                  {skill.level && (
                    <span className="ml-1 text-blue-600">• {skill.level}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSectionContent = (section: SectionType) => {
    switch (section) {
      case 'hero':
      case 'about':
        return renderBasicInfoEditor();
      case 'experience':
        return renderExperienceEditor();
      case 'projects':
        return renderProjectsEditor();
      case 'skills':
        return renderSkillsEditor();
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Section editor coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Edit Portfolio</h2>
        <p className="text-sm text-gray-600">
          Customize your portfolio content
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {Object.entries(SECTION_CONFIG).map(([sectionKey, config]) => {
          const section = sectionKey as SectionType;
          const isExpanded = expandedSections.has(section);
          const isActive = activeSection === section;
          const Icon = config.icon;

          return (
            <div key={section}>
              <button
                onClick={() => toggleSection(section)}
                className={`w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                  />
                  <div>
                    <div
                      className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}
                    >
                      {config.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {config.description}
                    </div>
                  </div>
                </div>
                {isExpanded ? (
                  <FiChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <FiChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="bg-gray-50">
                  {renderSectionContent(section)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import {
  Award as FiAward,
  Briefcase as FiBriefcase,
  ChevronDown,
  ChevronRight,
  Folder as FiFolder,
  Mail as FiMail,
  Settings as FiSettings,
  User as FiUser,
} from 'lucide-react';
import { useState } from 'react';

import { Portfolio, SectionType } from '@/types/portfolio';
import { HeroSection } from './sections/HeroSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { SkillsSection } from './sections/SkillsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { ContactSection } from './sections/ContactSection';
import { ThemeCustomizer } from './panels/ThemeCustomizer';

interface EditorSidebarProps {
  portfolio: Portfolio;
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  onSectionUpdate: (section: SectionType, updates: unknown) => void;
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
  certifications: {
    icon: FiAward,
    label: 'Certifications',
    description: 'Professional certifications',
  },
  contact: {
    icon: FiMail,
    label: 'Contact',
    description: 'Contact information',
  },
  theme: {
    icon: FiSettings,
    label: 'Theme',
    description: 'Customize appearance',
  },
};

export function EditorSidebar({
  portfolio,
  activeSection,
  onSectionChange,
  onSectionUpdate,
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

  const renderSectionContent = (section: SectionType) => {
    switch (section) {
      case 'hero':
      case 'about':
        return (
          <HeroSection
            data={{
              name: portfolio.name,
              title: portfolio.title,
              bio: portfolio.bio,
              location: portfolio.location,
              avatarUrl: portfolio.avatarUrl,
              headline: (portfolio.data?.headline as string) || undefined,
              tagline: portfolio.tagline,
              social: portfolio.social,
            }}
            onUpdate={updates => onSectionUpdate('hero', updates)}
          />
        );
      case 'experience':
        return (
          <ExperienceSection
            experiences={portfolio.experience || []}
            onUpdate={experiences =>
              onSectionUpdate('experience', { experience: experiences })
            }
          />
        );
      case 'education':
        return (
          <EducationSection
            education={portfolio.education || []}
            onUpdate={education => onSectionUpdate('education', { education })}
          />
        );
      case 'projects':
        return (
          <ProjectsSection
            projects={portfolio.projects || []}
            onUpdate={projects => onSectionUpdate('projects', { projects })}
          />
        );
      case 'skills':
        return (
          <SkillsSection
            skills={portfolio.skills || []}
            onUpdate={skills => onSectionUpdate('skills', { skills })}
          />
        );
      case 'certifications':
        return (
          <CertificationsSection
            certifications={portfolio.certifications || []}
            onUpdate={certifications =>
              onSectionUpdate('certifications', { certifications })
            }
          />
        );
      case 'contact':
        return (
          <ContactSection
            contact={portfolio.contact || {}}
            social={portfolio.social || {}}
            onUpdate={data => {
              if (data.contact)
                onSectionUpdate('contact', { contact: data.contact });
              if (data.social)
                onSectionUpdate('contact', { social: data.social });
            }}
          />
        );
      case 'theme':
        return (
          <ThemeCustomizer
            customization={portfolio.customization || {}}
            onUpdate={customization =>
              onSectionUpdate('theme', { customization })
            }
            template={portfolio.template}
          />
        );
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
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
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

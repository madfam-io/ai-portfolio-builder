/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.com
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import {
  Award as FiAward,
  Briefcase as FiBriefcase,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Folder as FiFolder,
  GripVertical,
  Mail as FiMail,
  Settings as FiSettings,
  User as FiUser,
} from 'lucide-react';
import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Portfolio, SectionType } from '@/types/portfolio';
import { HeroSection } from './sections/HeroSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { SkillsSection } from './sections/SkillsSection';
import { CertificationsSection } from './sections/CertificationsSection';
import { ContactSection } from './sections/ContactSection';
import { ThemeCustomizer } from './panels/ThemeCustomizer';
import { cn } from '@/lib/utils';

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
    required: true,
  },
  about: {
    icon: FiUser,
    label: 'About Me',
    description: 'Personal background',
    required: true,
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
    required: true,
  },
};

// Default section order
const DEFAULT_SECTION_ORDER: SectionType[] = [
  'hero',
  'about',
  'experience',
  'projects',
  'skills',
  'education',
  'certifications',
  'contact',
];

interface SortableSectionItemProps {
  section: SectionType;
  isActive: boolean;
  isExpanded: boolean;
  isHidden: boolean;
  onToggle: () => void;
  onVisibilityToggle: () => void;
}

function SortableSectionItem({
  section,
  isActive,
  isExpanded,
  isHidden,
  onToggle,
  onVisibilityToggle,
}: SortableSectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = SECTION_CONFIG[section as keyof typeof SECTION_CONFIG];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative',
        isDragging && 'opacity-50',
        isHidden && 'opacity-60'
      )}
    >
      <div
        className={cn(
          'flex items-center group',
          isActive && !isHidden && 'bg-blue-50 border-r-2 border-blue-500'
        )}
      >
        <div
          {...attributes}
          {...listeners}
          className="p-2 cursor-grab hover:bg-gray-100"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <button
          onClick={onToggle}
          className="flex-1 flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Icon
              className={cn(
                'w-5 h-5',
                isActive && !isHidden ? 'text-blue-600' : 'text-gray-400'
              )}
            />
            <div>
              <div
                className={cn(
                  'font-medium',
                  isActive && !isHidden ? 'text-blue-900' : 'text-gray-900',
                  isHidden && 'line-through'
                )}
              >
                {config.label}
              </div>
              <div className="text-sm text-gray-500">{config.description}</div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {!('required' in config && config.required) && (
          <button
            onClick={e => {
              e.stopPropagation();
              onVisibilityToggle();
            }}
            className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
            title={isHidden ? 'Show section' : 'Hide section'}
          >
            {isHidden ? (
              <EyeOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export function EditorSidebarEnhanced({
  portfolio,
  activeSection,
  onSectionChange,
  onSectionUpdate,
}: EditorSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<SectionType>>(
    new Set([activeSection])
  );

  // Initialize section order and hidden sections from portfolio customization
  const [sectionOrder, setSectionOrder] = useState<SectionType[]>(
    (portfolio.customization?.sectionOrder as SectionType[]) ||
      DEFAULT_SECTION_ORDER
  );

  const [hiddenSections, setHiddenSections] = useState<Set<string>>(
    new Set(portfolio.customization?.hiddenSections || [])
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  const toggleSectionVisibility = (section: string) => {
    const newHidden = new Set(hiddenSections);
    if (newHidden.has(section)) {
      newHidden.delete(section);
    } else {
      newHidden.add(section);
      // If hiding the active section, switch to the first visible section
      if (section === activeSection) {
        const firstVisible = sectionOrder.find(s => !newHidden.has(s));
        if (firstVisible) {
          onSectionChange(firstVisible);
        }
      }
    }
    setHiddenSections(newHidden);

    // Update portfolio customization
    onSectionUpdate('theme', {
      customization: {
        ...portfolio.customization,
        hiddenSections: Array.from(newHidden),
      },
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as SectionType);
      const newIndex = sectionOrder.indexOf(over.id as SectionType);

      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      setSectionOrder(newOrder);

      // Update portfolio customization
      onSectionUpdate('theme', {
        customization: {
          ...portfolio.customization,
          sectionOrder: newOrder,
        },
      });
    }
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
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Section editor coming soon...</p>
          </div>
        );
    }
  };

  // Separate theme section from draggable sections
  const draggableSections = sectionOrder.filter(s => s !== 'theme');

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Edit Portfolio</h2>
        <p className="text-sm text-gray-600">
          Drag sections to reorder • Click eye to hide
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={draggableSections}
            strategy={verticalListSortingStrategy}
          >
            {draggableSections.map(section => {
              const isExpanded = expandedSections.has(section);
              const isActive = activeSection === section;
              const isHidden = hiddenSections.has(section);

              return (
                <div key={section}>
                  <SortableSectionItem
                    section={section}
                    isActive={isActive}
                    isExpanded={isExpanded}
                    isHidden={isHidden}
                    onToggle={() => toggleSection(section)}
                    onVisibilityToggle={() => toggleSectionVisibility(section)}
                  />

                  {isExpanded && !isHidden && (
                    <div className="bg-gray-50">
                      {renderSectionContent(section)}
                    </div>
                  )}
                </div>
              );
            })}
          </SortableContext>
        </DndContext>

        {/* Theme section - not draggable */}
        <div data-tour="theme-section">
          <button
            onClick={() => toggleSection('theme')}
            className={cn(
              'w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors',
              activeSection === 'theme' &&
                'bg-blue-50 border-r-2 border-blue-500'
            )}
          >
            <div className="flex items-center space-x-3">
              <FiSettings
                className={cn(
                  'w-5 h-5',
                  activeSection === 'theme' ? 'text-blue-600' : 'text-gray-400'
                )}
              />
              <div>
                <div
                  className={cn(
                    'font-medium',
                    activeSection === 'theme'
                      ? 'text-blue-900'
                      : 'text-gray-900'
                  )}
                >
                  Theme
                </div>
                <div className="text-sm text-gray-500">
                  Customize appearance
                </div>
              </div>
            </div>
            {expandedSections.has('theme') ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {expandedSections.has('theme') && (
            <div className="bg-gray-50">
              <ThemeCustomizer
                customization={portfolio.customization || {}}
                onUpdate={customization =>
                  onSectionUpdate('theme', { customization })
                }
                template={portfolio.template}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

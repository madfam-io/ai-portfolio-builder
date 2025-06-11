/**
 * Section Editor Component
 * Provides editing interface for different portfolio sections with drag-and-drop
 */

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Award,
} from 'lucide-react';
import { DraggableItem } from './DraggableItem';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { cn } from '@/components/ui/utils';
import { WidgetErrorBoundary } from '@/components/shared/error-boundaries';
import type { Portfolio, Experience, Education, Project, Skill, Certification } from '@/types/portfolio';

// Union type for portfolio section items
type PortfolioSectionItem = Experience | Education | Project | Skill | Certification;

interface SectionEditorProps {
  portfolio: Portfolio;
  section:
    | 'experience'
    | 'education'
    | 'projects'
    | 'skills'
    | 'certifications';
  onChange: (updates: Partial<Portfolio>) => void;
}

export const SectionEditor = React.memo(function SectionEditor({
  portfolio,
  section,
  onChange,
}: SectionEditorProps) {
  const { t } = useLanguage();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const getSectionIcon = () => {
    switch (section) {
      case 'experience':
        return <Briefcase className="h-5 w-5" />;
      case 'education':
        return <GraduationCap className="h-5 w-5" />;
      case 'projects':
        return <Code className="h-5 w-5" />;
      case 'skills':
        return <Award className="h-5 w-5" />;
      case 'certifications':
        return <Award className="h-5 w-5" />;
    }
  };

  const getSectionTitle = () => {
    switch (section) {
      case 'experience':
        return t.experience;
      case 'education':
        return t.education;
      case 'projects':
        return t.projects;
      case 'skills':
        return t.skills;
      case 'certifications':
        return t.certifications;
    }
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const items = [...(portfolio[section] || [])];
    const [movedItem] = items.splice(fromIndex, 1);
    if (movedItem) {
      items.splice(toIndex, 0, movedItem);
      onChange({ [section]: items });
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setIsAdding(false);
  };

  const handleSave = (item: PortfolioSectionItem, index?: number) => {
    const items = [...(portfolio[section] || [])];

    if (index !== undefined) {
      items[index] = item;
    } else {
      items.push(item);
    }

    onChange({ [section]: items });
    setEditingIndex(null);
    setIsAdding(false);
  };

  const handleDelete = (index: number) => {
    const items = [...(portfolio[section] || [])];
    items.splice(index, 1);
    onChange({ [section]: items });
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setIsAdding(false);
  };

  return (
    <WidgetErrorBoundary 
      widgetName={`SectionEditor-${section}`}
      compact={false}
      isolate={true}
    >
      <div className="space-y-4">
        {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getSectionIcon()}
          <h3 className="text-lg font-semibold">{getSectionTitle()}</h3>
          <span className="text-sm text-gray-500">
            ({portfolio[section]?.length || 0})
          </span>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          {t.add}
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {portfolio[section]?.map((item, index) => (
          <DraggableItem
            key={`${section}-${index}`}
            item={{
              id: `${section}-${index}`,
              type: section.slice(0, -1) as 'section' | 'project' | 'experience' | 'education' | 'skill',
              index,
              data: item as any, // TODO: Define proper types for portfolio items
            }}
            onReorder={handleReorder}
            disabled={editingIndex === index}
          >
            {editingIndex === index ? (
              <EditForm
                section={section}
                item={item}
                onSave={updated => handleSave(updated, index)}
                onCancel={handleCancel}
              />
            ) : (
              <ItemCard
                section={section}
                item={item}
                onEdit={() => handleEdit(index)}
                onDelete={() => handleDelete(index)}
              />
            )}
          </DraggableItem>
        ))}

        {/* Add New Form */}
        {isAdding && (
          <EditForm
            section={section}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
      </div>
    </WidgetErrorBoundary>
  );
});

// Item Card Component

function ItemCard({
  section,
  item,
  onEdit,
  onDelete,
}: {
  section: string;
  item: PortfolioSectionItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t } = useLanguage();

  const renderContent = () => {
    switch (section) {
      case 'experience':
        const expItem = item as Experience;
        return (
          <>
            <div>
              <h4 className="font-semibold">{expItem.position}</h4>
              <p className="text-sm text-gray-600">{expItem.company}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {expItem.startDate} - {expItem.endDate || t.present}
              </span>
              {expItem.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {expItem.location}
                </span>
              )}
            </div>
            {expItem.description && (
              <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                {expItem.description}
              </p>
            )}
          </>
        );

      case 'education':
        const eduItem = item as Education;
        return (
          <>
            <div>
              <h4 className="font-semibold">{eduItem.degree}</h4>
              <p className="text-sm text-gray-600">{eduItem.institution}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {eduItem.startDate} - {eduItem.endDate || t.present}
              </span>
              {eduItem.gpa && (
                <span>
                  {t.gpaLabel || 'GPA'}: {eduItem.gpa}
                </span>
              )}
            </div>
          </>
        );

      case 'projects':
        const projItem = item as Project;
        return (
          <>
            <div>
              <h4 className="font-semibold">{projItem.title}</h4>
              {projItem.description && (
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                  {projItem.description}
                </p>
              )}
            </div>
            {projItem.technologies && projItem.technologies.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {projItem.technologies.slice(0, 5).map((tech: string) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {tech}
                  </span>
                ))}
                {projItem.technologies.length > 5 && (
                  <span className="text-xs text-gray-500">
                    +{projItem.technologies.length - 5}
                  </span>
                )}
              </div>
            )}
          </>
        );

      case 'skills':
        const skillItem = item as Skill;
        return (
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{skillItem.name}</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 capitalize">
                {skillItem.level}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(level => (
                  <div
                    key={level}
                    className={cn(
                      'h-2 w-2 rounded-full',
                      level <= getSkillLevel(item.level)
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'certifications':
        const certItem = item as Certification;
        return (
          <>
            <div>
              <h4 className="font-semibold">{certItem.name}</h4>
              <p className="text-sm text-gray-600">{certItem.issuer}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {certItem.issueDate}
              </span>
              {certItem.expiryDate && (
                <span>
                  {t.expires || 'Expires'}: {certItem.expiryDate}
                </span>
              )}
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-1">{renderContent()}</div>
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Form Component (simplified for brevity)
function EditForm({
  section,
  item,
  onSave,
  onCancel,
}: {
  section: string;
  item?: PortfolioSectionItem;
  onSave: (item: PortfolioSectionItem) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [formData, _setFormData] = useState<PortfolioSectionItem>(item || getEmptyItem(section));

  // Form implementation would go here...
  // This is a simplified version

  return (
    <div className="bg-gray-50 p-4 rounded-lg border-2 border-blue-200">
      <div className="space-y-4">
        {/* Form fields based on section type */}
        <div className="text-center text-gray-500">
          {t.formImplementation || 'Form implementation for'} {section}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4 inline mr-1" />
            {t.cancel}
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Save className="h-4 w-4 inline mr-1" />
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getSkillLevel(level: string): number {
  const levels: Record<string, number> = {
    beginner: 1,
    intermediate: 3,
    advanced: 4,
    expert: 5,
  };
  return levels[level] || 3;
}

function getEmptyItem(section: string): PortfolioSectionItem {
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  switch (section) {
    case 'experience':
      return {
        id: generateId(),
        position: '',
        company: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      } as Experience;
    case 'education':
      return {
        id: generateId(),
        degree: '',
        field: '',
        institution: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      } as Education;
    case 'projects':
      return {
        id: generateId(),
        title: '',
        description: '',
        technologies: [],
      } as Project;
    case 'skills':
      return { 
        name: '', 
        level: 'intermediate' as const, 
        category: '' 
      } as Skill;
    case 'certifications':
      return { 
        id: generateId(),
        name: '', 
        issuer: '', 
        issueDate: '' 
      } as Certification;
    default:
      return {} as PortfolioSectionItem;
  }
}

// Default export for Next.js compatibility
export default SectionEditor;

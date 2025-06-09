'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Portfolio, Skill } from '@/types/portfolio';
import { useLanguage } from '@/lib/i18n/minimal-context';
import { PortfolioPreview } from './PortfolioPreview';
import { FiSave, FiEye, FiEyeOff, FiPlus, FiTrash2 } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

interface PortfolioEditorProps {
  portfolio: Portfolio;
  onSave: (portfolio: Portfolio) => void;
  onPublish: () => void;
  autoSave?: boolean;
}

export function PortfolioEditor({
  portfolio,
  onSave,
  onPublish,
  autoSave = false,
}: PortfolioEditorProps) {
  const { t } = useLanguage();
  const [editedPortfolio, setEditedPortfolio] = useState<Portfolio>(portfolio);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('basic');

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [editedPortfolio, autoSave, handleSave]);

  // Validation
  const validatePortfolio = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!editedPortfolio.name) {
      newErrors.name = 'Name is required';
    }

    if (!editedPortfolio.title) {
      newErrors.title = 'Title is required';
    }

    // Validate URLs
    const urlFields = ['linkedin', 'github', 'twitter'] as const;
    urlFields.forEach(field => {
      const url = editedPortfolio.social[field];
      if (url && !isValidUrl(url)) {
        newErrors[`social.${field}`] = 'Please enter a valid URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [editedPortfolio]);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Save functionality
  const handleSave = useCallback(async () => {
    if (!validatePortfolio()) return;

    setIsSaving(true);
    try {
      await onSave(editedPortfolio);
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      setIsSaving(false);
      console.error('Failed to save portfolio:', error);
    }
  }, [editedPortfolio, onSave, validatePortfolio]);

  // Update functions
  const updateBasicInfo = (field: keyof Portfolio, value: any) => {
    setEditedPortfolio(prev => ({ ...prev, [field]: value }));
  };

  const updateSocial = (field: keyof Portfolio['social'], value: string) => {
    setEditedPortfolio(prev => ({
      ...prev,
      social: { ...prev.social, [field]: value },
    }));
  };

  // Experience management
  const deleteExperience = (id: string) => {
    setEditedPortfolio(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id),
    }));
  };

  // Project management

  const toggleProjectFeatured = (id: string) => {
    setEditedPortfolio(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, featured: !proj.featured } : proj
      ),
    }));
  };

  // Skills management
  const addSkill = (skillName: string) => {
    const newSkill: Skill = {
      name: skillName,
      level: 'intermediate',
      category: 'General',
    };
    setEditedPortfolio(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }));
  };

  const removeSkill = (skillName: string) => {
    setEditedPortfolio(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.name !== skillName),
    }));
  };

  // Template customization
  const updateTemplate = (template: Portfolio['template']) => {
    setEditedPortfolio(prev => ({ ...prev, template }));
  };

  const updateCustomization = (
    field: keyof Portfolio['customization'],
    value: any
  ) => {
    setEditedPortfolio(prev => ({
      ...prev,
      customization: { ...prev.customization, [field]: value },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t.portfolioEditor}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPreview(!showPreview)}
              aria-label="Toggle preview"
              className="p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              {showPreview ? <FiEyeOff /> : <FiEye />}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <FiSave className="inline mr-2" />
              {isSaving ? t.saving : t.save}
            </button>
            <button
              onClick={onPublish}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              {editedPortfolio.status === 'published' ? t.unpublish : t.publish}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Editor Panel */}
          <div className="space-y-6">
            {/* Section Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex -mb-px">
                  {[
                    'basic',
                    'experience',
                    'projects',
                    'skills',
                    'customize',
                  ].map(section => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`px-4 py-2 text-sm font-medium ${
                        activeSection === section
                          ? 'border-b-2 border-blue-500 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {t[section as keyof typeof t] || section}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Basic Information Section */}
                {activeSection === 'basic' && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">{t.basicInfo}</h2>

                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1"
                      >
                        {t.name}
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={editedPortfolio.name}
                        onChange={e => updateBasicInfo('name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium mb-1"
                      >
                        {t.title}
                      </label>
                      <input
                        id="title"
                        type="text"
                        value={editedPortfolio.title}
                        onChange={e => updateBasicInfo('title', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="bio"
                        className="block text-sm font-medium mb-1"
                      >
                        {t.bio}
                        <button
                          aria-label="Enhance bio with AI"
                          className="ml-2 text-blue-600 hover:text-blue-700"
                          onClick={() => console.log('Enhance bio')}
                        >
                          <HiSparkles className="inline" />
                        </button>
                      </label>
                      <textarea
                        id="bio"
                        value={editedPortfolio.bio}
                        onChange={e => updateBasicInfo('bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {editedPortfolio.bio.length} / 500
                      </p>
                    </div>

                    {/* Social Links */}
                    <div>
                      <h3 className="text-md font-medium mb-2">Social Links</h3>
                      <div className="space-y-2">
                        <div>
                          <label htmlFor="linkedin" className="block text-sm">
                            LinkedIn URL
                          </label>
                          <input
                            id="linkedin"
                            type="url"
                            value={editedPortfolio.social.linkedin || ''}
                            onChange={e =>
                              updateSocial('linkedin', e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                          />
                          {errors['social.linkedin'] && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors['social.linkedin']}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Experience Section */}
                {activeSection === 'experience' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{t.experience}</h2>
                      <button
                        onClick={() => console.log('Add experience')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <FiPlus className="inline mr-1" />
                        {t.addExperience}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editedPortfolio.experience.map(exp => (
                        <div
                          key={exp.id}
                          className="p-4 border rounded-lg dark:border-gray-700"
                          data-testid="experience-item"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{exp.company}</h3>
                              <p className="text-sm text-gray-600">
                                {exp.position}
                              </p>
                              <p className="text-sm text-gray-500">
                                {exp.startDate} -{' '}
                                {exp.current ? 'Present' : exp.endDate}
                              </p>
                            </div>
                            <button
                              aria-label="Delete experience item"
                              onClick={() => deleteExperience(exp.id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {activeSection === 'projects' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{t.projects}</h2>
                      <button
                        onClick={() => console.log('Add project')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <FiPlus className="inline mr-1" />
                        {t.addProject}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {editedPortfolio.projects.map(project => (
                        <div
                          key={project.id}
                          data-testid="project-item"
                          draggable
                          className="p-4 border rounded-lg dark:border-gray-700 cursor-move"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{project.title}</h3>
                              <p className="text-sm text-gray-600">
                                {project.description}
                              </p>
                              <div className="mt-2">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={project.featured}
                                    onChange={() =>
                                      toggleProjectFeatured(project.id)
                                    }
                                    aria-label="Mark as featured"
                                    className="mr-2"
                                  />
                                  <span className="text-sm">Featured</span>
                                </label>
                              </div>
                            </div>
                            <button
                              aria-label="Get AI suggestions for project"
                              className="text-blue-600 hover:text-blue-700 ml-2"
                            >
                              <HiSparkles />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Section */}
                {activeSection === 'skills' && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">{t.skills}</h2>

                    <div>
                      <input
                        type="text"
                        placeholder="Add a skill"
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            addSkill((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      />
                    </div>

                    {/* Group skills by category */}
                    {Object.entries(
                      editedPortfolio.skills.reduce(
                        (acc, skill) => {
                          const category = skill.category || 'General';
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(skill);
                          return acc;
                        },
                        {} as Record<string, Skill[]>
                      )
                    ).map(([category, skills]) => (
                      <div key={category}>
                        <h3 className="text-md font-medium mb-2">{category}</h3>
                        <div className="flex flex-wrap gap-2">
                          {skills.map(skill => (
                            <div
                              key={skill.name}
                              data-testid={`skill-${skill.name}`}
                              data-level={skill.level}
                              className="flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                            >
                              <span className="text-sm">{skill.name}</span>
                              <button
                                aria-label={`Remove ${skill.name}`}
                                onClick={() => removeSkill(skill.name)}
                                className="ml-2 text-gray-500 hover:text-red-500"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customize Section */}
                {activeSection === 'customize' && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">{t.customize}</h2>

                    <div>
                      <label
                        htmlFor="template"
                        className="block text-sm font-medium mb-1"
                      >
                        {t.template}
                      </label>
                      <select
                        id="template"
                        value={editedPortfolio.template}
                        onChange={e =>
                          updateTemplate(
                            e.target.value as Portfolio['template']
                          )
                        }
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="consultant">Consultant</option>
                        <option value="educator">Educator</option>
                        <option value="creative">Creative</option>
                        <option value="business">Business</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="primaryColor"
                        className="block text-sm font-medium mb-1"
                      >
                        Primary Color
                      </label>
                      <input
                        id="primaryColor"
                        type="color"
                        value={
                          editedPortfolio.customization.primaryColor ||
                          '#1a73e8'
                        }
                        onChange={e =>
                          updateCustomization('primaryColor', e.target.value)
                        }
                        className="w-full h-10 border rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          {showPreview && (
            <div
              data-testid="preview-pane"
              className={showPreview ? '' : 'hidden'}
            >
              <div className="sticky top-8">
                <h2 className="text-lg font-semibold mb-4">{t.preview}</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                  <PortfolioPreview portfolio={editedPortfolio} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publish Confirmation Dialog */}
      {/* This would be implemented as a modal component */}
    </div>
  );
}

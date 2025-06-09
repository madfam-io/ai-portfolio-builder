/**
 * @fileoverview Portfolio Editor Component - Complete portfolio editing interface
 *
 * This component provides a comprehensive editor for creating and customizing portfolios
 * with real-time preview, AI enhancement features, and template selection.
 *
 * Key Features:
 * - Real-time portfolio editing with live preview
 * - Professional template selection (Developer, Designer, Consultant)
 * - AI-powered content enhancement for bio and projects
 * - Model selection for different AI tasks
 * - Auto-save functionality with validation
 * - Drag-and-drop project reordering
 * - Multi-language support
 *
 * @author PRISMA Development Team
 * @version 0.0.1-alpha - Enhanced with professional templates
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Portfolio, Skill } from '@/types/portfolio';
import { useLanguage } from '@/lib/i18n/minimal-context';
import { PortfolioPreview } from './PortfolioPreview';
import {
  AIEnhancementButton,
  ModelSelectionModal,
} from './AIEnhancementButton';
import { DeveloperTemplate } from '@/components/templates/DeveloperTemplate';
import { DesignerTemplate } from '@/components/templates/DesignerTemplate';
import { ConsultantTemplate } from '@/components/templates/ConsultantTemplate';
import {
  FiSave,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiTrash2,
  FiSettings,
  FiCode,
  FiPalette,
  FiBriefcase,
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

/**
 * Props interface for the PortfolioEditor component
 */
interface PortfolioEditorProps {
  /** The portfolio data to edit */
  portfolio: Portfolio;
  /** Callback function to handle saving portfolio changes */
  onSave: (portfolio: Portfolio) => void;
  /** Callback function to handle publishing/unpublishing portfolio */
  onPublish: () => void;
  /** Whether to automatically save changes after a delay */
  autoSave?: boolean;
}

/**
 * Portfolio Editor Component
 *
 * Main editor component that provides a complete interface for portfolio creation and editing.
 * Features tabbed interface, real-time preview, AI enhancement, and professional templates.
 */
export function PortfolioEditor({
  portfolio,
  onSave,
  onPublish,
  autoSave = false,
}: PortfolioEditorProps) {
  // Internationalization hook for multi-language support
  const { t } = useLanguage();

  // State management for editor functionality
  const [editedPortfolio, setEditedPortfolio] = useState<Portfolio>(portfolio);
  const [showPreview, setShowPreview] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeSection, setActiveSection] = useState('basic');

  // AI Enhancement Modal State
  const [showModelSelection, setShowModelSelection] = useState(false);
  const [modelSelectionType, setModelSelectionType] = useState<
    'bio' | 'project' | 'template' | 'scoring'
  >('bio');

  // Current AI model selections for different enhancement types
  const [currentModels, setCurrentModels] = useState({
    bio: 'meta-llama/Meta-Llama-3.1-8B-Instruct', // Bio enhancement model
    project: 'microsoft/Phi-3.5-mini-instruct', // Project description enhancement
    template: 'meta-llama/Meta-Llama-3.1-8B-Instruct', // Template recommendation
    scoring: 'microsoft/DialoGPT-medium', // Content quality scoring
  });

  /**
   * Portfolio validation function
   * Validates required fields and URL formats before saving
   *
   * @returns {boolean} True if portfolio is valid, false otherwise
   */
  const validatePortfolio = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required basic information
    if (!editedPortfolio.name) {
      newErrors.name = 'Name is required';
    }

    if (!editedPortfolio.title) {
      newErrors.title = 'Title is required';
    }

    // Validate social media URLs format
    const urlFields = [
      'linkedin',
      'github',
      'twitter',
      'instagram',
      'dribbble',
      'behance',
    ] as const;
    urlFields.forEach(field => {
      const url = editedPortfolio.social[field];
      if (url && !isValidUrl(url)) {
        newErrors[`social.${field}`] = 'Please enter a valid URL';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [editedPortfolio]);

  /**
   * URL validation helper
   *
   * @param {string} url - URL string to validate
   * @returns {boolean} True if URL is valid, false otherwise
   */
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Save portfolio with validation
   * Validates portfolio data before calling the onSave callback
   */
  const handleSave = useCallback(async () => {
    if (!validatePortfolio()) return;

    setIsSaving(true);
    try {
      await onSave(editedPortfolio);
      // Show saved state for user feedback
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      setIsSaving(false);
      console.error('Failed to save portfolio:', error);
      // TODO: Add user-facing error notification
    }
  }, [editedPortfolio, onSave, validatePortfolio]);

  /**
   * Auto-save effect
   * Automatically saves changes after 3 seconds of inactivity when autoSave is enabled
   */
  useEffect(() => {
    if (!autoSave) return;

    const timeoutId = setTimeout(() => {
      handleSave();
    }, 3000); // 3 second delay for auto-save

    return () => clearTimeout(timeoutId);
  }, [editedPortfolio, autoSave, handleSave]);

  /**
   * Update basic portfolio information
   *
   * @param {keyof Portfolio} field - The field to update
   * @param {any} value - The new value for the field
   */
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

  // AI Enhancement handlers
  const handleBioEnhanced = (enhancedBio: string, suggestions?: string[]) => {
    updateBasicInfo('bio', enhancedBio);
    if (suggestions && suggestions.length > 0) {
      // You could show suggestions in a toast or modal
      console.log('AI Suggestions:', suggestions);
    }
  };

  const handleProjectEnhanced = (
    projectId: string,
    enhancedDescription: string,
    highlights?: string[]
  ) => {
    setEditedPortfolio(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === projectId
          ? {
              ...proj,
              description: enhancedDescription,
              highlights: highlights || proj.highlights,
            }
          : proj
      ),
    }));
  };

  const openModelSelection = (
    type: 'bio' | 'project' | 'template' | 'scoring'
  ) => {
    setModelSelectionType(type);
    setShowModelSelection(true);
  };

  const handleModelChange = (modelId: string) => {
    setCurrentModels(prev => ({
      ...prev,
      [modelSelectionType]: modelId,
    }));
  };

  // Prepare bio context for AI enhancement
  const getBioContext = () => ({
    title: editedPortfolio.title,
    skills: editedPortfolio.skills.map(s => s.name),
    experience: editedPortfolio.experience.map(exp => ({
      company: exp.company,
      position: exp.position,
      yearsExperience: calculateYearsExperience(
        exp.startDate,
        exp.endDate,
        exp.current
      ),
    })),
    industry: editedPortfolio.experience[0]?.company,
    tone: 'professional' as const,
    targetLength: 'concise' as const,
  });

  const calculateYearsExperience = (
    startDate: string,
    endDate: string | null,
    current: boolean
  ): number => {
    const start = new Date(startDate);
    const end = current ? new Date() : new Date(endDate || new Date());
    return Math.max(
      0,
      Math.floor(
        (end.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      )
    );
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
                      <div className="flex items-center justify-between mb-2">
                        <label
                          htmlFor="bio"
                          className="block text-sm font-medium"
                        >
                          {t.bio}
                        </label>
                        <div className="flex items-center gap-2">
                          <AIEnhancementButton
                            type="bio"
                            content={editedPortfolio.bio}
                            context={getBioContext()}
                            onEnhanced={handleBioEnhanced}
                            className="text-xs"
                          />
                          <button
                            onClick={() => openModelSelection('bio')}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            title="Select AI model"
                          >
                            <FiSettings className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
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
                            <AIEnhancementButton
                              type="project"
                              content={project.description}
                              context={{
                                title: project.title,
                                description: project.description,
                                technologies: project.technologies || [],
                              }}
                              onEnhanced={(enhanced, highlights) =>
                                handleProjectEnhanced(
                                  project.id,
                                  enhanced,
                                  highlights
                                )
                              }
                              className="text-xs ml-2"
                            />
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
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold">{t.customize}</h2>

                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        {t.template}
                      </label>
                      <div className="grid grid-cols-1 gap-4">
                        {/* Developer Template */}
                        <div
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            editedPortfolio.template === 'developer'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => updateTemplate('developer')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                              <FiCode className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                Developer Template
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t.developerTemplateDesc}
                              </p>
                            </div>
                          </div>
                          {editedPortfolio.template === 'developer' && (
                            <div className="absolute top-2 right-2">
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Designer Template */}
                        <div
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            editedPortfolio.template === 'designer'
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => updateTemplate('designer')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                              <FiPalette className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                Designer Template
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t.designerTemplateDesc}
                              </p>
                            </div>
                          </div>
                          {editedPortfolio.template === 'designer' && (
                            <div className="absolute top-2 right-2">
                              <div className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Consultant Template */}
                        <div
                          className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            editedPortfolio.template === 'consultant'
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => updateTemplate('consultant')}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                              <FiBriefcase className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                Consultant Template
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t.consultantTemplateDesc}
                              </p>
                            </div>
                          </div>
                          {editedPortfolio.template === 'consultant' && (
                            <div className="absolute top-2 right-2">
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
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

          {/* Real-time Preview Panel */}
          {showPreview && (
            <div
              data-testid="preview-pane"
              className={showPreview ? '' : 'hidden'}
            >
              <div className="sticky top-8">
                <h2 className="text-lg font-semibold mb-4">{t.preview}</h2>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden max-h-[80vh] overflow-y-auto">
                  {/* 
                    Template-specific preview rendering
                    Each template has its own optimized layout and styling
                  */}
                  {editedPortfolio.template === 'developer' && (
                    <DeveloperTemplate portfolio={editedPortfolio} />
                  )}
                  {editedPortfolio.template === 'designer' && (
                    <DesignerTemplate portfolio={editedPortfolio} />
                  )}
                  {editedPortfolio.template === 'consultant' && (
                    <ConsultantTemplate portfolio={editedPortfolio} />
                  )}
                  {/* Fallback to basic preview for legacy or custom templates */}
                  {!['developer', 'designer', 'consultant'].includes(
                    editedPortfolio.template || ''
                  ) && <PortfolioPreview portfolio={editedPortfolio} />}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Model Selection Modal */}
      <ModelSelectionModal
        isOpen={showModelSelection}
        onClose={() => setShowModelSelection(false)}
        taskType={modelSelectionType}
        currentModel={currentModels[modelSelectionType]}
        onModelChange={handleModelChange}
      />

      {/* Publish Confirmation Dialog */}
      {/* This would be implemented as a modal component */}
    </div>
  );
}

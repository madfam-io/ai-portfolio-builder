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

import { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Experience, EmploymentType } from '@/types/portfolio';
import { usePortfolioStore } from '@/lib/store/portfolio-store';

interface ExperienceSectionProps {
  experiences: Experience[];
  onUpdate: (experiences: Experience[]) => void;
}

interface ExperienceFormData {
  company: string;
  companyLogo?: string;
  position: string;
  location?: string;
  employmentType?: EmploymentType;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  highlights?: string[];
  technologies?: string[];
}

// eslint-disable-next-line complexity
export function ExperienceSection({
  experiences = [],
  onUpdate,
}: ExperienceSectionProps) {
  const { t } = useLanguage();
  const { currentPortfolio } = usePortfolioStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>({
    company: '',
    companyLogo: '',
    position: '',
    location: '',
    employmentType: 'full-time',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    highlights: [],
    technologies: [],
  });

  const employmentTypes: Array<{ value: EmploymentType; label: string }> = [
    { value: 'full-time', label: t.fullTime || 'Full-time' },
    { value: 'part-time', label: t.partTime || 'Part-time' },
    { value: 'contract', label: t.contract || 'Contract' },
    { value: 'freelance', label: t.freelance || 'Freelance' },
    { value: 'internship', label: t.internship || 'Internship' },
  ];

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      location: '',
      employmentType: 'full-time',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      highlights: [],
      technologies: [],
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (experience: Experience) => {
    setEditingId(experience.id);
    setIsAdding(false);
    setFormData({
      company: experience.company,
      position: experience.position,
      location: experience.location || '',
      employmentType: experience.employmentType || 'full-time',
      startDate: experience.startDate,
      endDate: experience.endDate || '',
      current: experience.current,
      description: experience.description,
      highlights: experience.highlights || [],
      technologies: experience.technologies || [],
    });
  };

  const handleSave = () => {
    if (!formData.company || !formData.position || !formData.startDate) {
      return;
    }

    const newExperience: Experience = {
      id: editingId || `exp_${Date.now()}`,
      company: formData.company,
      position: formData.position,
      startDate: formData.startDate,
      endDate: formData.current ? undefined : formData.endDate,
      current: formData.current,
      description: formData.description,
      highlights: formData.highlights?.filter(h => h.trim()) || [],
      technologies: formData.technologies?.filter(t => t.trim()) || [],
    };

    // Add additional fields as extended properties
    const extendedExperience = {
      ...newExperience,
      location: formData.location,
      employmentType: formData.employmentType,
    };

    let updatedExperiences: Experience[];
    if (editingId) {
      updatedExperiences = experiences.map(exp =>
        exp.id === editingId ? extendedExperience : exp
      );
    } else {
      updatedExperiences = [...experiences, extendedExperience];
    }

    onUpdate(updatedExperiences);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (
      // eslint-disable-next-line no-alert
      confirm(
        t.confirmDeleteExperience ||
          'Are you sure you want to delete this experience?'
      )
    ) {
      onUpdate(experiences.filter(exp => exp.id !== id));
    }
  };

  const handleHighlightChange = (value: string, index: number) => {
    const newHighlights = [...(formData.highlights || [])];
    newHighlights[index] = value;
    setFormData({ ...formData, highlights: newHighlights });
  };

  const addHighlight = () => {
    setFormData({
      ...formData,
      highlights: [...(formData.highlights || []), ''],
    });
  };

  const removeHighlight = (index: number) => {
    const newHighlights =
      formData.highlights?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, highlights: newHighlights });
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t.workExperience || 'Work Experience'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.workExperienceDescription ||
              'Add your professional work history'}
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t.addExperience || 'Add Experience'}
          </Button>
        )}
      </div>

      {/* Experience Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId
                ? t.editExperience || 'Edit Experience'
                : t.addExperience || 'Add Experience'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="company">{t.company || 'Company'} *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={e =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder={t.companyPlaceholder || 'e.g. Google'}
                />
              </div>
              <div>
                <Label htmlFor="position">{t.position || 'Position'} *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={e =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder={
                    t.positionPlaceholder || 'e.g. Senior Software Engineer'
                  }
                />
              </div>
            </div>

            <div>
              <Label>{t.companyLogo || 'Company Logo'}</Label>
              <ImageUpload
                value={formData.companyLogo}
                onChange={url =>
                  setFormData({ ...formData, companyLogo: url || '' })
                }
                type="company"
                portfolioId={currentPortfolio?.id || ''}
                aspectRatio="square"
                className="mt-2 max-w-[200px]"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="location">{t.location || 'Location'}</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={e =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder={
                    t.locationPlaceholder || 'e.g. San Francisco, CA'
                  }
                />
              </div>
              <div>
                <Label htmlFor="employmentType">
                  {t.employmentType || 'Employment Type'}
                </Label>
                <select
                  id="employmentType"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.employmentType}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      employmentType: e.target.value as EmploymentType,
                    })
                  }
                >
                  {employmentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="startDate">
                  {t.startDate || 'Start Date'} *
                </Label>
                <Input
                  id="startDate"
                  type="month"
                  value={formData.startDate}
                  onChange={e =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="endDate">{t.endDate || 'End Date'}</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="current"
                      checked={formData.current}
                      onCheckedChange={checked =>
                        setFormData({ ...formData, current: checked })
                      }
                    />
                    <Label
                      htmlFor="current"
                      className="text-sm font-normal cursor-pointer"
                    >
                      {t.currentlyWorking || 'Currently working here'}
                    </Label>
                  </div>
                </div>
                <Input
                  id="endDate"
                  type="month"
                  value={formData.endDate}
                  onChange={e =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  disabled={formData.current}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">
                {t.description || 'Description'}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={
                  t.descriptionPlaceholder ||
                  'Describe your role and responsibilities...'
                }
                rows={4}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t.keyHighlights || 'Key Highlights'}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addHighlight}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t.addHighlight || 'Add'}
                </Button>
              </div>
              <div className="space-y-2">
                {formData.highlights?.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={highlight}
                      onChange={e =>
                        handleHighlightChange(e.target.value, index)
                      }
                      placeholder={
                        t.highlightPlaceholder || 'e.g. Led team of 5 engineers'
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHighlight(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="technologies">
                {t.technologies || 'Technologies Used'}
              </Label>
              <Input
                id="technologies"
                value={formData.technologies?.join(', ') || ''}
                onChange={e =>
                  setFormData({
                    ...formData,
                    technologies: e.target.value
                      .split(',')
                      .map(t => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={
                  t.technologiesPlaceholder || 'e.g. React, Node.js, PostgreSQL'
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t.technologiesHint || 'Separate with commas'}
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                {t.cancel || 'Cancel'}
              </Button>
              <Button onClick={handleSave}>
                {editingId
                  ? t.saveChanges || 'Save Changes'
                  : t.addExperience || 'Add Experience'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Experience List */}
      <div className="space-y-4">
        {experiences.map(experience => (
          <Card key={experience.id} className="group relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold">{experience.position}</h4>
                    {experience.current && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {t.current || 'Current'}
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-1">
                    {experience.company}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateForDisplay(experience.startDate)} -{' '}
                    {experience.current
                      ? t.present || 'Present'
                      : formatDateForDisplay(experience.endDate || '')}
                    {experience.location && ` • ${experience.location}`}
                  </p>
                  {experience.description && (
                    <p className="mt-3 text-sm">{experience.description}</p>
                  )}
                  {experience.highlights &&
                    experience.highlights.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {experience.highlights.map((highlight, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  {experience.technologies &&
                    experience.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {experience.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(experience)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(experience.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {experiences.length === 0 && !isAdding && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {t.noExperience || 'No work experience added yet'}
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addFirstExperience || 'Add Your First Experience'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

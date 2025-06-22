/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, GraduationCap, X } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Education } from '@/types/portfolio';

interface EducationSectionProps {
  education: Education[];
  onUpdate: (education: Education[]) => void;
}

interface EducationFormData {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
}

// eslint-disable-next-line complexity
export function EducationSection({
  education = [],
  onUpdate,
}: EducationSectionProps) {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eduToDelete, setEduToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<EducationFormData>({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: [],
  });

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: [],
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (edu: Education) => {
    setEditingId(edu.id);
    setIsAdding(false);
    setFormData({
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: edu.startDate,
      endDate: edu.endDate || '',
      current: edu.current || false,
      description: edu.description || '',
      achievements: edu.achievements || [],
    });
  };

  const handleSave = () => {
    if (
      !formData.institution ||
      !formData.degree ||
      !formData.field ||
      !formData.startDate
    ) {
      return;
    }

    const newEducation: Education = {
      id: editingId || `edu_${Date.now()}`,
      institution: formData.institution,
      degree: formData.degree,
      field: formData.field,
      startDate: formData.startDate,
      endDate: formData.current ? undefined : formData.endDate,
      current: formData.current,
      description: formData.description,
      achievements: formData.achievements?.filter(a => a.trim()) || [],
    };

    let updatedEducation: Education[];
    if (editingId) {
      updatedEducation = education.map(edu =>
        edu.id === editingId ? newEducation : edu
      );
    } else {
      updatedEducation = [...education, newEducation];
    }

    onUpdate(updatedEducation);
    resetForm();
  };

  const handleDelete = (id: string) => {
    setEduToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (eduToDelete) {
      onUpdate(education.filter(edu => edu.id !== eduToDelete));
      setDeleteDialogOpen(false);
      setEduToDelete(null);
    }
  };

  const handleAchievementChange = (value: string, index: number) => {
    const newAchievements = [...(formData.achievements || [])];
    newAchievements[index] = value;
    setFormData({ ...formData, achievements: newAchievements });
  };

  const addAchievement = () => {
    setFormData({
      ...formData,
      achievements: [...(formData.achievements || []), ''],
    });
  };

  const removeAchievement = (index: number) => {
    const newAchievements =
      formData.achievements?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, achievements: newAchievements });
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const degreeExamples = [
    t.bachelorOfScience || 'Bachelor of Science',
    t.masterOfScience || 'Master of Science',
    t.bachelorOfArts || 'Bachelor of Arts',
    t.masterOfBusinessAdministration || 'MBA',
    t.doctorOfPhilosophy || 'Ph.D.',
    t.associateDegree || 'Associate Degree',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t.education || 'Education'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.educationDescription ||
              'Add your academic background and achievements'}
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t.addEducation || 'Add Education'}
          </Button>
        )}
      </div>

      {/* Education Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId
                ? t.editEducation || 'Edit Education'
                : t.addEducation || 'Add Education'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="institution">
                {t.institution || 'Institution'} *
              </Label>
              <Input
                id="institution"
                value={formData.institution}
                onChange={e =>
                  setFormData({ ...formData, institution: e.target.value })
                }
                placeholder={
                  t.institutionPlaceholder || 'e.g. Stanford University'
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="degree">{t.degree || 'Degree'} *</Label>
                <Input
                  id="degree"
                  value={formData.degree}
                  onChange={e =>
                    setFormData({ ...formData, degree: e.target.value })
                  }
                  placeholder={
                    t.degreePlaceholder || 'e.g. Bachelor of Science'
                  }
                  list="degree-suggestions"
                />
                <datalist id="degree-suggestions">
                  {degreeExamples.map((degree, index) => (
                    <option key={index} value={degree} />
                  ))}
                </datalist>
              </div>
              <div>
                <Label htmlFor="field">
                  {t.fieldOfStudy || 'Field of Study'} *
                </Label>
                <Input
                  id="field"
                  value={formData.field}
                  onChange={e =>
                    setFormData({ ...formData, field: e.target.value })
                  }
                  placeholder={t.fieldPlaceholder || 'e.g. Computer Science'}
                />
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
                      {t.currentlyStudying || 'Currently studying'}
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
                  t.educationDescriptionPlaceholder ||
                  'Describe your studies, focus areas, thesis topic, etc.'
                }
                rows={3}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>{t.achievements || 'Achievements & Activities'}</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addAchievement}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t.addAchievement || 'Add'}
                </Button>
              </div>
              <div className="space-y-2">
                {formData.achievements?.map((achievement, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={achievement}
                      onChange={e =>
                        handleAchievementChange(e.target.value, index)
                      }
                      placeholder={
                        t.achievementPlaceholder ||
                        "e.g. Dean's List, GPA 3.9/4.0, Student Council President"
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAchievement(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                {t.cancel || 'Cancel'}
              </Button>
              <Button onClick={handleSave}>
                {editingId
                  ? t.saveChanges || 'Save Changes'
                  : t.addEducation || 'Add Education'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education List */}
      <div className="space-y-4">
        {education.map(edu => (
          <Card key={edu.id} className="group relative">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">
                        {edu.degree} in {edu.field}
                      </h4>
                      <p className="text-muted-foreground">{edu.institution}</p>
                    </div>
                    {edu.current && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {t.currentStudent || 'Current'}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground ml-8">
                    {formatDateForDisplay(edu.startDate)} -{' '}
                    {edu.current
                      ? t.present || 'Present'
                      : formatDateForDisplay(edu.endDate || '')}
                  </p>
                  {edu.description && (
                    <p className="mt-3 text-sm ml-8">{edu.description}</p>
                  )}
                  {edu.achievements && edu.achievements.length > 0 && (
                    <ul className="mt-3 space-y-1 ml-8">
                      {edu.achievements.map((achievement, i) => (
                        <li key={i} className="text-sm flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(edu)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(edu.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {education.length === 0 && !isAdding && (
        <Card>
          <CardContent className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {t.noEducation || 'No education added yet'}
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addFirstEducation || 'Add Your Education'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Education</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmDeleteEducation ||
                'Are you sure you want to delete this education?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

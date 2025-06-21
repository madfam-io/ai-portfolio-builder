'use client';

import { useState } from 'react';
import { Plus, Edit2, X, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Skill } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface SkillsSectionProps {
  skills: Skill[];
  onUpdate: (skills: Skill[]) => void;
}

interface SkillFormData {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

const DEFAULT_CATEGORIES = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Tools & Platforms',
  'Design',
  'Soft Skills',
  'Languages',
];

const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-gray-100 text-gray-800' },
  {
    value: 'intermediate',
    label: 'Intermediate',
    color: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    color: 'bg-green-100 text-green-800',
  },
  { value: 'expert', label: 'Expert', color: 'bg-purple-100 text-purple-800' },
];

// eslint-disable-next-line complexity
export function SkillsSection({ skills = [], onUpdate }: SkillsSectionProps) {
  const { t } = useLanguage();
  const [isAdding, setIsAdding] = useState(false);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [formData, setFormData] = useState<SkillFormData>({
    name: '',
    level: 'intermediate',
    category: '',
  });

  // Get unique categories from existing skills plus defaults
  const categories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...(skills.map(s => s.category).filter(Boolean) as string[]),
    ])
  ).sort();

  const resetForm = () => {
    setFormData({
      name: '',
      level: 'intermediate',
      category: selectedCategory || '',
    });
    setIsAdding(false);
    setEditingSkill(null);
  };

  const handleAdd = (category?: string) => {
    setSelectedCategory(category || '');
    setFormData({
      name: '',
      level: 'intermediate',
      category: category || '',
    });
    setIsAdding(true);
    setEditingSkill(null);
  };

  const handleEdit = (skill: Skill) => {
    setEditingSkill(skill.name);
    setFormData({
      name: skill.name,
      level: skill.level || 'intermediate',
      category: skill.category || '',
    });
    setIsAdding(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) return;

    const newSkill: Skill = {
      name: formData.name.trim(),
      level: formData.level,
      category: formData.category || 'Other',
    };

    let updatedSkills: Skill[];
    if (editingSkill) {
      updatedSkills = skills.map(skill =>
        skill.name === editingSkill ? newSkill : skill
      );
    } else {
      // Check if skill already exists
      if (
        skills.some(s => s.name.toLowerCase() === newSkill.name.toLowerCase())
      ) {
        return;
      }
      updatedSkills = [...skills, newSkill];
    }

    onUpdate(updatedSkills);
    resetForm();
  };

  const handleDelete = (skillName: string) => {
    onUpdate(skills.filter(skill => skill.name !== skillName));
  };

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.name.trim()) {
      handleSave();
    }
  };

  const handleBulkAdd = () => {
    // eslint-disable-next-line no-alert
    const skillsText = prompt(
      t.bulkAddPrompt ||
        'Enter skills separated by commas (e.g., React, Node.js, TypeScript):'
    );

    if (!skillsText) return;

    const newSkills = skillsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .filter(
        name => !skills.some(s => s.name.toLowerCase() === name.toLowerCase())
      )
      .map(name => ({
        name,
        level: 'intermediate' as const,
        category: selectedCategory || 'Other',
      }));

    if (newSkills.length > 0) {
      onUpdate([...skills, ...newSkills]);
    }
  };

  const groupedSkills = skills.reduce(
    (acc, skill) => {
      const category = skill.category || 'Other';
      if (!acc[category]) acc[category] = [];
      acc[category].push(skill);
      return acc;
    },
    {} as Record<string, Skill[]>
  );

  const getLevelInfo = (level?: string) => {
    return SKILL_LEVELS.find(l => l.value === level) || SKILL_LEVELS[1];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t.skills || 'Skills'}</h3>
          <p className="text-sm text-muted-foreground">
            {t.skillsDescription ||
              'List your professional skills and expertise'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleBulkAdd} size="sm" variant="outline">
            <Sparkles className="h-4 w-4 mr-2" />
            {t.bulkAdd || 'Bulk Add'}
          </Button>
          {!isAdding && (
            <Button onClick={() => handleAdd()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t.addSkill || 'Add Skill'}
            </Button>
          )}
        </div>
      </div>

      {/* Quick Add Form */}
      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingSkill
                ? t.editSkill || 'Edit Skill'
                : t.addSkill || 'Add Skill'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="skillName">
                  {t.skillName || 'Skill Name'} *
                </Label>
                <Input
                  id="skillName"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  onKeyDown={handleQuickAdd}
                  placeholder={t.skillPlaceholder || 'e.g. JavaScript'}
                  autoFocus
                />
              </div>
              <div>
                <Label htmlFor="category">{t.category || 'Category'}</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.category}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <option value="">
                    {t.selectCategory || 'Select category'}
                  </option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="new">
                    {t.newCategory || '+ New category'}
                  </option>
                </select>
              </div>
              <div>
                <Label htmlFor="level">
                  {t.proficiencyLevel || 'Proficiency Level'}
                </Label>
                <select
                  id="level"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.level}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      level: e.target.value as
                        | 'beginner'
                        | 'intermediate'
                        | 'advanced'
                        | 'expert',
                    })
                  }
                >
                  {SKILL_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formData.category === 'new' && (
              <div>
                <Label htmlFor="newCategory">
                  {t.newCategoryName || 'New Category Name'}
                </Label>
                <Input
                  id="newCategory"
                  placeholder={t.enterCategoryName || 'Enter category name'}
                  onChange={e =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                {t.cancel || 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={!formData.name.trim()}>
                {editingSkill
                  ? t.saveChanges || 'Save Changes'
                  : t.addSkill || 'Add Skill'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skills by Category */}
      <div className="space-y-6">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{category}</CardTitle>
                <span className="text-sm text-muted-foreground">
                  {categorySkills.length}{' '}
                  {categorySkills.length === 1
                    ? t.skill || 'skill'
                    : t.skills || 'skills'}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categorySkills.map(skill => {
                  const levelInfo = getLevelInfo(skill.level);
                  return (
                    <div
                      key={skill.name}
                      className="group relative inline-flex items-center"
                    >
                      <Badge
                        variant="secondary"
                        className={cn(
                          'pr-8 transition-colors',
                          skill.level && levelInfo?.color
                        )}
                      >
                        {skill.name}
                        {skill.level && (
                          <span className="ml-2 text-xs opacity-75">
                            ({levelInfo?.label})
                          </span>
                        )}
                      </Badge>
                      <div className="absolute right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(skill)}
                          className="p-1 hover:bg-muted rounded"
                          title={t.edit || 'Edit'}
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.name)}
                          className="p-1 hover:bg-muted rounded"
                          title={t.delete || 'Delete'}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAdd(category)}
                  className="h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {t.add || 'Add'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {skills.length === 0 && !isAdding && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {t.noSkills || 'No skills added yet'}
            </p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => handleAdd()}>
                <Plus className="h-4 w-4 mr-2" />
                {t.addFirstSkill || 'Add Your First Skill'}
              </Button>
              <Button variant="outline" onClick={handleBulkAdd}>
                <Sparkles className="h-4 w-4 mr-2" />
                {t.bulkAdd || 'Bulk Add'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Skill Level Legend */}
      {skills.length > 0 && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              {t.proficiencyLevels || 'Proficiency Levels:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {SKILL_LEVELS.map(level => (
                <Badge
                  key={level.value}
                  variant="secondary"
                  className={level.color}
                >
                  {level.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

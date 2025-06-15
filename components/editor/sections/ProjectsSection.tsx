'use client';

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Link,
  Github,
  ExternalLink,
  Star,
  MoveUp,
  MoveDown,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ImageUpload } from '@/components/ui/image-upload';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { Project } from '@/types/portfolio';
import { useToast } from '@/hooks/use-toast';
import { usePortfolioStore } from '@/lib/store/portfolio-store';

interface ProjectsSectionProps {
  projects: Project[];
  onUpdate: (projects: Project[]) => void;
}

interface ProjectFormData {
  title: string;
  description: string;
  imageUrl?: string;
  projectUrl?: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
  highlights?: string[];
  featured?: boolean;
}

export function ProjectsSection({
  projects = [],
  onUpdate,
}: ProjectsSectionProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { currentPortfolio } = usePortfolioStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    imageUrl: '',
    projectUrl: '',
    liveUrl: '',
    githubUrl: '',
    technologies: [],
    highlights: [],
    featured: false,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      projectUrl: '',
      liveUrl: '',
      githubUrl: '',
      technologies: [],
      highlights: [],
      featured: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setIsAdding(false);
    setFormData({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl || '',
      projectUrl: project.projectUrl || '',
      liveUrl: project.liveUrl || '',
      githubUrl: project.githubUrl || '',
      technologies: project.technologies || [],
      highlights: project.highlights || [],
      featured: project.featured || false,
    });
  };

  const handleSave = () => {
    if (!formData.title || !formData.description) {
      toast({
        title: t.error || 'Error',
        description:
          t.fillRequiredFields || 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newProject: Project = {
      id: editingId || `proj_${Date.now()}`,
      title: formData.title,
      description: formData.description,
      imageUrl: formData.imageUrl || undefined,
      projectUrl: formData.projectUrl || undefined,
      liveUrl: formData.liveUrl || undefined,
      githubUrl: formData.githubUrl || undefined,
      technologies: formData.technologies.filter(t => t.trim()),
      highlights: formData.highlights?.filter(h => h.trim()) || [],
      featured: formData.featured,
      order: editingId
        ? projects.find(p => p.id === editingId)?.order
        : projects.length,
    };

    let updatedProjects: Project[];
    if (editingId) {
      updatedProjects = projects.map(proj =>
        proj.id === editingId ? newProject : proj
      );
    } else {
      updatedProjects = [...projects, newProject];
    }

    onUpdate(updatedProjects);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (
      confirm(
        t.confirmDeleteProject ||
          'Are you sure you want to delete this project?'
      )
    ) {
      onUpdate(projects.filter(proj => proj.id !== id));
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

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newProjects = [...projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= projects.length) return;

    // Swap projects
    const tempProject = newProjects[index];
    const targetProject = newProjects[targetIndex];

    if (!tempProject || !targetProject) return;

    newProjects[index] = targetProject;
    newProjects[targetIndex] = tempProject;

    // Update order values
    newProjects.forEach((proj, i) => {
      proj.order = i;
    });

    onUpdate(newProjects);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t.projects || 'Projects'}</h3>
          <p className="text-sm text-muted-foreground">
            {t.projectsDescription ||
              'Showcase your best work and accomplishments'}
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t.addProject || 'Add Project'}
          </Button>
        )}
      </div>

      {/* Project Form */}
      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId
                ? t.editProject || 'Edit Project'
                : t.addProject || 'Add Project'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">
                {t.projectTitle || 'Project Title'} *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={e =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder={
                  t.projectTitlePlaceholder || 'e.g. E-commerce Platform'
                }
              />
            </div>

            <div>
              <Label htmlFor="description">
                {t.description || 'Description'} *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={
                  t.projectDescriptionPlaceholder ||
                  'Describe what the project does, your role, and the impact...'
                }
                rows={4}
              />
            </div>

            <div>
              <Label>{t.projectImage || 'Project Image'}</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={url =>
                  setFormData({ ...formData, imageUrl: url || '' })
                }
                type="project"
                portfolioId={currentPortfolio?.id || ''}
                aspectRatio="video"
                className="mt-2"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="projectUrl">
                  {t.projectUrl || 'Project URL'}
                </Label>
                <Input
                  id="projectUrl"
                  type="url"
                  value={formData.projectUrl}
                  onChange={e =>
                    setFormData({ ...formData, projectUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="liveUrl">{t.liveUrl || 'Live Demo URL'}</Label>
                <Input
                  id="liveUrl"
                  type="url"
                  value={formData.liveUrl}
                  onChange={e =>
                    setFormData({ ...formData, liveUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="githubUrl">{t.githubUrl || 'GitHub URL'}</Label>
                <Input
                  id="githubUrl"
                  type="url"
                  value={formData.githubUrl}
                  onChange={e =>
                    setFormData({ ...formData, githubUrl: e.target.value })
                  }
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div>
              <Label htmlFor="technologies">
                {t.technologies || 'Technologies Used'} *
              </Label>
              <Input
                id="technologies"
                value={formData.technologies.join(', ')}
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
                {t.separateWithCommas || 'Separate with commas'}
              </p>
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
                        t.highlightPlaceholder ||
                        'e.g. Increased performance by 50%'
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

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={checked =>
                  setFormData({ ...formData, featured: checked })
                }
              />
              <Label htmlFor="featured" className="cursor-pointer">
                {t.featureThisProject || 'Feature this project'}
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                {t.cancel || 'Cancel'}
              </Button>
              <Button onClick={handleSave}>
                {editingId
                  ? t.saveChanges || 'Save Changes'
                  : t.addProject || 'Add Project'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {projects
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((project, index) => (
            <Card key={project.id} className="group relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {project.imageUrl && (
                    <div className="w-32 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{project.title}</h4>
                          {project.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1" />
                              {t.featured || 'Featured'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {project.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveProject(index, 'up')}
                            title={t.moveUp || 'Move up'}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                        )}
                        {index < projects.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveProject(index, 'down')}
                            title={t.moveDown || 'Move down'}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(project)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {project.highlights && project.highlights.length > 0 && (
                      <ul className="mb-3 space-y-1">
                        {project.highlights.map((highlight, i) => (
                          <li key={i} className="text-sm flex items-start">
                            <span className="text-primary mr-2">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="flex items-center gap-4">
                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2 flex-1">
                            {project.technologies.map((tech, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      <div className="flex items-center gap-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="View on GitHub"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="View live demo"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="View project"
                          >
                            <Link className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {projects.length === 0 && !isAdding && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {t.noProjects || 'No projects added yet'}
            </p>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              {t.addFirstProject || 'Add Your First Project'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

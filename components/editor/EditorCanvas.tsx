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
import { useLanguage } from '@/lib/i18n/refactored-context';
import { cn } from '@/lib/utils';
import { Portfolio } from '@/types/portfolio';

interface EditorCanvasProps {
  portfolio: Portfolio;
  onDataChange: (data: Partial<Portfolio>) => void;
  className?: string;
}

/**
 * EditorCanvas Component
 *
 * Main editing area for portfolio content
 * Shows form fields based on active section
 */
// eslint-disable-next-line complexity
export function EditorCanvas({
  portfolio,
  onDataChange,
  className,
}: EditorCanvasProps) {
  const { t } = useLanguage();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: [] as string[],
    link: '',
  });

  const handleAddProject = () => {
    if (newProject.title && newProject.description) {
      const project = {
        id: `project-${Date.now()}`,
        ...newProject,
      };
      const updatedProjects = [...portfolio.projects, project];
      onDataChange({
        projects: updatedProjects,
      });
      setNewProject({ title: '', description: '', technologies: [], link: '' });
      setShowProjectModal(false);
    }
  };

  return (
    <div className={cn('flex-1 overflow-y-auto bg-background', className)}>
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-card rounded-lg border p-6">
          <h1 className="text-2xl font-bold mb-6">
            {t.editingPortfolio || 'Editing'}: {portfolio.name}
          </h1>

          <div className="space-y-6">
            {/* Hero Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">
                {t.heroSection || 'Hero Section'}
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t.headline || 'Headline'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={portfolio.title || ''}
                    onChange={e => onDataChange({ title: e.target.value })}
                    placeholder={t.enterHeadline || 'Enter your headline'}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t.tagline || 'Tagline'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={portfolio.tagline || ''}
                    onChange={e => onDataChange({ tagline: e.target.value })}
                    placeholder={t.enterTagline || 'A short, memorable tagline'}
                  />
                </div>
              </div>
            </section>

            {/* About Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">
                {t.aboutSection || 'About Section'}
              </h2>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t.aboutMe || 'About Me'}
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={6}
                  value={portfolio.bio || ''}
                  onChange={e => onDataChange({ bio: e.target.value })}
                  placeholder={
                    t.tellAboutYourself || 'Tell us about yourself...'
                  }
                />
              </div>
            </section>

            {/* Projects Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">
                {t.projectsSection || 'Projects'}
              </h2>
              <div className="space-y-4">
                {portfolio.projects.map((project, index) => (
                  <div
                    key={project.id || index}
                    className="p-4 border rounded-md"
                  >
                    <h3 className="font-medium">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {project.description}
                    </p>
                  </div>
                ))}
                <button
                  className="w-full py-2 border-2 border-dashed rounded-md hover:border-primary transition-colors"
                  onClick={() => setShowProjectModal(true)}
                >
                  {t.addProject || '+ Add Project'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {t.addNewProject || 'Add New Project'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t.projectTitle || 'Project Title'}
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newProject.title}
                  onChange={e =>
                    setNewProject({ ...newProject, title: e.target.value })
                  }
                  placeholder={t.enterProjectTitle || 'Enter project title'}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t.projectDescription || 'Description'}
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  value={newProject.description}
                  onChange={e =>
                    setNewProject({
                      ...newProject,
                      description: e.target.value,
                    })
                  }
                  placeholder={t.describeProject || 'Describe your project...'}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t.projectLink || 'Project Link (optional)'}
                </label>
                <input
                  type="url"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newProject.link}
                  onChange={e =>
                    setNewProject({ ...newProject, link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-4 py-2 border rounded-md hover:bg-muted"
                onClick={() => setShowProjectModal(false)}
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                onClick={handleAddProject}
                disabled={!newProject.title || !newProject.description}
              >
                {t.addProject || 'Add Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

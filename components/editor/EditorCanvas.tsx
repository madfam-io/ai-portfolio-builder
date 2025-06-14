'use client';

import { Portfolio } from '@/types/portfolio';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { cn } from '@/lib/utils';

interface EditorCanvasProps {
  portfolio: Portfolio;
  onDataChange: (data: Partial<Portfolio['data']>) => void;
  className?: string;
}

/**
 * EditorCanvas Component
 * 
 * Main editing area for portfolio content
 * Shows form fields based on active section
 */
export function EditorCanvas({ portfolio, onDataChange, className }: EditorCanvasProps) {
  const { t } = useLanguage();

  return (
    <div className={cn(
      'flex-1 overflow-y-auto bg-background',
      className
    )}>
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-card rounded-lg border p-6">
          <h1 className="text-2xl font-bold mb-6">
            {t.editingPortfolio || 'Editing'}: {portfolio.name}
          </h1>
          
          <div className="space-y-6">
            {/* Hero Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">{t.heroSection || 'Hero Section'}</h2>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t.headline || 'Headline'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    value={portfolio.data?.headline || ''}
                    onChange={(e) => onDataChange({ headline: e.target.value })}
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
                    value={portfolio.data?.tagline || ''}
                    onChange={(e) => onDataChange({ tagline: e.target.value })}
                    placeholder={t.enterTagline || 'A short, memorable tagline'}
                  />
                </div>
              </div>
            </section>

            {/* About Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">{t.aboutSection || 'About Section'}</h2>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {t.aboutMe || 'About Me'}
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md"
                  rows={6}
                  value={portfolio.data?.about || ''}
                  onChange={(e) => onDataChange({ about: e.target.value })}
                  placeholder={t.tellAboutYourself || 'Tell us about yourself...'}
                />
              </div>
            </section>

            {/* Projects Section */}
            <section>
              <h2 className="text-lg font-semibold mb-4">{t.projectsSection || 'Projects'}</h2>
              <div className="space-y-4">
                {portfolio.data?.projects?.map((project: any, index: number) => (
                  <div key={project.id || index} className="p-4 border rounded-md">
                    <h3 className="font-medium">{project.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                  </div>
                ))}
                <button
                  className="w-full py-2 border-2 border-dashed rounded-md hover:border-primary transition-colors"
                  onClick={() => {
                    // TODO: Add project modal
                  }}
                >
                  {t.addProject || '+ Add Project'}
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
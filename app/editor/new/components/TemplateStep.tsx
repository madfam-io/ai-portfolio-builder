'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TemplateType } from '@/types/portfolio';
import { TemplateSelectionWizard } from '@/components/templates/TemplateSelectionWizard';
import { TemplateShowcase } from '@/components/templates/TemplateShowcase';

interface TemplateStepProps {
  selectedTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
  onNext: () => void;
  onBack: () => void;
  t: Record<string, string | undefined>; // Translation object
}

const _templates: Array<{
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
  features: string[];
}> = [
  {
    id: 'developer',
    name: 'Developer',
    description: 'Perfect for software engineers and programmers',
    icon: '💻',
    features: ['GitHub integration', 'Code snippets', 'Tech stack showcase'],
  },
  {
    id: 'designer',
    name: 'Designer',
    description: 'Showcase your creative work beautifully',
    icon: '🎨',
    features: ['Image gallery', 'Case studies', 'Design process'],
  },
  {
    id: 'consultant',
    name: 'Consultant',
    description: 'Professional and trustworthy for business experts',
    icon: '💼',
    features: ['Service packages', 'Client testimonials', 'Results metrics'],
  },
  {
    id: 'educator',
    name: 'Educator',
    description: 'Share your knowledge and expertise',
    icon: '🎓',
    features: ['Course listings', 'Publications', 'Speaking engagements'],
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Express yourself with artistic freedom',
    icon: '✨',
    features: ['Portfolio gallery', 'Blog integration', 'Social media links'],
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple, let your work speak',
    icon: '⚡',
    features: ['Fast loading', 'Focus on content', 'Distraction-free'],
  },
];

export function TemplateStep({
  selectedTemplate,
  onSelectTemplate,
  onNext,
  onBack,
  t,
}: TemplateStepProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'wizard' | 'browse'>(
    'wizard'
  );

  const handleTemplateSelect = (template: TemplateType) => {
    onSelectTemplate(template);
    setShowWizard(false);
  };

  const handleWizardComplete = (template: TemplateType) => {
    onSelectTemplate(template);
    setShowWizard(false);
    // Auto-proceed to next step after wizard selection
    setTimeout(() => onNext(), 500);
  };

  return (
    <div className="space-y-6">
      {showWizard && selectionMode === 'wizard' && (
        <TemplateSelectionWizard
          onSelect={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
          currentTemplate={selectedTemplate}
        />
      )}

      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t.chooseTemplate || 'Choose your template'}
        </h2>
        <p className="text-muted-foreground">
          {t.templateDescription ||
            'Select a design that matches your style and industry'}
        </p>
      </div>

      {/* Selection Mode Tabs */}
      <Tabs
        value={selectionMode}
        onValueChange={v => setSelectionMode(v as unknown)}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wizard" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {t.wizardMode || 'Guided Selection'}
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            {t.browseMode || 'Browse All'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-4">
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {t.wizardTitle || 'Let us help you choose'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                {t.wizardDescription ||
                  "Answer a few questions and we'll recommend the perfect template for your needs"}
              </p>
              <Button onClick={() => setShowWizard(true)} size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                {t.startWizard || 'Start Template Wizard'}
              </Button>
            </CardContent>
          </Card>

          {/* Show selected template if chosen */}
          {selectedTemplate && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{t.selectedTemplate || 'Selected Template'}:</span>
                  <span className="capitalize">{selectedTemplate}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="browse">
          <TemplateShowcase
            onSelect={handleTemplateSelect}
            currentTemplate={selectedTemplate}
            showWizard={() => {
              setSelectionMode('wizard');
              setShowWizard(true);
            }}
          />
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t.back || 'Back'}
        </Button>
        <Button
          onClick={onNext}
          className="flex-1"
          disabled={!selectedTemplate}
        >
          {t.continueButton || 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

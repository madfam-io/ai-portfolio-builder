'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TemplateType } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface TemplateStepProps {
  selectedTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
  onNext: () => void;
  onBack: () => void;
  t: any; // Translation object
}

const templates: Array<{
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t.chooseTemplate || 'Choose your template'}
        </h2>
        <p className="text-muted-foreground">
          {t.templateDescription ||
            'Select a design that matches your style and industry'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {templates.map(template => (
          <Card
            key={template.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedTemplate === template.id && 'ring-2 ring-primary'
            )}
            onClick={() => onSelectTemplate(template.id)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                {template.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-primary">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t.back || 'Back'}
        </Button>
        <Button onClick={onNext} className="flex-1">
          {t.continueButton || 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

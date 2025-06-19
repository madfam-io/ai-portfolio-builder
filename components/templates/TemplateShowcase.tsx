'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Eye,
  Check,
  Sparkles,
  Briefcase,
  Code,
  Palette,
  GraduationCap,
  Camera,
  Building,
  Zap,
  Layout,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { cn } from '@/lib/utils';
import { TemplateType } from '@/types/portfolio';

interface TemplateShowcaseProps {
  onSelect: (template: TemplateType) => void;
  currentTemplate?: TemplateType;
  showWizard?: () => void;
}

interface TemplateDetails {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  industries: string[];
  preview: {
    desktop: string;
    mobile: string;
  };
  highlights: string[];
  colorScheme: string[];
  aiRecommended?: boolean;
}

const templateDetails: TemplateDetails[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'A sleek, contemporary design with dark theme and smooth animations',
    icon: <Zap className="w-6 h-6" />,
    features: ['Dark theme', 'Glassmorphism', 'Smooth animations', 'Grid layouts'],
    industries: ['Technology', 'Startup', 'Developer', 'Designer'],
    preview: {
      desktop: '/templates/modern-desktop.png',
      mobile: '/templates/modern-mobile.png',
    },
    highlights: [
      'Perfect for tech professionals',
      'Eye-catching animations',
      'Mobile-optimized',
      'SEO-friendly',
    ],
    colorScheme: ['#00d4ff', '#7c3aed', '#0a0a0a', '#ffffff'],
    aiRecommended: true,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and focused design that lets your content shine',
    icon: <Layout className="w-6 h-6" />,
    features: ['Clean typography', 'Whitespace', 'Simple navigation', 'Fast loading'],
    industries: ['Writer', 'Consultant', 'Freelancer', 'Designer'],
    preview: {
      desktop: '/templates/minimal-desktop.png',
      mobile: '/templates/minimal-mobile.png',
    },
    highlights: [
      'Content-first approach',
      'Excellent readability',
      'Distraction-free',
      'Professional look',
    ],
    colorScheme: ['#000000', '#666666', '#ffffff', '#f5f5f5'],
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Professional template with structured sections and metrics display',
    icon: <Briefcase className="w-6 h-6" />,
    features: ['Corporate design', 'Metrics display', 'Testimonials', 'Case studies'],
    industries: ['Consultant', 'Executive', 'Agency', 'B2B Services'],
    preview: {
      desktop: '/templates/business-desktop.png',
      mobile: '/templates/business-mobile.png',
    },
    highlights: [
      'Trust-building design',
      'Client testimonials',
      'Results showcase',
      'Professional credibility',
    ],
    colorScheme: ['#1e40af', '#059669', '#f3f4f6', '#111827'],
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant and artistic design perfect for visual portfolios',
    icon: <Palette className="w-6 h-6" />,
    features: ['Bold colors', 'Image galleries', 'Creative layouts', 'Portfolio grid'],
    industries: ['Artist', 'Photographer', 'Designer', 'Creative Director'],
    preview: {
      desktop: '/templates/creative-desktop.png',
      mobile: '/templates/creative-mobile.png',
    },
    highlights: [
      'Visual-first design',
      'Gallery layouts',
      'Color customization',
      'Creative freedom',
    ],
    colorScheme: ['#ec4899', '#8b5cf6', '#fbbf24', '#34d399'],
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Code-focused template with GitHub integration and tech showcase',
    icon: <Code className="w-6 h-6" />,
    features: ['Code highlighting', 'GitHub stats', 'Project cards', 'Tech stack'],
    industries: ['Developer', 'Engineer', 'DevOps', 'Data Scientist'],
    preview: {
      desktop: '/templates/developer-desktop.png',
      mobile: '/templates/developer-mobile.png',
    },
    highlights: [
      'GitHub integration',
      'Code snippets',
      'Project showcase',
      'Tech stack display',
    ],
    colorScheme: ['#10b981', '#3b82f6', '#1f2937', '#f3f4f6'],
  },
  {
    id: 'educator',
    name: 'Educator',
    description: 'Academic template with sections for courses and publications',
    icon: <GraduationCap className="w-6 h-6" />,
    features: ['Course listings', 'Publications', 'Research areas', 'Academic CV'],
    industries: ['Teacher', 'Professor', 'Researcher', 'Trainer'],
    preview: {
      desktop: '/templates/educator-desktop.png',
      mobile: '/templates/educator-mobile.png',
    },
    highlights: [
      'Academic structure',
      'Publication list',
      'Course showcase',
      'Research focus',
    ],
    colorScheme: ['#7c3aed', '#0891b2', '#fafafa', '#4b5563'],
  },
];

export function TemplateShowcase({
  onSelect,
  currentTemplate,
  showWizard,
}: TemplateShowcaseProps) {
  const { t } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    currentTemplate || null
  );
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: t.allTemplates || 'All Templates' },
    { value: 'professional', label: t.professional || 'Professional' },
    { value: 'creative', label: t.creative || 'Creative' },
    { value: 'technical', label: t.technical || 'Technical' },
  ];

  const filterTemplates = (category: string) => {
    if (category === 'all') return templateDetails;
    
    if (category === 'professional') {
      return templateDetails.filter(t => 
        ['business', 'consultant', 'minimal'].includes(t.id)
      );
    }
    
    if (category === 'creative') {
      return templateDetails.filter(t => 
        ['creative', 'designer', 'modern'].includes(t.id)
      );
    }
    
    if (category === 'technical') {
      return templateDetails.filter(t => 
        ['developer', 'modern', 'educator'].includes(t.id)
      );
    }
    
    return templateDetails;
  };

  const filteredTemplates = filterTemplates(activeCategory);

  const handleSelect = (templateId: TemplateType) => {
    setSelectedTemplate(templateId);
    onSelect(templateId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">{t.chooseTemplate || 'Choose Your Template'}</h2>
            <p className="text-muted-foreground mt-2">
              {t.templateSubtitle || 'Select a professional template that matches your style'}
            </p>
          </div>
          
          {showWizard && (
            <Button onClick={showWizard} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              {t.useWizard || 'Use Selection Wizard'}
            </Button>
          )}
        </div>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            {categories.map(category => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Template Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={cn(
                "overflow-hidden cursor-pointer transition-all hover:shadow-lg",
                selectedTemplate === template.id && "ring-2 ring-primary"
              )}
              onClick={() => handleSelect(template.id)}
            >
              <div className="relative aspect-[16/10] bg-muted">
                {/* Template Preview Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-primary mb-4">{template.icon}</div>
                    <span className="text-sm text-muted-foreground">
                      {t.previewComingSoon || 'Preview Coming Soon'}
                    </span>
                  </div>
                </div>

                {/* AI Recommended Badge */}
                {template.aiRecommended && (
                  <Badge className="absolute top-2 right-2" variant="default">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {t.aiRecommended || 'AI Pick'}
                  </Badge>
                )}

                {/* Selected Indicator */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}

                {/* Preview Controls */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <Button
                    size="sm"
                    variant={previewMode === 'desktop' ? 'default' : 'secondary'}
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewMode('desktop');
                    }}
                  >
                    <Monitor className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant={previewMode === 'mobile' ? 'default' : 'secondary'}
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewMode('mobile');
                    }}
                  >
                    <Smartphone className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open preview in new window
                      window.open(`/templates/preview/${template.id}`, '_blank');
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.features.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.features.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Industries */}
                <p className="text-xs text-muted-foreground mb-4">
                  {t.bestFor || 'Best for'}: {template.industries.join(', ')}
                </p>

                {/* Color Scheme */}
                <div className="flex items-center gap-1">
                  {template.colorScheme.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          size="lg"
          onClick={() => selectedTemplate && handleSelect(selectedTemplate)}
          disabled={!selectedTemplate}
        >
          <Check className="w-4 h-4 mr-2" />
          {t.useSelectedTemplate || 'Use Selected Template'}
        </Button>
      </div>
    </div>
  );
}
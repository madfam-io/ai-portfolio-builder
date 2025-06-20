'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
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
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { cn } from '@/lib/utils';
import { TemplateType } from '@/types/portfolio';

interface TemplateSelectionWizardProps {
  onSelect: (template: TemplateType) => void;
  onCancel?: () => void;
  currentTemplate?: TemplateType;
}

interface TemplateOption {
  id: TemplateType;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  industries: string[];
  preview: string;
  recommended?: boolean;
}

const templates: TemplateOption[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Sleek design with dark theme and glassmorphism effects',
    icon: <Zap className="w-6 h-6" />,
    features: ['Dark theme', 'Animations', 'Grid layout', 'Tech-focused'],
    industries: ['Technology', 'Startup', 'Developer'],
    preview: '/templates/modern-preview.png',
    recommended: true,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and focused on typography with plenty of whitespace',
    icon: <Layout className="w-6 h-6" />,
    features: ['Clean design', 'Typography', 'Simple layout', 'Content-first'],
    industries: ['Writer', 'Designer', 'Consultant'],
    preview: '/templates/minimal-preview.png',
  },
  {
    id: 'business',
    name: 'Business',
    description: 'Professional look with structured sections and metrics',
    icon: <Briefcase className="w-6 h-6" />,
    features: ['Corporate', 'Metrics', 'Testimonials', 'Professional'],
    industries: ['Consultant', 'Executive', 'Sales'],
    preview: '/templates/business-preview.png',
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Vibrant and artistic with visual portfolio focus',
    icon: <Palette className="w-6 h-6" />,
    features: ['Colorful', 'Gallery', 'Visual focus', 'Artistic'],
    industries: ['Designer', 'Artist', 'Photographer'],
    preview: '/templates/creative-preview.png',
  },
  {
    id: 'developer',
    name: 'Developer',
    description: 'Code-focused with GitHub integration and project showcase',
    icon: <Code className="w-6 h-6" />,
    features: ['Code blocks', 'GitHub stats', 'Tech stack', 'Projects'],
    industries: ['Developer', 'Engineer', 'DevOps'],
    preview: '/templates/developer-preview.png',
  },
  {
    id: 'educator',
    name: 'Educator',
    description: 'Academic style with publications and course sections',
    icon: <GraduationCap className="w-6 h-6" />,
    features: ['Publications', 'Courses', 'Research', 'Academic'],
    industries: ['Teacher', 'Professor', 'Researcher'],
    preview: '/templates/educator-preview.png',
  },
];

type WizardStep = 'industry' | 'style' | 'features' | 'preview';

interface WizardState {
  industry?: string;
  style?: 'visual' | 'content' | 'balanced';
  features?: string[];
  recommendation?: TemplateType;
}

export function TemplateSelectionWizard({
  onSelect,
  onCancel,
  currentTemplate,
}: TemplateSelectionWizardProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState<WizardStep>('industry');
  const [wizardState, setWizardState] = useState<WizardState>({});
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(
    currentTemplate || null
  );

  const steps: WizardStep[] = ['industry', 'style', 'features', 'preview'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      if (nextStep) {
        setCurrentStep(nextStep);

        // Calculate recommendation after features step
        if (currentStep === 'features') {
          const recommendation = calculateRecommendation(wizardState);
          setWizardState({ ...wizardState, recommendation });
          setSelectedTemplate(recommendation);
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevStep = steps[currentStepIndex - 1];
      if (prevStep) {
        setCurrentStep(prevStep);
      }
    }
  };

  const handleFinish = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  const calculateRecommendation = (state: WizardState): TemplateType => {
    // Simple scoring algorithm
    const scores: Record<TemplateType, number> = {
      modern: 0,
      minimal: 0,
      business: 0,
      creative: 0,
      developer: 0,
      educator: 0,
      designer: 0,
      consultant: 0,
    };

    // Industry matching
    templates.forEach(template => {
      if (state.industry && template.industries.includes(state.industry)) {
        scores[template.id] += 3;
      }
    });

    // Style preference
    if (state.style === 'visual') {
      scores.creative += 2;
      scores.designer += 2;
      scores.modern += 1;
    } else if (state.style === 'content') {
      scores.minimal += 2;
      scores.educator += 2;
      scores.business += 1;
    } else {
      scores.modern += 1;
      scores.business += 1;
    }

    // Feature matching
    if (state.features?.includes('portfolio')) {
      scores.creative += 1;
      scores.designer += 1;
    }
    if (state.features?.includes('metrics')) {
      scores.business += 1;
      scores.consultant += 1;
    }
    if (state.features?.includes('code')) {
      scores.developer += 2;
      scores.modern += 1;
    }

    // Find highest score
    const bestTemplate = Object.entries(scores)
      .filter(([template]) => templates.some(t => t.id === template))
      .reduce(
        (best, [template, score]) =>
          score > best[1] ? [template as TemplateType, score] : best,
        ['modern' as TemplateType, 0]
      )[0];

    return bestTemplate as TemplateType;
  };

  const industries = [
    {
      value: 'Technology',
      label: t.industryTech || 'Technology',
      icon: <Code />,
    },
    { value: 'Design', label: t.industryDesign || 'Design', icon: <Palette /> },
    {
      value: 'Business',
      label: t.industryBusiness || 'Business',
      icon: <Building />,
    },
    {
      value: 'Education',
      label: t.industryEducation || 'Education',
      icon: <GraduationCap />,
    },
    {
      value: 'Creative',
      label: t.industryCreative || 'Creative Arts',
      icon: <Camera />,
    },
  ];

  const styleOptions = [
    {
      value: 'visual',
      label: t.styleVisual || 'Visual & Creative',
      description:
        t.styleVisualDesc || 'Image-heavy, colorful, artistic layouts',
    },
    {
      value: 'content',
      label: t.styleContent || 'Content-Focused',
      description:
        t.styleContentDesc || 'Text-heavy, minimal distractions, clean',
    },
    {
      value: 'balanced',
      label: t.styleBalanced || 'Balanced',
      description: t.styleBalancedDesc || 'Mix of visuals and content',
    },
  ];

  const featureOptions = [
    { value: 'portfolio', label: t.featurePortfolio || 'Project Portfolio' },
    { value: 'blog', label: t.featureBlog || 'Blog/Articles' },
    { value: 'metrics', label: t.featureMetrics || 'Achievements & Metrics' },
    { value: 'testimonials', label: t.featureTestimonials || 'Testimonials' },
    { value: 'code', label: t.featureCode || 'Code Samples' },
    { value: 'resume', label: t.featureResume || 'Downloadable Resume' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl mx-4"
      >
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {t.selectTemplate || 'Select Your Template'}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.wizardSubtitle ||
                    'Let us help you find the perfect template'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                {t.skip || 'Skip'}
              </Button>
            </div>

            {/* Progress indicators */}
            <div className="flex items-center gap-2 mt-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className={cn(
                    'flex-1 h-2 rounded-full transition-colors',
                    index <= currentStepIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {/* Industry Selection */}
              {currentStep === 'industry' && (
                <motion.div
                  key="industry"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t.whatIndustry || 'What industry are you in?'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t.industryHelp ||
                        'This helps us recommend templates that work well in your field'}
                    </p>
                  </div>

                  <RadioGroup
                    value={wizardState.industry}
                    onValueChange={value =>
                      setWizardState({ ...wizardState, industry: value })
                    }
                  >
                    <div className="grid gap-3">
                      {industries.map(industry => (
                        <Label
                          key={industry.value}
                          htmlFor={industry.value}
                          className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <RadioGroupItem
                            value={industry.value}
                            id={industry.value}
                          />
                          <div className="text-primary">{industry.icon}</div>
                          <span className="font-medium">{industry.label}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                </motion.div>
              )}

              {/* Style Preference */}
              {currentStep === 'style' && (
                <motion.div
                  key="style"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t.preferredStyle || "What's your preferred style?"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t.styleHelp ||
                        'Choose the approach that best matches your content'}
                    </p>
                  </div>

                  <RadioGroup
                    value={wizardState.style}
                    onValueChange={value =>
                      setWizardState({
                        ...wizardState,
                        style: value as 'visual' | 'content' | 'balanced',
                      })
                    }
                  >
                    <div className="grid gap-3">
                      {styleOptions.map(style => (
                        <Label
                          key={style.value}
                          htmlFor={style.value}
                          className="flex flex-col space-y-1 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem
                              value={style.value}
                              id={style.value}
                            />
                            <span className="font-medium">{style.label}</span>
                          </div>
                          <p className="text-sm text-muted-foreground ml-6">
                            {style.description}
                          </p>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                </motion.div>
              )}

              {/* Features Selection */}
              {currentStep === 'features' && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t.importantFeatures ||
                        'What features are important to you?'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t.featuresHelp || 'Select all that apply'}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {featureOptions.map(feature => (
                      <Label
                        key={feature.value}
                        htmlFor={feature.value}
                        className="flex items-center space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <input
                          type="checkbox"
                          id={feature.value}
                          value={feature.value}
                          checked={wizardState.features?.includes(
                            feature.value
                          )}
                          onChange={e => {
                            const features = wizardState.features || [];
                            if (e.target.checked) {
                              setWizardState({
                                ...wizardState,
                                features: [...features, feature.value],
                              });
                            } else {
                              setWizardState({
                                ...wizardState,
                                features: features.filter(
                                  f => f !== feature.value
                                ),
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="font-medium">{feature.label}</span>
                      </Label>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Template Preview */}
              {currentStep === 'preview' && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      {t.recommendedTemplate || 'Recommended Templates'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t.previewHelp ||
                        'Based on your preferences, these templates would work best'}
                    </p>
                  </div>

                  <RadioGroup
                    value={selectedTemplate || undefined}
                    onValueChange={value =>
                      setSelectedTemplate(value as TemplateType)
                    }
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      {templates
                        .filter(
                          t =>
                            t.id === wizardState.recommendation || t.recommended
                        )
                        .map(template => (
                          <Label
                            key={template.id}
                            htmlFor={template.id}
                            className="relative rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <RadioGroupItem
                              value={template.id}
                              id={template.id}
                              className="absolute top-4 right-4"
                            />

                            {template.id === wizardState.recommendation && (
                              <Badge
                                className="absolute top-4 left-4"
                                variant="default"
                              >
                                <Sparkles className="w-3 h-3 mr-1" />
                                {t.recommended || 'Recommended'}
                              </Badge>
                            )}

                            <div className="pr-8">
                              <div className="flex items-center gap-3 mb-2 mt-2">
                                <div className="text-primary">
                                  {template.icon}
                                </div>
                                <h4 className="font-semibold">
                                  {template.name}
                                </h4>
                              </div>

                              <p className="text-sm text-muted-foreground mb-3">
                                {template.description}
                              </p>

                              <div className="flex flex-wrap gap-1">
                                {template.features.slice(0, 3).map(feature => (
                                  <Badge
                                    key={feature}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </Label>
                        ))}
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="link"
                        onClick={() => setSelectedTemplate(null)}
                        className="text-sm"
                      >
                        {t.viewAllTemplates || 'View all templates instead'}
                      </Button>
                    </div>
                  </RadioGroup>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.back || 'Back'}
              </Button>

              {currentStep === 'preview' ? (
                <Button onClick={handleFinish} disabled={!selectedTemplate}>
                  <Check className="w-4 h-4 mr-2" />
                  {t.useTemplate || 'Use This Template'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 'industry' && !wizardState.industry) ||
                    (currentStep === 'style' && !wizardState.style)
                  }
                >
                  {t.next || 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

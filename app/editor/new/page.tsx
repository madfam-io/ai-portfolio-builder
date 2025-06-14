'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, FileText, Upload, Wand2 } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import BaseLayout from '@/components/layouts/BaseLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { TemplateType } from '@/types/portfolio';
import { cn } from '@/lib/utils';

type Step = 'basic' | 'template' | 'import' | 'enhance';

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

function NewPortfolioContent() {
  const router = useRouter();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { createPortfolio } = usePortfolioStore();

  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isCreating, setIsCreating] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    template: 'modern' as TemplateType,
    importSource: 'manual' as 'linkedin' | 'github' | 'manual' | 'cv',
    enhanceContent: true,
  });

  const handleNext = () => {
    const steps: Step[] = ['basic', 'template', 'import', 'enhance'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as Step);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['basic', 'template', 'import', 'enhance'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1] as Step);
    }
  };

  const handleCreatePortfolio = async () => {
    setIsCreating(true);
    try {
      const portfolio = await createPortfolio({
        name: formData.name,
        title: formData.title,
        bio: formData.bio,
        template: formData.template,
      });

      toast({
        title: t.success || 'Success',
        description: t.portfolioCreated || 'Your portfolio has been created!',
      });

      // Redirect to editor
      router.push(`/editor/${portfolio.id}`);
    } catch (error) {
      toast({
        title: t.error || 'Error',
        description: t.failedToCreatePortfolio || 'Failed to create portfolio. Please try again.',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t.letsGetStarted || "Let's get started"}
              </h2>
              <p className="text-muted-foreground">
                {t.basicInfoDescription || 'Tell us a bit about yourself and your portfolio'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">{t.portfolioName || 'Portfolio Name'}</Label>
                <Input
                  id="name"
                  placeholder={t.portfolioNamePlaceholder || 'My Professional Portfolio'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="title">{t.yourTitle || 'Your Professional Title'}</Label>
                <Input
                  id="title"
                  placeholder={t.titlePlaceholder || 'Senior Software Engineer'}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bio">{t.shortBio || 'Short Bio'}</Label>
                <Textarea
                  id="bio"
                  placeholder={t.bioPlaceholder || 'Tell us about your experience and what makes you unique...'}
                  value={formData.bio}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>

            <Button 
              onClick={handleNext}
              disabled={!formData.name || !formData.title}
              className="w-full"
            >
              {t.continueButton || 'Continue'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 'template':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t.chooseTemplate || 'Choose your template'}
              </h2>
              <p className="text-muted-foreground">
                {t.templateDescription || 'Select a design that matches your style and industry'}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    formData.template === template.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setFormData({ ...formData, template: template.id })}
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
              <Button variant="outline" onClick={handleBack} className="flex-1">
                {t.back || 'Back'}
              </Button>
              <Button onClick={handleNext} className="flex-1">
                {t.continueButton || 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'import':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t.importYourData || 'Import your data'}
              </h2>
              <p className="text-muted-foreground">
                {t.importDescription || 'Speed up the process by importing from existing profiles'}
              </p>
            </div>

            <div className="grid gap-4">
              <Card
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  formData.importSource === 'linkedin' && "ring-2 ring-primary"
                )}
                onClick={() => setFormData({ ...formData, importSource: 'linkedin' })}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#0077B5] text-white rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">LinkedIn</CardTitle>
                      <CardDescription>
                        {t.importFromLinkedIn || 'Import your professional experience'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  formData.importSource === 'github' && "ring-2 ring-primary"
                )}
                onClick={() => setFormData({ ...formData, importSource: 'github' })}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-900 text-white rounded-lg">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">GitHub</CardTitle>
                      <CardDescription>
                        {t.importFromGitHub || 'Import your projects and contributions'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  formData.importSource === 'cv' && "ring-2 ring-primary"
                )}
                onClick={() => setFormData({ ...formData, importSource: 'cv' })}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Upload className="h-7 w-7 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{t.uploadCV || 'Upload CV'}</CardTitle>
                      <CardDescription>
                        {t.uploadCVDescription || 'Upload your resume (PDF/DOC)'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  formData.importSource === 'manual' && "ring-2 ring-primary"
                )}
                onClick={() => setFormData({ ...formData, importSource: 'manual' })}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <FileText className="h-7 w-7 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">{t.manualEntry || 'Manual Entry'}</CardTitle>
                      <CardDescription>
                        {t.manualEntryDescription || 'Enter your information manually'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                {t.back || 'Back'}
              </Button>
              <Button onClick={handleNext} className="flex-1">
                {t.continueButton || 'Continue'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'enhance':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {t.enhanceWithAI || 'Enhance with AI'}
              </h2>
              <p className="text-muted-foreground">
                {t.enhanceDescription || 'Let our AI help you create compelling content'}
              </p>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>{t.aiContentEnhancement || 'AI Content Enhancement'}</CardTitle>
                    <CardDescription>
                      {t.aiEnhancementDescription || 'Automatically improve your bio, project descriptions, and more'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <span>{t.professionalBioWriting || 'Professional bio writing'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <span>{t.projectDescriptionOptimization || 'Project description optimization'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <span>{t.skillsExtraction || 'Skills extraction and highlighting'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Wand2 className="h-4 w-4 text-primary" />
                    <span>{t.achievementHighlighting || 'Achievement highlighting'}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-center">
                    {t.aiEnhancementNote || 'You can always edit and customize the AI-generated content'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleBack} className="flex-1">
                {t.back || 'Back'}
              </Button>
              <Button 
                onClick={handleCreatePortfolio} 
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating ? (
                  t.creatingPortfolio || 'Creating portfolio...'
                ) : (
                  <>
                    {t.createPortfolio || 'Create Portfolio'}
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <BaseLayout>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className={cn(
                "flex items-center gap-2",
                currentStep === 'basic' ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'basic' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  1
                </div>
                <span className="text-sm">{t.basicInfo || 'Basic Info'}</span>
              </div>
              <div className={cn(
                "flex items-center gap-2",
                currentStep === 'template' ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'template' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  2
                </div>
                <span className="text-sm">{t.template || 'Template'}</span>
              </div>
              <div className={cn(
                "flex items-center gap-2",
                currentStep === 'import' ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'import' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  3
                </div>
                <span className="text-sm">{t.import || 'Import'}</span>
              </div>
              <div className={cn(
                "flex items-center gap-2",
                currentStep === 'enhance' ? "text-primary" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  currentStep === 'enhance' ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  4
                </div>
                <span className="text-sm">{t.enhance || 'Enhance'}</span>
              </div>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: currentStep === 'basic' ? '25%' : 
                         currentStep === 'template' ? '50%' :
                         currentStep === 'import' ? '75%' : '100%'
                }}
              />
            </div>
          </div>

          {/* Step content */}
          <Card>
            <CardContent className="pt-6">
              {renderStep()}
            </CardContent>
          </Card>
        </div>
      </div>
    </BaseLayout>
  );
}

export default function NewPortfolioPage() {
  return (
    <ProtectedRoute>
      <NewPortfolioContent />
    </ProtectedRoute>
  );
}
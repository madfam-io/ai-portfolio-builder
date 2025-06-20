'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  User,
  FileText,
  Wand2,
  Palette,
  Globe,
  TrendingUp,
} from 'lucide-react';
import {
  useOnboardingStore,
  OnboardingFlow,
  OnboardingStep,
} from '@/lib/store/onboarding-store';
import { useRouter } from 'next/navigation';
import { track } from '@/lib/monitoring/unified/events';
import { useLanguage } from '@/lib/i18n/refactored-context';

interface OnboardingModalProps {
  flow: OnboardingFlow;
}

interface StepComponentProps {
  step: OnboardingStep;
  onComplete: () => Promise<void>;
}

// Step icon mapping
const stepIcons: Record<string, React.ReactNode> = {
  welcome: <Sparkles className="w-8 h-8" />,
  'profile-setup': <User className="w-8 h-8" />,
  'first-portfolio': <FileText className="w-8 h-8" />,
  'ai-enhancement': <Wand2 className="w-8 h-8" />,
  'customize-design': <Palette className="w-8 h-8" />,
  publish: <Globe className="w-8 h-8" />,
  'explore-features': <TrendingUp className="w-8 h-8" />,
  'whats-new': <Sparkles className="w-8 h-8" />,
  'feature-highlights': <TrendingUp className="w-8 h-8" />,
  'import-review': <FileText className="w-8 h-8" />,
  'enhance-imported': <Wand2 className="w-8 h-8" />,
  'customize-imported': <Palette className="w-8 h-8" />,
};

// Step content components
const stepComponents: Record<string, React.ComponentType<StepComponentProps>> = {
  welcome: WelcomeStep,
  'profile-setup': ProfileSetupStep,
  'first-portfolio': FirstPortfolioStep,
  'ai-enhancement': AIEnhancementStep,
  'customize-design': CustomizeDesignStep,
  publish: PublishStep,
  'explore-features': ExploreFeaturesStep,
  'whats-new': WhatsNewStep,
  'feature-highlights': FeatureHighlightsStep,
  'import-review': ImportReviewStep,
  'enhance-imported': EnhanceImportedStep,
  'customize-imported': CustomizeImportedStep,
};

export function OnboardingModal({ flow }: OnboardingModalProps) {
  const router = useRouter();
  const {
    completeStep,
    skipStep,
    goToStep,
    completeOnboarding,
    getCurrentStep,
    getProgress,
  } = useOnboardingStore();

  const currentStep = getCurrentStep();
  const progress = getProgress();

  if (!currentStep) return null;

  const StepComponent = stepComponents[currentStep.id] || DefaultStep;
  const stepIcon = stepIcons[currentStep.id] || (
    <Sparkles className="w-8 h-8" />
  );

  const handleNext = async () => {
    await track.user.action(
      'onboarding_step_completed',
      'system',
      () => {
        completeStep(currentStep.id);
      },
      {
        step: currentStep.id,
        flow: flow.id,
      }
    );

    // Check if this was the last step
    const nextStep = flow.steps.find(s => !s.completed && !s.skipped);
    if (!nextStep) {
      handleComplete();
    }
  };

  const handleSkip = () => {
    track.user.action(
      'onboarding_step_skipped',
      'system',
      () => {
        skipStep(currentStep.id);
      },
      {
        step: currentStep.id,
        flow: flow.id,
      }
    );
  };

  const handleComplete = () => {
    track.user.action(
      'onboarding_completed',
      'system',
      () => {
        completeOnboarding();
      },
      {
        flow: flow.id,
        progress,
      }
    );

    // Redirect based on flow type
    if (flow.userType === 'new') {
      router.push('/editor/new');
    } else {
      router.push('/dashboard');
    }
  };

  const handleClose = () => {
    track.user.action(
      'onboarding_closed',
      'system',
      () => {
        completeOnboarding();
      },
      {
        flow: flow.id,
        progress,
        reason: 'user_closed',
      }
    );
  };

  const currentStepIndex = flow.currentStepIndex;
  const totalSteps = flow.steps.length;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-2xl mx-4"
        >
          <Card className="border-2 shadow-2xl">
            <CardHeader className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleClose}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-primary">{stepIcon}</div>
                <div>
                  <CardTitle className="text-2xl">
                    {currentStep.title}
                  </CardTitle>
                  <CardDescription>{currentStep.description}</CardDescription>
                </div>
              </div>

              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">
                Step {currentStepIndex + 1} of {totalSteps}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StepComponent step={currentStep} onComplete={handleNext} />
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between pt-6 border-t">
                <div className="flex gap-2">
                  {!isFirstStep && (
                    <Button
                      variant="outline"
                      onClick={() => goToStep(currentStepIndex - 1)}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                  )}

                  {!isLastStep && (
                    <Button variant="ghost" onClick={handleSkip}>
                      Skip
                    </Button>
                  )}
                </div>

                <div>
                  {isLastStep ? (
                    <Button onClick={handleComplete}>
                      Complete Onboarding
                      <Sparkles className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button onClick={handleNext}>
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Default step component
function DefaultStep({ step: _step, onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        This step is not yet implemented. Click next to continue.
      </p>
    </div>
  );
}

// Step implementations
function WelcomeStep({ onComplete: _onComplete }: StepComponentProps) {
  const _t = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Welcome to PRISMA!
        </h3>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Create stunning portfolios powered by AI in under 30 minutes. Let&apos;s
          get you started!
        </p>
      </div>

      <div className="grid gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">1</span>
          </div>
          <div>
            <h4 className="font-medium">Quick Setup</h4>
            <p className="text-sm text-muted-foreground">
              We'll guide you through creating your first portfolio step by step
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">2</span>
          </div>
          <div>
            <h4 className="font-medium">AI-Powered Content</h4>
            <p className="text-sm text-muted-foreground">
              Let AI help you write compelling descriptions and optimize your
              content
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-semibold text-primary">3</span>
          </div>
          <div>
            <h4 className="font-medium">Professional Results</h4>
            <p className="text-sm text-muted-foreground">
              Get a beautiful, responsive portfolio that stands out
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSetupStep({ onComplete: _onComplete }: StepComponentProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Let&apos;s start by setting up your profile. This information will help us
        personalize your experience.
      </p>

      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium">What we'll set up:</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Your professional headline
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Contact preferences
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            Language and timezone
          </li>
        </ul>
      </div>

      <Button
        onClick={() => {
          router.push('/settings/profile');
          onComplete();
        }}
        className="w-full"
      >
        Go to Profile Settings
      </Button>
    </div>
  );
}

function FirstPortfolioStep({ onComplete: _onComplete }: StepComponentProps) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Time to create your first portfolio! We'll walk you through the process.
      </p>

      <div className="grid gap-4">
        <Card className="p-4 border-primary/20 bg-primary/5">
          <h4 className="font-medium mb-2">Choose a Template</h4>
          <p className="text-sm text-muted-foreground">
            Pick from our professional templates designed for different
            industries
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Add Your Content</h4>
          <p className="text-sm text-muted-foreground">
            Import from LinkedIn, upload your CV, or start from scratch
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Enhance with AI</h4>
          <p className="text-sm text-muted-foreground">
            Let AI help you write better descriptions and optimize your content
          </p>
        </Card>
      </div>

      <Button
        onClick={() => {
          router.push('/editor/new');
          onComplete();
        }}
        className="w-full"
        size="lg"
      >
        Create My First Portfolio
      </Button>
    </div>
  );
}

function AIEnhancementStep({ onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wand2 className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">AI-Powered Enhancement</h3>
        <p className="text-muted-foreground">
          Our AI can help you write compelling content that gets results
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
          <div>
            <h4 className="font-medium">Professional Bio</h4>
            <p className="text-sm text-muted-foreground">
              Transform your bio into a compelling professional summary
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
          <div>
            <h4 className="font-medium">Project Descriptions</h4>
            <p className="text-sm text-muted-foreground">
              Highlight achievements and impact with optimized descriptions
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-purple-500 mt-0.5" />
          <div>
            <h4 className="font-medium">Skills Optimization</h4>
            <p className="text-sm text-muted-foreground">
              Ensure your skills match industry keywords and trends
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 rounded-lg">
        <p className="text-sm">
          <strong>Pro tip:</strong> You can always edit AI suggestions to match
          your voice
        </p>
      </div>
    </div>
  );
}

function CustomizeDesignStep({ onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Make your portfolio uniquely yours with our customization options.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 text-center hover:border-primary cursor-pointer transition-colors">
          <Palette className="w-8 h-8 mx-auto mb-2 text-primary" />
          <h4 className="font-medium">Colors & Fonts</h4>
          <p className="text-xs text-muted-foreground mt-1">Match your brand</p>
        </Card>

        <Card className="p-4 text-center hover:border-primary cursor-pointer transition-colors">
          <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
          <h4 className="font-medium">Layout Options</h4>
          <p className="text-xs text-muted-foreground mt-1">Arrange sections</p>
        </Card>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Coming Soon</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Custom CSS support</li>
          <li>• Advanced animations</li>
          <li>• Component library</li>
        </ul>
      </div>
    </div>
  );
}

function PublishStep({ onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Ready to Go Live!</h3>
        <p className="text-muted-foreground">
          Your portfolio is ready to share with the world
        </p>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <h4 className="font-medium mb-2">Your Portfolio URL</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Choose your custom subdomain
          </p>
          <div className="flex items-center gap-2 text-sm">
            <code className="bg-muted px-2 py-1 rounded">yourname</code>
            <span className="text-muted-foreground">.prisma.bio</span>
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-2">Custom Domain (Pro)</h4>
          <p className="text-sm text-muted-foreground">
            Use your own domain like www.yourname.com
          </p>
        </Card>
      </div>

      <div className="bg-primary/10 p-4 rounded-lg">
        <p className="text-sm">
          <strong>SEO Optimized:</strong> Your portfolio is automatically
          optimized for search engines
        </p>
      </div>
    </div>
  );
}

function ExploreFeaturesStep({ onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Discover powerful features to grow your professional presence.
      </p>

      <div className="space-y-3">
        <Card className="p-4">
          <h4 className="font-medium mb-1">Portfolio Variants</h4>
          <p className="text-sm text-muted-foreground">
            Create different versions for different audiences
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-1">Analytics Dashboard</h4>
          <p className="text-sm text-muted-foreground">
            Track views, clicks, and engagement
          </p>
        </Card>

        <Card className="p-4">
          <h4 className="font-medium mb-1">Team Collaboration</h4>
          <p className="text-sm text-muted-foreground">
            Invite team members to collaborate
          </p>
        </Card>
      </div>

      <div className="text-center pt-4">
        <p className="text-lg font-medium mb-2">🎉 Congratulations!</p>
        <p className="text-muted-foreground">
          You're ready to build amazing portfolios
        </p>
      </div>
    </div>
  );
}

// Additional step implementations for other flows
function WhatsNewStep({ onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Welcome Back! Here&apos;s What&apos;s New</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
          <div>
            <h4 className="font-medium">Enhanced AI Models</h4>
            <p className="text-sm text-muted-foreground">
              Now powered by Llama 3.1 for better content generation
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
          <div>
            <h4 className="font-medium">New Templates</h4>
            <p className="text-sm text-muted-foreground">
              5 new industry-specific templates added
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureHighlightsStep({ onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Features you might not have discovered yet:
      </p>
      <div className="grid gap-3">
        <Card className="p-3">
          <h4 className="font-medium text-sm">Quick Share Links</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Generate temporary preview links
          </p>
        </Card>
        <Card className="p-3">
          <h4 className="font-medium text-sm">Export to PDF</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Download your portfolio as a PDF resume
          </p>
        </Card>
      </div>
    </div>
  );
}

function ImportReviewStep({ onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Import Successful!</h3>
        <p className="text-muted-foreground">
          We&apos;ve imported your data. Let&apos;s review and enhance it.
        </p>
      </div>
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">What we imported:</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>✓ Professional experience</li>
          <li>✓ Education history</li>
          <li>✓ Skills and expertise</li>
          <li>✓ Contact information</li>
        </ul>
      </div>
    </div>
  );
}

function EnhanceImportedStep({ onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Let&apos;s use AI to enhance your imported content and make it shine.
      </p>
      <div className="space-y-3">
        <Card className="p-4 border-green-500/20 bg-green-500/5">
          <h4 className="font-medium text-green-700 dark:text-green-400">
            Recommended
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            AI can improve your descriptions by 40% on average
          </p>
        </Card>
      </div>
    </div>
  );
}

function CustomizeImportedStep({ onComplete: _onComplete }: StepComponentProps) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Choose a template that best showcases your experience.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center hover:border-primary cursor-pointer">
          <div className="text-xs font-medium text-primary mb-1">Executive</div>
          <div className="text-xs text-muted-foreground">
            Clean & Professional
          </div>
        </Card>
        <Card className="p-4 text-center hover:border-primary cursor-pointer">
          <div className="text-xs font-medium text-primary mb-1">Creative</div>
          <div className="text-xs text-muted-foreground">Bold & Modern</div>
        </Card>
      </div>
    </div>
  );
}

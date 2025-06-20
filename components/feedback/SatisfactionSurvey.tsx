'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ThumbsUp, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createFeedbackSystem } from '@/lib/feedback/feedback-system';
import type { UserSatisfactionSurvey } from '@/lib/feedback/feedback-system';

interface SatisfactionSurveyProps {
  userId: string;
  trigger:
    | 'portfolio_created'
    | 'portfolio_published'
    | 'weekly_active'
    | 'before_churn';
  onComplete?: () => void;
  onSkip?: () => void;
}

/**
 * User satisfaction survey component for beta users
 */
export function SatisfactionSurvey({
  userId,
  trigger: _trigger,
  onComplete,
  onSkip,
}: SatisfactionSurveyProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyData, setSurveyData] = useState<Partial<UserSatisfactionSurvey>>(
    {
      userId,
      overallSatisfaction: 0,
      easeOfUse: 0,
      performance: 0,
      features: 0,
      design: 0,
      likelihood_to_recommend: 0,
      mostUsefulFeature: '',
      leastUsefulFeature: '',
      missingFeatures: [],
      additionalComments: '',
    }
  );

  const feedbackSystem = createFeedbackSystem();
  const startTime = Date.now();

  const steps = [
    {
      title: 'Overall Experience',
      description: 'How satisfied are you with PRISMA Portfolio Builder?',
      field: 'overallSatisfaction' as const,
      scale: '1 = Very Dissatisfied, 10 = Very Satisfied',
    },
    {
      title: 'Ease of Use',
      description: 'How easy is it to create and edit your portfolio?',
      field: 'easeOfUse' as const,
      scale: '1 = Very Difficult, 10 = Very Easy',
    },
    {
      title: 'Performance',
      description: 'How satisfied are you with the speed and performance?',
      field: 'performance' as const,
      scale: '1 = Very Slow, 10 = Very Fast',
    },
    {
      title: 'Features',
      description: 'How do you rate the available features?',
      field: 'features' as const,
      scale: '1 = Poor, 10 = Excellent',
    },
    {
      title: 'Design',
      description: 'How do you rate the visual design and user interface?',
      field: 'design' as const,
      scale: '1 = Poor, 10 = Excellent',
    },
    {
      title: 'Recommendation',
      description:
        'How likely are you to recommend us to a friend or colleague?',
      field: 'likelihood_to_recommend' as const,
      scale: '1 = Not at all likely, 10 = Extremely likely',
    },
  ];

  const totalSteps = steps.length + 2; // +2 for features and comments steps
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleRatingChange = (
    field: keyof UserSatisfactionSurvey,
    rating: number
  ) => {
    setSurveyData(prev => ({ ...prev, [field]: rating }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length - 1) {
      // Move to features step
      setCurrentStep(currentStep + 1);
    } else if (currentStep === steps.length) {
      // Move to comments step
      setCurrentStep(currentStep + 1);
    } else {
      // Submit survey
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const completedIn = Math.round((Date.now() - startTime) / 1000);

      const surveyEntry = {
        ...surveyData,
        completedIn,
      } as Omit<UserSatisfactionSurvey, 'id' | 'timestamp'>;

      await feedbackSystem.submitSurvey(surveyEntry);

      toast({
        title: 'Survey Submitted',
        description: 'Thank you for your valuable feedback!',
      });

      onComplete?.();
    } catch (_error) {
      toast({
        title: 'Submission Failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRatingScale = (
    currentRating: number,
    field: keyof UserSatisfactionSurvey
  ) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
            <button
              key={rating}
              onClick={() => handleRatingChange(field, rating)}
              className={cn(
                'w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center font-medium',
                currentRating === rating
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border hover:border-primary/50 hover:bg-primary/10'
              )}
            >
              {rating}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Not at all</span>
          <span>Extremely</span>
        </div>
      </div>
    );
  };

  const features = [
    'Portfolio Editor',
    'AI Content Enhancement',
    'Template Selection',
    'Drag & Drop Interface',
    'Real-time Preview',
    'Publishing System',
    'Subdomain Setup',
    'Mobile Responsiveness',
    'Performance Speed',
    'Analytics Dashboard',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Help Us Improve
              </CardTitle>
              <CardDescription>
                Your feedback shapes the future of PRISMA Portfolio Builder
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Rating Steps */}
          {currentStep < steps.length && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">
                  {steps[currentStep]?.title}
                </h3>
                <p className="text-muted-foreground">
                  {steps[currentStep]?.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  {steps[currentStep]?.scale}
                </p>
              </div>

              {steps[currentStep] &&
                renderRatingScale(
                  (surveyData[steps[currentStep].field] as number) || 0,
                  steps[currentStep].field
                )}
            </div>
          )}

          {/* Features Step */}
          {currentStep === steps.length && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Feature Feedback</h3>
                <p className="text-muted-foreground">
                  Help us understand which features matter most to you
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">
                    Which feature do you find most useful?
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {features.map(feature => (
                      <button
                        key={feature}
                        onClick={() =>
                          setSurveyData(prev => ({
                            ...prev,
                            mostUsefulFeature: feature,
                          }))
                        }
                        className={cn(
                          'p-3 text-left rounded-lg border transition-colors',
                          surveyData.mostUsefulFeature === feature
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <span className="text-sm">{feature}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">
                    Which feature needs the most improvement?
                  </Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {features.map(feature => (
                      <button
                        key={feature}
                        onClick={() =>
                          setSurveyData(prev => ({
                            ...prev,
                            leastUsefulFeature: feature,
                          }))
                        }
                        className={cn(
                          'p-3 text-left rounded-lg border transition-colors',
                          surveyData.leastUsefulFeature === feature
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'border-border hover:border-orange-500/50'
                        )}
                      >
                        <span className="text-sm">{feature}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Comments Step */}
          {currentStep === steps.length + 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">Final Thoughts</h3>
                <p className="text-muted-foreground">
                  Any additional comments or suggestions?
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="missing-features">
                    What features are you missing? (Optional)
                  </Label>
                  <Textarea
                    id="missing-features"
                    placeholder="e.g., Custom themes, Better mobile editor, Video backgrounds..."
                    value={surveyData.missingFeatures?.join(', ') || ''}
                    onChange={e =>
                      setSurveyData(prev => ({
                        ...prev,
                        missingFeatures: e.target.value
                          .split(',&apos;)
                          .map(f => f.trim())
                          .filter(Boolean),
                      }))
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="comments">
                    Additional comments (Optional)
                  </Label>
                  <Textarea
                    id="comments"
                    placeholder="Share any other thoughts, suggestions, or experiences..."
                    value={surveyData.additionalComments || &apos;'}
                    onChange={e =>
                      setSurveyData(prev => ({
                        ...prev,
                        additionalComments: e.target.value,
                      }))
                    }
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-6 border-t">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
                className="flex-1"
              >
                Previous
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={
                isSubmitting ||
                (currentStep < steps.length &&
                  steps[currentStep] &&
                  !surveyData[steps[currentStep].field])
              }
              className="flex-1"
            >
              {isSubmitting
                ? 'Submitting...'
                : currentStep === totalSteps - 1
                  ? 'Submit Survey'
                  : 'Next'}
            </Button>

            {currentStep === 0 && (
              <Button variant="ghost" onClick={onSkip} disabled={isSubmitting}>
                Skip Survey
              </Button>
            )}
          </div>

          {/* NPS Indicator */}
          {currentStep === steps.length - 1 &&
            surveyData.likelihood_to_recommend && (
              <div className="text-center pt-4 border-t">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm">
                    {surveyData.likelihood_to_recommend >= 9
                      ? 'Promoter'
                      : surveyData.likelihood_to_recommend >= 7
                        ? 'Passive'
                        : 'Detractor'}
                  </span>
                </div>
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

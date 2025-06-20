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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  MessageSquare,
  X,
  Star,
  Bug,
  Lightbulb,
  Zap,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createFeedbackSystem } from '@/lib/feedback/feedback-system';
import type { FeedbackEntry } from '@/lib/feedback/feedback-system';

interface FeedbackWidgetProps {
  userId: string;
  userContext?: {
    plan: string;
    accountAge: number;
    portfoliosCreated: number;
    lastActivity: Date;
  };
  onClose?: () => void;
  trigger?: 'manual' | 'auto' | 'error' | 'completion';
}

/**
 * Feedback collection widget for beta users
 */
export function FeedbackWidget({
  userId,
  userContext,
  onClose,
}: FeedbackWidgetProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'type' | 'details' | 'rating' | 'success'>(
    'type'
  );
  const [feedbackData, setFeedbackData] = useState<Partial<FeedbackEntry>>({
    userId,
    userContext,
    tags: [],
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  const feedbackSystem = createFeedbackSystem();

  const feedbackTypes = [
    {
      type: 'bug' as const,
      icon: Bug,
      title: 'Report a Bug',
      description: "Something isn't working correctly",
      color: 'text-red-500 bg-red-50 border-red-200',
    },
    {
      type: 'feature_request' as const,
      icon: Lightbulb,
      title: 'Suggest a Feature',
      description: 'I have an idea for improvement',
      color: 'text-blue-500 bg-blue-50 border-blue-200',
    },
    {
      type: 'improvement' as const,
      icon: Zap,
      title: 'Suggest Improvement',
      description: 'How we can make this better',
      color: 'text-green-500 bg-green-50 border-green-200',
    },
    {
      type: 'general' as const,
      icon: MessageCircle,
      title: 'General Feedback',
      description: 'Share your thoughts',
      color: 'text-purple-500 bg-purple-50 border-purple-200',
    },
  ];

  const handleTypeSelect = (type: FeedbackEntry['type']) => {
    setFeedbackData(prev => ({ ...prev, type }));
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!feedbackData.title || !feedbackData.description) {
      toast({
        title: 'Missing Information',
        description: 'Please provide both a title and description.',
        variant: 'destructive',
      });
      return;
    }
    setStep('rating');
  };

  const handleRatingSubmit = async () => {
    setIsSubmitting(true);

    try {
      const feedbackEntry = {
        ...feedbackData,
        severity: feedbackData.severity || 'medium',
        category: feedbackData.category || 'general',
        tags: feedbackData.tags || [],
      } as Omit<FeedbackEntry, 'id' | 'timestamp' | 'status'>;

      await feedbackSystem.submitFeedback(feedbackEntry);

      setStep('success');

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for helping us improve!',
      });

      // Auto-close after success
      setTimeout(() => {
        setIsOpen(false);
        onClose?.();
      }, 2000);
    } catch (_error) {
      toast({
        title: 'Submission Failed',
        description: 'Please try again or contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (
    rating: number,
    onRate: (rating: number) => void
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onRate(star)}
            className={cn(
              'transition-colors',
              star <= rating
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400'
            )}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-12 w-12 shadow-lg"
          size="icon"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">Share Your Feedback</CardTitle>
              <CardDescription>Help us improve your experience</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                onClose?.();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {step === 'type' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                What would you like to share with us?
              </p>
              {feedbackTypes.map(feedbackType => {
                const Icon = feedbackType.icon;
                return (
                  <button
                    key={feedbackType.type}
                    onClick={() => handleTypeSelect(feedbackType.type)}
                    className={cn(
                      'w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md',
                      feedbackType.color
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5" />
                      <div>
                        <h4 className="font-medium">{feedbackType.title}</h4>
                        <p className="text-sm opacity-80">
                          {feedbackType.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">
                  {feedbackTypes.find(t => t.type === feedbackData.type)?.title}
                </Badge>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your feedback"
                  value={feedbackData.title || ''}
                  onChange={e =>
                    setFeedbackData(prev => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Please provide details..."
                  rows={4}
                  value={feedbackData.description || ''}
                  onChange={e =>
                    setFeedbackData(prev => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              {feedbackData.type === 'bug' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="severity">Severity</Label>
                    <Select
                      value={feedbackData.severity || 'medium'}
                      onValueChange={(value: FeedbackEntry['severity']) =>
                        setFeedbackData(prev => ({ ...prev, severity: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Minor issue</SelectItem>
                        <SelectItem value="medium">
                          Medium - Affects workflow
                        </SelectItem>
                        <SelectItem value="high">
                          High - Major problem
                        </SelectItem>
                        <SelectItem value="critical">
                          Critical - Blocks usage
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="steps">Steps to Reproduce (Optional)</Label>
                    <Textarea
                      id="steps"
                      placeholder="1. Click on...&#10;2. Then...&#10;3. Error occurs"
                      rows={3}
                      value={feedbackData.reproductionSteps?.join('\n') || ''}
                      onChange={e =>
                        setFeedbackData(prev => ({
                          ...prev,
                          reproductionSteps: e.target.value
                            .split('\n')
                            .filter(Boolean),
                        }))
                      }
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={feedbackData.category || 'general'}
                  onValueChange={(value: string) =>
                    setFeedbackData(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portfolio_editor">
                      Portfolio Editor
                    </SelectItem>
                    <SelectItem value="templates">Templates</SelectItem>
                    <SelectItem value="ai_features">AI Features</SelectItem>
                    <SelectItem value="publishing">Publishing</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="mobile">Mobile Experience</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep('type')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button onClick={handleDetailsSubmit} className="flex-1">
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 'rating' && (
            <div className="space-y-6 text-center">
              <div>
                <h4 className="font-medium mb-2">
                  How would you rate your overall experience?
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  This helps us understand the impact
                </p>
                {renderStarRating(feedbackData.rating || 0, rating =>
                  setFeedbackData(prev => ({ ...prev, rating }))
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('details')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleRatingSubmit}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <div className="text-green-500 mb-4">
                <MessageSquare className="h-12 w-12 mx-auto" />
              </div>
              <h4 className="font-medium mb-2">Thank you!</h4>
              <p className="text-sm text-muted-foreground">
                Your feedback helps us build a better product for everyone.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Feedback trigger component for specific contexts
 */
export function FeedbackTrigger({
  children,
  userId,
  userContext,
  trigger,
}: {
  children: React.ReactNode;
  userId: string;
  userContext?: FeedbackWidgetProps['userContext'];
  trigger: 'error' | 'completion' | 'manual';
}) {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <div onClick={() => setShowFeedback(true)}>{children}</div>
      {showFeedback && (
        <FeedbackWidget
          userId={userId}
          userContext={userContext}
          trigger={trigger}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
}

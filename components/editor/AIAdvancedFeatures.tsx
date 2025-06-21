'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sparkles,
  Palette,
  Target,
  Briefcase,
  Search,
  TrendingUp,
  Brain,
  Loader,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/store/auth-store';
import { useAIStore } from '@/lib/store/ai-store';
import { logger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';

interface TemplateRecommendation {
  template: string;
  confidence: number;
  reasoning: string;
}

interface SkillSuggestion {
  skill: string;
  relevance: number;
  trending: boolean;
}

export function AIAdvancedFeatures({ portfolioId }: { portfolioId: string }) {
  const { user } = useAuthStore();
  const { selectedModel, updateModelSelection } = useAIStore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('template');

  // Template recommendation state
  const [userProfile, setUserProfile] = useState('');
  const [templateRecommendations, setTemplateRecommendations] = useState<
    TemplateRecommendation[]
  >([]);

  // Skill suggestions state
  const [currentSkills, setCurrentSkills] = useState('');
  const [skillSuggestions, setSkillSuggestions] = useState<SkillSuggestion[]>(
    []
  );

  // Competitor analysis state
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [competitorInsights, setCompetitorInsights] = useState<string>('');

  const handleTemplateRecommendation = async () => {
    if (!userProfile.trim()) {
      toast({
        title: 'Profile Required',
        description: 'Please describe your professional background',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading('template');
    try {
      const response = await fetch('/api/v1/ai/recommend-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'anonymous',
        },
        body: JSON.stringify({
          userProfile,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      const data = await response.json();
      setTemplateRecommendations(data.recommendations);

      logger.info('Template recommendations received', {
        userId: user?.id,
        portfolioId,
        recommendationCount: data.recommendations.length,
        feature: 'ai_advanced',
      });

      toast({
        title: 'Recommendations Ready',
        description: `Found ${data.recommendations.length} templates that match your profile`,
      });
    } catch (error) {
      logger.error('Template recommendation failed', error as Error, {
        userId: user?.id,
        feature: 'ai_advanced',
      });
      toast({
        title: 'Recommendation Failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSkillSuggestions = async () => {
    if (!currentSkills.trim()) {
      toast({
        title: 'Skills Required',
        description: 'Please enter your current skills',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading('skills');
    try {
      const response = await fetch('/api/v1/ai/suggest-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'anonymous',
        },
        body: JSON.stringify({
          currentSkills: currentSkills.split(',').map(s => s.trim()),
          industry: 'technology', // Could be dynamic
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get skill suggestions');
      }

      const data = await response.json();
      setSkillSuggestions(data.suggestions);

      toast({
        title: 'Skill Analysis Complete',
        description: `Found ${data.suggestions.length} relevant skills to add`,
      });
    } catch (error) {
      logger.error('Skill suggestion failed', error as Error, {
        userId: user?.id,
        feature: 'ai_advanced',
      });
      toast({
        title: 'Analysis Failed',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleCompetitorAnalysis = async () => {
    if (!competitorUrl.trim()) {
      toast({
        title: 'URL Required',
        description: 'Please enter a competitor portfolio URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading('competitor');
    try {
      const response = await fetch('/api/v1/ai/analyze-competitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'anonymous',
        },
        body: JSON.stringify({
          url: competitorUrl,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze competitor');
      }

      const data = await response.json();
      setCompetitorInsights(data.insights);

      toast({
        title: 'Analysis Complete',
        description: 'Competitor insights are ready',
      });
    } catch (error) {
      logger.error('Competitor analysis failed', error as Error, {
        userId: user?.id,
        feature: 'ai_advanced',
      });
      toast({
        title: 'Analysis Failed',
        description: 'Please check the URL and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle>AI Advanced Features</CardTitle>
          </div>
          <Badge variant="outline">Beta</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="template">
              <Palette className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Target className="h-4 w-4 mr-2" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="competitor">
              <Search className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="template" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">AI Template Recommendation</h4>
              <p className="text-sm text-muted-foreground">
                Get personalized template recommendations based on your industry
                and experience
              </p>
              <Textarea
                placeholder="Describe your professional background (e.g., 'Senior software engineer with 8 years experience in fintech, focusing on React and Node.js')"
                value={userProfile}
                onChange={e => setUserProfile(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleTemplateRecommendation}
                disabled={isLoading === 'template'}
                className="w-full"
              >
                {isLoading === 'template' ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Template Recommendations
                  </>
                )}
              </Button>
            </div>

            {templateRecommendations.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-sm">Recommended Templates</h5>
                {templateRecommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-2 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h6 className="font-medium capitalize">{rec.template}</h6>
                      <div className="flex items-center gap-2">
                        <Progress value={rec.confidence} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {rec.confidence}% match
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {rec.reasoning}
                    </p>
                    <Button size="sm" variant="outline">
                      Preview Template
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="skills" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">AI Skill Suggestions</h4>
              <p className="text-sm text-muted-foreground">
                Discover in-demand skills based on your current expertise
              </p>
              <Textarea
                placeholder="Enter your current skills separated by commas (e.g., React, TypeScript, Node.js, AWS)"
                value={currentSkills}
                onChange={e => setCurrentSkills(e.target.value)}
                rows={2}
              />
              <Button
                onClick={handleSkillSuggestions}
                disabled={isLoading === 'skills'}
                className="w-full"
              >
                {isLoading === 'skills' ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Skills...
                  </>
                ) : (
                  <>
                    <Target className="mr-2 h-4 w-4" />
                    Get Skill Suggestions
                  </>
                )}
              </Button>
            </div>

            {skillSuggestions.length > 0 && (
              <div className="space-y-3">
                <h5 className="font-medium text-sm">Suggested Skills to Add</h5>
                <div className="flex flex-wrap gap-2">
                  {skillSuggestions.map((skill, index) => (
                    <div
                      key={index}
                      className={cn(
                        'px-3 py-1.5 rounded-full border text-sm flex items-center gap-1',
                        skill.trending
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-border'
                      )}
                    >
                      {skill.skill}
                      {skill.trending && (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      )}
                      <span className="text-xs text-muted-foreground ml-1">
                        {skill.relevance}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="competitor" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Competitor Analysis</h4>
              <p className="text-sm text-muted-foreground">
                Analyze successful portfolios in your field for insights
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/portfolio"
                  value={competitorUrl}
                  onChange={e => setCompetitorUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md"
                />
                <Button
                  onClick={handleCompetitorAnalysis}
                  disabled={isLoading === 'competitor'}
                >
                  {isLoading === 'competitor' ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {competitorInsights && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Competitor Insights
                </h5>
                <p className="text-sm whitespace-pre-wrap">
                  {competitorInsights}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Model Selection */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI Model</span>
            <Select
              value={selectedModel}
              onValueChange={value => updateModelSelection('general', value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meta-llama/Llama-3.1-8B-Instruct">
                  Llama 3.1 (Fast)
                </SelectItem>
                <SelectItem value="microsoft/Phi-3.5-mini-instruct">
                  Phi 3.5 (Efficient)
                </SelectItem>
                <SelectItem value="mistralai/Mistral-7B-Instruct-v0.3">
                  Mistral 7B (Balanced)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

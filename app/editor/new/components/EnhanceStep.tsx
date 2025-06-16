'use client';

import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface EnhanceStepProps {
  isCreating: boolean;
  onCreate: () => void;
  onBack: () => void;
  t: any; // Translation object
}

export function EnhanceStep({
  isCreating,
  onCreate,
  onBack,
  t,
}: EnhanceStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t.enhanceWithAI || 'Enhance with AI'}
        </h2>
        <p className="text-muted-foreground">
          {t.enhanceDescription ||
            'Let our AI help you create compelling content'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>
                {t.aiContentEnhancement || 'AI Content Enhancement'}
              </CardTitle>
              <CardDescription>
                {t.aiEnhancementDescription ||
                  'Automatically improve your bio, project descriptions, and more'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Wand2 className="h-4 w-4 text-primary" />
              <span>
                {t.professionalBioWriting || 'Professional bio writing'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wand2 className="h-4 w-4 text-primary" />
              <span>
                {t.projectDescriptionOptimization ||
                  'Project description optimization'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wand2 className="h-4 w-4 text-primary" />
              <span>
                {t.skillsExtraction || 'Skills extraction and highlighting'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wand2 className="h-4 w-4 text-primary" />
              <span>
                {t.achievementHighlighting || 'Achievement highlighting'}
              </span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-center">
              {t.aiEnhancementNote ||
                'You can always edit and customize the AI-generated content'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t.back || 'Back'}
        </Button>
        <Button onClick={onCreate} disabled={isCreating} className="flex-1">
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

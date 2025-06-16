'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormDataType {
  name: string;
  title: string;
  bio: string;
}

interface BasicInfoStepProps {
  formData: FormDataType;
  updateFormData: (data: Partial<FormDataType>) => void;
  onNext: () => void;
  t: any; // Translation object
}

export function BasicInfoStep({
  formData,
  updateFormData,
  onNext,
  t,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t.letsGetStarted || "Let's get started"}
        </h2>
        <p className="text-muted-foreground">
          {t.basicInfoDescription ||
            'Tell us a bit about yourself and your portfolio'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">{t.portfolioName || 'Portfolio Name'}</Label>
          <Input
            id="name"
            placeholder={
              t.portfolioNamePlaceholder || 'My Professional Portfolio'
            }
            value={formData.name}
            onChange={e => updateFormData({ name: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="title">
            {t.yourTitle || 'Your Professional Title'}
          </Label>
          <Input
            id="title"
            placeholder={t.titlePlaceholder || 'Senior Software Engineer'}
            value={formData.title}
            onChange={e => updateFormData({ title: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="bio">{t.shortBio || 'Short Bio'}</Label>
          <Textarea
            id="bio"
            placeholder={
              t.bioPlaceholder ||
              'Tell us about your experience and what makes you unique...'
            }
            value={formData.bio}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              updateFormData({ bio: e.target.value })
            }
            className="mt-1"
            rows={4}
          />
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={!formData.name || !formData.title}
        className="w-full"
      >
        {t.continueButton || 'Continue'}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
}

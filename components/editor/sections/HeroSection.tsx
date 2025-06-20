'use client';

import { MapPin, Globe, Twitter, Linkedin, Github } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioStore } from '@/lib/store/portfolio-store';

interface HeroSectionProps {
  data: {
    name?: string;
    title?: string;
    bio?: string;
    location?: string;
    avatarUrl?: string;
    headline?: string;
    tagline?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
      website?: string;
    };
  };
  onUpdate: (updates: unknown) => void;
}

export function HeroSection({ data = {}, onUpdate }: HeroSectionProps) {
  const { t } = useLanguage();
  const { currentPortfolio } = usePortfolioStore();

  const handleFieldUpdate = (field: string, value: unknown) => {
    if (field.includes('.')) {
      // Handle nested fields like social.twitter
      const parts = field.split('.');
      const parent = parts[0];
      const child = parts[1];

      if (parent === 'social' && child) {
        onUpdate({
          social: {
            ...data.social,
            [child]: value,
          },
        });
      }
    } else {
      onUpdate({ [field]: value });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {t.heroSection || 'Hero Section'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t.heroDescription ||
            'Your main introduction and contact information'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t.basicInfo || 'Basic Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-6">
            <div>
              <Label>{t.profilePicture || 'Profile Picture'}</Label>
              <ImageUpload
                value={data.avatarUrl}
                onChange={url => handleFieldUpdate('avatarUrl', url)}
                type="avatar"
                portfolioId={currentPortfolio?.id || '&apos;}
                aspectRatio="square"
                className="mt-2 w-32 h-32"
              />
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="name">{t.fullName || 'Full Name'} *</Label>
                <Input
                  id="name"
                  value={data.name || ''}
                  onChange={e => handleFieldUpdate('name', e.target.value)}
                  placeholder={t.namePlaceholder || 'John Doe'}
                />
              </div>

              <div>
                <Label htmlFor="title">
                  {t.professionalTitle || 'Professional Title'} *
                </Label>
                <Input
                  id="title"
                  value={data.title || ''}
                  onChange={e => handleFieldUpdate('title', e.target.value)}
                  placeholder={t.titlePlaceholder || 'Senior Software Engineer'}
                />
              </div>

              <div>
                <Label htmlFor="location">{t.location || 'Location'}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={data.location || ''}
                    onChange={e =>
                      handleFieldUpdate('location', e.target.value)
                    }
                    placeholder={t.locationPlaceholder || 'San Francisco, CA'}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="headline">{t.headline || 'Headline'}</Label>
            <Input
              id="headline"
              value={data.headline || ''}
              onChange={e => handleFieldUpdate('headline', e.target.value)}
              placeholder={
                t.headlinePlaceholder ||
                'Building amazing products that users love'
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t.headlineHint ||
                'A short, impactful statement about what you do'}
            </p>
          </div>

          <div>
            <Label htmlFor="tagline">{t.tagline || 'Tagline'}</Label>
            <Input
              id="tagline"
              value={data.tagline || ''}
              onChange={e => handleFieldUpdate('tagline', e.target.value)}
              placeholder={
                t.taglinePlaceholder ||
                'Full-stack developer • Open source enthusiast • Coffee lover'
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t.taglineHint ||
                'Keywords or phrases that describe you (use • to separate)'}
            </p>
          </div>

          <div>
            <Label htmlFor="bio">{t.bio || 'Bio / About'} *</Label>
            <Textarea
              id="bio"
              value={data.bio || ''}
              onChange={e => handleFieldUpdate('bio', e.target.value)}
              placeholder={
                t.bioPlaceholder || 'Tell your professional story...'
              }
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {data.bio?.length || 0}/500 {t.characters || 'characters'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t.socialLinks || 'Social Links'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="website">{t.website || 'Website'}</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                type="url"
                value={data.social?.website || ''}
                onChange={e =>
                  handleFieldUpdate('social.website', e.target.value)
                }
                placeholder="https://yourwebsite.com"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="linkedin">{t.linkedin || 'LinkedIn'}</Label>
            <div className="relative">
              <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="linkedin"
                value={data.social?.linkedin || ''}
                onChange={e =>
                  handleFieldUpdate('social.linkedin', e.target.value)
                }
                placeholder="https://linkedin.com/in/username"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="github">{t.github || 'GitHub'}</Label>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="github"
                value={data.social?.github || ''}
                onChange={e =>
                  handleFieldUpdate('social.github', e.target.value)
                }
                placeholder="https://github.com/username"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="twitter">{t.twitter || 'Twitter/X'}</Label>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="twitter"
                value={data.social?.twitter || ''}
                onChange={e =>
                  handleFieldUpdate('social.twitter', e.target.value)
                }
                placeholder="https://twitter.com/username"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

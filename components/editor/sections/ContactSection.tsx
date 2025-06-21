'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Youtube,
  Link,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { ContactInfo, SocialLinks } from '@/types/portfolio';

interface ContactSectionProps {
  contact: ContactInfo;
  social: SocialLinks;
  onUpdate: (data: { contact?: ContactInfo; social?: SocialLinks }) => void;
}

const SOCIAL_PLATFORMS = [
  {
    key: 'linkedin' as keyof SocialLinks,
    label: 'LinkedIn',
    icon: Linkedin,
    placeholder: 'https://linkedin.com/in/yourname',
    color: 'text-[#0077B5]',
  },
  {
    key: 'github' as keyof SocialLinks,
    label: 'GitHub',
    icon: Github,
    placeholder: 'https://github.com/yourname',
    color: 'text-gray-900',
  },
  {
    key: 'twitter' as keyof SocialLinks,
    label: 'Twitter',
    icon: Twitter,
    placeholder: 'https://twitter.com/yourname',
    color: 'text-[#1DA1F2]',
  },
  {
    key: 'instagram' as keyof SocialLinks,
    label: 'Instagram',
    icon: Instagram,
    placeholder: 'https://instagram.com/yourname',
    color: 'text-[#E4405F]',
  },
  {
    key: 'youtube' as keyof SocialLinks,
    label: 'YouTube',
    icon: Youtube,
    placeholder: 'https://youtube.com/@yourname',
    color: 'text-[#FF0000]',
  },
  {
    key: 'website' as keyof SocialLinks,
    label: 'Website',
    icon: Globe,
    placeholder: 'https://yourwebsite.com',
    color: 'text-blue-600',
  },
  {
    key: 'dribbble' as keyof SocialLinks,
    label: 'Dribbble',
    icon: Globe,
    placeholder: 'https://dribbble.com/yourname',
    color: 'text-[#EA4C89]',
  },
  {
    key: 'behance' as keyof SocialLinks,
    label: 'Behance',
    icon: Globe,
    placeholder: 'https://behance.net/yourname',
    color: 'text-[#1769FF]',
  },
];

// eslint-disable-next-line complexity
export function ContactSection({
  contact = {},
  social = {},
  onUpdate,
}: ContactSectionProps) {
  const { t } = useLanguage();
  const [showCustomLink, setShowCustomLink] = useState(false);
  const [customLink, setCustomLink] = useState({ label: '', url: '' });
  const [contactVisibility, setContactVisibility] = useState({
    email: true,
    phone: true,
    location: true,
  });

  const handleContactChange = (field: keyof ContactInfo, value: string) => {
    onUpdate({
      contact: {
        ...contact,
        [field]: value,
      },
    });
  };

  const handleSocialChange = (platform: keyof SocialLinks, value: string) => {
    onUpdate({
      social: {
        ...social,
        [platform]: value || undefined,
      },
    });
  };

  const handleAddCustomLink = () => {
    if (!customLink.label || !customLink.url) return;

    const customLinks = social.custom || [];
    onUpdate({
      social: {
        ...social,
        custom: [...customLinks, { ...customLink }],
      },
    });
    setCustomLink({ label: '', url: '' });
    setShowCustomLink(false);
  };

  const handleRemoveCustomLink = (index: number) => {
    const customLinks = social.custom || [];
    onUpdate({
      social: {
        ...social,
        custom: customLinks.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">
          {t.contactInformation || 'Contact Information'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t.contactDescription || 'How people can reach you'}
        </p>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t.contactDetails || 'Contact Details'}
          </CardTitle>
          <CardDescription>
            {t.contactDetailsDescription ||
              'Your professional contact information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t.email || 'Email'}
              </Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="showEmail" className="text-sm font-normal">
                  {t.showOnPortfolio || 'Show on portfolio'}
                </Label>
                <Switch
                  id="showEmail"
                  checked={contactVisibility.email}
                  onCheckedChange={checked =>
                    setContactVisibility({
                      ...contactVisibility,
                      email: checked,
                    })
                  }
                />
              </div>
            </div>
            <Input
              id="email"
              type="email"
              value={contact.email || ''}
              onChange={e => handleContactChange('email', e.target.value)}
              placeholder={t.emailPlaceholder || 'your@email.com'}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t.phone || 'Phone'}
              </Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="showPhone" className="text-sm font-normal">
                  {t.showOnPortfolio || 'Show on portfolio'}
                </Label>
                <Switch
                  id="showPhone"
                  checked={contactVisibility.phone}
                  onCheckedChange={checked =>
                    setContactVisibility({
                      ...contactVisibility,
                      phone: checked,
                    })
                  }
                />
              </div>
            </div>
            <Input
              id="phone"
              type="tel"
              value={contact.phone || ''}
              onChange={e => handleContactChange('phone', e.target.value)}
              placeholder={t.phonePlaceholder || '+1 (555) 123-4567'}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t.location || 'Location'}
              </Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="showLocation" className="text-sm font-normal">
                  {t.showOnPortfolio || 'Show on portfolio'}
                </Label>
                <Switch
                  id="showLocation"
                  checked={contactVisibility.location}
                  onCheckedChange={checked =>
                    setContactVisibility({
                      ...contactVisibility,
                      location: checked,
                    })
                  }
                />
              </div>
            </div>
            <Input
              id="location"
              value={contact.location || ''}
              onChange={e => handleContactChange('location', e.target.value)}
              placeholder={t.locationPlaceholder || 'San Francisco, CA'}
            />
          </div>

          <div>
            <Label htmlFor="availability" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t.availability || 'Availability'}
            </Label>
            <Input
              id="availability"
              value={contact.availability || ''}
              onChange={e =>
                handleContactChange('availability', e.target.value)
              }
              placeholder={
                t.availabilityPlaceholder || 'Available for freelance work'
              }
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {t.socialLinks || 'Social Links'}
          </CardTitle>
          <CardDescription>
            {t.socialLinksDescription || 'Connect your social media profiles'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {SOCIAL_PLATFORMS.map(platform => {
            const Icon = platform.icon;
            return (
              <div key={platform.key}>
                <Label
                  htmlFor={platform.key}
                  className="flex items-center gap-2 mb-2"
                >
                  <Icon className={`h-4 w-4 ${platform.color}`} />
                  {platform.label}
                </Label>
                <Input
                  id={platform.key}
                  type="url"
                  value={(social[platform.key] as string) || ''}
                  onChange={e =>
                    handleSocialChange(platform.key, e.target.value)
                  }
                  placeholder={platform.placeholder}
                />
              </div>
            );
          })}

          {/* Custom Links */}
          {social.custom && social.custom.length > 0 && (
            <div className="space-y-3 pt-4 border-t">
              <Label>{t.customLinks || 'Custom Links'}</Label>
              {social.custom.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Link className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{link.label}:</span>
                  <span className="text-sm text-muted-foreground flex-1 truncate">
                    {link.url}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCustomLink(index)}
                  >
                    {t.remove || 'Remove'}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Custom Link */}
          {showCustomLink ? (
            <div className="space-y-3 pt-4 border-t">
              <Label>{t.addCustomLink || 'Add Custom Link'}</Label>
              <div className="grid gap-3">
                <Input
                  placeholder={t.linkLabel || 'Link Label'}
                  value={customLink.label}
                  onChange={e =>
                    setCustomLink({ ...customLink, label: e.target.value })
                  }
                />
                <Input
                  type="url"
                  placeholder={t.linkUrl || 'https://...'}
                  value={customLink.url}
                  onChange={e =>
                    setCustomLink({ ...customLink, url: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddCustomLink}
                    disabled={!customLink.label || !customLink.url}
                  >
                    {t.add || 'Add'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowCustomLink(false);
                      setCustomLink({ label: '', url: '' });
                    }}
                  >
                    {t.cancel || 'Cancel'}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomLink(true)}
              className="w-full"
            >
              <Link className="h-4 w-4 mr-2" />
              {t.addCustomLink || 'Add Custom Link'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">
            <strong>{t.privacyNote || 'Privacy Note'}:</strong>{' '}
            {t.contactPrivacyMessage ||
              'Only the information you mark as visible will be displayed on your public portfolio. Email addresses can be protected with a contact form.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

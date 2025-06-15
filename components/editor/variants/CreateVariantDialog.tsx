'use client';

import { useState } from 'react';
import {
  Briefcase,
  Users,
  DollarSign,
  Mic,
  UserCheck,
  Globe,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/lib/i18n/refactored-context';
import { usePortfolioVariantsStore } from '@/lib/store/portfolio-variants-store';
import { useToast } from '@/hooks/use-toast';
import type {
  AudienceType,
  CreateVariantInput,
  PortfolioVariant,
} from '@/types/portfolio-variants';
import { trackVariantCreated } from '@/lib/analytics/posthog/events';

interface CreateVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId: string;
  basedOnVariantId?: string | null;
  onCreated?: (variant: PortfolioVariant) => void;
}

const audienceTypes: Array<{
  value: AudienceType;
  label: string;
  icon: any;
  description: string;
}> = [
  {
    value: 'recruiter',
    label: 'Recruiter',
    icon: Briefcase,
    description: 'HR professionals and talent acquisition specialists',
  },
  {
    value: 'hiring-manager',
    label: 'Hiring Manager',
    icon: UserCheck,
    description: 'Direct supervisors and team leads',
  },
  {
    value: 'client',
    label: 'Client',
    icon: Users,
    description: 'Potential clients for freelance or consulting work',
  },
  {
    value: 'investor',
    label: 'Investor',
    icon: DollarSign,
    description: 'VCs, angels, and potential business partners',
  },
  {
    value: 'conference-organizer',
    label: 'Conference Organizer',
    icon: Mic,
    description: 'Event organizers looking for speakers',
  },
  {
    value: 'general',
    label: 'General Audience',
    icon: Globe,
    description: 'A broad, general professional audience',
  },
];

export function CreateVariantDialog({
  open,
  onOpenChange,
  portfolioId,
  basedOnVariantId,
  onCreated,
}: CreateVariantDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { createVariant, variants } = usePortfolioVariantsStore();

  const [step, setStep] = useState<'type' | 'details'>('type');
  const [formData, setFormData] = useState<{
    name: string;
    audienceType: AudienceType;
    audienceName: string;
    description: string;
    keyPriorities: string;
    industry: string;
    companySize: string;
  }>({
    name: '',
    audienceType: 'general',
    audienceName: '',
    description: '',
    keyPriorities: '',
    industry: '',
    companySize: '',
  });
  const [isCreating, setIsCreating] = useState(false);

  const baseVariant = basedOnVariantId
    ? variants.find(v => v.id === basedOnVariantId)
    : null;

  const handleCreate = async () => {
    if (!formData.name || !formData.audienceName) {
      toast({
        title: t.error || 'Error',
        description:
          t.fillRequiredFields || 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const input: CreateVariantInput = {
        portfolioId,
        name: formData.name,
        audienceType: formData.audienceType,
        basedOnVariant: basedOnVariantId || undefined,
        audienceDetails: {
          name: formData.audienceName,
          description: formData.description,
          industry: formData.industry as any,
          companySize: formData.companySize as any,
          keyPriorities: formData.keyPriorities
            ? formData.keyPriorities.split(',').map(p => p.trim())
            : [],
        },
      };

      const variant = await createVariant(input);

      // Track variant creation
      trackVariantCreated(variant.id, {
        portfolio_id: portfolioId,
        audience_type: formData.audienceType,
        based_on_variant: basedOnVariantId || undefined,
      });

      toast({
        title: t.variantCreated || 'Variant created',
        description:
          t.variantCreatedDesc || 'Your new portfolio variant has been created',
      });

      onCreated?.(variant);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: t.error || 'Error',
        description: t.failedToCreateVariant || 'Failed to create variant',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep('type');
    setFormData({
      name: '',
      audienceType: 'general',
      audienceName: '',
      description: '',
      keyPriorities: '',
      industry: '',
      companySize: '',
    });
  };

  const generateVariantName = (audienceType: AudienceType) => {
    const typeLabel =
      audienceTypes.find(t => t.value === audienceType)?.label || 'General';
    const existingCount = variants.filter(v =>
      v.name.toLowerCase().includes(typeLabel.toLowerCase())
    ).length;

    return existingCount > 0 ? `${typeLabel} ${existingCount + 1}` : typeLabel;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open: boolean) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {baseVariant
              ? t.duplicateVariant || 'Duplicate Variant'
              : t.createNewVariant || 'Create New Variant'}
          </DialogTitle>
          <DialogDescription>
            {step === 'type'
              ? t.selectAudienceType ||
                'Select the type of audience this variant is for'
              : t.provideVariantDetails ||
                'Provide details about your target audience'}
          </DialogDescription>
        </DialogHeader>

        {step === 'type' ? (
          <div className="space-y-4">
            <RadioGroup
              value={formData.audienceType}
              onValueChange={(value: AudienceType) => {
                setFormData({
                  ...formData,
                  audienceType: value,
                  name: generateVariantName(value),
                });
              }}
            >
              {audienceTypes.map(
                ({ value, label, icon: Icon, description }) => (
                  <label
                    key={value}
                    htmlFor={value}
                    className="flex items-start space-x-3 cursor-pointer rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <RadioGroupItem value={value} id={value} className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    </div>
                  </label>
                )
              )}
            </RadioGroup>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t.variantName || 'Variant Name'} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={
                  t.variantNamePlaceholder || 'e.g., Tech Recruiter Version'
                }
              />
            </div>

            <div>
              <Label htmlFor="audienceName">
                {t.audienceName || 'Audience Name'} *
              </Label>
              <Input
                id="audienceName"
                value={formData.audienceName}
                onChange={e =>
                  setFormData({ ...formData, audienceName: e.target.value })
                }
                placeholder={
                  t.audienceNamePlaceholder || 'e.g., FAANG Recruiters'
                }
              />
            </div>

            <div>
              <Label htmlFor="description">
                {t.audienceDescription || 'Audience Description'}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={
                  t.audienceDescPlaceholder ||
                  'Describe your target audience...'
                }
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="industry">{t.industry || 'Industry'}</Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={e =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  placeholder={t.industryPlaceholder || 'e.g., Technology'}
                />
              </div>

              <div>
                <Label htmlFor="companySize">
                  {t.companySize || 'Company Size'}
                </Label>
                <select
                  id="companySize"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.companySize}
                  onChange={e =>
                    setFormData({ ...formData, companySize: e.target.value })
                  }
                >
                  <option value="">{t.selectSize || 'Select size'}</option>
                  <option value="startup">{t.startup || 'Startup'}</option>
                  <option value="small">{t.small || 'Small'}</option>
                  <option value="medium">{t.medium || 'Medium'}</option>
                  <option value="large">{t.large || 'Large'}</option>
                  <option value="enterprise">
                    {t.enterprise || 'Enterprise'}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="keyPriorities">
                {t.keyPriorities || 'Key Priorities'}
              </Label>
              <Input
                id="keyPriorities"
                value={formData.keyPriorities}
                onChange={e =>
                  setFormData({ ...formData, keyPriorities: e.target.value })
                }
                placeholder={
                  t.keyPrioritiesPlaceholder ||
                  'e.g., leadership, scalability, innovation'
                }
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t.separateWithCommas || 'Separate with commas'}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === 'type' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t.cancel || 'Cancel'}
              </Button>
              <Button onClick={() => setStep('details')}>
                {t.next || 'Next'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setStep('type')}>
                {t.back || 'Back'}
              </Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating
                  ? t.creating || 'Creating...'
                  : t.createVariant || 'Create Variant'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Cookie,
  Shield,
  BarChart3,
  Target,
  Zap,
  Settings,
  X,
  Check,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/refactored-context';
import {
  gdprService,
  type ConsentType,
} from '@/lib/services/gdpr/gdpr-service';
import { useAuth } from '@/lib/contexts/AuthContext';
import { toast } from '@/lib/ui/toast';

interface CookieConsentProps {
  onConsentGiven?: (consents: Record<ConsentType, boolean>) => void;
}

export default function CookieConsent({ onConsentGiven }: CookieConsentProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consents, setConsents] = useState<Record<ConsentType, boolean>>({
    essential: true, // Always enabled
    analytics: false,
    marketing: false,
    performance: false,
    targeting: false,
    ai_processing: false,
    data_sharing: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkConsentStatus = useCallback(async () => {
    try {
      // Check if user has already given consent
      const hasConsent = localStorage.getItem('cookie-consent-given');
      if (!hasConsent) {
        setIsVisible(true);
      }

      // If user is logged in, load their saved preferences
      if (user) {
        const userConsents = await gdprService.getUserConsent(user.id);
        const newConsents = { ...consents };

        Object.entries(userConsents).forEach(([type, record]) => {
          if (record && record.granted) {
            newConsents[type as ConsentType] = true;
          }
        });

        setConsents(newConsents);
      }
    } catch (_error) {
      // Failed to check consent status
    }
  }, [user, consents]);

  useEffect(() => {
    checkConsentStatus();
  }, [checkConsentStatus]);

  const handleConsentChange = (type: ConsentType, granted: boolean) => {
    if (type === 'essential') return; // Essential cookies cannot be disabled

    setConsents(prev => ({
      ...prev,
      [type]: granted,
    }));
  };

  const handleAcceptAll = async () => {
    const allConsents = {
      essential: true,
      analytics: true,
      marketing: true,
      performance: true,
      targeting: true,
      ai_processing: true,
      data_sharing: true,
    };

    await saveConsents(allConsents);
  };

  const handleAcceptSelected = async () => {
    await saveConsents(consents);
  };

  const handleRejectAll = async () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      performance: false,
      targeting: false,
      ai_processing: false,
      data_sharing: false,
    };

    await saveConsents(essentialOnly);
  };

  const saveConsents = async (finalConsents: Record<ConsentType, boolean>) => {
    try {
      setIsLoading(true);

      // Save to localStorage
      localStorage.setItem('cookie-consent-given', 'true');
      localStorage.setItem('cookie-consents', JSON.stringify(finalConsents));

      // If user is logged in, save to database
      if (user) {
        const userIp = await getUserIP();
        const userAgent = navigator.userAgent;

        // Record each consent type
        for (const [type, granted] of Object.entries(finalConsents)) {
          await gdprService.recordConsent({
            userId: user.id,
            consentType: type as ConsentType,
            granted,
            ipAddress: userIp,
            userAgent,
            purpose: getConsentPurpose(type as ConsentType),
            legalBasis:
              type === 'essential' ? 'legitimate_interests' : 'consent',
            expiryDate:
              type === 'essential'
                ? undefined
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          });
        }
      }

      // Apply consents immediately
      applyConsents(finalConsents);

      setIsVisible(false);
      onConsentGiven?.(finalConsents);

      toast({
        title: 'Preferences Saved',
        description: 'Your cookie preferences have been saved successfully.',
      });
    } catch (_error) {
      // Failed to save consents
      toast({
        title: t.error || 'Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyConsents = (consents: Record<ConsentType, boolean>) => {
    // Apply analytics consent
    if (consents.analytics) {
      // Enable analytics tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    }

    // Apply marketing consent
    if (consents.marketing) {
      // Enable marketing tracking
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('consent', 'update', {
          ad_storage: 'granted',
        });
      }
    }

    // Apply other consents as needed
    // This is where you'd integrate with PostHog, Stripe, etc.
  };

  const getUserIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || 'unknown';
    } catch (_error) {
      return 'unknown';
    }
  };

  const getConsentPurpose = (type: ConsentType): string => {
    const purposes = {
      essential: 'Required for basic website functionality and security',
      analytics: 'Anonymous usage analytics to improve our service',
      marketing: 'Personalized marketing communications and offers',
      performance: 'Performance monitoring and optimization',
      targeting: 'Targeted advertising and content personalization',
      ai_processing: 'AI-powered content enhancement and recommendations',
      data_sharing:
        'Sharing data with trusted partners for service improvement',
    };
    return purposes[type];
  };

  const getConsentIcon = (type: ConsentType) => {
    const icons = {
      essential: Shield,
      analytics: BarChart3,
      marketing: Target,
      performance: Zap,
      targeting: Target,
      ai_processing: Zap,
      data_sharing: Settings,
    };
    return icons[type];
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              <CardTitle>Cookie Preferences</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRejectAll}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            We use cookies to enhance your experience, analyze usage, and
            provide personalized content. You can customize your preferences
            below.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {!showDetails ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {`By clicking "Accept All", you consent to our use of cookies for`}
                analytics, marketing, and enhanced functionality. You can
                customize your preferences or accept only essential cookies.
              </p>

              <div className="flex items-center justify-center space-x-2">
                <Button variant="outline" onClick={() => setShowDetails(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Customize Preferences
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(consents).map(([type, enabled]) => {
                const Icon = getConsentIcon(type as ConsentType);
                const isEssential = type === 'essential';

                return (
                  <div
                    key={type}
                    className="flex items-start space-x-3 p-3 border rounded-lg"
                  >
                    <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium capitalize">
                            {type.replace('_', ' ')} Cookies
                          </h4>
                          {isEssential && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={checked =>
                            handleConsentChange(type as ConsentType, checked)
                          }
                          disabled={isEssential}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getConsentPurpose(type as ConsentType)}
                      </p>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Info className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">
                  You can change these preferences at any time in your account
                  settings.
                </p>
              </div>
            </div>
          )}
        </CardContent>

        <Separator />

        <CardFooter className="flex justify-between space-x-2">
          {!showDetails ? (
            <>
              <Button
                variant="outline"
                onClick={handleRejectAll}
                disabled={isLoading}
              >
                Essential Only
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(true)}
                  disabled={isLoading}
                >
                  Customize
                </Button>
                <Button onClick={handleAcceptAll} disabled={isLoading}>
                  {isLoading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                  )}
                  <Check className="mr-2 h-4 w-4" />
                  Accept All
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowDetails(false)}
                disabled={isLoading}
              >
                Back
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleRejectAll}
                  disabled={isLoading}
                >
                  Essential Only
                </Button>
                <Button onClick={handleAcceptSelected} disabled={isLoading}>
                  {isLoading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
                  )}
                  Save Preferences
                </Button>
              </div>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

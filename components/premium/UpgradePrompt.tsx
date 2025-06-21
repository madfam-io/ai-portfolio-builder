/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * @fileoverview Premium Upgrade Prompt Components
 *
 * Strategic upgrade prompts designed for maximum conversion:
 * - Psychological pricing tactics
 * - Scarcity and urgency indicators
 * - Value proposition highlighting
 * - Social proof integration
 * - A/B testing ready components
 *
 * @author PRISMA Business Team
 * @version 1.0.0 - Business Excellence Foundation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Crown,
  Zap,
  Star,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Shield,
  X,
} from 'lucide-react';
import {
  PremiumGatingResult,
  BUSINESS_USER_TIERS,
} from '@/lib/monetization/premium-gating';
import { useConversionOptimization } from '@/lib/hooks/use-premium-gating';

export interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: (tier: string) => void;
  result: PremiumGatingResult;
  userId: string;
  feature: string;
  variant?: 'gentle' | 'aggressive' | 'value_focused' | 'social_proof';
}

export function UpgradePrompt({
  isOpen,
  onClose,
  onUpgrade,
  result,
  userId,
  feature,
  variant = 'value_focused',
}: UpgradePromptProps) {
  const conversion = useConversionOptimization(userId, result.userTier);
  const [showScarcity, setShowScarcity] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    if (!isOpen) return;

    conversion.trackConversionEvent('upgrade_prompt_shown', feature, {
      variant,
      conversionScore: result.conversionScore,
      revenueOpportunity: result.revenueOpportunity,
    });

    // Show scarcity after 3 seconds
    const scarcityTimer = setTimeout(() => setShowScarcity(true), 3000);

    // Countdown timer for urgency
    const countdownTimer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(scarcityTimer);
      clearInterval(countdownTimer);
    };
  }, [isOpen, conversion, feature, variant, result]);

  const handleUpgradeClick = (tier: string) => {
    conversion.trackConversionEvent('upgrade_prompt_clicked', feature, {
      selectedTier: tier,
      variant,
      conversionScore: result.conversionScore,
    });
    onUpgrade(tier);
  };

  const getPromptContent = () => {
    switch (variant) {
      case 'aggressive':
        return {
          title: '🚀 Unlock Your Full Potential NOW!',
          description:
            "Don't let limits hold you back. Upgrade today and 10x your portfolio impact!",
          urgency: true,
          scarcity: true,
        };
      case 'gentle':
        return {
          title: 'Ready to level up?',
          description: 'Continue your portfolio journey with premium features.',
          urgency: false,
          scarcity: false,
        };
      case 'social_proof':
        return {
          title: 'Join 10,000+ Successful Professionals',
          description:
            'See why top performers choose PRISMA Professional for their portfolios.',
          urgency: false,
          scarcity: false,
        };
      default: // value_focused
        return {
          title: 'Unlock Professional Features',
          description:
            'Get unlimited access and boost your professional presence.',
          urgency: true,
          scarcity: false,
        };
    }
  };

  const promptContent = getPromptContent();
  const recommendedTier =
    result.userTier === 'free' ? 'professional' : 'business';
  const tierConfig = BUSINESS_USER_TIERS[recommendedTier];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header with scarcity indicator */}
          <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            <AnimatePresence>
              {showScarcity && promptContent.scarcity && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4"
                >
                  <Badge
                    variant="destructive"
                    className="bg-red-500/20 text-red-100 border-red-400"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Limited Time: {formatTime(timeLeft)} remaining
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-yellow-300" />
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {promptContent.title}
                </DialogTitle>
                <DialogDescription className="text-purple-100 text-lg">
                  {promptContent.description}
                </DialogDescription>
              </div>
            </div>

            {/* Conversion score indicator */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Conversion Opportunity</span>
                <span>{result.conversionScore}%</span>
              </div>
              <Progress value={result.conversionScore} className="h-2" />
            </div>
          </div>

          {/* Main content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Current limitations */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Current Limitations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-red-700">
                    <p className="font-medium">{result.reason}</p>
                    <p className="text-sm mt-1">{result.marketingMessage}</p>
                    {result.scarcityIndicator && (
                      <Badge
                        variant="outline"
                        className="mt-2 border-red-300 text-red-700"
                      >
                        {result.scarcityIndicator}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade benefits */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    With {tierConfig?.name || 'Premium'} Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.nextTierBenefits.slice(0, 3).map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 text-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Pricing section */}
            <div className="mt-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">Choose Your Plan</h3>
                <p className="text-muted-foreground">
                  Unlock your potential with premium features
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Professional Plan */}
                {result.userTier === 'free' && (
                  <Card className="relative border-2 border-primary">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        Professional
                      </CardTitle>
                      <div className="space-y-1">
                        <div className="text-3xl font-bold">
                          $
                          {BUSINESS_USER_TIERS.professional?.monthlyPrice || 29}
                          <span className="text-lg font-normal text-muted-foreground">
                            /month
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground line-through">
                          $58/month
                        </div>
                        <div className="text-green-600 font-medium">
                          Save 50% for 12 months!
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {Object.entries(
                          BUSINESS_USER_TIERS.professional?.features || {}
                        )
                          .filter(([_, config]) => config.enabled)
                          .slice(0, 5)
                          .map(([feature, config]) => (
                            <div
                              key={feature}
                              className="flex items-center gap-2 text-sm"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>
                                {config.limit === 'unlimited'
                                  ? `Unlimited ${feature.replace('_', ' ')}`
                                  : `${config.limit} ${feature.replace('_', ' ')}`}
                              </span>
                            </div>
                          ))}
                      </div>
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={() => handleUpgradeClick('professional')}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Upgrade to Professional
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Business Plan */}
                <Card
                  className={
                    result.userTier === 'professional'
                      ? 'border-2 border-primary'
                      : ''
                  }
                >
                  {result.userTier === 'professional' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Recommended
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="flex items-center justify-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      Business
                    </CardTitle>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold">
                        ${BUSINESS_USER_TIERS.business?.monthlyPrice || 99}
                        <span className="text-lg font-normal text-muted-foreground">
                          /month
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Everything in Professional +
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {Object.entries(
                        BUSINESS_USER_TIERS.business?.features || {}
                      )
                        .filter(([_, config]) => config.enabled)
                        .filter(([feature]) => {
                          const profFeatures =
                            (BUSINESS_USER_TIERS.professional
                              ?.features as any) || {};
                          const bizFeatures =
                            (BUSINESS_USER_TIERS.business?.features as any) ||
                            {};
                          return (
                            !profFeatures[feature]?.enabled ||
                            bizFeatures[feature]?.limit !==
                              profFeatures[feature]?.limit
                          );
                        })
                        .slice(0, 5)
                        .map(([feature, config]) => (
                          <div
                            key={feature}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>
                              {config.limit === 'unlimited'
                                ? `Unlimited ${feature.replace('_', ' ')}`
                                : `${config.limit} ${feature.replace('_', ' ')}`}
                            </span>
                          </div>
                        ))}
                    </div>
                    <Button
                      variant={
                        result.userTier === 'professional'
                          ? 'default'
                          : 'outline'
                      }
                      className="w-full"
                      size="lg"
                      onClick={() => handleUpgradeClick('business')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Upgrade to Business
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Social proof section */}
            {variant === 'social_proof' && (
              <div className="mt-8 text-center">
                <div className="bg-muted rounded-lg p-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-primary" />
                    <span className="font-semibold">
                      Join 10,000+ professionals
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-bold text-2xl text-primary">98%</div>
                      <div className="text-muted-foreground">Success Rate</div>
                    </div>
                    <div>
                      <div className="font-bold text-2xl text-primary">
                        3min
                      </div>
                      <div className="text-muted-foreground">
                        Avg. Creation Time
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-2xl text-primary">5x</div>
                      <div className="text-muted-foreground">
                        More Interviews
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Guarantee section */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-full text-sm">
                <Shield className="w-4 h-4" />
                30-day money-back guarantee • Cancel anytime
              </div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Inline upgrade prompt for less intrusive conversions
 */
export function InlineUpgradePrompt({
  result,
  onUpgrade,
  feature,
  className = '',
}: {
  result: PremiumGatingResult;
  onUpgrade: (tier: string) => void;
  feature: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <Crown className="w-5 h-5 text-purple-600 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-purple-900 mb-1">
            {result.marketingMessage}
          </h4>
          <p className="text-sm text-purple-700 mb-3">
            Upgrade to continue with unlimited access and premium features.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onUpgrade('professional')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="w-3 h-3 mr-1" />
              Upgrade Now
            </Button>
            <span className="text-xs text-purple-600">
              Starting at $
              {BUSINESS_USER_TIERS.professional?.monthlyPrice || 29}/month
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Usage indicator with upgrade prompts
 */
export function UsageIndicator({
  feature,
  used,
  limit,
  userTier,
  onUpgrade,
}: {
  feature: string;
  used: number;
  limit: number | 'unlimited';
  userTier: string;
  onUpgrade: () => void;
}) {
  if (limit === 'unlimited') {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="w-4 h-4" />
        <span>Unlimited {feature}</span>
      </div>
    );
  }

  const percentage = (used / (limit as number)) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = used >= (limit as number);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {feature.charAt(0).toUpperCase() + feature.slice(1).replace('_', ' ')}
        </span>
        <span
          className={
            isAtLimit
              ? 'text-red-600'
              : isNearLimit
                ? 'text-amber-600'
                : 'text-muted-foreground'
          }
        >
          {used} / {limit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-amber-100' : ''}`}
      />
      {(isNearLimit || isAtLimit) && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {isAtLimit
              ? 'Limit reached'
              : `${Math.ceil((limit as number) - used)} remaining`}
          </span>
          <Button size="sm" variant="outline" onClick={onUpgrade}>
            <Crown className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        </div>
      )}
    </div>
  );
}

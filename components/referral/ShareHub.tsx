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

/**
 * @fileoverview Referral Share Hub Component
 *
 * Beautiful, intuitive sharing interface that makes it effortless for users
 * to share their referral links across all major platforms. Features:
 * - One-click sharing to social platforms
 * - Customizable share messages
 * - Real-time sharing analytics
 * - Beautiful animations and feedback
 * - Mobile-optimized design
 *
 * @author MADFAM Growth Engineering Team
 * @version 1.0.0 - World-Class Referral System
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Share2,
  Copy,
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  Mail,
  Check,
  ExternalLink,
  Gift,
  Users,
  TrendingUp,
  QrCode,
} from 'lucide-react';
import { useReferral } from '@/lib/referral/hooks/use-referral';
import type { SharePlatform, Referral } from '@/lib/referral/types';
import { cn } from '@/lib/utils';

interface ShareHubProps {
  className?: string;
  referral?: Referral;
  onShareSuccess?: (platform: SharePlatform) => void;
}

const SHARE_PLATFORMS = [
  {
    platform: 'twitter' as SharePlatform,
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-blue-600',
  },
  {
    platform: 'linkedin' as SharePlatform,
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800',
    textColor: 'text-blue-700',
  },
  {
    platform: 'facebook' as SharePlatform,
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-blue-600',
  },
  {
    platform: 'whatsapp' as SharePlatform,
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-green-600',
  },
  {
    platform: 'email' as SharePlatform,
    name: 'Email',
    icon: Mail,
    color: 'bg-gray-600 hover:bg-gray-700',
    textColor: 'text-gray-600',
  },
];

export function ShareHub({
  className,
  referral,
  onShareSuccess,
}: ShareHubProps) {
  const {
    activeReferral,
    stats,
    shareToSocial,
    copyShareLink,
    generateShareContent,
    sharing,
    lastShareSuccess,
  } = useReferral();

  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedPlatform, setSelectedPlatform] =
    useState<SharePlatform | null>(null);

  const targetReferral = referral || activeReferral;

  const handleShare = useCallback(
    async (platform: SharePlatform) => {
      if (!targetReferral) return;

      setSelectedPlatform(platform);

      try {
        const success = await shareToSocial(platform, targetReferral);

        if (success) {
          onShareSuccess?.(platform);
        }
      } finally {
        setSelectedPlatform(null);
      }
    },
    [targetReferral, shareToSocial, onShareSuccess]
  );

  const handleCopyLink = useCallback(async () => {
    if (!targetReferral) return;

    const success = await copyShareLink(targetReferral);

    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, [targetReferral, copyShareLink]);

  if (!targetReferral) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Share2 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Active Referral
            </h3>
            <p className="text-gray-600">
              Create a referral link to start sharing and earning rewards.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://prisma.madfam.io'}/signup?ref=${targetReferral.code}`;
  const sharePreview = generateShareContent('twitter', targetReferral);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Share Link Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Gift className="w-5 h-5 mr-2 text-purple-600" />
                Your Referral Link
              </CardTitle>
              <CardDescription>
                Share this link to earn rewards when friends sign up
              </CardDescription>
            </div>
            <Badge
              variant="secondary"
              className="bg-purple-100 text-purple-800"
            >
              {targetReferral.code}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Share URL Display */}
            <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border">
              <div className="flex-1 text-sm font-mono text-gray-600 truncate">
                {shareUrl}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
                disabled={sharing}
                className="shrink-0"
              >
                <AnimatePresence mode="wait">
                  {copiedLink ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center"
                    >
                      <Check className="w-4 h-4 mr-2 text-green-600" />
                      Copied!
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.total_referrals || 0}
                </div>
                <div className="text-sm text-gray-600">Referrals</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.successful_referrals || 0}
                </div>
                <div className="text-sm text-gray-600">Conversions</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  ${stats?.total_rewards_earned.toFixed(0) || '0'}
                </div>
                <div className="text-sm text-gray-600">Earned</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="w-5 h-5 mr-2 text-blue-600" />
            Share Your Link
          </CardTitle>
          <CardDescription>
            Choose your favorite platform to share with friends and colleagues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SHARE_PLATFORMS.map(({ platform, name, icon: Icon, color }) => (
              <motion.div
                key={platform}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleShare(platform)}
                  disabled={sharing}
                  className="w-full h-16 flex flex-col items-center justify-center space-y-1 hover:shadow-md transition-all"
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{name}</span>
                  {selectedPlatform === platform && sharing && (
                    <motion.div
                      className="absolute inset-0 bg-gray-100 rounded-md flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </motion.div>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Share Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ExternalLink className="w-5 h-5 mr-2 text-green-600" />
            Share Preview
          </CardTitle>
          <CardDescription>
            Preview how your shared content will appear
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-sm">
                  PRISMA by MADFAM
                </h4>
                <p className="text-gray-600 text-sm mt-1">
                  {sharePreview.text}
                </p>
                <div className="mt-2 p-2 bg-white rounded border">
                  <div className="text-xs text-blue-600 font-medium">
                    prisma.madfam.io
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {shareUrl}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      {stats && stats.total_referrals > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Your Performance
            </CardTitle>
            <CardDescription>
              Track your referral success and optimize your sharing strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Conversion Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="text-sm text-gray-600">
                    {stats.conversion_rate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={stats.conversion_rate} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {stats.successful_referrals} out of {stats.total_referrals}{' '}
                  referrals converted
                </p>
              </div>

              {/* Current Streak */}
              {stats.current_streak > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      🔥
                    </div>
                    <div>
                      <div className="font-medium text-orange-900">
                        {stats.current_streak} Day Streak
                      </div>
                      <div className="text-xs text-orange-700">
                        Keep sharing to maintain your streak!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievement Badges */}
              {stats.achievement_badges.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">
                    Your Achievements
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {stats.achievement_badges.map((badge, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        🏆 {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

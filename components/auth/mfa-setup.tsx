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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Smartphone,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/refactored-context';
import {
  mfaService,
  type MFAStatus,
  type MFASetupResponse,
} from '@/lib/services/auth/mfa-service';
import { toast } from '@/lib/ui/toast';

interface MFASetupProps {
  onStatusChange?: (enabled: boolean) => void;
}

export default function MFASetup({ onStatusChange }: MFASetupProps) {
  const { t } = useLanguage();
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setupData, setSetupData] = useState<MFASetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState<Set<number>>(new Set());
  const [step, setStep] = useState<
    'status' | 'setup' | 'verify' | 'backup-codes'
  >('status');

  const loadMFAStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await mfaService.getMFAStatus();
      setMfaStatus(status);
      onStatusChange?.(status.enabled);
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description: 'Failed to load MFA status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, onStatusChange]);

  useEffect(() => {
    loadMFAStatus();
  }, [loadMFAStatus]);

  const handleSetupMFA = async () => {
    try {
      setIsLoading(true);
      const data = await mfaService.setupMFA();
      setSetupData(data);
      setStep('setup');
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description: 'Failed to set up MFA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    if (!setupData || !verificationCode) return;

    try {
      setIsVerifying(true);
      const isValid = await mfaService.verifyMFASetup(
        verificationCode,
        setupData.secret
      );

      if (isValid) {
        setStep('backup-codes');
        toast({
          title: 'MFA Enabled!',
          description:
            'Two-factor authentication has been successfully enabled.',
        });
      } else {
        toast({
          title: 'Invalid Code',
          description: 'Please check your authenticator app and try again.',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description: 'Failed to verify MFA setup',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!mfaStatus?.factorId) return;

    try {
      setIsLoading(true);
      await mfaService.disableMFA(mfaStatus.factorId);
      await loadMFAStatus();
      toast({
        title: 'MFA Disabled',
        description: 'Two-factor authentication has been disabled.',
      });
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description: 'Failed to disable MFA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCodes(prev => new Set([...prev, index]));
      setTimeout(() => {
        setCopiedCodes(prev => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });
      }, 2000);
    } catch (_error) {
      toast({
        title: t.error || 'Error',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = () => {
    setStep('status');
    setSetupData(null);
    setVerificationCode('');
    loadMFAStatus();
  };

  if (isLoading && !setupData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary" />
            <span>Loading MFA settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Status View
  if (step === 'status') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mfaStatus?.enabled ? (
              <ShieldCheck className="h-5 w-5 text-success" />
            ) : (
              <Shield className="h-5 w-5 text-muted-foreground" />
            )}
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with TOTP-based
            two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Authenticator App</span>
              </div>
              <Badge variant={mfaStatus?.enabled ? 'default' : 'secondary'}>
                {mfaStatus?.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            {mfaStatus?.enabled && mfaStatus.lastUsed && (
              <span className="text-sm text-muted-foreground">
                Last used: {mfaStatus.lastUsed.toLocaleDateString()}
              </span>
            )}
          </div>

          {!mfaStatus?.enabled && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Recommended:</strong> Enable two-factor authentication
                to secure your account. This adds an extra step during login but
                significantly improves your security.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          {mfaStatus?.enabled ? (
            <Button
              variant="destructive"
              onClick={handleDisableMFA}
              disabled={isLoading}
            >
              {isLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
              )}
              <ShieldX className="mr-2 h-4 w-4" />
              Disable MFA
            </Button>
          ) : (
            <Button onClick={handleSetupMFA} disabled={isLoading}>
              {isLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
              )}
              <Shield className="mr-2 h-4 w-4" />
              Enable MFA
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  }

  // Setup View
  if (step === 'setup' && setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Set Up Authenticator App
          </CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app, then enter the
            verification code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={setupData.qrCodeUrl}
              alt="MFA QR Code"
              className="mx-auto border rounded-lg"
              style={{ maxWidth: '200px' }}
            />
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommended apps:</strong> Google Authenticator, Microsoft
              Authenticator, or Authy
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={e =>
                setVerificationCode(
                  e.target.value.replace(/\D/g, '').slice(0, 6)
                )
              }
              maxLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex space-x-2">
          <Button variant="outline" onClick={() => setStep('status')}>
            Cancel
          </Button>
          <Button
            onClick={handleVerifySetup}
            disabled={verificationCode.length !== 6 || isVerifying}
          >
            {isVerifying && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
            )}
            Verify & Enable
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Backup Codes View
  if (step === 'backup-codes' && setupData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Backup Codes
          </CardTitle>
          <CardDescription>
            Save these backup codes in a secure location. Each code can only be
            used once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Store these codes safely. {"They're"}
              your only way to access your account if you lose your
              authenticator device.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-2">
            {setupData.backupCodes.map((code, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded font-mono text-sm"
              >
                <span>{code}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(code, index)}
                  className="h-6 w-6 p-0"
                >
                  {copiedCodes.has(index) ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleComplete} className="w-full">
            {"I've Saved My Backup Codes"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
}

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

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Globe, Info } from 'lucide-react';
import { DomainService } from '@/lib/services/domain-service';
import { logger } from '@/lib/utils/logger';
import type { Portfolio } from '@/types/portfolio';
import type { DomainCheckResult } from '@/types/domains';

interface AddDomainModalProps {
  portfolios: Portfolio[];
  onAdd: (portfolioId: string, domain: string) => Promise<void>;
  onClose: () => void;
}

export function AddDomainModal({
  portfolios,
  onAdd,
  onClose,
}: AddDomainModalProps) {
  const [domain, setDomain] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState('');
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState<DomainCheckResult | null>(
    null
  );
  const [adding, setAdding] = useState(false);

  const handleCheckAvailability = async () => {
    if (!domain) return;

    setChecking(true);
    try {
      const result = await DomainService.checkDomainAvailability(domain);
      setAvailability(result);
    } catch (error) {
      logger.error('Failed to check domain availability', error as Error);
    } finally {
      setChecking(false);
    }
  };

  const handleAdd = async () => {
    if (!selectedPortfolio || !domain || !availability?.isAvailable) return;

    setAdding(true);
    try {
      await onAdd(selectedPortfolio, domain);
    } catch (error) {
      logger.error('Failed to add domain', error as Error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg max-w-md w-full p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Add Custom Domain</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Enter your domain name without http:// or https://. For example:
            yourname.com
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {/* Portfolio Selection */}
          <div className="space-y-2">
            <Label>Select Portfolio</Label>
            <Select
              value={selectedPortfolio}
              onValueChange={setSelectedPortfolio}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a portfolio" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map(portfolio => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Domain Input */}
          <div className="space-y-2">
            <Label>Domain Name</Label>
            <div className="flex gap-2">
              <Input
                placeholder="yourname.com"
                value={domain}
                onChange={e => {
                  setDomain(e.target.value);
                  setAvailability(null);
                }}
                onBlur={handleCheckAvailability}
              />
              <Button
                variant="outline"
                onClick={handleCheckAvailability}
                disabled={!domain || checking}
              >
                {checking ? 'Checking...' : 'Check'}
              </Button>
            </div>
          </div>

          {/* Availability Status */}
          {availability && (
            <Alert
              variant={availability.isAvailable ? 'default' : 'destructive'}
            >
              <Globe className="h-4 w-4" />
              <AlertDescription>
                {availability.isAvailable ? (
                  <span className="text-green-600">Domain is available!</span>
                ) : (
                  <div>
                    <p>Domain is not available: {availability.reason}</p>
                    {availability.suggestions && (
                      <div className="mt-2">
                        <p className="text-sm">Try these alternatives:</p>
                        <ul className="text-sm mt-1">
                          {availability.suggestions.map(
                            (suggestion: string) => (
                              <li key={suggestion}>
                                <button
                                  className="text-primary hover:underline"
                                  onClick={() => {
                                    setDomain(suggestion);
                                    setAvailability(null);
                                  }}
                                >
                                  {suggestion}
                                </button>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={
              !selectedPortfolio ||
              !domain ||
              !availability?.isAvailable ||
              adding
            }
            className="flex-1"
          >
            {adding ? 'Adding...' : 'Add Domain'}
          </Button>
        </div>
      </div>
    </div>
  );
}

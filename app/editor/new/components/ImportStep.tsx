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

import { ArrowRight, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ImportSource = 'linkedin' | 'github' | 'manual' | 'cv';

interface ImportStepProps {
  selectedSource: ImportSource;
  onSelectSource: (source: ImportSource) => void;
  onNext: () => void;
  onBack: () => void;
  t: Record<string, string | undefined>; // Translation object
}

export function ImportStep({
  selectedSource,
  onSelectSource,
  onNext,
  onBack,
  t,
}: ImportStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">
          {t.importYourData || 'Import your data'}
        </h2>
        <p className="text-muted-foreground">
          {t.importDescription ||
            'Speed up the process by importing from existing profiles'}
        </p>
      </div>

      <div className="grid gap-4">
        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selectedSource === 'linkedin' && 'ring-2 ring-primary'
          )}
          onClick={() => onSelectSource('linkedin')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#0077B5] text-white rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">LinkedIn</CardTitle>
                <CardDescription>
                  {t.importFromLinkedIn ||
                    'Import your professional experience'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selectedSource === 'github' && 'ring-2 ring-primary'
          )}
          onClick={() => onSelectSource('github')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-900 text-white rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">GitHub</CardTitle>
                <CardDescription>
                  {t.importFromGitHub ||
                    'Import your projects and contributions'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selectedSource === 'cv' && 'ring-2 ring-primary'
          )}
          onClick={() => onSelectSource('cv')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <Upload className="h-7 w-7 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">
                  {t.uploadCV || 'Upload CV'}
                </CardTitle>
                <CardDescription>
                  {t.uploadCVDescription || 'Upload your resume (PDF/DOC)'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card
          className={cn(
            'cursor-pointer transition-all hover:shadow-md',
            selectedSource === 'manual' && 'ring-2 ring-primary'
          )}
          onClick={() => onSelectSource('manual')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="h-7 w-7 text-muted-foreground" />
              <div>
                <CardTitle className="text-lg">
                  {t.manualEntry || 'Manual Entry'}
                </CardTitle>
                <CardDescription>
                  {t.manualEntryDescription ||
                    'Enter your information manually'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          {t.back || 'Back'}
        </Button>
        <Button onClick={onNext} className="flex-1">
          {t.continueButton || 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

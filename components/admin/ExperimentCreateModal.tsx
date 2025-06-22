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
 * @fileoverview Experiment Creation Modal Component
 *
 * Multi-step wizard for creating new experiments with comprehensive
 * configuration options for the universal experimentation platform.
 *
 * @author PRISMA Business Team
 * @version 0.4.0-beta - Universal Experimentation Platform
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ExperimentContext,
  ExperimentType,
} from '@/lib/experimentation/universal-experiments';

interface ExperimentCreatorProps {
  onClose: () => void;
}

export function ExperimentCreator({ onClose }: ExperimentCreatorProps) {
  const [step, setStep] = useState(1);
  const [experimentData, setExperimentData] = useState({
    name: '',
    description: '',
    hypothesis: '',
    context: 'landing_page' as ExperimentContext,
    type: 'component' as ExperimentType,
    primary_metric: 'conversion_rate',
    traffic_allocation: 50,
    confidence_level: 95,
    min_sample_size: 1000,
  });

  const contexts: {
    value: ExperimentContext;
    label: string;
    description: string;
  }[] = [
    {
      value: 'landing_page',
      label: 'Landing Page',
      description: 'Homepage and marketing pages',
    },
    {
      value: 'editor',
      label: 'Portfolio Editor',
      description: 'Portfolio creation and editing',
    },
    {
      value: 'onboarding',
      label: 'Onboarding',
      description: 'User signup and initial setup',
    },
    {
      value: 'pricing',
      label: 'Pricing Page',
      description: 'Subscription and payment flow',
    },
    {
      value: 'ai_enhancement',
      label: 'AI Features',
      description: 'AI-powered content generation',
    },
    {
      value: 'dashboard',
      label: 'Dashboard',
      description: 'User dashboard and analytics',
    },
  ];

  const types: { value: ExperimentType; label: string; description: string }[] =
    [
      {
        value: 'component',
        label: 'Component Test',
        description: 'Individual UI component variations',
      },
      {
        value: 'flow',
        label: 'Flow Test',
        description: 'Complete user journey variations',
      },
      {
        value: 'content',
        label: 'Content Test',
        description: 'Text, messaging, and copy variations',
      },
      {
        value: 'pricing',
        label: 'Pricing Test',
        description: 'Pricing strategy and display variations',
      },
      {
        value: 'algorithm',
        label: 'Algorithm Test',
        description: 'AI model and logic variations',
      },
      {
        value: 'feature',
        label: 'Feature Flag',
        description: 'Feature enablement and behavior',
      },
    ];

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <Tabs value={`step-${step}`} className="w-full">
        {/* Step Navigation */}
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="step-1">Basic Info</TabsTrigger>
            <TabsTrigger value="step-2">Configuration</TabsTrigger>
            <TabsTrigger value="step-3">Review</TabsTrigger>
          </TabsList>
        </div>

        {/* Step 1: Basic Information */}
        <TabsContent value="step-1" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="name">Experiment Name</Label>
              <Input
                id="name"
                value={experimentData.name}
                onChange={e =>
                  setExperimentData(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Hero CTA Button Test"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={experimentData.description}
                onChange={e =>
                  setExperimentData(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of what you're testing"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="hypothesis">Hypothesis</Label>
              <Textarea
                id="hypothesis"
                value={experimentData.hypothesis}
                onChange={e =>
                  setExperimentData(prev => ({
                    ...prev,
                    hypothesis: e.target.value,
                  }))
                }
                placeholder="e.g., Changing the CTA button color from blue to green will increase conversions by 10%"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)}>Next</Button>
          </div>
        </TabsContent>

        {/* Step 2: Configuration */}
        <TabsContent value="step-2" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Context</Label>
              <Select
                value={experimentData.context}
                onValueChange={(value: ExperimentContext) =>
                  setExperimentData(prev => ({ ...prev, context: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contexts.map(context => (
                    <SelectItem key={context.value} value={context.value}>
                      <div>
                        <div className="font-medium">{context.label}</div>
                        <div className="text-sm text-gray-500">
                          {context.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Experiment Type</Label>
              <Select
                value={experimentData.type}
                onValueChange={(value: ExperimentType) =>
                  setExperimentData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">
                          {type.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Traffic Allocation (%)</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={experimentData.traffic_allocation}
                onChange={e =>
                  setExperimentData(prev => ({
                    ...prev,
                    traffic_allocation: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div>
              <Label>Confidence Level (%)</Label>
              <Select
                value={experimentData.confidence_level.toString()}
                onValueChange={value =>
                  setExperimentData(prev => ({
                    ...prev,
                    confidence_level: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90">90%</SelectItem>
                  <SelectItem value="95">95%</SelectItem>
                  <SelectItem value="99">99%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Min Sample Size</Label>
              <Input
                type="number"
                min="100"
                value={experimentData.min_sample_size}
                onChange={e =>
                  setExperimentData(prev => ({
                    ...prev,
                    min_sample_size: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => setStep(3)}>Next</Button>
          </div>
        </TabsContent>

        {/* Step 3: Review */}
        <TabsContent value="step-3" className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Experiment Summary</h3>
            <div className="space-y-2 text-sm">
              <div>
                <strong>Name:</strong> {experimentData.name}
              </div>
              <div>
                <strong>Context:</strong>{' '}
                {contexts.find(c => c.value === experimentData.context)?.label}
              </div>
              <div>
                <strong>Type:</strong>{' '}
                {types.find(t => t.value === experimentData.type)?.label}
              </div>
              <div>
                <strong>Traffic:</strong> {experimentData.traffic_allocation}%
              </div>
              <div>
                <strong>Confidence:</strong> {experimentData.confidence_level}%
              </div>
              <div>
                <strong>Sample Size:</strong>{' '}
                {experimentData.min_sample_size.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClose}>Create Experiment</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

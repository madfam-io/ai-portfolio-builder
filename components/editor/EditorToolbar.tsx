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

import {
  Briefcase as FiBriefcase,
  Code as FiCode,
  Edit3 as FiEdit3,
  Eye,
  EyeOff,
  Layout as FiLayout,
  Monitor,
  Smartphone,
  Star as FiStar,
  Tablet,
  User as FiUser,
} from 'lucide-react';

import { TemplateType } from '@/types/portfolio';

interface EditorToolbarProps {
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  template: TemplateType;
  onTemplateChange: (template: TemplateType) => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

const TEMPLATE_OPTIONS: Array<{
  id: TemplateType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: 'developer',
    name: 'Developer',
    icon: FiCode,
    description: 'Perfect for software developers and engineers',
  },
  {
    id: 'designer',
    name: 'Designer',
    icon: FiEdit3,
    description: 'Ideal for UI/UX designers and creatives',
  },
  {
    id: 'consultant',
    name: 'Consultant',
    icon: FiBriefcase,
    description: 'Professional template for consultants',
  },
  {
    id: 'business',
    name: 'Business',
    icon: FiUser,
    description: 'Corporate and business professionals',
  },
  {
    id: 'creative',
    name: 'Creative',
    icon: FiStar,
    description: 'For artists and creative professionals',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    icon: FiLayout,
    description: 'Clean and minimal design',
  },
];

export function EditorToolbar({
  previewMode,
  onPreviewModeChange,
  template,
  onTemplateChange,
  showPreview,
  onTogglePreview,
}: EditorToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Template selector */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Template:</label>
          <select
            value={template}
            onChange={e => onTemplateChange(e.target.value as TemplateType)}
            className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {TEMPLATE_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Center - Preview mode controls */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onPreviewModeChange('desktop')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
              previewMode === 'desktop'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span>Desktop</span>
          </button>
          <button
            onClick={() => onPreviewModeChange('tablet')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
              previewMode === 'tablet'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span>Tablet</span>
          </button>
          <button
            onClick={() => onPreviewModeChange('mobile')}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm transition-colors ${
              previewMode === 'mobile'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right side - View toggle */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onTogglePreview}
            className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Show Preview</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

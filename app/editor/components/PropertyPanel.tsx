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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Palette,
  Type,
  Image,
  Monitor,
  Tablet,
  Smartphone,
  Plus,
  Trash2,
  Move,
  Settings,
} from 'lucide-react';
import { useEditorStore } from '@/lib/store/editor-store';
import { blockConfigs } from '@/lib/editor/block-configs';
import type { BlockProperty } from '@/types/editor';

interface PropertyPanelProps {
  blockId: string | null;
}

export function PropertyPanel({ blockId }: PropertyPanelProps) {
  const { getBlockById, updateBlock, viewport, setViewport } = useEditorStore();

  const [activeTab, setActiveTab] = useState<
    'content' | 'style' | 'responsive'
  >('content');

  const block = blockId ? getBlockById(blockId) : null;
  const config = block ? blockConfigs[block.type] : null;

  if (!block || !config) {
    return (
      <ScrollArea className="h-full p-4">
        <div className="text-center py-8">
          <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Block Selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a block to edit its properties
          </p>
        </div>
      </ScrollArea>
    );
  }

  const handleDataUpdate = (key: string, value: unknown) => {
    updateBlock(block.id, {
      data: { ...block.data, [key]: value },
    });
  };

  const handleStyleUpdate = (key: string, value: unknown) => {
    updateBlock(block.id, {
      styles: { ...block.styles, [key]: value },
    });
  };

  const _handleResponsiveStyleUpdate = (
    viewport: 'desktop' | 'tablet' | 'mobile',
    key: string,
    value: unknown
  ) => {
    const currentResponsive = block.responsive[viewport] || {};
    updateBlock(block.id, {
      responsive: {
        ...block.responsive,
        [viewport]: { ...currentResponsive, [key]: value },
      },
    });
  };

  const renderProperty = (property: BlockProperty) => {
    const value = block.data[property.key];

    // Check conditional rendering
    if (property.conditional) {
      const conditionValue = block.data[property.conditional.field];
      if (conditionValue !== property.conditional.value) {
        return null;
      }
    }

    // Input renderer components to reduce complexity
    const TextInput = () => (
      <Input
        value={value || ''}
        onChange={e => handleDataUpdate(property.key, e.target.value)}
        placeholder={`Enter ${property.label.toLowerCase()}`}
      />
    );

    const TextareaInput = () => (
      <Textarea
        value={value || ''}
        onChange={e => handleDataUpdate(property.key, e.target.value)}
        placeholder={`Enter ${property.label.toLowerCase()}`}
        rows={3}
      />
    );

    const NumberInput = () => (
      <Input
        type="number"
        value={value || 0}
        onChange={e =>
          handleDataUpdate(property.key, parseInt(e.target.value) || 0)
        }
        placeholder={`Enter ${property.label.toLowerCase()}`}
      />
    );

    const BooleanInput = () => (
      <div className="flex items-center space-x-2">
        <Switch
          checked={Boolean(value)}
          onCheckedChange={checked => handleDataUpdate(property.key, checked)}
        />
        <Label>{property.label}</Label>
      </div>
    );

    const SelectInput = () => (
      <Select
        value={value || ''}
        onValueChange={newValue => handleDataUpdate(property.key, newValue)}
      >
        <SelectTrigger>
          <SelectValue placeholder={`Select ${property.label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent>
          {property.options?.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );

    const ColorInput = () => (
      <div className="flex items-center space-x-2">
        <Input
          type="color"
          value={value || '#000000'}
          onChange={e => handleDataUpdate(property.key, e.target.value)}
          className="w-12 h-8 p-1 border rounded"
        />
        <Input
          value={value || '#000000'}
          onChange={e => handleDataUpdate(property.key, e.target.value)}
          placeholder="#000000"
          className="flex-1"
        />
      </div>
    );

    const renderPropertyInput = () => {
      switch (property.type) {
        case 'text':
          return <TextInput />;
        case 'textarea':
          return <TextareaInput />;
        case 'number':
          return <NumberInput />;
        case 'checkbox':
          return <BooleanInput />;
        case 'select':
          return <SelectInput />;
        case 'color':
          return <ColorInput />;

        case 'image':
          return (
            <div className="space-y-2">
              <Input
                value={value || ''}
                onChange={e => handleDataUpdate(property.key, e.target.value)}
                placeholder="Image URL or upload"
              />
              <Button variant="outline" size="sm" className="w-full">
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </div>
          );

        case 'link':
          return (
            <Input
              type="url"
              value={value || ''}
              onChange={e => handleDataUpdate(property.key, e.target.value)}
              placeholder="https://example.com"
            />
          );

        case 'array':
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">
                  Items ({Array.isArray(value) ? value.length : 0})
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newArray = Array.isArray(value) ? [...value] : [];
                    newArray.push({});
                    handleDataUpdate(property.key, newArray);
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {Array.isArray(value) &&
                value.map((item, index) => (
                  <Card key={index} className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Item {index + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newArray = [...value];
                          newArray.splice(index, 1);
                          handleDataUpdate(property.key, newArray);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <Textarea
                      value={JSON.stringify(item, null, 2)}
                      onChange={e => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          const newArray = [...value];
                          newArray[index] = parsed;
                          handleDataUpdate(property.key, newArray);
                        } catch (_error) {
                          // Invalid JSON, don't update
                        }
                      }}
                      rows={3}
                      className="text-xs font-mono"
                    />
                  </Card>
                ))}
            </div>
          );

        default:
          return (
            <Input
              value={value || ''}
              onChange={e => handleDataUpdate(property.key, e.target.value)}
              placeholder={`Enter ${property.label.toLowerCase()}`}
            />
          );
      }
    };

    return (
      <div key={property.key} className="space-y-2">
        {property.type !== 'checkbox' && (
          <Label className="text-sm font-medium">
            {property.label}
            {property.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        {renderPropertyInput()}
        {property.validation?.message && (
          <p className="text-xs text-muted-foreground">
            {property.validation.message}
          </p>
        )}
      </div>
    );
  };

  const renderSpacingControls = (type: 'padding' | 'margin') => {
    const currentValue = block.styles[type] || {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    };

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Move className="h-4 w-4" />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(['top', 'right', 'bottom', 'left'] as const).map(side => (
            <div key={side} className="flex items-center justify-between">
              <Label className="text-xs capitalize">{side}</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[currentValue[side] || 0]}
                  onValueChange={([value]) =>
                    handleStyleUpdate(type, { ...currentValue, [side]: value })
                  }
                  min={0}
                  max={100}
                  step={1}
                  className="w-20"
                />
                <span className="text-xs w-8 text-right">
                  {currentValue[side] || 0}px
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderColorControls = () => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Colors & Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Background Color</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={block.styles.backgroundColor || '#ffffff'}
              onChange={e =>
                handleStyleUpdate('backgroundColor', e.target.value)
              }
              className="w-16 h-8 p-1"
            />
            <Input
              value={block.styles.backgroundColor || '#ffffff'}
              onChange={e =>
                handleStyleUpdate('backgroundColor', e.target.value)
              }
              placeholder="#ffffff"
              className="text-xs"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Opacity</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[block.styles.opacity || 1]}
              onValueChange={([value]) => handleStyleUpdate('opacity', value)}
              min={0}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <span className="text-xs w-10 text-right">
              {Math.round((block.styles.opacity || 1) * 100)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{config.name}</h3>
          <Badge variant="outline" className="text-xs">
            {block.type}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{config.description}</p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={value =>
          setActiveTab(value as 'content' | 'style' | 'responsive')
        }
        className="flex-1"
      >
        <div className="border-b">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="content" className="text-xs py-2">
              <Type className="h-3 w-3 mr-1" />
              Content
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs py-2">
              <Palette className="h-3 w-3 mr-1" />
              Style
            </TabsTrigger>
            <TabsTrigger value="responsive" className="text-xs py-2">
              <Monitor className="h-3 w-3 mr-1" />
              Responsive
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="content" className="p-4 space-y-4 m-0">
            {config.properties.map(renderProperty)}
          </TabsContent>

          <TabsContent value="style" className="p-4 space-y-4 m-0">
            {renderSpacingControls('padding')}
            {renderSpacingControls('margin')}
            {renderColorControls()}
          </TabsContent>

          <TabsContent value="responsive" className="p-4 space-y-4 m-0">
            <div className="flex gap-1 p-1 bg-muted rounded-md mb-4">
              <Button
                variant={viewport === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('desktop')}
                className="flex-1 h-8"
              >
                <Monitor className="h-3 w-3 mr-1" />
                Desktop
              </Button>
              <Button
                variant={viewport === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('tablet')}
                className="flex-1 h-8"
              >
                <Tablet className="h-3 w-3 mr-1" />
                Tablet
              </Button>
              <Button
                variant={viewport === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewport('mobile')}
                className="flex-1 h-8"
              >
                <Smartphone className="h-3 w-3 mr-1" />
                Mobile
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground mb-4">
              Configure styles for {viewport} devices
            </div>

            {/* Responsive style controls would go here */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  {viewport.charAt(0).toUpperCase() + viewport.slice(1)} Styles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Responsive style controls will be implemented here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

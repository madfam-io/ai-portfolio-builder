'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Search,
  Star,
  Type,
  Image,
  Video,
  Layout,
  Zap,
  User,
  Briefcase,
  GraduationCap,
  Mail,
  Quote,
  BarChart,
  Clock,
  CreditCard,
  HelpCircle,
  Folder,
  Plus,
  Grid,
  Minus,
  MoveVertical,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { blockConfigs } from '@/lib/editor/block-configs';
import type { BlockType, BlockConfig } from '@/types/editor';

const iconMap: Record<string, React.ReactNode> = {
  star: <Star className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  folder: <Folder className="h-4 w-4" />,
  briefcase: <Briefcase className="h-4 w-4" />,
  'graduation-cap': <GraduationCap className="h-4 w-4" />,
  mail: <Mail className="h-4 w-4" />,
  quote: <Quote className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  type: <Type className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  minus: <Minus className="h-4 w-4" />,
  'move-vertical': <MoveVertical className="h-4 w-4" />,
  'share-2': <Share2 className="h-4 w-4" />,
  'external-link': <ExternalLink className="h-4 w-4" />,
  'bar-chart': <BarChart className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  'credit-card': <CreditCard className="h-4 w-4" />,
  'help-circle': <HelpCircle className="h-4 w-4" />,
  grid: <Grid className="h-4 w-4" />,
};

interface DraggableBlockProps {
  config: BlockConfig;
}

function DraggableBlock({ config }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `block-type-${config.type}`,
      data: { type: config.type, config },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        isDragging ? 'opacity-50' : ''
      }`}
      {...listeners}
      {...attributes}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
            {iconMap[config.icon] || <Plus className="h-4 w-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium truncate">{config.name}</h4>
              {config.maxInstances && (
                <Badge variant="secondary" className="text-xs">
                  1x
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {config.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BlockLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Blocks', count: Object.keys(blockConfigs).length },
    { id: 'content', name: 'Content', count: 0 },
    { id: 'layout', name: 'Layout', count: 0 },
    { id: 'media', name: 'Media', count: 0 },
    { id: 'interactive', name: 'Interactive', count: 0 },
  ];

  // Calculate category counts
  Object.values(blockConfigs).forEach(config => {
    const category = categories.find(cat => cat.id === config.category);
    if (category) category.count++;
  });

  const filteredBlocks = Object.values(blockConfigs).filter(config => {
    const matchesSearch =
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === 'all' || config.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedBlocks = filteredBlocks.reduce(
    (groups, config) => {
      const category = config.category;
      if (!groups[category]) groups[category] = [];
      groups[category].push(config);
      return groups;
    },
    {} as Record<string, BlockConfig[]>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="border-b">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-2 h-auto p-1">
            <TabsTrigger value="all" className="text-xs py-2">
              All ({categories.find(c => c.id === 'all')?.count})
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs py-2">
              Content ({categories.find(c => c.id === 'content')?.count})
            </TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 mt-1">
            <TabsTrigger value="layout" className="text-xs py-2">
              Layout ({categories.find(c => c.id === 'layout')?.count})
            </TabsTrigger>
            <TabsTrigger value="media" className="text-xs py-2">
              Media ({categories.find(c => c.id === 'media')?.count})
            </TabsTrigger>
            <TabsTrigger value="interactive" className="text-xs py-2">
              Interactive ({categories.find(c => c.id === 'interactive')?.count}
              )
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Block List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {activeCategory === 'all' ? (
            // Show all blocks grouped by category
            Object.entries(groupedBlocks).map(([category, configs]) => (
              <div key={category}>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wider">
                  {category}
                </h3>
                <div className="space-y-2 mb-6">
                  {configs.map(config => (
                    <DraggableBlock key={config.type} config={config} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Show blocks for specific category
            <div className="space-y-2">
              {filteredBlocks.map(config => (
                <DraggableBlock key={config.type} config={config} />
              ))}
            </div>
          )}

          {filteredBlocks.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-2">No blocks found</h3>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
            <Plus className="h-3 w-3 mr-1" />
            Templates
          </Button>
          <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
            <Star className="h-3 w-3 mr-1" />
            Favorites
          </Button>
        </div>
      </div>
    </div>
  );
}

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

export interface EditorBlock {
  id: string;
  type: BlockType;
  data: any;
  styles: BlockStyles;
  responsive: ResponsiveStyles;
  animation?: AnimationConfig;
  order: number;
}

export type BlockType =
  | 'hero'
  | 'about'
  | 'skills'
  | 'projects'
  | 'experience'
  | 'education'
  | 'contact'
  | 'testimonials'
  | 'gallery'
  | 'text'
  | 'image'
  | 'video'
  | 'divider'
  | 'spacer'
  | 'social-links'
  | 'call-to-action'
  | 'stats'
  | 'timeline'
  | 'pricing'
  | 'faq';

export interface BlockStyles {
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundGradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    colors: Array<{ color: string; stop: number }>;
  };
  border?: {
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    color: string;
    radius: number;
  };
  shadow?: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  };
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'auto';
}

export interface ResponsiveStyles {
  desktop: BlockStyles;
  tablet?: Partial<BlockStyles>;
  mobile?: Partial<BlockStyles>;
}

export interface AnimationConfig {
  type: 'fade-in' | 'slide-in' | 'scale-in' | 'bounce-in' | 'rotate-in';
  duration: number;
  delay: number;
  easing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  trigger: 'on-load' | 'on-scroll' | 'on-hover' | 'on-click';
}

export interface EditorTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
    code: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

export interface EditorState {
  blocks: EditorBlock[];
  selectedBlockId: string | null;
  theme: EditorTheme;
  viewport: 'desktop' | 'tablet' | 'mobile';
  isPreviewMode: boolean;
  isDragging: boolean;
  history: {
    past: EditorBlock[][];
    present: EditorBlock[];
    future: EditorBlock[][];
  };
  settings: {
    showGrid: boolean;
    snapToGrid: boolean;
    gridSize: number;
    showRulers: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
  };
}

export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  blocks: Omit<EditorBlock, 'id' | 'order'>[];
  tags: string[];
  isPremium: boolean;
  price?: number;
}

export interface EditorAction {
  type:
    | 'ADD_BLOCK'
    | 'UPDATE_BLOCK'
    | 'DELETE_BLOCK'
    | 'REORDER_BLOCKS'
    | 'SELECT_BLOCK'
    | 'DESELECT_BLOCK'
    | 'SET_THEME'
    | 'SET_VIEWPORT'
    | 'TOGGLE_PREVIEW'
    | 'UNDO'
    | 'REDO'
    | 'SAVE'
    | 'LOAD'
    | 'RESET';
  payload?: any;
}

export interface BlockConfig {
  type: BlockType;
  name: string;
  icon: string;
  category: 'content' | 'layout' | 'media' | 'interactive';
  description: string;
  defaultData: any;
  defaultStyles: BlockStyles;
  properties: BlockProperty[];
  allowedChildren?: BlockType[];
  maxInstances?: number;
}

export interface BlockProperty {
  key: string;
  label: string;
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'color'
    | 'select'
    | 'checkbox'
    | 'image'
    | 'link'
    | 'array'
    | 'object'
    | 'spacing'
    | 'typography';
  required?: boolean;
  default?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    field: string;
    value: any;
  };
}

export interface DragEvent {
  type: 'block' | 'template';
  id: string;
  data: any;
  position: { x: number; y: number };
}

export interface DropZone {
  id: string;
  type: 'block' | 'section' | 'container';
  position: number;
  accepts: BlockType[];
  isActive: boolean;
  isHovered: boolean;
}

export interface EditorContextMenu {
  isOpen: boolean;
  position: { x: number; y: number };
  targetId: string | null;
  items: Array<{
    label: string;
    action: string;
    icon?: string;
    shortcut?: string;
    disabled?: boolean;
    separator?: boolean;
  }>;
}

export interface BlockValidation {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
  }>;
}

export interface EditorPreferences {
  autoSave: boolean;
  autoSaveInterval: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showBlockOutlines: boolean;
  enableAnimations: boolean;
  keyboardShortcuts: Record<string, string>;
  theme: 'light' | 'dark' | 'auto';
}

export interface EditorAnalytics {
  blocksUsed: Record<BlockType, number>;
  editingTime: number;
  actionsPerformed: Record<string, number>;
  templatesUsed: string[];
  lastSaved: Date;
  sessionId: string;
}

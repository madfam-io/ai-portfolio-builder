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

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  EditorState,
  EditorBlock,
  EditorTheme,
  EditorPreferences,
  BlockValidation,
  EditorContextMenu,
} from '@/types/editor';

interface EditorStore extends EditorState {
  // Actions
  addBlock: (
    block: Omit<EditorBlock, 'id' | 'order'>,
    position?: number
  ) => void;
  updateBlock: (id: string, updates: Partial<EditorBlock>) => void;
  deleteBlock: (id: string) => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  duplicateBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  setTheme: (theme: EditorTheme) => void;
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => void;
  togglePreview: () => void;
  undo: () => void;
  redo: () => void;
  save: () => Promise<void>;
  load: (blocks: EditorBlock[], theme?: EditorTheme) => void;
  reset: () => void;

  // Drag & Drop
  startDragging: (blockId: string) => void;
  stopDragging: () => void;

  // Context Menu
  contextMenu: EditorContextMenu;
  showContextMenu: (
    position: { x: number; y: number },
    targetId: string
  ) => void;
  hideContextMenu: () => void;

  // Validation
  validateBlock: (id: string) => BlockValidation;
  validateAll: () => Record<string, BlockValidation>;

  // Preferences
  preferences: EditorPreferences;
  updatePreferences: (preferences: Partial<EditorPreferences>) => void;

  // Utility
  getBlockById: (id: string) => EditorBlock | undefined;
  getBlockIndex: (id: string) => number;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

const defaultTheme: EditorTheme = {
  id: 'default',
  name: 'Default',
  colors: {
    primary: '#0f172a',
    secondary: '#64748b',
    accent: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#1e293b',
    textSecondary: '#64748b',
    border: '#e2e8f0',
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
    code: 'Fira Code, monospace',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  },
};

const defaultPreferences: EditorPreferences = {
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  showGrid: false,
  snapToGrid: false,
  gridSize: 8,
  showRulers: false,
  showBlockOutlines: false,
  enableAnimations: true,
  keyboardShortcuts: {
    save: 'Cmd+S',
    undo: 'Cmd+Z',
    redo: 'Cmd+Shift+Z',
    copy: 'Cmd+C',
    paste: 'Cmd+V',
    delete: 'Delete',
    duplicate: 'Cmd+D',
  },
  theme: 'light',
};

const initialState: EditorState = {
  blocks: [],
  selectedBlockId: null,
  theme: defaultTheme,
  viewport: 'desktop',
  isPreviewMode: false,
  isDragging: false,
  history: {
    past: [],
    present: [],
    future: [],
  },
  settings: {
    showGrid: false,
    snapToGrid: false,
    gridSize: 8,
    showRulers: false,
    autoSave: true,
    autoSaveInterval: 30000,
  },
};

export const useEditorStore = create<EditorStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialState,
        contextMenu: {
          isOpen: false,
          position: { x: 0, y: 0 },
          targetId: null,
          items: [],
        },
        preferences: defaultPreferences,

        addBlock: (block, position) => {
          set(state => {
            const newBlock: EditorBlock = {
              ...block,
              id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              order: position ?? state.blocks.length,
            };

            // Add to history
            state.history.past.push([...state.blocks]);
            state.history.future = [];

            // Insert at position or append
            if (position !== undefined && position < state.blocks.length) {
              state.blocks.splice(position, 0, newBlock);
              // Update order for subsequent blocks
              for (let i = position + 1; i < state.blocks.length; i++) {
                const block = state.blocks[i];
                if (block) {
                  block.order = i;
                }
              }
            } else {
              state.blocks.push(newBlock);
            }

            // Select the new block
            state.selectedBlockId = newBlock.id;
          });
        },

        updateBlock: (id, updates) => {
          set(state => {
            const blockIndex = state.blocks.findIndex(block => block.id === id);
            if (blockIndex !== -1) {
              // Add to history
              state.history.past.push([...state.blocks]);
              state.history.future = [];

              // Update block
              const block = state.blocks[blockIndex];
              if (block) {
                Object.assign(block, updates);
              }
            }
          });
        },

        deleteBlock: id => {
          set(state => {
            const blockIndex = state.blocks.findIndex(block => block.id === id);
            if (blockIndex !== -1) {
              // Add to history
              state.history.past.push([...state.blocks]);
              state.history.future = [];

              // Remove block
              state.blocks.splice(blockIndex, 1);

              // Update order for subsequent blocks
              for (let i = blockIndex; i < state.blocks.length; i++) {
                const block = state.blocks[i];
                if (block) {
                  block.order = i;
                }
              }

              // Clear selection if deleted block was selected
              if (state.selectedBlockId === id) {
                state.selectedBlockId = null;
              }
            }
          });
        },

        reorderBlocks: (fromIndex, toIndex) => {
          set(state => {
            if (fromIndex === toIndex) return;

            // Add to history
            state.history.past.push([...state.blocks]);
            state.history.future = [];

            // Move block
            const [movedBlock] = state.blocks.splice(fromIndex, 1);
            if (movedBlock) {
              state.blocks.splice(toIndex, 0, movedBlock);
            }

            // Update order for all blocks
            state.blocks.forEach((block, index) => {
              block.order = index;
            });
          });
        },

        duplicateBlock: id => {
          set(state => {
            const block = state.blocks.find(b => b.id === id);
            if (block) {
              const duplicatedBlock: EditorBlock = {
                ...JSON.parse(JSON.stringify(block)), // Deep clone
                id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                order: block.order + 1,
              };

              // Add to history
              state.history.past.push([...state.blocks]);
              state.history.future = [];

              // Insert after original block
              const insertIndex = block.order + 1;
              state.blocks.splice(insertIndex, 0, duplicatedBlock);

              // Update order for subsequent blocks
              for (let i = insertIndex + 1; i < state.blocks.length; i++) {
                const block = state.blocks[i];
                if (block) {
                  block.order = i;
                }
              }

              // Select duplicated block
              state.selectedBlockId = duplicatedBlock.id;
            }
          });
        },

        selectBlock: id => {
          set(state => {
            state.selectedBlockId = id;
          });
        },

        setTheme: theme => {
          set(state => {
            state.theme = theme;
          });
        },

        setViewport: viewport => {
          set(state => {
            state.viewport = viewport;
          });
        },

        togglePreview: () => {
          set(state => {
            state.isPreviewMode = !state.isPreviewMode;
            if (state.isPreviewMode) {
              state.selectedBlockId = null;
            }
          });
        },

        undo: () => {
          set(state => {
            if (state.history.past.length > 0) {
              const previous = state.history.past.pop();
              if (!previous) return;
              state.history.future.unshift([...state.blocks]);
              state.blocks = previous;
              state.selectedBlockId = null;
            }
          });
        },

        redo: () => {
          set(state => {
            if (state.history.future.length > 0) {
              const next = state.history.future.shift();
              if (!next) return;
              state.history.past.push([...state.blocks]);
              state.blocks = next;
              state.selectedBlockId = null;
            }
          });
        },

        save: async () => {
          const _state = get();
          // Implementation would save to backend
          // Saving editor state
          await Promise.resolve();
        },

        load: (blocks, theme) => {
          set(state => {
            state.blocks = blocks;
            state.selectedBlockId = null;
            if (theme) {
              state.theme = theme;
            }
            // Reset history
            state.history = {
              past: [],
              present: [...blocks],
              future: [],
            };
          });
        },

        reset: () => {
          set(initialState);
        },

        startDragging: _blockId => {
          set(state => {
            state.isDragging = true;
          });
        },

        stopDragging: () => {
          set(state => {
            state.isDragging = false;
          });
        },

        showContextMenu: (position, targetId) => {
          set(state => {
            state.contextMenu = {
              isOpen: true,
              position,
              targetId,
              items: [
                { label: 'Edit', action: 'edit', icon: 'edit' },
                {
                  label: 'Duplicate',
                  action: 'duplicate',
                  icon: 'copy',
                  shortcut: 'Cmd+D',
                },
                {
                  label: 'Delete',
                  action: 'delete',
                  icon: 'trash',
                  shortcut: 'Del',
                },
                { separator: true, label: '', action: '' },
                { label: 'Move Up', action: 'move-up', icon: 'arrow-up' },
                { label: 'Move Down', action: 'move-down', icon: 'arrow-down' },
              ],
            };
          });
        },

        hideContextMenu: () => {
          set(state => {
            state.contextMenu.isOpen = false;
          });
        },

        validateBlock: id => {
          const block = get().blocks.find(b => b.id === id);
          if (!block) {
            return {
              isValid: false,
              errors: [
                {
                  field: 'id',
                  message: 'Block not found',
                  severity: 'error' as const,
                },
              ],
            };
          }

          const errors: BlockValidation['errors'] = [];

          // Basic validation logic
          if (!block.data) {
            errors.push({
              field: 'data',
              message: 'Block data is required',
              severity: 'error',
            });
          }

          return {
            isValid: errors.length === 0,
            errors,
          };
        },

        validateAll: () => {
          const blocks = get().blocks;
          const results: Record<string, BlockValidation> = {};

          blocks.forEach(block => {
            results[block.id] = get().validateBlock(block.id);
          });

          return results;
        },

        updatePreferences: preferences => {
          set(state => {
            Object.assign(state.preferences, preferences);
          });
        },

        getBlockById: id => {
          return get().blocks.find(block => block.id === id);
        },

        getBlockIndex: id => {
          return get().blocks.findIndex(block => block.id === id);
        },

        canUndo: () => {
          return get().history.past.length > 0;
        },

        canRedo: () => {
          return get().history.future.length > 0;
        },
      }))
    ),
    { name: 'editor-store' }
  )
);

// Auto-save functionality
let autoSaveTimer: NodeJS.Timeout;

useEditorStore.subscribe(
  state => state.blocks,
  _blocks => {
    const { preferences, save } = useEditorStore.getState();

    if (preferences.autoSave) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        save();
      }, preferences.autoSaveInterval);
    }
  }
);

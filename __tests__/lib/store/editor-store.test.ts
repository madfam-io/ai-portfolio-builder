import { act, renderHook } from '@testing-library/react';
import { useEditorStore } from '@/lib/store/editor-store';

describe('EditorStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useEditorStore());
    act(() => {
      result.current.reset();
    });
  });

  describe('Basic State Management', () => {
    it('should have initial state', () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.activeSection).toBe('hero');
      expect(result.current.isPreviewMode).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.hasUnsavedChanges).toBe(false);
      expect(result.current.selectedTemplate).toBe('developer');
    });

    it('should update active section', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setActiveSection('projects');
      });

      expect(result.current.activeSection).toBe('projects');
    });

    it('should toggle preview mode', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.togglePreviewMode();
      });

      expect(result.current.isPreviewMode).toBe(true);

      act(() => {
        result.current.togglePreviewMode();
      });

      expect(result.current.isPreviewMode).toBe(false);
    });

    it('should set preview mode explicitly', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setPreviewMode(true);
      });

      expect(result.current.isPreviewMode).toBe(true);
    });
  });

  describe('Save State Management', () => {
    it('should track saving state', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setSaving(true);
      });

      expect(result.current.isSaving).toBe(true);

      act(() => {
        result.current.setSaving(false);
      });

      expect(result.current.isSaving).toBe(false);
    });

    it('should track unsaved changes', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setHasUnsavedChanges(true);
      });

      expect(result.current.hasUnsavedChanges).toBe(true);

      act(() => {
        result.current.setHasUnsavedChanges(false);
      });

      expect(result.current.hasUnsavedChanges).toBe(false);
    });

    it('should update last saved time', () => {
      const { result } = renderHook(() => useEditorStore());
      const now = new Date();

      act(() => {
        result.current.updateLastSaved(now);
      });

      expect(result.current.lastSaved).toEqual(now);
    });
  });

  describe('Template Management', () => {
    it('should update selected template', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setSelectedTemplate('designer');
      });

      expect(result.current.selectedTemplate).toBe('designer');
    });

    it('should store template customization', () => {
      const { result } = renderHook(() => useEditorStore());
      const customization = {
        primaryColor: '#6366f1',
        fontFamily: 'Inter',
        darkMode: true
      };

      act(() => {
        result.current.setTemplateCustomization(customization);
      });

      expect(result.current.templateCustomization).toEqual(customization);
    });
  });

  describe('Editor Settings', () => {
    it('should toggle auto-save', () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.autoSaveEnabled).toBe(true); // Default

      act(() => {
        result.current.toggleAutoSave();
      });

      expect(result.current.autoSaveEnabled).toBe(false);
    });

    it('should update auto-save interval', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setAutoSaveInterval(60000); // 1 minute
      });

      expect(result.current.autoSaveInterval).toBe(60000);
    });

    it('should toggle sidebar visibility', () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.sidebarCollapsed).toBe(false); // Default

      act(() => {
        result.current.toggleSidebar();
      });

      expect(result.current.sidebarCollapsed).toBe(true);
    });
  });

  describe('History Management', () => {
    it('should track edit history', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.addToHistory({
          action: 'update',
          section: 'hero',
          previousValue: { title: 'Old Title' },
          newValue: { title: 'New Title' },
          timestamp: new Date()
        });
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.history[0].action).toBe('update');
    });

    it('should clear history', () => {
      const { result } = renderHook(() => useEditorStore());

      // Add some history
      act(() => {
        result.current.addToHistory({
          action: 'update',
          section: 'hero',
          previousValue: {},
          newValue: {},
          timestamp: new Date()
        });
      });

      expect(result.current.history).toHaveLength(1);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
    });

    it('should limit history size', () => {
      const { result } = renderHook(() => useEditorStore());

      // Add more than limit (assuming limit is 50)
      for (let i = 0; i < 60; i++) {
        act(() => {
          result.current.addToHistory({
            action: 'update',
            section: 'hero',
            previousValue: { index: i },
            newValue: { index: i + 1 },
            timestamp: new Date()
          });
        });
      }

      expect(result.current.history.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Error Handling', () => {
    it('should set and clear errors', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setError('Failed to save portfolio');
      });

      expect(result.current.error).toBe('Failed to save portfolio');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Section Management', () => {
    it('should track enabled sections', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setEnabledSections(['hero', 'about', 'projects']);
      });

      expect(result.current.enabledSections).toEqual(['hero', 'about', 'projects']);
    });

    it('should toggle section visibility', () => {
      const { result } = renderHook(() => useEditorStore());

      // Initialize with some sections
      act(() => {
        result.current.setEnabledSections(['hero', 'about']);
      });

      // Enable a new section
      act(() => {
        result.current.toggleSection('projects');
      });

      expect(result.current.enabledSections).toContain('projects');

      // Disable an existing section
      act(() => {
        result.current.toggleSection('about');
      });

      expect(result.current.enabledSections).not.toContain('about');
    });
  });

  describe('Preview Settings', () => {
    it('should set preview device', () => {
      const { result } = renderHook(() => useEditorStore());

      act(() => {
        result.current.setPreviewDevice('tablet');
      });

      expect(result.current.previewDevice).toBe('tablet');
    });

    it('should toggle preview theme', () => {
      const { result } = renderHook(() => useEditorStore());

      expect(result.current.previewTheme).toBe('light'); // Default

      act(() => {
        result.current.togglePreviewTheme();
      });

      expect(result.current.previewTheme).toBe('dark');
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to initial state', () => {
      const { result } = renderHook(() => useEditorStore());

      // Make various changes
      act(() => {
        result.current.setActiveSection('projects');
        result.current.setPreviewMode(true);
        result.current.setSaving(true);
        result.current.setError('Test error');
        result.current.setSelectedTemplate('designer');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      // Check all values are back to initial
      expect(result.current.activeSection).toBe('hero');
      expect(result.current.isPreviewMode).toBe(false);
      expect(result.current.isSaving).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.selectedTemplate).toBe('developer');
    });
  });

  describe('Persistence', () => {
    it('should persist state across renders', () => {
      const { result: result1 } = renderHook(() => useEditorStore());

      act(() => {
        result1.current.setActiveSection('experience');
        result1.current.setSelectedTemplate('consultant');
      });

      // Create new hook instance
      const { result: result2 } = renderHook(() => useEditorStore());

      // State should be persisted
      expect(result2.current.activeSection).toBe('experience');
      expect(result2.current.selectedTemplate).toBe('consultant');
    });
  });
});
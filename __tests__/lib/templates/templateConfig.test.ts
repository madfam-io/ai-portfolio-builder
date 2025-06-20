import { describe, test, it, expect, jest, beforeEach } from '@jest/globals';
import { TemplateType, SectionType } from '@/types/portfolio';

/**
 * @jest-environment node
 */

import {
  TEMPLATE_SECTIONS,
  TEMPLATE_CONFIGS,
  getTemplateConfig,
  getAvailableTemplates,
  TemplateConfig,
  TemplateSection,
} from '@/lib/templates/template-config';

describe('Template Configuration', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  describe('TEMPLATE_SECTIONS', () => {
    it('should have all required section properties', async () => {
      TEMPLATE_SECTIONS.forEach(section => {
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('label');
        expect(section).toHaveProperty('required');
        expect(section).toHaveProperty('defaultVisible');
        expect(section).toHaveProperty('description');
        expect(section).toHaveProperty('icon');

        expect(typeof section.id).toBe('string');
        expect(typeof section.label).toBe('string');
        expect(typeof section.required).toBe('boolean');
        expect(typeof section.defaultVisible).toBe('boolean');
        expect(typeof section.description).toBe('string');
        expect(typeof section.icon).toBe('string');
      });
    });

    it('should include required sections', async () => {
      const requiredSections = TEMPLATE_SECTIONS.filter(s => s.required);
      const requiredSectionIds = requiredSections.map(s => s.id);

      expect(requiredSectionIds).toContain('hero');
      expect(requiredSectionIds).toContain('contact');
      expect(requiredSections.length).toBeGreaterThanOrEqual(2);
    });

    it('should have unique section IDs', async () => {
      const sectionIds = TEMPLATE_SECTIONS.map(s => s.id);
      const uniqueIds = new Set(sectionIds);

      expect(sectionIds).toHaveLength(uniqueIds.size);
    });

    it('should have valid emoji icons', async () => {
      TEMPLATE_SECTIONS.forEach(section => {
        // Check for any Unicode emoji or symbol
        expect(section.icon.length).toBeGreaterThan(0);
        expect(section.icon.length).toBeLessThanOrEqual(2);
        // Should be some kind of visual symbol
        expect(section.icon).toMatch(
          /[\u{1F000}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]|⚡|📞|👋|👤|💼|🚀|🎓|💬/u

      });
    });

    it('should include all standard portfolio sections', async () => {
      const expectedSections: SectionType[] = [
        'hero',
        'about',
        'experience',
        'projects',
        'skills',
        'education',
        'testimonials',
        'contact',
      ];

      expectedSections.forEach(expectedSection => {
        const section = TEMPLATE_SECTIONS.find(s => s.id === expectedSection);
        expect(section).toBeDefined();
        expect(section?.label).toBeTruthy();
        expect(section?.description).toBeTruthy();
      });
    });

    it('should have meaningful descriptions', async () => {
      TEMPLATE_SECTIONS.forEach(section => {
        expect(section.description.length).toBeGreaterThan(10);
        expect(section.description).not.toContain('TODO');
        expect(section.description).not.toContain('TBD');
      });
    });
  });

  describe('TEMPLATE_CONFIGS', () => {
    const templateTypes: TemplateType[] = [
      'developer',
      'designer',
      'consultant',
      'business',
      'creative',
      'minimal',
      'educator',
      'modern',
    ];

    it('should include all expected template types', async () => {
      templateTypes.forEach(templateType => {
        expect(TEMPLATE_CONFIGS).toHaveProperty(templateType);
      });
    });

    it('should have valid template configuration structure', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        expect(config).toHaveProperty('id');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('industry');
        expect(config).toHaveProperty('sections');
        expect(config).toHaveProperty('defaultOrder');
        expect(config).toHaveProperty('colorScheme');
        expect(config).toHaveProperty('layout');
        expect(config).toHaveProperty('features');
      });
    });

    it('should have valid color schemes', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        const { colorScheme } = config;

        expect(colorScheme).toHaveProperty('primary');
        expect(colorScheme).toHaveProperty('secondary');
        expect(colorScheme).toHaveProperty('accent');
        expect(colorScheme).toHaveProperty('background');
        expect(colorScheme).toHaveProperty('text');

        // Test valid hex color format
        expect(colorScheme.primary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.secondary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.accent).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.background).toMatch(/^#[0-9A-F]{6}$/i);
        expect(colorScheme.text).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should have valid layout configurations', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        const { layout } = config;

        expect(['minimal', 'bold', 'creative']).toContain(layout.headerStyle);
        expect(['compact', 'normal', 'relaxed']).toContain(
          layout.sectionSpacing

        expect(['modern', 'classic', 'creative']).toContain(layout.typography);
      });
    });

    it('should have valid feature configurations', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        const { features } = config;

        expect(typeof features.showcaseProjects).toBe('boolean');
        expect(typeof features.emphasizeSkills).toBe('boolean');
        expect(typeof features.includeTestimonials).toBe('boolean');
        expect(['icons', 'buttons', 'minimal']).toContain(
          features.socialLinksStyle

      });
    });

    it('should include required sections in default order', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        const requiredSections = TEMPLATE_SECTIONS.filter(s => s.required).map(
          s => s.id

        requiredSections.forEach(sectionId => {
          expect(config.defaultOrder).toContain(sectionId);
        });
      });
    });

    it('should have unique default orders per template', async () => {
      const orders = Object.values(TEMPLATE_CONFIGS).map(config =>
        config.defaultOrder.join(',')

      // Most templates should have different section orders
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBeGreaterThan(1);
    });

    it('should have industry-specific configurations', async () => {
      // Developer template should emphasize technical skills
      expect(TEMPLATE_CONFIGS.developer.features.emphasizeSkills).toBe(true);
      expect(TEMPLATE_CONFIGS.developer.features.showcaseProjects).toBe(true);

      // Designer template should showcase projects prominently
      expect(TEMPLATE_CONFIGS.designer.features.showcaseProjects).toBe(true);
      expect(TEMPLATE_CONFIGS.designer.defaultOrder[1]).toBe('projects');

      // Consultant template should include testimonials
      expect(TEMPLATE_CONFIGS.consultant.features.includeTestimonials).toBe(
        true

      // Minimal template should be simple
      expect(TEMPLATE_CONFIGS.minimal.features.showcaseProjects).toBe(false);
      expect(TEMPLATE_CONFIGS.minimal.features.includeTestimonials).toBe(false);
    });

    it('should have meaningful template descriptions', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        expect(config.description.length).toBeGreaterThan(20);
        // Description should be relevant to the template (more flexible check)
        expect(config.description).toBeTruthy();
        expect(config.description).not.toContain('TODO');
        expect(config.description).not.toContain('TBD');
      });
    });

    it('should have relevant industry tags', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        expect(config.industry.length).toBeGreaterThan(0);
        config.industry.forEach(industry => {
          expect(industry.length).toBeGreaterThan(2);
          expect(industry).not.toContain('TODO');
        });
      });
    });
  });

  describe('getTemplateConfig', () => {
    it('should return correct template config', async () => {
      const config = getTemplateConfig('developer');

      expect(config.id).toBe('developer');
      expect(config.name).toBe('Developer');
      expect(config.industry).toContain('Software Engineering');
    });

    it('should return valid config for all template types', async () => {
      const templateTypes: TemplateType[] = [
        'developer',
        'designer',
        'consultant',
        'business',
        'creative',
        'minimal',
        'educator',
        'modern',
      ];

      templateTypes.forEach(templateType => {
        const config = getTemplateConfig(templateType);
        expect(config).toBeDefined();
        expect(config.id).toBe(templateType);
      });
    });

    it('should return config with all required properties', async () => {
      const config = getTemplateConfig('developer');

      expect(config).toHaveProperty('id');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('description');
      expect(config).toHaveProperty('industry');
      expect(config).toHaveProperty('sections');
      expect(config).toHaveProperty('defaultOrder');
      expect(config).toHaveProperty('colorScheme');
      expect(config).toHaveProperty('layout');
      expect(config).toHaveProperty('features');
    });

    it('should return consistent config object', async () => {
      const config1 = getTemplateConfig('developer');
      const config2 = getTemplateConfig('developer');

      // Both configs should be identical
      expect(config1).toEqual(config2);
      expect(config1.id).toBe(config2.id);
      expect(config1.name).toBe(config2.name);
    });
  });

  describe('getAvailableTemplates', () => {
    it('should return array of template summaries', async () => {
      const templates = getAvailableTemplates();

      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should include essential template info', async () => {
      const templates = getAvailableTemplates();

      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('industry');
        expect(template).toHaveProperty('colorScheme');
      });
    });

    it('should include all template types', async () => {
      const templates = getAvailableTemplates();
      const templateIds = templates.map(t => t.id);

      const expectedIds: TemplateType[] = [
        'developer',
        'designer',
        'consultant',
        'business',
        'creative',
        'minimal',
        'educator',
        'modern',
      ];

      expectedIds.forEach(expectedId => {
        expect(templateIds).toContain(expectedId);
      });
    });

    it('should return templates with valid color schemes', async () => {
      const templates = getAvailableTemplates();

      templates.forEach(template => {
        expect(template.colorScheme.primary).toMatch(/^#[0-9A-F]{6}$/i);
        expect(template.colorScheme.background).toMatch(/^#[0-9A-F]{6}$/i);
      });
    });

    it('should not expose internal template details', async () => {
      const templates = getAvailableTemplates();

      templates.forEach(template => {
        expect(template).not.toHaveProperty('sections');
        expect(template).not.toHaveProperty('defaultOrder');
        expect(template).not.toHaveProperty('layout');
        expect(template).not.toHaveProperty('features');
      });
    });
  });

  describe('Template Validation', () => {
    it('should have consistent section references', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        config.defaultOrder.forEach(sectionId => {
          const sectionExists = TEMPLATE_SECTIONS.some(s => s.id === sectionId);
          expect(sectionExists).toBe(true);
        });
      });
    });

    it('should not have duplicate sections in default order', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        const uniqueSections = new Set(config.defaultOrder);
        expect(config.defaultOrder.length).toBe(uniqueSections.size);
      });
    });

    it('should have appropriate color contrast', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        const { colorScheme } = config;

        // Ensure text and background colors are different
        expect(colorScheme.text).not.toBe(colorScheme.background);

        // Ensure primary and background colors are different
        expect(colorScheme.primary).not.toBe(colorScheme.background);
      });
    });

    it('should have logical feature combinations', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        // If showcasing projects, should probably include them early in order
        if (config.features.showcaseProjects) {
          const projectsIndex = config.defaultOrder.indexOf('projects');
          expect(projectsIndex).toBeLessThanOrEqual(4); // Should be in top 5 sections
        }

        // If emphasizing skills, should include skills section
        if (config.features.emphasizeSkills) {
          expect(config.defaultOrder).toContain('skills');
        }
      });
    });
  });

  describe('Accessibility and Usability', () => {
    it('should have descriptive section labels', async () => {
      TEMPLATE_SECTIONS.forEach(section => {
        expect(section.label).not.toBe(section.id);
        expect(section.label.length).toBeGreaterThan(2);

        // Should be title case or properly formatted
        expect(section.label[0]).toBe(section.label[0].toUpperCase());
      });
    });

    it('should have accessible color combinations', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        const { colorScheme } = config;

        // Basic check: ensure we have dark text on light background or vice versa
        const textBrightness = parseInt(colorScheme.text.slice(1), 16);
        const backgroundBrightness = parseInt(
          colorScheme.background.slice(1),
          16

        // Should have sufficient contrast (simplified check)
        const contrastRatio = Math.abs(textBrightness - backgroundBrightness);
        expect(contrastRatio).toBeGreaterThan(0x400000); // Minimum contrast
      });
    });

    it('should have user-friendly template names', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        expect(config.name).not.toContain('_');
        expect(config.name).not.toContain('-');
        expect(config.name[0]).toBe(config.name[0].toUpperCase());
      });
    });
  });

  describe('Performance Considerations', () => {
    it('should have reasonable number of sections per template', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        // Should not overwhelm users with too many sections
        expect(config.defaultOrder.length).toBeLessThanOrEqual(10);
        expect(config.defaultOrder.length).toBeGreaterThanOrEqual(4);
      });
    });

    it('should have efficient data structure', async () => {
      // Configuration should be serializable
      expect(() => JSON.stringify(TEMPLATE_CONFIGS)).not.toThrow();

      // Should not have circular references
      const serialized = JSON.stringify(TEMPLATE_CONFIGS);
      const deserialized = JSON.parse(serialized);
      expect(deserialized).toEqual(TEMPLATE_CONFIGS);
    });

    it('should have minimal memory footprint', async () => {
      const configSize = JSON.stringify(TEMPLATE_CONFIGS).length;

      // Configuration should be reasonable size (less than 50KB)
      expect(configSize).toBeLessThan(50000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing template gracefully', async () => {
      // This should not throw, but return undefined or handle gracefully
      // Note: The current implementation doesn't handle this case
      const invalidTemplate = 'nonexistent' as TemplateType;
      expect(() => getTemplateConfig(invalidTemplate)).not.toThrow();
    });

    it('should handle empty industry arrays', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        expect(config.industry.length).toBeGreaterThan(0);
      });
    });

    it('should handle special characters in descriptions', async () => {
      Object.values(TEMPLATE_CONFIGS).forEach(config => {
        // Should not contain problematic characters
        expect(config.description).not.toContain('<');
        expect(config.description).not.toContain('>');
        expect(config.description).not.toContain('&lt;');
        expect(config.description).not.toContain('&gt;');
      });
    });

    it('should maintain consistency across similar templates', async () => {
      // Creative templates should share some characteristics
      const creativeTemplates = ['designer', 'creative'];
      const creativeConfigs = creativeTemplates.map(
        t => TEMPLATE_CONFIGS[t as TemplateType]

      creativeConfigs.forEach(config => {
        expect(config.layout.headerStyle).toMatch(/creative|bold/);
        expect(config.features.showcaseProjects).toBe(true);
      });
    });
  });

  describe('Business Logic Validation', () => {
    it('should prioritize projects for project-heavy roles', async () => {
      const projectHeavyTemplates = ['developer', 'designer', 'creative'];

      projectHeavyTemplates.forEach(templateType => {
        const config = TEMPLATE_CONFIGS[templateType as TemplateType];
        const projectsIndex = config.defaultOrder.indexOf('projects');

        // Projects should appear early (within first 3 sections)
        expect(projectsIndex).toBeLessThan(3);
        expect(config.features.showcaseProjects).toBe(true);
      });
    });

    it('should emphasize experience for senior roles', async () => {
      const seniorRoleTemplates = ['consultant', 'business', 'educator'];

      seniorRoleTemplates.forEach(templateType => {
        const config = TEMPLATE_CONFIGS[templateType as TemplateType];
        const experienceIndex = config.defaultOrder.indexOf('experience');

        // Experience should appear early
        expect(experienceIndex).toBeLessThan(4);
      });
    });

    it('should include testimonials for client-facing roles', async () => {
      const clientFacingTemplates = ['consultant', 'business', 'designer'];

      clientFacingTemplates.forEach(templateType => {
        const config = TEMPLATE_CONFIGS[templateType as TemplateType];
        expect(config.features.includeTestimonials).toBe(true);
      });
    });

    it('should have appropriate typography for template purpose', async () => {
      // Technical templates should use modern typography
      expect(TEMPLATE_CONFIGS.developer.layout.typography).toBe('modern');
      expect(TEMPLATE_CONFIGS.modern.layout.typography).toBe('modern');

      // Business templates should use classic typography
      expect(TEMPLATE_CONFIGS.business.layout.typography).toBe('classic');
      expect(TEMPLATE_CONFIGS.consultant.layout.typography).toBe('classic');

      // Creative templates should use creative typography
      expect(TEMPLATE_CONFIGS.creative.layout.typography).toBe('creative');
      expect(TEMPLATE_CONFIGS.designer.layout.typography).toBe('creative');
    });
  });
});

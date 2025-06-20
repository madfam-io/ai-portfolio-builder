import { jest, describe, test, it, expect, beforeEach } from '@jest/globals';
import React from 'react';
(<EditorSidebar {...mockProps} activeSection="about" />);

      const aboutSection = screen.getByText('About Section').closest('button');
      expect(aboutSection).toHaveClass('bg-primary/10');

      heroSection = screen.getByText('Hero Section').closest('button');
      expect(heroSection).not.toHaveClass('bg-primary/10');
    });
  });

  describe('Section Actions', () => {
    it('should show add buttons for list sections', async () => {
      renderEditorSidebar();

      expect(screen.getByText('Add Experience')).toBeInTheDocument();
      expect(screen.getByText('Add Education')).toBeInTheDocument();
      expect(screen.getByText('Add Project')).toBeInTheDocument();
      expect(screen.getByText('Add Skill')).toBeInTheDocument();
      expect(screen.getByText('Add Certification')).toBeInTheDocument();
    });

    it('should call onSectionUpdate when adding experience', async () => {
      const user = userEvent.setup();
      renderEditorSidebar();

      const addExperienceButton = screen.getByText('Add Experience');
      await user.click(addExperienceButton);

      expect(mockProps.onSectionUpdate).toHaveBeenCalledWith(
        'experience',
        expect.any(Object)

    });

    it('should call onSectionUpdate when adding education', async () => {
      const user = userEvent.setup();
      renderEditorSidebar();

      const addEducationButton = screen.getByText('Add Education');
      await user.click(addEducationButton);

      expect(mockProps.onSectionUpdate).toHaveBeenCalledWith(
        'education',
        expect.any(Object)

    });

    it('should call onSectionUpdate when adding project', async () => {
      const user = userEvent.setup();
      renderEditorSidebar();

      const addProjectButton = screen.getByText('Add Project');
      await user.click(addProjectButton);

      expect(mockProps.onSectionUpdate).toHaveBeenCalledWith(
        'projects',
        expect.any(Object)

    });

    it('should call onSectionUpdate when adding skill', async () => {
      const user = userEvent.setup();
      renderEditorSidebar();

      const addSkillButton = screen.getByText('Add Skill');
      await user.click(addSkillButton);

      expect(mockProps.onSectionUpdate).toHaveBeenCalledWith(
        'skills',
        expect.any(Object)

    });

    it('should call onSectionUpdate when adding certification', async () => {
      const user = userEvent.setup();
      renderEditorSidebar();

      const addCertificationButton = screen.getByText('Add Certification');
      await user.click(addCertificationButton);

      expect(mockProps.onSectionUpdate).toHaveBeenCalledWith(
        'certifications',
        expect.any(Object)

    });
  });

  describe('Section Completion Status', () => {
    it('should mark hero section as complete when title exists', async () => {
      renderEditorSidebar();

      const heroSection = screen.getByText('Hero Section').closest('div');
      expect(heroSection).toContainElement(screen.getByText('Complete'));
    });

    it('should mark hero section as incomplete when title is missing', async () => {
      renderEditorSidebar({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          title: '',
        },
      });

      const heroSection = screen.getByText('Hero Section').closest('div');
      expect(heroSection).toContainElement(screen.getByText('Incomplete'));
    });

    it('should mark about section as complete when bio exists', async () => {
      renderEditorSidebar();

      const aboutSection = screen.getByText('About Section').closest('div');
      expect(aboutSection).toContainElement(screen.getByText('Complete'));
    });

    it('should mark projects section as complete when projects exist', async () => {
      renderEditorSidebar();

      const projectsSection = screen.getByText('Projects').closest('div');
      expect(projectsSection).toContainElement(screen.getByText('Complete'));
    });

    it('should mark sections as incomplete when data is missing', async () => {
      renderEditorSidebar({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          experience: [],
          education: [],
          skills: [],
          certifications: [],
        },
      });

      const experienceSection = screen.getByText('Experience').closest('div');
      const educationSection = screen.getByText('Education').closest('div');
      const skillsSection = screen.getByText('Skills').closest('div');
      const certificationsSection = screen
        .getByText('Certifications')
        .closest('div');

      expect(experienceSection).toContainElement(
        screen.getByText('Incomplete')

      expect(educationSection).toContainElement(screen.getByText('Incomplete'));
      expect(skillsSection).toContainElement(screen.getByText('Incomplete'));
      expect(certificationsSection).toContainElement(
        screen.getByText('Incomplete')

    });
  });

  describe('Contact Section', () => {
    it('should show edit contact button', async () => {
      renderEditorSidebar();
      expect(screen.getByText('Edit Contact')).toBeInTheDocument();
    });

    it('should call onSectionUpdate when editing contact', async () => {
      const user = userEvent.setup();
      renderEditorSidebar();

      const editContactButton = screen.getByText('Edit Contact');
      await user.click(editContactButton);

      expect(mockProps.onSectionUpdate).toHaveBeenCalledWith(
        'contact',
        expect.any(Object)

    });

    it('should mark contact as complete when email exists', async () => {
      renderEditorSidebar();

      const contactSection = screen.getByText('Contact').closest('div');
      expect(contactSection).toContainElement(screen.getByText('Complete'));
    });

    it('should mark contact as incomplete when email is missing', async () => {
      renderEditorSidebar({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          contact: { email: '' },
        },
      });

      const contactSection = screen.getByText('Contact').closest('div');
      expect(contactSection).toContainElement(screen.getByText('Incomplete'));
    });
  });

  describe('Social Links Section', () => {
    it('should show social links information', async () => {
      renderEditorSidebar();
      expect(screen.getByText('Social Links')).toBeInTheDocument();
    });

    it('should display existing social links count', async () => {
      renderEditorSidebar();

      // Portfolio has LinkedIn and GitHub
      expect(screen.getByText(/2 links/)).toBeInTheDocument();
    });

    it('should show zero links when no social links exist', async () => {
      renderEditorSidebar({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          social: {},
        },
      });

      expect(screen.getByText(/0 links/)).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation between sections', async () => {
      renderEditorSidebar();

      const sections = screen.getAllByRole('button');

      // Focus first section
      sections[0].focus();
      expect(document.activeElement).toBe(sections[0]);

      // Tab to next section
      fireEvent.keyDown(sections[0], { key: 'Tab' });

      // All buttons should be focusable
      sections.forEach(section => {
        expect(section.tabIndex).toBeGreaterThanOrEqual(0);
      });
    });

    it('should handle Enter key for section selection', async () => {
      renderEditorSidebar();

      const aboutSection = screen.getByText('About Section');
      aboutSection.focus();

      fireEvent.keyDown(aboutSection, { key: 'Enter' });

      expect(mockProps.onSectionChange).toHaveBeenCalledWith('about');
    });

    it('should handle Space key for section selection', async () => {
      renderEditorSidebar();

      const projectsSection = screen.getByText('Projects');
      projectsSection.focus();

      fireEvent.keyDown(projectsSection, { key: ' ' });

      expect(mockProps.onSectionChange).toHaveBeenCalledWith('projects');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      renderEditorSidebar();

      const sections = screen.getAllByRole('button');
      sections.forEach(section => {
        expect(section).toHaveAttribute('aria-label');
      });
    });

    it('should indicate current section with aria-current', async () => {
      renderEditorSidebar({
        ...mockProps,
        activeSection: 'projects',
      });

      const projectsButton = screen.getByText('Projects').closest('button');
      expect(projectsButton).toHaveAttribute('aria-current', 'page');
    });

    it('should have proper heading structure', async () => {
      renderEditorSidebar();

      const heading = screen.getByRole('heading', {
        name: 'Portfolio Structure',
      });
      expect(heading).toBeInTheDocument();
    });

    it('should provide completion status to screen readers', async () => {
      renderEditorSidebar();

      const completeStatuses = screen.getAllByText('Complete');
      const incompleteStatuses = screen.getAllByText('Incomplete');

      [...completeStatuses, ...incompleteStatuses].forEach(status => {
        expect(status).toHaveAttribute('aria-hidden', 'false');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should render in mobile layout', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderEditorSidebar();

      // Should still render all sections
      expect(screen.getByText('Portfolio Structure')).toBeInTheDocument();
      expect(screen.getByText('Hero Section')).toBeInTheDocument();
    });

    it('should handle collapsed state', async () => {
      renderEditorSidebar();

      // In mobile view, sidebar might be collapsible
      const sections = screen.getAllByRole('button');
      expect(sections.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing portfolio data gracefully', async () => {
      renderEditorSidebar({
        ...mockProps,
        portfolio: null as any,
      });

      // Should not crash
      expect(screen.getByText('Portfolio Structure')).toBeInTheDocument();
    });

    it('should handle undefined sections', async () => {
      renderEditorSidebar({
        ...mockProps,
        portfolio: {
          ...mockPortfolio,
          experience: undefined as any,
          education: undefined as any,
          projects: undefined as any,
        },
      });

      // Should not crash and show incomplete status
      expect(screen.getAllByText('Incomplete').length).toBeGreaterThan(0);
    });

    it('should handle rapid section changes', async () => {
      const user = userEvent.setup();
      renderEditorSidebar();

      const aboutSection = screen.getByText('About Section');
      const projectsSection = screen.getByText('Projects');

      // Rapid clicks
      await user.click(aboutSection);
      await user.click(projectsSection);
      await user.click(aboutSection);

      expect(mockProps.onSectionChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('Internationalization', () => {
    it('should use translated section names', async () => {
      renderEditorSidebar();

      expect(screen.getByText('Hero Section')).toBeInTheDocument();
      expect(screen.getByText('About Section')).toBeInTheDocument();
      expect(screen.getByText('Experience')).toBeInTheDocument();
    });

    it('should fallback gracefully when translations are missing', async () => {
      (mockUseLanguage as any).mockImplementation(() => ({
        t: {},
      } as any);

      renderEditorSidebar();

      // Should still render sections with fallback text
      expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });
  });
});

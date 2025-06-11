/**
 * DesignerTemplate Component test suite
 */

import React from 'react';
import { screen } from '@testing-library/react';
import DesignerTemplate from '@/components/templates/DesignerTemplate';
import { renderWithLanguage } from '../../utils/i18n-test-utils';
import { Portfolio } from '@/types/portfolio';

// Mock portfolio data for designer
const mockPortfolio: Portfolio = {
  id: '2',
  userId: 'user-456',
  name: 'Jane Smith',
  title: 'Creative Designer',
  bio: 'Award-winning designer specializing in brand identity and user experience design.',
  tagline: 'Bringing ideas to life through design',
  avatar_url: 'https://example.com/designer-avatar.jpg',
  contact: {
    email: 'jane@designstudio.com',
    phone: '+1987654321',
    location: 'New York, NY',
  },
  social: {
    behance: 'https://behance.net/janesmith',
    dribbble: 'https://dribbble.com/janesmith',
    instagram: 'https://instagram.com/janesmith.design',
  },
  experience: [
    {
      company: 'Design Studio',
      position: 'Lead Designer',
      startDate: '2019-03',
      endDate: null,
      current: true,
      description: 'Leading creative direction for major brand campaigns',
    },
  ],
  education: [
    {
      institution: 'Art Institute',
      degree: 'MFA',
      field: 'Graphic Design',
      startDate: '2014',
      endDate: '2016',
      description: 'Master of Fine Arts in Graphic Design',
    },
  ],
  projects: [
    {
      title: 'Brand Redesign',
      description: 'Complete brand identity redesign for Fortune 500 company',
      technologies: ['Illustrator', 'Photoshop', 'Figma'],
      link: 'https://portfolio.com/brand-redesign',
      image: 'https://example.com/brand-project.jpg',
    },
    {
      title: 'Mobile App UI',
      description: 'User interface design for award-winning mobile application',
      technologies: ['Figma', 'Principle', 'After Effects'],
      link: 'https://portfolio.com/mobile-ui',
      image: 'https://example.com/mobile-project.jpg',
    },
  ],
  skills: [
    { name: 'UI/UX Design', level: 95 },
    { name: 'Brand Identity', level: 90 },
    { name: 'Typography', level: 85 },
    { name: 'Motion Design', level: 80 },
  ],
  certifications: [
    {
      name: 'Google UX Design Certificate',
      issuer: 'Google',
      date: '2022-06',
      url: 'https://grow.google/certificates/ux-design/',
    },
  ],
  template: 'designer',
  customization: {
    primaryColor: '#ff6b6b',
    secondaryColor: '#4ecdc4',
    font: 'Playfair Display',
    layout: 'creative',
  },
  published: true,
  subdomain: 'janesmith',
  customDomain: 'janesmith.design',
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('DesignerTemplate Component', () => {
  describe('Content Rendering', () => {
    test('renders designer name and title with creative styling', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Creative Designer')).toBeInTheDocument();
    });

    test('displays creative bio section', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText(/Award-winning designer/)).toBeInTheDocument();
    });

    test('shows tagline prominently', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(
        screen.getByText('Bringing ideas to life through design')
      ).toBeInTheDocument();
    });
  });

  describe('Portfolio Gallery', () => {
    test('renders project gallery with images', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const projectImages = screen.getAllByRole('img', { name: /project/i });
      expect(projectImages.length).toBeGreaterThanOrEqual(2);
    });

    test('displays project titles on hover', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Brand Redesign')).toBeInTheDocument();
      expect(screen.getByText('Mobile App UI')).toBeInTheDocument();
    });

    test('shows project descriptions', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(
        screen.getByText(/Complete brand identity redesign/)
      ).toBeInTheDocument();
      expect(screen.getByText(/User interface design/)).toBeInTheDocument();
    });
  });

  describe('Creative Skills Display', () => {
    test('renders skills with visual representations', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
      expect(screen.getByText('Brand Identity')).toBeInTheDocument();
      expect(screen.getByText('Typography')).toBeInTheDocument();
    });

    test('displays skill levels creatively', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      // Should have creative skill displays (circles, bars, etc)
      const skillElements = screen.getAllByTestId(/skill-level/i);
      expect(skillElements.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Social Media Integration', () => {
    test('shows design platform links', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const behanceLink = screen.getByRole('link', { name: /behance/i });
      const dribbbleLink = screen.getByRole('link', { name: /dribbble/i });
      const instagramLink = screen.getByRole('link', { name: /instagram/i });

      expect(behanceLink).toHaveAttribute(
        'href',
        'https://behance.net/janesmith'
      );
      expect(dribbbleLink).toHaveAttribute(
        'href',
        'https://dribbble.com/janesmith'
      );
      expect(instagramLink).toHaveAttribute(
        'href',
        'https://instagram.com/janesmith.design'
      );
    });
  });

  describe('Visual Layout', () => {
    test('applies creative color scheme', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const container = screen.getByTestId('portfolio-container');
      const styles = window.getComputedStyle(container);

      expect(styles.getPropertyValue('--primary-color')).toBe('#ff6b6b');
      expect(styles.getPropertyValue('--secondary-color')).toBe('#4ecdc4');
    });

    test('uses creative typography', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const heading = screen.getByRole('heading', { level: 1 });
      const styles = window.getComputedStyle(heading);

      expect(styles.fontFamily).toContain('Playfair Display');
    });
  });

  describe('Experience Timeline', () => {
    test('shows work experience in visual timeline', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Design Studio')).toBeInTheDocument();
      expect(screen.getByText('Lead Designer')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    test('handles portfolio without projects gracefully', () => {
      const portfolioWithoutProjects = {
        ...mockPortfolio,
        projects: [],
      };

      renderWithLanguage(
        <DesignerTemplate portfolio={portfolioWithoutProjects} />
      );

      // Should show message or alternate content
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('adapts gallery layout for mobile', () => {
      global.innerWidth = 375;
      global.innerHeight = 667;

      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      // Gallery should still be accessible
      expect(screen.getByText('Brand Redesign')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('provides alt text for all images', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const images = screen.getAllByRole('img');
      images.forEach(img => {
        expect(img).toHaveAttribute('alt');
      });
    });

    test('has keyboard navigable gallery', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const galleryItems = screen.getAllByRole('link', {
        name: /view project/i,
      });
      galleryItems.forEach(item => {
        expect(item).toHaveAttribute('tabIndex');
      });
    });
  });

  describe('Custom Domain Display', () => {
    test('shows custom domain when available', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('janesmith.design')).toBeInTheDocument();
    });
  });
});

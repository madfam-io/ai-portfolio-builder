/**
 * DesignerTemplate Component test suite
 */

import { screen } from '@testing-library/react';
import React from 'react';

import { DesignerTemplate } from '@/components/templates/DesignerTemplate';
import { Portfolio } from '@/types/portfolio';

import { renderWithLanguage } from '../../utils/i18n-test-utils';

const mockPortfolio: Portfolio = {
  id: 'portfolio-2',
  userId: 'user-2',
  name: 'Jane Smith',
  title: 'Creative Designer',
  bio: 'Award-winning designer with a passion for creating beautiful, user-centered experiences. Specializing in brand identity, UI/UX design, and creative direction.',
  tagline: 'Bringing ideas to life through design',
  avatarUrl: 'https://example.com/jane-avatar.jpg',
  contact: {
    email: 'jane@designstudio.com',
    phone: '+1 (555) 987-6543',
    location: 'New York, NY',
  },
  social: {
    linkedin: 'https://linkedin.com/in/janesmith',
    behance: 'https://behance.net/janesmith',
    dribbble: 'https://dribbble.com/janesmith',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Design Studio',
      position: 'Lead Designer',
      startDate: '2019-03',
      endDate: undefined,
      current: true,
      description: 'Leading creative direction for major brand campaigns',
      highlights: [
        'Led team of 5 designers',
        'Increased client satisfaction by 40%',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Art Institute',
      degree: 'MFA',
      field: 'Graphic Design',
      startDate: '2014-09',
      endDate: '2016-05',
      current: false,
      description: 'Master of Fine Arts in Graphic Design',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Brand Redesign',
      description: 'Complete brand identity redesign for Fortune 500 company',
      technologies: ['Illustrator', 'Photoshop', 'Figma'],
      liveUrl: 'https://portfolio.com/brand-redesign',
      imageUrl: 'https://example.com/brand-project.jpg',
      highlights: ['Increased brand recognition by 60%'],
      featured: true,
      order: 0,
    },
    {
      id: 'proj-2',
      title: 'Mobile App UI',
      description: 'User interface design for award-winning mobile application',
      technologies: ['Figma', 'Principle', 'After Effects'],
      liveUrl: 'https://portfolio.com/mobile-ui',
      imageUrl: 'https://example.com/mobile-project.jpg',
      highlights: ['Won Best Design Award 2023'],
      featured: true,
      order: 1,
    },
  ],
  skills: [
    { name: 'UI/UX Design', level: 'expert' },
    { name: 'Brand Identity', level: 'expert' },
    { name: 'Typography', level: 'advanced' },
    { name: 'Motion Design', level: 'advanced' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'Google UX Design Certificate',
      issuer: 'Google',
      issueDate: '2022-06',
      credentialUrl: 'https://grow.google/certificates/ux-design/',
    },
  ],
  template: 'designer',
  customization: {
    primaryColor: '#ff6b6b',
    secondaryColor: '#4ecdc4',
    fontFamily: 'Playfair Display',
    headerStyle: 'creative',
    sectionOrder: [],
    hiddenSections: [],
  },
  status: 'published',
  subdomain: 'janesmith',
  customDomain: 'janesmith.design',
  views: 0,
  aiSettings: {
    enhanceBio: true,
    enhanceProjectDescriptions: true,
    generateSkillsFromExperience: false,
    tone: 'creative',
    targetLength: 'detailed',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date(),
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

    test('shows project technologies as tags', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Figma')).toBeInTheDocument();
      expect(screen.getByText('Photoshop')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    test('applies custom color scheme', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const container = screen.getByTestId('portfolio-container');
      expect(container).toHaveStyle({ '--primary-color': '#ff6b6b' });
    });

    test('uses creative typography', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const header = screen.getByRole('heading', { level: 1 });
      expect(header).toHaveClass('font-display');
    });
  });

  describe('Skills Visualization', () => {
    test('displays skills with visual indicators', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
      expect(screen.getByText('expert')).toBeInTheDocument();
    });

    test('shows skill categories', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const skillsSection = screen.getByTestId('skills-section');
      expect(skillsSection).toContainElement(
        screen.getByText('Brand Identity')
      );
    });
  });

  describe('Contact Section', () => {
    test('displays creative contact layout', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('jane@designstudio.com')).toBeInTheDocument();
      expect(screen.getByText('New York, NY')).toBeInTheDocument();
    });

    test('shows social media links with icons', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByRole('link', { name: /behance/i })).toHaveAttribute(
        'href',
        'https://behance.net/janesmith'
      );
    });
  });

  describe('Responsive Design', () => {
    test('adapts layout for mobile devices', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      const container = screen.getByTestId('portfolio-container');
      expect(container).toHaveClass('md:grid');
    });
  });

  describe('Empty States', () => {
    test('handles missing projects gracefully', () => {
      const portfolioWithoutProjects = {
        ...mockPortfolio,
        projects: [],
      };

      renderWithLanguage(
        <DesignerTemplate portfolio={portfolioWithoutProjects} />
      );

      // Should still render other sections
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('handles missing social links', () => {
      const portfolioWithoutSocial = {
        ...mockPortfolio,
        social: {},
      };

      renderWithLanguage(
        <DesignerTemplate portfolio={portfolioWithoutSocial} />
      );

      // Should still render contact info
      expect(screen.getByText('jane@designstudio.com')).toBeInTheDocument();
    });
  });

  describe('Certifications Display', () => {
    test('shows certifications with issuer', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(
        screen.getByText('Google UX Design Certificate')
      ).toBeInTheDocument();
      expect(screen.getByText('Google')).toBeInTheDocument();
    });
  });

  describe('Experience Timeline', () => {
    test('displays current position', () => {
      renderWithLanguage(<DesignerTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Lead Designer')).toBeInTheDocument();
      expect(screen.getByText('Design Studio')).toBeInTheDocument();
      expect(screen.getByText(/current|presente/i)).toBeInTheDocument();
    });
  });
});

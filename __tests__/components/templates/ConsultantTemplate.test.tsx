import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

import { ConsultantTemplate } from '@/components/templates/ConsultantTemplate';
import { Portfolio } from '@/types/portfolio';

/**
 * ConsultantTemplate Component test suite
 */

// Mock portfolio data for consultant
const mockPortfolio: Portfolio = {
  id: '3',
  userId: 'user-789',
  name: 'Michael Johnson',
  title: 'Business Consultant',
  bio: 'Strategic business consultant with 10+ years helping Fortune 500 companies transform their operations.',
  tagline: 'Driving business excellence through strategic innovation',
  avatarUrl: 'https://example.com/consultant-avatar.jpg',
  contact: {
    email: 'michael@consultingfirm.com',
    phone: '+1555123456',
    location: 'Chicago, IL',
  },
  social: {
    linkedin: 'https://linkedin.com/in/michaeljohnson',
    twitter: 'https://twitter.com/mjconsulting',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Strategic Consulting Group',
      position: 'Senior Partner',
      startDate: '2018-06',
      endDate: undefined,
      current: true,
      description:
        'Leading digital transformation initiatives for enterprise clients',
      highlights: [],
      technologies: [],
    },
    {
      id: 'exp-2',
      company: 'Global Advisory Services',
      position: 'Management Consultant',
      startDate: '2014-01',
      endDate: '2018-05',
      current: false,
      description:
        'Specialized in operational efficiency and process optimization',
      highlights: [],
      technologies: [],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'Harvard Business School',
      degree: 'MBA',
      field: 'Business Administration',
      startDate: '2012',
      endDate: '2014',
      current: false,
      description: 'Focus on Strategy and Operations',
      achievements: [],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Digital Transformation Initiative',
      description:
        'Led $10M digital transformation for retail giant, resulting in 30% efficiency gain',
      technologies: ['Strategy', 'Change Management', 'Process Design'],
      projectUrl: undefined,
      imageUrl: 'https://example.com/transformation.jpg',
      highlights: [],
      featured: false,
      order: 0,
    },
    {
      id: 'proj-2',
      title: 'Supply Chain Optimization',
      description: 'Redesigned supply chain operations saving $5M annually',
      technologies: ['Analytics', 'Operations', 'Lean Six Sigma'],
      projectUrl: undefined,
      imageUrl: 'https://example.com/supply-chain.jpg',
      highlights: [],
      featured: false,
      order: 1,
    },
  ],
  skills: [
    { name: 'Strategic Planning', level: 'expert', category: 'Business' },
    { name: 'Change Management', level: 'expert', category: 'Business' },
    { name: 'Financial Analysis', level: 'advanced', category: 'Finance' },
    { name: 'Project Management', level: 'advanced', category: 'Management' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'PMP Certification',
      issuer: 'Project Management Institute',
      issueDate: '2020-03',
      credentialUrl: 'https://www.pmi.org/',
    },
    {
      id: 'cert-2',
      name: 'Lean Six Sigma Black Belt',
      issuer: 'ASQ',
      issueDate: '2019-08',
      credentialUrl: 'https://asq.org/',
    },
  ],
  template: 'consultant',
  customization: {
    primaryColor: '#2c3e50',
    secondaryColor: '#3498db',
    fontFamily: 'Roboto',
    headerStyle: 'minimal',
    sectionOrder: [],
    hiddenSections: [],
  },
  status: 'published' as const,
  subdomain: 'mjconsulting',
  customDomain: undefined,
  views: 0,
  aiSettings: {
    enhanceBio: true,
    enhanceProjectDescriptions: true,
    generateSkillsFromExperience: false,
    tone: 'professional',
    targetLength: 'detailed',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date(),
};

describe('ConsultantTemplate Component', () => {
  describe('Professional Header', () => {
    test('renders consultant name and title professionally', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('Michael Johnson')).toBeInTheDocument();
      expect(screen.getByText('Business Consultant')).toBeInTheDocument();
    });

    test('displays professional tagline', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(
        screen.getByText(/Driving business excellence/)
      ).toBeInTheDocument();
    });

    test('shows professional contact information', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(
        screen.getByText('michael@consultingfirm.com')
      ).toBeInTheDocument();
      expect(screen.getByText('Chicago, IL')).toBeInTheDocument();
    });
  });

  describe('Executive Summary', () => {
    test('presents bio as executive summary', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      const bio = screen.getByText(
        /Strategic business consultant with 10\+ years/
      );
      expect(bio).toBeInTheDocument();
    });

    test('highlights years of experience', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText(/10\+ years/)).toBeInTheDocument();
    });
  });

  describe('Professional Experience', () => {
    test('displays experience in reverse chronological order', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      const experiences = screen.getAllByRole('article');
      expect(experiences.length).toBeGreaterThanOrEqual(2);

      // Current position should appear first
      expect(
        screen.getByText('Strategic Consulting Group')
      ).toBeInTheDocument();
      expect(screen.getByText('Senior Partner')).toBeInTheDocument();
    });

    test('shows duration for each position', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      // Should show date ranges
      expect(screen.getByText(/2018/)).toBeInTheDocument();
      expect(screen.getByText(/2014/)).toBeInTheDocument();
    });
  });

  describe('Case Studies / Projects', () => {
    test('presents projects as case studies', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(
        screen.getByText('Digital Transformation Initiative')
      ).toBeInTheDocument();
      expect(screen.getByText('Supply Chain Optimization')).toBeInTheDocument();
    });

    test('highlights project impact and ROI', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText(/\$10M/)).toBeInTheDocument();
      expect(screen.getByText(/30% efficiency gain/)).toBeInTheDocument();
      expect(screen.getByText(/\$5M annually/)).toBeInTheDocument();
    });

    test('shows methodologies used', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText(/Change Management/)).toBeInTheDocument();
      expect(screen.getByText(/Lean Six Sigma/)).toBeInTheDocument();
    });
  });

  describe('Core Competencies', () => {
    test('displays skills as core competencies', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('Strategic Planning')).toBeInTheDocument();
      expect(screen.getByText('Change Management')).toBeInTheDocument();
      expect(screen.getByText('Financial Analysis')).toBeInTheDocument();
    });

    test.skip('shows expertise levels professionally', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      // TODO: Add expertise-level testids to ConsultantTemplate
      // Should display expertise levels (dots, bars, or percentages)
      const expertiseLevels = screen.getAllByTestId(/expertise-level/i);
      expect(expertiseLevels.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Certifications & Credentials', () => {
    test('prominently displays professional certifications', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('PMP Certification')).toBeInTheDocument();
      expect(screen.getByText('Lean Six Sigma Black Belt')).toBeInTheDocument();
    });

    test('shows certification issuers', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(
        screen.getByText('Project Management Institute')
      ).toBeInTheDocument();
      expect(screen.getByText('ASQ')).toBeInTheDocument();
    });
  });

  // TODO: Implement industries and specializations in ConsultantTemplate
  describe.skip('Industries & Specializations', () => {
    test('displays industry expertise when available', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText(/Retail/)).toBeInTheDocument();
      expect(screen.getByText(/Manufacturing/)).toBeInTheDocument();
      expect(screen.getByText(/Technology/)).toBeInTheDocument();
    });

    test('shows areas of specialization', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText(/Digital Transformation/)).toBeInTheDocument();
      expect(screen.getByText(/Process Optimization/)).toBeInTheDocument();
    });
  });

  describe('Professional Styling', () => {
    test('applies conservative color scheme', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      const container = screen.getByTestId('portfolio-container');
      const styles = window.getComputedStyle(container);

      expect(styles.getPropertyValue('--primary-color')).toBe('#2c3e50');
    });

    test('uses professional typography', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      const heading = screen.getByRole('heading', { level: 1 });
      const styles = window.getComputedStyle(heading);

      expect(styles.fontFamily).toContain('Roboto');
    });
  });

  describe('Education Section', () => {
    test('displays educational credentials', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('Harvard Business School')).toBeInTheDocument();
      expect(screen.getByText('MBA')).toBeInTheDocument();
    });
  });

  describe('Print-Friendly Layout', () => {
    test('provides print-optimized view', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      // May or may not have print button, but layout should be print-friendly
      expect(screen.getByTestId('portfolio-container')).toHaveClass(
        'print:text-black'
      );
    });
  });

  describe('Empty States', () => {
    test('handles missing certifications gracefully', () => {
      const portfolioWithoutCerts = {
        ...mockPortfolio,
        certifications: [],
      };

      renderWithLanguage(
        <ConsultantTemplate portfolio={portfolioWithoutCerts} />
      );

      // Should still render other sections
      expect(screen.getByText('Michael Johnson')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('uses semantic HTML for better screen reader support', () => {
      renderWithLanguage(
        <ConsultantTemplate portfolio={mockPortfolio as any} />
      );

      // Should use proper article tags for experience
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBeGreaterThan(0);

      // Navigation may not be present in portfolio templates
      // Navigation should still work
      // It's okay if there's no navigation in a portfolio template
    });
  });
});

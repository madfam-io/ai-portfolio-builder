import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithLanguage } from '../../utils/i18n-test-utils';

import { DeveloperTemplate } from '@/components/templates/DeveloperTemplate';
import { Portfolio } from '@/types/portfolio';

/**
 * DeveloperTemplate Component test suite
 */

const mockPortfolio: Portfolio = {
  id: 'portfolio-1',
  userId: 'user-1',
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Experienced developer with a passion for creating scalable web applications and contributing to open source projects.',
  tagline: 'Building the future, one commit at a time',
  avatarUrl: 'https://example.com/avatar.jpg',
  contact: {
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
  },
  social: {
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    twitter: 'https://twitter.com/johndoe',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      startDate: '2020-01',
      endDate: undefined,
      current: true,
      description: 'Leading development of microservices architecture',
      highlights: [
        'Reduced deployment time by 50%',
        'Led team of 4 developers',
      ],
      technologies: ['React', 'Node.js', 'AWS'],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Technology',
      degree: 'BS Computer Science',
      field: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      current: false,
      description: 'Graduated with honors',
      achievements: ["Dean's List", 'ACM Programming Competition Winner'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'E-commerce Platform',
      description:
        'Built a scalable e-commerce platform using React and Node.js',
      technologies: ['React', 'Node.js', 'MongoDB'],
      githubUrl: 'https://github.com/johndoe/ecommerce',
      liveUrl: 'https://example-store.com',
      imageUrl: 'https://example.com/project1.jpg',
      highlights: ['100k+ monthly active users', 'Featured on ProductHunt'],
      featured: true,
      order: 0,
    },
  ],
  skills: [
    { name: 'JavaScript', level: 'expert' },
    { name: 'React', level: 'expert' },
    { name: 'Node.js', level: 'advanced' },
    { name: 'Python', level: 'advanced' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      issueDate: '2023-01',
      credentialUrl: 'https://aws.amazon.com/certification/',
    },
  ],
  template: 'developer',
  customization: {
    primaryColor: '#1a73e8',
    secondaryColor: '#34a853',
    fontFamily: 'Inter',
    headerStyle: 'minimal',
    sectionOrder: [],
    hiddenSections: [],
  },
  status: 'published',
  subdomain: 'johndoe',
  customDomain: undefined,
  views: 0,
  aiSettings: {
    enhanceBio: true,
    enhanceProjectDescriptions: true,
    generateSkillsFromExperience: false,
    tone: 'professional',
    targetLength: 'concise',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  publishedAt: new Date(),
};

describe('DeveloperTemplate Component', () => {
  describe('Content Rendering', () => {
    test('renders developer name and title', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    });

    test('displays bio section', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(
        screen.getByText(/Experienced developer with a passion/)
      ).toBeInTheDocument();
    });

    test('shows contact information', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    });
  });

  describe('Skills Section', () => {
    test('renders skill bars with levels', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });

    test('displays skill levels with badges', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getAllByText('expert')).toHaveLength(2);
      expect(screen.getAllByText('advanced')).toHaveLength(2);
    });
  });

  describe('Projects Section', () => {
    test('renders project cards', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      expect(
        screen.getByText(/Built a scalable e-commerce platform/)
      ).toBeInTheDocument();
    });

    test('displays project technologies', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('MongoDB')).toBeInTheDocument();
    });

    test('shows project links', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      const githubLink = screen.getByRole('link', { name: /github/i });
      expect(githubLink).toHaveAttribute(
        'href',
        'https://github.com/johndoe/ecommerce'
      );
    });
  });

  describe('Experience Section', () => {
    test('displays work experience', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText(/current|presente/i)).toBeInTheDocument();
    });

    test('shows experience highlights', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(
        screen.getByText('Reduced deployment time by 50%')
      ).toBeInTheDocument();
    });
  });

  describe('Education Section', () => {
    test('displays education details', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('University of Technology')).toBeInTheDocument();
      expect(screen.getByText('BS Computer Science')).toBeInTheDocument();
    });

    test('shows graduation year', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText(/2020/)).toBeInTheDocument();
    });
  });

  describe('Certifications Section', () => {
    test('displays certifications', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      expect(screen.getByText('AWS Certified Developer')).toBeInTheDocument();
      expect(screen.getByText('Amazon Web Services')).toBeInTheDocument();
    });
  });

  describe('Social Links', () => {
    test('renders GitHub profile link', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      const githubLink = screen.getByRole('link', {
        name: /github|profile/i,
      });
      expect(githubLink).toHaveAttribute('href', 'https://github.com/johndoe');
    });

    test('renders LinkedIn profile link', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      const linkedinLink = screen.getByRole('link', {
        name: /linkedin/i,
      });
      expect(linkedinLink).toHaveAttribute(
        'href',
        'https://linkedin.com/in/johndoe'
      );
    });
  });

  describe('Responsive Design', () => {
    test('applies responsive classes', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      const container = screen.getByTestId('portfolio-container');
      expect(container).toHaveClass('container');
    });
  });

  describe('Empty States', () => {
    test('handles missing social links gracefully', () => {
      const portfolioWithoutSocial = {
        ...mockPortfolio,
        social: {},
      };

      renderWithLanguage(
        <DeveloperTemplate portfolio={portfolioWithoutSocial} />
      );

      // Should still render other sections
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('handles empty skills array', () => {
      const portfolioWithoutSkills = {
        ...mockPortfolio,
        skills: [],
      };

      renderWithLanguage(
        <DeveloperTemplate portfolio={portfolioWithoutSkills} />
      );

      // Should still render other sections
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    test('applies custom primary color', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      const container = screen.getByTestId('portfolio-container');
      expect(container).toHaveStyle({ '--primary-color': '#1a73e8' });
    });

    test('applies custom font family', () => {
      renderWithLanguage(
        <DeveloperTemplate portfolio={mockPortfolio as any} />
      );

      const container = screen.getByTestId('portfolio-container');
      expect(container).toHaveClass('font-sans');
    });
  });
});

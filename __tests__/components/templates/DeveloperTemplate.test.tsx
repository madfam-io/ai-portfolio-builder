/**
 * DeveloperTemplate Component test suite
 */

import React from 'react';
import { screen } from '@testing-library/react';
import DeveloperTemplate from '@/components/templates/DeveloperTemplate';
import { renderWithLanguage } from '../../utils/i18n-test-utils';
import { Portfolio } from '@/types/portfolio';

// Mock portfolio data
const mockPortfolio: Portfolio = {
  id: '1',
  userId: 'user-123',
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Experienced developer with a passion for creating scalable web applications.',
  tagline: 'Building the future, one line at a time',
  avatar_url: 'https://example.com/avatar.jpg',
  contact: {
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'San Francisco, CA',
  },
  social: {
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    twitter: 'https://twitter.com/johndoe',
  },
  experience: [
    {
      company: 'Tech Corp',
      position: 'Senior Developer',
      startDate: '2020-01',
      endDate: null,
      current: true,
      description: 'Leading development of microservices architecture',
    },
  ],
  education: [
    {
      institution: 'University of Technology',
      degree: 'BS Computer Science',
      field: 'Computer Science',
      startDate: '2016',
      endDate: '2020',
      description: 'Graduated with honors',
    },
  ],
  projects: [
    {
      title: 'E-commerce Platform',
      description:
        'Built a scalable e-commerce platform using React and Node.js',
      technologies: ['React', 'Node.js', 'MongoDB'],
      link: 'https://github.com/johndoe/ecommerce',
      image: 'https://example.com/project1.jpg',
    },
  ],
  skills: [
    { name: 'JavaScript', level: 90 },
    { name: 'React', level: 85 },
    { name: 'Node.js', level: 80 },
    { name: 'Python', level: 75 },
  ],
  certifications: [
    {
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      date: '2023-01',
      url: 'https://aws.amazon.com/certification/',
    },
  ],
  template: 'developer',
  customization: {
    primaryColor: '#1a73e8',
    secondaryColor: '#34a853',
    font: 'Inter',
    layout: 'modern',
  },
  published: true,
  subdomain: 'johndoe',
  customDomain: null,
  metadata: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('DeveloperTemplate Component', () => {
  describe('Content Rendering', () => {
    test('renders developer name and title', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    });

    test('displays bio section', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      expect(
        screen.getByText(/Experienced developer with a passion/)
      ).toBeInTheDocument();
    });

    test('shows contact information', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    });
  });

  describe('Skills Section', () => {
    test('renders skill bars with levels', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
      expect(screen.getByText('Python')).toBeInTheDocument();
    });

    test('displays skill levels as progress bars', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      const progressBars = screen.getAllByRole('progressbar');
      expect(progressBars.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Experience Section', () => {
    test('shows work experience', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
      expect(screen.getByText('Senior Developer')).toBeInTheDocument();
      expect(
        screen.getByText(/Leading development of microservices/)
      ).toBeInTheDocument();
    });

    test('indicates current position', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText(/current|presente/i)).toBeInTheDocument();
    });
  });

  describe('Projects Section', () => {
    test('displays project cards', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
      expect(
        screen.getByText(/Built a scalable e-commerce platform/)
      ).toBeInTheDocument();
    });

    test('shows project technologies', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      const techTags = screen.getAllByText(/React|Node.js|MongoDB/);
      expect(techTags.length).toBeGreaterThan(0);
    });

    test('includes project links', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      const projectLink = screen.getByRole('link', {
        name: /view project|ver proyecto/i,
      });
      expect(projectLink).toHaveAttribute(
        'href',
        'https://github.com/johndoe/ecommerce'
      );
    });
  });

  describe('Social Links', () => {
    test('renders social media links', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      const githubLink = screen.getByRole('link', { name: /github/i });
      const linkedinLink = screen.getByRole('link', { name: /linkedin/i });

      expect(githubLink).toHaveAttribute('href', 'https://github.com/johndoe');
      expect(linkedinLink).toHaveAttribute(
        'href',
        'https://linkedin.com/in/johndoe'
      );
    });
  });

  describe('Customization', () => {
    test('applies custom colors', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      const container = screen.getByTestId('portfolio-container');
      const styles = window.getComputedStyle(container);

      expect(styles.getPropertyValue('--primary-color')).toBe('#1a73e8');
    });
  });

  describe('Empty States', () => {
    test('handles missing projects gracefully', () => {
      const portfolioWithoutProjects = {
        ...mockPortfolio,
        projects: [],
      };

      renderWithLanguage(
        <DeveloperTemplate portfolio={portfolioWithoutProjects} />
      );

      // Should not crash and display other sections
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('handles missing skills', () => {
      const portfolioWithoutSkills = {
        ...mockPortfolio,
        skills: [],
      };

      renderWithLanguage(
        <DeveloperTemplate portfolio={portfolioWithoutSkills} />
      );

      // Should still render other sections
      expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('renders in mobile view', () => {
      global.innerWidth = 375;
      global.innerHeight = 667;

      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper heading hierarchy', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('John Doe');

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });

    test('has proper alt text for images', () => {
      renderWithLanguage(<DeveloperTemplate portfolio={mockPortfolio} />);

      const avatar = screen.getByAltText(/John Doe/i);
      expect(avatar).toBeInTheDocument();
    });
  });
});

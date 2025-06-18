/**
 * @jest-environment jsdom
 */

import { describe, test, it, expect } from '@jest/globals';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { ModernTemplate } from '@/components/templates/ModernTemplate';
import { MinimalTemplate } from '@/components/templates/MinimalTemplate';
import { EducatorTemplate } from '@/components/templates/EducatorTemplate';
import { CreativeTemplate } from '@/components/templates/CreativeTemplate';
import { BusinessTemplate } from '@/components/templates/BusinessTemplate';
import { Portfolio } from '@/types/portfolio';


const mockPortfolio: Portfolio = {
  id: 'test-portfolio',
  name: 'John Doe',
  title: 'Software Developer',
  bio: 'A passionate developer creating amazing software solutions',
  location: 'San Francisco, CA',
  template: 'modern',
  avatarUrl: 'https://example.com/avatar.jpg',
  skills: [
    { name: 'React', level: 'Expert' },
    { name: 'TypeScript', level: 'Advanced' },
    { name: 'Node.js', level: 'Intermediate' },
  ],
  projects: [
    {
      id: '1',
      title: 'E-commerce Platform',
      description:
        'A full-stack e-commerce solution built with React and Node.js',
      imageUrl: 'https://example.com/project1.jpg',
      technologies: ['React', 'Node.js', 'MongoDB'],
      githubUrl: 'https://github.com/johndoe/ecommerce',
      liveUrl: 'https://ecommerce.johndoe.com',
      featured: true,
    },
    {
      id: '2',
      title: 'Portfolio Website',
      description: 'A responsive portfolio website showcasing my work',
      technologies: ['Next.js', 'Tailwind CSS'],
      projectUrl: 'https://portfolio.johndoe.com',
    },
  ],
  experience: [
    {
      position: 'Senior Developer',
      company: 'Tech Corp',
      startDate: '2022',
      endDate: '2024',
      description:
        'Led development of web applications and mentored junior developers',
    },
    {
      position: 'Frontend Developer',
      company: 'Startup Inc',
      startDate: '2020',
      endDate: '2022',
      description:
        'Built responsive user interfaces and improved user experience',
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'University of Technology',
      year: '2020',
    },
  ],
  certifications: [
    {
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      date: '2023',
    },
  ],
  contact: {
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
  },
  social: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    website: 'https://johndoe.com',
  },
  customization: {
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
  },
};

describe('Template Rendering', () => {
  describe('ModernTemplate', () => {
    it('should render all portfolio sections', () => {
      render(<ModernTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Software Developer')).toBeInTheDocument();
      expect(screen.getByText(/passionate developer/i)).toBeInTheDocument();
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    });

    it('should render featured projects', () => {
      render(<ModernTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Featured Projects')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    });

    it('should render skills with progress bars', () => {
      render(<ModernTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Skills & Expertise')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Expert')).toBeInTheDocument();
    });

    it('should render contact section', () => {
      render(<ModernTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText("Let's Work Together")).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  describe('MinimalTemplate', () => {
    it('should render with minimal design approach', () => {
      render(<MinimalTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Selected Work')).toBeInTheDocument();
    });

    it('should handle missing avatar gracefully', () => {
      const portfolioWithoutAvatar = { ...mockPortfolio, avatarUrl: undefined };
      render(<MinimalTemplate portfolio={portfolioWithoutAvatar} />);

      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render project technologies as tags', () => {
      render(<MinimalTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Technologies:')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });
  });

  describe('EducatorTemplate', () => {
    it('should render education-focused sections', () => {
      render(<EducatorTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Teaching Philosophy')).toBeInTheDocument();
      expect(screen.getByText('Education & Credentials')).toBeInTheDocument();
      expect(screen.getByText('Teaching Experience')).toBeInTheDocument();
    });

    it('should render courses as projects', () => {
      render(<EducatorTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Courses & Curriculum')).toBeInTheDocument();
      expect(screen.getByText('E-commerce Platform')).toBeInTheDocument();
    });

    it('should display areas of expertise', () => {
      render(<EducatorTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Areas of Expertise')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('should have education-specific CTA', () => {
      render(<EducatorTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Ready to Learn Together?')).toBeInTheDocument();
      expect(screen.getByText('Schedule Consultation')).toBeInTheDocument();
    });
  });

  describe('CreativeTemplate', () => {
    it('should render with artistic design elements', () => {
      render(<CreativeTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Featured Creations')).toBeInTheDocument();
      expect(screen.getByText('Creative Arsenal')).toBeInTheDocument();
      expect(screen.getByText('Creative Journey')).toBeInTheDocument();
    });

    it('should include social media integration', () => {
      render(<CreativeTemplate portfolio={mockPortfolio} />);

      expect(
        screen.getByText("Let's Create Magic Together")
      ).toBeInTheDocument();
    });

    it('should render project metrics', () => {
      render(<CreativeTemplate portfolio={mockPortfolio} />);

      // Should show mock engagement metrics
      const viewCounts = screen.getAllByText(/\d+/);
      expect(viewCounts.length).toBeGreaterThan(0);
    });
  });

  describe('BusinessTemplate', () => {
    it('should render executive summary', () => {
      render(<BusinessTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Executive Summary')).toBeInTheDocument();
      expect(screen.getByText('Core Competencies')).toBeInTheDocument();
    });

    it('should display business metrics', () => {
      render(<BusinessTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Projects Delivered')).toBeInTheDocument();
      expect(screen.getByText('150+')).toBeInTheDocument();
      expect(screen.getByText('Client Satisfaction')).toBeInTheDocument();
      expect(screen.getByText('98%')).toBeInTheDocument();
    });

    it('should render strategic initiatives', () => {
      render(<BusinessTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Strategic Initiatives')).toBeInTheDocument();
      expect(
        screen.getByText('Strategic Business Initiative')
      ).toBeInTheDocument();
    });

    it('should show business impact metrics for projects', () => {
      render(<BusinessTemplate portfolio={mockPortfolio} />);

      expect(screen.getByText('Business Impact')).toBeInTheDocument();
      expect(screen.getByText('Revenue Growth')).toBeInTheDocument();
      expect(screen.getByText('Cost Savings')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render properly on different screen sizes', () => {
      // Test mobile-first responsive classes
      render(<ModernTemplate portfolio={mockPortfolio} />);

      const nameElement = screen.getByText('John Doe');
      expect(nameElement).toHaveClass('text-5xl', 'md:text-7xl');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data gracefully', () => {
      const minimalPortfolio: Portfolio = {
        id: 'minimal',
        name: 'Test User',
        title: 'Developer',
        bio: '',
        template: 'modern',
        skills: [],
        projects: [],
        experience: [],
        education: [],
        certifications: [],
        contact: {},
        social: {},
        customization: {},
      };

      render(<ModernTemplate portfolio={minimalPortfolio} />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Developer')).toBeInTheDocument();
    });

    it('should not render sections when data is empty', () => {
      const emptyPortfolio: Portfolio = {
        id: 'empty',
        name: 'Test User',
        title: 'Developer',
        bio: '',
        template: 'modern',
        skills: [],
        projects: [],
        experience: [],
        education: [],
        certifications: [],
        contact: {},
        social: {},
        customization: {},
      };

      render(<ModernTemplate portfolio={emptyPortfolio} />);

      expect(screen.queryByText('Featured Projects')).not.toBeInTheDocument();
      expect(screen.queryByText('Skills & Expertise')).not.toBeInTheDocument();
      expect(screen.queryByText('Experience')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ModernTemplate portfolio={mockPortfolio} />);

      const h1Elements = screen.getAllByRole('heading', { level: 1 });
      expect(h1Elements).toHaveLength(1);
      expect(h1Elements[0]).toHaveTextContent('John Doe');
    });

    it('should have alt text for images', () => {
      render(<ModernTemplate portfolio={mockPortfolio} />);

      const avatarImage = screen.getByAltText('John Doe');
      expect(avatarImage).toBeInTheDocument();
    });

    it('should have proper link attributes', () => {
      render(<ModernTemplate portfolio={mockPortfolio} />);

      const githubLinks = screen.getAllByRole('link');
      const externalLinks = githubLinks.filter(
        link => link.getAttribute('target') === '_blank'

      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });
});

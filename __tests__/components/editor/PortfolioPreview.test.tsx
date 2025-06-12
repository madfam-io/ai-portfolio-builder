
// Mock hooks
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: any) => value,
}));

jest.mock('@/hooks/useRealTimePreview', () => ({
  useRealTimePreview: () => ({
    isConnected: true,
    isLoading: false,
    error: null,
    previewUrl: 'http://localhost:3000/preview/123',
    updatePreview: jest.fn(),
    reconnect: jest.fn(),
  }),
}));
import { render, screen } from '@testing-library/react';
import React from 'react';

import { PortfolioPreview } from '@/components/editor/PortfolioPreview';
import { Portfolio, TemplateType } from '@/types/portfolio';

// Mock portfolio data
const mockPortfolio: Portfolio = {
  id: '1',
  userId: 'user-1',
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'Experienced developer with a passion for creating scalable applications.',
  tagline: 'Building the future, one line at a time',
  avatarUrl: '/avatar.jpg',
  contact: {
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'San Francisco, CA',
    availability: 'Available for freelance',
  },
  social: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Corp',
      position: 'Senior Developer',
      startDate: '2020-01',
      current: true,
      description: 'Leading development of cloud-native applications',
      highlights: ['Led team of 5 developers', 'Increased performance by 40%'],
      technologies: ['React', 'Node.js', 'AWS'],
    },
    {
      id: 'exp-2',
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      startDate: '2018-06',
      endDate: '2019-12',
      current: false,
      description: 'Built MVP for fintech startup',
      highlights: ['Architected microservices', 'Implemented CI/CD'],
      technologies: ['Vue.js', 'Python', 'Docker'],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      current: false,
      achievements: ["Dean's List", 'Graduated Magna Cum Laude'],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'E-commerce Platform',
      description: 'Built a scalable e-commerce solution handling 100k+ users',
      imageUrl: '/project1.jpg',
      projectUrl: 'https://example.com',
      githubUrl: 'https://github.com/johndoe/ecommerce',
      technologies: ['React', 'Node.js', 'MongoDB'],
      highlights: ['100k+ active users', 'Real-time inventory', '99.9% uptime'],
      featured: true,
      order: 1,
    },
    {
      id: 'proj-2',
      title: 'Task Management App',
      description: 'Collaborative task management with real-time updates',
      technologies: ['React Native', 'Firebase'],
      highlights: ['Cross-platform', 'Offline sync'],
      featured: false,
      order: 2,
    },
  ],
  skills: [
    { name: 'JavaScript', level: 'expert', category: 'Programming' },
    { name: 'TypeScript', level: 'advanced', category: 'Programming' },
    { name: 'React', level: 'expert', category: 'Frontend' },
    { name: 'Node.js', level: 'advanced', category: 'Backend' },
    { name: 'AWS', level: 'intermediate', category: 'Cloud' },
    { name: 'Docker', level: 'intermediate', category: 'DevOps' },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Developer',
      issuer: 'Amazon Web Services',
      issueDate: '2022-01',
      credentialId: 'ABC123',
      credentialUrl: 'https://aws.amazon.com/verify/ABC123',
    },
  ],
  template: 'developer' as TemplateType,
  customization: {
    primaryColor: '#1a73e8',
    secondaryColor: '#34a853',
    accentColor: '#ea4335',
    fontFamily: 'Inter',
    headerStyle: 'bold',
    sectionOrder: [
      'about',
      'experience',
      'projects',
      'skills',
      'education',
      'certifications',
    ],
  },
  status: 'published',
  subdomain: 'johndoe',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-15'),
  publishedAt: new Date('2024-01-10'),
};

describe('PortfolioPreview', () => {
  describe('Template Rendering', () => {
    it('should render developer template correctly', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      // Header section
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getAllByText('Full Stack Developer')).toHaveLength(2); // Header + experience
      expect(
        screen.getByText('Building the future, one line at a time')
      ).toBeInTheDocument();

      // Contact info
      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText('Available for freelance')).toBeInTheDocument();
    });

    it('should render designer template with different layout', () => {
      const designerPortfolio = {
        ...mockPortfolio,
        template: 'designer' as TemplateType,
      };

      render(<PortfolioPreview portfolio={designerPortfolio} />);

      // Designer template should have visual portfolio focus
      expect(screen.getByTestId('designer-template')).toBeInTheDocument();
      expect(screen.getByTestId('portfolio-grid')).toBeInTheDocument();
    });

    it('should render consultant template with professional layout', () => {
      const consultantPortfolio = {
        ...mockPortfolio,
        template: 'consultant' as TemplateType,
      };

      render(<PortfolioPreview portfolio={consultantPortfolio} />);

      expect(screen.getByTestId('consultant-template')).toBeInTheDocument();
      // Consultant template emphasizes experience and credentials
      expect(screen.getByTestId('credentials-section')).toBeInTheDocument();
    });
  });

  describe('Content Sections', () => {
    it('should display about section with bio', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText(mockPortfolio.bio)).toBeInTheDocument();
    });

    it('should display all experience items chronologically', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const experienceSection = screen.getByTestId('experience-section');
      expect(experienceSection).toBeInTheDocument();

      // Should show current job first
      const experienceItems = screen.getAllByTestId('experience-item');
      expect(experienceItems[0]).toHaveTextContent('Tech Corp');
      expect(experienceItems[0]).toHaveTextContent('Present');
      expect(experienceItems[1]).toHaveTextContent('StartupXYZ');
    });

    it('should display featured projects prominently', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const featuredProject = screen.getByTestId('featured-project');
      expect(featuredProject).toHaveTextContent('E-commerce Platform');
      expect(featuredProject).toHaveClass('featured');

      // Featured project should show image
      expect(screen.getByAltText('E-commerce Platform')).toBeInTheDocument();
    });

    it('should group skills by category', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      expect(screen.getByText('Programming')).toBeInTheDocument();
      expect(screen.getByText('Frontend')).toBeInTheDocument();
      expect(screen.getByText('Backend')).toBeInTheDocument();
      expect(screen.getByText('Cloud')).toBeInTheDocument();
      expect(screen.getByText('DevOps')).toBeInTheDocument();
    });

    it('should display skill levels visually', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const jsSkill = screen.getByTestId('skill-JavaScript');
      expect(jsSkill).toHaveAttribute('data-level', 'expert');

      // Should have visual indicator (e.g., progress bar)
      const skillBar = jsSkill.querySelector('.skill-level-bar');
      expect(skillBar).toHaveStyle({ width: '100%' }); // Expert = 100%
    });

    it('should display education with achievements', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      expect(screen.getByText('University of Technology')).toBeInTheDocument();
      expect(
        screen.getByText('Bachelor of Science in Computer Science')
      ).toBeInTheDocument();
      expect(screen.getByText("Dean's List")).toBeInTheDocument();
      expect(screen.getByText('Graduated Magna Cum Laude')).toBeInTheDocument();
    });

    it('should display certifications with links', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const certLink = screen.getByRole('link', {
        name: /AWS Certified Developer/i,
      });
      expect(certLink).toHaveAttribute(
        'href',
        'https://aws.amazon.com/verify/ABC123'
      );
      expect(certLink).toHaveAttribute('target', '_blank');
      expect(certLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Social Links', () => {
    it('should display all social links with icons', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const linkedinLink = screen.getByLabelText('Linkedin');
      expect(linkedinLink).toHaveAttribute(
        'href',
        mockPortfolio.social.linkedin
      );

      const githubLink = screen.getByLabelText('Github');
      expect(githubLink).toHaveAttribute('href', mockPortfolio.social.github);

      const twitterLink = screen.getByLabelText('Twitter');
      expect(twitterLink).toHaveAttribute('href', mockPortfolio.social.twitter);
    });

    it('should not display empty social links', () => {
      const portfolioWithoutSocial = {
        ...mockPortfolio,
        social: {
          linkedin: '',
          github: 'https://github.com/johndoe',
        },
      };

      render(<PortfolioPreview portfolio={portfolioWithoutSocial} />);

      expect(screen.queryByLabelText('Linkedin')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Twitter')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Github')).toBeInTheDocument();
    });
  });

  describe('Customization', () => {
    it('should apply custom colors', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const container = screen.getByTestId('portfolio-container');
      expect(container).toHaveStyle({
        '--primary-color': '#1a73e8',
        '--secondary-color': '#34a853',
        '--accent-color': '#ea4335',
      });
    });

    it('should apply custom font family', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const container = screen.getByTestId('portfolio-container');
      expect(container).toHaveStyle({
        fontFamily: 'Inter, sans-serif',
      });
    });

    it('should apply header style', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const header = screen.getByTestId('portfolio-header');
      expect(header).toHaveClass('header-bold');
    });

    it('should respect custom section order', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const sections = screen.getAllByTestId(/section$/);
      const sectionIds = sections.map(section => section.getAttribute('id'));

      expect(sectionIds).toEqual([
        'about-section',
        'experience-section',
        'projects-section',
        'skills-section',
        'education-section',
        'certifications-section',
      ]);
    });

    it('should hide sections marked as hidden', () => {
      const portfolioWithHiddenSections = {
        ...mockPortfolio,
        customization: {
          ...mockPortfolio.customization,
          hiddenSections: ['education', 'certifications'],
        },
      };

      render(<PortfolioPreview portfolio={portfolioWithHiddenSections} />);

      expect(screen.queryByTestId('education-section')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('certifications-section')
      ).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render mobile layout on small screens', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600, // Mobile width
      });

      // Mock window.addEventListener
      const mockAddEventListener = jest.fn() as jest.Mock;
      const mockRemoveEventListener = jest.fn() as jest.Mock;
      Object.defineProperty(window, 'addEventListener', {
        writable: true,
        value: mockAddEventListener,
      });
      Object.defineProperty(window, 'removeEventListener', {
        writable: true,
        value: mockRemoveEventListener,
      });

      render(<PortfolioPreview portfolio={mockPortfolio as any} mode="mobile" />);

      const container = screen.getByTestId('portfolio-container');
      expect(container).toHaveClass('mobile-layout');
    });

    it('should stack sections vertically on mobile', () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600, // Mobile width
      });

      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const projectGrid = screen.getByTestId('projects-grid');
      expect(projectGrid).toHaveClass('grid-cols-1');
    });
  });

  describe('Empty States', () => {
    it('should handle portfolio without projects', () => {
      const portfolioWithoutProjects = {
        ...mockPortfolio,
        projects: [],
      };

      render(<PortfolioPreview portfolio={portfolioWithoutProjects} />);

      expect(screen.queryByTestId('projects-section')).not.toBeInTheDocument();
    });

    it('should handle portfolio without experience', () => {
      const portfolioWithoutExperience = {
        ...mockPortfolio,
        experience: [],
      };

      render(<PortfolioPreview portfolio={portfolioWithoutExperience} />);

      expect(
        screen.queryByTestId('experience-section')
      ).not.toBeInTheDocument();
    });

    it('should show minimal layout with only required fields', () => {
      const minimalPortfolio: Portfolio = {
        ...mockPortfolio,
        bio: '',
        experience: [],
        education: [],
        projects: [],
        skills: [],
        certifications: [],
        social: {},
      };

      render(<PortfolioPreview portfolio={minimalPortfolio} />);

      // Should still show header with name and title
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();

      // Should not show empty sections
      expect(screen.queryByTestId('about-section')).not.toBeInTheDocument();
      expect(
        screen.queryByTestId('experience-section')
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId('projects-section')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('John Doe');

      const h2s = screen.getAllByRole('heading', { level: 2 });
      expect(h2s[0]).toHaveTextContent('About');
      expect(h2s[1]).toHaveTextContent('Experience');
      expect(h2s[2]).toHaveTextContent('Projects');
    });

    it('should have proper ARIA labels for interactive elements', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      const emailLink = screen.getByLabelText('Email John Doe');
      expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');

      const projectLink = screen.getByLabelText(
        'View E-commerce Platform project'
      );
      expect(projectLink).toHaveAttribute('href', 'https://example.com');
    });

    it('should have proper contrast ratios', () => {
      render(<PortfolioPreview portfolio={mockPortfolio as any} />);

      // This would typically be tested with axe-core or similar
      // For now, we ensure contrast classes are applied
      const text = screen.getByTestId('portfolio-container');
      expect(text).toHaveClass('text-gray-900', 'dark:text-gray-100');
    });
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { usePortfolioStore } from '@/lib/store/portfolio-store';
import { useAuthStore } from '@/lib/store/auth-store';

// Mock dependencies
jest.mock('@/lib/store/portfolio-store');
jest.mock('@/lib/store/auth-store');
jest.mock('@/components/editor/sections/HeroSection', () => ({
  HeroSection: ({ data, onChange }: any) => (
    <div data-testid="hero-section">
      <input
        data-testid="hero-name"
        value={data.name}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
      />
    </div>
  ),
}));
jest.mock('@/components/editor/sections/ExperienceSection', () => ({
  ExperienceSection: ({ data }: any) => (
    <div data-testid="experience-section">
      {data.map((exp: any) => (
        <div key={exp.id}>{exp.title}</div>
      ))}
    </div>
  ),
}));
jest.mock('@/components/editor/sections/ProjectsSection', () => ({
  ProjectsSection: ({ data }: any) => (
    <div data-testid="projects-section">
      {data.map((project: any) => (
        <div key={project.id}>{project.title}</div>
      ))}
    </div>
  ),
}));
jest.mock('@/components/editor/sections/SkillsSection', () => ({
  SkillsSection: ({ data }: any) => (
    <div data-testid="skills-section">
      {data.map((skill: any) => (
        <div key={skill.id}>{skill.name}</div>
      ))}
    </div>
  ),
}));
jest.mock('@/components/editor/sections/EducationSection', () => ({
  EducationSection: ({ data }: any) => (
    <div data-testid="education-section">
      {data.map((edu: any) => (
        <div key={edu.id}>{edu.degree}</div>
      ))}
    </div>
  ),
}));
jest.mock('@/components/editor/sections/CertificationsSection', () => ({
  CertificationsSection: ({ data }: any) => (
    <div data-testid="certifications-section">
      {data.map((cert: any) => (
        <div key={cert.id}>{cert.name}</div>
      ))}
    </div>
  ),
}));
jest.mock('@/components/editor/sections/ContactSection', () => ({
  ContactSection: ({ data }: any) => (
    <div data-testid="contact-section">
      <div>{data.email}</div>
    </div>
  ),
}));

describe('EditorCanvas', () => {
  const mockPortfolio = {
    id: '1',
    userId: 'user1',
    title: 'Test Portfolio',
    template: 'developer',
    sections: ['hero', 'experience', 'projects', 'skills'],
    data: {
      personalInfo: {
        name: 'John Doe',
        title: 'Software Developer',
        bio: 'Test bio',
        avatar: null,
      },
      experience: [
        {
          id: '1',
          title: 'Senior Developer',
          company: 'Tech Corp',
          startDate: '2020-01-01',
          endDate: null,
          description: 'Working on projects',
        },
      ],
      projects: [
        {
          id: '1',
          title: 'Project One',
          description: 'A great project',
          technologies: ['React', 'TypeScript'],
          link: 'https://example.com',
          image: null,
        },
      ],
      skills: [
        { id: '1', name: 'JavaScript', level: 'Expert' },
        { id: '2', name: 'React', level: 'Expert' },
      ],
      education: [],
      certifications: [],
      contact: {
        email: 'john@example.com',
        phone: '',
        location: '',
        social: {},
      },
    },
    theme: {
      primaryColor: '#3B82F6',
      fontFamily: 'Inter',
      mode: 'light' as const,
    },
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUpdatePortfolio = jest.fn();
  const mockSetActiveSection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: mockPortfolio,
      updatePortfolio: mockUpdatePortfolio,
      activeSection: null,
      setActiveSection: mockSetActiveSection,
    });
    (useAuthStore as jest.Mock).mockReturnValue({
      user: { id: 'user1' },
    });
  });

  it('renders all enabled sections', () => {
    render(<EditorCanvas />);

    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('experience-section')).toBeInTheDocument();
    expect(screen.getByTestId('projects-section')).toBeInTheDocument();
    expect(screen.getByTestId('skills-section')).toBeInTheDocument();
  });

  it('does not render disabled sections', () => {
    render(<EditorCanvas />);

    expect(screen.queryByTestId('education-section')).not.toBeInTheDocument();
    expect(screen.queryByTestId('certifications-section')).not.toBeInTheDocument();
  });

  it('updates portfolio data when section data changes', async () => {
    render(<EditorCanvas />);

    const nameInput = screen.getByTestId('hero-name');
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    await waitFor(() => {
      expect(mockUpdatePortfolio).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          data: expect.objectContaining({
            personalInfo: expect.objectContaining({
              name: 'Jane Doe',
            }),
          }),
        })
      );
    });
  });

  it('handles section click to set active section', () => {
    render(<EditorCanvas />);

    const heroSection = screen.getByTestId('hero-section').parentElement;
    if (heroSection) {
      fireEvent.click(heroSection);
      expect(mockSetActiveSection).toHaveBeenCalledWith('hero');
    }
  });

  it('renders empty state when no portfolio is loaded', () => {
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: null,
      updatePortfolio: mockUpdatePortfolio,
      activeSection: null,
      setActiveSection: mockSetActiveSection,
    });

    render(<EditorCanvas />);

    expect(screen.getByText('No portfolio loaded')).toBeInTheDocument();
  });

  it('applies active section styling', () => {
    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: mockPortfolio,
      updatePortfolio: mockUpdatePortfolio,
      activeSection: 'hero',
      setActiveSection: mockSetActiveSection,
    });

    render(<EditorCanvas />);

    const heroSection = screen.getByTestId('hero-section').parentElement;
    expect(heroSection).toHaveClass('ring-2');
  });

  it('renders contact section at the end', () => {
    const portfolioWithContact = {
      ...mockPortfolio,
      sections: ['hero', 'contact'],
    };

    (usePortfolioStore as jest.Mock).mockReturnValue({
      currentPortfolio: portfolioWithContact,
      updatePortfolio: mockUpdatePortfolio,
      activeSection: null,
      setActiveSection: mockSetActiveSection,
    });

    render(<EditorCanvas />);

    const sections = screen.getAllByTestId(/.*-section/);
    expect(sections[sections.length - 1]).toHaveAttribute(
      'data-testid',
      'contact-section'
    );
  });
});
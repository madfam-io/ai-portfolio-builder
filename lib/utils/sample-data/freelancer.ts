import type { SampleDataConfig } from './types';

export const freelancerSampleData: SampleDataConfig = {
  personal: {
    name: 'Jordan Smith',
    title: 'Freelance Full-Stack Developer',
    bio: 'Versatile freelance developer with 8+ years of experience building scalable web applications and mobile solutions. Specialized in rapid prototyping and MVP development for startups and established businesses.',
    email: 'jordan.smith@example.com',
    phone: '+1 (555) 147-2589',
    location: 'Remote / Austin, TX',
    website: 'https://jordansmith.dev',
  },
  skills: {
    technical: [
      { name: 'React/Next.js', level: 'expert', category: 'Frontend' },
      { name: 'Node.js', level: 'expert', category: 'Backend' },
      { name: 'TypeScript', level: 'advanced', category: 'Languages' },
      { name: 'PostgreSQL', level: 'advanced', category: 'Database' },
      { name: 'AWS/Cloud', level: 'intermediate', category: 'DevOps' },
      { name: 'React Native', level: 'advanced', category: 'Mobile' },
    ],
    soft: [
      { name: 'Project Management', level: 'expert', category: 'Business' },
      {
        name: 'Client Communication',
        level: 'expert',
        category: 'Communication',
      },
      { name: 'Time Management', level: 'expert', category: 'Productivity' },
      { name: 'Problem Solving', level: 'expert', category: 'Technical' },
      { name: 'Remote Collaboration', level: 'expert', category: 'Teamwork' },
      {
        name: 'Technical Writing',
        level: 'advanced',
        category: 'Communication',
      },
    ],
  },
  experience: [
    {
      id: '1',
      company: 'Freelance Developer',
      position: 'Full-Stack Developer & Consultant',
      startDate: '2018-01',
      current: true,
      description:
        'Providing end-to-end development services for clients ranging from startups to Fortune 500 companies. Specializing in rapid MVP development and technical consulting.',
      achievements: [
        'Completed 50+ projects with 100% client satisfaction',
        'Built applications serving 1M+ users',
        'Maintained 90% client retention rate',
        'Generated $500K+ in annual revenue',
      ],
    },
    {
      id: '2',
      company: 'TechCorp Solutions',
      position: 'Senior Developer',
      startDate: '2015-06',
      endDate: '2017-12',
      current: false,
      description:
        'Led development of enterprise SaaS platform. Managed technical architecture and mentored junior developers while delivering critical features.',
      achievements: [
        'Architected microservices handling 10M+ requests/day',
        'Reduced system downtime by 99.9%',
        'Mentored team of 5 developers',
        'Introduced CI/CD pipeline reducing deployment time by 80%',
      ],
    },
    {
      id: '3',
      company: 'StartupXYZ',
      position: 'Founding Engineer',
      startDate: '2013-03',
      endDate: '2015-05',
      current: false,
      description:
        'First technical hire at funded startup. Built initial product from concept to launch, establishing technical foundation for company growth.',
      achievements: [
        'Built MVP in 3 months leading to $2M seed funding',
        'Scaled platform to 50K users',
        'Implemented real-time features using WebSocket',
        'Established development best practices',
      ],
    },
  ],
  education: [
    {
      id: '1',
      institution: 'University of Texas at Austin',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2009-08',
      endDate: '2013-05',
      achievements: ["Dean's List", 'ACM Programming Team'],
    },
  ],
  projects: [
    {
      id: '1',
      title: 'E-Learning Platform for MegaCorp',
      description:
        'Built comprehensive e-learning platform supporting video courses, quizzes, and progress tracking. Integrated with existing enterprise systems.',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'AWS', 'Stripe'],
      role: 'Lead Developer',
      featured: true,
    },
    {
      id: '2',
      title: 'Real Estate Mobile App',
      description:
        'Developed cross-platform mobile application for real estate listings with AR home viewing features and mortgage calculator.',
      technologies: ['React Native', 'Firebase', 'AR Kit', 'Google Maps API'],
      role: 'Mobile Developer',
      featured: true,
      liveUrl: 'https://apps.apple.com/realestate-app',
    },
    {
      id: '3',
      title: 'SaaS Analytics Dashboard',
      description:
        'Created real-time analytics dashboard for B2B SaaS company. Features include custom reports, data visualization, and automated insights.',
      technologies: ['Next.js', 'D3.js', 'Python', 'Redis', 'PostgreSQL'],
      role: 'Full-Stack Developer',
      featured: true,
      githubUrl: 'https://github.com/example/analytics-dashboard',
    },
    {
      id: '4',
      title: 'Open Source React Component Library',
      description:
        'Maintained popular open-source UI component library with 10K+ GitHub stars. Regular contributions and community support.',
      technologies: ['React', 'TypeScript', 'Storybook', 'Jest'],
      role: 'Maintainer',
      featured: false,
      githubUrl: 'https://github.com/example/ui-library',
    },
  ],
  social: {
    linkedin: 'https://linkedin.com/in/jordansmithdev',
    github: 'https://github.com/jordansmith',
    twitter: 'https://twitter.com/jordansmithdev',
    website: 'https://jordansmith.dev',
  },
  testimonials: [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'CTO, TechStartup Inc.',
      content:
        'Jordan delivered exceptional work on our MVP. Their technical expertise and communication skills made them feel like part of our core team.',
    },
    {
      id: '2',
      name: 'David Miller',
      role: 'Product Manager, MegaCorp',
      content:
        'Working with Jordan was a game-changer. They understood our requirements perfectly and delivered a solution that exceeded expectations.',
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2022-03',
    },
    {
      id: '2',
      name: 'Google Cloud Professional Developer',
      issuer: 'Google Cloud',
      issueDate: '2021-11',
    },
  ],
};

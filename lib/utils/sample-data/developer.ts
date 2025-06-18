import type { SampleDataConfig } from './types';

export const developerSampleData: SampleDataConfig = {
  personal: {
    name: 'Alex Rodriguez',
    title: 'Senior Full-Stack Developer',
    bio: 'Passionate software engineer with 6+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud architecture. Led development teams and delivered high-impact solutions for fintech and healthcare industries.',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
  },
  experience: [
    {
      id: '1',
      position: 'Senior Full-Stack Developer',
      company: 'TechCorp Inc.',
      startDate: '2021-03',
      current: true,
      description:
        'Led development of microservices architecture serving 2M+ users. Architected CI/CD pipelines reducing deployment time by 60%.',
      highlights: [
        'Increased system performance by 40% through database optimization',
        'Mentored team of 4 junior developers',
        'Implemented real-time features using WebSocket and Redis',
      ],
      technologies: [
        'React',
        'Node.js',
        'PostgreSQL',
        'AWS',
        'Docker',
        'TypeScript',
      ],
    },
    {
      id: '2',
      position: 'Full-Stack Developer',
      company: 'StartupXYZ',
      startDate: '2019-06',
      endDate: '2021-02',
      current: false,
      description:
        'Built MVP from scratch for healthcare platform. Collaborated directly with founders and product team.',
      highlights: [
        'Developed HIPAA-compliant patient portal',
        'Integrated with 5+ third-party medical APIs',
        'Achieved 99.9% uptime in production',
      ],
      technologies: ['Vue.js', 'Python', 'FastAPI', 'MongoDB', 'GCP'],
    },
  ],
  projects: [
    {
      id: '1',
      title: 'EcoTracker Mobile App',
      description:
        'A React Native app that helps users track their carbon footprint and suggests eco-friendly alternatives.',
      highlights: [
        '50K+ downloads on App Store and Google Play',
        'Real-time carbon tracking with ML predictions',
        'Integration with smart home devices',
      ],
      technologies: ['React Native', 'TensorFlow Lite', 'Firebase', 'Redux'],
      projectUrl: 'https://github.com/alexr/ecotracker',
      imageUrl: '/demo/dev1.jpg',
      featured: true,
      order: 1,
    },
    {
      id: '2',
      title: 'DevFlow CLI Tool',
      description:
        'Open-source command-line tool for automating development workflows. Simplifies Git operations and deployment processes.',
      highlights: [
        '2.5K+ GitHub stars',
        'Used by 100+ development teams',
        'Featured on Product Hunt',
      ],
      technologies: ['Node.js', 'TypeScript', 'Commander.js', 'Jest'],
      projectUrl: 'https://github.com/alexr/devflow',
      imageUrl: '/demo/dev2.jpg',
      featured: true,
      order: 2,
    },
    {
      id: '3',
      title: 'Real-time Analytics Dashboard',
      description:
        'Built a high-performance analytics dashboard handling 1M+ events per minute with sub-second query times.',
      highlights: [
        'WebSocket real-time updates',
        'Advanced data visualization with D3.js',
        'Horizontally scalable architecture',
      ],
      technologies: ['React', 'D3.js', 'WebSocket', 'Elasticsearch', 'Redis'],
      projectUrl: 'https://demo.analyticsdashboard.io',
      imageUrl: '/demo/dev3.jpg',
      featured: false,
      order: 3,
    },
  ],
  education: [
    {
      id: '1',
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2013-09',
      endDate: '2017-05',
      current: false,
      achievements: ["Dean's List", 'ACM Programming Competition Winner'],
    },
  ],
  skills: {
    technical: [
      { name: 'JavaScript', level: 'expert' },
      { name: 'TypeScript', level: 'expert' },
      { name: 'Python', level: 'advanced' },
      { name: 'React', level: 'expert' },
      { name: 'Node.js', level: 'expert' },
      { name: 'PostgreSQL', level: 'advanced' },
      { name: 'AWS', level: 'advanced' },
      { name: 'Docker', level: 'intermediate' },
    ],
    soft: [
      { name: 'Team Leadership' },
      { name: 'Problem Solving' },
      { name: 'Communication' },
      { name: 'Agile Methodologies' },
    ],
  },
  certifications: [
    {
      id: '1',
      name: 'AWS Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: '2022-06',
      expiryDate: '2025-06',
      credentialId: 'AWS-SA-2022-1234',
      credentialUrl: 'https://aws.amazon.com/verify/AWS-SA-2022-1234',
    },
    {
      id: '2',
      name: 'Google Cloud Professional Developer',
      issuer: 'Google Cloud',
      issueDate: '2021-11',
      credentialId: 'GCP-DEV-2021-5678',
    },
  ],
  social: {
    linkedin: 'https://linkedin.com/in/alexrodriguez',
    github: 'https://github.com/alexrodriguez',
    twitter: 'https://twitter.com/alexcodes',
    website: 'https://alexrodriguez.dev',
  },
};

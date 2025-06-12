/**
 * @fileoverview Sample Data Generator
 *
 * Generates realistic sample portfolio data for demos and testing.
 * Includes template-specific content and industry-appropriate examples.
 */

import { getTemplateConfig } from '@/lib/templates/templateConfig';
import {
  Portfolio,
  TemplateType,
  Experience,
  Project,
  Education,
  Skill,
  Certification,
} from '@/types/portfolio';

interface SampleDataConfig {
  name: string;
  title: string;
  bio: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  social: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
    dribbble?: string;
    behance?: string;
  };
}

const SAMPLE_DATA_BY_TEMPLATE: Record<TemplateType, SampleDataConfig> = {
  developer: {
    name: 'Alex Rodriguez',
    title: 'Senior Full-Stack Developer',
    bio: 'Passionate software engineer with 6+ years of experience building scalable web applications. Expertise in React, Node.js, and cloud architecture. Led development teams and delivered high-impact solutions for fintech and healthcare industries.',
    tagline: 'Building the future, one line of code at a time',
    location: 'San Francisco, CA',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    experience: [
      {
        id: '1',
        position: 'Senior Full-Stack Developer',
        company: 'TechCorp Inc.',
        startDate: '2021-03',
        endDate: '',
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
          'Built with React Native and Node.js backend',
          '10,000+ downloads in first month',
          'Featured on Product Hunt',
        ],
        technologies: ['React Native', 'Node.js', 'MongoDB', 'Stripe API'],
        projectUrl: 'https://ecotracker.example.com',
        githubUrl: 'https://github.com/alexr/ecotracker',
        imageUrl: '/demo/project1.jpg',
        featured: true,
        order: 1,
      },
      {
        id: '2',
        title: 'DevTools Dashboard',
        description:
          'Real-time monitoring dashboard for development teams to track code quality, deployments, and performance metrics.',
        highlights: [
          'Real-time data visualization with D3.js',
          'Integrated with GitHub, Jira, and AWS',
          'Used by 50+ development teams',
        ],
        technologies: ['React', 'D3.js', 'Express', 'WebSocket', 'Redis'],
        projectUrl: 'https://devtools.example.com',
        githubUrl: 'https://github.com/alexr/devtools',
        imageUrl: '/demo/project2.jpg',
        featured: false,
        order: 2,
      },
    ],
    education: [
      {
        id: '1',
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2015-08',
        endDate: '2019-05',
        current: false,
        achievements: [
          "Dean's List for 3 consecutive semesters",
          'President of Computer Science Student Association',
          'Winner of UC Berkeley Hackathon 2018',
        ],
      },
    ],
    skills: [
      {
        name: 'JavaScript',
        level: 'expert',
        category: 'Programming Languages',
      },
      {
        name: 'TypeScript',
        level: 'expert',
        category: 'Programming Languages',
      },
      { name: 'Python', level: 'advanced', category: 'Programming Languages' },
      { name: 'React', level: 'expert', category: 'Frontend' },
      { name: 'Node.js', level: 'expert', category: 'Backend' },
      { name: 'PostgreSQL', level: 'advanced', category: 'Databases' },
      { name: 'AWS', level: 'advanced', category: 'Cloud & DevOps' },
      { name: 'Docker', level: 'advanced', category: 'Cloud & DevOps' },
    ],
    certifications: [
      {
        id: '1',
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        issueDate: '2022-08',
        expiryDate: '2025-08',
        credentialId: 'AWS-SA-2022-ARX',
        credentialUrl: 'https://aws.amazon.com/verification',
      },
    ],
    social: {
      linkedin: 'https://linkedin.com/in/alexrodriguez',
      github: 'https://github.com/alexr',
      twitter: 'https://twitter.com/alexr_dev',
      website: 'https://alexrodriguez.dev',
    },
  },

  designer: {
    name: 'Maya Chen',
    title: 'Senior UX/UI Designer',
    bio: 'Creative designer with 5+ years of experience crafting beautiful and intuitive digital experiences. Specialized in user research, interaction design, and design systems. Passionate about accessibility and inclusive design.',
    tagline: 'Designing experiences that delight and inspire',
    location: 'New York, NY',
    email: 'maya@example.com',
    phone: '+1 (555) 987-6543',
    experience: [
      {
        id: '1',
        position: 'Senior UX/UI Designer',
        company: 'Design Studio Pro',
        startDate: '2020-09',
        endDate: '',
        current: true,
        description:
          'Lead designer for enterprise SaaS products. Manage design system and mentor junior designers.',
        highlights: [
          'Increased user engagement by 35% through redesign',
          'Built comprehensive design system used across 8 products',
          'Led user research initiatives with 500+ participants',
        ],
        technologies: [
          'Figma',
          'Sketch',
          'Adobe Creative Suite',
          'Principle',
          'InVision',
        ],
      },
    ],
    projects: [
      {
        id: '1',
        title: 'FinanceApp Mobile Redesign',
        description:
          'Complete redesign of mobile banking app focusing on accessibility and user experience improvements.',
        highlights: [
          'Improved task completion rate by 40%',
          'WCAG 2.1 AA compliant design',
          'Featured in UX Magazine',
        ],
        technologies: ['Figma', 'Principle', 'Adobe XD', 'UserTesting'],
        projectUrl: 'https://behance.net/maya/financeapp',
        imageUrl: '/demo/design1.jpg',
        featured: true,
        order: 1,
      },
    ],
    education: [
      {
        id: '1',
        institution: 'Parsons School of Design',
        degree: 'Bachelor of Fine Arts',
        field: 'Communication Design',
        startDate: '2016-09',
        endDate: '2020-05',
        current: false,
        achievements: ['Summa Cum Laude', 'Design Excellence Award'],
      },
    ],
    skills: [
      { name: 'UI Design', level: 'expert', category: 'Design' },
      { name: 'UX Research', level: 'expert', category: 'Research' },
      { name: 'Figma', level: 'expert', category: 'Tools' },
      { name: 'Prototyping', level: 'advanced', category: 'Design' },
      { name: 'Design Systems', level: 'expert', category: 'Design' },
    ],
    certifications: [
      {
        id: '1',
        name: 'Google UX Design Certificate',
        issuer: 'Google',
        issueDate: '2021-03',
        credentialId: 'GOOGLE-UX-2021',
      },
    ],
    social: {
      linkedin: 'https://linkedin.com/in/mayachen',
      behance: 'https://behance.net/mayachen',
      dribbble: 'https://dribbble.com/mayachen',
    },
  },

  consultant: {
    name: 'Robert Thompson',
    title: 'Senior Management Consultant',
    bio: 'Strategic business consultant with 10+ years of experience helping Fortune 500 companies optimize operations and drive growth. Specialized in digital transformation, process improvement, and organizational change management.',
    tagline: 'Transforming businesses through strategic innovation',
    location: 'Chicago, IL',
    email: 'robert@example.com',
    phone: '+1 (555) 456-7890',
    experience: [
      {
        id: '1',
        position: 'Senior Manager',
        company: 'McKinsey & Company',
        startDate: '2019-01',
        endDate: '',
        current: true,
        description:
          'Lead strategic initiatives for Fortune 500 clients across retail, manufacturing, and technology sectors.',
        highlights: [
          'Generated $50M+ in cost savings for clients',
          'Led 15+ digital transformation projects',
          'Managed teams of up to 12 consultants',
        ],
        technologies: ['Tableau', 'PowerBI', 'SAP', 'Salesforce', 'Excel'],
      },
    ],
    projects: [
      {
        id: '1',
        title: 'Retail Digital Transformation',
        description:
          'Led complete digital transformation for major retail chain, implementing omnichannel strategy and new POS systems.',
        highlights: [
          '$25M cost reduction in first year',
          '30% improvement in customer satisfaction',
          'Successful rollout across 200+ stores',
        ],
        technologies: ['SAP', 'Salesforce', 'Tableau', 'Azure'],
        featured: true,
        order: 1,
      },
    ],
    education: [
      {
        id: '1',
        institution: 'Harvard Business School',
        degree: 'Master of Business Administration',
        field: 'Strategy',
        startDate: '2016-09',
        endDate: '2018-05',
        current: false,
        achievements: ['Baker Scholar (Top 5%)', 'Consulting Club President'],
      },
    ],
    skills: [
      { name: 'Strategic Planning', level: 'expert', category: 'Strategy' },
      { name: 'Process Improvement', level: 'expert', category: 'Operations' },
      { name: 'Data Analysis', level: 'advanced', category: 'Analytics' },
      { name: 'Change Management', level: 'expert', category: 'Leadership' },
    ],
    certifications: [
      {
        id: '1',
        name: 'PMP Certification',
        issuer: 'Project Management Institute',
        issueDate: '2020-06',
        expiryDate: '2023-06',
      },
    ],
    social: {
      linkedin: 'https://linkedin.com/in/robertthompson',
    },
  },

  business: {
    name: 'Sarah Williams',
    title: 'VP of Business Development',
    bio: 'Results-driven executive with 12+ years of experience scaling businesses and building strategic partnerships. Track record of driving revenue growth, expanding market presence, and leading high-performing teams.',
    tagline: 'Building bridges between vision and execution',
    location: 'Austin, TX',
    email: 'sarah@example.com',
    phone: '+1 (555) 321-0987',
    experience: [
      {
        id: '1',
        position: 'VP of Business Development',
        company: 'TechGrowth Corp',
        startDate: '2020-03',
        endDate: '',
        current: true,
        description:
          'Lead business development strategy and partnership initiatives for $100M+ SaaS company.',
        highlights: [
          'Increased annual revenue by 150% over 3 years',
          'Established partnerships with 50+ enterprise clients',
          'Built and managed team of 8 business development professionals',
        ],
        technologies: [
          'Salesforce',
          'HubSpot',
          'Tableau',
          'LinkedIn Sales Navigator',
        ],
      },
    ],
    projects: [],
    education: [
      {
        id: '1',
        institution: 'University of Texas at Austin',
        degree: 'Bachelor of Business Administration',
        field: 'Marketing',
        startDate: '2006-08',
        endDate: '2010-05',
        current: false,
      },
    ],
    skills: [
      { name: 'Business Strategy', level: 'expert', category: 'Strategy' },
      {
        name: 'Partnership Development',
        level: 'expert',
        category: 'Business Development',
      },
      { name: 'Sales Management', level: 'expert', category: 'Sales' },
      { name: 'Market Analysis', level: 'advanced', category: 'Analytics' },
    ],
    certifications: [],
    social: {
      linkedin: 'https://linkedin.com/in/sarahwilliams',
    },
  },

  creative: {
    name: 'David Park',
    title: 'Creative Director & Photographer',
    bio: 'Multi-disciplinary creative professional specializing in brand identity, photography, and digital art. Passionate about storytelling through visual media and creating impactful brand experiences.',
    tagline: 'Capturing stories, creating experiences',
    location: 'Los Angeles, CA',
    email: 'david@example.com',
    phone: '+1 (555) 654-3210',
    experience: [
      {
        id: '1',
        position: 'Creative Director',
        company: 'Freelance',
        startDate: '2018-01',
        endDate: '',
        current: true,
        description:
          'Lead creative projects for brands, agencies, and individual clients across various industries.',
        highlights: [
          'Collaborated with 100+ brands including Nike and Apple',
          'Work featured in Vogue, GQ, and National Geographic',
          'Founded successful creative studio with 5 team members',
        ],
        technologies: [
          'Adobe Creative Suite',
          'Cinema 4D',
          'Capture One',
          'Final Cut Pro',
        ],
      },
    ],
    projects: [
      {
        id: '1',
        title: 'Nike Campaign Photography',
        description:
          "Lead photographer for Nike's summer 2023 campaign featuring professional athletes.",
        highlights: [
          'Campaign reached 10M+ impressions',
          'Featured across digital and print media',
          'Collaborated with world-class athletes',
        ],
        technologies: ['Canon R5', 'Capture One', 'Photoshop'],
        featured: true,
        order: 1,
      },
    ],
    education: [
      {
        id: '1',
        institution: 'Art Center College of Design',
        degree: 'Bachelor of Fine Arts',
        field: 'Photography',
        startDate: '2012-09',
        endDate: '2016-05',
        current: false,
      },
    ],
    skills: [
      { name: 'Photography', level: 'expert', category: 'Creative' },
      { name: 'Brand Design', level: 'expert', category: 'Design' },
      { name: 'Adobe Creative Suite', level: 'expert', category: 'Tools' },
      { name: 'Art Direction', level: 'expert', category: 'Creative' },
    ],
    certifications: [],
    social: {
      instagram: 'https://instagram.com/davidpark',
      behance: 'https://behance.net/davidpark',
    },
  },

  minimal: {
    name: 'Dr. Emma Johnson',
    title: 'Research Scientist',
    bio: 'Dedicated researcher with PhD in Computational Biology and 8+ years of experience in biomedical research. Published 25+ peer-reviewed papers and led interdisciplinary research teams.',
    tagline: 'Advancing science through computational innovation',
    location: 'Boston, MA',
    email: 'emma@example.com',
    phone: '+1 (555) 789-0123',
    experience: [
      {
        id: '1',
        position: 'Senior Research Scientist',
        company: 'MIT Bio Lab',
        startDate: '2019-09',
        endDate: '',
        current: true,
        description:
          'Lead computational biology research focusing on machine learning applications in drug discovery.',
        highlights: [
          'Published 15 papers in Nature, Science, and Cell',
          'Received $2M NIH grant for drug discovery research',
          'Supervised 6 PhD students and 4 postdocs',
        ],
        technologies: ['Python', 'R', 'MATLAB', 'TensorFlow', 'BioPython'],
      },
    ],
    projects: [],
    education: [
      {
        id: '1',
        institution: 'Stanford University',
        degree: 'Doctor of Philosophy',
        field: 'Computational Biology',
        startDate: '2013-09',
        endDate: '2018-06',
        current: false,
        achievements: ['Summa Cum Laude', 'Outstanding Dissertation Award'],
      },
    ],
    skills: [
      { name: 'Machine Learning', level: 'expert', category: 'Computational' },
      { name: 'Bioinformatics', level: 'expert', category: 'Biology' },
      { name: 'Python', level: 'expert', category: 'Programming' },
      { name: 'Statistical Analysis', level: 'expert', category: 'Analytics' },
    ],
    certifications: [],
    social: {
      linkedin: 'https://linkedin.com/in/emmajohnson',
    },
  },
  educator: {
    name: 'Prof. Michael Chen',
    title: 'Professor of Computer Science',
    bio: 'Passionate educator and researcher with 15+ years of experience in computer science education. Developed innovative teaching methods and published extensively in educational technology.',
    tagline: 'Inspiring the next generation of technologists',
    location: 'Stanford, CA',
    email: 'mchen@example.edu',
    phone: '+1 (555) 246-8135',
    experience: [
      {
        id: '1',
        position: 'Professor of Computer Science',
        company: 'Stanford University',
        startDate: '2015-09',
        endDate: '',
        current: true,
        description:
          'Lead research in educational technology and teach undergraduate and graduate courses in algorithms and data structures.',
        highlights: [
          'Published 40+ papers in educational technology',
          'Developed online course with 100,000+ students',
          'Received Outstanding Teaching Award 3 times',
        ],
        technologies: [
          'Python',
          'Java',
          'JavaScript',
          'React',
          'Machine Learning',
        ],
      },
    ],
    projects: [
      {
        id: '1',
        title: 'Interactive Algorithm Visualizer',
        description:
          'Web-based platform for visualizing complex algorithms to help students understand data structures and algorithms.',
        highlights: [
          'Used by 50,000+ students worldwide',
          'Reduced student failure rate by 30%',
          'Featured in ACM Education Conference',
        ],
        technologies: ['React', 'D3.js', 'Node.js', 'MongoDB'],
        projectUrl: 'https://algo-viz.edu',
        featured: true,
        order: 1,
      },
    ],
    education: [
      {
        id: '1',
        institution: 'MIT',
        degree: 'Doctor of Philosophy',
        field: 'Computer Science',
        startDate: '2008-09',
        endDate: '2013-05',
        current: false,
        achievements: [
          'Outstanding Dissertation Award',
          'Teaching Assistant Excellence Award',
        ],
      },
    ],
    skills: [
      {
        name: 'Educational Technology',
        level: 'expert',
        category: 'Education',
      },
      { name: 'Curriculum Design', level: 'expert', category: 'Education' },
      { name: 'Python', level: 'expert', category: 'Programming' },
      { name: 'Machine Learning', level: 'advanced', category: 'Technical' },
    ],
    certifications: [],
    social: {
      linkedin: 'https://linkedin.com/in/michaelchen',
      twitter: 'https://twitter.com/profchen',
    },
  },
  modern: {
    name: 'Jessica Kim',
    title: 'Product Manager',
    bio: 'Strategic product leader with 8+ years of experience building user-centric digital products. Specialized in data-driven decision making and cross-functional team leadership.',
    tagline: 'Building products that users love',
    location: 'Seattle, WA',
    email: 'jessica@example.com',
    phone: '+1 (555) 369-2580',
    experience: [
      {
        id: '1',
        position: 'Senior Product Manager',
        company: 'Microsoft',
        startDate: '2020-01',
        endDate: '',
        current: true,
        description:
          'Lead product strategy for Azure developer tools, managing roadmap and feature prioritization for products used by millions of developers.',
        highlights: [
          'Increased user engagement by 45% through data-driven features',
          'Led cross-functional team of 15 engineers and designers',
          'Launched 3 major product features ahead of schedule',
        ],
        technologies: ['SQL', 'Python', 'Tableau', 'Figma', 'Jira'],
      },
    ],
    projects: [
      {
        id: '1',
        title: 'Developer Experience Platform',
        description:
          'End-to-end developer experience platform that streamlined the development workflow for Azure services.',
        highlights: [
          '40% reduction in developer onboarding time',
          '85% user satisfaction score',
          'Adopted by 500,000+ developers globally',
        ],
        technologies: ['React', 'Azure', 'TypeScript', 'GraphQL'],
        featured: true,
        order: 1,
      },
    ],
    education: [
      {
        id: '1',
        institution: 'University of Washington',
        degree: 'Master of Business Administration',
        field: 'Technology Management',
        startDate: '2014-09',
        endDate: '2016-06',
        current: false,
        achievements: ["Dean's List", 'Product Management Concentration'],
      },
    ],
    skills: [
      { name: 'Product Strategy', level: 'expert', category: 'Product' },
      { name: 'Data Analysis', level: 'expert', category: 'Analytics' },
      { name: 'User Research', level: 'advanced', category: 'Research' },
      { name: 'Agile Methodologies', level: 'expert', category: 'Process' },
    ],
    certifications: [
      {
        id: '1',
        name: 'Certified Scrum Product Owner',
        issuer: 'Scrum Alliance',
        issueDate: '2019-03',
        expiryDate: '2022-03',
      },
    ],
    social: {
      linkedin: 'https://linkedin.com/in/jessicakim',
      twitter: 'https://twitter.com/jessicapm',
    },
  },
};

/**
 * Generate a sample portfolio for a given template
 */
export function generateSamplePortfolio(template: TemplateType): Portfolio {
  const sampleData = SAMPLE_DATA_BY_TEMPLATE[template];
  const templateConfig = getTemplateConfig(template);

  return {
    id: 'demo-portfolio',
    userId: 'demo-user',
    name: sampleData.name,
    title: sampleData.title,
    bio: sampleData.bio,
    tagline: sampleData.tagline,
    avatarUrl: '/demo/avatar.jpg',
    template,
    status: 'draft',
    subdomain: `${sampleData.name.toLowerCase().replace(' ', '')}-demo`,

    contact: {
      email: sampleData.email,
      phone: sampleData.phone,
      location: sampleData.location,
      availability: 'Available for new opportunities',
    },

    social: sampleData.social,

    experience: sampleData.experience,
    education: sampleData.education,
    projects: sampleData.projects,
    skills: sampleData.skills,
    certifications: sampleData.certifications,

    customization: {
      primaryColor: templateConfig.colorScheme.primary,
      secondaryColor: templateConfig.colorScheme.secondary,
      accentColor: templateConfig.colorScheme.accent,
      fontFamily: 'Inter',
      headerStyle: templateConfig.layout.headerStyle,
      sectionOrder: templateConfig.defaultOrder,
      hiddenSections: [],
    },

    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Get sample project data for a specific industry
 */
export function getSampleProjects(industry: string): Project[] {
  // Return industry-specific sample projects
  const projectsByIndustry: Record<string, Project[]> = {
    software: [
      {
        id: '1',
        title: 'E-commerce Platform',
        description:
          'Full-stack e-commerce solution with payment processing and inventory management.',
        highlights: [
          'Built with MERN stack',
          'Stripe integration',
          '99.9% uptime',
        ],
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
        featured: true,
        order: 1,
      },
    ],
    design: [
      {
        id: '1',
        title: 'Mobile App Redesign',
        description:
          'Complete UX/UI redesign of popular fitness tracking application.',
        highlights: [
          '40% increase in user engagement',
          'WCAG compliant',
          '5-star rating',
        ],
        technologies: ['Figma', 'Principle', 'Adobe XD'],
        featured: true,
        order: 1,
      },
    ],
  };

  return projectsByIndustry[industry] || [];
}

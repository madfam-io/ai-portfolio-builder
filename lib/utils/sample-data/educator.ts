import type { SampleDataConfig } from './types';

export const educatorSampleData: SampleDataConfig = {
  personal: {
    name: 'Dr. Priya Patel',
    title: 'Data Science Educator & Researcher',
    bio: 'Passionate educator bridging the gap between complex data science concepts and practical applications. Dedicated to making advanced analytics accessible to learners at all levels through innovative teaching methods and real-world projects.',
    email: 'priya.patel@example.edu',
    phone: '+1 (555) 246-8135',
    location: 'Boston, MA',
    website: 'https://priyapatel.edu',
  },
  skills: {
    technical: [
      { name: 'Python', level: 'expert', category: 'Programming' },
      { name: 'Machine Learning', level: 'expert', category: 'Data Science' },
      {
        name: 'Statistical Analysis',
        level: 'expert',
        category: 'Data Science',
      },
      { name: 'Curriculum Design', level: 'expert', category: 'Education' },
      {
        name: 'Online Learning Platforms',
        level: 'advanced',
        category: 'EdTech',
      },
      { name: 'Research Methods', level: 'expert', category: 'Research' },
    ],
    soft: [
      { name: 'Teaching', level: 'expert', category: 'Education' },
      { name: 'Public Speaking', level: 'expert', category: 'Communication' },
      { name: 'Mentoring', level: 'expert', category: 'Leadership' },
      {
        name: 'Curriculum Development',
        level: 'expert',
        category: 'Education',
      },
      { name: 'Student Engagement', level: 'expert', category: 'Education' },
      {
        name: 'Cross-cultural Communication',
        level: 'advanced',
        category: 'Communication',
      },
    ],
  },
  experience: [
    {
      id: '1',
      company: 'MIT Data Science Institute',
      position: 'Senior Lecturer & Program Director',
      startDate: '2019',
      endDate: null,
      current: true,
      description:
        'Leading data science education initiatives and directing professional certificate programs. Teaching graduate courses in machine learning and statistical modeling.',
      achievements: [
        'Developed curriculum reaching 10,000+ students globally',
        'Achieved 95% student satisfaction rating',
        'Published 3 bestselling data science textbooks',
        'Secured $2M grant for education innovation',
      ],
    },
    {
      id: '2',
      company: 'DataCamp',
      position: 'Lead Course Instructor',
      startDate: '2017',
      endDate: '2021',
      current: false,
      description:
        'Created and taught online data science courses for professional learners. Developed interactive learning experiences combining theory with hands-on practice.',
      achievements: [
        'Courses completed by 500,000+ learners worldwide',
        'Top-rated instructor with 4.9/5 average rating',
        'Designed 12 courses covering ML, statistics, and Python',
        'Pioneered adaptive learning techniques for online education',
      ],
    },
    {
      id: '3',
      company: 'Boston University',
      position: 'Assistant Professor',
      startDate: '2014',
      endDate: '2019',
      current: false,
      description:
        'Taught undergraduate and graduate courses in computer science and data analytics. Conducted research in educational technology and learning analytics.',
      achievements: [
        'Published 20+ peer-reviewed research papers',
        'Supervised 15 graduate student theses',
        'Received Excellence in Teaching Award (2017, 2018)',
        'Developed innovative flipped classroom methodology',
      ],
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Stanford University',
      degree: 'Ph.D.',
      field: 'Computer Science - Machine Learning',
      startDate: '2009',
      endDate: '2014',
      achievements: ['Dissertation Award', 'Teaching Assistant Excellence'],
    },
    {
      id: '2',
      institution: 'IIT Bombay',
      degree: 'Bachelor of Technology',
      field: 'Computer Science and Engineering',
      startDate: '2005',
      endDate: '2009',
      achievements: ['Gold Medal', 'Best Thesis Award'],
    },
  ],
  projects: [
    {
      id: '1',
      title: 'AI-Powered Personalized Learning Platform',
      description:
        'Developed adaptive learning system using ML to customize educational content based on individual student needs. Improved learning outcomes by 40%.',
      technologies: [
        'Machine Learning',
        'Python',
        'Educational Analytics',
        'React',
      ],
      role: 'Project Lead',
      startDate: '2021',
      endDate: '2022',
      featured: true,
      githubUrl: 'https://github.com/example/adaptive-learning',
      impact: 'Used by 50,000+ students, 40% improvement in outcomes',
    },
    {
      id: '2',
      title: 'Open Source Data Science Curriculum',
      description:
        'Created comprehensive, free curriculum covering fundamental to advanced data science topics. Includes interactive notebooks, projects, and assessments.',
      technologies: ['Jupyter', 'Python', 'Git', 'Docker'],
      role: 'Curriculum Designer',
      startDate: '2020',
      endDate: '2021',
      featured: true,
      liveUrl: 'https://opensource-ds-curriculum.org',
      githubUrl: 'https://github.com/example/ds-curriculum',
      impact: 'Adopted by 100+ universities worldwide',
    },
    {
      id: '3',
      title: 'Virtual Reality Statistics Lab',
      description:
        'Innovative VR environment for teaching complex statistical concepts through immersive visualization. Makes abstract concepts tangible for students.',
      technologies: [
        'Unity',
        'VR Development',
        'C#',
        'Statistical Visualization',
      ],
      role: 'Technical Lead',
      startDate: '2022',
      endDate: '2023',
      featured: true,
      impact: '85% improvement in concept retention',
    },
  ],
  social: {
    linkedin: 'https://linkedin.com/in/drpriyapatel',
    twitter: 'https://twitter.com/priyapatel_ds',
    github: 'https://github.com/priyapatel',
    website: 'https://priyapatel.edu',
  },
  testimonials: [
    {
      id: '1',
      name: 'James Chen',
      role: 'Former Student, Now Data Scientist at Google',
      content:
        "Dr. Patel's teaching transformed my understanding of machine learning. Her ability to explain complex concepts with real-world applications is unmatched.",
    },
    {
      id: '2',
      name: 'Dr. Maria Silva',
      role: 'Dean, MIT School of Engineering',
      content:
        'Priya is revolutionizing how we teach data science. Her innovative approaches and dedication to student success set the standard for modern education.',
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'AWS Certified Machine Learning',
      issuer: 'Amazon Web Services',
      date: '2021',
    },
    {
      id: '2',
      name: 'Google Cloud Professional Data Engineer',
      issuer: 'Google Cloud',
      date: '2020',
    },
  ],
};

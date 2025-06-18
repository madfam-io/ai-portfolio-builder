import type { SampleDataConfig } from './types';

export const creativeSampleData: SampleDataConfig = {
  personal: {
    name: 'Luna Rodriguez',
    title: 'Creative Director & Visual Artist',
    bio: 'Multidisciplinary creative professional blending art, design, and storytelling to create immersive brand experiences. Passionate about pushing creative boundaries and crafting narratives that resonate with audiences on an emotional level.',
    email: 'luna.rodriguez@example.com',
    phone: '+1 (555) 987-6543',
    location: 'Los Angeles, CA',
    website: 'https://lunarodriguez.art',
  },
  skills: {
    technical: [
      {
        name: 'Adobe Creative Suite',
        level: 'expert',
        category: 'Design Tools',
      },
      { name: 'Cinema 4D', level: 'advanced', category: '3D/Motion' },
      { name: 'After Effects', level: 'expert', category: '3D/Motion' },
      { name: 'Figma', level: 'advanced', category: 'Design Tools' },
      { name: 'Procreate', level: 'expert', category: 'Illustration' },
      { name: 'Photography', level: 'advanced', category: 'Visual Arts' },
    ],
    soft: [
      { name: 'Creative Direction', level: 'expert', category: 'Leadership' },
      { name: 'Brand Storytelling', level: 'expert', category: 'Creative' },
      { name: 'Art Direction', level: 'expert', category: 'Creative' },
      {
        name: 'Client Presentation',
        level: 'advanced',
        category: 'Communication',
      },
      { name: 'Team Collaboration', level: 'expert', category: 'Teamwork' },
      { name: 'Conceptual Thinking', level: 'expert', category: 'Creative' },
    ],
  },
  experience: [
    {
      id: '1',
      company: 'Stellar Creative Agency',
      position: 'Creative Director',
      startDate: '2020-03',
      current: true,
      description:
        'Leading creative vision for award-winning agency. Direct multidisciplinary teams to deliver innovative campaigns for global brands. Pioneered immersive AR/VR experiences.',
      achievements: [
        'Won 5 international design awards including Cannes Lions',
        'Increased agency revenue by 60% through creative innovation',
        'Led rebrand campaigns for 3 Fortune 500 companies',
        'Developed viral campaign reaching 50M+ impressions',
      ],
    },
    {
      id: '2',
      company: 'Moonlight Studios',
      position: 'Senior Art Director',
      startDate: '2017-06',
      endDate: '2020-02',
      current: false,
      description:
        'Crafted visual narratives for entertainment and lifestyle brands. Specialized in creating cohesive brand identities and multimedia content strategies.',
      achievements: [
        'Art directed 20+ successful brand campaigns',
        'Grew social media engagement by 300% for key clients',
        "Established studio's motion graphics department",
        'Mentored team of 10 junior designers',
      ],
    },
    {
      id: '3',
      company: 'Freelance Creative',
      position: 'Visual Artist & Designer',
      startDate: '2014-01',
      endDate: '2017-05',
      current: false,
      description:
        'Built diverse portfolio working with startups, musicians, and cultural institutions. Developed unique visual languages for emerging brands.',
      achievements: [
        'Completed 50+ client projects across industries',
        'Exhibition at Modern Art Museum LA',
        'Designed album covers for 3 Grammy-nominated artists',
        'Published in 5 international design magazines',
      ],
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Rhode Island School of Design',
      degree: 'Master of Fine Arts',
      field: 'Graphic Design',
      startDate: '2012-09',
      endDate: '2014-05',
      achievements: ['Graduate Excellence Award', 'Thesis Exhibition'],
    },
    {
      id: '2',
      institution: 'California Institute of the Arts',
      degree: 'Bachelor of Fine Arts',
      field: 'Visual Communications',
      startDate: '2008-09',
      endDate: '2012-05',
      achievements: ["Dean's List", 'Student Gallery Curator'],
    },
  ],
  projects: [
    {
      id: '1',
      title: 'Nike "Dreamscape" Campaign',
      description:
        "Created surreal visual campaign blending athletics with dream-like environments. Featured AR experiences allowing users to step into athlete's dreams.",
      technologies: [
        'AR/VR',
        'Motion Graphics',
        '3D Design',
        'Interactive Media',
      ],
      role: 'Creative Lead',
      featured: true,
      imageUrl: '/images/portfolio/nike-dreamscape.jpg',
    },
    {
      id: '2',
      title: 'Spotify "Sound of Color" Installation',
      description:
        'Interactive art installation translating music into dynamic visual experiences. Featured at Coachella and Art Basel, reaching 100K+ visitors.',
      technologies: [
        'Interactive Design',
        'Projection Mapping',
        'Sound Visualization',
      ],
      role: 'Artist & Technical Director',
      featured: true,
      imageUrl: '/images/portfolio/spotify-installation.jpg',
    },
    {
      id: '3',
      title: 'Sustainable Fashion Brand Identity',
      description:
        'Complete brand identity for eco-conscious fashion label. Created visual system emphasizing circular design principles and natural aesthetics.',
      technologies: [
        'Brand Design',
        'Sustainable Design',
        'Photography',
        'Web Design',
      ],
      role: 'Brand Designer',
      featured: true,
      imageUrl: '/images/portfolio/sustainable-fashion.jpg',
    },
  ],
  social: {
    linkedin: 'https://linkedin.com/in/lunarodriguez',
    instagram: 'https://instagram.com/luna.creates',
    behance: 'https://behance.net/lunarodriguez',
    website: 'https://lunarodriguez.art',
  },
  testimonials: [
    {
      id: '1',
      name: 'Marcus Williams',
      role: 'CMO, Nike',
      content:
        "Luna's creative vision transformed our campaign into a cultural phenomenon. Her ability to blend art with commercial objectives is exceptional.",
    },
    {
      id: '2',
      name: 'Elena Vasquez',
      role: 'Curator, Modern Art Museum LA',
      content:
        'Luna is a visionary artist who understands how to create experiences that move people. Her work consistently pushes boundaries while remaining accessible.',
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'Google UX Design Certificate',
      issuer: 'Google',
      issueDate: '2021-09',
    },
    {
      id: '2',
      name: 'Motion Design Masterclass',
      issuer: 'School of Motion',
      issueDate: '2019-03',
    },
  ],
};

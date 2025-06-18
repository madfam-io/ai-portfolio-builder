import type { SampleDataConfig } from './types';

export const businessSampleData: SampleDataConfig = {
  personal: {
    name: 'Michael Chen',
    title: 'Chief Executive Officer',
    bio: 'Visionary business leader with 15+ years of experience transforming companies through strategic innovation and operational excellence. Proven track record of driving growth, building high-performing teams, and delivering exceptional shareholder value across multiple industries.',
    email: 'michael.chen@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://michaelchen.example.com',
  },
  skills: {
    technical: [
      { name: 'Strategic Planning', level: 'expert', category: 'Leadership' },
      { name: 'Financial Management', level: 'expert', category: 'Business' },
      { name: 'M&A Integration', level: 'advanced', category: 'Business' },
      {
        name: 'Digital Transformation',
        level: 'advanced',
        category: 'Technology',
      },
      { name: 'Business Development', level: 'expert', category: 'Business' },
      { name: 'Data Analytics', level: 'intermediate', category: 'Technology' },
    ],
    soft: [
      { name: 'Executive Leadership', level: 'expert', category: 'Leadership' },
      { name: 'Public Speaking', level: 'expert', category: 'Communication' },
      { name: 'Negotiation', level: 'expert', category: 'Business' },
      { name: 'Change Management', level: 'advanced', category: 'Leadership' },
      { name: 'Board Relations', level: 'expert', category: 'Leadership' },
      { name: 'Crisis Management', level: 'advanced', category: 'Leadership' },
    ],
  },
  experience: [
    {
      id: '1',
      company: 'TechCorp Global',
      position: 'Chief Executive Officer',
      startDate: '2020-01',
      current: true,
      description:
        'Leading digital transformation of Fortune 500 technology company. Increased revenue by 45% and expanded into 12 new markets. Implemented AI-driven operations resulting in 30% efficiency gains.',
      achievements: [
        'Grew annual revenue from $2.3B to $3.5B in 3 years',
        'Led successful acquisition of 3 strategic companies',
        'Improved employee satisfaction scores by 40%',
        'Launched innovative product lines generating $500M ARR',
      ],
    },
    {
      id: '2',
      company: 'Innovation Dynamics',
      position: 'President & COO',
      startDate: '2016-03',
      endDate: '2019-12',
      current: false,
      description:
        'Transformed operations and drove strategic growth initiatives for mid-market technology firm. Streamlined processes and built scalable infrastructure supporting 300% growth.',
      achievements: [
        'Reduced operational costs by 25% while scaling business',
        'Built and led team of 500+ professionals',
        'Implemented ERP system improving efficiency by 40%',
        'Expanded international presence to 8 countries',
      ],
    },
    {
      id: '3',
      company: 'Strategic Ventures LLC',
      position: 'Senior Vice President',
      startDate: '2012-06',
      endDate: '2016-02',
      current: false,
      description:
        'Led corporate strategy and business development for private equity portfolio companies. Identified and executed growth opportunities across diverse industries.',
      achievements: [
        'Generated $250M in new business opportunities',
        'Led due diligence for 15+ acquisitions',
        'Improved portfolio company EBITDA by average of 35%',
        'Developed go-to-market strategies for 5 new products',
      ],
    },
  ],
  education: [
    {
      id: '1',
      institution: 'Harvard Business School',
      degree: 'Master of Business Administration',
      field: 'Strategy and Finance',
      startDate: '2008-09',
      endDate: '2010-05',
      achievements: ['Baker Scholar (top 5%)', 'Leadership Fellow'],
    },
    {
      id: '2',
      institution: 'Stanford University',
      degree: 'Bachelor of Science',
      field: 'Economics',
      startDate: '2002-09',
      endDate: '2006-05',
      achievements: ['Summa Cum Laude', 'Phi Beta Kappa'],
    },
  ],
  projects: [
    {
      id: '1',
      title: 'Digital Transformation Initiative',
      description:
        'Led enterprise-wide digital transformation, implementing AI and automation across all business units. Resulted in 40% productivity increase and $100M annual savings.',
      technologies: [
        'AI/ML',
        'Cloud Migration',
        'Process Automation',
        'Data Analytics',
      ],
      role: 'Executive Sponsor',
      featured: true,
    },
    {
      id: '2',
      title: 'Global Market Expansion',
      description:
        'Orchestrated expansion into Asian and European markets, establishing operations in 12 countries and generating $500M in new revenue streams.',
      technologies: [
        'Market Analysis',
        'Strategic Planning',
        'Partnership Development',
      ],
      role: 'Project Lead',
      featured: true,
    },
    {
      id: '3',
      title: 'Merger Integration Excellence',
      description:
        'Successfully integrated three acquired companies, achieving 95% talent retention and exceeding synergy targets by 50%.',
      technologies: [
        'Change Management',
        'Systems Integration',
        'Cultural Alignment',
      ],
      role: 'Integration Leader',
      featured: true,
    },
  ],
  social: {
    linkedin: 'https://linkedin.com/in/michaelchen',
    twitter: 'https://twitter.com/michaelchen',
    website: 'https://michaelchen.example.com',
  },
  testimonials: [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Board Chair, TechCorp Global',
      content:
        'Michael is an exceptional leader who combines strategic vision with operational excellence. His ability to drive transformation while maintaining team morale is unparalleled.',
    },
    {
      id: '2',
      name: 'David Park',
      role: 'Managing Partner, Summit Capital',
      content:
        'Working with Michael has been transformative for our portfolio companies. His insights and execution capabilities consistently exceed expectations.',
    },
  ],
  certifications: [
    {
      id: '1',
      name: 'Executive Leadership Program',
      issuer: 'INSEAD',
      issueDate: '2018-06',
    },
    {
      id: '2',
      name: 'Digital Strategy Certificate',
      issuer: 'MIT Sloan',
      issueDate: '2020-03',
    },
  ],
};

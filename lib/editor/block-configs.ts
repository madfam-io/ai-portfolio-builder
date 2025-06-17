import type { BlockConfig, BlockType, BlockStyles } from '@/types/editor';

const defaultStyles: BlockStyles = {
  padding: { top: 16, right: 16, bottom: 16, left: 16 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  backgroundColor: 'transparent',
  opacity: 1,
  overflow: 'visible',
};

export const blockConfigs: Record<BlockType, BlockConfig> = {
  hero: {
    type: 'hero',
    name: 'Hero Section',
    icon: 'star',
    category: 'content',
    description: 'Main banner section with title, subtitle, and call-to-action',
    defaultData: {
      title: 'Your Name',
      subtitle: 'Professional Title',
      description: 'Brief introduction about yourself',
      ctaText: 'Get In Touch',
      ctaLink: '#contact',
      backgroundImage: '',
      showAvatar: true,
      avatarUrl: '/placeholder-avatar.jpg',
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 80, right: 24, bottom: 80, left: 24 },
      backgroundColor: '#f8fafc',
    },
    properties: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'ctaText', label: 'CTA Text', type: 'text' },
      { key: 'ctaLink', label: 'CTA Link', type: 'link' },
      { key: 'backgroundImage', label: 'Background Image', type: 'image' },
      { key: 'showAvatar', label: 'Show Avatar', type: 'checkbox' },
      {
        key: 'avatarUrl',
        label: 'Avatar URL',
        type: 'image',
        conditional: { field: 'showAvatar', value: true },
      },
    ],
    maxInstances: 1,
  },

  about: {
    type: 'about',
    name: 'About Section',
    icon: 'user',
    category: 'content',
    description: 'About me section with bio and personal information',
    defaultData: {
      title: 'About Me',
      content: 'Write your professional bio here...',
      image: '/placeholder-about.jpg',
      facts: [
        { label: 'Location', value: 'Your City' },
        { label: 'Experience', value: '5+ Years' },
        { label: 'Projects', value: '50+' },
      ],
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text', required: true },
      {
        key: 'content',
        label: 'Bio Content',
        type: 'textarea',
        required: true,
      },
      { key: 'image', label: 'Profile Image', type: 'image' },
      { key: 'facts', label: 'Quick Facts', type: 'array' },
    ],
    maxInstances: 1,
  },

  skills: {
    type: 'skills',
    name: 'Skills Section',
    icon: 'zap',
    category: 'content',
    description: 'Showcase your technical and soft skills',
    defaultData: {
      title: 'Skills & Expertise',
      skillCategories: [
        {
          name: 'Frontend',
          skills: [
            { name: 'React', level: 90 },
            { name: 'TypeScript', level: 85 },
            { name: 'CSS/SCSS', level: 80 },
          ],
        },
        {
          name: 'Backend',
          skills: [
            { name: 'Node.js', level: 85 },
            { name: 'Python', level: 75 },
            { name: 'PostgreSQL', level: 70 },
          ],
        },
      ],
      displayType: 'bars', // bars, circles, tags
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text', required: true },
      {
        key: 'skillCategories',
        label: 'Skill Categories',
        type: 'array',
        required: true,
      },
      {
        key: 'displayType',
        label: 'Display Type',
        type: 'select',
        options: [
          { label: 'Progress Bars', value: 'bars' },
          { label: 'Circular Progress', value: 'circles' },
          { label: 'Tags', value: 'tags' },
        ],
      },
    ],
  },

  projects: {
    type: 'projects',
    name: 'Projects Section',
    icon: 'folder',
    category: 'content',
    description: 'Portfolio projects with images and descriptions',
    defaultData: {
      title: 'Featured Projects',
      projects: [
        {
          id: 1,
          title: 'Project Name',
          description: 'Brief project description...',
          image: '/placeholder-project.jpg',
          technologies: ['React', 'Node.js', 'PostgreSQL'],
          liveUrl: 'https://example.com',
          githubUrl: 'https://github.com/username/project',
          featured: true,
        },
      ],
      layout: 'grid', // grid, masonry, carousel
      columns: 3,
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text', required: true },
      { key: 'projects', label: 'Projects', type: 'array', required: true },
      {
        key: 'layout',
        label: 'Layout Type',
        type: 'select',
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'Masonry', value: 'masonry' },
          { label: 'Carousel', value: 'carousel' },
        ],
      },
      {
        key: 'columns',
        label: 'Columns',
        type: 'number',
        validation: { min: 1, max: 4 },
        conditional: { field: 'layout', value: 'grid' },
      },
    ],
  },

  experience: {
    type: 'experience',
    name: 'Experience Section',
    icon: 'briefcase',
    category: 'content',
    description: 'Professional work experience timeline',
    defaultData: {
      title: 'Work Experience',
      experiences: [
        {
          id: 1,
          position: 'Senior Developer',
          company: 'Company Name',
          location: 'City, Country',
          startDate: '2020-01',
          endDate: null, // null means current
          description: 'Key responsibilities and achievements...',
          technologies: ['React', 'Node.js'],
          companyUrl: 'https://company.com',
        },
      ],
      displayType: 'timeline', // timeline, cards, simple
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text', required: true },
      {
        key: 'experiences',
        label: 'Work Experience',
        type: 'array',
        required: true,
      },
      {
        key: 'displayType',
        label: 'Display Type',
        type: 'select',
        options: [
          { label: 'Timeline', value: 'timeline' },
          { label: 'Cards', value: 'cards' },
          { label: 'Simple List', value: 'simple' },
        ],
      },
    ],
  },

  education: {
    type: 'education',
    name: 'Education Section',
    icon: 'graduation-cap',
    category: 'content',
    description: 'Educational background and certifications',
    defaultData: {
      title: 'Education & Certifications',
      items: [
        {
          id: 1,
          type: 'degree', // degree, certification, course
          title: 'Bachelor of Computer Science',
          institution: 'University Name',
          location: 'City, Country',
          startDate: '2016',
          endDate: '2020',
          description: 'Relevant coursework and achievements...',
          gpa: '3.8/4.0',
        },
      ],
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text', required: true },
      { key: 'items', label: 'Education Items', type: 'array', required: true },
    ],
  },

  contact: {
    type: 'contact',
    name: 'Contact Section',
    icon: 'mail',
    category: 'content',
    description: 'Contact information and form',
    defaultData: {
      title: 'Get In Touch',
      subtitle: "Let's work together",
      showForm: true,
      contactInfo: [
        {
          type: 'email',
          label: 'Email',
          value: 'your@email.com',
          icon: 'mail',
        },
        {
          type: 'phone',
          label: 'Phone',
          value: '+1 (555) 123-4567',
          icon: 'phone',
        },
        {
          type: 'location',
          label: 'Location',
          value: 'Your City, Country',
          icon: 'map-pin',
        },
      ],
      formFields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'subject', label: 'Subject', type: 'text', required: false },
        { name: 'message', label: 'Message', type: 'textarea', required: true },
      ],
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'showForm', label: 'Show Contact Form', type: 'checkbox' },
      { key: 'contactInfo', label: 'Contact Information', type: 'array' },
      {
        key: 'formFields',
        label: 'Form Fields',
        type: 'array',
        conditional: { field: 'showForm', value: true },
      },
    ],
    maxInstances: 1,
  },

  testimonials: {
    type: 'testimonials',
    name: 'Testimonials',
    icon: 'quote',
    category: 'content',
    description: 'Client testimonials and reviews',
    defaultData: {
      title: 'What Clients Say',
      testimonials: [
        {
          id: 1,
          content: 'Outstanding work and professional attitude...',
          author: 'Client Name',
          position: 'CEO, Company',
          avatar: '/placeholder-avatar.jpg',
          rating: 5,
        },
      ],
      displayType: 'carousel', // carousel, grid, masonry
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text', required: true },
      {
        key: 'testimonials',
        label: 'Testimonials',
        type: 'array',
        required: true,
      },
      {
        key: 'displayType',
        label: 'Display Type',
        type: 'select',
        options: [
          { label: 'Carousel', value: 'carousel' },
          { label: 'Grid', value: 'grid' },
          { label: 'Masonry', value: 'masonry' },
        ],
      },
    ],
  },

  gallery: {
    type: 'gallery',
    name: 'Image Gallery',
    icon: 'image',
    category: 'media',
    description: 'Photo gallery with lightbox',
    defaultData: {
      title: 'Gallery',
      images: [
        {
          id: 1,
          url: '/placeholder-gallery-1.jpg',
          alt: 'Gallery image 1',
          caption: 'Image caption',
        },
      ],
      layout: 'masonry', // grid, masonry, carousel
      columns: 3,
      showCaptions: true,
      enableLightbox: true,
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'images', label: 'Images', type: 'array', required: true },
      {
        key: 'layout',
        label: 'Layout Type',
        type: 'select',
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'Masonry', value: 'masonry' },
          { label: 'Carousel', value: 'carousel' },
        ],
      },
      {
        key: 'columns',
        label: 'Columns',
        type: 'number',
        validation: { min: 1, max: 6 },
      },
      { key: 'showCaptions', label: 'Show Captions', type: 'checkbox' },
      { key: 'enableLightbox', label: 'Enable Lightbox', type: 'checkbox' },
    ],
  },

  text: {
    type: 'text',
    name: 'Text Block',
    icon: 'type',
    category: 'content',
    description: 'Rich text content block',
    defaultData: {
      content: '<p>Add your text content here...</p>',
      alignment: 'left',
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
    },
    properties: [
      { key: 'content', label: 'Content', type: 'textarea', required: true },
      {
        key: 'alignment',
        label: 'Text Alignment',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
          { label: 'Justify', value: 'justify' },
        ],
      },
    ],
  },

  image: {
    type: 'image',
    name: 'Image Block',
    icon: 'image',
    category: 'media',
    description: 'Single image with caption',
    defaultData: {
      url: '/placeholder-image.jpg',
      alt: 'Image description',
      caption: '',
      alignment: 'center',
      width: '100%',
      height: 'auto',
      link: '',
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
    },
    properties: [
      { key: 'url', label: 'Image URL', type: 'image', required: true },
      { key: 'alt', label: 'Alt Text', type: 'text', required: true },
      { key: 'caption', label: 'Caption', type: 'text' },
      { key: 'link', label: 'Link URL', type: 'link' },
      {
        key: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
      { key: 'width', label: 'Width', type: 'text' },
      { key: 'height', label: 'Height', type: 'text' },
    ],
  },

  video: {
    type: 'video',
    name: 'Video Block',
    icon: 'video',
    category: 'media',
    description: 'Embedded video player',
    defaultData: {
      url: '',
      title: 'Video Title',
      autoplay: false,
      controls: true,
      muted: false,
      loop: false,
      poster: '',
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
    },
    properties: [
      { key: 'url', label: 'Video URL', type: 'text', required: true },
      { key: 'title', label: 'Video Title', type: 'text' },
      { key: 'poster', label: 'Poster Image', type: 'image' },
      { key: 'autoplay', label: 'Autoplay', type: 'checkbox' },
      { key: 'controls', label: 'Show Controls', type: 'checkbox' },
      { key: 'muted', label: 'Muted', type: 'checkbox' },
      { key: 'loop', label: 'Loop', type: 'checkbox' },
    ],
  },

  divider: {
    type: 'divider',
    name: 'Divider',
    icon: 'minus',
    category: 'layout',
    description: 'Horizontal divider line',
    defaultData: {
      style: 'solid',
      width: '100%',
      thickness: 1,
      color: '#e5e7eb',
      alignment: 'center',
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 16, right: 24, bottom: 16, left: 24 },
    },
    properties: [
      {
        key: 'style',
        label: 'Line Style',
        type: 'select',
        options: [
          { label: 'Solid', value: 'solid' },
          { label: 'Dashed', value: 'dashed' },
          { label: 'Dotted', value: 'dotted' },
        ],
      },
      { key: 'width', label: 'Width', type: 'text' },
      {
        key: 'thickness',
        label: 'Thickness (px)',
        type: 'number',
        validation: { min: 1, max: 10 },
      },
      { key: 'color', label: 'Color', type: 'color' },
      {
        key: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
  },

  spacer: {
    type: 'spacer',
    name: 'Spacer',
    icon: 'move-vertical',
    category: 'layout',
    description: 'Empty space for layout control',
    defaultData: {
      height: 40,
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
    },
    properties: [
      {
        key: 'height',
        label: 'Height (px)',
        type: 'number',
        required: true,
        validation: { min: 1, max: 500 },
      },
    ],
  },

  'social-links': {
    type: 'social-links',
    name: 'Social Links',
    icon: 'share-2',
    category: 'interactive',
    description: 'Social media links and icons',
    defaultData: {
      title: 'Follow Me',
      links: [
        {
          platform: 'linkedin',
          url: 'https://linkedin.com/in/username',
          label: 'LinkedIn',
        },
        {
          platform: 'github',
          url: 'https://github.com/username',
          label: 'GitHub',
        },
        {
          platform: 'twitter',
          url: 'https://twitter.com/username',
          label: 'Twitter',
        },
      ],
      style: 'icons', // icons, buttons, text
      size: 'medium',
      alignment: 'center',
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 24, right: 24, bottom: 24, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'links', label: 'Social Links', type: 'array', required: true },
      {
        key: 'style',
        label: 'Display Style',
        type: 'select',
        options: [
          { label: 'Icons Only', value: 'icons' },
          { label: 'Buttons', value: 'buttons' },
          { label: 'Text Links', value: 'text' },
        ],
      },
      {
        key: 'size',
        label: 'Size',
        type: 'select',
        options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
        ],
      },
      {
        key: 'alignment',
        label: 'Alignment',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
  },

  'call-to-action': {
    type: 'call-to-action',
    name: 'Call to Action',
    icon: 'external-link',
    category: 'interactive',
    description: 'Call-to-action button or banner',
    defaultData: {
      title: 'Ready to work together?',
      subtitle: "Let's create something amazing",
      buttonText: 'Get Started',
      buttonUrl: '#contact',
      buttonStyle: 'primary',
      backgroundType: 'color', // color, gradient, image
      backgroundColor: '#3b82f6',
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'buttonText', label: 'Button Text', type: 'text', required: true },
      { key: 'buttonUrl', label: 'Button URL', type: 'link', required: true },
      {
        key: 'buttonStyle',
        label: 'Button Style',
        type: 'select',
        options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
        ],
      },
      {
        key: 'backgroundType',
        label: 'Background Type',
        type: 'select',
        options: [
          { label: 'Solid Color', value: 'color' },
          { label: 'Gradient', value: 'gradient' },
          { label: 'Image', value: 'image' },
        ],
      },
      {
        key: 'backgroundColor',
        label: 'Background Color',
        type: 'color',
        conditional: { field: 'backgroundType', value: 'color' },
      },
    ],
  },

  stats: {
    type: 'stats',
    name: 'Statistics',
    icon: 'bar-chart',
    category: 'content',
    description: 'Key statistics and metrics',
    defaultData: {
      title: 'By the Numbers',
      stats: [
        { label: 'Projects Completed', value: '50+', icon: 'folder' },
        { label: 'Happy Clients', value: '25+', icon: 'smile' },
        { label: 'Years Experience', value: '5+', icon: 'calendar' },
        { label: 'Awards Won', value: '3', icon: 'award' },
      ],
      layout: 'grid', // grid, horizontal, vertical
      columns: 4,
      animated: true,
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text' },
      { key: 'stats', label: 'Statistics', type: 'array', required: true },
      {
        key: 'layout',
        label: 'Layout',
        type: 'select',
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Vertical', value: 'vertical' },
        ],
      },
      {
        key: 'columns',
        label: 'Columns',
        type: 'number',
        validation: { min: 1, max: 6 },
        conditional: { field: 'layout', value: 'grid' },
      },
      { key: 'animated', label: 'Animated Counters', type: 'checkbox' },
    ],
  },

  timeline: {
    type: 'timeline',
    name: 'Timeline',
    icon: 'clock',
    category: 'content',
    description: 'Chronological timeline of events',
    defaultData: {
      title: 'My Journey',
      events: [
        {
          id: 1,
          date: '2020',
          title: 'Started Freelancing',
          description: 'Began my journey as a freelance developer...',
          icon: 'star',
        },
      ],
      orientation: 'vertical', // vertical, horizontal
      alternating: true,
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text' },
      {
        key: 'events',
        label: 'Timeline Events',
        type: 'array',
        required: true,
      },
      {
        key: 'orientation',
        label: 'Orientation',
        type: 'select',
        options: [
          { label: 'Vertical', value: 'vertical' },
          { label: 'Horizontal', value: 'horizontal' },
        ],
      },
      {
        key: 'alternating',
        label: 'Alternating Layout',
        type: 'checkbox',
        conditional: { field: 'orientation', value: 'vertical' },
      },
    ],
  },

  pricing: {
    type: 'pricing',
    name: 'Pricing Table',
    icon: 'credit-card',
    category: 'interactive',
    description: 'Service pricing and packages',
    defaultData: {
      title: 'Pricing Plans',
      subtitle: 'Choose the plan that fits your needs',
      plans: [
        {
          id: 1,
          name: 'Basic',
          price: '$99',
          period: 'per project',
          description: 'Perfect for small projects',
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          featured: false,
          ctaText: 'Get Started',
          ctaUrl: '#contact',
        },
      ],
      layout: 'grid',
      columns: 3,
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'plans', label: 'Pricing Plans', type: 'array', required: true },
      {
        key: 'layout',
        label: 'Layout',
        type: 'select',
        options: [
          { label: 'Grid', value: 'grid' },
          { label: 'Horizontal', value: 'horizontal' },
        ],
      },
      {
        key: 'columns',
        label: 'Columns',
        type: 'number',
        validation: { min: 1, max: 4 },
        conditional: { field: 'layout', value: 'grid' },
      },
    ],
  },

  faq: {
    type: 'faq',
    name: 'FAQ Section',
    icon: 'help-circle',
    category: 'content',
    description: 'Frequently asked questions',
    defaultData: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know',
      questions: [
        {
          id: 1,
          question: 'What services do you offer?',
          answer: 'I offer web development, design, and consulting services...',
        },
      ],
      layout: 'accordion', // accordion, tabs, simple
      allowMultiple: false,
    },
    defaultStyles: {
      ...defaultStyles,
      padding: { top: 60, right: 24, bottom: 60, left: 24 },
    },
    properties: [
      { key: 'title', label: 'Section Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'questions', label: 'FAQ Items', type: 'array', required: true },
      {
        key: 'layout',
        label: 'Layout Style',
        type: 'select',
        options: [
          { label: 'Accordion', value: 'accordion' },
          { label: 'Tabs', value: 'tabs' },
          { label: 'Simple List', value: 'simple' },
        ],
      },
      {
        key: 'allowMultiple',
        label: 'Allow Multiple Open',
        type: 'checkbox',
        conditional: { field: 'layout', value: 'accordion' },
      },
    ],
  },
};

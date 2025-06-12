/**
 * @fileoverview Portfolio Seed Data
 * @module data/seeds/portfolios
 * 
 * Generates realistic portfolio data for all user types and templates.
 * Creates comprehensive portfolio content including experience, projects, and skills.
 */

import { logger } from '@/lib/utils/logger';
import { getSeedConfig } from './index';
import { getUserTemplates } from './users';
import type { SeedingOptions } from '@/lib/database/seeder';

/**
 * Portfolio templates with comprehensive data
 */
const PORTFOLIO_TEMPLATES = [
  {
    name: 'Juan Pérez',
    title: 'Desarrollador Full Stack',
    bio: 'Desarrollador apasionado con más de 5 años de experiencia creando aplicaciones web modernas. Especializado en React, Node.js y tecnologías en la nube. Me encanta resolver problemas complejos y crear soluciones escalables.',
    tagline: 'Construyendo el futuro, una línea de código a la vez',
    template: 'developer',
    contact: {
      email: 'juan.perez@ejemplo.com',
      phone: '+52 55 1234 5678',
      location: 'Ciudad de México, México',
      website: 'https://juanperez.dev',
    },
    social: {
      linkedin: 'https://linkedin.com/in/juanperez',
      github: 'https://github.com/juanperez',
      twitter: 'https://twitter.com/juanperezdev',
    },
    experience: [
      {
        company: 'TechMX Solutions',
        position: 'Senior Full Stack Developer',
        startDate: '2022-01',
        current: true,
        description: 'Liderando el desarrollo de aplicaciones web modernas usando React y Node.js',
        highlights: [
          'Lideré un equipo de 4 desarrolladores',
          'Mejoré el rendimiento de las aplicaciones en un 40%',
          'Implementé pipelines de CI/CD',
        ],
        technologies: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
      },
      {
        company: 'StartupMX',
        position: 'Frontend Developer',
        startDate: '2019-03',
        endDate: '2021-12',
        current: false,
        description: 'Desarrollé interfaces de usuario responsivas y aplicaciones móviles',
        highlights: [
          'Construí desde cero un portal de clientes',
          'Reduje el tiempo de carga en un 60%',
          'Implementé diseño responsive',
        ],
        technologies: ['React', 'Redux', 'SASS', 'React Native'],
      },
    ],
    education: [
      {
        institution: 'Instituto Tecnológico de México',
        degree: 'Licenciatura',
        field: 'Ingeniería en Sistemas Computacionales',
        startDate: '2015-08',
        endDate: '2019-06',
        current: false,
        achievements: ['Mención Honorífica', 'Lista de Honor'],
      },
    ],
    projects: [
      {
        title: 'Plataforma de E-commerce',
        description: 'Plataforma completa de comercio electrónico construida con React y Node.js',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'AWS'],
        highlights: [
          'Soporta múltiples métodos de pago',
          'Gestión de inventario en tiempo real',
          'Diseño responsive para móviles',
        ],
        featured: true,
        order: 1,
        projectUrl: 'https://ecommerce-ejemplo.com',
        githubUrl: 'https://github.com/juanperez/ecommerce',
      },
      {
        title: 'App de Gestión de Tareas',
        description: 'Aplicación colaborativa de gestión de tareas con actualizaciones en tiempo real',
        technologies: ['Vue.js', 'Firebase', 'Tailwind CSS'],
        highlights: [
          'Colaboración en tiempo real',
          'Interfaz de arrastrar y soltar',
          'App móvil disponible',
        ],
        featured: false,
        order: 2,
        githubUrl: 'https://github.com/juanperez/task-manager',
      },
    ],
    skills: [
      { name: 'JavaScript', category: 'language', level: 'expert' },
      { name: 'TypeScript', category: 'language', level: 'advanced' },
      { name: 'React', category: 'framework', level: 'expert' },
      { name: 'Node.js', category: 'framework', level: 'advanced' },
      { name: 'AWS', category: 'tool', level: 'intermediate' },
      { name: 'PostgreSQL', category: 'database', level: 'advanced' },
    ],
    certifications: [
      {
        name: 'AWS Certified Developer',
        issuer: 'Amazon Web Services',
        date: '2023-06',
        credentialId: 'AWS-123456',
      },
    ],
  },
  {
    name: 'Ana García',
    title: 'Diseñadora UX/UI',
    bio: 'Diseñadora creativa con una pasión por crear experiencias de usuario hermosas y funcionales. 7+ años de experiencia en diseño de productos digitales. Me especializo en investigación de usuarios y diseño centrado en el usuario.',
    tagline: 'Diseñando experiencias que deleitan a los usuarios',
    template: 'designer',
    contact: {
      email: 'ana.garcia@ejemplo.com',
      phone: '+52 33 9876 5432',
      location: 'Guadalajara, México',
      website: 'https://anagarcia.design',
    },
    social: {
      linkedin: 'https://linkedin.com/in/anagarcia',
      dribbble: 'https://dribbble.com/anagarcia',
      behance: 'https://behance.net/anagarcia',
    },
    experience: [
      {
        company: 'Design Studio MX',
        position: 'Senior Product Designer',
        startDate: '2021-03',
        current: true,
        description: 'Liderando el diseño de productos para múltiples proyectos de clientes',
        highlights: [
          'Diseñé UI para 10+ aplicaciones móviles',
          'Establecí sistema de diseño',
          'Mentoré diseñadores junior',
        ],
        technologies: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Principle'],
      },
    ],
    education: [
      {
        institution: 'Instituto de Arte y Diseño',
        degree: 'Licenciatura',
        field: 'Diseño Gráfico',
        startDate: '2013-08',
        endDate: '2017-06',
        current: false,
        achievements: ['Cum Laude', 'Mejor Proyecto de Tesis'],
      },
    ],
    projects: [
      {
        title: 'Rediseño de App Bancaria',
        description: 'Rediseño completo de una aplicación bancaria móvil',
        technologies: ['Figma', 'Principle', 'Adobe XD', 'InVision'],
        highlights: [
          'Aumentó el engagement de usuarios en 45%',
          'Redujo tickets de soporte en 30%',
          'Mejoró la accesibilidad',
        ],
        featured: true,
        order: 1,
        projectUrl: 'https://behance.net/gallery/banking-app',
      },
    ],
    skills: [
      { name: 'UI Design', category: 'design', level: 'expert' },
      { name: 'UX Research', category: 'design', level: 'advanced' },
      { name: 'Figma', category: 'tool', level: 'expert' },
      { name: 'Adobe Creative Suite', category: 'tool', level: 'advanced' },
    ],
    certifications: [
      {
        name: 'Google UX Design Certificate',
        issuer: 'Google',
        date: '2022-08',
        credentialId: 'GOOGLE-UX-789',
      },
    ],
  },
];

/**
 * Generate portfolio data for a user
 */
function generatePortfolio(userId: string, index: number, template?: any): any {
  const templates = ['developer', 'designer', 'consultant'];
  const selectedTemplate = template?.template || templates[index % templates.length];
  
  const baseData = template || {
    name: `Usuario ${index + 1}`,
    title: 'Profesional',
    bio: 'Profesional experimentado buscando nuevas oportunidades.',
    template: selectedTemplate,
  };

  const subdomain = `${baseData.name.toLowerCase().replace(/\s+/g, '')}-${index}`;
  
  return {
    id: `portfolio-${userId}-${index}`,
    user_id: userId,
    name: baseData.name,
    title: baseData.title,
    bio: baseData.bio,
    tagline: baseData.tagline || 'Mi tagline profesional',
    avatar_url: `https://i.pravatar.cc/300?u=${userId}-${index}`,
    contact: JSON.stringify(baseData.contact || {
      email: `${baseData.name.toLowerCase().replace(/\s+/g, '.')}@ejemplo.com`,
      location: 'México',
    }),
    social: JSON.stringify(baseData.social || {}),
    experience: JSON.stringify(baseData.experience || []),
    education: JSON.stringify(baseData.education || []),
    projects: JSON.stringify(baseData.projects || []),
    skills: JSON.stringify(baseData.skills || []),
    certifications: JSON.stringify(baseData.certifications || []),
    template: selectedTemplate,
    customization: JSON.stringify({
      primaryColor: ['#6366f1', '#ec4899', '#10b981'][index % 3],
      fontFamily: ['Inter', 'Poppins', 'Roboto'][index % 3],
    }),
    ai_settings: JSON.stringify({
      enhanceBio: true,
      enhanceProjectDescriptions: true,
      generateSkillsFromExperience: false,
      tone: 'professional',
      targetLength: 'detailed',
    }),
    status: index === 0 ? 'published' : (index % 3 === 0 ? 'published' : 'draft'),
    subdomain: subdomain.substring(0, 20), // Ensure subdomain length limit
    meta_title: `${baseData.name} - ${baseData.title}`,
    meta_description: baseData.bio?.substring(0, 160) || 'Portfolio profesional',
    views: Math.floor(Math.random() * 500),
    last_viewed_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    published_at: index === 0 || index % 3 === 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
    created_at: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
  };
}

/**
 * Seed portfolios table with realistic data
 */
export async function seedPortfolios(client: any, options: SeedingOptions): Promise<number> {
  const config = getSeedConfig(options.mode);
  const { portfoliosPerUser } = config;

  logger.info(`Seeding portfolios (${portfoliosPerUser} per user)...`);

  try {
    // Get all users to create portfolios for
    const { data: users, error: usersError } = await client
      .from('users')
      .select('id');

    if (usersError || !users) {
      throw new Error(`Failed to fetch users: ${usersError?.message}`);
    }

    if (users.length === 0) {
      logger.warn('No users found, skipping portfolio seeding');
      return 0;
    }

    // Check for existing portfolios
    const { count: existingCount } = await client
      .from('portfolios')
      .select('*', { count: 'exact', head: true });

    if (existingCount > 0 && options.skipExisting) {
      logger.info(`Portfolios table already has ${existingCount} records, skipping`);
      return existingCount;
    }

    // Generate portfolios
    const portfolios = [];
    const userTemplates = getUserTemplates();

    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const user = users[userIndex];
      
      for (let portfolioIndex = 0; portfolioIndex < portfoliosPerUser; portfolioIndex++) {
        // Use template for first portfolio of template users
        const template = userIndex < PORTFOLIO_TEMPLATES.length && portfolioIndex === 0 
          ? PORTFOLIO_TEMPLATES[userIndex] 
          : undefined;

        const portfolio = generatePortfolio(user.id, portfolioIndex, template);
        portfolios.push(portfolio);
      }
    }

    // Insert portfolios in batches
    const batchSize = options.batchSize || 10;
    let insertedCount = 0;

    for (let i = 0; i < portfolios.length; i += batchSize) {
      const batch = portfolios.slice(i, i + batchSize);
      
      const { data, error } = await client
        .from('portfolios')
        .insert(batch)
        .select('id');

      if (error) {
        logger.error(`Error inserting portfolio batch ${i / batchSize + 1}:`, error);
        throw error;
      }

      insertedCount += data?.length || 0;
    }

    // Update user portfolio counts
    await updateUserPortfolioCounts(client, users);

    logger.info(`Successfully seeded ${insertedCount} portfolios`);
    return insertedCount;

  } catch (error) {
    logger.error('Error seeding portfolios:', error instanceof Error ? error : new Error(String(error)));
    throw error;
  }
}

/**
 * Update user portfolio counts after seeding
 */
async function updateUserPortfolioCounts(client: any, users: any[]): Promise<void> {
  try {
    for (const user of users) {
      const { count } = await client
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      await client
        .from('users')
        .update({ portfolio_count: count })
        .eq('id', user.id);
    }

    logger.info('Updated user portfolio counts');
  } catch (error) {
    logger.error('Error updating user portfolio counts:', error instanceof Error ? error : new Error(String(error)));
    // Don't throw, this is not critical
  }
}
import { Portfolio } from '@/types/portfolio';

/**
 * Consultant Portfolio Template
 * Professional, business-focused design for consultants and advisors
 */

export function renderConsultantTemplate(portfolio: Portfolio): string {
  const {
    name,
    title,
    bio,
    tagline,
    avatarUrl,
    contact,
    social,
    experience,
    projects,
    skills,
  } = portfolio;

  const testimonials: any[] = []; // Portfolio type doesn't have testimonials yet

  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-4 py-4">
          <nav class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-900">${name}</h1>
            <div class="flex gap-6">
              <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
              <a href="#experience" class="text-gray-600 hover:text-gray-900">Experience</a>
              <a href="#projects" class="text-gray-600 hover:text-gray-900">Case Studies</a>
              <a href="#testimonials" class="text-gray-600 hover:text-gray-900">Testimonials</a>
              <a href="#contact" class="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </nav>
        </div>
      </header>

      <!-- Hero Section -->
      <section id="about" class="py-20 bg-gradient-to-br from-emerald-50 to-cyan-50">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center">
            ${
              avatarUrl
                ? `
              <img 
                src="${avatarUrl}" 
                alt="${name}" 
                class="w-32 h-32 rounded-full object-cover shadow-lg mx-auto mb-6"
              />
            `
                : ''
            }
            <h1 class="text-4xl font-bold text-gray-900 mb-2">${name}</h1>
            <h2 class="text-2xl text-emerald-600 mb-4">${title}</h2>
            ${tagline ? `<p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">${tagline}</p>` : ''}
            <div class="prose max-w-3xl mx-auto">
              <p class="text-gray-700 leading-relaxed">${bio}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Experience Section -->
      ${
        experience && experience.length > 0
          ? `
        <section id="experience" class="py-16 bg-white">
          <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Professional Experience</h2>
            <div class="space-y-8">
              ${experience
                .map(
                  exp => `
                <div class="border-l-4 border-emerald-500 pl-6">
                  <h3 class="text-xl font-semibold text-gray-900">${exp.position}</h3>
                  <p class="text-lg text-gray-600">${exp.company}</p>
                  <p class="text-sm text-gray-500 mb-2">${exp.startDate} - ${exp.endDate || 'Present'}</p>
                  <p class="text-gray-700">${exp.description}</p>
                  ${
                    exp.highlights && exp.highlights.length > 0
                      ? `
                    <ul class="mt-3 space-y-1">
                      ${exp.highlights
                        .map(
                          highlight => `
                        <li class="text-gray-600 flex items-start">
                          <span class="text-emerald-500 mr-2">•</span>
                          ${highlight}
                        </li>
                      `
                        )
                        .join('&apos;)}
                    </ul>
                  `
                      : ''
                  }
                </div>
              `
                )
                .join('&apos;)}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- Projects/Case Studies Section -->
      ${
        projects && projects.length > 0
          ? `
        <section id="projects" class="py-16 bg-gray-50">
          <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Case Studies</h2>
            <div class="grid md:grid-cols-2 gap-8">
              ${projects
                .map(
                  project => `
                <div class="bg-white rounded-lg shadow-md overflow-hidden">
                  ${
                    project.imageUrl
                      ? `
                    <img src="${project.imageUrl}" alt="${project.title}" class="w-full h-48 object-cover" />
                  `
                      : ''
                  }
                  <div class="p-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">${project.title}</h3>
                    <p class="text-gray-700 mb-4">${project.description}</p>
                    ${
                      project.technologies && project.technologies.length > 0
                        ? `
                      <div class="flex flex-wrap gap-2 mb-4">
                        ${project.technologies
                          .map(
                            tech => `
                          <span class="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm rounded-full">${tech}</span>
                        `
                          )
                          .join('&apos;)}
                      </div>
                    `
                        : ''
                    }
                    <div class="flex gap-4">
                      ${project.liveUrl ? `<a href="${project.liveUrl}" class="text-emerald-600 hover:text-emerald-700 font-medium">View Live →</a>` : ''}
                      ${project.githubUrl ? `<a href="${project.githubUrl}" class="text-emerald-600 hover:text-emerald-700 font-medium">GitHub →</a>` : ''}
                    </div>
                  </div>
                </div>
              `
                )
                .join('&apos;)}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- Testimonials Section -->
      ${
        testimonials && testimonials.length > 0
          ? `
        <section id="testimonials" class="py-16 bg-white">
          <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Client Testimonials</h2>
            <div class="grid md:grid-cols-2 gap-8">
              ${testimonials
                .map(
                  testimonial => `
                <div class="bg-gray-50 rounded-lg p-6">
                  <blockquote class="text-gray-700 italic mb-4">"${testimonial.text}"</blockquote>
                  <div class="flex items-center">
                    ${
                      testimonial.avatarUrl
                        ? `
                      <img src="${testimonial.avatarUrl}" alt="${testimonial.name}" class="w-10 h-10 rounded-full mr-3" />
                    `
                        : ''
                    }
                    <div>
                      <p class="font-semibold text-gray-900">${testimonial.name}</p>
                      <p class="text-sm text-gray-600">${testimonial.title}</p>
                    </div>
                  </div>
                </div>
              `
                )
                .join('&apos;)}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- Skills Section -->
      ${
        skills && skills.length > 0
          ? `
        <section id="skills" class="py-16 bg-gray-50">
          <div class="max-w-6xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-gray-900 mb-8 text-center">Core Competencies</h2>
            <div class="grid md:grid-cols-3 gap-6">
              ${skills
                .map(
                  skill => `
                <div class="bg-white rounded-lg p-6 text-center">
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">${skill.name}</h3>
                  ${
                    skill.level
                      ? `
                    <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div class="bg-emerald-500 h-2 rounded-full" style="width: ${skill.level}%"></div>
                    </div>
                  `
                      : ''
                  }
                </div>
              `
                )
                .join('&apos;)}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- Contact Section -->
      <section id="contact" class="py-16 bg-emerald-600 text-white">
        <div class="max-w-6xl mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-8">Let's Work Together</h2>
          <div class="flex flex-col items-center gap-4">
            ${
              contact.email
                ? `
              <a href="mailto:${contact.email}" class="text-xl hover:underline">${contact.email}</a>
            `
                : ''
            }
            ${
              contact.phone
                ? `
              <a href="tel:${contact.phone}" class="text-xl hover:underline">${contact.phone}</a>
            `
                : ''
            }
            ${
              contact.location
                ? `
              <p class="text-lg">${contact.location}</p>
            `
                : ''
            }
          </div>
          ${
            social && Object.keys(social).length > 0
              ? `
            <div class="flex justify-center gap-6 mt-8">
              ${
                social.linkedin
                  ? `
                <a href="${social.linkedin}" class="text-white hover:text-emerald-200">LinkedIn</a>
              `
                  : ''
              }
              ${
                social.twitter
                  ? `
                <a href="${social.twitter}" class="text-white hover:text-emerald-200">Twitter</a>
              `
                  : ''
              }
              ${
                social.github
                  ? `
                <a href="${social.github}" class="text-white hover:text-emerald-200">GitHub</a>
              `
                  : ''
              }
            </div>
          `
              : ''
          }
        </div>
      </section>
    </div>
  `;
}

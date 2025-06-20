import { Portfolio, Skill } from '@/types/portfolio';

/**
 * Developer Portfolio Template
 * Clean, code-focused design for software developers
 */

export function renderDeveloperTemplate(portfolio: Portfolio): string {
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

  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-5xl mx-auto px-4 py-4">
          <nav class="flex items-center justify-between">
            <h1 class="text-xl font-bold text-gray-900">${name}</h1>
            <div class="flex gap-6">
              <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
              <a href="#experience" class="text-gray-600 hover:text-gray-900">Experience</a>
              <a href="#projects" class="text-gray-600 hover:text-gray-900">Projects</a>
              <a href="#skills" class="text-gray-600 hover:text-gray-900">Skills</a>
              <a href="#contact" class="text-gray-600 hover:text-gray-900">Contact</a>
            </div>
          </nav>
        </div>
      </header>

      <!-- Hero Section -->
      <section id="about" class="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div class="max-w-5xl mx-auto px-4">
          <div class="flex items-center gap-12">
            ${
              avatarUrl
                ? `
              <img 
                src="${avatarUrl}" 
                alt="${name}" 
                class="w-32 h-32 rounded-full object-cover shadow-lg"
              />
            `
                : ''
            }
            <div class="flex-1">
              <h2 class="text-4xl font-bold text-gray-900 mb-2">${name}</h2>
              <p class="text-xl text-gray-700 mb-4">${title || ''}</p>
              ${tagline ? `<p class="text-lg text-gray-600 italic">"${tagline}"</p>` : ''}
              ${bio ? `<p class="mt-4 text-gray-700 leading-relaxed">${bio}</p>` : ''}
              
              <!-- Social Links -->
              ${
                social
                  ? `
                <div class="flex gap-4 mt-6">
                  ${
                    social.github
                      ? `
                    <a href="${social.github}" target="_blank" class="text-gray-600 hover:text-gray-900">
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    </a>
                  `
                      : ''
                  }
                  ${
                    social.linkedin
                      ? `
                    <a href="${social.linkedin}" target="_blank" class="text-gray-600 hover:text-gray-900">
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  `
                      : ''
                  }
                  ${
                    social.twitter
                      ? `
                    <a href="${social.twitter}" target="_blank" class="text-gray-600 hover:text-gray-900">
                      <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                      </svg>
                    </a>
                  `
                      : ''
                  }
                </div>
              `
                  : ''
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Experience Section -->
      ${
        experience && experience.length > 0
          ? `
        <section id="experience" class="py-16 bg-white">
          <div class="max-w-5xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Experience</h2>
            <div class="space-y-8">
              ${experience
                .map(
                  exp => `
                <div class="border-l-2 border-blue-500 pl-6 relative">
                  <div class="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900">${exp.position}</h3>
                    <p class="text-lg text-gray-700">${exp.company}</p>
                    <p class="text-sm text-gray-500 mb-2">
                      ${exp.startDate} - ${exp.endDate || 'Present'}
                    </p>
                    ${
                      exp.description
                        ? `
                      <p class="text-gray-700 leading-relaxed">${exp.description}</p>
                    `
                        : ''
                    }
                    ${
                      exp.highlights && exp.highlights.length > 0
                        ? `
                      <ul class="mt-2 space-y-1">
                        ${exp.highlights
                          .map(
                            highlight => `
                          <li class="text-gray-700 flex items-start">
                            <span class="text-blue-500 mr-2">•</span>
                            <span>${highlight}</span>
                          </li>
                        `
                          )
                          .join('')}
                      </ul>
                    `
                        : ''
                    }
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- Projects Section -->
      ${
        projects && projects.length > 0
          ? `
        <section id="projects" class="py-16 bg-gray-50">
          <div class="max-w-5xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Projects</h2>
            <div class="grid md:grid-cols-2 gap-6">
              ${projects
                .map(
                  project => `
                <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 class="text-xl font-semibold text-gray-900 mb-2">${project.title}</h3>
                  ${
                    project.description
                      ? `
                    <p class="text-gray-700 mb-4">${project.description}</p>
                  `
                      : ''
                  }
                  ${
                    project.technologies && project.technologies.length > 0
                      ? `
                    <div class="flex flex-wrap gap-2 mb-4">
                      ${project.technologies
                        .map(
                          tech => `
                        <span class="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          ${tech}
                        </span>
                      `
                        )
                        .join('')}
                    </div>
                  `
                      : ''
                  }
                  <div class="flex gap-4">
                    ${
                      project.liveUrl || project.projectUrl
                        ? `
                      <a href="${project.liveUrl || project.projectUrl}" target="_blank" class="text-blue-600 hover:text-blue-700 font-medium">
                        View Project →
                      </a>
                    `
                        : ''
                    }
                    ${
                      project.githubUrl
                        ? `
                      <a href="${project.githubUrl}" target="_blank" class="text-gray-600 hover:text-gray-900 font-medium">
                        GitHub →
                      </a>
                    `
                        : ''
                    }
                  </div>
                </div>
              `
                )
                .join('')}
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
        <section id="skills" class="py-16 bg-white">
          <div class="max-w-5xl mx-auto px-4">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">Skills</h2>
            <div class="grid md:grid-cols-3 gap-8">
              ${groupSkillsByCategory(skills)
                .map(
                  ([category, categorySkills]) => `
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-4 capitalize">
                    ${category || 'General'}
                  </h3>
                  <div class="space-y-3">
                    ${categorySkills
                      .map(
                        (skill: Skill) => `
                      <div>
                        <div class="flex justify-between mb-1">
                          <span class="text-gray-700">${skill.name}</span>
                          <span class="text-sm text-gray-500 capitalize">${skill.level || 'intermediate'}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            class="bg-blue-500 h-2 rounded-full transition-all duration-500"
                            style="width: ${getSkillPercentage(skill.level || 'intermediate')}%"
                          ></div>
                        </div>
                      </div>
                    `
                      )
                      .join('')}
                  </div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </section>
      `
          : ''
      }

      <!-- Contact Section -->
      <section id="contact" class="py-16 bg-gray-900 text-white">
        <div class="max-w-5xl mx-auto px-4 text-center">
          <h2 class="text-3xl font-bold mb-4">Get In Touch</h2>
          <p class="text-gray-400 mb-8">
            I'm always interested in hearing about new opportunities and exciting projects.
          </p>
          ${
            contact?.email
              ? `
            <a 
              href="mailto:${contact.email}" 
              class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Send Email
            </a>
          `
              : ''
          }
        </div>
      </section>
    </div>
  `;
}

// Helper functions
function groupSkillsByCategory(skills: Skill[]): [string, Skill[]][] {
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const category = skill.category || 'general';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  return Object.entries(grouped);
}

function getSkillPercentage(level: string): number {
  const levels: Record<string, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };
  return levels[level] || 50;
}

/**
 * LinkedIn Data Parser
 * Transforms LinkedIn API data into portfolio format
 */

import { logger } from '@/lib/utils/logger';
import {
  LinkedInFullProfile,
  LinkedInImportResult,
  LinkedInPosition,
  LinkedInEducation,
  LinkedInProject,
  LinkedInCertification,
} from './types';

export class LinkedInParser {
  /**
   * Parse LinkedIn profile data into portfolio format
   */
  static parseProfile(linkedInData: LinkedInFullProfile): LinkedInImportResult {
    try {
      const {
        profile,
        email,
        positions,
        education,
        skills,
        certifications,
        projects,
        summary,
      } = linkedInData;

      // Construct full name
      const fullName =
        `${profile.localizedFirstName} ${profile.localizedLastName}`.trim();

      // Parse experience/positions
      const experience = this.parsePositions(positions || []);

      // Parse education
      const educationData = this.parseEducation(education || []);

      // Parse projects
      const projectsData = this.parseProjects(projects || []);

      // Parse certifications
      const certificationsData = this.parseCertifications(certifications || []);

      // Extract skills
      const skillsList = skills?.map(skill => skill.name) || [];

      // Build URLs object
      const urls: unknown = {
        linkedin: profile.vanityName
          ? `https://linkedin.com/in/${profile.vanityName}`
          : undefined,
      };

      // Try to extract other URLs from websites
      linkedInData.websites?.forEach(website => {
        if (website.url.includes('github.com')) {
          urls.github = website.url;
        } else if (
          website.url.includes('twitter.com') ||
          website.url.includes('x.com')
        ) {
          urls.twitter = website.url;
        } else if (!urls.website) {
          urls.website = website.url;
        }
      });

      return {
        success: true,
        data: {
          name: fullName,
          title: profile.localizedHeadline || '',
          bio: summary || profile.localizedHeadline || '',
          email: email || '',
          avatar: profile.profilePicture?.displayImage,
          experience,
          education: educationData,
          skills: skillsList,
          projects: projectsData,
          certifications: certificationsData,
          urls,
        },
      };
    } catch (error) {
      logger.error(
        'LinkedIn profile parsing failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to parse LinkedIn data',
      };
    }
  }

  /**
   * Parse LinkedIn positions into experience format
   */
  private static parsePositions(
    positions: LinkedInPosition[]
  ): NonNullable<LinkedInImportResult['data']>['experience'] {
    return positions.map(position => {
      const startDate = this.formatDate(position.startDate);
      const endDate = position.endDate
        ? this.formatDate(position.endDate)
        : null;
      const duration = this.calculateDuration(
        position.startDate,
        position.endDate
      );

      return {
        company: position.companyName,
        position: position.title,
        duration,
        description: position.description || '',
        startDate,
        endDate: endDate || '',
        current: !position.endDate,
        location: position.location,
      };
    });
  }

  /**
   * Parse LinkedIn education into portfolio format
   */
  private static parseEducation(
    education: LinkedInEducation[]
  ): NonNullable<LinkedInImportResult['data']>['education'] {
    return education.map(edu => ({
      institution: edu.schoolName,
      degree: edu.degreeName || '',
      field: edu.fieldOfStudy || '',
      startYear: edu.startDate.year.toString(),
      endYear: edu.endDate?.year.toString(),
      description: edu.description,
      activities: edu.activities,
      grade: edu.grade,
    }));
  }

  /**
   * Parse LinkedIn projects into portfolio format
   */
  private static parseProjects(
    projects: LinkedInProject[]
  ): NonNullable<LinkedInImportResult['data']>['projects'] {
    return projects.map(project => {
      const technologies: string[] = [];

      // Try to extract technologies from description
      if (project.description) {
        const techKeywords = this.extractTechnologies(project.description);
        technologies.push(...techKeywords);
      }

      return {
        name: project.title,
        description: project.description || '',
        link: project.url,
        technologies,
        startDate: project.startDate
          ? this.formatDate(project.startDate)
          : undefined,
        endDate: project.endDate ? this.formatDate(project.endDate) : undefined,
        members: project.members,
      };
    });
  }

  /**
   * Parse LinkedIn certifications into portfolio format
   */
  private static parseCertifications(
    certifications: LinkedInCertification[]
  ): NonNullable<LinkedInImportResult['data']>['certifications'] {
    return certifications.map(cert => ({
      name: cert.name,
      issuer: cert.authority,
      date: cert.startDate
        ? this.formatDate(cert.startDate)
        : new Date().toISOString(),
      credentialId: cert.licenseNumber,
      credentialUrl: cert.url,
      expiryDate: cert.endDate ? this.formatDate(cert.endDate) : undefined,
    }));
  }

  /**
   * Format LinkedIn date object into ISO string
   */
  private static formatDate(date: { month?: number; year: number }): string {
    const month = date.month || 1;
    const monthStr = month.toString().padStart(2, '0');
    return `${date.year}-${monthStr}-01`;
  }

  /**
   * Calculate duration between two dates
   */
  private static calculateDuration(
    startDate: { month?: number; year: number },
    endDate?: { month?: number; year: number }
  ): string {
    const start = new Date(this.formatDate(startDate));
    const end = endDate ? new Date(this.formatDate(endDate)) : new Date();

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    if (months < 12) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? 's' : ''}`;
    }

    return `${years} year${years !== 1 ? 's' : ''} ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
  }

  /**
   * Extract technology keywords from text
   */
  private static extractTechnologies(text: string): string[] {
    const commonTechnologies = [
      // Languages
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
      'C++',
      'C#',
      'Ruby',
      'Go',
      'Rust',
      'Swift',
      'Kotlin',
      'PHP',
      'Scala',
      'R',
      'MATLAB',
      'SQL',
      'HTML',
      'CSS',
      'Sass',
      'SCSS',

      // Frontend
      'React',
      'Vue',
      'Angular',
      'Svelte',
      'Next.js',
      'Nuxt.js',
      'Gatsby',
      'Redux',
      'MobX',
      'jQuery',
      'Bootstrap',
      'Tailwind',
      'Material-UI',
      'Ant Design',

      // Backend
      'Node.js',
      'Express',
      'Django',
      'Flask',
      'Spring',
      'Rails',
      'Laravel',
      'FastAPI',
      'GraphQL',
      'REST',
      'gRPC',
      'WebSocket',

      // Databases
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'Elasticsearch',
      'DynamoDB',
      'Cassandra',
      'SQLite',
      'Oracle',
      'SQL Server',

      // Cloud & DevOps
      'AWS',
      'Azure',
      'GCP',
      'Docker',
      'Kubernetes',
      'Jenkins',
      'GitLab',
      'GitHub Actions',
      'Terraform',
      'Ansible',
      'CI/CD',
      'Linux',
      'Nginx',
      'Apache',

      // Mobile
      'React Native',
      'Flutter',
      'iOS',
      'Android',
      'Xamarin',
      'Ionic',

      // Data & AI
      'TensorFlow',
      'PyTorch',
      'Keras',
      'Scikit-learn',
      'Pandas',
      'NumPy',
      'Jupyter',
      'Spark',
      'Hadoop',
      'Tableau',
      'Power BI',

      // Tools
      'Git',
      'Jira',
      'Confluence',
      'Slack',
      'VS Code',
      'IntelliJ',
      'Figma',
      'Sketch',
      'Adobe XD',
      'Photoshop',
      'Illustrator',
    ];

    const foundTechnologies: string[] = [];
    const lowerText = text.toLowerCase();

    commonTechnologies.forEach(tech => {
      if (lowerText.includes(tech.toLowerCase())) {
        foundTechnologies.push(tech);
      }
    });

    return [...new Set(foundTechnologies)]; // Remove duplicates
  }

  /**
   * Generate portfolio bio from LinkedIn data
   */
  static generateBio(linkedInData: LinkedInFullProfile): string {
    const { profile, positions, skills } = linkedInData;

    let bio = '';

    // Start with headline if available
    if (profile.localizedHeadline) {
      bio = profile.localizedHeadline;
    }

    // Add current position if available
    const currentPosition = positions?.find(p => !p.endDate);
    if (
      currentPosition &&
      !bio.toLowerCase().includes(currentPosition.companyName.toLowerCase())
    ) {
      bio += bio
        ? `. Currently ${currentPosition.title} at ${currentPosition.companyName}`
        : `${currentPosition.title} at ${currentPosition.companyName}`;
    }

    // Add top skills if available and bio is still short
    if (skills && skills.length > 0 && bio.length < 100) {
      const topSkills = skills.slice(0, 5).map(s => s.name);
      bio += `. Skilled in ${topSkills.join(', ')}`;
    }

    // Ensure bio doesn't exceed reasonable length
    if (bio.length > 300) {
      bio = bio.substring(0, 297) + '...';
    }

    return bio;
  }
}

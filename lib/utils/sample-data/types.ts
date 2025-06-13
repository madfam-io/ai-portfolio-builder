import type {
  Experience,
  Project,
  Education,
  Skill,
  Certification,
} from '@/types/portfolio';

export interface SampleDataConfig {
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
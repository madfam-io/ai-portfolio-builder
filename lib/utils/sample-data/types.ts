import type {
  Experience,
  Project,
  Education,
  Skill,
  Certification,
} from '@/types/portfolio';

export interface PersonalInfo {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  avatarUrl?: string;
}

export interface SkillGroup {
  technical: Skill[];
  soft: Skill[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
}

export interface SampleDataConfig {
  personal: PersonalInfo;
  skills: SkillGroup;
  experience: Experience[];
  education: Education[];
  projects: Project[];
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
  testimonials?: Testimonial[];
  certifications?: Certification[];
}

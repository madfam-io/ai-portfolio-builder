/**
 * MADFAM Code Available License (MCAL) v1.0
 * 
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 * 
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 * 
 * For commercial licensing: licensing@madfam.com
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

/**
 * LinkedIn Integration Types
 * Type definitions for LinkedIn OAuth and API integration
 */

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
}

export interface LinkedInProfile {
  id: string;
  localizedFirstName: string;
  localizedLastName: string;
  localizedHeadline?: string;
  vanityName?: string;
  profilePicture?: {
    displayImage: string;
  };
}

export interface LinkedInEmail {
  elements: Array<{
    'handle~': {
      emailAddress: string;
    };
    handle: string;
  }>;
}

export interface LinkedInPosition {
  companyName: string;
  title: string;
  description?: string;
  startDate: {
    month?: number;
    year: number;
  };
  endDate?: {
    month?: number;
    year: number;
  };
  location?: string;
  companyUrn?: string;
}

export interface LinkedInEducation {
  schoolName: string;
  degreeName?: string;
  fieldOfStudy?: string;
  startDate: {
    year: number;
  };
  endDate?: {
    year: number;
  };
  description?: string;
  activities?: string;
  grade?: string;
}

export interface LinkedInSkill {
  name: string;
  proficiencyLevel?: string;
  yearsOfExperience?: number;
}

export interface LinkedInCertification {
  name: string;
  authority: string;
  licenseNumber?: string;
  startDate?: {
    month?: number;
    year: number;
  };
  endDate?: {
    month?: number;
    year: number;
  };
  url?: string;
}

export interface LinkedInProject {
  title: string;
  description?: string;
  url?: string;
  startDate?: {
    month?: number;
    year: number;
  };
  endDate?: {
    month?: number;
    year: number;
  };
  members?: Array<{
    name: string;
    profileUrl?: string;
  }>;
}

export interface LinkedInFullProfile {
  profile: LinkedInProfile;
  email?: string;
  positions?: LinkedInPosition[];
  education?: LinkedInEducation[];
  skills?: LinkedInSkill[];
  certifications?: LinkedInCertification[];
  projects?: LinkedInProject[];
  summary?: string;
  websites?: Array<{
    url: string;
    type: string;
  }>;
}

export interface LinkedInImportResult {
  success: boolean;
  data?: {
    name: string;
    title: string;
    bio: string;
    email: string;
    phone?: string;
    location?: string;
    avatar?: string;
    experience: Array<{
      company: string;
      position: string;
      duration: string;
      description: string;
      startDate: string;
      endDate?: string;
      current: boolean;
    }>;
    education: Array<{
      institution: string;
      degree: string;
      field: string;
      startYear: string;
      endYear?: string;
      description?: string;
    }>;
    skills: string[];
    projects: Array<{
      name: string;
      description: string;
      link?: string;
      technologies: string[];
      startDate?: string;
      endDate?: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      credentialId?: string;
      credentialUrl?: string;
    }>;
    urls: {
      linkedin?: string;
      website?: string;
      github?: string;
      twitter?: string;
    };
  };
  error?: string;
}

export interface LinkedInConnectionStatus {
  isConnected: boolean;
  lastSync?: string;
  profileId?: string;
  scope?: string[];
  expiresAt?: string;
}

// LinkedIn OAuth configuration
export const LINKEDIN_OAUTH_CONFIG = {
  authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  scope: ['openid', 'profile', 'email', 'w_member_social'].join(' '),
  responseType: 'code',
  grantType: 'authorization_code',
};

// LinkedIn API endpoints
export const LINKEDIN_API_ENDPOINTS = {
  profile: 'https://api.linkedin.com/v2/userinfo',
  me: 'https://api.linkedin.com/v2/me',
  email:
    'https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))',
  positions: 'https://api.linkedin.com/v2/positions',
  skills: 'https://api.linkedin.com/v2/skills',
  certifications: 'https://api.linkedin.com/v2/certifications',
};

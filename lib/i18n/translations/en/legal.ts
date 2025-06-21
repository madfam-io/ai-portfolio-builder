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
 * @fileoverview Legal English translations (Privacy, Terms, GDPR)
 * @module i18n/translations/en/legal
 */

export default {
  // Privacy Policy
  privacyPageTitle: 'Privacy Policy',
  privacyTitle: 'Privacy Policy',
  privacyLastUpdated: 'Last updated: January 2024',
  privacyInfoWeCollect: 'Information We Collect',
  privacyInfoCollectTitle: 'Information We Collect',
  privacyInfoCollectText:
    'We collect information you provide directly to us and data about how you use our services.',
  privacyInfoCollectItem1: 'Account information (name, email, password)',
  privacyInfoCollectItem2: 'Portfolio content (projects, bio, images)',
  privacyInfoCollectItem3: 'Usage data (pages visited, features used)',
  privacyInfoCollectItem4: 'Technical information (IP address, browser type)',
  privacyHowWeUse: 'How We Use Your Information',
  privacyHowUseTitle: 'How We Use Your Information',
  privacyHowUseText:
    'We use the information we collect to provide, maintain, and improve our services.',
  privacyHowUseItem1: 'Provide and personalize our services',
  privacyHowUseItem2: 'Communicate with you about your account',
  privacyHowUseItem3: 'Improve and develop new features',
  privacyHowUseItem4: 'Protect against fraud and abuse',
  privacyDataProtectionTitle: 'Data Protection',
  privacyDataProtectionText:
    'We implement technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.',
  privacyYourRightsTitle: 'Your Rights',
  privacyYourRightsText:
    'You have the right to access, update, delete, or export your personal information.',
  privacyYourRightsItem1: 'Access your personal information',
  privacyYourRightsItem2: 'Correct inaccurate data',
  privacyYourRightsItem3: 'Delete your account and data',
  privacyYourRightsItem4: 'Export your data',
  privacyCookiesTitle: 'Cookies',
  privacyCookiesText:
    'We use cookies to improve your experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.',
  privacyChangesTitle: 'Changes to This Policy',
  privacyChangesText:
    'We may update this privacy policy periodically. We will notify you of significant changes by posting the new policy on this page.',
  privacyContactTitle: 'Contact Us',
  privacyContactUs: 'Contact Us',
  privacyContactText:
    'If you have questions about this privacy policy, please contact us at:',
  privacyContactAddress: 'Mexico City, Mexico',

  // Terms of Service
  termsPageTitle: 'Terms of Service',
  termsLastUpdated: (() => {
    const date = new Date();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `Last updated: ${month} ${year}`;
  })(),
  termsAcceptanceTitle: 'Acceptance of Terms',
  termsAcceptanceText:
    'By accessing and using PRISMA, you agree to be bound by these Terms of Service.',
  termsUseLicenseTitle: 'Use License',
  termsUseLicenseText:
    'Permission is granted to temporarily use our service for personal and commercial use.',
  termsContactInfoTitle: 'Contact Information',
  termsContactInfoText: 'For questions about these Terms, please contact us.',

  // GDPR
  gdprPageTitle: 'GDPR Compliance',
  gdprSubtitle:
    'Your data protection rights under the General Data Protection Regulation (GDPR) and how PRISMA respects your privacy.',
  gdprCommitment: 'Our Commitment to Your Privacy',
  gdprCommitmentDesc:
    'MADFAM is committed to protecting your personal data and respecting your privacy rights. We comply with GDPR requirements and implement appropriate technical and organizational measures to safeguard your information.',
  gdprContactDpo: 'Contact Our DPO',
  gdprYourRights: 'Your Data Protection Rights',
  gdprRightToInfo: 'Right to Information',
  gdprRightToInfoDesc:
    'You have the right to know what personal data we collect, how we use it, and who we share it with.',
  gdprRightToRect: 'Right to Rectification',
  gdprRightToRectDesc:
    'You can request corrections to any inaccurate or incomplete personal data we hold about you.',
  gdprRightToErase: 'Right to Erasure',
  gdprRightToEraseDesc:
    'You can request deletion of your personal data when it is no longer necessary or you withdraw consent.',
  gdprRightToPort: 'Right to Data Portability',
  gdprRightToPortDesc:
    'You can request a copy of your personal data in a structured, machine-readable format.',
  gdprRightToObject: 'Right to Object',
  gdprRightToObjectDesc:
    'You can object to processing of your personal data for direct marketing or other legitimate interests.',
  gdprRightToRestrict: 'Right to Restrict Processing',
  gdprRightToRestrictDesc:
    'You can request limitation of processing under certain circumstances while we verify or correct data.',
  gdprWhatWeCollect: 'What Data We Collect',
  gdprWhatData: 'What Data We Collect',
  gdprWhatDataTitle: 'What Data We Collect',
  gdprAccountInfo: 'Account Information',
  gdprAccountInfoTitle: 'Account Information',
  gdprAccountInfoDesc:
    'Name, email address, encrypted password, and profile information you provide.',
  gdprPortfolioData: 'Portfolio Data',
  gdprPortfolioDataTitle: 'Portfolio Data',
  gdprPortfolioDataDesc:
    'Content you create, upload, or generate using our platform including text, images, and project information.',
  gdprUsageAnalytics: 'Usage Analytics',
  gdprUsageAnalyticsTitle: 'Usage Analytics',
  gdprUsageAnalyticsDesc:
    'Aggregated and anonymized data about how you use our platform to improve our services.',
  gdprTechnicalData: 'Technical Data',
  gdprTechnicalDataTitle: 'Technical Data',
  gdprTechnicalDataDesc:
    'IP address, browser type, device information, and cookies for security and functionality.',
  gdprLegalBasis: 'Legal Basis for Processing',
  gdprLegalBasisTitle: 'Legal Basis for Processing',
  gdprContractPerf: 'Contract Performance',
  gdprContractTitle: 'Contract Performance',
  gdprContractPerfDesc:
    'Processing necessary to provide our portfolio creation services as described in our Terms of Service.',
  gdprContractDesc:
    'Processing necessary to provide our portfolio creation services as described in our Terms of Service.',
  gdprLegitInterest: 'Legitimate Interest',
  gdprLegitimateTitle: 'Legitimate Interest',
  gdprLegitimateInterests: 'Legitimate Interest',
  gdprLegitInterestDesc:
    'Improving our services, security measures, and providing customer support.',
  gdprLegitimateDesc:
    'Improving our services, security measures, and providing customer support.',
  gdprLegitimateInterestsDesc:
    'Improving our services, security measures, and providing customer support.',
  gdprConsent: 'Consent',
  gdprConsentTitle: 'Consent',
  gdprConsentDesc:
    'Marketing communications, optional analytics, and third-party integrations you explicitly approve.',
  gdprExerciseRights: 'Exercise Your Rights',
  gdprExerciseTitle: 'Exercise Your Rights',
  gdprExerciseDesc:
    'To exercise any of your GDPR rights, please contact us. We will respond within 30 days and may require identity verification.',
  gdprSubmitRequest: 'Submit GDPR Request',
  gdprManageData: 'Manage Data in Profile',
  gdprManageProfile: 'Manage Data in Profile',
} as const;

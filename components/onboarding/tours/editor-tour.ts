import { TourStep } from '../GuidedTour';

export const editorTourSteps: TourStep[] = [
  {
    target: '.editor-sidebar',
    title: 'Portfolio Sections',
    content:
      'This is where you edit your portfolio content. Click on any section to expand and edit it. You can drag sections to reorder them or click the eye icon to hide them.',
    placement: 'right',
  },
  {
    target: '[data-tour="save-button"]',
    title: 'Auto-Save Feature',
    content:
      'Your changes are automatically saved every 30 seconds. You can also save manually at any time by clicking this button or pressing Cmd/Ctrl+S.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="preview-toggle"]',
    title: 'Live Preview',
    content:
      'Toggle the preview on and off to see how your portfolio looks in real-time. You can also switch between desktop, tablet, and mobile views.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="ai-enhance"]',
    title: 'AI Enhancement',
    content:
      'Use AI to improve your bio and project descriptions. Our AI will help you write professional, compelling content that highlights your achievements.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="theme-section"]',
    title: 'Customize Your Look',
    content:
      'Click on the Theme section to customize colors, fonts, spacing, and more. Make your portfolio uniquely yours!',
    placement: 'right',
  },
  {
    target: '[data-tour="publish-button"]',
    title: 'Publish When Ready',
    content:
      'Once you are happy with your portfolio, click here to publish it to the web. You will be able to choose a custom URL and optimize for search engines.',
    placement: 'bottom',
  },
];

export const dashboardTourSteps: TourStep[] = [
  {
    target: '[data-tour="create-portfolio"]',
    title: 'Create Your First Portfolio',
    content:
      'Click here to create a new portfolio. You can import from LinkedIn, upload a PDF resume, or start from scratch.',
    placement: 'bottom',
    action: {
      label: 'Create Portfolio',
      onClick: () => {
        const button = document.querySelector(
          '[data-tour="create-portfolio"]'
        ) as HTMLButtonElement;
        button?.click();
      },
    },
  },
  {
    target: '[data-tour="portfolio-card"]',
    title: 'Manage Your Portfolios',
    content:
      'Each portfolio appears as a card here. You can edit, preview, or delete portfolios from this dashboard.',
    placement: 'top',
  },
  {
    target: '[data-tour="templates-link"]',
    title: 'Browse Templates',
    content:
      'Explore our collection of professional templates. Each one is designed for different industries and styles.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="upgrade-button"]',
    title: 'Unlock More Features',
    content:
      'Upgrade your plan to access more portfolios, custom domains, advanced analytics, and priority support.',
    placement: 'left',
  },
];

export const quickStartTourSteps: TourStep[] = [
  {
    target: '[data-tour="import-section"]',
    title: 'Import Your Data',
    content:
      'The fastest way to get started! Import from LinkedIn or upload your resume to automatically populate your portfolio.',
    placement: 'bottom',
  },
  {
    target: '[data-tour="template-selector"]',
    title: 'Choose a Template',
    content:
      'Select a template that matches your style and industry. You can always change it later in the editor.',
    placement: 'top',
  },
  {
    target: '[data-tour="basic-info-form"]',
    title: 'Complete Your Profile',
    content:
      'Fill in your basic information. The more complete your profile, the better your portfolio will look.',
    placement: 'right',
  },
  {
    target: '[data-tour="ai-suggestions"]',
    title: 'AI-Powered Suggestions',
    content:
      'Our AI will suggest improvements to your content as you type. Accept suggestions with a single click.',
    placement: 'left',
  },
];

// Helper function to check if user should see a tour
export function shouldShowTour(tourName: string): boolean {
  const tourKey = `tour_completed_${tourName}`;
  const completed = localStorage.getItem(tourKey);
  return !completed;
}

// Helper function to mark tour as completed
export function markTourCompleted(tourName: string): void {
  const tourKey = `tour_completed_${tourName}`;
  localStorage.setItem(tourKey, 'true');
}

// Helper function to reset all tours (for testing)
export function resetAllTours(): void {
  Object.keys(localStorage)
    .filter(key => key.startsWith('tour_completed_'))
    .forEach(key => localStorage.removeItem(key));
}

/**
 * Translation types for the application
 */

export interface DemoTranslations {
  demoLoadingPreview: string;
  demoBackToEditor: string;
  demoLoveWhatYouSee: string;
  demoGetStartedFreeTrial: string;
  demoChooseTemplate?: string;
  demoTemplateDescription?: string;
  demoTemplates?: {
    developer?: {
      name: string;
      description: string;
    };
    designer?: {
      name: string;
      description: string;
    };
    consultant?: {
      name: string;
      description: string;
    };
    creative?: {
      name: string;
      description: string;
    };
    default?: {
      name: string;
      description: string;
    };
  };
}

export interface CommonTranslations {
  welcomeMessage: string;
  loading: string;
  error: string;
  success: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  back: string;
  next: string;
  finish: string;
  close: string;
}

export interface Translations extends DemoTranslations, CommonTranslations {
  // Add other translation namespaces as needed
}
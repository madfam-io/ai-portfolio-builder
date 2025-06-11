// Backwards compatibility layer for the refactored i18n system
// This file provides the same exports as the old minimal-context.tsx
// but uses the new modular architecture underneath

export { useLanguage, LanguageProvider } from './refactored-context';
export type { Language } from './refactored-types';

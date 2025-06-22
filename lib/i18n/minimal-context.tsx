/**
 * MADFAM Code Available License (MCAL) v1.0
 *
 * Copyright (c) 2025-present MADFAM. All rights reserved.
 *
 * This source code is made available for viewing and educational purposes only.
 * Commercial use is strictly prohibited except by MADFAM and licensed partners.
 *
 * For commercial licensing: licensing@madfam.io
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

// Backwards compatibility layer for the refactored i18n system
// This file provides the same exports as the old minimal-context.tsx
// but uses the new modular architecture underneath

export { useLanguage, LanguageProvider } from './refactored-context';
export type { Language } from './refactored-types';

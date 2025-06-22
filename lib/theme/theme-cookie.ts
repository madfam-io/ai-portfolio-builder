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

import { cookies } from 'next/headers';

export type Theme = 'light' | 'dark' | 'system';

const THEME_COOKIE_NAME = 'theme-preference';

/**
 * Get theme preference from cookie (server-side)
 */
export async function getThemeFromCookie(): Promise<Theme> {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get(THEME_COOKIE_NAME);

  if (themeCookie && ['light', 'dark', 'system'].includes(themeCookie.value)) {
    return themeCookie.value as Theme;
  }

  return 'dark'; // default
}

/**
 * Set theme preference in cookie (client-side)
 */
export function setThemeCookie(theme: Theme) {
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}

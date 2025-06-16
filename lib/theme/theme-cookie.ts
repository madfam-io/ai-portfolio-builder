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

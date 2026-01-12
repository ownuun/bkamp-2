'use client';

import { useCallback } from 'react';
import { type Locale } from './config';

export function useLocaleSwitcher() {
  const switchLocale = useCallback((locale: Locale) => {
    // Set cookie and reload
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    window.location.reload();
  }, []);

  return { switchLocale };
}

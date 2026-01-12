'use client';

import { useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { type Locale } from './config';

export function useLocaleSwitcher() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLocale = useCallback((locale: Locale) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    // Refresh server components
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

  return { switchLocale, isPending };
}

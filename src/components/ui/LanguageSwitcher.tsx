'use client';

import { useLocale } from 'next-intl';
import { useLocaleSwitcher } from '@/i18n/client';
import { locales, type Locale } from '@/i18n/config';

const localeNames: Record<Locale, string> = {
  ko: '한국어',
  en: 'English',
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const { switchLocale, isPending } = useLocaleSwitcher();

  const nextLocale = locales.find((l) => l !== locale) || locales[0];

  return (
    <button
      onClick={() => switchLocale(nextLocale)}
      disabled={isPending}
      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      title={`Switch to ${localeNames[nextLocale]}`}
    >
      {isPending ? '...' : localeNames[nextLocale]}
    </button>
  );
}

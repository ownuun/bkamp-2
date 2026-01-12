'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/Card';
import { UserMenu } from '@/components/auth/UserMenu';

export default function HomePage() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const tFooter = useTranslations('footer');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-brand-600 font-bold text-xl">
            {tCommon('appName')}
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 whitespace-pre-line">
            {t('hero')}
          </h1>
          <p className="text-gray-600 text-lg">
            {t('heroDescription')}
          </p>
        </div>

        {/* Demo Event Card */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-medium text-brand-600 uppercase tracking-wide mb-3">
              <span className="w-2 h-2 bg-brand-600 rounded-full animate-pulse"></span>
              {t('liveEvent')}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Vibe Coding for Founders in SF
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              2025.01.14 · San Francisco
            </p>
            <Link
              href="/e/vibe-coding-sf-2025"
              className="inline-flex items-center text-brand-600 font-medium hover:text-brand-700"
            >
              {t('viewEvent')}
            </Link>
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 text-center">{t('howItWorks')}</h3>

          <div className="grid gap-4">
            <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{t('step1Title')}</h4>
                <p className="text-sm text-gray-600">{t('step1Description')}</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{t('step2Title')}</h4>
                <p className="text-sm text-gray-600">{t('step2Description')}</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{t('step3Title')}</h4>
                <p className="text-sm text-gray-600">{t('step3Description')}</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>{tFooter('tagline')}</p>
      </footer>
    </div>
  );
}

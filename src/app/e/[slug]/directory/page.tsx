import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { getEventBySlug, getEventParticipants } from '@/lib/supabase';
import { ParticipantCard, ParticipantCardCompact } from '@/components/participant/ParticipantCard';
import { DirectorySearch } from './DirectorySearch';
import { Card, CardContent } from '@/components/ui/Card';
import { UserMenu } from '@/components/auth/UserMenu';

interface DirectoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; view?: 'list' | 'grid' }>;
}

export default async function DirectoryPage({ params, searchParams }: DirectoryPageProps) {
  const { slug } = await params;
  const { q: query, view = 'list' } = await searchParams;

  // Check authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/e/${slug}/join?redirect=directory`);
  }

  const event = await getEventBySlug(slug);
  if (!event) {
    notFound();
  }

  const t = await getTranslations('directory');

  // Check if user is a participant
  const { data: userRecord } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();

  if (!userRecord) {
    // User has account but hasn't joined this event
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('participantsOnly')}</h1>
              <p className="text-gray-600">
                {t('participantsOnlyDescription')}
              </p>
            </div>
            <Link
              href={`/e/${slug}/join`}
              className="block w-full py-3 px-4 bg-brand-600 text-white text-center rounded-lg font-semibold hover:bg-brand-700 transition-colors"
            >
              {t('joinEvent')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: participant } = await supabase
    .from('participants')
    .select('id')
    .eq('event_id', event.id)
    .eq('user_id', userRecord.id)
    .single();

  if (!participant) {
    // User has account but hasn't joined this event
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center space-y-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('participantsOnly')}</h1>
              <p className="text-gray-600">
                {t('participantsOnlyDescription')}
              </p>
            </div>
            <Link
              href={`/e/${slug}/join`}
              className="block w-full py-3 px-4 bg-brand-600 text-white text-center rounded-lg font-semibold hover:bg-brand-700 transition-colors"
            >
              {t('joinEvent')}
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const participants = await getEventParticipants(event.id);

  // Client-side filtering will handle search
  const filteredParticipants = query
    ? participants.filter((p) => {
        const searchTerm = query.toLowerCase();
        return (
          p.user.name.toLowerCase().includes(searchTerm) ||
          p.user.headline?.toLowerCase().includes(searchTerm) ||
          p.user.company?.toLowerCase().includes(searchTerm)
        );
      })
    : participants;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/e/${slug}`} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="flex-1">
              <h1 className="font-semibold text-gray-900">{t('participantsTitle')}</h1>
              <p className="text-xs text-gray-500">{event.name}</p>
            </div>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <DirectorySearch slug={slug} initialQuery={query} initialView={view} />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {filteredParticipants.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            {query ? (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('noSearchResults')}</h3>
                <p className="text-gray-500 text-sm">{t('noSearchResultsDescription')}</p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('noOtherParticipants')}</h3>
                <p className="text-gray-500 text-sm">{t('shareEvent')}</p>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              {query ? t('searchResults', { query }) : ''}
              {t('participantCount', { count: filteredParticipants.length })}
            </p>

            {view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredParticipants.map((participant) => (
                  <ParticipantCardCompact key={participant.id} participant={participant} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredParticipants.map((participant) => (
                  <ParticipantCard key={participant.id} participant={participant} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

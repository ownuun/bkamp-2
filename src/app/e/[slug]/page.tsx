import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { getEventBySlug, getParticipantCount, getEventParticipants } from '@/lib/supabase';
import { formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardContent } from '@/components/ui/Card';
import { UserMenu } from '@/components/auth/UserMenu';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const [participantCount, participants, tCommon, tEvent, tFooter] = await Promise.all([
    getParticipantCount(event.id),
    getEventParticipants(event.id),
    getTranslations('common'),
    getTranslations('event'),
    getTranslations('footer'),
  ]);
  const previewParticipants = participants.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-brand-600 font-semibold text-lg">
            {tCommon('appName')}
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          {/* Cover Image */}
          {event.cover_image_url ? (
            <div className="relative h-48 w-full">
              <Image
                src={event.cover_image_url}
                alt={event.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-32 w-full bg-gradient-to-br from-brand-500 to-brand-700" />
          )}

          <CardContent className="space-y-6">
            {/* Event Info */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>

              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>

              {event.description && (
                <p className="text-gray-600 text-sm leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>

            {/* Participant Preview */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar Stack */}
                  <div className="flex -space-x-2">
                    {previewParticipants.map((p) => (
                      <Avatar
                        key={p.id}
                        src={p.user.photo_url}
                        name={p.user.name}
                        size="sm"
                        className="ring-2 ring-white"
                      />
                    ))}
                    {participantCount > 5 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                        +{participantCount - 5}
                      </div>
                    )}
                  </div>
                  <span className="text-sm text-gray-600">
                    {tEvent('participants', { count: participantCount })}
                  </span>
                </div>

                {participantCount > 0 && (
                  <Link
                    href={`/e/${slug}/directory`}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    {tEvent('viewAll')}
                  </Link>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link
                href={`/e/${slug}/join`}
                className="block w-full py-3 px-4 bg-brand-600 text-white text-center rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                {tEvent('registerProfile')}
              </Link>
              <p className="text-center text-xs text-gray-500 mt-3">
                {tEvent('registerDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>{tFooter('tagline')}</p>
      </footer>
    </div>
  );
}

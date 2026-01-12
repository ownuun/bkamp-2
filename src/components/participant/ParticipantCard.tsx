'use client';

import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/Avatar';
import type { ParticipantWithUser } from '@/types';
import { cn } from '@/lib/utils';

interface ParticipantCardProps {
  participant: ParticipantWithUser;
  showConnectButton?: boolean;
  className?: string;
}

// Check if a URL is a valid LinkedIn profile URL
function isValidLinkedInUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('linkedin.com') && url.includes('/in/');
  } catch {
    return false;
  }
}

export function ParticipantCard({
  participant,
  showConnectButton = true,
  className,
}: ParticipantCardProps) {
  const t = useTranslations('directory');
  const { user } = participant;
  const hasValidLinkedIn = isValidLinkedInUrl(user.linkedin_url);

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200',
        'hover:border-gray-300 hover:shadow-sm transition-all',
        className
      )}
    >
      <Avatar src={user.photo_url} name={user.name} size="lg" />

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
        {user.headline && (
          <p className="text-sm text-gray-600 truncate">{user.headline}</p>
        )}
        {user.company && (
          <p className="text-xs text-gray-500 mt-0.5">@ {user.company}</p>
        )}
      </div>

      {showConnectButton && hasValidLinkedIn && (
        <a
          href={user.linkedin_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#0077B5] bg-[#0077B5]/10 hover:bg-[#0077B5]/20 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          {t('connect')}
        </a>
      )}
    </div>
  );
}

// 그리드 뷰용 컴팩트 카드
export function ParticipantCardCompact({
  participant,
  className,
}: Omit<ParticipantCardProps, 'showConnectButton'>) {
  const { user } = participant;
  const hasValidLinkedIn = isValidLinkedInUrl(user.linkedin_url);

  const handleClick = () => {
    if (hasValidLinkedIn) {
      window.open(user.linkedin_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!hasValidLinkedIn}
      className={cn(
        'flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-gray-200',
        hasValidLinkedIn
          ? 'hover:border-brand-300 hover:shadow-md cursor-pointer'
          : 'cursor-default opacity-75',
        'transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
        className
      )}
    >
      <Avatar src={user.photo_url} name={user.name} size="xl" />
      <div className="text-center min-w-0 w-full">
        <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
        {user.headline && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{user.headline}</p>
        )}
      </div>
    </button>
  );
}

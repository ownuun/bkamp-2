'use client';

import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
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

  const handleConnect = () => {
    if (hasValidLinkedIn) {
      window.open(user.linkedin_url, '_blank', 'noopener,noreferrer');
    }
  };

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
        <Button
          variant="outline"
          size="sm"
          onPress={handleConnect}
          className="flex-shrink-0"
        >
          {t('connect')}
        </Button>
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

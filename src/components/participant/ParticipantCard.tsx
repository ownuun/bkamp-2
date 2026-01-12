'use client';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { ParticipantWithUser } from '@/types';
import { cn } from '@/lib/utils';

interface ParticipantCardProps {
  participant: ParticipantWithUser;
  showConnectButton?: boolean;
  className?: string;
}

export function ParticipantCard({
  participant,
  showConnectButton = true,
  className,
}: ParticipantCardProps) {
  const { user } = participant;

  const handleConnect = () => {
    window.open(user.linkedin_url, '_blank', 'noopener,noreferrer');
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

      {showConnectButton && (
        <Button
          variant="outline"
          size="sm"
          onPress={handleConnect}
          className="flex-shrink-0"
        >
          연결
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

  const handleClick = () => {
    window.open(user.linkedin_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'flex flex-col items-center gap-3 p-4 bg-white rounded-xl border border-gray-200',
        'hover:border-brand-300 hover:shadow-md transition-all cursor-pointer',
        'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2',
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

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar } from '@/components/ui/Avatar';

export function UserMenu() {
  const { user, isLoading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/login"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        로그인
      </Link>
    );
  }

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User';
  const userPhoto = user.user_metadata?.picture || user.user_metadata?.avatar_url;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <Avatar src={userPhoto} name={userName} size="sm" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  );
}

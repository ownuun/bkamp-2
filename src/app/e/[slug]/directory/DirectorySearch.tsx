'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface DirectorySearchProps {
  slug: string;
  initialQuery?: string;
  initialView?: 'list' | 'grid';
}

export function DirectorySearch({ slug, initialQuery = '', initialView = 'list' }: DirectorySearchProps) {
  const router = useRouter();
  const t = useTranslations('directory');
  const [query, setQuery] = useState(initialQuery);
  const [view, setView] = useState<'list' | 'grid'>(initialView);

  const updateUrl = useCallback((newQuery: string, newView: 'list' | 'grid') => {
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (newView !== 'list') params.set('view', newView);
    const queryString = params.toString();
    router.push(`/e/${slug}/directory${queryString ? `?${queryString}` : ''}`);
  }, [router, slug]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(query, view);
  };

  const handleViewChange = (newView: 'list' | 'grid') => {
    setView(newView);
    updateUrl(query, newView);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex-1 relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              updateUrl('', view);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </form>

      {/* View Toggle */}
      <div className="flex border border-gray-300 rounded-lg overflow-hidden">
        <button
          onClick={() => handleViewChange('list')}
          className={cn(
            'p-2.5 transition-colors',
            view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
          )}
          aria-label="List view"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <button
          onClick={() => handleViewChange('grid')}
          className={cn(
            'p-2.5 border-l border-gray-300 transition-colors',
            view === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
          )}
          aria-label="Grid view"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

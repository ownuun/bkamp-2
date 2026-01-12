import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 클래스명 병합 유틸리티
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 이벤트 슬러그 생성
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

// 날짜 포맷팅
export function formatDate(dateString: string, locale: string = 'ko-KR'): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

// 상대적 시간 표시
export function getRelativeTime(dateString: string, locale: string = 'ko-KR'): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return locale === 'ko-KR' ? '오늘' : 'Today';
  if (diffDays === 1) return locale === 'ko-KR' ? '내일' : 'Tomorrow';
  if (diffDays === -1) return locale === 'ko-KR' ? '어제' : 'Yesterday';
  if (diffDays > 1) return locale === 'ko-KR' ? `${diffDays}일 후` : `In ${diffDays} days`;
  if (diffDays < -1) return locale === 'ko-KR' ? `${Math.abs(diffDays)}일 전` : `${Math.abs(diffDays)} days ago`;
  return '';
}

// 이벤트 접근 가능 여부 확인
export function isEventAccessible(endDate: string, accessDays: number): boolean {
  const eventEnd = new Date(endDate);
  const accessEnd = new Date(eventEnd);
  accessEnd.setDate(accessEnd.getDate() + accessDays);
  return new Date() <= accessEnd;
}

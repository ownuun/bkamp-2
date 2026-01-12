import type { LinkedInProfile } from '@/types';

// LinkedIn URL 형식 검증
export function isValidLinkedInUrl(url: string): boolean {
  const pattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
  return pattern.test(url.trim());
}

// LinkedIn URL에서 프로필 ID 추출
export function extractLinkedInId(url: string): string | null {
  const match = url.match(/linkedin\.com\/in\/([\w-]+)/i);
  return match ? match[1] : null;
}

// LinkedIn URL 정규화
export function normalizeLinkedInUrl(url: string): string {
  const id = extractLinkedInId(url);
  if (!id) return url;
  return `https://www.linkedin.com/in/${id}`;
}

// LinkedIn URL에서 기본 프로필 정보 파싱 (URL만 기반)
export function parseLinkedInUrl(url: string): LinkedInProfile | null {
  const linkedinId = extractLinkedInId(url);
  if (!linkedinId) return null;

  return {
    linkedin_url: normalizeLinkedInUrl(url),
    linkedin_id: linkedinId,
  };
}

// 프로필 ID를 이름으로 변환 (기본 추정)
// 예: "john-doe-123abc" -> "John Doe"
export function linkedInIdToName(linkedinId: string): string {
  // 뒤에 붙는 해시/랜덤 문자 제거
  const namepart = linkedinId.replace(/-[a-f0-9]{6,}$/i, '');

  // 하이픈을 공백으로, 첫 글자 대문자로
  return namepart
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

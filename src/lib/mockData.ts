import type { Event, User, Participant, ParticipantWithUser } from '@/types';

// 테스트용 목업 데이터
export const MOCK_EVENT: Event = {
  id: 'mock-event-1',
  name: '창업자들이 꼭 알아야 할 바이브코딩 in SF',
  slug: 'vibe-coding-sf-2025',
  date: '2025-01-14T14:00:00-08:00',
  end_date: '2025-01-14T16:30:00-08:00',
  location: '300 Grant Ave Suite 500, San Francisco, CA 94108',
  description: '스타트업 창업자를 위한 바이브코딩 네트워킹 이벤트. Claude Code 마스터 템플릿 증정!',
  directory_access_days: 30,
  language: 'both',
  organizer_id: 'mock-organizer-1',
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    linkedin_url: 'https://www.linkedin.com/in/johndoe',
    linkedin_id: 'johndoe',
    name: 'John Doe',
    headline: 'Founder & CEO at TechStartup',
    company: 'TechStartup',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'user-2',
    linkedin_url: 'https://www.linkedin.com/in/janesmith',
    linkedin_id: 'janesmith',
    name: 'Jane Smith',
    headline: 'Product Manager at BigTech',
    company: 'BigTech',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'user-3',
    linkedin_url: 'https://www.linkedin.com/in/kimminsu',
    linkedin_id: 'kimminsu',
    name: '김민수',
    headline: 'Software Engineer at Startup',
    company: 'Startup Inc.',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'user-4',
    linkedin_url: 'https://www.linkedin.com/in/leejiyoung',
    linkedin_id: 'leejiyoung',
    name: '이지영',
    headline: 'Investor at VC Fund',
    company: 'VC Fund',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
  {
    id: 'user-5',
    linkedin_url: 'https://www.linkedin.com/in/parkhyunwoo',
    linkedin_id: 'parkhyunwoo',
    name: '박현우',
    headline: 'CTO at AI Company',
    company: 'AI Company',
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
];

export const MOCK_PARTICIPANTS: Participant[] = MOCK_USERS.map((user, index) => ({
  id: `participant-${index + 1}`,
  event_id: MOCK_EVENT.id,
  user_id: user.id,
  visibility: 'public' as const,
  qr_code_data: `meetlink:${MOCK_EVENT.id}:${user.id}:${Date.now()}`,
  is_organizer: index === 0,
  created_at: '2025-01-10T00:00:00Z',
  updated_at: '2025-01-10T00:00:00Z',
}));

export const MOCK_PARTICIPANTS_WITH_USERS: ParticipantWithUser[] = MOCK_PARTICIPANTS.map((participant, index) => ({
  ...participant,
  user: MOCK_USERS[index],
}));

// 목업 데이터 사용 여부 확인
export const USE_MOCK_DATA = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co';

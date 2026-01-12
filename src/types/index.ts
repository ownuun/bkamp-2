// Event - 네트워킹 이벤트
export interface Event {
  id: string;
  name: string;
  slug: string;
  date: string;
  end_date?: string;
  location: string;
  description?: string;
  directory_access_days: number; // 운영진 설정: 디렉토리 접근 기간
  language: 'ko' | 'en' | 'both';
  organizer_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User - 사용자 (여러 이벤트에 참여 가능)
export interface User {
  id: string;
  auth_user_id?: string; // Supabase Auth user ID
  linkedin_url: string;
  linkedin_id?: string; // URL에서 추출
  name: string;
  headline?: string; // "Founder at StartupX"
  photo_url?: string;
  company?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

// Participant - Event ↔ User 연결 테이블
export interface Participant {
  id: string;
  event_id: string;
  user_id: string;
  visibility: 'public' | 'connections_only' | 'hidden';
  qr_code_data: string; // QR 코드 고유 식별자
  custom_note?: string; // "Looking for co-founder"
  is_organizer: boolean;
  created_at: string;
  updated_at: string;
}

// Connection - 연결 기록
export interface Connection {
  id: string;
  participant_a_id: string; // 스캔한 사람
  participant_b_id: string; // 스캔당한 사람
  connection_type: 'qr_scan' | 'profile_view' | 'mutual_scan';
  event_id: string;
  created_at: string;
}

// 참여자 정보 (User + Participant 조인)
export interface ParticipantWithUser extends Participant {
  user: User;
}

// 이벤트 생성 폼
export interface CreateEventInput {
  name: string;
  slug: string;
  date: string;
  end_date?: string;
  location: string;
  description?: string;
  directory_access_days: number;
  language: 'ko' | 'en' | 'both';
}

// 참여자 등록 폼
export interface JoinEventInput {
  linkedin_url: string;
  name?: string;
  headline?: string;
  company?: string;
  visibility: 'public' | 'connections_only' | 'hidden';
}

// LinkedIn URL에서 추출한 프로필 정보
export interface LinkedInProfile {
  linkedin_url: string;
  linkedin_id: string;
  name?: string;
  headline?: string;
  photo_url?: string;
  company?: string;
}

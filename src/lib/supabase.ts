import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Event, User, Participant, Connection, ParticipantWithUser } from '@/types';
import { MOCK_EVENT, MOCK_PARTICIPANTS_WITH_USERS, MOCK_USERS, USE_MOCK_DATA } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && !USE_MOCK_DATA) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Event 관련 함수들
export async function getEventBySlug(slug: string): Promise<Event | null> {
  // 목업 데이터 사용
  if (USE_MOCK_DATA) {
    if (slug === MOCK_EVENT.slug) {
      return MOCK_EVENT;
    }
    return null;
  }

  if (!supabase) return null;

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }
  return data;
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at' | 'is_active'>): Promise<Event | null> {
  if (USE_MOCK_DATA || !supabase) return null;

  const { data, error } = await supabase
    .from('events')
    .insert({ ...event, is_active: true })
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return null;
  }
  return data;
}

// User 관련 함수들
export async function getUserByLinkedIn(linkedinUrl: string): Promise<User | null> {
  if (USE_MOCK_DATA) {
    return MOCK_USERS.find(u => u.linkedin_url === linkedinUrl) || null;
  }

  if (!supabase) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('linkedin_url', linkedinUrl)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user:', error);
  }
  return data || null;
}

export async function createOrUpdateUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
  if (USE_MOCK_DATA) {
    // 목업 모드에서는 새 유저를 메모리에 추가하는 척
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newUser;
  }

  if (!supabase) return null;

  const existing = await getUserByLinkedIn(user.linkedin_url);

  if (existing) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...user, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    return data;
  }

  const { data, error } = await supabase
    .from('users')
    .insert(user)
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  return data;
}

// Participant 관련 함수들
export async function getParticipant(eventId: string, userId: string): Promise<Participant | null> {
  if (USE_MOCK_DATA) {
    const participant = MOCK_PARTICIPANTS_WITH_USERS.find(
      p => p.event_id === eventId && p.user_id === userId
    );
    return participant || null;
  }

  if (!supabase) return null;

  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching participant:', error);
  }
  return data || null;
}

export async function getEventParticipants(eventId: string): Promise<ParticipantWithUser[]> {
  if (USE_MOCK_DATA) {
    return MOCK_PARTICIPANTS_WITH_USERS.filter(p => p.event_id === eventId);
  }

  if (!supabase) return [];

  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      user:users(*)
    `)
    .eq('event_id', eventId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching participants:', error);
    return [];
  }
  return data || [];
}

export async function joinEvent(
  eventId: string,
  userId: string,
  visibility: Participant['visibility'] = 'public',
  isOrganizer: boolean = false
): Promise<Participant | null> {
  if (USE_MOCK_DATA) {
    const newParticipant: Participant = {
      id: `participant-${Date.now()}`,
      event_id: eventId,
      user_id: userId,
      visibility,
      qr_code_data: `meetlink:${eventId}:${userId}:${Date.now()}`,
      is_organizer: isOrganizer,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return newParticipant;
  }

  if (!supabase) return null;

  const qrCodeData = `meetlink:${eventId}:${userId}:${Date.now()}`;

  const { data, error } = await supabase
    .from('participants')
    .insert({
      event_id: eventId,
      user_id: userId,
      visibility,
      qr_code_data: qrCodeData,
      is_organizer: isOrganizer,
    })
    .select()
    .single();

  if (error) {
    console.error('Error joining event:', error);
    return null;
  }
  return data;
}

// Connection 관련 함수들
export async function createConnection(
  participantAId: string,
  participantBId: string,
  eventId: string,
  connectionType: Connection['connection_type'] = 'qr_scan'
): Promise<Connection | null> {
  if (USE_MOCK_DATA || !supabase) return null;

  const { data, error } = await supabase
    .from('connections')
    .insert({
      participant_a_id: participantAId,
      participant_b_id: participantBId,
      event_id: eventId,
      connection_type: connectionType,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating connection:', error);
    return null;
  }
  return data;
}

export async function getMyConnections(participantId: string): Promise<ParticipantWithUser[]> {
  if (USE_MOCK_DATA || !supabase) return [];

  const { data, error } = await supabase
    .from('connections')
    .select(`
      participant_b:participants!connections_participant_b_id_fkey(
        *,
        user:users(*)
      )
    `)
    .eq('participant_a_id', participantId);

  if (error) {
    console.error('Error fetching connections:', error);
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data?.map((d: any) => d.participant_b).filter(Boolean) || [];
}

// 참여자 수 카운트
export async function getParticipantCount(eventId: string): Promise<number> {
  if (USE_MOCK_DATA) {
    return MOCK_PARTICIPANTS_WITH_USERS.filter(p => p.event_id === eventId).length;
  }

  if (!supabase) return 0;

  const { count, error } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('visibility', 'public');

  if (error) {
    console.error('Error counting participants:', error);
    return 0;
  }
  return count || 0;
}

// 검색 기능
export async function searchParticipants(eventId: string, query: string): Promise<ParticipantWithUser[]> {
  if (USE_MOCK_DATA) {
    const lowerQuery = query.toLowerCase();
    return MOCK_PARTICIPANTS_WITH_USERS.filter(p =>
      p.event_id === eventId && (
        p.user.name.toLowerCase().includes(lowerQuery) ||
        p.user.headline?.toLowerCase().includes(lowerQuery) ||
        p.user.company?.toLowerCase().includes(lowerQuery)
      )
    );
  }

  if (!supabase) return [];

  const { data, error } = await supabase
    .from('participants')
    .select(`
      *,
      user:users(*)
    `)
    .eq('event_id', eventId)
    .eq('visibility', 'public')
    .or(`user.name.ilike.%${query}%,user.headline.ilike.%${query}%,user.company.ilike.%${query}%`);

  if (error) {
    console.error('Error searching participants:', error);
    return [];
  }
  return data || [];
}

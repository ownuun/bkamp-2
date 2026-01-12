import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEventBySlug, getParticipant, joinEvent } from '@/lib/supabase';

interface JoinRequest {
  eventSlug: string;
  name: string;
  headline?: string;
  photoUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const body: JoinRequest = await request.json();
    const { eventSlug, name, headline, photoUrl } = body;

    // Validation
    if (!eventSlug || !name) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      );
    }

    // Get event
    const event = await getEventBySlug(eventSlug);
    if (!event) {
      return NextResponse.json(
        { error: '이벤트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Get LinkedIn info from auth user metadata
    const linkedinUrl = authUser.user_metadata?.linkedin_url ||
      `https://www.linkedin.com/in/${authUser.id}`;

    // Create or update user with auth_user_id
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single();

    let user;
    if (existingUser) {
      // Update existing user
      const { data, error } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          headline: headline?.trim() || null,
          photo_url: photoUrl || existingUser.photo_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
          { error: '사용자 정보 업데이트에 실패했습니다' },
          { status: 500 }
        );
      }
      user = data;
    } else {
      // Create new user
      const { data, error } = await supabase
        .from('users')
        .insert({
          auth_user_id: authUser.id,
          linkedin_url: linkedinUrl,
          name: name.trim(),
          headline: headline?.trim() || null,
          photo_url: photoUrl || null,
          email: authUser.email,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
          { error: '사용자 생성에 실패했습니다' },
          { status: 500 }
        );
      }
      user = data;
    }

    // Check if already a participant
    const existingParticipant = await getParticipant(event.id, user.id);
    if (existingParticipant) {
      return NextResponse.json(
        { message: '이미 등록된 사용자입니다', participant: existingParticipant },
        { status: 200 }
      );
    }

    // Join event
    const participant = await joinEvent(event.id, user.id, 'public');
    if (!participant) {
      return NextResponse.json(
        { error: '이벤트 참여에 실패했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: '등록 완료', participant },
      { status: 201 }
    );
  } catch (error) {
    console.error('Join error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

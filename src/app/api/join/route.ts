import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface JoinRequest {
  eventSlug: string;
  name: string;
  headline?: string;
  photoUrl?: string;
  linkedinUrl?: string;
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
    const { eventSlug, name, headline, photoUrl, linkedinUrl } = body;

    // Validation
    if (!eventSlug || !name) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      );
    }

    // Validate LinkedIn URL if provided
    if (linkedinUrl) {
      try {
        const url = new URL(linkedinUrl);
        if (!url.hostname.includes('linkedin.com') || !linkedinUrl.includes('/in/')) {
          return NextResponse.json(
            { error: '올바른 LinkedIn 프로필 URL을 입력해주세요' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: '올바른 LinkedIn 프로필 URL을 입력해주세요' },
          { status: 400 }
        );
      }
    }

    // Get event (using same supabase client)
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('slug', eventSlug)
      .eq('is_active', true)
      .single();

    if (eventError || !event) {
      console.error('Error fetching event:', eventError);
      return NextResponse.json(
        { error: '이벤트를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // Get LinkedIn info - prefer user-provided URL, then metadata, then fallback
    const finalLinkedinUrl = linkedinUrl ||
      authUser.user_metadata?.linkedin_url ||
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
          linkedin_url: linkedinUrl || existingUser.linkedin_url,
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
          linkedin_url: finalLinkedinUrl,
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

    // Check if already a participant (using same supabase client)
    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('*')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single();

    if (existingParticipant) {
      return NextResponse.json(
        { message: '이미 등록된 사용자입니다', participant: existingParticipant },
        { status: 200 }
      );
    }

    // Join event (using same supabase client)
    const qrCodeData = `meetlink:${event.id}:${user.id}:${Date.now()}`;
    const { data: participant, error: joinError } = await supabase
      .from('participants')
      .insert({
        event_id: event.id,
        user_id: user.id,
        visibility: 'public',
        qr_code_data: qrCodeData,
        is_organizer: false,
      })
      .select()
      .single();

    if (joinError || !participant) {
      console.error('Error joining event:', joinError);
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

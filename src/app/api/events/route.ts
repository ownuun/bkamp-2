import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CreateEventRequest {
  name: string;
  slug: string;
  date: string;
  end_date?: string;
  location: string;
  description?: string;
  cover_image_url?: string;
  directory_access_days?: number;
  language?: 'ko' | 'en' | 'both';
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      );
    }

    const body: CreateEventRequest = await request.json();
    const {
      name,
      slug,
      date,
      end_date,
      location,
      description,
      cover_image_url,
      directory_access_days = 30,
      language = 'both',
    } = body;

    // Validation
    if (!name || !slug || !date || !location) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'slug는 영문 소문자, 숫자, 하이픈만 사용 가능합니다' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existingEvent } = await supabase
      .from('events')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingEvent) {
      return NextResponse.json(
        { error: '이미 사용 중인 URL입니다' },
        { status: 409 }
      );
    }

    // Get or create user record
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    // Create event
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        name: name.trim(),
        slug: slug.toLowerCase().trim(),
        date,
        end_date: end_date || null,
        location: location.trim(),
        description: description?.trim() || null,
        cover_image_url: cover_image_url || null,
        directory_access_days,
        language,
        organizer_id: userRecord?.id || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json(
        { error: '이벤트 생성에 실패했습니다' },
        { status: 500 }
      );
    }

    // If user exists, automatically add them as organizer participant
    if (userRecord) {
      const qrCodeData = `meetlink:${event.id}:${userRecord.id}:${Date.now()}`;
      await supabase
        .from('participants')
        .insert({
          event_id: event.id,
          user_id: userRecord.id,
          visibility: 'public',
          qr_code_data: qrCodeData,
          is_organizer: true,
        });
    }

    return NextResponse.json(
      { message: '이벤트가 생성되었습니다', event },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

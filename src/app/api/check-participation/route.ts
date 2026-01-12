import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getEventBySlug } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventSlug = searchParams.get('eventSlug');

    if (!eventSlug) {
      return NextResponse.json(
        { error: 'eventSlug is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json(
        { isParticipant: false },
        { status: 200 }
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

    // Get user record
    const { data: userRecord } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();

    if (!userRecord) {
      return NextResponse.json(
        { isParticipant: false },
        { status: 200 }
      );
    }

    // Check participation
    const { data: participant } = await supabase
      .from('participants')
      .select('id')
      .eq('event_id', event.id)
      .eq('user_id', userRecord.id)
      .single();

    return NextResponse.json(
      { isParticipant: !!participant },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check participation error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

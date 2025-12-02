import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET /api/events - Fetch all active events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get('upcoming');

    const supabase = await supabaseServer();
    let query = supabase
      .from('events')
      .select('*')
      .eq('is_active', true);

    // Filter for upcoming events only
    if (upcoming === 'true') {
      const now = new Date().toISOString();
      query = query.gte('event_date', now);
    }

    const { data, error } = await query.order('event_date', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: data });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await supabaseServer();
    const body = await request.json();

    const { data, error } = await supabase
      .from('events')
      .insert(body)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

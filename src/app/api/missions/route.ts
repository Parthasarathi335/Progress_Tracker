// app/api/missions/route.ts
// GET all missions (filtered), POST new mission

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isEmailAllowed } from '@/lib/auth/allowlist'
import { getTodayIST } from '@/lib/timezone'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isEmailAllowed(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || getTodayIST()

    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('mission_date', date)
      .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ missions: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isEmailAllowed(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, emoji, description, missionDate, assignedTo } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Mission title is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // If a daily XP reward has already been awarded for this date,
    // the mission date must remain as requested (no silent override).
    const { data: mission, error } = await admin.from('missions').insert({
      title: title.trim(),
      emoji: emoji || '✅',
      description: description?.trim() || null,
      created_by: user.id,
      assigned_to: assignedTo || null,
      mission_date: missionDate || getTodayIST(),
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ mission }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

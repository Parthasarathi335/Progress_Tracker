// app/api/missions/[id]/route.ts
// PATCH update mission, DELETE mission

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isEmailAllowed } from '@/lib/auth/allowlist'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isEmailAllowed(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { title, emoji, description, missionDate, assignedTo } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Mission title is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify the mission belongs to this user
    const { data: existing } = await admin
      .from('missions')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    if (existing.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data: mission, error } = await admin
      .from('missions')
      .update({
        title: title.trim(),
        emoji: emoji || '✅',
        description: description?.trim() || null,
        assigned_to: assignedTo || null,
        mission_date: missionDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ mission })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isEmailAllowed(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const admin = createAdminClient()

    // Verify ownership
    const { data: existing } = await admin
      .from('missions')
      .select('created_by')
      .eq('id', id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    if (existing.created_by !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await admin.from('missions').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

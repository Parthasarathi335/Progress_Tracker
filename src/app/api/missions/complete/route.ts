// app/api/missions/complete/route.ts
// Toggle mission completion and award XP if all missions done

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isEmailAllowed } from '@/lib/auth/allowlist'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isEmailAllowed(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { missionId, completed, date } = await req.json()

    if (!missionId || !date) {
      return NextResponse.json({ error: 'missionId and date are required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verify the mission exists and is assigned to this user
    const { data: mission } = await admin
      .from('missions')
      .select('*')
      .eq('id', missionId)
      .single()

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
    }

    // Mission must be assigned to this user or to both
    const isAssignedToMe = mission.assigned_to === null || mission.assigned_to === user.id
    if (!isAssignedToMe) {
      return NextResponse.json({ error: 'Mission not assigned to you' }, { status: 403 })
    }

    if (completed) {
      // Insert completion (idempotent — unique constraint handles duplicates)
      const { error } = await admin.from('mission_completions').upsert({
        mission_id: missionId,
        user_id: user.id,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'mission_id,user_id' })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      // Remove completion
      await admin
        .from('mission_completions')
        .delete()
        .eq('mission_id', missionId)
        .eq('user_id', user.id)
    }

    // Recalculate XP and coding streak via secure DB function
    const { data: xpResult, error: xpError } = await admin.rpc('award_daily_xp_if_complete', {
      p_user_id: user.id,
      p_date: date,
    })

    if (xpError) {
      console.error('XP calculation error:', xpError)
    }

    // Return updated XP total and badges
    const { data: xpRows } = await admin
      .from('xp_transactions')
      .select('amount')
      .eq('user_id', user.id)
    const newXp = xpRows?.reduce((sum, r) => sum + r.amount, 0) ?? 0

    const { data: badges } = await admin
      .from('user_badges')
      .select('badge_name')
      .eq('user_id', user.id)

    return NextResponse.json({
      success: true,
      xpResult,
      newXp,
      badges: badges?.map(b => b.badge_name) ?? [],
    })
  } catch (err) {
    console.error('Complete route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

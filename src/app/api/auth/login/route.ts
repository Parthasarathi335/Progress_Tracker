// app/api/auth/login/route.ts
// Called client-side after successful Supabase auth to record login streak

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isEmailAllowed } from '@/lib/auth/allowlist'
import { getTodayIST } from '@/lib/timezone'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!isEmailAllowed(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = getTodayIST()
    const admin = createAdminClient()

    // Ensure profile exists
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      await admin.from('profiles').insert({
        id: user.id,
        email: user.email!,
        username: user.email!.split('@')[0],
        role: 'admin',
      })
    }

    // Call the secure SQL function to record login streak
    const { data, error } = await admin.rpc('record_login_and_update_streak', {
      p_user_id: user.id,
      p_today: today,
    })

    if (error) {
      console.error('Login streak error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    console.error('Login route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

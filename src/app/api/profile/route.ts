// app/api/profile/route.ts
// PATCH update own profile

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isEmailAllowed } from '@/lib/auth/allowlist'

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !isEmailAllowed(user.email ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { username } = body

    if (!username?.trim()) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data, error } = await admin
      .from('profiles')
      .update({ username: username.trim() })
      .eq('id', user.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ profile: data })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

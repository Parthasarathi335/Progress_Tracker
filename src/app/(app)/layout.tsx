// app/(app)/layout.tsx
// Authenticated layout — creamy white + forest green shell (sidebar, top bar)

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isEmailAllowed } from '@/lib/auth/allowlist'
import AppShell from '@/components/AppShell'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isEmailAllowed(user.email ?? '')) redirect('/access-denied')

  // Fetch current user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch current login streak
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const { data: todayActivity } = await supabase
    .from('daily_activity')
    .select('login_streak')
    .eq('user_id', user.id)
    .eq('activity_date', today)
    .single()

  // Missions still to do today (drives the notification dot)
  let pendingMissions = 0
  const { data: todaysMissions } = await supabase
    .from('missions')
    .select('id')
    .eq('mission_date', today)
    .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
  const todaysIds = todaysMissions?.map(m => m.id) ?? []
  if (todaysIds.length > 0) {
    const { count: doneCount } = await supabase
      .from('mission_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('mission_id', todaysIds)
    pendingMissions = Math.max(0, todaysIds.length - (doneCount ?? 0))
  }

  return (
    <AppShell
      profile={profile}
      loginStreak={todayActivity?.login_streak ?? 0}
      pendingMissions={pendingMissions}
    >
      {children}
    </AppShell>
  )
}

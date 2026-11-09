// app/(app)/missions/page.tsx
// Server Component — fetches missions data and delegates to client

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isEmailAllowed } from '@/lib/auth/allowlist'
import MissionsClient from './MissionsClient'
import { getTodayIST } from '@/lib/timezone'

export default async function MissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isEmailAllowed(user.email ?? '')) redirect('/access-denied')

  const today = getTodayIST()

  // Get both profiles
  const { data: profiles } = await supabase.from('profiles').select('*')
  const myProfile = profiles?.find(p => p.id === user.id) ?? null
  const partnerProfile = profiles?.find(p => p.id !== user.id) ?? null

  // Get today's missions (all missions visible to me: assigned to me or to both)
  const { data: missions } = await supabase
    .from('missions')
    .select('*')
    .eq('mission_date', today)
    .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
    .order('created_at', { ascending: true })

  // Get my completions for today
  const missionIds = missions?.map(m => m.id) ?? []
  let myCompletions: string[] = []
  if (missionIds.length > 0) {
    const { data: completions } = await supabase
      .from('mission_completions')
      .select('mission_id')
      .eq('user_id', user.id)
      .in('mission_id', missionIds)
    myCompletions = completions?.map(c => c.mission_id) ?? []
  }

  // Login streak for the streak card
  const { data: todayActivity } = await supabase
    .from('daily_activity')
    .select('login_streak, coding_streak')
    .eq('user_id', user.id)
    .eq('activity_date', today)
    .single()

  // Partner's today progress
  let partnerProgress = { total: 0, completed: 0 }
  if (partnerProfile) {
    const { data: partnerMissions } = await supabase
      .from('missions')
      .select('id')
      .eq('mission_date', today)
      .or(`assigned_to.eq.${partnerProfile.id},assigned_to.is.null`)

    const partnerMissionIds = partnerMissions?.map(m => m.id) ?? []
    if (partnerMissionIds.length > 0) {
      const { count } = await supabase
        .from('mission_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', partnerProfile.id)
        .in('mission_id', partnerMissionIds)
      partnerProgress = { total: partnerMissionIds.length, completed: count ?? 0 }
    }
  }

  return (
    <MissionsClient
      userId={user.id}
      myProfile={myProfile}
      partnerProfile={partnerProfile}
      initialMissions={missions ?? []}
      initialCompletions={myCompletions}
      loginStreak={todayActivity?.login_streak ?? 0}
      codingStreak={todayActivity?.coding_streak ?? 0}
      partnerProgress={partnerProgress}
      today={today}
    />
  )
}

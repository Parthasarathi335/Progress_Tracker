// app/(app)/dashboard/page.tsx
// Server Component — fetches all dashboard data

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isEmailAllowed } from '@/lib/auth/allowlist'
import DashboardClient from './DashboardClient'
import { getTodayIST } from '@/lib/timezone'
import { BADGE_THRESHOLDS, BADGE_EMOJIS, type BadgeName } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isEmailAllowed(user.email ?? '')) redirect('/access-denied')

  const today = getTodayIST()

  // Fetch current user's profile
  const { data: myProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch partner's profile
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')

  const partnerProfile = allProfiles?.find(p => p.id !== user.id) ?? null

  // Fetch today's missions visible to me
  const { data: todayMissions } = await supabase
    .from('missions')
    .select('*')
    .eq('mission_date', today)
    .or(`assigned_to.eq.${user.id},assigned_to.is.null`)
    .order('created_at', { ascending: true })

  // Fetch my completions for today
  const missionIds = todayMissions?.map(m => m.id) ?? []
  let myCompletions: string[] = []
  if (missionIds.length > 0) {
    const { data: completions } = await supabase
      .from('mission_completions')
      .select('mission_id')
      .eq('user_id', user.id)
      .in('mission_id', missionIds)
    myCompletions = completions?.map(c => c.mission_id) ?? []
  }

  // My daily activity today
  const { data: myActivity } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('user_id', user.id)
    .eq('activity_date', today)
    .single()

  // My XP
  const { data: myXpRows } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', user.id)
  const myTotalXp = myXpRows?.reduce((sum, r) => sum + r.amount, 0) ?? 0

  // XP earned today (IST)
  const { data: todayXpRows } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('activity_date', today)
  const myTodayXp = todayXpRows?.reduce((sum, r) => sum + r.amount, 0) ?? 0

  // My badges
  const { data: myBadges } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', user.id)
  const myBadgeNames = myBadges?.map(b => b.badge_name) ?? []

  // Total missions completed by me (all time)
  const { count: totalCompleted } = await supabase
    .from('mission_completions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // Partner data
  let partnerData = null
  if (partnerProfile) {
    const { data: partnerActivity } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', partnerProfile.id)
      .eq('activity_date', today)
      .single()

    const { data: partnerXpRows } = await supabase
      .from('xp_transactions')
      .select('amount')
      .eq('user_id', partnerProfile.id)
    const partnerTotalXp = partnerXpRows?.reduce((sum, r) => sum + r.amount, 0) ?? 0

    // Partner's today missions
    const { data: partnerMissions } = await supabase
      .from('missions')
      .select('id')
      .eq('mission_date', today)
      .or(`assigned_to.eq.${partnerProfile.id},assigned_to.is.null`)

    const partnerMissionIds = partnerMissions?.map(m => m.id) ?? []
    let partnerCompletedCount = 0
    if (partnerMissionIds.length > 0) {
      const { count } = await supabase
        .from('mission_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', partnerProfile.id)
        .in('mission_id', partnerMissionIds)
      partnerCompletedCount = count ?? 0
    }

    // Partner badges
    const { data: partnerBadges } = await supabase
      .from('user_badges')
      .select('badge_name')
      .eq('user_id', partnerProfile.id)

    const partnerTopBadge = getTopBadge(partnerBadges?.map(b => b.badge_name) ?? [])

    partnerData = {
      profile: partnerProfile,
      loginStreak: partnerActivity?.login_streak ?? 0,
      codingStreak: partnerActivity?.coding_streak ?? 0,
      totalXp: partnerTotalXp,
      missionTotal: partnerMissionIds.length,
      missionCompleted: partnerCompletedCount,
      topBadge: partnerTopBadge,
    }
  }

  // Weekly activity (last 7 days)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  })
  const { data: weekActivity } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('user_id', user.id)
    .in('activity_date', weekDates)

  const myTopBadge = getTopBadge(myBadgeNames)
  const nextBadge = getNextBadge(myTotalXp)

  return (
    <DashboardClient
      userId={user.id}
      myProfile={myProfile}
      todayMissions={todayMissions ?? []}
      myCompletions={myCompletions}
      myActivity={myActivity ?? null}
      myTotalXp={myTotalXp}
      myTodayXp={myTodayXp}
      myBadges={myBadgeNames}
      myTopBadge={myTopBadge}
      nextBadge={nextBadge}
      totalMissionsCompleted={totalCompleted ?? 0}
      partnerData={partnerData}
      weekActivity={weekActivity ?? []}
      today={today}
    />
  )
}

function getTopBadge(badges: string[]): { name: BadgeName; emoji: string } | null {
  const ordered: BadgeName[] = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze']
  for (const b of ordered) {
    if (badges.includes(b)) return { name: b, emoji: BADGE_EMOJIS[b] }
  }
  return null
}

function getNextBadge(xp: number): { name: BadgeName; emoji: string; threshold: number } | null {
  const ordered: BadgeName[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
  for (const b of ordered) {
    if (xp < BADGE_THRESHOLDS[b]) {
      return { name: b, emoji: BADGE_EMOJIS[b], threshold: BADGE_THRESHOLDS[b] }
    }
  }
  return null // All badges earned
}

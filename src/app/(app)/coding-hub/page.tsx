// app/(app)/coding-hub/page.tsx

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isEmailAllowed } from '@/lib/auth/allowlist'
import CodingHubClient from './CodingHubClient'
import { getTodayIST } from '@/lib/timezone'

export default async function CodingHubPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isEmailAllowed(user.email ?? '')) redirect('/access-denied')

  const today = getTodayIST()
  const now = new Date()
  const currentYear = parseInt(today.slice(0, 4))
  const currentMonth = parseInt(today.slice(5, 7))

  // Get both profiles
  const { data: profiles } = await supabase.from('profiles').select('*')
  const myProfile = profiles?.find(p => p.id === user.id) ?? null
  const partnerProfile = profiles?.find(p => p.id !== user.id) ?? null

  // Fetch last 6 months of activity for both users
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const startDate = sixMonthsAgo.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

  const { data: myActivity } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('user_id', user.id)
    .gte('activity_date', startDate)
    .order('activity_date', { ascending: false })

  let partnerActivity = null
  if (partnerProfile) {
    const { data } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', partnerProfile.id)
      .gte('activity_date', startDate)
      .order('activity_date', { ascending: false })
    partnerActivity = data
  }

  // Calculate streaks
  const myCurrentStreak = myActivity?.[0]?.coding_streak ?? 0
  const myLongestStreak = myActivity?.reduce((max, a) => Math.max(max, a.coding_streak), 0) ?? 0

  const partnerCurrentStreak = partnerActivity?.[0]?.coding_streak ?? 0
  const partnerLongestStreak = partnerActivity?.reduce((max, a) => Math.max(max, a.coding_streak), 0) ?? 0

  // Monthly stats
  const monthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`
  const myMonthActivity = myActivity?.filter(a => a.activity_date.startsWith(monthStr)) ?? []
  const partnerMonthActivity = partnerActivity?.filter(a => a.activity_date.startsWith(monthStr)) ?? []

  const myMonthCompleted = myMonthActivity.filter(a => a.all_missions_completed).length
  const partnerMonthCompleted = partnerMonthActivity.filter(a => a.all_missions_completed).length

  return (
    <CodingHubClient
      userId={user.id}
      myProfile={myProfile}
      partnerProfile={partnerProfile}
      myActivity={myActivity ?? []}
      partnerActivity={partnerActivity ?? []}
      myCurrentStreak={myCurrentStreak}
      myLongestStreak={myLongestStreak}
      partnerCurrentStreak={partnerCurrentStreak}
      partnerLongestStreak={partnerLongestStreak}
      myMonthCompleted={myMonthCompleted}
      partnerMonthCompleted={partnerMonthCompleted}
      today={today}
      currentYear={currentYear}
      currentMonth={currentMonth}
    />
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Flame, Target, Award, Users, Calendar, Zap, ArrowRight,
  Sparkles, Plus, ListChecks, Trophy, ChartColumn, Medal,
} from 'lucide-react'
import type { Profile, Mission, DailyActivity, BadgeName } from '@/types/database'
import { BADGE_THRESHOLDS, BADGE_EMOJIS } from '@/types/database'
import { formatDate } from '@/lib/timezone'
import { PandaBadgeIcon } from '@/components/PandaBadgeIcon'
import { MountainScene, Leaf, EmptyMissionsArt } from '@/components/ui/Illustrations'
import { StatCard } from '@/components/dashboard/StatCard'
import { XpRing } from '@/components/dashboard/XpRing'
import { BadgeList } from '@/components/dashboard/BadgeList'
import { WeeklyTracker } from '@/components/dashboard/WeeklyTracker'
import { MissionRow } from '@/components/dashboard/MissionRow'
import { Card } from '@/components/dashboard/Card'

interface PartnerData {
  profile: Profile
  loginStreak: number
  codingStreak: number
  totalXp: number
  missionTotal: number
  missionCompleted: number
  topBadge: { name: BadgeName; emoji: string } | null
}

interface Props {
  userId: string
  myProfile: Profile | null
  todayMissions: Mission[]
  myCompletions: string[]
  myActivity: DailyActivity | null
  myTotalXp: number
  myTodayXp: number
  myBadges: string[]
  myTopBadge: { name: BadgeName; emoji: string } | null
  nextBadge: { name: BadgeName; emoji: string; threshold: number } | null
  totalMissionsCompleted: number
  partnerData: PartnerData | null
  weekActivity: DailyActivity[]
  today: string
}

export default function DashboardClient({
  userId,
  myProfile,
  todayMissions: initialMissions,
  myCompletions: initialCompletions,
  myActivity,
  myTotalXp: initialXp,
  myTodayXp: initialTodayXp,
  myBadges: initialBadges,
  myTopBadge,
  nextBadge: initialNextBadge,
  totalMissionsCompleted,
  partnerData,
  weekActivity,
  today,
}: Props) {
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>(initialMissions)
  const [completions, setCompletions] = useState<Set<string>>(new Set(initialCompletions))
  const [totalXp, setTotalXp] = useState(initialXp)
  const [todayXp, setTodayXp] = useState(initialTodayXp)
  const [myBadges, setMyBadges] = useState<string[]>(initialBadges)
  // Sync missions when fresh server data arrives
useEffect(() => {
  setMissions(initialMissions)
}, [initialMissions])
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const nextBadge = getNextBadge(totalXp)
  const displayName = myProfile?.username || myProfile?.email?.split('@')[0] || 'Friend'
  const partnerName = partnerData?.profile?.username || partnerData?.profile?.email?.split('@')[0] || 'Partner'

  const completedCount = missions.filter(m => completions.has(m.id)).length
  const totalCount = missions.length
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  // Real-time synchronization
  useEffect(() => {
    const supabase = createClient()

    const missionsChannel = supabase
      .channel('dashboard-missions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_completions' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'xp_transactions' }, () => router.refresh())
      .subscribe()

    return () => {
      supabase.removeChannel(missionsChannel)
    }
  }, [router])

  async function toggleMission(missionId: string) {
    if (togglingId) return
    setTogglingId(missionId)

    try {
      const isCompleted = completions.has(missionId)
      const res = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, completed: !isCompleted, date: today }),
      })

      if (res.ok) {
        const data = await res.json()
        const newCompletions = new Set(completions)
        if (!isCompleted) {
          newCompletions.add(missionId)
        } else {
          newCompletions.delete(missionId)
        }
        setCompletions(newCompletions)

        if (data.newXp !== undefined) {
          // keep Today's XP in step with the change in total XP
          setTodayXp(prev => Math.max(0, prev + (data.newXp - totalXp)))
          setTotalXp(data.newXp)
        }
        if (data.badges) setMyBadges(data.badges)
      }
    } finally {
      setTogglingId(null)
    }
  }

  const pendingMissions = missions.filter(m => !completions.has(m.id))
  const completedMissions = missions.filter(m => completions.has(m.id))

  const ringPercent = nextBadge ? (totalXp / nextBadge.threshold) * 100 : 100
  const badgeProgress = nextBadge ? Math.min(100, (totalXp / nextBadge.threshold) * 100) : 100

  return (
    <div className="space-y-5 animate-fadeIn pb-10">
      {/* Welcome */}
      <section className="cc-card relative overflow-hidden rounded-[1.75rem] min-h-[190px]">
        <MountainScene className="absolute right-0 bottom-0 h-full w-full sm:w-[64%] opacity-35 sm:opacity-100 [mask-image:linear-gradient(to_right,transparent,black_38%)]" />
        <Leaf className="absolute right-2 top-2 w-12 h-12 hidden sm:block" rotate={140} />
        <div className="relative p-6 sm:p-7 max-w-xl">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#202820]">
            <Calendar className="w-4 h-4 text-[#176B35]" />
            {formatDate(today)}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#202820] mt-3 leading-tight">
            Welcome back, <span className="text-[#176B35] capitalize">{displayName}</span>! <span className="inline-block">👋</span>
          </h1>
          <p className="text-sm text-[#202820] mt-2">
            Here is your daily consistency status and partner progress.
          </p>
        </div>
      </section>

      {/* Statistics */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Zap className="w-6 h-6 fill-current" />}
          value={todayXp}
          unit="XP"
          label="Today's XP"
          tone="leaf"
        />
        <StatCard
          icon={<Trophy className="w-6 h-6" />}
          value={totalMissionsCompleted}
          label="Total Done"
          tone="sun"
        />
        <StatCard
          icon={<Flame className="w-6 h-6 fill-current" />}
          value={myActivity?.login_streak ?? 0}
          unit="d"
          label="Login Streak"
          tone="sun"
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          value={myActivity?.coding_streak ?? 0}
          unit="d"
          label="Coding Streak"
          tone="green"
        />
      </div>

      {/* XP · Badges · Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        <Card title="Total XP" icon={<ChartColumn className="w-5 h-5" />}>
          <XpRing
            totalXp={totalXp}
            percent={ringPercent}
            caption={nextBadge ? `${nextBadge.threshold - totalXp} XP to ${nextBadge.name}` : 'All badges unlocked!'}
          />
        </Card>

        <Card
          title="Panda Achievement Badges"
          icon={<Award className="w-5 h-5" />}
          action={
            myTopBadge ? (
              <span className="text-xs font-bold text-[#176B35] bg-[#E8F2DF] px-2.5 py-1 rounded-full whitespace-nowrap">
                {myTopBadge.name} {myTopBadge.emoji}
              </span>
            ) : undefined
          }
        >
          <BadgeList unlockedBadges={myBadges} />
        </Card>

        <div className="space-y-4 sm:space-y-5 lg:col-span-2 xl:col-span-1">
          <Card
            title={nextBadge ? `Progress to ${nextBadge.name}` : 'All badges unlocked'}
            icon={<Medal className="w-5 h-5" />}
            action={
              nextBadge ? (
                <span className="text-sm font-semibold text-[#202820] whitespace-nowrap">
                  {totalXp} / {nextBadge.threshold} XP
                </span>
              ) : undefined
            }
          >
            <div className="flex items-center gap-3">
              <PandaBadgeIcon variant={nextBadge?.name ?? 'Diamond'} unlocked size={44} />
              <div className="progress-bar flex-1" role="progressbar" aria-valuenow={Math.round(badgeProgress)} aria-valuemin={0} aria-valuemax={100}>
                <div className="progress-fill" style={{ width: `${badgeProgress}%` }} />
              </div>
            </div>
          </Card>

          <Card
            title="Weekly Consistency (Last 7 Days)"
            icon={<Calendar className="w-5 h-5" />}
          >
            <Link
              href="/coding-hub"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#176B35] hover:underline mb-3"
            >
              View Full Matrix <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <WeeklyTracker weekActivity={weekActivity} today={today} />
          </Card>
        </div>
      </div>

      {/* Partner progress */}
      {partnerData && (
        <Card
          title="Partner Progress"
          icon={<Users className="w-5 h-5" />}
          action={
            partnerData.topBadge ? (
              <span className="text-xs font-semibold text-[#687467]">
                {partnerData.topBadge.emoji} {partnerData.topBadge.name}
              </span>
            ) : undefined
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,260px)_1fr] gap-4 md:gap-8 items-center">
            <div className="flex items-center gap-3 bg-[#FAF8EF] p-3 rounded-2xl border border-[#E2E7D5] min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-[#176B35] flex items-center justify-center text-white font-bold text-base shadow-sm flex-shrink-0 overflow-hidden">
                {partnerData.profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={partnerData.profile.avatar_url} alt={partnerName} className="w-full h-full object-cover" />
                ) : (
                  partnerName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm text-[#202820] truncate capitalize">{partnerName}</div>
                <div className="text-xs text-[#687467] truncate">{partnerData.profile.email}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <PartnerStat label="Total XP" value={`${partnerData.totalXp} XP`} highlight />
              <PartnerStat label="Login Streak" value={`${partnerData.loginStreak} Days 🔥`} />
              <PartnerStat label="Coding Streak" value={`${partnerData.codingStreak} Days 💻`} />
              <div className="sm:col-span-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-[#687467] font-semibold">Today&apos;s Missions</span>
                  <span className="font-bold text-[#202820]">
                    {partnerData.missionCompleted}/{partnerData.missionTotal}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: partnerData.missionTotal > 0
                        ? `${(partnerData.missionCompleted / partnerData.missionTotal) * 100}%`
                        : '0%',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Today's Missions */}
      <Card
        title="Today's Missions"
        icon={<Target className="w-5 h-5" />}
        action={
          <span className="text-xs font-bold bg-[#E8F2DF] text-[#176B35] px-3 py-1 rounded-full whitespace-nowrap">
            {completedCount}/{totalCount} done
          </span>
        }
      >
        <div className="progress-bar mb-4" role="progressbar" aria-valuenow={Math.round(progressPct)} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        {totalCount === 0 ? (
          <div className="flex flex-col md:flex-row items-center gap-5 md:gap-0 py-3">
            <div className="flex flex-1 flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-center sm:text-left">
              <EmptyMissionsArt className="w-32 h-24 flex-shrink-0" />
              <div>
                <p className="text-base font-semibold text-[#202820]">No missions created for today.</p>
                <Link href="/missions" className="btn-primary mt-3">
                  <Plus className="w-4 h-4" /> Add your first mission
                </Link>
              </div>
            </div>
            <div className="hidden md:block self-stretch w-px bg-[#E2E7D5] mx-6" />
            <div className="flex items-center justify-center md:px-6">
              <Link href="/missions" className="btn-secondary">
                <ListChecks className="w-4 h-4" /> Manage all missions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              {pendingMissions.map(m => (
                <MissionRow
                  key={m.id}
                  mission={m}
                  completed={false}
                  toggling={togglingId === m.id}
                  onToggle={() => toggleMission(m.id)}
                />
              ))}
              {completedMissions.map(m => (
                <MissionRow
                  key={m.id}
                  mission={m}
                  completed={true}
                  toggling={togglingId === m.id}
                  onToggle={() => toggleMission(m.id)}
                />
              ))}
            </div>

            {completedCount === totalCount && (
              <div className="mt-4 p-3 bg-[#E8F2DF] border border-[#75B77A]/40 rounded-2xl text-center text-[#176B35] text-sm font-bold animate-popIn flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#176B35]" />
                <span>All missions complete! Exactly 10 XP credited today!</span>
              </div>
            )}

            <div className="pt-4 mt-4 border-t border-[#E2E7D5] flex justify-end">
              <Link href="/missions" className="btn-secondary">
                <ListChecks className="w-4 h-4" /> Manage all missions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

function PartnerStat({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-[#FAF8EF] border border-[#E2E7D5] px-3 py-2">
      <div className="text-[11px] font-semibold text-[#687467]">{label}</div>
      <div className={`font-extrabold ${highlight ? 'text-[#176B35]' : 'text-[#202820]'}`}>{value}</div>
    </div>
  )
}

function getNextBadge(xp: number): { name: BadgeName; emoji: string; threshold: number } | null {
  const ordered: BadgeName[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
  for (const b of ordered) {
    if (xp < BADGE_THRESHOLDS[b]) {
      return { name: b, emoji: BADGE_EMOJIS[b], threshold: BADGE_THRESHOLDS[b] }
    }
  }
  return null
}

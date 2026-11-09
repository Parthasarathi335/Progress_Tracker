'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Flame, Code2, Trophy, TrendingUp, Calendar, Sparkles } from 'lucide-react'
import type { DailyActivity, Profile } from '@/types/database'
import { PandaBadgeIcon } from '@/components/PandaBadgeIcon'

interface Props {
  userId: string
  myProfile: Profile | null
  partnerProfile: Profile | null
  myActivity: DailyActivity[]
  partnerActivity: DailyActivity[]
  myCurrentStreak: number
  myLongestStreak: number
  partnerCurrentStreak: number
  partnerLongestStreak: number
  myMonthCompleted: number
  partnerMonthCompleted: number
  today: string
  currentYear: number
  currentMonth: number
}

export default function CodingHubClient({
  userId,
  myProfile,
  partnerProfile,
  myActivity,
  partnerActivity,
  myCurrentStreak,
  myLongestStreak,
  partnerCurrentStreak,
  partnerLongestStreak,
  myMonthCompleted,
  partnerMonthCompleted,
  today,
  currentYear,
  currentMonth,
}: Props) {
  const [viewYear, setViewYear] = useState(currentYear)
  const [viewMonth, setViewMonth] = useState(currentMonth)

  const myName = myProfile?.username || myProfile?.email?.split('@')[0] || 'Me'
  const partnerName = partnerProfile?.username || partnerProfile?.email?.split('@')[0] || 'Partner'

  function prevMonth() {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    const isCurrentMonth = viewYear === currentYear && viewMonth === currentMonth
    if (isCurrentMonth) return
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }

  const monthLabel = new Date(viewYear, viewMonth - 1, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Count completed days this viewed month for each user
  const monthStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}`
  const myViewMonthCompleted = myActivity.filter(a =>
    a.activity_date.startsWith(monthStr) && a.all_missions_completed
  ).length
  const partnerViewMonthCompleted = partnerActivity.filter(a =>
    a.activity_date.startsWith(monthStr) && a.all_missions_completed
  ).length

  const daysInViewMonth = new Date(viewYear, viewMonth, 0).getDate()
  const myViewPct = daysInViewMonth > 0 ? Math.round((myViewMonthCompleted / daysInViewMonth) * 100) : 0
  const partnerViewPct = daysInViewMonth > 0 ? Math.round((partnerViewMonthCompleted / daysInViewMonth) * 100) : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header — Reference 2 Visual Style with Orange Highlights */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF5] rounded-3xl p-6 border border-[#E2E7D5] shadow-theme-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#176B35] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Two-Person Coding Streak Matrix
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820] mt-0.5">
            Coding Hub
          </h1>
          <p className="text-xs text-[#687467] mt-0.5">
            GitHub-contribution-inspired daily heatmap. Complete all daily missions to turn each day green!
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex items-center gap-2 bg-[#FAF8EF] border border-[#E2E7D5] px-4 py-2 rounded-2xl shadow-sm self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-[#FFFDF5] text-[#687467] hover:text-[#176B35] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-[#202820] px-2">{monthLabel}</span>
          <button
            onClick={nextMonth}
            disabled={viewYear === currentYear && viewMonth === currentMonth}
            className="p-1 rounded-lg hover:bg-[#FFFDF5] text-[#687467] hover:text-[#176B35] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Streak Overview Cards (Reference 2 Warm Orange Palette) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StreakStatCard
          label="My Current Streak"
          value={myCurrentStreak}
          suffix="Days"
          icon={<Flame className="w-5 h-5 text-[#176B35] fill-[#176B35]" />}
          bg="bg-[#F1F6E8]"
        />
        <StreakStatCard
          label="My Longest Streak"
          value={myLongestStreak}
          suffix="Days"
          icon={<Trophy className="w-5 h-5 text-[#F4B942]" />}
          bg="bg-[#FBF1D6]"
        />
        <StreakStatCard
          label={`${partnerName}'s Streak`}
          value={partnerCurrentStreak}
          suffix="Days"
          icon={<Flame className="w-5 h-5 text-[#75B77A] fill-[#75B77A]" />}
          bg="bg-[#F1F6E8]"
        />
        <StreakStatCard
          label={`${partnerName}'s Longest`}
          value={partnerLongestStreak}
          suffix="Days"
          icon={<Trophy className="w-5 h-5 text-[#176B35]" />}
          bg="bg-[#E8F2DF]"
        />
      </div>

      {/* Side-by-Side Dual Activity Heatmap Calendars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: My Calendar */}
        <ActivityCalendar
          name={myName}
          activity={myActivity}
          year={viewYear}
          month={viewMonth}
          today={today}
          currentStreak={myCurrentStreak}
          longestStreak={myLongestStreak}
          monthCompleted={myViewMonthCompleted}
          monthPct={myViewPct}
          isMe={true}
        />

        {/* Right: Partner's Calendar */}
        <ActivityCalendar
          name={partnerName}
          activity={partnerActivity}
          year={viewYear}
          month={viewMonth}
          today={today}
          currentStreak={partnerCurrentStreak}
          longestStreak={partnerLongestStreak}
          monthCompleted={partnerViewMonthCompleted}
          monthPct={partnerViewPct}
          isMe={false}
        />
      </div>

      {/* Collaborative Comparison Section */}
      <div className="bg-[#FFFDF5] rounded-3xl p-6 sm:p-7 border border-[#E2E7D5] shadow-theme-card space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#176B35]" />
          <h2 className="text-base font-bold text-[#202820]">Monthly Consistency Comparison</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="bg-[#FAF8EF] border border-[#E2E7D5] rounded-2xl p-4 text-center">
            <span className="text-xs text-[#687467] block mb-1">Current Coding Streak</span>
            <div className="flex items-center justify-center gap-3 text-sm font-bold text-[#202820]">
              <span className="text-[#176B35]">{myName}: {myCurrentStreak}d 🔥</span>
              <span className="text-[#C9D3BA]">|</span>
              <span className="text-[#202820]">{partnerName}: {partnerCurrentStreak}d 🔥</span>
            </div>
          </div>

          <div className="bg-[#FAF8EF] border border-[#E2E7D5] rounded-2xl p-4 text-center">
            <span className="text-xs text-[#687467] block mb-1">All-Time Longest Streak</span>
            <div className="flex items-center justify-center gap-3 text-sm font-bold text-[#202820]">
              <span className="text-[#176B35]">{myName}: {myLongestStreak}d 🏆</span>
              <span className="text-[#C9D3BA]">|</span>
              <span className="text-[#202820]">{partnerName}: {partnerLongestStreak}d 🏆</span>
            </div>
          </div>

          <div className="bg-[#FAF8EF] border border-[#E2E7D5] rounded-2xl p-4 text-center">
            <span className="text-xs text-[#687467] block mb-1">{monthLabel} Completed</span>
            <div className="flex items-center justify-center gap-3 text-sm font-bold text-[#202820]">
              <span className="text-[#176B35]">{myName}: {myViewPct}%</span>
              <span className="text-[#C9D3BA]">|</span>
              <span className="text-[#202820]">{partnerName}: {partnerViewPct}%</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#687467] text-center pt-2">
          💚 Collaborative partner habit-tracking: celebrate every milestone together!
        </p>
      </div>
    </div>
  )
}

function StreakStatCard({
  label,
  value,
  suffix,
  icon,
  bg,
}: {
  label: string
  value: number
  suffix: string
  icon: React.ReactNode
  bg: string
}) {
  return (
    <div className="bg-[#FFFDF5] rounded-2xl p-5 border border-[#E2E7D5] shadow-theme-card relative overflow-hidden group hover:shadow-theme-hover transition-all">
      <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center mb-3 shadow-sm`}>
        {icon}
      </div>
      <div className="text-2xl font-black text-[#202820]">{value} <span className="text-xs font-semibold text-[#687467]">{suffix}</span></div>
      <div className="text-xs font-semibold text-[#687467] mt-1">{label}</div>
    </div>
  )
}

function ActivityCalendar({
  name,
  activity,
  year,
  month,
  today,
  currentStreak,
  longestStreak,
  monthCompleted,
  monthPct,
  isMe,
}: {
  name: string
  activity: DailyActivity[]
  year: number
  month: number
  today: string
  currentStreak: number
  longestStreak: number
  monthCompleted: number
  monthPct: number
  isMe: boolean
}) {
  const daysInMonth = new Date(year, month, 0).getDate()
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const startOffset = (firstDayOfMonth + 6) % 7 // Monday = 0

  const activityMap = new Map<string, DailyActivity>()
  activity.forEach(a => activityMap.set(a.activity_date, a))

  const days = []
  for (let i = 0; i < startOffset; i++) {
    days.push({ type: 'empty', key: `empty-${i}` })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(month).padStart(2, '0')
    const dd = String(d).padStart(2, '0')
    const dateStr = `${year}-${mm}-${dd}`
    const act = activityMap.get(dateStr)
    const isToday = dateStr === today
    const isFuture = dateStr > today

    let status: 'green' | 'red' | 'grey' | 'empty'
    if (isFuture) {
      status = 'empty'
    } else if (isToday) {
      status = act?.all_missions_completed ? 'green' : 'grey'
    } else if (act?.all_missions_completed) {
      status = 'green'
    } else if (act?.login_completed) {
      status = 'red'
    } else {
      status = 'empty'
    }

    days.push({ type: 'day', key: dateStr, d, dateStr, status, isToday })
  }

  // Exact heatmap color palette specified in prompt:
  // Green: Completed day (#75B77A)
  // Red: Missed day (#FF7A7A)
  // Grey: Today in progress (#E8F2DF / #E2E7D5)
  // Light grey: Future day (#E2E7D5)
  const colorClass = {
    green: 'bg-[#75B77A] text-white font-bold shadow-sm',
    red: 'bg-[#FF7A7A] text-white font-medium',
    grey: 'bg-[#E8F2DF] border-2 border-[#176B35] text-[#176B35] font-bold',
    empty: 'bg-[#FAF8EF] border border-[#E2E7D5] text-[#9AA690]',
  }

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="bg-[#FFFDF5] rounded-3xl p-6 border border-[#E2E7D5] shadow-theme-card space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E2E7D5]">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold ${
            isMe ? 'bg-[#E8F2DF] text-[#176B35]' : 'bg-[#E8F2DF] text-[#176B35]'
          }`}>
            {name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="font-extrabold text-[#202820] text-sm capitalize">{name}&apos;s Calendar</h3>
            <span className="text-[11px] text-[#687467]">
              {monthCompleted} days done ({monthPct}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#176B35] bg-[#F1F6E8] px-3 py-1 rounded-full border border-[#E8F2DF]">
            {currentStreak}d Streak 🔥
          </span>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#9AA690]">
        {weekdays.map(d => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Contribution Heatmap Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map(day => {
          if (day.type === 'empty') {
            return <div key={day.key} className="aspect-square" />
          }

          const d = day as {
            type: string
            key: string
            d: number
            dateStr: string
            status: 'green' | 'red' | 'grey' | 'empty'
            isToday: boolean
          }
          const cls = colorClass[d.status]

          return (
            <div
              key={d.key}
              title={`${d.dateStr}: ${
                d.status === 'green' ? 'All daily missions completed! ✅' :
                d.status === 'red' ? 'Missions left incomplete after day ended ❌' :
                d.status === 'grey' ? 'Today in progress ⏳' : 'No activity recorded'
              }`}
              className={`aspect-square rounded-xl flex items-center justify-center text-xs transition-all hover:scale-105 cursor-default ${cls}`}
            >
              <span>{d.d}</span>
            </div>
          )
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="flex items-center justify-end gap-3 text-[11px] text-[#687467] pt-2 border-t border-[#E2E7D5]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-[#75B77A]" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-[#FF7A7A]" />
          <span>Missed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-[#E8F2DF] border border-[#176B35]" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-md bg-[#FAF8EF] border border-[#E2E7D5]" />
          <span>Future</span>
        </div>
      </div>
    </div>
  )
}

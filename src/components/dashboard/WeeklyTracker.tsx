import { Check, X } from 'lucide-react'
import type { DailyActivity } from '@/types/database'

type DayState = 'completed' | 'missed' | 'progress' | 'none'

export function WeeklyTracker({ weekActivity, today }: { weekActivity: DailyActivity[]; today: string }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
    const activity = weekActivity.find(a => a.activity_date === dateStr)
    const isToday = dateStr === today
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })

    let state: DayState = 'none'
    let label = 'No activity'
    if (isToday) {
      if (activity?.all_missions_completed) {
        state = 'completed'
        label = 'All complete today!'
      } else {
        state = 'progress'
        label = 'Today in progress'
      }
    } else if (activity?.all_missions_completed) {
      state = 'completed'
      label = 'All missions completed'
    } else if (activity?.login_completed) {
      state = 'missed'
      label = 'Incomplete day'
    }
    return { dateStr, dayName, state, isToday, label }
  })

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map(day => (
          <div
            key={day.dateStr}
            title={`${day.dateStr}: ${day.label}`}
            className={`flex flex-col items-center gap-1.5 rounded-xl border py-2 min-w-0 ${
              day.isToday ? 'border-[#176B35] bg-[#F1F6E8]' : 'border-[#E2E7D5] bg-[#FFFDF5]'
            }`}
          >
            <span className="text-[11px] font-bold text-[#202820]">{day.dayName}</span>
            <DayMark state={day.state} />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[11px] font-semibold text-[#687467]">
        <Legend><DayMark state="completed" small /> Completed</Legend>
        <Legend><DayMark state="missed" small /> Missed</Legend>
        <Legend><DayMark state="progress" small /> In progress</Legend>
      </div>
    </div>
  )
}

function Legend({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5">{children}</span>
}

function DayMark({ state, small = false }: { state: DayState; small?: boolean }) {
  const size = small ? 'w-4 h-4' : 'w-6 h-6'
  const icon = small ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'
  if (state === 'completed') {
    return (
      <span className={`${size} rounded-full bg-[#176B35] text-white flex items-center justify-center`}>
        <Check className={`${icon} stroke-[3]`} />
      </span>
    )
  }
  if (state === 'missed') {
    return (
      <span className={`${size} rounded-full bg-[#C0463E] text-white flex items-center justify-center`}>
        <X className={`${icon} stroke-[3]`} />
      </span>
    )
  }
  if (state === 'progress') {
    return <span className={`${size} rounded-full border-2 border-[#75B77A] bg-[#E8F2DF]`} />
  }
  return <span className={`${size} rounded-full border-2 border-[#D5DDC6]`} />
}

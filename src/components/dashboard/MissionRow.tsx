import { Check } from 'lucide-react'
import type { Mission } from '@/types/database'

interface MissionRowProps {
  mission: Mission
  completed: boolean
  toggling: boolean
  onToggle: () => void
}

export function MissionRow({ mission, completed, toggling, onToggle }: MissionRowProps) {
  return (
    <div
      onClick={onToggle}
      className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
        completed
          ? 'bg-[#F6F5EA] border-[#E2E7D5] opacity-70'
          : 'bg-[#FFFDF5] border-[#E2E7D5] hover:border-[#75B77A] hover:shadow-sm'
      }`}
    >
      <button
        type="button"
        disabled={toggling}
        aria-label={completed ? 'Mark mission as not done' : 'Mark mission as done'}
        className={`flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
          completed
            ? 'bg-[#176B35] border-[#176B35] text-white shadow-sm'
            : 'border-[#C9D3BA] hover:border-[#176B35]'
        }`}
      >
        {toggling ? (
          <div className="w-3 h-3 border-2 border-[#176B35] border-t-transparent rounded-full animate-spin" />
        ) : completed ? (
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        ) : null}
      </button>

      <span className="text-xl flex-shrink-0">{mission.emoji}</span>

      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold truncate ${completed ? 'line-through text-[#687467]' : 'text-[#202820]'}`}>
          {mission.title}
        </div>
        {mission.description && (
          <div className="text-xs text-[#687467] truncate mt-0.5">{mission.description}</div>
        )}
      </div>
    </div>
  )
}

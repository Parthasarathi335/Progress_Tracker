import { PandaMascot } from '@/components/PandaBadgeIcon'

interface XpRingProps {
  totalXp: number
  /** 0–100 */
  percent: number
  caption?: string
}

export function XpRing({ totalXp, percent, caption }: XpRingProps) {
  const r = 44
  const circ = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = circ * (1 - clamped / 100)

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-56 h-56 max-w-full">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#E8F2DF" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#176B35"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            className="xp-ring-progress"
            style={{ ['--ring-circ' as string]: circ, ['--ring-offset' as string]: offset }}
          />
        </svg>

        {/* sparkles */}
        <span className="absolute -top-1 right-6 text-[#F4B942] text-lg">✦</span>
        <span className="absolute top-8 -left-1 text-[#F4B942] text-xl">✦</span>
        <span className="absolute bottom-6 right-0 text-[#F4B942] text-sm">✦</span>
        <span className="absolute bottom-3 left-6 text-[#F4B942] text-sm">✦</span>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <PandaMascot className="w-20 h-20 -mb-1" />
          <div className="text-2xl font-extrabold text-[#202820] leading-tight">{totalXp} XP</div>
          <div className="text-xs font-semibold text-[#687467]">Total XP</div>
        </div>
      </div>
      {caption && <p className="mt-2 text-xs font-semibold text-[#687467] text-center">{caption}</p>}
    </div>
  )
}

import type { ReactNode } from 'react'

interface StatCardProps {
  icon: ReactNode
  value: ReactNode
  unit?: string
  label: string
  tone?: 'green' | 'sun' | 'leaf'
}

const TONES = {
  green: 'bg-[#E8F2DF] text-[#176B35]',
  sun: 'bg-[#FBEFD0] text-[#C98A0B]',
  leaf: 'bg-[#E8F2DF] text-[#4E9A5B]',
}

export function StatCard({ icon, value, unit, label, tone = 'green' }: StatCardProps) {
  return (
    <div className="cc-card cc-card-hover rounded-2xl p-4 flex items-center gap-4 min-w-0">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${TONES[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-extrabold text-[#202820] leading-none">{value}</span>
          {unit && <span className="text-sm font-bold text-[#176B35]">{unit}</span>}
        </div>
        <div className="text-xs font-semibold text-[#687467] mt-1 leading-tight">{label}</div>
      </div>
    </div>
  )
}

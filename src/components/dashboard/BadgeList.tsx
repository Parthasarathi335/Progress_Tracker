import { Check } from 'lucide-react'
import { PandaBadgeIcon } from '@/components/PandaBadgeIcon'
import { BADGE_THRESHOLDS } from '@/types/database'
import type { BadgeName } from '@/types/database'

const TIERS: BadgeName[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']

const PILL: Record<BadgeName, string> = {
  Bronze: 'bg-[#F3D9BE] text-[#8A4B16]',
  Silver: 'bg-[#E3E6DE] text-[#4B534A]',
  Gold: 'bg-[#FBE7A6] text-[#8A6100]',
  Platinum: 'bg-[#CBE8DD] text-[#1E6B58]',
  Diamond: 'bg-[#176B35] text-white',
}

export function BadgeList({ unlockedBadges }: { unlockedBadges: string[] }) {
  return (
    <ul className="divide-y divide-[#E2E7D5]">
      {TIERS.map(name => {
        const unlocked = unlockedBadges.includes(name)
        return (
          <li key={name} className="flex items-center gap-3 py-2.5">
            <PandaBadgeIcon variant={name} unlocked size={40} />
            <span className={`text-sm font-extrabold px-3 py-0.5 rounded-lg ${PILL[name]}`}>{name}</span>
            {unlocked && (
              <span
                title="Unlocked"
                className="w-5 h-5 rounded-full bg-[#176B35] text-white flex items-center justify-center"
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
            <span className="ml-auto text-sm font-semibold text-[#202820] whitespace-nowrap">
              {BADGE_THRESHOLDS[name]} XP
            </span>
          </li>
        )
      })}
    </ul>
  )
}

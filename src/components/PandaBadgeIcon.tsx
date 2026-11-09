import React from 'react'

export type PandaBadgeVariant = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'streak' | 'workout' | 'fire'

interface PandaBadgeIconProps {
  variant: PandaBadgeVariant | string
  unlocked?: boolean
  className?: string
  size?: number
}

export function PandaBadgeIcon({ variant, unlocked = true, className = '', size = 56 }: PandaBadgeIconProps) {
  const normVariant = variant.toLowerCase()

  // Background and diamond accent colors inspired by the badge tiers
  const isBronze = normVariant.includes('bronze')
  const isSilver = normVariant.includes('silver')
  const isGold = normVariant.includes('gold')
  const isPlatinum = normVariant.includes('platinum')
  const isDiamond = normVariant.includes('diamond')
  const isStreak = normVariant.includes('streak') || normVariant.includes('fire')

  let diamondFill = '#FFB039'
  let diamondStroke = '#176B35'
  let bgGradient = 'from-amber-400 to-amber-500'

  if (isBronze) {
    diamondFill = '#E59866'
    diamondStroke = '#BA4A00'
    bgGradient = 'from-amber-600 to-amber-700'
  } else if (isSilver) {
    diamondFill = '#D5D8DC'
    diamondStroke = '#7F8C8D'
    bgGradient = 'from-slate-300 to-slate-400'
  } else if (isGold) {
    diamondFill = '#F4D03F'
    diamondStroke = '#D4AC0D'
    bgGradient = 'from-amber-300 to-yellow-500'
  } else if (isPlatinum) {
    diamondFill = '#A2D9CE'
    diamondStroke = '#48C9B0'
    bgGradient = 'from-teal-300 to-cyan-500'
  } else if (isDiamond) {
    diamondFill = '#AED6F1'
    diamondStroke = '#5DADE2'
    bgGradient = 'from-blue-300 to-indigo-500'
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-200 ${
        unlocked ? 'hover:scale-105' : 'opacity-40 grayscale'
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Diamond badge background  */}
        <g transform="translate(50, 50) rotate(45)">
          <rect
            x="-36"
            y="-36"
            width="72"
            height="72"
            rx="16"
            fill={unlocked ? diamondFill : '#E0E0E0'}
            stroke={unlocked ? diamondStroke : '#BDBDBD'}
            strokeWidth="3.5"
          />
          {/* Inner glossy highlight */}
          <rect
            x="-30"
            y="-30"
            width="60"
            height="60"
            rx="12"
            fill="none"
            stroke="white"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
        </g>

        {/* Panda Character sitting on / emerging from badge */}
        <g>
          {/* Ears */}
          <circle cx="32" cy="30" r="11" fill="#202820" />
          <circle cx="32" cy="30" r="6" fill="#2E3A2E" />
          <circle cx="68" cy="30" r="11" fill="#202820" />
          <circle cx="68" cy="30" r="6" fill="#2E3A2E" />

          {/* Panda Head */}
          <ellipse cx="50" cy="50" rx="28" ry="24" fill="#FFFFFF" stroke="#202820" strokeWidth="2.5" />

          {/* Eye Patches */}
          <ellipse cx="40" cy="48" rx="8" ry="10" fill="#202820" transform="rotate(-15 40 48)" />
          <ellipse cx="60" cy="48" rx="8" ry="10" fill="#202820" transform="rotate(15 60 48)" />

          {/* Eyes (Cute / Winking depending on tier) */}
          {isDiamond || isGold ? (
            <>
              {/* Star / Sparkle eyes for High Tier */}
              <circle cx="41" cy="47" r="3.5" fill="#FFFFFF" />
              <circle cx="59" cy="47" r="3.5" fill="#FFFFFF" />
              <circle cx="41.5" cy="47" r="1.5" fill="#202820" />
              <circle cx="59.5" cy="47" r="1.5" fill="#202820" />
            </>
          ) : isSilver ? (
            <>
              {/* Cool Winking eye */}
              <circle cx="40" cy="47" r="3" fill="#FFFFFF" />
              <circle cx="40" cy="47" r="1.5" fill="#202820" />
              <path d="M57 48 Q61 44 64 48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            </>
          ) : (
            <>
              {/* Happy round eyes */}
              <circle cx="40" cy="47" r="3" fill="#FFFFFF" />
              <circle cx="40" cy="47" r="1.5" fill="#202820" />
              <circle cx="60" cy="47" r="3" fill="#FFFFFF" />
              <circle cx="60" cy="47" r="1.5" fill="#202820" />
            </>
          )}

          {/* Cheeks */}
          <circle cx="31" cy="54" r="4.5" fill="#FFB4A2" opacity="0.6" />
          <circle cx="69" cy="54" r="4.5" fill="#FFB4A2" opacity="0.6" />

          {/* Nose */}
          <ellipse cx="50" cy="53" rx="3.5" ry="2.5" fill="#202820" />

          {/* Mouth */}
          <path d="M46 56 Q50 60 54 56" stroke="#202820" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Accessories  */}
          {/* Green Cap for Silver / Streak */}
          {(isSilver || isStreak) && (
            <path
              d="M32 38 Q50 24 68 38 L72 37 Q50 18 28 37 Z"
              fill="#176B35"
              stroke="#0F5127"
              strokeWidth="1.5"
            />
          )}

          {/* Sunglasses for Gold */}
          {isGold && (
            <g>
              <rect x="33" y="44" width="14" height="9" rx="2" fill="#202820" />
              <rect x="53" y="44" width="14" height="9" rx="2" fill="#202820" />
              <line x1="47" y1="47" x2="53" y2="47" stroke="#202820" strokeWidth="2" />
              {/* Pixel glass highlight */}
              <rect x="35" y="46" width="3" height="2" fill="#FFFFFF" />
              <rect x="55" y="46" width="3" height="2" fill="#FFFFFF" />
            </g>
          )}

          {/* Small Paws holding badge */}
          <ellipse cx="36" cy="69" rx="6" ry="5" fill="#202820" />
          <ellipse cx="64" cy="69" rx="6" ry="5" fill="#202820" />

          {/* Calendar / Milestone sign in paws for Platinum/Diamond */}
          {(isPlatinum || isDiamond) && (
            <rect
              x="42"
              y="62"
              width="16"
              height="14"
              rx="3"
              fill="#FFFFFF"
              stroke="#176B35"
              strokeWidth="1.5"
            />
          )}
          {isPlatinum && (
            <text x="50" y="72" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#176B35">
              750
            </text>
          )}
          {isDiamond && (
            <text x="50" y="72" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#2980B9">
              1K
            </text>
          )}
        </g>

        {/* Lock overlay if locked */}
        {!unlocked && (
          <g transform="translate(68, 68)">
            <circle cx="8" cy="8" r="10" fill="#202820" fillOpacity="0.75" />
            <path
              d="M5 8 V6 A3 3 0 0 1 11 6 V8 M4 8 H12 V13 H4 Z"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>
    </div>
  )
}

export function PandaMascot({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" aria-hidden="true">
        {/* Green backpack (behind body) */}
        <rect x="30" y="70" width="60" height="38" rx="14" fill="#176B35" />
        <rect x="42" y="84" width="36" height="16" rx="6" fill="#0F5127" />
        <rect x="46" y="88" width="28" height="3" rx="1.5" fill="#75B77A" />

        {/* Ears */}
        <circle cx="36" cy="30" r="13" fill="#202820" />
        <circle cx="36" cy="30" r="7" fill="#3A463A" />
        <circle cx="84" cy="30" r="13" fill="#202820" />
        <circle cx="84" cy="30" r="7" fill="#3A463A" />

        {/* Body */}
        <ellipse cx="60" cy="88" rx="26" ry="22" fill="#FFFFFF" stroke="#202820" strokeWidth="2.5" />
        {/* Backpack straps */}
        <path d="M44 72 Q42 90 46 106" stroke="#176B35" strokeWidth="5" strokeLinecap="round" />
        <path d="M76 72 Q78 90 74 106" stroke="#176B35" strokeWidth="5" strokeLinecap="round" />

        {/* Head */}
        <ellipse cx="60" cy="50" rx="34" ry="29" fill="#FFFFFF" stroke="#202820" strokeWidth="3" />

        {/* Eye patches */}
        <ellipse cx="46" cy="49" rx="9.5" ry="11.5" fill="#202820" transform="rotate(-15 46 49)" />
        <ellipse cx="74" cy="49" rx="9.5" ry="11.5" fill="#202820" transform="rotate(15 74 49)" />

        {/* Eyes */}
        <circle cx="47" cy="47" r="4" fill="#FFFFFF" />
        <circle cx="73" cy="47" r="4" fill="#FFFFFF" />
        <circle cx="48" cy="47" r="2.2" fill="#202820" />
        <circle cx="72" cy="47" r="2.2" fill="#202820" />

        {/* Cheeks */}
        <circle cx="35" cy="58" r="5.5" fill="#F4B942" opacity="0.45" />
        <circle cx="85" cy="58" r="5.5" fill="#F4B942" opacity="0.45" />

        {/* Nose & mouth */}
        <ellipse cx="60" cy="56" rx="4" ry="3" fill="#202820" />
        <path d="M55 60 Q60 65 65 60" stroke="#202820" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Paws */}
        <ellipse cx="32" cy="84" rx="7" ry="8" fill="#202820" transform="rotate(-20 32 84)" />
        <ellipse cx="88" cy="84" rx="7" ry="8" fill="#202820" transform="rotate(20 88 84)" />

        {/* Little leaf on head */}
        <path d="M60 21 Q66 10 76 12 Q74 22 62 23 Z" fill="#75B77A" />
        <path d="M60 22 Q66 17 72 14" stroke="#176B35" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

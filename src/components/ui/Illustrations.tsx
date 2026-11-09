import { PandaMascot } from '@/components/PandaBadgeIcon'

// Decorative nature illustrations — pure SVG, no external assets.

export function MountainScene({ className = '', showSun = true }: { className?: string; showSun?: boolean }) {
  return (
    <svg
      viewBox="0 0 640 200"
      preserveAspectRatio="xMaxYMax slice"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {/* sky glow + sun */}
      {showSun && (
        <>
          <circle cx="470" cy="66" r="56" fill="#F4B942" opacity="0.16" />
          <circle cx="470" cy="66" r="30" fill="#F4B942" opacity="0.9" />
        </>
      )}
      {/* clouds */}
      <g fill="#FFFDF5" opacity="0.95">
        <ellipse cx="190" cy="42" rx="34" ry="9" />
        <ellipse cx="214" cy="35" rx="22" ry="9" />
        <ellipse cx="352" cy="30" rx="28" ry="7" />
      </g>
      {/* far ridge */}
      <path d="M0 150 L90 92 L150 128 L230 64 L330 140 L410 96 L500 138 L580 90 L640 120 L640 200 L0 200 Z" fill="#D5E8CB" />
      {/* mid mountains */}
      <path d="M0 168 L80 118 L140 150 L230 88 L320 156 L400 118 L480 156 L560 112 L640 146 L640 200 L0 200 Z" fill="#9CCB9B" />
      <path d="M230 88 L214 106 L226 103 L233 111 L243 102 L250 106 Z" fill="#FFFDF5" opacity="0.85" />
      {/* near hills */}
      <path d="M0 200 L0 168 Q110 144 230 168 T460 164 T640 156 L640 200 Z" fill="#75B77A" />
      <path d="M0 200 L0 186 Q160 166 320 186 T640 180 L640 200 Z" fill="#5FA568" />
      {/* pines */}
      <g fill="#176B35">
        <path d="M70 184 L82 148 L94 184 Z" />
        <path d="M88 186 L102 142 L116 186 Z" />
        <path d="M118 186 L128 158 L138 186 Z" />
        <path d="M540 184 L552 150 L564 184 Z" />
        <path d="M560 186 L574 140 L588 186 Z" />
        <path d="M594 186 L604 158 L614 186 Z" />
      </g>
    </svg>
  )
}

export function Leaf({ className = '', rotate = 0 }: { className?: string; rotate?: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
      aria-hidden="true"
    >
      <path d="M6 34 Q4 12 30 6 Q36 30 12 34 Z" fill="#75B77A" />
      <path d="M8 32 Q18 20 28 10" stroke="#176B35" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export function EmptyMissionsArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} fill="none" aria-hidden="true">
      <ellipse cx="100" cy="124" rx="70" ry="8" fill="#E8F2DF" />
      {/* clipboard */}
      <rect x="58" y="24" width="84" height="96" rx="12" fill="#FFFDF5" stroke="#CFE3C4" strokeWidth="3" />
      <rect x="82" y="16" width="36" height="16" rx="6" fill="#75B77A" />
      <rect x="72" y="52" width="14" height="14" rx="4" fill="#E8F2DF" stroke="#75B77A" strokeWidth="2" />
      <rect x="94" y="56" width="36" height="6" rx="3" fill="#E2E7D5" />
      <rect x="72" y="78" width="14" height="14" rx="4" fill="#E8F2DF" stroke="#75B77A" strokeWidth="2" />
      <rect x="94" y="82" width="28" height="6" rx="3" fill="#E2E7D5" />
      <rect x="72" y="104" width="14" height="8" rx="4" fill="#E8F2DF" />
      {/* leaves */}
      <path d="M150 112 Q146 88 172 82 Q176 108 154 112 Z" fill="#75B77A" />
      <path d="M44 112 Q40 94 24 92 Q22 108 40 112 Z" fill="#9CCB9B" />
      {/* sparkle */}
      <path d="M156 36 L159 44 L167 47 L159 50 L156 58 L153 50 L145 47 L153 44 Z" fill="#F4B942" />
    </svg>
  )
}

// Sidebar scene: tree, grassy hill and the panda mascot sitting with a green backpack.

export function TreePandaScene({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <svg viewBox="0 0 240 220" className="absolute inset-0 w-full h-full" fill="none" preserveAspectRatio="xMidYMax meet">
        {/* trunk */}
        <path d="M34 220 Q30 150 40 96 L52 96 Q50 150 62 220 Z" fill="#8B6B4A" />
        <path d="M40 120 Q20 110 10 92" stroke="#8B6B4A" strokeWidth="7" strokeLinecap="round" />
        {/* foliage */}
        <g>
          <circle cx="40" cy="70" r="40" fill="#75B77A" />
          <circle cx="12" cy="88" r="28" fill="#5FA568" />
          <circle cx="70" cy="86" r="30" fill="#8CC78E" />
          <circle cx="44" cy="44" r="26" fill="#9CD39B" />
        </g>
        {/* ground */}
        <path d="M0 220 L0 186 Q70 168 140 184 T240 178 L240 220 Z" fill="#8CC78E" />
        <path d="M0 220 L0 204 Q90 190 240 200 L240 220 Z" fill="#5FA568" />
        {/* flowers */}
        <circle cx="190" cy="206" r="3" fill="#F4B942" />
        <circle cx="196" cy="208" r="2.5" fill="#FFFDF5" />
        <circle cx="120" cy="210" r="2.5" fill="#F4B942" />
      </svg>
      <PandaMascot className="absolute w-28 h-28 left-[44%] -bottom-1" />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bell, Menu, User } from 'lucide-react'
import Navigation from '@/components/Navigation'
import { PandaMascot } from '@/components/PandaBadgeIcon'
import type { Profile } from '@/types/database'

interface AppShellProps {
  profile: Profile | null
  loginStreak: number
  pendingMissions: number
  children: React.ReactNode
}

export default function AppShell({ profile, loginStreak, pendingMissions, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const displayName = profile?.username || profile?.email?.split('@')[0] || 'Member'

  return (
    <div className="min-h-screen bg-[#FAF8EF] text-[#202820] flex antialiased">
      <Navigation
        profile={profile}
        loginStreak={loginStreak}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16 bg-[#FAF8EF]/90 backdrop-blur-md">
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="p-2 -ml-2 rounded-xl text-[#202820] hover:bg-[#E8F2DF]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-1.5 font-black text-[#202820]">
              <PandaMascot className="w-8 h-8" />
              <span className="hidden min-[380px]:inline">Consistency Club</span>
            </Link>
          </div>
          <div className="hidden md:block" />

          <div className="flex items-center gap-3">
            <Link
              href="/missions"
              aria-label={pendingMissions > 0 ? `${pendingMissions} missions still to do` : 'Daily missions'}
              title={pendingMissions > 0 ? `${pendingMissions} missions still to do today` : 'Daily missions'}
              className="relative p-2.5 rounded-full text-[#202820] hover:bg-[#E8F2DF] transition-colors"
            >
              <Bell className="w-5 h-5" />
              {pendingMissions > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#75B77A] ring-2 ring-[#FAF8EF]" />
              )}
            </Link>
            <div
              title={displayName}
              className="w-10 h-10 rounded-full bg-[#176B35] text-white flex items-center justify-center overflow-hidden shadow-theme-pill"
            >
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 pb-8 max-w-[1500px] w-full mx-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

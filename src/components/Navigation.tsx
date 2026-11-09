'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import {
  LayoutDashboard, Code2, CheckSquare, LogOut, Flame, X,
  ChevronDown, PanelLeftClose, PanelLeftOpen,
} from 'lucide-react'
import { PandaMascot } from '@/components/PandaBadgeIcon'
import { Leaf, TreePandaScene } from '@/components/ui/Illustrations'

interface NavigationProps {
  profile: Profile | null
  loginStreak: number
  collapsed: boolean
  onToggleCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/coding-hub', label: 'Coding Hub', icon: Code2 },
  { href: '/missions', label: 'Daily Missions', icon: CheckSquare },
]

export default function Navigation({
  profile,
  loginStreak,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: NavigationProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen z-30 transition-[width] duration-300 ${
          collapsed ? 'w-[84px]' : 'w-64 lg:w-72'
        }`}
      >
        <SidebarBody
          profile={profile}
          loginStreak={loginStreak}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-[#202820]/40 animate-fadeIn"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-[18rem] max-w-[85vw] bg-[#FAF8EF] shadow-theme-modal animate-drawerIn flex flex-col">
            <button
              onClick={onMobileClose}
              aria-label="Close menu"
              className="absolute top-3 right-3 z-10 p-2 rounded-xl text-[#687467] hover:bg-[#E8F2DF]"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarBody
              profile={profile}
              loginStreak={loginStreak}
              collapsed={false}
              onNavigate={onMobileClose}
            />
          </aside>
        </div>
      )}
    </>
  )
}

function SidebarBody({
  profile,
  loginStreak,
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  profile: Profile | null
  loginStreak: number
  collapsed: boolean
  onToggleCollapse?: () => void
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [memberOpen, setMemberOpen] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const displayName = profile?.username || profile?.email?.split('@')[0] || 'Member'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="relative flex flex-col h-full overflow-hidden px-4 pt-5 pb-0">
      <Leaf className="absolute -top-2 -left-3 w-14 h-14 pointer-events-none" rotate={-20} />

      {/* Brand */}
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className={`relative flex flex-col items-center text-center group ${collapsed ? 'gap-0' : 'gap-1'}`}
      >
        <PandaMascot className={`${collapsed ? 'w-12 h-12' : 'w-20 h-20'} transition-all group-hover:scale-105`} />
        {!collapsed && (
          <>
            <span className="font-black text-[#202820] text-xl tracking-tight leading-tight">Consistency Club</span>
            <span className="mt-1 text-xs font-bold text-white bg-[#176B35] px-3.5 py-1 rounded-full">
              2-Friend Edition
            </span>
          </>
        )}
      </Link>

      <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#C9D3BA] to-transparent" />

      {/* Links */}
      <nav className="space-y-1.5" aria-label="Main">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              title={collapsed ? label : undefined}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-2xl text-[15px] font-bold transition-all duration-200 ${
                collapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'
              } ${
                active
                  ? 'bg-[#176B35] text-white shadow-[0_8px_18px_-8px_rgba(23,107,53,0.7)]'
                  : 'text-[#202820] hover:bg-[#E8F2DF] hover:text-[#176B35]'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Member */}
      <div className="mt-6">
        {!collapsed && (
          <span className="text-xs font-extrabold tracking-wider text-[#687467] px-2 block mb-2">ME</span>
        )}
        <button
          type="button"
          onClick={() => setMemberOpen(o => !o)}
          aria-expanded={memberOpen}
          title={collapsed ? displayName : undefined}
          className={`w-full flex items-center gap-3 rounded-2xl hover:bg-[#E8F2DF] transition-colors ${
            collapsed ? 'justify-center py-2.5' : 'px-3 py-2.5'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-[#E8F2DF] border border-[#C9D3BA] flex items-center justify-center text-[#176B35] font-extrabold text-xs flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          {!collapsed && (
            <>
              <span className="text-[15px] font-bold text-[#202820] truncate capitalize text-left flex-1">
                {displayName}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#687467] transition-transform ${memberOpen ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>

        {memberOpen && (
          <div className="mt-2 rounded-2xl bg-[#FFFDF5] border border-[#E2E7D5] p-3 space-y-2 animate-fadeIn">
            {!collapsed && profile?.email && (
              <p className="text-xs text-[#687467] truncate">{profile.email}</p>
            )}
            {loginStreak > 0 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#C98A0B]">
                <Flame className="w-4 h-4 fill-current" /> {loginStreak} day login streak
              </div>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Sign out"
              className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold text-[#C0463E] hover:bg-[#FBEDEB] transition-colors disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && 'Sign out'}
            </button>
          </div>
        )}
      </div>

      {/* Illustration + collapse toggle */}
      <div className="mt-auto relative -mx-4">
        {!collapsed && <TreePandaScene className="h-52 w-full" />}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`absolute z-10 p-2 rounded-xl bg-[#FFFDF5]/90 border border-[#E2E7D5] text-[#176B35] hover:bg-[#E8F2DF] transition-colors ${
              collapsed ? 'bottom-4 left-1/2 -translate-x-1/2' : 'bottom-3 right-3'
            }`}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  )
}

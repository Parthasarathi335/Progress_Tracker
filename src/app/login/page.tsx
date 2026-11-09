'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { PandaMascot } from '@/components/PandaBadgeIcon'
import { MountainScene } from '@/components/ui/Illustrations'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
        return
      }

      if (!data.user) {
        setError('Login failed. Please try again.')
        setLoading(false)
        return
      }

      // Server-side validation happens via the middleware allowlist.
      // Record login streak via API route.
      await fetch('/api/auth/login', { method: 'POST' })

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8EF] flex items-center justify-center p-4 relative overflow-hidden">
      <MountainScene showSun={false} className="absolute bottom-0 left-0 w-full h-48 sm:h-64 pointer-events-none" />

      <div className="relative w-full max-w-md z-10 animate-popIn">
        {/* Brand Header with Panda Mascot */}
        <div className="text-center mb-6">
          <div className="inline-block relative">
            <PandaMascot className="w-24 h-24 mx-auto" />
            <div className="absolute -bottom-1 -right-1 bg-[#FFFDF5] p-1 rounded-full shadow-md">
              <span className="text-xs">🔥</span>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-[#202820] tracking-tight mt-2">
            Consistency Club
          </h1>
          <p className="text-sm text-[#687467] mt-1 flex items-center justify-center gap-1.5">
            <span>Stay consistent, grow together</span>
            <Sparkles className="w-3.5 h-3.5 text-[#176B35]" />
          </p>
        </div>

        {/* Pure White Card with Soft Orange Border & Shadow */}
        <div className="bg-[#FFFDF5] rounded-[28px] p-8 shadow-[0_12px_40px_-8px_rgba(23,107,53,0.14)] border border-[#E2E7D5]">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-[#202820]">Welcome back 👋</h2>
            <p className="text-xs text-[#687467] mt-0.5">Enter your credentials to access your daily hub</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-[#202820] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF8EF] border border-[#E2E7D5] text-[#202820] placeholder-[#9AA690] text-sm focus:outline-none focus:border-[#176B35] focus:ring-2 focus:ring-[#176B35]/15 transition-all"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-[#202820] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF8EF] border border-[#E2E7D5] text-[#202820] placeholder-[#9AA690] text-sm focus:outline-none focus:border-[#176B35] focus:ring-2 focus:ring-[#176B35]/15 transition-all pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#687467] hover:text-[#202820] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-[#FFF0F0] border border-[#FFD3D3] rounded-2xl text-[#E03E3E] text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Button with Vibrant Orange Gradient */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#176B35] hover:bg-[#0F5127] text-white font-bold text-sm shadow-[0_8px_20px_-4px_rgba(23,107,53,0.4)] hover:shadow-[0_12px_24px_-4px_rgba(23,107,53,0.5)] transition-all flex items-center justify-center gap-2 group mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Consistency Club</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E2E7D5] text-center">
            <p className="text-xs text-[#687467]">
              🔒 Private two-member portal • Authorized access only
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

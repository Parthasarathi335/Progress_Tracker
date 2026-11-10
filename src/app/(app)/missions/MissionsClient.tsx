'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Plus, Flame, Check, Pencil, Trash2,
  Clock, Users, X, AlertTriangle, Calendar, Sparkles
} from 'lucide-react'
import type { Mission, Profile } from '@/types/database'
import { formatDate } from '@/lib/timezone'

const EMOJI_OPTIONS = ['🐍', '💻', '📚', '🚀', '🔁', '🎯', '⚡', '🧠', '📝', '🔥', '💡', '🛠️', '🌟', '📊', '💧']

interface Props {
  userId: string
  myProfile: Profile | null
  partnerProfile: Profile | null
  initialMissions: Mission[]
  initialCompletions: string[]
  loginStreak: number
  codingStreak: number
  partnerProgress: { total: number; completed: number }
  today: string
}

type Assignment = 'me' | 'partner' | 'both'

interface FormData {
  title: string
  emoji: string
  description: string
  missionDate: string
  assignment: Assignment
}

export default function MissionsClient({
  userId,
  myProfile,
  partnerProfile,
  initialMissions,
  initialCompletions,
  loginStreak,
  codingStreak,
  partnerProgress,
  today,
}: Props) {
  const router = useRouter()
  const [missions, setMissions] = useState<Mission[]>(initialMissions)
  const [completions, setCompletions] = useState<Set<string>>(new Set(initialCompletions))
  const [showModal, setShowModal] = useState(false)
  const [editingMission, setEditingMission] = useState<Mission | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormData>({
    title: '',
    emoji: '🐍',
    description: '',
    missionDate: today,
    assignment: 'both',
  })
  const [formError, setFormError] = useState('')
  // Sync missions when fresh server data arrives
useEffect(() => {
  setMissions(initialMissions)
}, [initialMissions])

  const partnerName = partnerProfile?.username || partnerProfile?.email?.split('@')[0] || 'Partner'

  // Real-time synchronization
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('missions-realtime-page')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => router.refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mission_completions' }, () => router.refresh())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [router])

  function openAddModal() {
    setEditingMission(null)
    setForm({
      title: '',
      emoji: '🐍',
      description: '',
      missionDate: today,
      assignment: 'both',
    })
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(mission: Mission) {
    setEditingMission(mission)
    const assignment: Assignment =
      mission.assigned_to === null ? 'both' :
      mission.assigned_to === userId ? 'me' : 'partner'
    setForm({
      title: mission.title,
      emoji: mission.emoji,
      description: mission.description ?? '',
      missionDate: mission.mission_date,
      assignment,
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setFormError('Mission title is required.'); return }
    setSubmitting(true)
    setFormError('')

    const assignedTo =
      form.assignment === 'me' ? userId :
      form.assignment === 'partner' ? partnerProfile?.id ?? null : null

    const payload = {
      title: form.title.trim(),
      emoji: form.emoji,
      description: form.description.trim() || null,
      missionDate: form.missionDate,
      assignedTo,
    }

    try {
      if (editingMission) {
        const res = await fetch(`/api/missions/${editingMission.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) { const d = await res.json(); setFormError(d.error || 'Update failed'); setSubmitting(false); return }
      } else {
        const res = await fetch('/api/missions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) { const d = await res.json(); setFormError(d.error || 'Create failed'); setSubmitting(false); return }
      }

      setShowModal(false)
      router.refresh()
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(null)
    const res = await fetch(`/api/missions/${id}`, { method: 'DELETE' })
    if (res.ok) {
      router.refresh()
    }
  }

  async function toggleMission(missionId: string) {
    if (togglingId) return
    setTogglingId(missionId)

    try {
      const isCompleted = completions.has(missionId)
      const res = await fetch('/api/missions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId, completed: !isCompleted, date: today }),
      })

      if (res.ok) {
        const newSet = new Set(completions)
        if (!isCompleted) newSet.add(missionId)
        else newSet.delete(missionId)
        setCompletions(newSet)
      }
    } finally {
      setTogglingId(null)
    }
  }

  const pendingMissions = missions.filter(m => !completions.has(m.id))
  const completedMissions = missions.filter(m => completions.has(m.id))
  const totalCount = missions.length
  const completedCount = completedMissions.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header — Reference 2 Warm Orange Habit Experience */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FFFDF5] rounded-3xl p-6 border border-[#E2E7D5] shadow-theme-card">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#176B35]">
            {formatDate(today)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#202820] mt-0.5">
            Daily Missions
          </h1>
          <p className="text-xs text-[#687467] mt-0.5">
            Complete all your daily missions together to earn 10 XP!
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-primary self-start sm:self-auto gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Mission</span>
        </button>
      </div>

      {/* Top Streak & Partner Summary Cards — Reference 2 Inspired */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Login Streak Card with Fire Visual */}
        <div className="bg-[#FFFDF5] rounded-2xl p-4 border border-[#E2E7D5] shadow-theme-card flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F1F6E8] border border-[#E8F2DF] flex items-center justify-center flex-shrink-0">
            <Flame className="w-6 h-6 text-[#176B35] fill-[#176B35]" />
          </div>
          <div>
            <div className="text-xl font-black text-[#202820]">{loginStreak} Days</div>
            <div className="text-xs font-medium text-[#687467]">Login Streak 🔥</div>
          </div>
        </div>

        {/* Coding Streak Card */}
        <div className="bg-[#FFFDF5] rounded-2xl p-4 border border-[#E2E7D5] shadow-theme-card flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F2DF] border border-[#E8F2DF] flex items-center justify-center flex-shrink-0 text-[#176B35]">
            <span className="text-xl">💻</span>
          </div>
          <div>
            <div className="text-xl font-black text-[#202820]">{codingStreak} Days</div>
            <div className="text-xs font-medium text-[#687467]">Coding Streak ⚡</div>
          </div>
        </div>

        {/* Partner's Progress Summary */}
        {partnerProfile && (
          <div className="bg-[#FFFDF5] rounded-2xl p-4 border border-[#E2E7D5] shadow-theme-card flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-[#687467] flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#176B35]" />
                {partnerName}&apos;s Today
              </span>
              <span className="font-bold text-[#202820]">
                {partnerProgress.completed}/{partnerProgress.total}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: partnerProgress.total > 0
                    ? `${(partnerProgress.completed / partnerProgress.total) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Daily Completion Progress Card */}
      <div className="bg-[#FFFDF5] rounded-3xl p-6 border border-[#E2E7D5] shadow-theme-card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-[#202820]">Today&apos;s Progress</span>
          <span className="text-xs font-bold text-[#176B35] bg-[#F1F6E8] px-3 py-1 rounded-full border border-[#E8F2DF]">
            {completedCount} / {totalCount} completed ({pct}%)
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        {completedCount === totalCount && totalCount > 0 && (
          <div className="p-3 bg-[#E8F2DF] border border-[#75B77A]/30 rounded-2xl text-center text-[#176B35] text-xs font-bold animate-popIn flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#75B77A]" />
            <span>🎉 All assigned missions complete! +10 XP rewarded for today!</span>
          </div>
        )}
      </div>

      {/* Mission List: Pending and Completed sections */}
      <div className="space-y-5">
        {/* Pending Section */}
        {pendingMissions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#687467] flex items-center gap-2 px-1">
              <Clock className="w-3.5 h-3.5 text-[#176B35]" /> Pending Missions ({pendingMissions.length})
            </h2>
            <div className="space-y-2.5">
              {pendingMissions.map(m => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  completed={false}
                  toggling={togglingId === m.id}
                  userId={userId}
                  partnerName={partnerName}
                  onToggle={() => toggleMission(m.id)}
                  onEdit={() => openEditModal(m)}
                  onDelete={() => setDeletingId(m.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Section */}
        {completedMissions.length > 0 && (
          <div className="space-y-3 pt-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#687467] flex items-center gap-2 px-1">
              <Check className="w-3.5 h-3.5 text-[#75B77A]" /> Completed Missions ({completedMissions.length})
            </h2>
            <div className="space-y-2.5">
              {completedMissions.map(m => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  completed={true}
                  toggling={togglingId === m.id}
                  userId={userId}
                  partnerName={partnerName}
                  onToggle={() => toggleMission(m.id)}
                  onEdit={() => openEditModal(m)}
                  onDelete={() => setDeletingId(m.id)}
                />
              ))}
            </div>
          </div>
        )}

        {totalCount === 0 && (
          <div className="text-center py-12 bg-[#FFFDF5] rounded-3xl border border-[#E2E7D5] p-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-[#F1F6E8] flex items-center justify-center text-3xl mx-auto mb-3">
              📋
            </div>
            <p className="font-bold text-[#202820] text-base">No missions for today.</p>
            <p className="text-xs text-[#687467] mt-1">Click &quot;Add New Mission&quot; above to set your goals together!</p>
          </div>
        )}
      </div>

      {/* Add / Edit Mission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFDF5] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-theme-modal border border-[#E2E7D5] animate-popIn">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#E2E7D5]">
              <h2 className="text-lg font-bold text-[#202820]">
                {editingMission ? 'Edit Mission' : 'Add New Mission'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-[#F1F6E8] text-[#687467] hover:text-[#202820] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Emoji Picker */}
              <div>
                <label className="block text-xs font-bold text-[#202820] mb-2">Select Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, emoji }))}
                      className={`text-xl p-2 rounded-2xl transition-all ${
                        form.emoji === emoji
                          ? 'bg-[#E8F2DF] border-2 border-[#176B35] scale-110 shadow-sm'
                          : 'bg-[#FAF8EF] border border-[#E2E7D5] hover:bg-[#E8F2DF]/50'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#202820] mb-1.5">Mission Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Practise Python for 30 minutes"
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF8EF] border border-[#E2E7D5] text-[#202820] text-sm focus:outline-none focus:border-[#176B35] focus:ring-2 focus:ring-[#176B35]/15"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-[#202820] mb-1.5">Description (Optional)</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Additional details..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8EF] border border-[#E2E7D5] text-[#202820] text-sm focus:outline-none focus:border-[#176B35] focus:ring-2 focus:ring-[#176B35]/15 resize-none"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-bold text-[#202820] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#176B35]" />
                  <span>Mission Date</span>
                </label>
                <input
                  type="date"
                  value={form.missionDate}
                  onChange={e => setForm(f => ({ ...f, missionDate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8EF] border border-[#E2E7D5] text-[#202820] text-sm focus:outline-none focus:border-[#176B35] focus:ring-2 focus:ring-[#176B35]/15"
                />
              </div>

              {/* Assignment (Me, Partner, Both) */}
              <div>
                <label className="block text-xs font-bold text-[#202820] mb-2">Assignment</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['me', 'partner', 'both'] as const).map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, assignment: opt }))}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                        form.assignment === opt
                          ? 'border-[#176B35] bg-[#F1F6E8] text-[#176B35] shadow-sm'
                          : 'border-[#E2E7D5] bg-[#FAF8EF] text-[#687467] hover:border-[#C9D3BA]'
                      }`}
                    >
                      {opt === 'me' ? '👤 Me' : opt === 'partner' ? `🤝 ${partnerName}` : '👥 Both'}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-[#FFF0F0] border border-[#FFD3D3] rounded-2xl text-[#E03E3E] text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 btn-primary text-xs"
                >
                  {submitting ? 'Saving...' : editingMission ? 'Save Changes' : 'Create Mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FFFDF5] rounded-3xl p-6 max-w-sm w-full shadow-theme-modal border border-[#E2E7D5] animate-popIn">
            <h3 className="font-bold text-[#202820] text-base mb-2">Delete this mission?</h3>
            <p className="text-xs text-[#687467] mb-5">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeletingId(null)} className="flex-1 btn-secondary text-xs">
                Cancel
              </button>
              <button onClick={() => handleDelete(deletingId)} className="flex-1 btn-danger text-xs">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MissionCard({
  mission,
  completed,
  toggling,
  userId,
  partnerName,
  onToggle,
  onEdit,
  onDelete,
}: {
  mission: Mission
  completed: boolean
  toggling: boolean
  userId: string
  partnerName: string
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const isCreatedByMe = mission.created_by === userId
  const assignmentLabel =
    mission.assigned_to === null ? 'Both' :
    mission.assigned_to === userId ? 'Me' : partnerName

  return (
    <div
      className={`rounded-2xl border p-4 flex items-start gap-3.5 transition-all group ${
        completed
          ? 'bg-[#F6F5EA] border-[#E2E7D5] opacity-70'
          : 'bg-[#FFFDF5] border-[#E2E7D5] shadow-theme-card hover:border-[#176B35]/30 hover:shadow-theme-hover'
      }`}
    >
      {/* Animated Checkbox Button (Reference 2) */}
      <button
        onClick={onToggle}
        disabled={toggling}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${
          completed
            ? 'bg-[#75B77A] border-[#75B77A] text-white shadow-sm'
            : 'border-[#C9D3BA] hover:border-[#176B35]'
        }`}
      >
        {toggling ? (
          <div className="w-3 h-3 border-2 border-[#176B35] border-t-transparent rounded-full animate-spin" />
        ) : completed ? (
          <Check className="w-4 h-4 stroke-[3]" />
        ) : null}
      </button>

      {/* Emoji */}
      <span className="text-2xl flex-shrink-0">{mission.emoji}</span>

      {/* Content */}
      <div className="flex-1 min-w-0" onClick={onToggle} role="button">
        <div className={`font-bold text-sm ${completed ? 'line-through text-[#687467]' : 'text-[#202820]'}`}>
          {mission.title}
        </div>
        {mission.description && (
          <div className="text-xs text-[#687467] mt-0.5 truncate">{mission.description}</div>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#9AA690]">
          <span className="bg-[#FAF8EF] border border-[#E2E7D5] px-2 py-0.5 rounded-md font-semibold text-[#687467]">
            Assigned: {assignmentLabel}
          </span>
          <span>By: {isCreatedByMe ? 'Me' : partnerName}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-xl hover:bg-[#F1F6E8] text-[#687467] hover:text-[#202820] transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-xl hover:bg-[#FFF0F0] text-[#687467] hover:text-[#E03E3E] transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

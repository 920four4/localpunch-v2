'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { UserRole } from '@/lib/types'

const roles = [
  {
    id: 'customer' as UserRole,
    label: 'Customer',
    icon: '🛍️',
    description: 'Collect punches and earn free rewards at local businesses',
  },
  {
    id: 'merchant' as UserRole,
    label: 'Business Owner',
    icon: '🏪',
    description: 'Create loyalty programs and reward your customers',
  },
]

export default function OnboardPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRole || !displayName.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      role: selectedRole,
      display_name: displayName.trim(),
    })

    setLoading(false)
    if (error) {
      toast.error('Could not save profile. Try again.')
    } else {
      router.push(selectedRole === 'merchant' ? '/merchant' : '/')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFE566] border-2 border-[#1a1a1a] rounded-xl mb-4" style={{ boxShadow: '3px 3px 0 #1a1a1a' }}>
            <span className="text-2xl">👋</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space-grotesk)' }}>Welcome to LocalPunch</h1>
          <p className="text-sm text-[#6B7280] mt-1">Let's set up your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="nb-card-flat p-5">
            <label className="block text-sm font-medium mb-2">Your name</label>
            <input
              type="text"
              required
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full border-2 border-[#1a1a1a] rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FFE566]"
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-3">I am a…</p>
            <div className="space-y-3">
              {roles.map(role => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`w-full text-left nb-card p-4 transition-all ${
                    selectedRole === role.id
                      ? 'bg-[#FFE566] border-[#1a1a1a]'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{role.icon}</span>
                    <div>
                      <div className="font-semibold text-sm" style={{ fontFamily: 'var(--font-space-grotesk)' }}>{role.label}</div>
                      <div className="text-xs text-[#6B7280]">{role.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedRole || !displayName.trim() || loading}
            className="nb-btn-dark w-full font-semibold py-3 disabled:opacity-40"
          >
            {loading ? 'Setting up…' : 'Get started →'}
          </button>
        </form>
      </div>
    </div>
  )
}
